import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateId } from '../../utils/validators';

export async function getEmpresa(empresaId) {
  validateId(empresaId, 'empresaId');
  const snap = await getDoc(doc(db, 'empresas', empresaId));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

export async function updateEmpresa(empresaId, dados) {
  validateId(empresaId, 'empresaId');
  await updateDoc(doc(db, 'empresas', empresaId), {
    ...dados,
    atualizadoEm: serverTimestamp()
  });
}
