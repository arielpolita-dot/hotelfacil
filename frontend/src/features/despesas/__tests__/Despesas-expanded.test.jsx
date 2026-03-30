import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockHotel = {
  despesas: [],
  fornecedores: [],
  adicionarDespesa: vi.fn().mockResolvedValue('d-new'),
  atualizarDespesa: vi.fn().mockResolvedValue(),
  removerDespesa: vi.fn().mockResolvedValue(),
  adicionarFornecedor: vi.fn().mockResolvedValue('fn-new'),
  loading: false,
};

vi.mock('../../../context/HotelContext', () => ({
  useHotel: () => mockHotel,
}));

import Despesas from '../Despesas';

const wrap = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Despesas (expanded)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHotel.despesas = [];
  });

  it('renders empty state', () => {
    wrap(<Despesas />);
    expect(screen.getByText(/Nenhuma despesa/i)).toBeDefined();
  });

  it('renders despesas with data', () => {
    mockHotel.despesas = [
      { id: 'd1', descricao: 'Energia', categoria: 'Servicos', valor: 500, data: '2026-03-15T12:00:00', status: 'pendente', fornecedor: 'CPFL' },
    ];
    wrap(<Despesas />);
    expect(screen.getByText('Energia')).toBeDefined();
  });

  it('filters by search term', () => {
    mockHotel.despesas = [
      { id: 'd1', descricao: 'Energia', categoria: 'Servicos', valor: 500, data: '2026-03-15', status: 'pendente' },
      { id: 'd2', descricao: 'Agua', categoria: 'Servicos', valor: 200, data: '2026-03-15', status: 'pago' },
    ];
    wrap(<Despesas />);
    const search = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(search, { target: { value: 'Energia' } });
    expect(screen.getByText('Energia')).toBeDefined();
    expect(screen.queryByText('Agua')).toBeNull();
  });

  it('filters by fornecedor in search', () => {
    mockHotel.despesas = [
      { id: 'd1', descricao: 'A', categoria: 'X', valor: 100, data: '2026-03-15', status: 'pendente', fornecedor: 'Alpha' },
      { id: 'd2', descricao: 'B', categoria: 'Y', valor: 200, data: '2026-03-15', status: 'pago', fornecedor: 'Beta' },
    ];
    wrap(<Despesas />);
    const search = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(search, { target: { value: 'Alpha' } });
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.queryByText('B')).toBeNull();
  });

  it('opens new despesa modal', () => {
    wrap(<Despesas />);
    fireEvent.click(screen.getByText('Nova Despesa'));
    expect(screen.getByText(/Salvar/i)).toBeDefined();
  });

  it('opens edit despesa modal', () => {
    mockHotel.despesas = [
      { id: 'd1', descricao: 'Energia', categoria: 'Servicos', valor: 500, data: '2026-03-15T12:00:00', status: 'pendente' },
    ];
    wrap(<Despesas />);
    // Despesas uses Button variant="link" with text "Editar"
    const editBtns = screen.getAllByText('Editar');
    fireEvent.click(editBtns[0]);
    // Should show the edit modal
    expect(screen.getByText(/Editar Despesa/i)).toBeDefined();
  });

  it('renders stat cards with totals', () => {
    mockHotel.despesas = [
      { id: 'd1', descricao: 'A', categoria: 'X', valor: 100, data: '2026-03-15', status: 'pendente' },
      { id: 'd2', descricao: 'B', categoria: 'Y', valor: 200, data: '2026-03-15', status: 'pago' },
    ];
    wrap(<Despesas />);
    // Should show total amounts
    expect(document.body.textContent).toContain('R$');
  });
});
