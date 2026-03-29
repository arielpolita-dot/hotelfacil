import { describe, it, expect } from 'vitest';
import { toDate, toDateString, safeFormat } from '../dateUtils';

describe('toDate', () => {
  it('returns null for null', () => {
    expect(toDate(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(toDate(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(toDate('')).toBeNull();
  });

  it('returns null for 0', () => {
    expect(toDate(0)).toBeNull();
  });

  it('converts Firestore Timestamp-like object', () => {
    const ts = { toDate: () => new Date(2026, 0, 15) };
    const result = toDate(ts);
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it('returns null when Firestore .toDate() returns invalid date', () => {
    const ts = { toDate: () => new Date('invalid') };
    expect(toDate(ts)).toBeNull();
  });

  it('normalizes Date to local midnight', () => {
    const d = new Date(2026, 5, 10, 14, 30, 45);
    const result = toDate(d);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it('returns null for invalid Date object', () => {
    expect(toDate(new Date('invalid'))).toBeNull();
  });

  it('converts YYYY-MM-DD string without UTC shift', () => {
    const result = toDate('2026-03-15');
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(0);
  });

  it('converts full ISO string', () => {
    const result = toDate('2026-06-20T15:30:00Z');
    expect(result).toBeInstanceOf(Date);
    expect(result.getHours()).toBe(0); // normalized to midnight
  });

  it('converts number timestamp', () => {
    const ts = new Date(2026, 3, 10).getTime();
    const result = toDate(ts);
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(10);
  });
});

describe('toDateString', () => {
  it('converts Date to YYYY-MM-DD', () => {
    const result = toDateString(new Date(2026, 2, 15));
    expect(result).toBe('2026-03-15');
  });

  it('pads single-digit month and day', () => {
    const result = toDateString(new Date(2026, 0, 5));
    expect(result).toBe('2026-01-05');
  });

  it('returns null for null input', () => {
    expect(toDateString(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(toDateString(undefined)).toBeNull();
  });

  it('returns null for invalid date', () => {
    expect(toDateString(new Date('invalid'))).toBeNull();
  });

  it('converts YYYY-MM-DD string back to itself', () => {
    expect(toDateString('2026-07-04')).toBe('2026-07-04');
  });
});

describe('safeFormat', () => {
  it('returns fallback dash for null', () => {
    expect(safeFormat(null)).toBe('\u2014');
  });

  it('returns fallback dash for undefined', () => {
    expect(safeFormat(undefined)).toBe('\u2014');
  });

  it('returns custom fallback when provided', () => {
    expect(safeFormat(null, undefined, { fallback: 'N/A' })).toBe('N/A');
  });

  it('formats valid date with pt-BR locale', () => {
    const result = safeFormat(new Date(2026, 0, 15));
    expect(result).toBeTruthy();
    expect(result).not.toBe('\u2014');
    // pt-BR format: 15/01/2026
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });

  it('uses custom format function when provided', () => {
    const customFormat = (d) => `custom-${d.getFullYear()}`;
    const result = safeFormat(new Date(2026, 0, 1), 'dd/MM/yyyy', { format: customFormat });
    expect(result).toBe('custom-2026');
  });

  it('returns fallback when custom format throws', () => {
    const badFormat = () => { throw new Error('bad'); };
    const result = safeFormat(new Date(2026, 0, 1), 'dd/MM', { format: badFormat });
    expect(result).toBe('\u2014');
  });

  it('returns custom fallback when custom format throws', () => {
    const badFormat = () => { throw new Error('bad'); };
    const result = safeFormat(new Date(2026, 0, 1), 'dd/MM', { format: badFormat, fallback: '-' });
    expect(result).toBe('-');
  });
});
