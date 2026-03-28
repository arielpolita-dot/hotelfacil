import { api } from './client';

export async function getQuartos(empresaId) {
  const { data } = await api.get(`/empresas/${empresaId}/quartos`);
  return data;
}

export function onQuartos(empresaId, callback) {
  getQuartos(empresaId).then(callback).catch(console.error);
  return () => {};
}

export async function addQuarto(empresaId, dados) {
  const { data } = await api.post(`/empresas/${empresaId}/quartos`, dados);
  return data.id;
}

export async function updateQuarto(empresaId, quartoId, dados) {
  await api.put(`/empresas/${empresaId}/quartos/${quartoId}`, dados);
}

export async function deleteQuarto(empresaId, quartoId) {
  await api.delete(`/empresas/${empresaId}/quartos/${quartoId}`);
}
