import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateId } from '../../utils/validators';

export async function getUsuarios(empresaId) {
  validateId(empresaId, 'empresaId');
  const snap = await getDocs(
    collection(db, 'empresas', empresaId, 'usuarios')
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function onUsuarios(empresaId, callback) {
  validateId(empresaId, 'empresaId');
  return onSnapshot(
    collection(db, 'empresas', empresaId, 'usuarios'),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function addUsuario(empresaId, dados) {
  validateId(empresaId, 'empresaId');

  // Save user data in Firestore (user creation now handled by Authify/backend)
  const docRef = await addDoc(collection(db, 'empresas', empresaId, 'usuarios'), {
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone || '',
    role: dados.role,
    status: dados.status || 'Ativo',
    permissoes: dados.permissoes || {},
    observacoes: dados.observacoes || '',
    criadoEm: serverTimestamp()
  });

  return docRef.id;
}

export async function updateUsuario(empresaId, usuarioId, dados) {
  validateId(empresaId, 'empresaId');
  const { senha, confirmarSenha, ...dadosSemSenha } = dados;
  await updateDoc(doc(db, 'empresas', empresaId, 'usuarios', usuarioId), {
    ...dadosSemSenha,
    atualizadoEm: serverTimestamp()
  });
}

export async function deleteUsuario(empresaId, usuarioId) {
  validateId(empresaId, 'empresaId');
  await deleteDoc(doc(db, 'empresas', empresaId, 'usuarios', usuarioId));
}
