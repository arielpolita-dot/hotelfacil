import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { HotelProvider, useHotel } from '../HotelContext';

// Mock all services
vi.mock('../../services', () => ({
  onQuartos: vi.fn((id, cb) => { cb([]); return () => {}; }),
  onReservas: vi.fn((id, cb) => { cb([]); return () => {}; }),
  onDespesas: vi.fn((id, cb) => { cb([]); return () => {}; }),
  onFluxoCaixa: vi.fn((id, cb) => { cb([]); return () => {}; }),
  onFaturas: vi.fn((id, cb) => { cb([]); return () => {}; }),
  onUsuarios: vi.fn((id, cb) => { cb([]); return () => {}; }),
  onFornecedores: vi.fn((id, cb) => { cb([]); return () => {}; }),
  onBancos: vi.fn((id, cb) => { cb([]); return () => {}; }),
  addQuarto: vi.fn().mockResolvedValue('q-new'),
  updateQuarto: vi.fn().mockResolvedValue(),
  deleteQuarto: vi.fn().mockResolvedValue(),
  addReserva: vi.fn().mockResolvedValue('r-new'),
  updateReserva: vi.fn().mockResolvedValue(),
  checkoutReserva: vi.fn().mockResolvedValue(),
  cancelarReserva: vi.fn().mockResolvedValue(),
  addDespesa: vi.fn().mockResolvedValue('d-new'),
  updateDespesa: vi.fn().mockResolvedValue(),
  deleteDespesa: vi.fn().mockResolvedValue(),
  addFluxoCaixa: vi.fn().mockResolvedValue('f-new'),
  addFatura: vi.fn().mockResolvedValue('ft-new'),
  updateFatura: vi.fn().mockResolvedValue(),
  deleteFatura: vi.fn().mockResolvedValue(),
  addUsuario: vi.fn().mockResolvedValue('u-new'),
  updateUsuario: vi.fn().mockResolvedValue(),
  deleteUsuario: vi.fn().mockResolvedValue(),
  addFornecedor: vi.fn().mockResolvedValue('fn-new'),
  updateFornecedor: vi.fn().mockResolvedValue(),
  deleteFornecedor: vi.fn().mockResolvedValue(),
  addBanco: vi.fn().mockResolvedValue('b-new'),
  updateBanco: vi.fn().mockResolvedValue(),
  deleteBanco: vi.fn().mockResolvedValue(),
  seedDadosIniciais: vi.fn().mockResolvedValue(),
  seedBancosIniciais: vi.fn().mockResolvedValue(),
}));

// Mock AuthContext
vi.mock('../AuthContext', () => ({
  useAuth: () => ({
    currentUser: { id: '1', email: 'test@test.com' },
    logout: vi.fn(),
  }),
}));

// Mock EmpresaContext
const mockEmpresaAtual = { id: 'emp-1', nome: 'Hotel Teste' };
vi.mock('../EmpresaContext', () => ({
  useEmpresa: () => ({
    empresaAtual: mockEmpresaAtual,
  }),
}));

import * as services from '../../services';

function TestConsumer() {
  const ctx = useHotel();
  return (
    <div>
      <span data-testid="loading">{ctx.loading ? 'true' : 'false'}</span>
      <span data-testid="empresa-id">{ctx.empresaId || 'none'}</span>
      <span data-testid="quartos">{ctx.quartos.length}</span>
      <button data-testid="add-quarto" onClick={() => ctx.adicionarQuarto({ numero: 101 })}>Add Quarto</button>
      <button data-testid="update-quarto" onClick={() => ctx.atualizarQuarto('q1', { preco: 200 })}>Update Quarto</button>
      <button data-testid="remove-quarto" onClick={() => ctx.removerQuarto('q1')}>Remove Quarto</button>
      <button data-testid="add-reserva" onClick={() => ctx.adicionarReserva({ quarto: 'q1' })}>Add Reserva</button>
      <button data-testid="update-reserva" onClick={() => ctx.atualizarReserva('r1', { status: 'ok' })}>Update Reserva</button>
      <button data-testid="checkout" onClick={() => ctx.fazerCheckout('r1', 'q1')}>Checkout</button>
      <button data-testid="cancel-reserva" onClick={() => ctx.cancelarReserva('r1', 'q1')}>Cancel Reserva</button>
      <button data-testid="add-despesa" onClick={() => ctx.adicionarDespesa({ valor: 100 })}>Add Despesa</button>
      <button data-testid="update-despesa" onClick={() => ctx.atualizarDespesa('d1', { valor: 200 })}>Update Despesa</button>
      <button data-testid="remove-despesa" onClick={() => ctx.removerDespesa('d1')}>Remove Despesa</button>
      <button data-testid="add-fluxo" onClick={() => ctx.adicionarFluxo({ valor: 500 })}>Add Fluxo</button>
      <button data-testid="add-fatura" onClick={() => ctx.adicionarFatura({ valor: 1000 })}>Add Fatura</button>
      <button data-testid="update-fatura" onClick={() => ctx.atualizarFatura('ft1', { status: 'pago' })}>Update Fatura</button>
      <button data-testid="remove-fatura" onClick={() => ctx.removerFatura('ft1')}>Remove Fatura</button>
      <button data-testid="add-usuario" onClick={() => ctx.adicionarUsuario({ nome: 'John' })}>Add Usuario</button>
      <button data-testid="update-usuario" onClick={() => ctx.atualizarUsuario('u1', { nome: 'Jane' })}>Update Usuario</button>
      <button data-testid="remove-usuario" onClick={() => ctx.removerUsuario('u1')}>Remove Usuario</button>
      <button data-testid="add-fornecedor" onClick={() => ctx.adicionarFornecedor({ nome: 'Forn' })}>Add Fornecedor</button>
      <button data-testid="update-fornecedor" onClick={() => ctx.atualizarFornecedor('fn1', { nome: 'Forn2' })}>Update Fornecedor</button>
      <button data-testid="remove-fornecedor" onClick={() => ctx.removerFornecedor('fn1')}>Remove Fornecedor</button>
      <button data-testid="add-banco" onClick={() => ctx.adicionarBanco({ nome: 'Banco' })}>Add Banco</button>
      <button data-testid="update-banco" onClick={() => ctx.atualizarBanco('b1', { nome: 'Banco2' })}>Update Banco</button>
      <button data-testid="remove-banco" onClick={() => ctx.removerBanco('b1')}>Remove Banco</button>
    </div>
  );
}

