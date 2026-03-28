import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateId } from '../../utils/validators';

export async function getDespesas(empresaId) {
  validateId(empresaId, 'empresaId');
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
  validateId(empresaId, 'empresaId');
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'despesas'), orderBy('data', 'desc'), limit(500)),
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
  validateId(empresaId, 'empresaId');
  const batch = writeBatch(db);

  const despesaRef = doc(collection(db, 'empresas', empresaId, 'despesas'));
  batch.set(despesaRef, {
    ...dados,
    data: Timestamp.fromDate(new Date(dados.data)),
    criadoEm: serverTimestamp()
  });

  // Criar lancamento no fluxo de caixa
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
  validateId(empresaId, 'empresaId');
  await updateDoc(doc(db, 'empresas', empresaId, 'despesas', despesaId), {
    ...dados,
    data: dados.data ? Timestamp.fromDate(new Date(dados.data)) : undefined,
    atualizadoEm: serverTimestamp()
  });
}

export async function deleteDespesa(empresaId, despesaId) {
  validateId(empresaId, 'empresaId');
  await deleteDoc(doc(db, 'empresas', empresaId, 'despesas', despesaId));
}
