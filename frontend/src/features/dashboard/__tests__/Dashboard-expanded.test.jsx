import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockHotelReturn = {
  quartos: [], reservas: [], despesas: [],
  loading: false,
};

vi.mock('../../../context/HotelContext', () => ({
  useHotel: () => mockHotelReturn,
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { email: 'admin@test.com' },
    loading: false,
  }),
}));

vi.mock('../../../context/EmpresaContext', () => ({
  useEmpresa: () => ({
    activeEmpresa: { id: 'e1', nome: 'Hotel' },
    empresaAtual: { id: 'e1', nome: 'Hotel' },
    companies: [{ id: 'e1', nome: 'Hotel' }],
  }),
}));

vi.mock('../../../context/TrialContext', () => ({
  useTrial: () => ({ trialStatus: { status: 'pago' } }),
}));

vi.mock('recharts', () => ({
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

import Dashboard from '../Dashboard';

const wrap = () => render(<BrowserRouter><Dashboard /></BrowserRouter>);

describe('Dashboard (expanded)', () => {
  it('renders Visao Geral when data loaded', () => {
    mockHotelReturn.quartos = [
      { id: 'q1', status: 'disponivel' },
      { id: 'q2', status: 'ocupado' },
    ];
    mockHotelReturn.reservas = [
      { id: 'r1', status: 'ativa', dataCheckIn: '2026-03-01', dataCheckOut: '2026-03-05', valorTotal: 500, criadoEm: '2026-03-01' },
    ];
    mockHotelReturn.despesas = [
      { id: 'd1', valor: 100, data: '2026-03-15', status: 'pendente' },
    ];
    mockHotelReturn.loading = false;
    wrap();
    expect(screen.getByText(/Vis/)).toBeDefined();
  });

  it('renders stat cards with quarto data', () => {
    mockHotelReturn.quartos = [
      { id: 'q1', status: 'disponivel' },
      { id: 'q2', status: 'ocupado' },
      { id: 'q3', status: 'reservado' },
    ];
    mockHotelReturn.reservas = [];
    mockHotelReturn.despesas = [];
    mockHotelReturn.loading = false;
    wrap();
    expect(screen.getAllByText(/Quartos/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders with empty data', () => {
    mockHotelReturn.quartos = [];
    mockHotelReturn.reservas = [];
    mockHotelReturn.despesas = [];
    mockHotelReturn.loading = false;
    wrap();
    expect(screen.getByText(/Vis/)).toBeDefined();
  });

  it('shows date in Portuguese', () => {
    mockHotelReturn.quartos = [];
    mockHotelReturn.reservas = [];
    mockHotelReturn.despesas = [];
    mockHotelReturn.loading = false;
    wrap();
    expect(document.body.textContent).toMatch(/de/);
  });
});
