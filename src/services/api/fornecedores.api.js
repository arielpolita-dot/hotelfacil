import { api } from './client';

export function onFornecedores(empresaId, callback) {
  api.get(`/empresas/${empresaId}/fornecedores`)
    .then(({ data }) => callback(data))
    .catch(console.error);
  return () => {};
}

export async function addFornecedor(empresaId, dados) {
  const { data } = await api.post(
    `/empresas/${empresaId}/fornecedores`,
    dados,
  );
  return data.id;
}

export async function updateFornecedor(empresaId, fornecedorId, dados) {
  await api.put(
    `/empresas/${empresaId}/fornecedores/${fornecedorId}`,
    dados,
  );
}

export async function deleteFornecedor(empresaId, fornecedorId) {
  await api.delete(
    `/empresas/${empresaId}/fornecedores/${fornecedorId}`,
  );
}
