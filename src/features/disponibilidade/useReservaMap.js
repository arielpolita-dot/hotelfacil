import { useMemo } from 'react';
import { toDate, toDateString } from '../../utils/dateUtils';

const OVERBOOK = { _overbook: true };

export function buildReservaMap(reservas) {
  const map = new Map();
  for (const r of reservas) {
    if (r.status === 'cancelada') continue;
    const ci = toDate(r.dataCheckIn);
    const co = toDate(r.dataCheckOut);
    if (!ci || !co) continue;
    for (let d = new Date(ci); d < co; d.setDate(d.getDate() + 1)) {
      const key = `${r.quartoId}:${toDateString(d)}`;
      if (map.has(key)) {
        map.set(key, OVERBOOK); // two+ reservas on same day = overbook
      } else {
        map.set(key, r);
      }
    }
  }
  return map;
}

export function useReservaMap(reservas) {
  return useMemo(() => buildReservaMap(reservas), [reservas]);
}
