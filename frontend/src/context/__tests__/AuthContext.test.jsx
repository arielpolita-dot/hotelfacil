import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const originalFetch = global.fetch;

function TestConsumer() {
  const { currentUser, loading, companies, login, logout } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <span data-testid="user">{currentUser ? currentUser.email : 'Not logged in'}</span>
      <span data-testid="companies">{companies.length}</span>
      <button onClick={login}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('shows loading initially', () => {
    global.fetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('sets user and companies when authenticated', async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({
        authenticated: true,
        user: { id: '1', email: 'test@hotel.com' },
        companies: [{ id: 'c1', nome: 'Hotel A' }],
      }),
    });
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@hotel.com');
      expect(screen.getByTestId('companies').textContent).toBe('1');
    });
  });

  it('shows not logged in when not authenticated', async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ authenticated: false }),
    });
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Not logged in');
    });
  });

  it('shows not logged in when fetch fails', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Not logged in');
    });
  });

  it('defaults companies to empty when not provided', async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({
        authenticated: true,
        user: { id: '1', email: 'test@hotel.com' },
      }),
    });
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('companies').textContent).toBe('0');
    });
  });
});
