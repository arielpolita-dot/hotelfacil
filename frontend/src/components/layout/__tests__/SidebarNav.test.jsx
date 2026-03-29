import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SidebarNav, NAV_ITEMS } from '../SidebarNav';

// Mock EmpresaContext for EmpresaSwitcher
vi.mock('../../../context/EmpresaContext', () => ({
  useEmpresa: () => ({
    activeEmpresa: { id: 'e1', nome: 'Hotel Teste' },
    companies: [{ id: 'e1', nome: 'Hotel Teste' }],
    switchEmpresa: vi.fn(),
    createEmpresa: vi.fn(),
  }),
}));

const defaultProps = {
  sidebarOpen: true,
  setSidebarOpen: vi.fn(),
  currentUser: { email: 'test@test.com', displayName: 'Test User' },
  empresaAtual: { id: 'e1', nome: 'Hotel Teste' },
  companies: [{ id: 'e1', nome: 'Hotel Teste' }],
  switchEmpresa: vi.fn(),
  logout: vi.fn(),
};

function renderSidebar(props = {}) {
  return render(
    <BrowserRouter>
      <SidebarNav {...defaultProps} {...props} />
    </BrowserRouter>
  );
}

describe('SidebarNav', () => {
  it('renders Hotel Facil brand', () => {
    renderSidebar();
    expect(screen.getByText(/Hotel F/)).toBeDefined();
  });

  it('renders navigation items', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Quartos')).toBeDefined();
    expect(screen.getByText('Reservas')).toBeDefined();
  });

  it('renders divider labels', () => {
    renderSidebar();
    expect(screen.getByText('Financeiro')).toBeDefined();
    expect(screen.getByText('Cadastros')).toBeDefined();
  });

  it('renders user info', () => {
    renderSidebar();
    expect(screen.getByText('Test User')).toBeDefined();
    expect(screen.getByText('test@test.com')).toBeDefined();
  });

  it('renders user initial when no displayName', () => {
    renderSidebar({ currentUser: { email: 'john@test.com' } });
    expect(screen.getByText('J')).toBeDefined();
  });

  it('calls logout on logout button click', () => {
    const logout = vi.fn();
    renderSidebar({ logout });
    fireEvent.click(screen.getByTitle('Sair'));
    expect(logout).toHaveBeenCalled();
  });

  it('exports NAV_ITEMS constant', () => {
    expect(NAV_ITEMS).toBeDefined();
    expect(NAV_ITEMS.length).toBeGreaterThan(5);
  });
});
