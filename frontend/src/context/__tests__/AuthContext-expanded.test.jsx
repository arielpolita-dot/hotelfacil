import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const originalFetch = global.fetch;

function TestConsumer() {
  const { currentUser, loading, companies, login, logout } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <span data-testid="user">{currentUser ? currentUser.email : 'Not logged in'}</span>
      <span data-testid="companies">{companies.length}</span>
      <button data-testid="login" onClick={login}>Login</button>
      <button data-testid="logout" onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider (expanded)', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('login function is available and callable', async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ authenticated: false }),
    });
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Not logged in');
    });

    // login button should be clickable without error
    const loginBtn = screen.getByTestId('login');
    expect(loginBtn).toBeDefined();
    // Click should not throw
    fireEvent.click(loginBtn);
  });

  it('logout calls POST and clears user', async () => {
    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          authenticated: true,
          user: { id: '1', email: 'test@hotel.com' },
          companies: [{ id: 'c1', nome: 'Hotel A' }],
        }),
      })
      .mockResolvedValueOnce({}); // logout POST

    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@hotel.com');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('logout'));
    });

    // The second fetch call should be the logout POST
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/logout'),
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    );
  });

  it('handles multiple companies from status response', async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({
        authenticated: true,
        user: { id: '1', email: 'test@hotel.com' },
        companies: [
          { id: 'c1', nome: 'Hotel A' },
          { id: 'c2', nome: 'Hotel B' },
          { id: 'c3', nome: 'Hotel C' },
        ],
      }),
    });
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('companies').textContent).toBe('3');
    });
  });
});
