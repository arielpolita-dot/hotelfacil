import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminPanel from '../AdminPanel';

vi.mock('../../../context/TrialContext', () => ({
  useTrial: vi.fn(),
}));

import { useTrial } from '../../../context/TrialContext';

describe('AdminPanel', () => {
  it('shows access denied for non-admin', () => {
    useTrial.mockReturnValue({
      isAdmin: () => false,
      listarTodasEmpresas: vi.fn(),
      ativarEmpresa: vi.fn(),
    });
    render(<AdminPanel />);
    expect(screen.getByText(/Acesso Negado/i)).toBeDefined();
  });

  it('shows admin panel for admin user', async () => {
    useTrial.mockReturnValue({
      isAdmin: () => true,
      listarTodasEmpresas: vi.fn().mockResolvedValue([
        { id: 'e1', nome: 'Hotel A', status: 'trial', trialEndsAt: '2026-04-01', createdAt: '2026-03-01', owner: { email: 'a@b.com' } },
      ]),
      ativarEmpresa: vi.fn(),
    });
    render(<AdminPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Painel Administrativo/i)).toBeDefined();
    });
  });

  it('renders empresa list for admin', async () => {
    useTrial.mockReturnValue({
      isAdmin: () => true,
      listarTodasEmpresas: vi.fn().mockResolvedValue([
        { id: 'e1', nome: 'Hotel Sol', status: 'trial', trialEndsAt: '2026-04-01', createdAt: '2026-03-01', owner: { email: 'sol@test.com' } },
        { id: 'e2', nome: 'Hotel Lua', status: 'paid', trialEndsAt: null, createdAt: '2026-02-01', owner: { email: 'lua@test.com' } },
      ]),
      ativarEmpresa: vi.fn(),
    });
    render(<AdminPanel />);
    await waitFor(() => {
      expect(screen.getByText('Hotel Sol')).toBeDefined();
      expect(screen.getByText('Hotel Lua')).toBeDefined();
    });
  });
});
