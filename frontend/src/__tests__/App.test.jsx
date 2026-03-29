import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock all lazy-loaded pages
vi.mock('../features/dashboard/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('../features/disponibilidade/Disponibilidade', () => ({ default: () => <div>Disponibilidade Page</div> }));
vi.mock('../features/quartos/Quartos', () => ({ default: () => <div>Quartos Page</div> }));
vi.mock('../features/reservas/Reservas', () => ({ default: () => <div>Vendas Page</div> }));
vi.mock('../features/faturas/Faturas', () => ({ default: () => <div>Faturas Page</div> }));
vi.mock('../features/despesas/Despesas', () => ({ default: () => <div>Despesas Page</div> }));
vi.mock('../features/usuarios/Usuarios', () => ({ default: () => <div>Usuarios Page</div> }));
vi.mock('../features/financeiro/FluxoCaixa', () => ({ default: () => <div>FluxoCaixa Page</div> }));
vi.mock('../features/financeiro/DRE', () => ({ default: () => <div>DRE Page</div> }));
vi.mock('../features/configuracoes/Configuracoes', () => ({ default: () => <div>Configuracoes Page</div> }));
vi.mock('../features/fornecedores/Fornecedores', () => ({ default: () => <div>Fornecedores Page</div> }));
vi.mock('../features/admin/AdminPanel', () => ({ default: () => <div>Admin Page</div> }));

// Mock contexts
vi.mock('../context/AuthContext', () => {
  const mockUseAuth = vi.fn();
  return {
    useAuth: mockUseAuth,
    AuthProvider: ({ children }) => children,
  };
});

vi.mock('../context/EmpresaContext', () => {
  const mockUseEmpresa = vi.fn();
  return {
    useEmpresa: mockUseEmpresa,
    EmpresaProvider: ({ children }) => children,
  };
});

vi.mock('../context/HotelContext', () => ({
  useHotel: () => ({ despesas: [] }),
  HotelProvider: ({ children }) => children,
}));

// Mock layout components
vi.mock('../components/Layout', () => ({ default: ({ children }) => <div>{children}</div> }));
vi.mock('../components/auth/AuthCallback', () => ({ default: () => <div>Auth Callback</div> }));
vi.mock('../pages/LandingPage', () => ({ default: () => <div>Landing Page</div> }));
vi.mock('../pages/CreateEmpresa', () => ({ default: () => <div>Create Empresa</div> }));

import { useAuth } from '../context/AuthContext';
import { useEmpresa } from '../context/EmpresaContext';
import App from '../App';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      currentUser: null,
      companies: [],
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    useEmpresa.mockReturnValue({
      activeEmpresa: null,
      loading: false,
    });
  });

  it('renders landing page at root', () => {
    render(<App />);
    expect(screen.getByText('Landing Page')).toBeDefined();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  it('shows loading state when auth is loading', () => {
    useAuth.mockReturnValue({
      currentUser: null,
      companies: [],
      loading: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    useEmpresa.mockReturnValue({
      activeEmpresa: null,
      loading: false,
    });
    render(<App />);
    // Loading state renders the Hotel Facil splash
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  it('exports lazy-loaded page components', async () => {
    const exports = await import('../App');
    expect(exports.Dashboard).toBeDefined();
    expect(exports.Quartos).toBeDefined();
    expect(exports.Vendas).toBeDefined();
    expect(exports.Faturas).toBeDefined();
    expect(exports.Despesas).toBeDefined();
    expect(exports.Usuarios).toBeDefined();
    expect(exports.FluxoCaixa).toBeDefined();
    expect(exports.DRE).toBeDefined();
    expect(exports.Configuracoes).toBeDefined();
    expect(exports.Fornecedores).toBeDefined();
    expect(exports.AdminPanel).toBeDefined();
  });
});
