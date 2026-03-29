import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios before import
vi.mock('axios', () => {
  const interceptors = {
    response: { use: vi.fn() },
    request: { use: vi.fn() },
  };
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors,
  };
  return {
    default: {
      create: vi.fn(() => instance),
    },
  };
});

import axios from 'axios';

describe('api client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates axios instance with correct config', async () => {
    // Re-import to trigger module execution
    vi.resetModules();
    vi.doMock('axios', () => {
      const interceptors = {
        response: { use: vi.fn() },
        request: { use: vi.fn() },
      };
      const instance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        interceptors,
      };
      return {
        default: {
          create: vi.fn(() => instance),
        },
      };
    });

    const { api } = await import('../client');
    const axiosMod = (await import('axios')).default;

    expect(axiosMod.create).toHaveBeenCalledWith(
      expect.objectContaining({
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('registers response interceptor', async () => {
    vi.resetModules();
    const useFn = vi.fn();
    vi.doMock('axios', () => {
      const interceptors = {
        response: { use: useFn },
        request: { use: vi.fn() },
      };
      const instance = { interceptors };
      return {
        default: { create: vi.fn(() => instance) },
      };
    });

    await import('../client');
    expect(useFn).toHaveBeenCalledTimes(1);
  });
});
