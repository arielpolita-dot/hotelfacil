import { api } from './client';

export async function getUsuarios(empresaId) {
  const { data } = await api.get(`/empresas/${empresaId}/usuarios`);
  return data;
}

export function onUsuarios(empresaId, callback) {
  getUsuarios(empresaId).then(callback).catch(console.error);
  return () => {};
}

export async function addUsuario(empresaId, dados) {
  const { data } = await api.post(`/empresas/${empresaId}/usuarios`, dados);
  return data.id;
}

export async function updateUsuario(empresaId, usuarioId, dados) {
  await api.put(`/empresas/${empresaId}/usuarios/${usuarioId}`, dados);
}

export async function deleteUsuario(empresaId, usuarioId) {
  await api.delete(`/empresas/${empresaId}/usuarios/${usuarioId}`);
}
