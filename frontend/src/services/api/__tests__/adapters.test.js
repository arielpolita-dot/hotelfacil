import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

import { api } from '../client';

// --- quartos ---
import { getQuartos, onQuartos, addQuarto, updateQuarto, deleteQuarto } from '../quartos.api';

describe('quartos.api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getQuartos calls GET and extracts data array', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: '1', numero: 101 }] } });
    const result = await getQuartos('emp-1');
    expect(api.get).toHaveBeenCalledWith('/empresas/emp-1/quartos');
    expect(result).toEqual([{ id: '1', numero: 101 }]);
  });

  it('getQuartos falls back to response when no .data wrapper', async () => {
    api.get.mockResolvedValue({ data: [{ id: '2' }] });
    const result = await getQuartos('emp-1');
    expect(result).toEqual([{ id: '2' }]);
  });

  it('onQuartos fetches and calls callback', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: '1' }] } });
    const cb = vi.fn();
    onQuartos('emp-1', cb);
    await new Promise(r => setTimeout(r, 10));
    expect(cb).toHaveBeenCalledWith([{ id: '1' }]);
  });

  it('onQuartos returns unsubscribe function', () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    const unsub = onQuartos('emp-1', vi.fn());
    expect(typeof unsub).toBe('function');
  });

  it('addQuarto calls POST and returns id', async () => {
    api.post.mockResolvedValue({ data: { id: 'new-1' } });
    const result = await addQuarto('emp-1', { numero: 201 });
    expect(api.post).toHaveBeenCalledWith('/empresas/emp-1/quartos', { numero: 201 });
    expect(result).toBe('new-1');
  });

  it('updateQuarto calls PUT', async () => {
    api.put.mockResolvedValue({});
    await updateQuarto('emp-1', 'q1', { preco: 300 });
    expect(api.put).toHaveBeenCalledWith('/empresas/emp-1/quartos/q1', { preco: 300 });
  });

  it('deleteQuarto calls DELETE', async () => {
    api.delete.mockResolvedValue({});
    await deleteQuarto('emp-1', 'q1');
    expect(api.delete).toHaveBeenCalledWith('/empresas/emp-1/quartos/q1');
  });
});

// --- reservas ---
import {
  getReservas, onReservas, addReserva, updateReserva,
  checkoutReserva, cancelarReserva,
} from '../reservas.api';

describe('reservas.api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getReservas calls GET and extracts data', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'r1' }] } });
    const result = await getReservas('emp-1');
    expect(api.get).toHaveBeenCalledWith('/empresas/emp-1/reservas');
    expect(result).toEqual([{ id: 'r1' }]);
  });

  it('getReservas falls back when no .data wrapper', async () => {
    api.get.mockResolvedValue({ data: [{ id: 'r2' }] });
    const result = await getReservas('emp-1');
    expect(result).toEqual([{ id: 'r2' }]);
  });

  it('onReservas fetches and calls callback', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'r1' }] } });
    const cb = vi.fn();
    onReservas('emp-1', cb);
    await new Promise(r => setTimeout(r, 10));
    expect(cb).toHaveBeenCalledWith([{ id: 'r1' }]);
  });

  it('onReservas returns unsubscribe function', () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    const unsub = onReservas('emp-1', vi.fn());
    expect(typeof unsub).toBe('function');
  });

  it('addReserva calls POST and returns id', async () => {
    api.post.mockResolvedValue({ data: { id: 'nr1' } });
    const result = await addReserva('emp-1', { quarto: 'q1' });
    expect(api.post).toHaveBeenCalledWith('/empresas/emp-1/reservas', { quarto: 'q1' });
    expect(result).toBe('nr1');
  });

  it('updateReserva calls PUT', async () => {
    api.put.mockResolvedValue({});
    await updateReserva('emp-1', 'r1', { status: 'confirmed' });
    expect(api.put).toHaveBeenCalledWith('/empresas/emp-1/reservas/r1', { status: 'confirmed' });
  });

  it('checkoutReserva calls PATCH /:id/checkout', async () => {
    api.patch.mockResolvedValue({});
    await checkoutReserva('emp-1', 'r1', 'q1');
    expect(api.patch).toHaveBeenCalledWith('/empresas/emp-1/reservas/r1/checkout', { quartoId: 'q1' });
  });

  it('cancelarReserva calls PATCH /:id/cancel', async () => {
    api.patch.mockResolvedValue({});
    await cancelarReserva('emp-1', 'r1', 'q1');
    expect(api.patch).toHaveBeenCalledWith('/empresas/emp-1/reservas/r1/cancel', { quartoId: 'q1' });
  });
});

