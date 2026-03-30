import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockHotel = {
  fornecedores: [],
  adicionarFornecedor: vi.fn().mockResolvedValue('fn-new'),
  atualizarFornecedor: vi.fn().mockResolvedValue(),
  removerFornecedor: vi.fn().mockResolvedValue(),
  loading: false,
};

vi.mock('../../../context/HotelContext', () => ({
  useHotel: () => mockHotel,
}));

import Fornecedores from '../Fornecedores';

const wrap = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Fornecedores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHotel.fornecedores = [];
  });

  it('renders empty state when no fornecedores', () => {
    wrap(<Fornecedores />);
    expect(screen.getByText(/Nenhum fornecedor encontrado/i)).toBeDefined();
  });

  it('renders subtitle with correct pluralization for 0', () => {
    wrap(<Fornecedores />);
    expect(screen.getByText(/0 fornecedores cadastrados/)).toBeDefined();
  });

  it('renders subtitle with correct pluralization for 1', () => {
    mockHotel.fornecedores = [{ id: 'f1', nome: 'Forn A', tipo: 'juridica' }];
    wrap(<Fornecedores />);
    expect(screen.getByText(/1 fornecedor cadastrado/)).toBeDefined();
  });

  it('renders fornecedores table when data exists', () => {
    mockHotel.fornecedores = [
      { id: 'f1', nome: 'Forn A', tipo: 'juridica', cnpj: '00.000.000/0001-00', email: 'a@b.com', telefone: '(11)1111-1111', contato: 'Joao' },
      { id: 'f2', nome: 'Forn B', tipo: 'fisica', cpf: '000.000.000-00' },
    ];
    wrap(<Fornecedores />);
    expect(screen.getByText('Forn A')).toBeDefined();
    expect(screen.getByText('Forn B')).toBeDefined();
    expect(screen.getByText('Pessoa Juridica')).toBeDefined();
    expect(screen.getByText('Pessoa Fisica')).toBeDefined();
  });

  it('filters fornecedores by search', () => {
    mockHotel.fornecedores = [
      { id: 'f1', nome: 'Alpha Corp', tipo: 'juridica' },
      { id: 'f2', nome: 'Beta Inc', tipo: 'juridica' },
    ];
    wrap(<Fornecedores />);
    const search = screen.getByPlaceholderText(/Buscar por nome/i);
    fireEvent.change(search, { target: { value: 'Alpha' } });
    expect(screen.getByText('Alpha Corp')).toBeDefined();
    expect(screen.queryByText('Beta Inc')).toBeNull();
  });

  it('filters by cnpj', () => {
    mockHotel.fornecedores = [
      { id: 'f1', nome: 'A', tipo: 'juridica', cnpj: '12345' },
      { id: 'f2', nome: 'B', tipo: 'juridica', cnpj: '99999' },
    ];
    wrap(<Fornecedores />);
    const search = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(search, { target: { value: '12345' } });
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.queryByText('B')).toBeNull();
  });

  it('filters by email', () => {
    mockHotel.fornecedores = [
      { id: 'f1', nome: 'A', tipo: 'juridica', email: 'abc@x.com' },
      { id: 'f2', nome: 'B', tipo: 'juridica', email: 'xyz@y.com' },
    ];
    wrap(<Fornecedores />);
    const search = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(search, { target: { value: 'abc@x' } });
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.queryByText('B')).toBeNull();
  });

  it('filters by contato', () => {
    mockHotel.fornecedores = [
      { id: 'f1', nome: 'A', tipo: 'juridica', contato: 'carlos' },
      { id: 'f2', nome: 'B', tipo: 'juridica', contato: 'pedro' },
    ];
    wrap(<Fornecedores />);
    const search = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(search, { target: { value: 'carlos' } });
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.queryByText('B')).toBeNull();
  });

  it('opens new fornecedor modal', () => {
    wrap(<Fornecedores />);
    fireEvent.click(screen.getByText('Novo Fornecedor'));
    expect(screen.getByText(/Cadastrar Fornecedor/i)).toBeDefined();
  });

  it('opens edit fornecedor modal', () => {
    mockHotel.fornecedores = [{ id: 'f1', nome: 'Forn A', tipo: 'juridica' }];
    wrap(<Fornecedores />);
    fireEvent.click(screen.getByLabelText('Editar'));
    expect(screen.getByText(/Salvar Alteracoes/i)).toBeDefined();
  });

  it('opens delete confirmation', () => {
    mockHotel.fornecedores = [{ id: 'f1', nome: 'Forn A', tipo: 'juridica' }];
    wrap(<Fornecedores />);
    const excluirBtn = screen.getByLabelText('Excluir');
    fireEvent.click(excluirBtn);
    // Delete dialog should appear
    expect(document.body.textContent).toMatch(/exclu|delet|remov/i);
  });

  it('shows dash for missing cnpj/cpf/contato/telefone/email', () => {
    mockHotel.fornecedores = [{ id: 'f1', nome: 'Forn A', tipo: 'juridica' }];
    wrap(<Fornecedores />);
    const cells = document.querySelectorAll('td');
    const dashCells = Array.from(cells).filter(c => c.textContent === '\u2014');
    expect(dashCells.length).toBeGreaterThanOrEqual(1);
  });

  it('saves new fornecedor via modal', async () => {
    wrap(<Fornecedores />);
    fireEvent.click(screen.getByText('Novo Fornecedor'));
    // Fill in the modal form - the modal onChange is mocked by FornecedorFormModal
    // Just click save
    fireEvent.click(screen.getByText('Cadastrar Fornecedor'));
    // adicionarFornecedor should eventually be called
    await waitFor(() => {
      expect(mockHotel.adicionarFornecedor).toHaveBeenCalled();
    });
  });

  it('closes modal after save', async () => {
    wrap(<Fornecedores />);
    fireEvent.click(screen.getByText('Novo Fornecedor'));
    fireEvent.click(screen.getByText('Cadastrar Fornecedor'));
    await waitFor(() => {
      // Modal should close (Cadastrar button should disappear)
      expect(screen.queryByText('Cadastrar Fornecedor')).toBeNull();
    });
  });

  it('handles delete flow', async () => {
    mockHotel.fornecedores = [{ id: 'f1', nome: 'Forn A', tipo: 'juridica' }];
    wrap(<Fornecedores />);
    fireEvent.click(screen.getByLabelText('Excluir'));
    // Confirm delete
    const confirmBtn = screen.getByText(/Excluir/i, { selector: 'button' });
    if (confirmBtn) {
      fireEvent.click(confirmBtn);
      await waitFor(() => {
        expect(mockHotel.removerFornecedor).toHaveBeenCalled();
      });
    }
  });
});
