import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../config/firebase';

// ─── QUARTOS ────────────────────────────────────────────────────────────────

export async function getQuartos(empresaId) {
  const snap = await getDocs(
    query(collection(db, 'empresas', empresaId, 'quartos'), orderBy('numero'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function onQuartos(empresaId, callback) {
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'quartos'), orderBy('numero')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function addQuarto(empresaId, dados) {
  const ref = await addDoc(collection(db, 'empresas', empresaId, 'quartos'), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp()
  });
  return ref.id;
}

export async function updateQuarto(empresaId, quartoId, dados) {
  await updateDoc(doc(db, 'empresas', empresaId, 'quartos', quartoId), {
    ...dados,
    atualizadoEm: serverTimestamp()
  });
}

export async function deleteQuarto(empresaId, quartoId) {
  await deleteDoc(doc(db, 'empresas', empresaId, 'quartos', quartoId));
}

// ─── RESERVAS ───────────────────────────────────────────────────────────────

export async function getReservas(empresaId) {
  const snap = await getDocs(
    query(collection(db, 'empresas', empresaId, 'reservas'), orderBy('criadoEm', 'desc'))
  );
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      dataCheckIn: data.dataCheckIn?.toDate ? data.dataCheckIn.toDate() : new Date(data.dataCheckIn),
      dataCheckOut: data.dataCheckOut?.toDate ? data.dataCheckOut.toDate() : new Date(data.dataCheckOut),
      criadoEm: data.criadoEm?.toDate ? data.criadoEm.toDate() : new Date()
    };
  });
}

export function onReservas(empresaId, callback) {
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'reservas'), orderBy('criadoEm', 'desc')),
    snap => callback(snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        dataCheckIn: data.dataCheckIn?.toDate ? data.dataCheckIn.toDate() : new Date(data.dataCheckIn),
        dataCheckOut: data.dataCheckOut?.toDate ? data.dataCheckOut.toDate() : new Date(data.dataCheckOut),
        criadoEm: data.criadoEm?.toDate ? data.criadoEm.toDate() : new Date()
      };
    }))
  );
}

export async function addReserva(empresaId, dados) {
  const batch = writeBatch(db);

  // Converter datas com segurança
  const toSafeTimestamp = (v) => {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? null : Timestamp.fromDate(d);
  };

  const reservaRef = doc(collection(db, 'empresas', empresaId, 'reservas'));
  const reservaData = {
    ...dados,
    status: dados.status || 'confirmada',
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  };
  // Só converte datas se forem válidas
  const tsIn = toSafeTimestamp(dados.dataCheckIn);
  const tsOut = toSafeTimestamp(dados.dataCheckOut);
  if (tsIn) reservaData.dataCheckIn = tsIn;
  if (tsOut) reservaData.dataCheckOut = tsOut;

  batch.set(reservaRef, reservaData);

  // Atualizar status do quarto (só se quartoId for válido)
  if (dados.quartoId) {
    const quartoRef = doc(db, 'empresas', empresaId, 'quartos', dados.quartoId);
    batch.update(quartoRef, { status: 'ocupado', atualizadoEm: serverTimestamp() });
  }

  // Criar lançamento no fluxo de caixa
  const fcRef = doc(collection(db, 'empresas', empresaId, 'fluxoCaixa'));
  const fcData = {
    tipo: 'entrada',
    categoria: 'Hospedagem',
    descricao: `Hospedagem - ${dados.nomeHospede || dados.hospede?.nome || 'Hóspede'} (Quarto ${dados.numeroQuarto || dados.quartoNumero || dados.quartoId || '—'})`,
    valor: parseFloat(dados.valorTotal) || 0,
    reservaId: reservaRef.id,
    criadoEm: serverTimestamp(),
  };
  if (tsIn) fcData.data = tsIn;
  else fcData.data = Timestamp.fromDate(new Date());
  batch.set(fcRef, fcData);

  await batch.commit();
  return reservaRef.id;
}

