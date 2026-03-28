import { api } from './client';

export async function getReservas(empresaId) {
  const { data } = await api.get(`/empresas/${empresaId}/reservas`);
  return data;
}

export function onReservas(empresaId, callback) {
  getReservas(empresaId).then(callback).catch(console.error);
  return () => {};
}

export async function addReserva(empresaId, dados) {
  const { data } = await api.post(`/empresas/${empresaId}/reservas`, dados);
  return data.id;
}

export async function updateReserva(empresaId, reservaId, dados) {
  await api.put(
    `/empresas/${empresaId}/reservas/${reservaId}`,
    dados,
  );
}

export async function checkoutReserva(empresaId, reservaId, quartoId) {
  await api.patch(
    `/empresas/${empresaId}/reservas/${reservaId}/checkout`,
    { quartoId },
  );
}

export async function cancelarReserva(empresaId, reservaId, quartoId) {
  await api.patch(
    `/empresas/${empresaId}/reservas/${reservaId}/cancel`,
    { quartoId },
  );
}
