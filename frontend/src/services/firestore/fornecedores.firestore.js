import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateId } from '../../utils/validators';

export function onFornecedores(empresaId, callback) {
  validateId(empresaId, 'empresaId');
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'fornecedores'), orderBy('nome')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function addFornecedor(empresaId, dados) {
  validateId(empresaId, 'empresaId');
  return addDoc(collection(db, 'empresas', empresaId, 'fornecedores'), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

export async function updateFornecedor(empresaId, fornecedorId, dados) {
  validateId(empresaId, 'empresaId');
  await updateDoc(doc(db, 'empresas', empresaId, 'fornecedores', fornecedorId), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

export async function deleteFornecedor(empresaId, fornecedorId) {
  validateId(empresaId, 'empresaId');
  await deleteDoc(doc(db, 'empresas', empresaId, 'fornecedores', fornecedorId));
}
