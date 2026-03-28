import { api } from './client';

export async function getEmpresa(empresaId) {
  const { data } = await api.get(`/empresas/${empresaId}`);
  return data;
}

export async function updateEmpresa(empresaId, dados) {
  await api.put(`/empresas/${empresaId}`, dados);
}
