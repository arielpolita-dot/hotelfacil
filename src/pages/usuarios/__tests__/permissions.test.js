import { describe, it, expect } from 'vitest';
import { roles, statusOptions, permissoesDisponiveis, getPermissoesPorRole } from '../permissions';

describe('roles', () => {
  it('should define 5 roles', () => {
    expect(roles).toHaveLength(5);
  });

  it('should have correct role values', () => {
    const values = roles.map(r => r.value);
    expect(values).toEqual(['Admin', 'Gerente', 'Recepcionista', 'Financeiro', 'Manutencao']);
  });

  it('should have label and color for each role', () => {
    roles.forEach(role => {
      expect(role.label).toBeTruthy();
      expect(role.color).toBeTruthy();
      expect(role.icon).toBeTruthy();
    });
  });
});

describe('statusOptions', () => {
  it('should have three status options', () => {
    expect(statusOptions).toEqual(['Ativo', 'Inativo', 'Suspenso']);
  });
});

describe('permissoesDisponiveis', () => {
  it('should define 9 permissions', () => {
    expect(permissoesDisponiveis).toHaveLength(9);
  });

  it('should have key, label, and description for each permission', () => {
    permissoesDisponiveis.forEach(p => {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
    });
  });

  it('should include all expected permission keys', () => {
    const keys = permissoesDisponiveis.map(p => p.key);
    expect(keys).toEqual([
      'dashboard', 'disponibilidade', 'quartos', 'vendas',
      'faturas', 'despesas', 'fluxoCaixa', 'usuarios', 'configuracoes',
    ]);
  });
});

describe('getPermissoesPorRole', () => {
  it('should grant Admin all permissions', () => {
    const perms = getPermissoesPorRole('Admin');

    permissoesDisponiveis.forEach(p => {
      expect(perms[p.key]).toBe(true);
    });
  });

  it('should grant Gerente all except usuarios and configuracoes', () => {
    const perms = getPermissoesPorRole('Gerente');

    expect(perms.dashboard).toBe(true);
    expect(perms.disponibilidade).toBe(true);
    expect(perms.quartos).toBe(true);
    expect(perms.vendas).toBe(true);
    expect(perms.faturas).toBe(true);
    expect(perms.despesas).toBe(true);
    expect(perms.fluxoCaixa).toBe(true);
    expect(perms.usuarios).toBe(false);
    expect(perms.configuracoes).toBe(false);
  });

  it('should limit Recepcionista to dashboard, disponibilidade, and vendas', () => {
    const perms = getPermissoesPorRole('Recepcionista');

    expect(perms.dashboard).toBe(true);
    expect(perms.disponibilidade).toBe(true);
    expect(perms.vendas).toBe(true);
    expect(perms.quartos).toBe(false);
    expect(perms.faturas).toBe(false);
    expect(perms.despesas).toBe(false);
    expect(perms.fluxoCaixa).toBe(false);
    expect(perms.usuarios).toBe(false);
    expect(perms.configuracoes).toBe(false);
  });

  it('should limit Financeiro to dashboard, faturas, despesas, and fluxoCaixa', () => {
    const perms = getPermissoesPorRole('Financeiro');

    expect(perms.dashboard).toBe(true);
    expect(perms.disponibilidade).toBe(false);
    expect(perms.quartos).toBe(false);
    expect(perms.vendas).toBe(false);
    expect(perms.faturas).toBe(true);
    expect(perms.despesas).toBe(true);
    expect(perms.fluxoCaixa).toBe(true);
    expect(perms.usuarios).toBe(false);
    expect(perms.configuracoes).toBe(false);
  });

  it('should limit Manutencao to dashboard, disponibilidade, quartos, and despesas', () => {
    const perms = getPermissoesPorRole('Manutencao');

    expect(perms.dashboard).toBe(true);
    expect(perms.disponibilidade).toBe(true);
    expect(perms.quartos).toBe(true);
    expect(perms.vendas).toBe(false);
    expect(perms.faturas).toBe(false);
    expect(perms.despesas).toBe(true);
    expect(perms.fluxoCaixa).toBe(false);
    expect(perms.usuarios).toBe(false);
    expect(perms.configuracoes).toBe(false);
  });

  it('should fallback to Recepcionista permissions for unknown role', () => {
    const perms = getPermissoesPorRole('UnknownRole');
    const recepPerms = getPermissoesPorRole('Recepcionista');

    expect(perms).toEqual(recepPerms);
  });

  it('should fallback to Recepcionista permissions for undefined role', () => {
    const perms = getPermissoesPorRole(undefined);
    const recepPerms = getPermissoesPorRole('Recepcionista');

    expect(perms).toEqual(recepPerms);
  });

  it('should return an object with all permission keys', () => {
    const allKeys = permissoesDisponiveis.map(p => p.key);

    roles.forEach(role => {
      const perms = getPermissoesPorRole(role.value);
      allKeys.forEach(key => {
        expect(typeof perms[key]).toBe('boolean');
      });
    });
  });
});
