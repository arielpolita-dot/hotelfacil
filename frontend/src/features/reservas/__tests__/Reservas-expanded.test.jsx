import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../context/HotelContext', () => ({
  useHotel: () => ({
    quartos: [
      { id: 'q1', numero: 101, status: 'disponivel', precoDiaria: 200 },
    ],
    reservas: [
      {
        id: 'r1', nomeHospede: 'Joao Silva', quartoId: 'q1', numeroQuarto: '101',
        status: 'ativa', dataCheckIn: '2026-03-01', dataCheckOut: '2026-03-05',
        valorTotal: 800, criadoEm: '2026-03-01T10:00:00',
      },
      {
        id: 'r2', nomeHospede: 'Maria Santos', quartoId: 'q1', numeroQuarto: '101',
        status: 'checkout', dataCheckIn: '2026-02-20', dataCheckOut: '2026-02-25',
        valorTotal: 1000, criadoEm: '2026-02-20T10:00:00',
      },
      {
        id: 'r3', hospede: { nome: 'Pedro' }, quartoNumero: '202',
        status: 'cancelada', dataCheckIn: '2026-02-10', dataCheckOut: '2026-02-12',
        valorTotal: 400, criadoEm: '2026-02-10T10:00:00',
      },
    ],
    bancos: [{ id: 'b1', nome: 'Itau' }],
    adicionarReserva: vi.fn().mockResolvedValue('r-new'),
    atualizarReserva: vi.fn().mockResolvedValue(),
    adicionarFatura: vi.fn().mockResolvedValue('ft-new'),
    adicionarBanco: vi.fn().mockResolvedValue({ id: 'b-new' }),
    atualizarBanco: vi.fn().mockResolvedValue(),
    removerBanco: vi.fn().mockResolvedValue(),
    loading: false,
  }),
}));

vi.mock('../../../context/EmpresaContext', () => ({
  useEmpresa: () => ({
    empresaAtual: { id: 'e1', nome: 'Hotel Test' },
  }),
}));

vi.mock('../../../context/TrialContext', () => ({
  useTrial: () => ({ trialStatus: { status: 'pago' } }),
}));

import Vendas from '../Reservas';

const wrap = () => render(<BrowserRouter><Vendas /></BrowserRouter>);

describe('Reservas/Vendas (expanded)', () => {
  it('renders page header with count', () => {
    wrap();
    expect(screen.getByText('Reservas')).toBeDefined();
    expect(screen.getByText(/3 reservas cadastradas/)).toBeDefined();
  });

  it('renders reserva names', () => {
    wrap();
    // Names appear in both mobile cards and desktop rows
    expect(screen.getAllByText('Joao Silva').length).toBeGreaterThanOrEqual(1);
  });

  it('filters by search term on nome', () => {
    wrap();
    const search = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(search, { target: { value: 'Joao' } });
    expect(screen.getAllByText('Joao Silva').length).toBeGreaterThanOrEqual(1);
  });

  it('filters by search term on quarto number', () => {
    wrap();
    const search = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(search, { target: { value: '101' } });
    expect(screen.getAllByText('Joao Silva').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Nova Reserva button', () => {
    wrap();
    expect(screen.getByText('Nova Reserva')).toBeDefined();
  });

  it('opens new reserva modal on click', () => {
    wrap();
    fireEvent.click(screen.getByText('Nova Reserva'));
    expect(screen.getByText(/Dados do Hospede/i)).toBeDefined();
  });

  it('uses hospede.nome fallback for display', () => {
    wrap();
    // Pedro comes from hospede.nome (appears in mobile + desktop)
    expect(screen.getAllByText('Pedro').length).toBeGreaterThanOrEqual(1);
  });

  it('uses quartoNumero fallback', () => {
    wrap();
    expect(screen.getAllByText('202').length).toBeGreaterThanOrEqual(1);
  });
});
