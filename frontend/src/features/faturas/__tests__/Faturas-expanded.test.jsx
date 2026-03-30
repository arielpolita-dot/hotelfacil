import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../context/HotelContext', () => ({
  useHotel: () => ({
    faturas: [
      { id: 'ft1', empresaCliente: 'Empresa A', cnpj: '00.000', contato: 'Joao', email: 'a@b.com', tipoContrato: 'Mensal Fixo', valorMensal: 5000, status: 'Ativo', dataInicio: '2026-01-01', dataFim: '2027-01-01' },
      { id: 'ft2', empresaCliente: 'Empresa B', cnpj: '11.111', contato: 'Maria', email: 'b@c.com', tipoContrato: 'Diaria Corporativa', valorMensal: 3000, status: 'Encerrado', dataInicio: '2025-01-01', dataFim: '2026-01-01' },
    ],
    adicionarFatura: vi.fn().mockResolvedValue('ft-new'),
    atualizarFatura: vi.fn().mockResolvedValue(),
    removerFatura: vi.fn().mockResolvedValue(),
    quartos: [{ id: 'q1', numero: 101 }],
    loading: false,
  }),
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { email: 'admin@test.com' }, loading: false }),
}));

vi.mock('../../../context/EmpresaContext', () => ({
  useEmpresa: () => ({
    empresaAtual: { id: 'e1', nome: 'Hotel' },
    companies: [{ id: 'e1', nome: 'Hotel' }],
  }),
}));

vi.mock('../../../context/TrialContext', () => ({
  useTrial: () => ({ trialStatus: { status: 'pago' } }),
}));

import Faturas from '../Faturas';

const wrap = () => render(<BrowserRouter><Faturas /></BrowserRouter>);

describe('Faturas (expanded)', () => {
  it('renders page header', () => {
    wrap();
    expect(screen.getByText(/Vendas por Faturas/i)).toBeDefined();
  });

  it('renders fatura data', () => {
    wrap();
    expect(screen.getByText('Empresa A')).toBeDefined();
    expect(screen.getByText('Empresa B')).toBeDefined();
  });

  it('renders Novo Contrato button', () => {
    wrap();
    expect(screen.getByText(/Novo Contrato/i)).toBeDefined();
  });

  it('opens new contrato modal', () => {
    wrap();
    fireEvent.click(screen.getByText(/Novo Contrato/i));
    expect(screen.getByText(/Dados da Empresa Cliente/i)).toBeDefined();
  });

  it('filters by search term', () => {
    wrap();
    const search = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(search, { target: { value: 'Empresa A' } });
    expect(screen.getByText('Empresa A')).toBeDefined();
    expect(screen.queryByText('Empresa B')).toBeNull();
  });

  it('renders stat cards', () => {
    wrap();
    expect(document.body.textContent).toContain('R$');
  });
});
