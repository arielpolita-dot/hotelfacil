import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReservaForm } from '../useReservaForm';

describe('useReservaForm', () => {
  const quartos = [
    { id: 'q1', numero: 101, precoDiaria: 200 },
    { id: 'q2', numero: 102, precoDiaria: 350 },
  ];

  const defaults = {
    quartos,
    adicionarReserva: vi.fn().mockResolvedValue(undefined),
    atualizarReserva: vi.fn().mockResolvedValue(undefined),
    adicionarFatura: vi.fn().mockResolvedValue(undefined),
  };

  const setup = (overrides = {}) =>
    renderHook(() => useReservaForm({ ...defaults, ...overrides }));

  it('should initialize with empty form state', () => {
    const { result } = setup();

    expect(result.current.form.nomeHospede).toBe('');
    expect(result.current.form.adultos).toBe(1);
    expect(result.current.form.criancas).toBe(0);
    expect(result.current.form.formaPagamento).toBe('a_definir');
    expect(result.current.editId).toBeNull();
  });

  it('should reset form and open modal when abrirNovo is called', () => {
    const { result } = setup();
    const setModal = vi.fn();

    act(() => {
      result.current.abrirNovo(setModal);
    });

    expect(setModal).toHaveBeenCalledWith('form');
    expect(result.current.editId).toBeNull();
    expect(result.current.form.nomeHospede).toBe('');
  });

  it('should populate form when abrirEditar is called', () => {
    const { result } = setup();
    const setModal = vi.fn();
    const reserva = {
      id: 'r1',
      nomeHospede: 'Joao Silva',
      email: 'joao@email.com',
      quartoId: 'q1',
      valorTotal: 600,
      dataCheckIn: '2026-03-10',
      dataCheckOut: '2026-03-13',
      adultos: 2,
      criancas: 1,
    };

    act(() => {
      result.current.abrirEditar(reserva, setModal);
    });

    expect(setModal).toHaveBeenCalledWith('form');
    expect(result.current.editId).toBe('r1');
    expect(result.current.form.nomeHospede).toBe('Joao Silva');
    expect(result.current.form.email).toBe('joao@email.com');
    expect(result.current.form.adultos).toBe(2);
  });

  it('should calculate valor based on room rate and days', () => {
    const { result } = setup();

    act(() => {
      result.current.calcularValor('q1', '2026-03-10', '2026-03-13');
    });

    // 3 days * 200/day = 600
    expect(result.current.form.valorTotal).toBe('600.00');
    expect(result.current.form.numeroQuarto).toBe(101);
  });

  it('should not calculate valor when quartoId is missing', () => {
    const { result } = setup();

    act(() => {
      result.current.calcularValor('', '2026-03-10', '2026-03-13');
    });

    expect(result.current.form.valorTotal).toBe('');
  });

  it('should not calculate valor when dates are missing', () => {
    const { result } = setup();

    act(() => {
      result.current.calcularValor('q1', '', '2026-03-13');
    });

    expect(result.current.form.valorTotal).toBe('');
  });

  it('should use minimum 1 day when check-in equals check-out', () => {
    const { result } = setup();

    act(() => {
      result.current.calcularValor('q1', '2026-03-10', '2026-03-10');
    });

    // Math.max(1, 0) = 1 day * 200 = 200
    expect(result.current.form.valorTotal).toBe('200.00');
  });

  it('should identify cartao_credito and cartao_debito as card payments', () => {
    const { result } = setup();

    expect(result.current.isCartao('cartao_credito')).toBe(true);
    expect(result.current.isCartao('cartao_debito')).toBe(true);
    expect(result.current.isCartao('pix')).toBe(false);
    expect(result.current.isCartao('dinheiro')).toBe(false);
  });

  it('should calculate valor final with extras and discounts', () => {
    const { result } = setup();

    act(() => {
      result.current.setVal('valorTotal', '1000');
      result.current.setVal('valorExtra', '200');
      result.current.setVal('desconto', '150');
    });

    expect(result.current.calcularValorFinal()).toBe(1050); // 1000 + 200 - 150
  });

  it('should return zero when discount exceeds total plus extras', () => {
    const { result } = setup();

    act(() => {
      result.current.setVal('valorTotal', '100');
      result.current.setVal('desconto', '500');
    });

    expect(result.current.calcularValorFinal()).toBe(0); // Math.max(0, 100 - 500)
  });

  it('should call adicionarReserva for new reservas on salvar', async () => {
    const adicionarReserva = vi.fn().mockResolvedValue(undefined);
    const { result } = setup({ adicionarReserva });
    const setModal = vi.fn();

    act(() => {
      result.current.setVal('nomeHospede', 'Maria');
      result.current.setVal('quartoId', 'q1');
      result.current.setVal('valorTotal', '500');
    });

    await act(async () => {
      await result.current.salvar(setModal);
    });

    expect(adicionarReserva).toHaveBeenCalled();
    expect(setModal).toHaveBeenCalledWith(null);
  });

  it('should call atualizarReserva for existing reservas on salvar', async () => {
    const atualizarReserva = vi.fn().mockResolvedValue(undefined);
    const { result } = setup({ atualizarReserva });
    const setModal = vi.fn();

    // First open edit mode
    act(() => {
      result.current.abrirEditar(
        { id: 'r1', nomeHospede: 'Joao', valorTotal: 500, dataCheckIn: '2026-03-10', dataCheckOut: '2026-03-13' },
        vi.fn()
      );
    });

    await act(async () => {
      await result.current.salvar(setModal);
    });

    expect(atualizarReserva).toHaveBeenCalledWith('r1', expect.any(Object));
  });

  it('should populate payment form when abrirPagamento is called', () => {
    const { result } = setup();
    const setModal = vi.fn();
    const reserva = {
      id: 'r1',
      nomeHospede: 'Ana',
      valorTotal: 800,
      formaPagamento: 'pix',
      dataCheckOut: '2026-03-15',
    };

    act(() => {
      result.current.abrirPagamento(reserva, setModal);
    });

    expect(setModal).toHaveBeenCalledWith('pagamento');
    expect(result.current.editId).toBe('r1');
    expect(result.current.form.nomeHospede).toBe('Ana');
    expect(result.current.form.valorTotal).toBe(800);
  });
});
