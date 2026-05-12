// Utilities for the demo seed generator.
// Deterministic randomness (seed-based) so re-runs produce same data when needed.

import { randomUUID } from 'crypto';

let seed = 1337;
export function setSeed(s: number) { seed = s; }
export function rand(): number {
  // Mulberry32 PRNG - good distribution, deterministic
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = seed;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function pickWeighted<T>(items: ReadonlyArray<[T, number]>): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r <= 0) return item;
  }
  return items[items.length - 1][0];
}

export function uuid(): string {
  return randomUUID();
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export function daysFromNow(n: number): Date {
  return daysAgo(-n);
}

export function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function isoTimestamp(d: Date): string {
  return d.toISOString().replace('T', ' ').replace('Z', '');
}

// Escape single quotes for SQL string literals.
export function sql(value: string | null | undefined): string {
  if (value == null) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Format an array of strings/numbers for Postgres text[] / int[].
export function sqlArray(values: ReadonlyArray<string | number>): string {
  if (values.length === 0) return `'{}'`;
  const escaped = values.map(v =>
    typeof v === 'number' ? String(v) : `"${String(v).replace(/"/g, '\\"')}"`
  );
  return `'{${escaped.join(',')}}'`;
}

export function sqlBool(b: boolean): string {
  return b ? 'true' : 'false';
}

export function cpfFake(): string {
  const d = () => randInt(0, 9);
  return `${d()}${d()}${d()}.${d()}${d()}${d()}.${d()}${d()}${d()}-${d()}${d()}`;
}

export function telefoneFake(): string {
  const ddd = pick(['51', '11', '21', '31', '41', '47', '48', '85', '61']);
  return `(${ddd}) 9${randInt(1000, 9999)}-${randInt(1000, 9999)}`;
}

export function emailFromName(nome: string): string {
  const slug = nome.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, '.')
    .slice(0, 40);
  const dominio = pick(['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br']);
  return `${slug}@${dominio}`;
}