describe('HotelProvider', () => {
  const originalGetItem = Storage.prototype.getItem;
  const originalSetItem = Storage.prototype.setItem;

  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn().mockReturnValue(null);
    Storage.prototype.setItem = vi.fn();
  });

  afterEach(() => {
    Storage.prototype.getItem = originalGetItem;
    Storage.prototype.setItem = originalSetItem;
  });

  it('provides empresa id from context', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('empresa-id').textContent).toBe('emp-1');
    });
  });

  it('subscribes to all data collections on mount', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await waitFor(() => {
      expect(services.onQuartos).toHaveBeenCalledWith('emp-1', expect.any(Function));
      expect(services.onReservas).toHaveBeenCalledWith('emp-1', expect.any(Function));
      expect(services.onDespesas).toHaveBeenCalledWith('emp-1', expect.any(Function));
      expect(services.onFluxoCaixa).toHaveBeenCalledWith('emp-1', expect.any(Function));
      expect(services.onFaturas).toHaveBeenCalledWith('emp-1', expect.any(Function));
      expect(services.onUsuarios).toHaveBeenCalledWith('emp-1', expect.any(Function));
      expect(services.onFornecedores).toHaveBeenCalledWith('emp-1', expect.any(Function));
      expect(services.onBancos).toHaveBeenCalledWith('emp-1', expect.any(Function));
    });
  });

  it('seeds initial data when not previously seeded', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await waitFor(() => {
      expect(services.seedDadosIniciais).toHaveBeenCalledWith('emp-1');
      expect(services.seedBancosIniciais).toHaveBeenCalledWith('emp-1');
    });
  });

  it('skips seed when already seeded', async () => {
    Storage.prototype.getItem.mockReturnValue('true');
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await waitFor(() => {
      expect(services.seedDadosIniciais).not.toHaveBeenCalled();
    });
  });

  it('adicionarQuarto delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('add-quarto').click();
    });
    expect(services.addQuarto).toHaveBeenCalledWith('emp-1', { numero: 101 });
  });

  it('atualizarQuarto delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('update-quarto').click();
    });
    expect(services.updateQuarto).toHaveBeenCalledWith('emp-1', 'q1', { preco: 200 });
  });

  it('removerQuarto delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('remove-quarto').click();
    });
    expect(services.deleteQuarto).toHaveBeenCalledWith('emp-1', 'q1');
  });

  it('adicionarReserva delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('add-reserva').click();
    });
    expect(services.addReserva).toHaveBeenCalledWith('emp-1', { quarto: 'q1' });
  });

  it('atualizarReserva delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('update-reserva').click();
    });
    expect(services.updateReserva).toHaveBeenCalledWith('emp-1', 'r1', { status: 'ok' });
  });

  it('fazerCheckout delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('checkout').click();
    });
    expect(services.checkoutReserva).toHaveBeenCalledWith('emp-1', 'r1', 'q1');
  });

  it('cancelarReserva delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('cancel-reserva').click();
    });
    expect(services.cancelarReserva).toHaveBeenCalledWith('emp-1', 'r1', 'q1');
  });

  it('adicionarDespesa delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('add-despesa').click();
    });
    expect(services.addDespesa).toHaveBeenCalledWith('emp-1', { valor: 100 });
  });

  it('atualizarDespesa delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('update-despesa').click();
    });
    expect(services.updateDespesa).toHaveBeenCalledWith('emp-1', 'd1', { valor: 200 });
  });

  it('removerDespesa delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('remove-despesa').click();
    });
    expect(services.deleteDespesa).toHaveBeenCalledWith('emp-1', 'd1');
  });

  it('adicionarFluxo delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('add-fluxo').click();
    });
    expect(services.addFluxoCaixa).toHaveBeenCalledWith('emp-1', { valor: 500 });
  });

  it('adicionarFatura delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('add-fatura').click();
    });
    expect(services.addFatura).toHaveBeenCalledWith('emp-1', { valor: 1000 });
  });

  it('atualizarFatura delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('update-fatura').click();
    });
    expect(services.updateFatura).toHaveBeenCalledWith('emp-1', 'ft1', { status: 'pago' });
  });

  it('removerFatura delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('remove-fatura').click();
    });
    expect(services.deleteFatura).toHaveBeenCalledWith('emp-1', 'ft1');
  });

  it('adicionarUsuario delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('add-usuario').click();
    });
    expect(services.addUsuario).toHaveBeenCalledWith('emp-1', { nome: 'John' });
  });

  it('atualizarUsuario delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('update-usuario').click();
    });
    expect(services.updateUsuario).toHaveBeenCalledWith('emp-1', 'u1', { nome: 'Jane' });
  });

  it('removerUsuario delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('remove-usuario').click();
    });
    expect(services.deleteUsuario).toHaveBeenCalledWith('emp-1', 'u1');
  });

  it('adicionarFornecedor delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('add-fornecedor').click();
    });
    expect(services.addFornecedor).toHaveBeenCalledWith('emp-1', { nome: 'Forn' });
  });

  it('atualizarFornecedor delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('update-fornecedor').click();
    });
    expect(services.updateFornecedor).toHaveBeenCalledWith('emp-1', 'fn1', { nome: 'Forn2' });
  });

  it('removerFornecedor delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('remove-fornecedor').click();
    });
    expect(services.deleteFornecedor).toHaveBeenCalledWith('emp-1', 'fn1');
  });

  it('adicionarBanco delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('add-banco').click();
    });
    expect(services.addBanco).toHaveBeenCalledWith('emp-1', { nome: 'Banco' });
  });

  it('atualizarBanco delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('update-banco').click();
    });
    expect(services.updateBanco).toHaveBeenCalledWith('emp-1', 'b1', { nome: 'Banco2' });
  });

  it('removerBanco delegates to service', async () => {
    render(<HotelProvider><TestConsumer /></HotelProvider>);
    await act(async () => {
      screen.getByTestId('remove-banco').click();
    });
    expect(services.deleteBanco).toHaveBeenCalledWith('emp-1', 'b1');
  });
});