export async function updateReserva(empresaId, reservaId, dados) {
  await updateDoc(doc(db, 'empresas', empresaId, 'reservas', reservaId), {
    ...dados,
    atualizadoEm: serverTimestamp()
  });
}

export async function checkoutReserva(empresaId, reservaId, quartoId) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'empresas', empresaId, 'reservas', reservaId), {
    status: 'concluida',
    atualizadoEm: serverTimestamp()
  });
  batch.update(doc(db, 'empresas', empresaId, 'quartos', quartoId), {
    status: 'limpeza',
    atualizadoEm: serverTimestamp()
  });
  await batch.commit();
}

export async function cancelarReserva(empresaId, reservaId, quartoId) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'empresas', empresaId, 'reservas', reservaId), {
    status: 'cancelada',
    atualizadoEm: serverTimestamp()
  });
  batch.update(doc(db, 'empresas', empresaId, 'quartos', quartoId), {
    status: 'disponivel',
    atualizadoEm: serverTimestamp()
  });
  await batch.commit();
}

// ─── DESPESAS ───────────────────────────────────────────────────────────────

export async function getDespesas(empresaId) {
  const snap = await getDocs(
    query(collection(db, 'empresas', empresaId, 'despesas'), orderBy('data', 'desc'))
  );
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      data: data.data?.toDate ? data.data.toDate() : new Date(data.data)
    };
  });
}

export function onDespesas(empresaId, callback) {
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'despesas'), orderBy('data', 'desc')),
    snap => callback(snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        data: data.data?.toDate ? data.data.toDate() : new Date(data.data)
      };
    }))
  );
}

export async function addDespesa(empresaId, dados) {
  const batch = writeBatch(db);

  const despesaRef = doc(collection(db, 'empresas', empresaId, 'despesas'));
  batch.set(despesaRef, {
    ...dados,
    data: Timestamp.fromDate(new Date(dados.data)),
    criadoEm: serverTimestamp()
  });

  // Criar lançamento no fluxo de caixa
  const fcRef = doc(collection(db, 'empresas', empresaId, 'fluxoCaixa'));
  batch.set(fcRef, {
    tipo: 'saida',
    categoria: dados.categoria,
    descricao: dados.descricao,
    valor: dados.valor,
    data: Timestamp.fromDate(new Date(dados.data)),
    despesaId: despesaRef.id,
    criadoEm: serverTimestamp()
  });

  await batch.commit();
  return despesaRef.id;
}

export async function updateDespesa(empresaId, despesaId, dados) {
  await updateDoc(doc(db, 'empresas', empresaId, 'despesas', despesaId), {
    ...dados,
    data: dados.data ? Timestamp.fromDate(new Date(dados.data)) : undefined,
    atualizadoEm: serverTimestamp()
  });
}

export async function deleteDespesa(empresaId, despesaId) {
  await deleteDoc(doc(db, 'empresas', empresaId, 'despesas', despesaId));
}

// ─── FLUXO DE CAIXA ─────────────────────────────────────────────────────────

export function onFluxoCaixa(empresaId, callback) {
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'fluxoCaixa'), orderBy('data', 'desc')),
    snap => callback(snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        data: data.data?.toDate ? data.data.toDate() : new Date(data.data)
      };
    }))
  );
}

export async function addFluxoCaixa(empresaId, dados) {
  const ref = await addDoc(collection(db, 'empresas', empresaId, 'fluxoCaixa'), {
    ...dados,
    data: dados.data ? Timestamp.fromDate(new Date(dados.data)) : serverTimestamp(),
    criadoEm: serverTimestamp()
  });
  return ref.id;
}

export async function getFluxoCaixa(empresaId) {
  const snap = await getDocs(
    query(collection(db, 'empresas', empresaId, 'fluxoCaixa'), orderBy('data', 'desc'))
  );
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      data: data.data?.toDate ? data.data.toDate() : new Date(data.data)
    };
  });
}

