import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDREData, getGrupo, GRUPOS_DESPESA } from '../useDREData';

describe('getGrupo', () => {
  it('should return correct group for known categories', () => {
    expect(getGrupo('Salários')).toBe('Pessoal');
    expect(getGrupo('Energia')).toBe('Utilidades');
    expect(getGrupo('Alimentação')).toBe('Operacional');
    expect(getGrupo('Marketing')).toBe('Comercial');
    expect(getGrupo('Aluguel')).toBe('Infraestrutura');
    expect(getGrupo('Impostos')).toBe('Fiscal');
  });

  it('should return Outros for unknown categories', () => {
    expect(getGrupo('Transporte')).toBe('Outros');
    expect(getGrupo('Random')).toBe('Outros');
  });

  it('should return Outros for null or undefined', () => {
    expect(getGrupo(null)).toBe('Outros');
    expect(getGrupo(undefined)).toBe('Outros');
  });

  it('should match case-insensitively', () => {
    expect(getGrupo('ENERGIA ELETRICA')).toBe('Utilidades');
    expect(getGrupo('limpeza geral')).toBe('Operacional');
  });
});

describe('useDREData', () => {
  const ANO = 2026;
  const MES = 2; // March (0-indexed)

  const makeReserva = (overrides) => ({
    id: 'r1',
    dataCheckIn: new Date(ANO, MES, 10),
    valorTotal: 1000,
    formaPagamento: 'pix',
    status: 'checkout',
    ...overrides,
  });

  const makeDespesa = (overrides) => ({
    id: 'd1',
    data: new Date(ANO, MES, 5),
    valor: 200,
    categoria: 'Energia',
    descricao: 'Conta de luz',
    status: 'pago',
    ...overrides,
  });

  const makeFluxo = (overrides) => ({
    id: 'f1',
    data: new Date(ANO, MES, 10),
    tipo: 'entrada',
    valor: 1500,
    ...overrides,
  });

  it('should calculate receita from fluxo de caixa when available', () => {
    const fluxo = [
      makeFluxo({ id: 'f1', valor: 1500 }),
      makeFluxo({ id: 'f2', valor: 500 }),
    ];

    const { result } = renderHook(() => useDREData([], [], fluxo, ANO, MES));

    expect(result.current.receita).toBe(2000);
  });

  it('should fallback to reservas revenue when fluxo is empty', () => {
    const reservas = [
      makeReserva({ id: 'r1', valorTotal: 1000 }),
      makeReserva({ id: 'r2', valorTotal: 500, valorFinal: 450 }),
    ];

    const { result } = renderHook(() => useDREData(reservas, [], [], ANO, MES));

    expect(result.current.receita).toBe(1450); // 1000 + 450 (valorFinal preferred)
  });

  it('should exclude reservas with a_definir payment', () => {
    const reservas = [
      makeReserva({ id: 'r1', valorTotal: 1000 }),
      makeReserva({ id: 'r2', valorTotal: 500, formaPagamento: 'a_definir' }),
    ];

    const { result } = renderHook(() => useDREData(reservas, [], [], ANO, MES));

    expect(result.current.receita).toBe(1000);
  });

  it('should calculate despesaTotal from filtered expenses', () => {
    const despesas = [
      makeDespesa({ id: 'd1', valor: 200 }),
      makeDespesa({ id: 'd2', valor: 100 }),
      makeDespesa({ id: 'd3', valor: 50, status: 'cancelado' }), // excluded
    ];

    const { result } = renderHook(() => useDREData([], despesas, [], ANO, MES));

    expect(result.current.despesaTotal).toBe(300);
  });

  it('should calculate lucro as receita minus despesaTotal', () => {
    const fluxo = [makeFluxo({ valor: 1000 })];
    const despesas = [makeDespesa({ valor: 400 })];

    const { result } = renderHook(() => useDREData([], despesas, fluxo, ANO, MES));

    expect(result.current.lucro).toBe(600);
  });

  it('should calculate margem as percentage of lucro over receita', () => {
    const fluxo = [makeFluxo({ valor: 1000 })];
    const despesas = [makeDespesa({ valor: 400 })];

    const { result } = renderHook(() => useDREData([], despesas, fluxo, ANO, MES));

    expect(result.current.margem).toBe(60); // 600/1000 * 100
  });

  it('should return zero margem when receita is zero', () => {
    const { result } = renderHook(() => useDREData([], [], [], ANO, MES));

    expect(result.current.margem).toBe(0);
  });

  it('should group expenses by categoria into grupos', () => {
    const despesas = [
      makeDespesa({ id: 'd1', categoria: 'Energia', valor: 200 }),
      makeDespesa({ id: 'd2', categoria: 'Agua total', valor: 100 }),
      makeDespesa({ id: 'd3', categoria: 'Alimentação', valor: 300 }),
    ];

    const { result } = renderHook(() => useDREData([], despesas, [], ANO, MES));

    const grupoNames = result.current.grupos.map(g => g.grupo);
    expect(grupoNames).toContain('Utilidades');
    expect(grupoNames).toContain('Operacional');
  });

  it('should generate 12-month dadosMensais array', () => {
    const { result } = renderHook(() => useDREData([], [], [], ANO, null));

    expect(result.current.dadosMensais).toHaveLength(12);
    result.current.dadosMensais.forEach(entry => {
      expect(entry).toHaveProperty('mes');
      expect(entry).toHaveProperty('receita');
      expect(entry).toHaveProperty('despesa');
      expect(entry).toHaveProperty('lucro');
    });
  });

  it('should filter by year only when mesSel is null', () => {
    const fluxo = [
      makeFluxo({ id: 'f1', valor: 500, data: new Date(ANO, 0, 10) }),  // Jan
      makeFluxo({ id: 'f2', valor: 300, data: new Date(ANO, MES, 10) }), // Mar
      makeFluxo({ id: 'f3', valor: 200, data: new Date(ANO - 1, MES, 10) }), // last year
    ];

    const { result } = renderHook(() => useDREData([], [], fluxo, ANO, null));

    expect(result.current.receita).toBe(800); // 500 + 300, excluding last year
  });

  it('should return undefined tendencia when mesSel is 0 (January)', () => {
    const { result } = renderHook(() => useDREData([], [], [], ANO, 0));

    expect(result.current.tendenciaReceita).toBeUndefined();
    expect(result.current.tendenciaDespesa).toBeUndefined();
  });

  it('should handle empty data gracefully', () => {
    const { result } = renderHook(() => useDREData([], [], [], ANO, MES));

    expect(result.current.receita).toBe(0);
    expect(result.current.despesaTotal).toBe(0);
    expect(result.current.lucro).toBe(0);
    expect(result.current.grupos).toEqual([]);
  });
});
