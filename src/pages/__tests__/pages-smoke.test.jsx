import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock the contexts
vi.mock('../../context/HotelContext', () => ({
  useHotel: () => ({
    quartos: [], reservas: [], despesas: [], fluxoCaixa: [],
    faturas: [], usuarios: [], fornecedores: [], bancos: [],
    loading: false, error: null, empresaId: 'test',
    adicionarQuarto: vi.fn(), atualizarQuarto: vi.fn(), removerQuarto: vi.fn(),
    adicionarReserva: vi.fn(), atualizarReserva: vi.fn(),
    fazerCheckout: vi.fn(), cancelarReserva: vi.fn(),
    adicionarDespesa: vi.fn(), atualizarDespesa: vi.fn(), removerDespesa: vi.fn(),
    adicionarFatura: vi.fn(), atualizarFatura: vi.fn(), removerFatura: vi.fn(),
    adicionarUsuario: vi.fn(), atualizarUsuario: vi.fn(), removerUsuario: vi.fn(),
    adicionarFornecedor: vi.fn(), atualizarFornecedor: vi.fn(), removerFornecedor: vi.fn(),
    adicionarBanco: vi.fn(), atualizarBanco: vi.fn(), removerBanco: vi.fn(),
    adicionarFluxo: vi.fn(), getDisponibilidade: vi.fn().mockReturnValue({}),
  }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'u1', email: 'test@test.com', displayName: 'Test' },
    empresaAtual: { id: 'e1', nome: 'Hotel Teste' },
    empresasUsuario: [{ id: 'e1', nome: 'Hotel Teste' }],
    trialStatus: { status: 'pago' },
    loading: false, error: null,
    login: vi.fn(), criarConta: vi.fn(), logout: vi.fn(),
    recuperarSenha: vi.fn(), selecionarEmpresa: vi.fn(),
    ativarEmpresa: vi.fn(), listarTodasEmpresas: vi.fn(),
    isAdmin: vi.fn().mockReturnValue(false),
  }),
}));

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => ({
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  Legend: () => <div />,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => <div />,
}));

import Quartos from '../Quartos';
import Fornecedores from '../Fornecedores';
import FluxoCaixa from '../FluxoCaixa';
import Disponibilidade from '../Disponibilidade';

const wrap = (ui) => <BrowserRouter>{ui}</BrowserRouter>;

describe('Page Smoke Tests', () => {
  it('Quartos renders without crashing', () => {
    // Arrange & Act
    render(wrap(<Quartos />));

    // Assert
    expect(screen.getByText('Quartos')).toBeDefined();
  });

  it('Fornecedores renders without crashing', () => {
    // Arrange & Act
    render(wrap(<Fornecedores />));

    // Assert
    expect(screen.getByText('Fornecedores')).toBeDefined();
  });

  it('FluxoCaixa renders without crashing', () => {
    // Arrange & Act
    render(wrap(<FluxoCaixa />));

    // Assert
    expect(document.body.textContent).toBeTruthy();
  });

  it('Disponibilidade renders without crashing', () => {
    // Arrange & Act
    render(wrap(<Disponibilidade />));

    // Assert
    expect(document.body.textContent).toBeTruthy();
  });
});