// ─── FATURAS ────────────────────────────────────────────────────────────────

export function onFaturas(empresaId, callback) {
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'faturas'), orderBy('criadoEm', 'desc')),
    snap => callback(snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        dataInicio: data.dataInicio?.toDate ? data.dataInicio.toDate() : new Date(data.dataInicio),
        dataFim: data.dataFim?.toDate ? data.dataFim.toDate() : new Date(data.dataFim),
        proximoVencimento: data.proximoVencimento?.toDate ? data.proximoVencimento.toDate() : (data.proximoVencimento ? new Date(data.proximoVencimento) : null)
      };
    }))
  );
}

export async function addFatura(empresaId, dados) {
  const ref = await addDoc(collection(db, 'empresas', empresaId, 'faturas'), {
    ...dados,
    dataInicio: Timestamp.fromDate(new Date(dados.dataInicio)),
    dataFim: Timestamp.fromDate(new Date(dados.dataFim)),
    proximoVencimento: dados.proximoVencimento ? Timestamp.fromDate(new Date(dados.proximoVencimento)) : null,
    status: 'ativo',
    criadoEm: serverTimestamp()
  });
  return ref.id;
}

export async function updateFatura(empresaId, faturaId, dados) {
  const updateData = { ...dados, atualizadoEm: serverTimestamp() };
  if (dados.dataInicio) updateData.dataInicio = Timestamp.fromDate(new Date(dados.dataInicio));
  if (dados.dataFim) updateData.dataFim = Timestamp.fromDate(new Date(dados.dataFim));
  if (dados.proximoVencimento) updateData.proximoVencimento = Timestamp.fromDate(new Date(dados.proximoVencimento));
  await updateDoc(doc(db, 'empresas', empresaId, 'faturas', faturaId), updateData);
}

export async function deleteFatura(empresaId, faturaId) {
  await deleteDoc(doc(db, 'empresas', empresaId, 'faturas', faturaId));
}

// ─── USUÁRIOS ───────────────────────────────────────────────────────────────

