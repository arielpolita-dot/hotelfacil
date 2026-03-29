import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EmpresaProvider, useEmpresa } from '../EmpresaContext';

// Mock AuthContext
vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../AuthContext';

function TestConsumer() {
  const ctx = useEmpresa();
  if (ctx.loading) return <div>Loading...</div>;
  return (
    <div>
      <span data-testid="empresa">{ctx.activeEmpresa ? ctx.activeEmpresa.nome : 'None'}</span>
      <span data-testid="count">{ctx.companies.length}</span>
    </div>
  );
}

describe('EmpresaProvider', () => {
  const originalGetItem = Storage.prototype.getItem;
  const originalSetItem = Storage.prototype.setItem;

  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn().mockReturnValue(null);
    Storage.prototype.setItem = vi.fn();
  });

  afterEach(() => {
    Storage.prototype.getItem = originalGetItem;
    Storage.prototype.setItem = originalSetItem;
  });

  it('shows no empresa when user has no companies', async () => {
    useAuth.mockReturnValue({
      currentUser: { id: '1', email: 'test@test.com' },
      companies: [],
    });
    render(<EmpresaProvider><TestConsumer /></EmpresaProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('empresa').textContent).toBe('None');
    });
  });

  it('selects first company when no stored preference', async () => {
    useAuth.mockReturnValue({
      currentUser: { id: '1', email: 'test@test.com' },
      companies: [{ id: 'c1', nome: 'Hotel A' }, { id: 'c2', nome: 'Hotel B' }],
    });
    render(<EmpresaProvider><TestConsumer /></EmpresaProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('empresa').textContent).toBe('Hotel A');
    });
  });

  it('restores stored empresa from localStorage', async () => {
    Storage.prototype.getItem.mockReturnValue('c2');
    useAuth.mockReturnValue({
      currentUser: { id: '1', email: 'test@test.com' },
      companies: [{ id: 'c1', nome: 'Hotel A' }, { id: 'c2', nome: 'Hotel B' }],
    });
    render(<EmpresaProvider><TestConsumer /></EmpresaProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('empresa').textContent).toBe('Hotel B');
    });
  });

  it('falls back to first company when stored id not found', async () => {
    Storage.prototype.getItem.mockReturnValue('nonexistent');
    useAuth.mockReturnValue({
      currentUser: { id: '1', email: 'test@test.com' },
      companies: [{ id: 'c1', nome: 'Hotel A' }],
    });
    render(<EmpresaProvider><TestConsumer /></EmpresaProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('empresa').textContent).toBe('Hotel A');
    });
  });

  it('shows none when currentUser is null', async () => {
    useAuth.mockReturnValue({
      currentUser: null,
      companies: [],
    });
    render(<EmpresaProvider><TestConsumer /></EmpresaProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('empresa').textContent).toBe('None');
    });
  });
});
