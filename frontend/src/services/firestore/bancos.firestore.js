import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateId } from '../../utils/validators';

export function onBancos(empresaId, callback) {
  validateId(empresaId, 'empresaId');
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'bancos'), orderBy('nome')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function addBanco(empresaId, dados) {
  validateId(empresaId, 'empresaId');
  return addDoc(collection(db, 'empresas', empresaId, 'bancos'), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

export async function updateBanco(empresaId, bancoId, dados) {
  validateId(empresaId, 'empresaId');
  await updateDoc(doc(db, 'empresas', empresaId, 'bancos', bancoId), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

export async function deleteBanco(empresaId, bancoId) {
  validateId(empresaId, 'empresaId');
  await deleteDoc(doc(db, 'empresas', empresaId, 'bancos', bancoId));
}

export async function seedBancosIniciais(empresaId) {
  validateId(empresaId, 'empresaId');
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
