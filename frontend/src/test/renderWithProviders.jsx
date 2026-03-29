import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

const mockHotelContext = {
  quartos: [],
  reservas: [],
  despesas: [],
  fluxoCaixa: [],
  faturas: [],
  usuarios: [],
  fornecedores: [],
  bancos: [],
  loading: false,
  error: null,
  empresaId: 'test-empresa',
  adicionarQuarto: vi.fn(),
  atualizarQuarto: vi.fn(),
  removerQuarto: vi.fn(),
  adicionarReserva: vi.fn(),
  atualizarReserva: vi.fn(),
  fazerCheckout: vi.fn(),
  cancelarReserva: vi.fn(),
  adicionarDespesa: vi.fn(),
  atualizarDespesa: vi.fn(),
  removerDespesa: vi.fn(),
  adicionarFatura: vi.fn(),
  atualizarFatura: vi.fn(),
  removerFatura: vi.fn(),
  adicionarUsuario: vi.fn(),
  atualizarUsuario: vi.fn(),
  removerUsuario: vi.fn(),
  adicionarFornecedor: vi.fn(),
  atualizarFornecedor: vi.fn(),
  removerFornecedor: vi.fn(),
  adicionarBanco: vi.fn(),
  atualizarBanco: vi.fn(),
  removerBanco: vi.fn(),
  adicionarFluxo: vi.fn(),
  getDisponibilidade: vi.fn().mockReturnValue({}),
};

const mockAuthContext = {
  currentUser: { uid: 'test-uid', email: 'test@test.com', displayName: 'Test User' },
  companies: [{ id: 'test-empresa', nome: 'Hotel Teste' }],
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
};

const mockEmpresaContext = {
  activeEmpresa: { id: 'test-empresa', nome: 'Hotel Teste' },
  empresaAtual: { id: 'test-empresa', nome: 'Hotel Teste' },
  companies: [{ id: 'test-empresa', nome: 'Hotel Teste' }],
  empresasUsuario: [{ id: 'test-empresa', nome: 'Hotel Teste' }],
  loading: false,
  loadingEmpresa: false,
  switchEmpresa: vi.fn(),
  createEmpresa: vi.fn(),
  selecionarEmpresa: vi.fn(),
};

export function renderWithProviders(ui) {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
}

export { mockHotelContext, mockAuthContext, mockEmpresaContext };