describe('useHotel outside provider', () => {
  it('throws when used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useHotel deve ser usado dentro de HotelProvider');
    spy.mockRestore();
  });
});

describe('getDisponibilidade', () => {
  it('returns availability map for a date', async () => {
    // Setup quartos and reservas data
    services.onQuartos.mockImplementation((id, cb) => {
      cb([
        { id: 'q1', status: 'disponivel' },
        { id: 'q2', status: 'disponivel' },
        { id: 'q3', status: 'manutencao' },
      ]);
      return () => {};
    });
    services.onReservas.mockImplementation((id, cb) => {
      cb([
        { id: 'r1', quartoId: 'q1', status: 'ativa', dataCheckIn: '2026-03-01', dataCheckOut: '2026-03-05' },
        { id: 'r2', quartoId: 'q2', status: 'cancelada', dataCheckIn: '2026-03-01', dataCheckOut: '2026-03-05' },
      ]);
      return () => {};
    });

    function DisponibilidadeConsumer() {
      const { getDisponibilidade } = useHotel();
      const disp = getDisponibilidade('2026-03-02');
      return (
        <div>
          <span data-testid="q1">{disp['q1']}</span>
          <span data-testid="q2">{disp['q2']}</span>
          <span data-testid="q3">{disp['q3']}</span>
        </div>
      );
    }

    render(<HotelProvider><DisponibilidadeConsumer /></HotelProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('q1').textContent).toBe('ocupado');
      expect(screen.getByTestId('q2').textContent).toBe('disponivel'); // cancelada ignored
      expect(screen.getByTestId('q3').textContent).toBe('manutencao'); // no active reserva, keeps status
    });
  });

  it('handles Date object input', async () => {
    services.onQuartos.mockImplementation((id, cb) => {
      cb([{ id: 'q1', status: 'disponivel' }]);
      return () => {};
    });
    services.onReservas.mockImplementation((id, cb) => {
      cb([]);
      return () => {};
    });

    function DateConsumer() {
      const { getDisponibilidade } = useHotel();
      const disp = getDisponibilidade(new Date('2026-03-02'));
      return <span data-testid="q1">{disp['q1']}</span>;
    }

    render(<HotelProvider><DateConsumer /></HotelProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('q1').textContent).toBe('disponivel');
    });
  });
});
