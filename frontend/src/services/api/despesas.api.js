import { api } from './client';

export async function getDespesas(empresaId) {
  const { data: response } = await api.get(`/empresas/${empresaId}/despesas`);
  const data = response.data || response;
  return data;
}

export function onDespesas(empresaId, callback) {
  getDespesas(empresaId).then(callback).catch(console.error);
  return () => {};
}

export async function addDespesa(empresaId, dados) {
  const { data } = await api.post(`/empresas/${empresaId}/despesas`, dados);
  return data.id;
}

export async function updateDespesa(empresaId, despesaId, dados) {
  await api.put(`/empresas/${empresaId}/despesas/${despesaId}`, dados);
}

export async function deleteDespesa(empresaId, despesaId) {
  await api.delete(`/empresas/${empresaId}/despesas/${despesaId}`);
}
