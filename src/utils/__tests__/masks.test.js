import { describe, it, expect } from 'vitest';
import { maskCPF, maskCNPJ, maskPhone } from '../masks';

describe('maskCPF', () => {
  it('should format complete CPF', () => {
    expect(maskCPF('12345678901')).toBe('123.456.789-01');
  });
  it('should handle partial CPF', () => {
    expect(maskCPF('123')).toBe('123');
  });
  it('should handle empty', () => {
    expect(maskCPF('')).toBe('');
  });
});

describe('maskCNPJ', () => {
  it('should format complete CNPJ', () => {
    expect(maskCNPJ('12345678000190')).toBe('12.345.678/0001-90');
  });
  it('should handle empty', () => {
    expect(maskCNPJ('')).toBe('');
  });
});

describe('maskPhone', () => {
  it('should format cellphone with 11 digits', () => {
    expect(maskPhone('11999887766')).toBe('(11) 99988-7766');
  });
  it('should format landline with 10 digits', () => {
    expect(maskPhone('1133445566')).toBe('(11) 3344-5566');
  });
  it('should handle empty', () => {
    expect(maskPhone('')).toBe('');
  });
});
