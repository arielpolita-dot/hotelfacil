import { describe, it, expect } from 'vitest';
import { buildReservaMap } from '../useReservaMap';

// Helper: create local-midnight dates (avoids UTC timezone shift)
function localDate(yyyy, mm, dd) {
  return new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
}

describe('buildReservaMap', () => {
  it('should return empty map for no reservas', () => {
    const map = buildReservaMap([]);
    expect(map.size).toBe(0);
  });

  it('should map quartoId:dateStr to reserva', () => {
    const reservas = [{
      id: 'r1',
      quartoId: 'q1',
      dataCheckIn: localDate(2026, 3, 1),
      dataCheckOut: localDate(2026, 3, 3),
      status: 'confirmada',
    }];
    const map = buildReservaMap(reservas);
    expect(map.get('q1:2026-03-01')).toBeDefined();
    expect(map.get('q1:2026-03-02')).toBeDefined();
    expect(map.get('q1:2026-03-03')).toBeUndefined(); // checkout day not included
  });

  it('should skip cancelled reservas', () => {
    const reservas = [{
      id: 'r1',
      quartoId: 'q1',
      dataCheckIn: localDate(2026, 3, 1),
      dataCheckOut: localDate(2026, 3, 3),
      status: 'cancelada',
    }];
    const map = buildReservaMap(reservas);
    expect(map.size).toBe(0);
  });
});
