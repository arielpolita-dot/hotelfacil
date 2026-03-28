import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFaturaForm, tiposContrato, periodicidades, statusOptions } from '../useFaturaForm';

describe('useFaturaForm', () => {
  it('should initialize with empty form state', () => {
    const { result } = renderHook(() => useFaturaForm());

    expect(result.current.formData.empresaCliente).toBe('');
    expect(result.current.formData.tipoContrato).toBe('Mensal');
    expect(result.current.formData.periodicidadeFatura).toBe('Mensal');
    expect(result.current.formData.quartosInclusos).toEqual([]);
    expect(result.current.editingFatura).toBeNull();
  });

  it('should calculate valorTotal for Mensal contract', () => {
    const { result } = renderHook(() => useFaturaForm());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'valorMensal', value: '1000', type: 'text' },
      });
    });

    expect(result.current.valorTotal).toBe(1000); // 1 * 1000
  });

  it('should calculate valorTotal for Trimestral contract', () => {
    const { result } = renderHook(() => useFaturaForm());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'valorMensal', value: '1000', type: 'text' },
      });
      result.current.handleInputChange({
        target: { name: 'tipoContrato', value: 'Trimestral', type: 'text' },
      });
    });

    expect(result.current.valorTotal).toBe(3000); // 3 * 1000
  });

  it('should calculate valorTotal for Semestral contract', () => {
    const { result } = renderHook(() => useFaturaForm());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'valorMensal', value: '500', type: 'text' },
      });
      result.current.handleInputChange({
        target: { name: 'tipoContrato', value: 'Semestral', type: 'text' },
      });
    });

    expect(result.current.valorTotal).toBe(3000); // 6 * 500
  });

  it('should calculate valorTotal for Anual contract', () => {
    const { result } = renderHook(() => useFaturaForm());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'valorMensal', value: '800', type: 'text' },
      });
      result.current.handleInputChange({
        target: { name: 'tipoContrato', value: 'Anual', type: 'text' },
      });
    });

    expect(result.current.valorTotal).toBe(9600); // 12 * 800
  });

  it('should handle non-numeric valorMensal as zero', () => {
    const { result } = renderHook(() => useFaturaForm());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'valorMensal', value: 'abc', type: 'text' },
      });
    });

    expect(result.current.valorTotal).toBe(0);
  });

  it('should calculate proximaFatura for Mensal periodicity (30 days)', () => {
    const { result } = renderHook(() => useFaturaForm());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'dataInicio', value: '2026-03-01', type: 'text' },
      });
    });

    expect(result.current.proximaFatura).toBe('2026-03-31');
  });

  it('should calculate proximaFatura for Quinzenal periodicity (15 days)', () => {
    const { result } = renderHook(() => useFaturaForm());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'dataInicio', value: '2026-03-01', type: 'text' },
      });
      result.current.handleInputChange({
        target: { name: 'periodicidadeFatura', value: 'Quinzenal', type: 'text' },
      });
    });

    expect(result.current.proximaFatura).toBe('2026-03-16');
  });

  it('should return empty proximaFatura when dataInicio is empty', () => {
    const { result } = renderHook(() => useFaturaForm());

    expect(result.current.proximaFatura).toBe('');
  });

  it('should add quartoId to quartosInclusos on checkbox check', () => {
    const { result } = renderHook(() => useFaturaForm());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'quartosInclusos', value: '5', type: 'checkbox', checked: true },
      });
    });

    expect(result.current.formData.quartosInclusos).toContain(5);
  });

  it('should remove quartoId from quartosInclusos on checkbox uncheck', () => {
    const { result } = renderHook(() => useFaturaForm());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'quartosInclusos', value: '5', type: 'checkbox', checked: true },
      });
      result.current.handleInputChange({
        target: { name: 'quartosInclusos', value: '5', type: 'checkbox', checked: false },
      });
    });

    expect(result.current.formData.quartosInclusos).not.toContain(5);
  });

  it('should reset form to initial state', () => {
    const { result } = renderHook(() => useFaturaForm());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'empresaCliente', value: 'Empresa X', type: 'text' },
      });
      result.current.resetForm();
    });

    expect(result.current.formData.empresaCliente).toBe('');
    expect(result.current.editingFatura).toBeNull();
  });

  it('should populate form when handleEdit is called', () => {
    const { result } = renderHook(() => useFaturaForm());
    const fatura = {
      empresaCliente: 'Hotel Corp',
      cnpj: '12345678000199',
      contato: 'Maria',
      email: 'maria@corp.com',
      telefone: '11999998888',
      endereco: 'Rua A, 100',
      tipoContrato: 'Semestral',
      dataInicio: '2026-01-01',
      dataFim: '2026-06-30',
      periodicidadeFatura: 'Mensal',
      valorMensal: 2000,
      quartosInclusos: [1, 2, 3],
      observacoes: 'VIP',
      status: 'Ativo',
      id: 'f1',
    };

    act(() => {
      result.current.handleEdit(fatura);
    });

    expect(result.current.editingFatura).toBe(fatura);
    expect(result.current.formData.empresaCliente).toBe('Hotel Corp');
    expect(result.current.formData.valorMensal).toBe('2000');
    expect(result.current.formData.quartosInclusos).toEqual([1, 2, 3]);
  });

  it('should build complete fatura data from form', () => {
    const { result } = renderHook(() => useFaturaForm());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'empresaCliente', value: 'Corp ABC', type: 'text' },
      });
      result.current.handleInputChange({
        target: { name: 'valorMensal', value: '1500', type: 'text' },
      });
      result.current.handleInputChange({
        target: { name: 'dataInicio', value: '2026-04-01', type: 'text' },
      });
    });

    const data = result.current.buildFaturaData();

    expect(data.empresaCliente).toBe('Corp ABC');
    expect(data.valorMensal).toBe(1500);
    expect(data.valorTotal).toBe(1500); // Mensal * 1
    expect(data.proximaFatura).toBeTruthy();
    expect(data.id).toBeTruthy();
  });
});

describe('exported constants', () => {
  it('should export tiposContrato with all types', () => {
    expect(tiposContrato).toEqual(['Mensal', 'Trimestral', 'Semestral', 'Anual']);
  });

  it('should export periodicidades', () => {
    expect(periodicidades).toEqual(['Quinzenal', 'Mensal', 'Bimestral', 'Trimestral']);
  });

  it('should export statusOptions', () => {
    expect(statusOptions).toEqual(['Ativo', 'Suspenso', 'Cancelado', 'Vencido']);
  });
});