export async function getUsuarios(empresaId) {
  const snap = await getDocs(
    query(collection(db, 'empresas', empresaId, 'usuarios'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function onUsuarios(empresaId, callback) {
  return onSnapshot(
    collection(db, 'empresas', empresaId, 'usuarios'),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function addUsuario(empresaId, dados) {
  // Criar usuário no Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
  const uid = userCredential.user.uid;

  // Salvar dados no Firestore
  await addDoc(collection(db, 'empresas', empresaId, 'usuarios'), {
    uid,
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone || '',
    role: dados.role,
    status: dados.status || 'Ativo',
    permissoes: dados.permissoes || {},
    observacoes: dados.observacoes || '',
    criadoEm: serverTimestamp()
  });

  // Também salvar na coleção global de usuários
  await addDoc(collection(db, 'usuarios'), {
    uid,
    nome: dados.nome,
    email: dados.email,
    empresaId,
    role: dados.role,
    criadoEm: serverTimestamp()
  });

  return uid;
}

export async function updateUsuario(empresaId, usuarioId, dados) {
  const { senha, confirmarSenha, ...dadosSemSenha } = dados;
  await updateDoc(doc(db, 'empresas', empresaId, 'usuarios', usuarioId), {
    ...dadosSemSenha,
    atualizadoEm: serverTimestamp()
  });
}

export async function deleteUsuario(empresaId, usuarioId) {
  await deleteDoc(doc(db, 'empresas', empresaId, 'usuarios', usuarioId));
}

// ─── EMPRESA ────────────────────────────────────────────────────────────────

export async function getEmpresa(empresaId) {
  const snap = await getDoc(doc(db, 'empresas', empresaId));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

export async function updateEmpresa(empresaId, dados) {
  await updateDoc(doc(db, 'empresas', empresaId), {
    ...dados,
    atualizadoEm: serverTimestamp()
  });
}

// ─── SEED DE DADOS INICIAIS ─────────────────────────────────────────────────

export async function seedDadosIniciais(empresaId) {
  const quartosExistentes = await getQuartos(empresaId);
  if (quartosExistentes.length > 0) return; // Já tem dados

  const batch = writeBatch(db);

  const quartosIniciais = [
    { numero: '101', tipo: 'standard', preco: 150, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '102', tipo: 'standard', preco: 150, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '103', tipo: 'standard', preco: 150, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '104', tipo: 'standard', preco: 150, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '105', tipo: 'standard', preco: 150, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '201', tipo: 'deluxe', preco: 250, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda'] },
    { numero: '202', tipo: 'deluxe', preco: 250, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda'] },
    { numero: '203', tipo: 'deluxe', preco: 250, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda'] },
    { numero: '204', tipo: 'deluxe', preco: 250, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda'] },
    { numero: '301', tipo: 'suite', preco: 400, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda', 'Banheira'] },
    { numero: '302', tipo: 'suite', preco: 400, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda', 'Banheira'] },
    { numero: '401', tipo: 'triplo', preco: 300, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '402', tipo: 'triplo', preco: 300, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
  ];

  quartosIniciais.forEach(q => {
    const ref = doc(collection(db, 'empresas', empresaId, 'quartos'));
    batch.set(ref, { ...q, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() });
  });

  await batch.commit();
}

// ─── FORNECEDORES ────────────────────────────────────────────────────────────
export function onFornecedores(empresaId, callback) {
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'fornecedores'), orderBy('nome')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function addFornecedor(empresaId, dados) {
  return addDoc(collection(db, 'empresas', empresaId, 'fornecedores'), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

export async function updateFornecedor(empresaId, fornecedorId, dados) {
  await updateDoc(doc(db, 'empresas', empresaId, 'fornecedores', fornecedorId), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

export async function deleteFornecedor(empresaId, fornecedorId) {
  await deleteDoc(doc(db, 'empresas', empresaId, 'fornecedores', fornecedorId));
}

// ─── BANCOS ──────────────────────────────────────────────────────────────────
export function onBancos(empresaId, callback) {
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'bancos'), orderBy('nome')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function addBanco(empresaId, dados) {
  return addDoc(collection(db, 'empresas', empresaId, 'bancos'), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

export async function updateBanco(empresaId, bancoId, dados) {
  await updateDoc(doc(db, 'empresas', empresaId, 'bancos', bancoId), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

export async function deleteBanco(empresaId, bancoId) {
  await deleteDoc(doc(db, 'empresas', empresaId, 'bancos', bancoId));
}

export async function seedBancosIniciais(empresaId) {
  const snap = await getDocs(collection(db, 'empresas', empresaId, 'bancos'));
  if (!snap.empty) return;
  const bancosIniciais = [
    { nome: 'Banco do Brasil', codigo: '001', agencia: '', conta: '' },
    { nome: 'Bradesco', codigo: '237', agencia: '', conta: '' },
    { nome: 'Caixa Econômica Federal', codigo: '104', agencia: '', conta: '' },
    { nome: 'Itaú', codigo: '341', agencia: '', conta: '' },
    { nome: 'Santander', codigo: '033', agencia: '', conta: '' },
    { nome: 'Nubank', codigo: '260', agencia: '', conta: '' },
    { nome: 'Inter', codigo: '077', agencia: '', conta: '' },
    { nome: 'Sicoob', codigo: '756', agencia: '', conta: '' },
    { nome: 'Dinheiro em Caixa', codigo: '', agencia: '', conta: '' },
  ];
  const batch = writeBatch(db);
  bancosIniciais.forEach(b => {
    const ref = doc(collection(db, 'empresas', empresaId, 'bancos'));
    batch.set(ref, { ...b, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() });
  });
  await batch.commit();
}