// --- despesas ---
import { getDespesas, onDespesas, addDespesa, updateDespesa, deleteDespesa } from '../despesas.api';

describe('despesas.api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getDespesas calls GET and extracts data', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'd1' }] } });
    const result = await getDespesas('emp-1');
    expect(api.get).toHaveBeenCalledWith('/empresas/emp-1/despesas');
    expect(result).toEqual([{ id: 'd1' }]);
  });

  it('getDespesas falls back when no .data wrapper', async () => {
    api.get.mockResolvedValue({ data: [{ id: 'd2' }] });
    expect(await getDespesas('emp-1')).toEqual([{ id: 'd2' }]);
  });

  it('onDespesas fetches and calls callback', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'd1' }] } });
    const cb = vi.fn();
    onDespesas('emp-1', cb);
    await new Promise(r => setTimeout(r, 10));
    expect(cb).toHaveBeenCalledWith([{ id: 'd1' }]);
  });

  it('onDespesas returns unsubscribe', () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    expect(typeof onDespesas('emp-1', vi.fn())).toBe('function');
  });

  it('addDespesa calls POST and returns id', async () => {
    api.post.mockResolvedValue({ data: { id: 'nd1' } });
    const result = await addDespesa('emp-1', { valor: 100 });
    expect(api.post).toHaveBeenCalledWith('/empresas/emp-1/despesas', { valor: 100 });
    expect(result).toBe('nd1');
  });

  it('updateDespesa calls PUT', async () => {
    api.put.mockResolvedValue({});
    await updateDespesa('emp-1', 'd1', { valor: 200 });
    expect(api.put).toHaveBeenCalledWith('/empresas/emp-1/despesas/d1', { valor: 200 });
  });

  it('deleteDespesa calls DELETE', async () => {
    api.delete.mockResolvedValue({});
    await deleteDespesa('emp-1', 'd1');
    expect(api.delete).toHaveBeenCalledWith('/empresas/emp-1/despesas/d1');
  });
});

// --- fluxoCaixa ---
import { getFluxoCaixa, onFluxoCaixa, addFluxoCaixa } from '../fluxoCaixa.api';

describe('fluxoCaixa.api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getFluxoCaixa calls GET and extracts data', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'f1' }] } });
    const result = await getFluxoCaixa('emp-1');
    expect(api.get).toHaveBeenCalledWith('/empresas/emp-1/fluxo-caixa');
    expect(result).toEqual([{ id: 'f1' }]);
  });

  it('getFluxoCaixa falls back when no .data wrapper', async () => {
    api.get.mockResolvedValue({ data: [{ id: 'f2' }] });
    expect(await getFluxoCaixa('emp-1')).toEqual([{ id: 'f2' }]);
  });

  it('onFluxoCaixa fetches and calls callback', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'f1' }] } });
    const cb = vi.fn();
    onFluxoCaixa('emp-1', cb);
    await new Promise(r => setTimeout(r, 10));
    expect(cb).toHaveBeenCalledWith([{ id: 'f1' }]);
  });

  it('onFluxoCaixa returns unsubscribe', () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    expect(typeof onFluxoCaixa('emp-1', vi.fn())).toBe('function');
  });

  it('addFluxoCaixa calls POST and returns id', async () => {
    api.post.mockResolvedValue({ data: { id: 'nf1' } });
    const result = await addFluxoCaixa('emp-1', { valor: 500 });
    expect(api.post).toHaveBeenCalledWith('/empresas/emp-1/fluxo-caixa', { valor: 500 });
    expect(result).toBe('nf1');
  });
});

