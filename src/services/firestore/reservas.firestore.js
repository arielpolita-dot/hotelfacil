import {
  collection,
  doc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateId } from '../../utils/validators';

export async function getReservas(empresaId) {
  validateId(empresaId, 'empresaId');
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
  validateId(empresaId, 'empresaId');
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
  validateId(empresaId, 'empresaId');
  const batch = writeBatch(db);

  // Converter datas com seguranca
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
  // So converte datas se forem validas
  const tsIn = toSafeTimestamp(dados.dataCheckIn);
  const tsOut = toSafeTimestamp(dados.dataCheckOut);
  if (tsIn) reservaData.dataCheckIn = tsIn;
  if (tsOut) reservaData.dataCheckOut = tsOut;

  batch.set(reservaRef, reservaData);

  // Atualizar status do quarto (so se quartoId for valido)
  if (dados.quartoId) {
    const quartoRef = doc(db, 'empresas', empresaId, 'quartos', dados.quartoId);
    batch.update(quartoRef, { status: 'ocupado', atualizadoEm: serverTimestamp() });
  }

  // Criar lancamento no fluxo de caixa
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
  validateId(empresaId, 'empresaId');
  await updateDoc(doc(db, 'empresas', empresaId, 'reservas', reservaId), {
    ...dados,
    atualizadoEm: serverTimestamp()
  });
}

export async function checkoutReserva(empresaId, reservaId, quartoId) {
  validateId(empresaId, 'empresaId');
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
  validateId(empresaId, 'empresaId');
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
