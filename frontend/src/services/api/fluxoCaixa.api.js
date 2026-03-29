import { api } from './client';

export async function getFluxoCaixa(empresaId) {
  const { data: response } = await api.get(`/empresas/${empresaId}/fluxo-caixa`);
  const data = response.data || response;
  return data;
}

export function onFluxoCaixa(empresaId, callback) {
  getFluxoCaixa(empresaId).then(callback).catch(console.error);
  return () => {};
}

export async function addFluxoCaixa(empresaId, dados) {
  const { data } = await api.post(
    `/empresas/${empresaId}/fluxo-caixa`,
    dados,
  );
  return data.id;
}
