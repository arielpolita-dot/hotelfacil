import { api } from './client';

export function onBancos(empresaId, callback) {
  api.get(`/empresas/${empresaId}/bancos`)
    .then(({ data }) => callback(data))
    .catch(console.error);
  return () => {};
}

export async function addBanco(empresaId, dados) {
  const { data } = await api.post(`/empresas/${empresaId}/bancos`, dados);
  return data.id;
}

export async function updateBanco(empresaId, bancoId, dados) {
  await api.put(`/empresas/${empresaId}/bancos/${bancoId}`, dados);
}

export async function deleteBanco(empresaId, bancoId) {
  await api.delete(`/empresas/${empresaId}/bancos/${bancoId}`);
}

export async function seedBancosIniciais(empresaId) {
  await api.post(`/empresas/${empresaId}/bancos/seed`);
}
