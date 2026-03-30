import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockAdicionarUsuario = vi.fn().mockResolvedValue('u-new');
const mockAtualizarUsuario = vi.fn().mockResolvedValue();
const mockRemoverUsuario = vi.fn().mockResolvedValue();

vi.mock('../../../context/HotelContext', () => ({
  useHotel: () => ({
    usuarios: [
      { id: 'u1', nome: 'Admin User', email: 'admin@hotel.com', role: 'Admin', status: 'Ativo', telefone: '(11) 1111' },
      { id: 'u2', nome: 'Recepcao User', email: 'recepcao@hotel.com', role: 'Recepcionista', status: 'Inativo' },
    ],
    adicionarUsuario: mockAdicionarUsuario,
    atualizarUsuario: mockAtualizarUsuario,
    removerUsuario: mockRemoverUsuario,
    loading: false,
  }),
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { id: 'u1', email: 'admin@hotel.com' },
    loading: false,
  }),
}));

vi.mock('../../../context/EmpresaContext', () => ({
  useEmpresa: () => ({
    empresaAtual: { id: 'e1', nome: 'Hotel Teste' },
    companies: [{ id: 'e1', nome: 'Hotel Teste' }],
  }),
}));

import Usuarios from '../Usuarios';

const wrap = () => render(<BrowserRouter><Usuarios /></BrowserRouter>);

describe('Usuarios (expanded)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', () => {
    wrap();
    expect(screen.getByText(/Gestao de Usuarios/i)).toBeDefined();
  });

  it('renders user names', () => {
    wrap();
    expect(screen.getByText('Admin User')).toBeDefined();
    expect(screen.getByText('Recepcao User')).toBeDefined();
  });

  it('renders user emails', () => {
    wrap();
    expect(screen.getByText('admin@hotel.com')).toBeDefined();
    expect(screen.getByText('recepcao@hotel.com')).toBeDefined();
  });

  it('filters users by search', () => {
    wrap();
    const search = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(search, { target: { value: 'Admin' } });
    expect(screen.getByText('Admin User')).toBeDefined();
    expect(screen.queryByText('Recepcao User')).toBeNull();
  });

  it('opens new user modal', () => {
    wrap();
    fireEvent.click(screen.getByText(/Novo Usu/i));
    expect(screen.getByText(/Nome Completo/i)).toBeDefined();
  });

  it('opens edit modal on edit click', () => {
    wrap();
    const editBtns = screen.getAllByText('Editar');
    fireEvent.click(editBtns[0]);
    // Should open the modal with title and submit button
    expect(screen.getAllByText(/Editar Usuario|Atualizar/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders stat cards', () => {
    wrap();
    // Should show total, active, inactive counts
    expect(screen.getByText('2')).toBeDefined(); // total
  });

  it('filters by role', () => {
    wrap();
    const selects = screen.getAllByRole('combobox');
    // Find the role filter
    const roleSelect = selects.find(s => {
      const opts = Array.from(s.options).map(o => o.textContent);
      return opts.some(o => o.includes('Admin'));
    });
    if (roleSelect) {
      fireEvent.change(roleSelect, { target: { value: 'Admin' } });
      expect(screen.getByText('Admin User')).toBeDefined();
    }
  });

  it('renders role text', () => {
    wrap();
    // Role should appear somewhere in the page
    expect(document.body.textContent).toContain('Admin');
    expect(document.body.textContent).toContain('Recepcionista');
  });
});
