import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock all contexts
vi.mock('../../context/HotelContext', () => ({
  useHotel: () => ({
    quartos: [
      { id: 'q1', numero: 101, tipo: 'Standard', capacidade: 2, precoDiaria: 150, status: 'disponivel', descricao: 'Quarto 101', andar: '1' },
      { id: 'q2', numero: 202, tipo: 'Deluxe', capacidade: 3, precoDiaria: 300, status: 'ocupado', descricao: 'Quarto 202', andar: '2' },
    ],
    reservas: [
      { id: 'r1', hospede: 'Joao', quartoId: 'q1', status: 'ativa', dataCheckIn: '2026-03-01', dataCheckOut: '2026-03-05', valor: 600, formaPagamento: 'cartao', numeroPessoas: 2 },
    ],
    despesas: [
      { id: 'd1', descricao: 'Limpeza', categoria: 'Servicos', valor: 100, data: '2026-03-15', status: 'pendente', fornecedor: 'Limpeza SA' },
    ],
    fluxoCaixa: [
      { id: 'f1', descricao: 'Receita', tipo: 'entrada', valor: 500, data: '2026-03-15', formaPagamento: 'pix', categoria: 'hospedagem' },
    ],
    faturas: [
      { id: 'ft1', numero: 'F001', hospede: 'Maria', valor: 900, status: 'pendente', dataEmissao: '2026-03-01', dataVencimento: '2026-03-15', tipo: 'avulsa' },
    ],
    usuarios: [
      { id: 'u1', nome: 'Admin', email: 'admin@hotel.com', role: 'admin', status: 'ativo' },
    ],
    fornecedores: [
      { id: 'fn1', nome: 'Fornecedor A', tipo: 'juridica', cnpj: '00.000.000/0001-00', email: 'forn@test.com', telefone: '(11) 1111-1111' },
    ],
    bancos: [
      { id: 'b1', nome: 'Banco do Brasil', agencia: '1234', conta: '56789-0', tipo: 'corrente', saldo: 5000 },
    ],
    loading: false,
    error: null,
    empresaId: 'emp-1',
    usuario: { email: 'admin@test.com' },
    logout: vi.fn(),
    adicionarQuarto: vi.fn().mockResolvedValue('q-new'),
    atualizarQuarto: vi.fn().mockResolvedValue(),
    removerQuarto: vi.fn().mockResolvedValue(),
    atualizarStatusQuarto: vi.fn().mockResolvedValue(),
    adicionarReserva: vi.fn().mockResolvedValue('r-new'),
    atualizarReserva: vi.fn().mockResolvedValue(),
    fazerCheckout: vi.fn().mockResolvedValue(),
    cancelarReserva: vi.fn().mockResolvedValue(),
    adicionarDespesa: vi.fn().mockResolvedValue('d-new'),
    atualizarDespesa: vi.fn().mockResolvedValue(),
    removerDespesa: vi.fn().mockResolvedValue(),
    adicionarFluxo: vi.fn().mockResolvedValue('f-new'),
    adicionarFatura: vi.fn().mockResolvedValue('ft-new'),
    atualizarFatura: vi.fn().mockResolvedValue(),
    removerFatura: vi.fn().mockResolvedValue(),
    adicionarUsuario: vi.fn().mockResolvedValue('u-new'),
    atualizarUsuario: vi.fn().mockResolvedValue(),
    removerUsuario: vi.fn().mockResolvedValue(),
    adicionarFornecedor: vi.fn().mockResolvedValue('fn-new'),
    atualizarFornecedor: vi.fn().mockResolvedValue(),
    removerFornecedor: vi.fn().mockResolvedValue(),
    adicionarBanco: vi.fn().mockResolvedValue('b-new'),
    atualizarBanco: vi.fn().mockResolvedValue(),
    removerBanco: vi.fn().mockResolvedValue(),
    getDisponibilidade: vi.fn().mockReturnValue({ q1: 'disponivel', q2: 'ocupado' }),
  }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { email: 'admin@test.com', displayName: 'Admin' },
    companies: [{ id: 'emp-1', nome: 'Hotel Teste' }],
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../../context/EmpresaContext', () => ({
  useEmpresa: () => ({
    activeEmpresa: { id: 'emp-1', nome: 'Hotel Teste' },
    empresaAtual: { id: 'emp-1', nome: 'Hotel Teste' },
    companies: [{ id: 'emp-1', nome: 'Hotel Teste' }],
    empresasUsuario: [{ id: 'emp-1', nome: 'Hotel Teste' }],
    loading: false,
    switchEmpresa: vi.fn(),
    createEmpresa: vi.fn(),
    selecionarEmpresa: vi.fn(),
  }),
}));

vi.mock('../../context/TrialContext', () => ({
  useTrial: () => ({
    trialStatus: { status: 'active', diasRestantes: 30 },
    isAdmin: () => false,
  }),
}));

// Mock recharts to avoid rendering issues in test
vi.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Legend: () => null,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => null,
  AreaChart: ({ children }) => <div>{children}</div>,
  Area: () => null,
}));

