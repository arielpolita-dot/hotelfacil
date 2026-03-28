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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateId } from '../../utils/validators';

export async function getQuartos(empresaId) {
  validateId(empresaId, 'empresaId');
  const snap = await getDocs(
    query(collection(db, 'empresas', empresaId, 'quartos'), orderBy('numero'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function onQuartos(empresaId, callback) {
  validateId(empresaId, 'empresaId');
  return onSnapshot(
    query(collection(db, 'empresas', empresaId, 'quartos'), orderBy('numero')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function addQuarto(empresaId, dados) {
  validateId(empresaId, 'empresaId');
  const ref = await addDoc(collection(db, 'empresas', empresaId, 'quartos'), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp()
  });
  return ref.id;
}

export async function updateQuarto(empresaId, quartoId, dados) {
  validateId(empresaId, 'empresaId');
  await updateDoc(doc(db, 'empresas', empresaId, 'quartos', quartoId), {
    ...dados,
    atualizadoEm: serverTimestamp()
  });
}

export async function deleteQuarto(empresaId, quartoId) {
  validateId(empresaId, 'empresaId');
  await deleteDoc(doc(db, 'empresas', empresaId, 'quartos', quartoId));
}
