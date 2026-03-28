import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardStats } from '../useDashboardStats';

describe('useDashboardStats', () => {
  const TODAY = new Date(2026, 2, 28, 12, 0, 0); // 2026-03-28
  const THIS_MONTH = TODAY.getMonth();
  const THIS_YEAR = TODAY.getFullYear();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const quartos = [
    { id: 'q1', status: 'ocupado', numero: 101 },
    { id: 'q2', status: 'disponivel', numero: 102 },
    { id: 'q3', status: 'limpeza', numero: 103 },
    { id: 'q4', status: 'ocupado', numero: 104 },
  ];

  const makeReserva = (overrides) => ({
    id: 'r1',
    status: 'confirmada',
    valorTotal: 500,
    criadoEm: new Date(THIS_YEAR, THIS_MONTH, 10),
    dataCheckIn: new Date(THIS_YEAR, THIS_MONTH, 15),
    dataCheckOut: new Date(THIS_YEAR, THIS_MONTH, 20),
    numeroQuarto: '101',
    ...overrides,
  });

  const makeDespesa = (overrides) => ({
    id: 'd1',
    valor: 200,
    data: new Date(THIS_YEAR, THIS_MONTH, 5),
    status: 'pago',
    ...overrides,
  });

  it('should calculate room counts correctly', () => {
    const { result } = renderHook(() => useDashboardStats(quartos, [], []));

    expect(result.current.total).toBe(4);
    expect(result.current.ocupados).toBe(2);
    expect(result.current.disponiveis).toBe(1);
  });

  it('should calculate occupancy rate as percentage', () => {
    const { result } = renderHook(() => useDashboardStats(quartos, [], []));

    expect(result.current.taxaOcupacao).toBe(50); // 2/4 = 50%
  });

  it('should return zero occupancy rate when no rooms', () => {
    const { result } = renderHook(() => useDashboardStats([], [], []));

    expect(result.current.taxaOcupacao).toBe(0);
  });

  it('should handle empty arrays gracefully', () => {
    const { result } = renderHook(() => useDashboardStats([], [], []));

    expect(result.current.total).toBe(0);
    expect(result.current.ocupados).toBe(0);
    expect(result.current.disponiveis).toBe(0);
    expect(result.current.receitaMes).toBe(0);
    expect(result.current.despesasMes).toBe(0);
    expect(result.current.checkinsHoje).toBe(0);
    expect(result.current.checkoutsHoje).toBe(0);
  });

  it('should calculate receitaMes from non-cancelled reservas in current month', () => {
    const reservas = [
      makeReserva({ id: 'r1', valorTotal: 500 }),
      makeReserva({ id: 'r2', valorTotal: 300 }),
      makeReserva({ id: 'r3', valorTotal: 100, status: 'cancelada' }),
    ];

    const { result } = renderHook(() => useDashboardStats(quartos, reservas, []));

    expect(result.current.receitaMes).toBe(800); // 500 + 300, excluding cancelled
  });

  it('should exclude reservas from other months in receitaMes', () => {
    const reservas = [
      makeReserva({ id: 'r1', valorTotal: 500 }),
      makeReserva({ id: 'r2', valorTotal: 300, criadoEm: new Date(THIS_YEAR, THIS_MONTH - 1, 10) }),
    ];

    const { result } = renderHook(() => useDashboardStats(quartos, reservas, []));

    expect(result.current.receitaMes).toBe(500);
  });

  it('should calculate despesasMes from expenses in current month', () => {
    const despesas = [
      makeDespesa({ id: 'd1', valor: 200 }),
      makeDespesa({ id: 'd2', valor: 150 }),
      makeDespesa({ id: 'd3', valor: 100, data: new Date(THIS_YEAR, THIS_MONTH - 1, 5) }),
    ];

    const { result } = renderHook(() => useDashboardStats(quartos, [], despesas));

    expect(result.current.despesasMes).toBe(350); // 200 + 150, excluding other month
  });

  it('should count checkinsHoje for confirmed reservas with today check-in', () => {
    const reservas = [
      makeReserva({ id: 'r1', dataCheckIn: TODAY, status: 'confirmada' }),
      makeReserva({ id: 'r2', dataCheckIn: TODAY, status: 'confirmada' }),
      makeReserva({ id: 'r3', dataCheckIn: TODAY, status: 'checkin' }), // already checked in
    ];

    const { result } = renderHook(() => useDashboardStats(quartos, reservas, []));

    expect(result.current.checkinsHoje).toBe(2);
  });

  it('should count checkoutsHoje for checkin-status reservas with today check-out', () => {
    const reservas = [
      makeReserva({ id: 'r1', dataCheckOut: TODAY, status: 'checkin' }),
      makeReserva({ id: 'r2', dataCheckOut: TODAY, status: 'confirmada' }), // not checked in yet
    ];

    const { result } = renderHook(() => useDashboardStats(quartos, reservas, []));

    expect(result.current.checkoutsHoje).toBe(1);
  });

  it('should compute statusCounts for all room statuses', () => {
    const { result } = renderHook(() => useDashboardStats(quartos, [], []));

    expect(result.current.statusCounts).toEqual({
      ocupado: 2,
      disponivel: 1,
      limpeza: 1,
    });
  });

  it('should compute maisPedidos sorted by usage descending', () => {
    const reservas = [
      makeReserva({ id: 'r1', numeroQuarto: '101' }),
      makeReserva({ id: 'r2', numeroQuarto: '101' }),
      makeReserva({ id: 'r3', numeroQuarto: '102' }),
      makeReserva({ id: 'r4', numeroQuarto: '101', status: 'cancelada' }), // excluded
    ];

    const { result } = renderHook(() => useDashboardStats(quartos, reservas, []));

    expect(result.current.maisPedidos[0].num).toBe('101');
    expect(result.current.maisPedidos[0].qtd).toBe(2);
  });

  it('should include rooms with zero reservas in menosPedidos', () => {
    const reservas = [
      makeReserva({ id: 'r1', numeroQuarto: '101' }),
    ];

    const { result } = renderHook(() => useDashboardStats(quartos, reservas, []));
    const nums = result.current.menosPedidos.map(q => q.num);

    // Rooms 102, 103, 104 have 0 reservas
    expect(nums).toContain('102');
    expect(nums).toContain('103');
    expect(nums).toContain('104');
  });

  it('should generate ultimos7 array with 7 entries', () => {
    const { result } = renderHook(() => useDashboardStats(quartos, [], []));

    expect(result.current.ultimos7).toHaveLength(7);
    result.current.ultimos7.forEach(entry => {
      expect(entry).toHaveProperty('dia');
      expect(entry).toHaveProperty('receita');
    });
  });

  it('should identify contasVencidas as pending expenses before today', () => {
    const despesas = [
      makeDespesa({ id: 'd1', status: 'pendente', data: new Date(2026, 2, 20) }), // past, pending
      makeDespesa({ id: 'd2', status: 'pendente', data: new Date(2026, 2, 30) }), // future, pending
      makeDespesa({ id: 'd3', status: 'pago', data: new Date(2026, 2, 20) }),      // past, paid
    ];

    const { result } = renderHook(() => useDashboardStats(quartos, [], despesas));

    expect(result.current.contasVencidas).toHaveLength(1);
    expect(result.current.contasVencidas[0].id).toBe('d1');
  });

  it('should identify contasHoje as pending expenses due today', () => {
    const despesas = [
      makeDespesa({ id: 'd1', status: 'pendente', data: TODAY }),
      makeDespesa({ id: 'd2', status: 'pago', data: TODAY }),
    ];

    const { result } = renderHook(() => useDashboardStats(quartos, [], despesas));

    expect(result.current.contasHoje).toHaveLength(1);
    expect(result.current.contasHoje[0].id).toBe('d1');
  });
});
