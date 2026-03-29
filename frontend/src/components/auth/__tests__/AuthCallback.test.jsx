import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthCallback from '../AuthCallback';

const originalFetch = global.fetch;

describe('AuthCallback', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('shows authenticating message', () => {
    global.fetch.mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter initialEntries={['/auth/callback?code=test-code']}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Autenticando...')).toBeDefined();
  });

  it('shows error when no code param', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Missing authorization code')).toBeDefined();
    });
  });

  it('shows error when fetch fails', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    render(
      <MemoryRouter initialEntries={['/auth/callback?code=test-code']}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Auth failed')).toBeDefined();
    });
  });

  it('calls auth callback API with correct params', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    // Mock window.location.href setter
    const hrefSetter = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, href: '', origin: 'http://localhost:3000' },
      writable: true,
    });

    render(
      <MemoryRouter initialEntries={['/auth/callback?code=my-code']}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/callback'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });
  });
});
