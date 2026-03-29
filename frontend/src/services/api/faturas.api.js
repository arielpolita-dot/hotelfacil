import { api } from './client';

export function onFaturas(empresaId, callback) {
  api.get(`/empresas/${empresaId}/faturas`)
    .then(({ data: response }) => callback(response.data || response))
    .catch(console.error);
  return () => {};
}

export async function addFatura(empresaId, dados) {
  const { data } = await api.post(`/empresas/${empresaId}/faturas`, dados);
  return data.id;
}

export async function updateFatura(empresaId, faturaId, dados) {
  await api.put(`/empresas/${empresaId}/faturas/${faturaId}`, dados);
}

export async function deleteFatura(empresaId, faturaId) {
  await api.delete(`/empresas/${empresaId}/faturas/${faturaId}`);
}
