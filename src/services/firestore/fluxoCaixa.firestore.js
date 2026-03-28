import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateId } from '../../utils/validators';

export function onFluxoCaixa(empresaId, callback) {
  validateId(empresaId, 'empresaId');
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
  validateId(empresaId, 'empresaId');
  const ref = await addDoc(collection(db, 'empresas', empresaId, 'fluxoCaixa'), {
    ...dados,
    data: dados.data ? Timestamp.fromDate(new Date(dados.data)) : serverTimestamp(),
    criadoEm: serverTimestamp()
  });
  return ref.id;
}

export async function getFluxoCaixa(empresaId) {
  validateId(empresaId, 'empresaId');
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