function wrap(Component) {
  return render(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  );
}

// --- Dashboard ---
import Dashboard from '../dashboard/Dashboard';

describe('Dashboard page', () => {
  it('renders dashboard content', () => {
    wrap(Dashboard);
    // Dashboard shows stat cards - many items with "Quartos"
    expect(screen.getAllByText(/Quartos/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders page content', () => {
    wrap(Dashboard);
    const container = document.body;
    expect(container.textContent.length).toBeGreaterThan(0);
  });
});

// --- Quartos ---
import Quartos from '../quartos/Quartos';

describe('Quartos page', () => {
  it('renders page header', () => {
    wrap(Quartos);
    expect(screen.getByText('Quartos')).toBeDefined();
  });

  it('renders room data', () => {
    wrap(Quartos);
    expect(screen.getAllByText(/Quarto 101/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders new room button', () => {
    wrap(Quartos);
    expect(screen.getByText(/Novo Quarto/i)).toBeDefined();
  });

  it('opens new room modal on button click', () => {
    wrap(Quartos);
    fireEvent.click(screen.getByText(/Novo Quarto/i));
    expect(screen.getByText(/Salvar/i)).toBeDefined();
  });
});

// --- Fornecedores ---
import Fornecedores from '../fornecedores/Fornecedores';

describe('Fornecedores page', () => {
  it('renders page header', () => {
    wrap(Fornecedores);
    expect(screen.getByText('Fornecedores')).toBeDefined();
  });

  it('renders fornecedor data', () => {
    wrap(Fornecedores);
    expect(screen.getByText('Fornecedor A')).toBeDefined();
  });

  it('renders add button', () => {
    wrap(Fornecedores);
    expect(screen.getByText(/Novo Fornecedor/i)).toBeDefined();
  });
});

// --- Despesas ---
import Despesas from '../despesas/Despesas';

describe('Despesas page', () => {
  it('renders page header', () => {
    wrap(Despesas);
    expect(screen.getByText('Despesas')).toBeDefined();
  });

  it('renders despesa data', () => {
    wrap(Despesas);
    expect(screen.getAllByText('Limpeza').length).toBeGreaterThanOrEqual(1);
  });

  it('renders add button', () => {
    wrap(Despesas);
    expect(screen.getByText(/Nova Despesa/i)).toBeDefined();
  });
});

// --- Faturas ---
import FaturasPage from '../faturas/Faturas';

describe('Faturas page', () => {
  it('renders page header', () => {
    render(
      <BrowserRouter>
        <FaturasPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Vendas por Faturas/i)).toBeDefined();
  });
});

// --- Usuarios ---
import Usuarios from '../usuarios/Usuarios';

describe('Usuarios page', () => {
  it('renders page header', () => {
    wrap(Usuarios);
    expect(screen.getByText(/Gestao de Usuarios/i)).toBeDefined();
  });

  it('renders user data', () => {
    wrap(Usuarios);
    expect(screen.getByText('Admin')).toBeDefined();
  });
});

// --- FluxoCaixa ---
import FluxoCaixa from '../financeiro/FluxoCaixa';

describe('FluxoCaixa page', () => {
  it('renders page header', () => {
    wrap(FluxoCaixa);
    expect(screen.getByText(/Fluxo de Caixa/i)).toBeDefined();
  });
});

// --- Disponibilidade ---
import Disponibilidade from '../disponibilidade/Disponibilidade';

describe('Disponibilidade page', () => {
  it('renders page header', () => {
    wrap(Disponibilidade);
    expect(screen.getByText(/Disponibilidade/i)).toBeDefined();
  });
});

// --- DRE ---
import DRE from '../financeiro/DRE';

describe('DRE page', () => {
  it('renders page header', () => {
    wrap(DRE);
    expect(screen.getByText(/DRE/i)).toBeDefined();
  });
});

// --- Reservas ---
import Vendas from '../reservas/Reservas';

describe('Reservas/Vendas page', () => {
  it('renders page header', () => {
    wrap(Vendas);
    expect(screen.getAllByText(/Reservas/i).length).toBeGreaterThanOrEqual(1);
  });
});
