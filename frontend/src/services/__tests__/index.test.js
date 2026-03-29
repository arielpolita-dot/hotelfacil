import { describe, it, expect, vi } from 'vitest';

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

import * as services from '../index';

describe('services index exports', () => {
  it('exports quartos functions', () => {
    expect(services.getQuartos).toBeDefined();
    expect(services.onQuartos).toBeDefined();
    expect(services.addQuarto).toBeDefined();
    expect(services.updateQuarto).toBeDefined();
    expect(services.deleteQuarto).toBeDefined();
  });

  it('exports reservas functions', () => {
    expect(services.getReservas).toBeDefined();
    expect(services.onReservas).toBeDefined();
    expect(services.addReserva).toBeDefined();
    expect(services.updateReserva).toBeDefined();
    expect(services.checkoutReserva).toBeDefined();
    expect(services.cancelarReserva).toBeDefined();
  });

  it('exports despesas functions', () => {
    expect(services.getDespesas).toBeDefined();
    expect(services.onDespesas).toBeDefined();
    expect(services.addDespesa).toBeDefined();
    expect(services.updateDespesa).toBeDefined();
    expect(services.deleteDespesa).toBeDefined();
  });

  it('exports fluxoCaixa functions', () => {
    expect(services.onFluxoCaixa).toBeDefined();
    expect(services.addFluxoCaixa).toBeDefined();
    expect(services.getFluxoCaixa).toBeDefined();
  });

  it('exports faturas functions', () => {
    expect(services.onFaturas).toBeDefined();
    expect(services.addFatura).toBeDefined();
    expect(services.updateFatura).toBeDefined();
    expect(services.deleteFatura).toBeDefined();
  });

  it('exports usuarios functions', () => {
    expect(services.getUsuarios).toBeDefined();
    expect(services.onUsuarios).toBeDefined();
    expect(services.addUsuario).toBeDefined();
    expect(services.updateUsuario).toBeDefined();
    expect(services.deleteUsuario).toBeDefined();
  });

  it('exports fornecedores functions', () => {
    expect(services.onFornecedores).toBeDefined();
    expect(services.addFornecedor).toBeDefined();
    expect(services.updateFornecedor).toBeDefined();
    expect(services.deleteFornecedor).toBeDefined();
  });

  it('exports bancos functions', () => {
    expect(services.onBancos).toBeDefined();
    expect(services.addBanco).toBeDefined();
    expect(services.updateBanco).toBeDefined();
    expect(services.deleteBanco).toBeDefined();
    expect(services.seedBancosIniciais).toBeDefined();
  });

  it('exports seed and empresa functions', () => {
    expect(services.seedDadosIniciais).toBeDefined();
    expect(services.getEmpresa).toBeDefined();
    expect(services.updateEmpresa).toBeDefined();
  });
});
