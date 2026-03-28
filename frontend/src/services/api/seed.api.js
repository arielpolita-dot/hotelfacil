import { api } from './client';

export async function seedDadosIniciais(empresaId) {
  await api.post(`/empresas/${empresaId}/seed`);
}