// --- faturas ---
import { onFaturas, addFatura, updateFatura, deleteFatura } from '../faturas.api';

describe('faturas.api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('onFaturas fetches and calls callback', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'ft1' }] } });
    const cb = vi.fn();
    onFaturas('emp-1', cb);
    await new Promise(r => setTimeout(r, 10));
    expect(cb).toHaveBeenCalledWith([{ id: 'ft1' }]);
  });

  it('onFaturas returns unsubscribe', () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    expect(typeof onFaturas('emp-1', vi.fn())).toBe('function');
  });

  it('addFatura calls POST and returns id', async () => {
    api.post.mockResolvedValue({ data: { id: 'nft1' } });
    const result = await addFatura('emp-1', { valor: 1000 });
    expect(api.post).toHaveBeenCalledWith('/empresas/emp-1/faturas', { valor: 1000 });
    expect(result).toBe('nft1');
  });

  it('updateFatura calls PUT', async () => {
    api.put.mockResolvedValue({});
    await updateFatura('emp-1', 'ft1', { status: 'pago' });
    expect(api.put).toHaveBeenCalledWith('/empresas/emp-1/faturas/ft1', { status: 'pago' });
  });

  it('deleteFatura calls DELETE', async () => {
    api.delete.mockResolvedValue({});
    await deleteFatura('emp-1', 'ft1');
    expect(api.delete).toHaveBeenCalledWith('/empresas/emp-1/faturas/ft1');
  });
});

// --- usuarios ---
import { getUsuarios, onUsuarios, addUsuario, updateUsuario, deleteUsuario } from '../usuarios.api';

describe('usuarios.api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getUsuarios calls GET and extracts data', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'u1' }] } });
    const result = await getUsuarios('emp-1');
    expect(api.get).toHaveBeenCalledWith('/empresas/emp-1/usuarios');
    expect(result).toEqual([{ id: 'u1' }]);
  });

  it('getUsuarios falls back when no .data wrapper', async () => {
    api.get.mockResolvedValue({ data: [{ id: 'u2' }] });
    expect(await getUsuarios('emp-1')).toEqual([{ id: 'u2' }]);
  });

  it('onUsuarios fetches and calls callback', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'u1' }] } });
    const cb = vi.fn();
    onUsuarios('emp-1', cb);
    await new Promise(r => setTimeout(r, 10));
    expect(cb).toHaveBeenCalledWith([{ id: 'u1' }]);
  });

  it('onUsuarios returns unsubscribe', () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    expect(typeof onUsuarios('emp-1', vi.fn())).toBe('function');
  });

  it('addUsuario calls POST and returns id', async () => {
    api.post.mockResolvedValue({ data: { id: 'nu1' } });
    const result = await addUsuario('emp-1', { nome: 'John' });
    expect(api.post).toHaveBeenCalledWith('/empresas/emp-1/usuarios', { nome: 'John' });
    expect(result).toBe('nu1');
  });

  it('updateUsuario calls PUT', async () => {
    api.put.mockResolvedValue({});
    await updateUsuario('emp-1', 'u1', { nome: 'Jane' });
    expect(api.put).toHaveBeenCalledWith('/empresas/emp-1/usuarios/u1', { nome: 'Jane' });
  });

  it('deleteUsuario calls DELETE', async () => {
    api.delete.mockResolvedValue({});
    await deleteUsuario('emp-1', 'u1');
    expect(api.delete).toHaveBeenCalledWith('/empresas/emp-1/usuarios/u1');
  });
});

// --- fornecedores ---
import { onFornecedores, addFornecedor, updateFornecedor, deleteFornecedor } from '../fornecedores.api';

