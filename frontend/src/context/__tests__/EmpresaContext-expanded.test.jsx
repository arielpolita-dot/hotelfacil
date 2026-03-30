import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { EmpresaProvider, useEmpresa } from '../EmpresaContext';

vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../AuthContext';

const originalFetch = global.fetch;

function TestConsumer() {
  const ctx = useEmpresa();
  if (ctx.loading) return <div>Loading...</div>;
  return (
    <div>
      <span data-testid="empresa">{ctx.activeEmpresa ? ctx.activeEmpresa.nome : 'None'}</span>
      <span data-testid="count">{ctx.companies.length}</span>
      <button data-testid="switch" onClick={() => ctx.switchEmpresa('c2')}>Switch</button>
      <button data-testid="create" onClick={() => ctx.createEmpresa({ nome: 'New Hotel' })}>Create</button>
    </div>
  );
}

describe('EmpresaProvider (expanded)', () => {
  const originalGetItem = Storage.prototype.getItem;
  const originalSetItem = Storage.prototype.setItem;

  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn().mockReturnValue(null);
    Storage.prototype.setItem = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'new-1' }),
    });
    // Mock window.location.reload
    delete window.location;
    window.location = { reload: vi.fn(), href: '/' };
  });

  afterEach(() => {
    Storage.prototype.getItem = originalGetItem;
    Storage.prototype.setItem = originalSetItem;
    global.fetch = originalFetch;
  });

  it('switchEmpresa stores in localStorage and reloads', async () => {
    useAuth.mockReturnValue({
      currentUser: { id: '1' },
      companies: [{ id: 'c1', nome: 'A' }, { id: 'c2', nome: 'B' }],
    });
    render(<EmpresaProvider><TestConsumer /></EmpresaProvider>);
    await waitFor(() => expect(screen.getByTestId('empresa').textContent).toBe('A'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('switch'));
    });

    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      expect.stringContaining('empresa'),
      'c2'
    );
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('createEmpresa calls POST and reloads', async () => {
    useAuth.mockReturnValue({
      currentUser: { id: '1' },
      companies: [{ id: 'c1', nome: 'A' }],
    });
    render(<EmpresaProvider><TestConsumer /></EmpresaProvider>);
    await waitFor(() => expect(screen.getByTestId('empresa').textContent).toBe('A'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('create'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/empresas'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ nome: 'New Hotel' }),
      })
    );
    expect(window.location.reload).toHaveBeenCalled();
  });

  // createEmpresa error handling tested at integration level

  it('stores activeEmpresa id in localStorage on resolution', async () => {
    useAuth.mockReturnValue({
      currentUser: { id: '1' },
      companies: [{ id: 'c1', nome: 'A' }],
    });
    render(<EmpresaProvider><TestConsumer /></EmpresaProvider>);
    await waitFor(() => {
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(
        expect.stringContaining('empresa'),
        'c1'
      );
    });
  });

  it('switchEmpresa handles fetch failure gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('Network'));
    useAuth.mockReturnValue({
      currentUser: { id: '1' },
      companies: [{ id: 'c1', nome: 'A' }],
    });
    render(<EmpresaProvider><TestConsumer /></EmpresaProvider>);
    await waitFor(() => expect(screen.getByTestId('empresa').textContent).toBe('A'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('switch'));
    });
    // Should still reload even on error
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('exposes empresaAtual alias for activeEmpresa', async () => {
    useAuth.mockReturnValue({
      currentUser: { id: '1' },
      companies: [{ id: 'c1', nome: 'Hotel X' }],
    });

    function AliasConsumer() {
      const { empresaAtual } = useEmpresa();
      return <span data-testid="alias">{empresaAtual?.nome || 'none'}</span>;
    }

    render(<EmpresaProvider><AliasConsumer /></EmpresaProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('alias').textContent).toBe('Hotel X');
    });
  });

  it('exposes empresasUsuario alias for companies', async () => {
    useAuth.mockReturnValue({
      currentUser: { id: '1' },
      companies: [{ id: 'c1', nome: 'A' }, { id: 'c2', nome: 'B' }],
    });

    function AliasConsumer() {
      const { empresasUsuario } = useEmpresa();
      return <span data-testid="alias">{empresasUsuario.length}</span>;
    }

    render(<EmpresaProvider><AliasConsumer /></EmpresaProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('alias').textContent).toBe('2');
    });
  });
});
