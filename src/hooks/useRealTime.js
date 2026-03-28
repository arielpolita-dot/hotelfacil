import { useEffect } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useRealTime(empresaId, onEvent) {
  useEffect(() => {
    if (!empresaId || import.meta.env.VITE_USE_API !== 'true') return;

    const socket = io(API_URL, {
      auth: { empresaId },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join-empresa', empresaId);
    });

    const events = [
      'quartos:changed',
      'reservas:changed',
      'despesas:changed',
      'fluxoCaixa:changed',
      'faturas:changed',
      'usuarios:changed',
      'fornecedores:changed',
      'bancos:changed',
    ];

    events.forEach(event => {
      socket.on(event, (data) => onEvent(event, data));
    });

    return () => socket.disconnect();
  }, [empresaId, onEvent]);
}
