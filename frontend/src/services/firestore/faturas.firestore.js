import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateId } from '../../utils/validators';

export function onFaturas(empresaId, callback) {
  validateId(empresaId, 'empresaId');
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'faturas'), orderBy('criadoEm', 'desc'), limit(200)),
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
  validateId(empresaId, 'empresaId');
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
  validateId(empresaId, 'empresaId');
  const updateData = { ...dados, atualizadoEm: serverTimestamp() };
  if (dados.dataInicio) updateData.dataInicio = Timestamp.fromDate(new Date(dados.dataInicio));
  if (dados.dataFim) updateData.dataFim = Timestamp.fromDate(new Date(dados.dataFim));
  if (dados.proximoVencimento) updateData.proximoVencimento = Timestamp.fromDate(new Date(dados.proximoVencimento));
  await updateDoc(doc(db, 'empresas', empresaId, 'faturas', faturaId), updateData);
}

export async function deleteFatura(empresaId, faturaId) {
  validateId(empresaId, 'empresaId');
  await deleteDoc(doc(db, 'empresas', empresaId, 'faturas', faturaId));
}