describe('fornecedores.api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('onFornecedores fetches and calls callback', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'fn1' }] } });
    const cb = vi.fn();
    onFornecedores('emp-1', cb);
    await new Promise(r => setTimeout(r, 10));
    expect(cb).toHaveBeenCalledWith([{ id: 'fn1' }]);
  });

  it('onFornecedores returns unsubscribe', () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    expect(typeof onFornecedores('emp-1', vi.fn())).toBe('function');
  });

  it('addFornecedor calls POST and returns id', async () => {
    api.post.mockResolvedValue({ data: { id: 'nfn1' } });
    const result = await addFornecedor('emp-1', { nome: 'Forn A' });
    expect(api.post).toHaveBeenCalledWith('/empresas/emp-1/fornecedores', { nome: 'Forn A' });
    expect(result).toBe('nfn1');
  });

  it('updateFornecedor calls PUT', async () => {
    api.put.mockResolvedValue({});
    await updateFornecedor('emp-1', 'fn1', { nome: 'Forn B' });
    expect(api.put).toHaveBeenCalledWith('/empresas/emp-1/fornecedores/fn1', { nome: 'Forn B' });
  });

  it('deleteFornecedor calls DELETE', async () => {
    api.delete.mockResolvedValue({});
    await deleteFornecedor('emp-1', 'fn1');
    expect(api.delete).toHaveBeenCalledWith('/empresas/emp-1/fornecedores/fn1');
  });
});

// --- bancos ---
import { onBancos, addBanco, updateBanco, deleteBanco, seedBancosIniciais } from '../bancos.api';

describe('bancos.api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('onBancos fetches and calls callback', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 'b1' }] } });
    const cb = vi.fn();
    onBancos('emp-1', cb);
    await new Promise(r => setTimeout(r, 10));
    expect(cb).toHaveBeenCalledWith([{ id: 'b1' }]);
  });

  it('onBancos returns unsubscribe', () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    expect(typeof onBancos('emp-1', vi.fn())).toBe('function');
  });

  it('addBanco calls POST and returns id', async () => {
    api.post.mockResolvedValue({ data: { id: 'nb1' } });
    const result = await addBanco('emp-1', { nome: 'Banco X' });
    expect(api.post).toHaveBeenCalledWith('/empresas/emp-1/bancos', { nome: 'Banco X' });
    expect(result).toBe('nb1');
  });

  it('updateBanco calls PUT', async () => {
    api.put.mockResolvedValue({});
    await updateBanco('emp-1', 'b1', { nome: 'Banco Y' });
    expect(api.put).toHaveBeenCalledWith('/empresas/emp-1/bancos/b1', { nome: 'Banco Y' });
  });

  it('deleteBanco calls DELETE', async () => {
    api.delete.mockResolvedValue({});
    await deleteBanco('emp-1', 'b1');
    expect(api.delete).toHaveBeenCalledWith('/empresas/emp-1/bancos/b1');
  });

  it('seedBancosIniciais calls POST /seed', async () => {
    api.post.mockResolvedValue({});
    await seedBancosIniciais('emp-1');
    expect(api.post).toHaveBeenCalledWith('/empresas/emp-1/bancos/seed');
  });
});

// --- empresa ---
import { getEmpresa, updateEmpresa } from '../empresa.api';

describe('empresa.api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getEmpresa calls GET and returns data', async () => {
    api.get.mockResolvedValue({ data: { id: 'e1', nome: 'Hotel X' } });
    const result = await getEmpresa('e1');
    expect(api.get).toHaveBeenCalledWith('/empresas/e1');
    expect(result).toEqual({ id: 'e1', nome: 'Hotel X' });
  });

  it('updateEmpresa calls PUT', async () => {
    api.put.mockResolvedValue({});
    await updateEmpresa('e1', { nome: 'Hotel Y' });
    expect(api.put).toHaveBeenCalledWith('/empresas/e1', { nome: 'Hotel Y' });
  });
});

// --- seed ---
import { seedDadosIniciais } from '../seed.api';

describe('seed.api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('seedDadosIniciais calls POST /seed', async () => {
    api.post.mockResolvedValue({});
    await seedDadosIniciais('emp-1');
    expect(api.post).toHaveBeenCalledWith('/empresas/emp-1/seed');
  });
});
