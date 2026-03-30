import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReservaForm } from '../useReservaForm';

const quartos = [
  { id: 'q1', numero: 101, precoDiaria: 200, status: 'disponivel' },
  { id: 'q2', numero: 202, precoDiaria: 400, status: 'ocupado' },
];

const mockAdicionarReserva = vi.fn().mockResolvedValue('r-new');
const mockAtualizarReserva = vi.fn().mockResolvedValue();
const mockAdicionarFatura = vi.fn().mockResolvedValue('ft-new');

const hookArgs = () => ({
  quartos,
  adicionarReserva: mockAdicionarReserva,
  atualizarReserva: mockAtualizarReserva,
  adicionarFatura: mockAdicionarFatura,
});

describe('useReservaForm (expanded)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('abrirNovo resets form and sets modal', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const setModal = vi.fn();
    act(() => result.current.abrirNovo(setModal));
    expect(setModal).toHaveBeenCalledWith('form');
    expect(result.current.editId).toBeNull();
  });

  it('abrirEditar populates form from reserva', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const setModal = vi.fn();
    const reserva = {
      id: 'r1',
      nomeHospede: 'Joao',
      email: 'joao@test.com',
      telefone: '99999',
      cpf: '000.000.000-00',
      quartoId: 'q1',
      numeroQuarto: '101',
      dataCheckIn: '2026-03-01',
      dataCheckOut: '2026-03-05',
      adultos: 2,
      criancas: 1,
      valorTotal: 800,
      formaPagamento: 'pix',
      observacoes: 'VIP',
      status: 'ativa',
    };
    act(() => result.current.abrirEditar(reserva, setModal));
    expect(setModal).toHaveBeenCalledWith('form');
    expect(result.current.form.nomeHospede).toBe('Joao');
    expect(result.current.editId).toBe('r1');
  });

  it('abrirEditar uses fallback fields', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const setModal = vi.fn();
    const reserva = {
      id: 'r2',
      hospede: { nome: 'Maria', email: 'maria@x.com', telefone: '888', cpf: '111' },
      quartoNumero: '202',
    };
    act(() => result.current.abrirEditar(reserva, setModal));
    expect(result.current.form.nomeHospede).toBe('Maria');
    expect(result.current.form.email).toBe('maria@x.com');
    expect(result.current.form.numeroQuarto).toBe('202');
  });

  it('abrirPagamento sets form with payment defaults', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const setModal = vi.fn();
    const reserva = {
      id: 'r1',
      nomeHospede: 'Joao',
      valorTotal: 500,
      formaPagamento: 'cartao_credito',
      dataCheckOut: '2026-03-05',
    };
    act(() => result.current.abrirPagamento(reserva, setModal));
    expect(setModal).toHaveBeenCalledWith('pagamento');
    expect(result.current.form.valorTotal).toBe(500);
    expect(result.current.editId).toBe('r1');
  });

  it('calcularValor sets valorTotal based on diarias', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    act(() => {
      result.current.setForm(p => ({ ...p, quartoId: 'q1', dataCheckIn: '2026-03-01', dataCheckOut: '2026-03-04' }));
    });
    act(() => result.current.calcularValor('q1', '2026-03-01', '2026-03-04'));
    expect(result.current.form.valorTotal).toBe('600.00'); // 3 days * 200
    expect(result.current.form.numeroQuarto).toBe(101);
  });

  it('calcularValor returns early if quarto not found', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    act(() => result.current.calcularValor('q-unknown', '2026-03-01', '2026-03-04'));
    // No crash, form unchanged
    expect(result.current.form.valorTotal).toBe('');
  });

  it('calcularValor returns early if dates missing', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    act(() => result.current.calcularValor('q1', '', ''));
    expect(result.current.form.valorTotal).toBe('');
  });

  it('isCartao returns true for cartao_credito and cartao_debito', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    expect(result.current.isCartao('cartao_credito')).toBe(true);
    expect(result.current.isCartao('cartao_debito')).toBe(true);
    expect(result.current.isCartao('pix')).toBe(false);
    expect(result.current.isCartao('dinheiro')).toBe(false);
  });

  it('calcularValorFinal sums base + extra - desconto', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    act(() => {
      result.current.setForm(p => ({ ...p, valorTotal: '500', valorExtra: '50', desconto: '30' }));
    });
    expect(result.current.calcularValorFinal()).toBe(520);
  });

  it('calcularValorFinal returns 0 minimum', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    act(() => {
      result.current.setForm(p => ({ ...p, valorTotal: '10', valorExtra: '0', desconto: '100' }));
    });
    expect(result.current.calcularValorFinal()).toBe(0);
  });

  it('salvar calls adicionarReserva for new reservation', async () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const setModal = vi.fn();
    act(() => {
      result.current.setForm(p => ({
        ...p,
        nomeHospede: 'Test',
        valorTotal: '300',
        dataCheckIn: '2026-03-01',
        dataCheckOut: '2026-03-03',
      }));
    });
    await act(async () => { await result.current.salvar(setModal); });
    expect(mockAdicionarReserva).toHaveBeenCalled();
    expect(setModal).toHaveBeenCalledWith(null);
  });

  it('salvar calls atualizarReserva when editId set', async () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const setModal = vi.fn();
    act(() => {
      result.current.abrirEditar({
        id: 'r1', nomeHospede: 'X', valorTotal: 200,
        dataCheckIn: '2026-03-01', dataCheckOut: '2026-03-03',
      }, vi.fn());
    });
    await act(async () => { await result.current.salvar(setModal); });
    expect(mockAtualizarReserva).toHaveBeenCalledWith('r1', expect.any(Object));
  });

  it('salvar shows alert on error', async () => {
    mockAdicionarReserva.mockRejectedValue(new Error('fail'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const setModal = vi.fn();
    act(() => {
      result.current.setForm(p => ({ ...p, nomeHospede: 'X', valorTotal: '100' }));
    });
    await act(async () => { await result.current.salvar(setModal); });
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('fail'));
    alertSpy.mockRestore();
  });

  it('salvarPagamento does nothing if editId is null', async () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const setModal = vi.fn();
    const setReciboData = vi.fn();
    await act(async () => { await result.current.salvarPagamento(setModal, setReciboData); });
    expect(mockAtualizarReserva).not.toHaveBeenCalled();
  });

  it('salvarPagamento creates fatura for faturado payment', async () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const setModal = vi.fn();
    const setReciboData = vi.fn();
    act(() => {
      result.current.abrirEditar({
        id: 'r1', nomeHospede: 'Joao', valorTotal: 500,
        dataCheckIn: '2026-03-01', dataCheckOut: '2026-03-05',
      }, vi.fn());
    });
    act(() => {
      result.current.setForm(p => ({
        ...p,
        formaPagamento: 'faturado',
        faturadoCnpj: '00.000',
        faturadoEmpresa: 'Corp X',
        valorTotal: '500',
      }));
    });
    await act(async () => { await result.current.salvarPagamento(setModal, setReciboData); });
    expect(mockAdicionarFatura).toHaveBeenCalled();
    expect(mockAtualizarReserva).toHaveBeenCalledWith('r1', expect.objectContaining({ isFaturado: true }));
    expect(setReciboData).toHaveBeenCalled();
    expect(setModal).toHaveBeenCalledWith('recibo');
  });

  it('salvarPagamento sets recibo data correctly', async () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const setModal = vi.fn();
    const setReciboData = vi.fn();
    act(() => {
      result.current.abrirEditar({
        id: 'r1', nomeHospede: 'Maria', valorTotal: 400,
        dataCheckIn: '2026-03-10', dataCheckOut: '2026-03-15',
        cpf: '999', telefone: '111', email: 'x@y.com',
        numeroQuarto: '101', adultos: 2, criancas: 1,
        observacoes: 'VIP',
      }, vi.fn());
    });
    act(() => {
      result.current.setForm(p => ({
        ...p, formaPagamento: 'pix', valorTotal: '400',
        valorExtra: '50', desconto: '20',
      }));
    });
    await act(async () => { await result.current.salvarPagamento(setModal, setReciboData); });
    const recibo = setReciboData.mock.calls[0][0];
    expect(recibo.nomeHospede).toBe('Maria');
    expect(recibo.valorFinal).toBe(430); // 400 + 50 - 20
    expect(recibo.formaPagamento).toBe('pix');
  });

  it('set helper creates onChange handler', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const handler = result.current.set('nomeHospede');
    act(() => handler({ target: { value: 'Test' } }));
    expect(result.current.form.nomeHospede).toBe('Test');
  });

  it('setUpper helper uppercases value', () => {
    const { result } = renderHook(() => useReservaForm(hookArgs()));
    const handler = result.current.setUpper('nomeHospede');
    act(() => handler({ target: { value: 'joao silva' } }));
    expect(result.current.form.nomeHospede).toBe('JOAO SILVA');
  });
});
