import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../formatters';

describe('formatCurrency', () => {
  it('should format positive number as BRL', () => {
    expect(formatCurrency(1234.56)).toBe('R$\u00a01.234,56');
  });

  it('should format zero as BRL', () => {
    expect(formatCurrency(0)).toContain('0,00');
  });

  it('should handle null/undefined as zero', () => {
    expect(formatCurrency(null)).toContain('0,00');
    expect(formatCurrency(undefined)).toContain('0,00');
  });

  it('should format negative numbers', () => {
    const result = formatCurrency(-100);
    expect(result).toContain('100,00');
  });
});
