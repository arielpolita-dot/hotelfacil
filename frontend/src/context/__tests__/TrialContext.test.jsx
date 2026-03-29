import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TrialProvider, useTrial } from '../TrialContext';

// Mock api client
vi.mock('../../services/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock AuthContext
vi.mock('../AuthContext', () => ({
  useAuth: () => ({
    currentUser: { id: '1', email: 'admin@test.com' },
  }),
}));

// Mock EmpresaContext
vi.mock('../EmpresaContext', () => ({
  useEmpresa: () => ({
    empresaAtual: { id: 'emp-1', nome: 'Hotel Teste' },
  }),
}));

import { api } from '../../services/api/client';

function TestConsumer() {
  const { trialStatus, isAdmin } = useTrial();
  return (
    <div>
      <span data-testid="status">{trialStatus ? trialStatus.status : 'loading'}</span>
      <span data-testid="admin">{isAdmin() ? 'yes' : 'no'}</span>
    </div>
  );
}

describe('TrialProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches trial status on mount', async () => {
    api.get.mockResolvedValue({ data: { status: 'active', diasRestantes: 10 } });
    render(<TrialProvider><TestConsumer /></TrialProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('active');
    });
    expect(api.get).toHaveBeenCalledWith('/api/empresas/emp-1/trial');
  });

  it('sets expired when fetch fails', async () => {
    api.get.mockRejectedValue(new Error('Network'));
    render(<TrialProvider><TestConsumer /></TrialProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('expired');
    });
  });
});

describe('useTrial outside provider', () => {
  it('returns safe defaults', () => {
    function Standalone() {
      const { trialStatus, isAdmin } = useTrial();
      return (
        <div>
          <span data-testid="status">{trialStatus || 'null'}</span>
          <span data-testid="admin">{isAdmin() ? 'yes' : 'no'}</span>
        </div>
      );
    }
    render(<Standalone />);
    expect(screen.getByTestId('status').textContent).toBe('null');
    expect(screen.getByTestId('admin').textContent).toBe('no');
  });
});
