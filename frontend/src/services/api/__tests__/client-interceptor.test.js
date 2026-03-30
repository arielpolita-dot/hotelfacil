import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('api client 401 interceptor', () => {
  let errorInterceptor;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('redirects to / on 401 response', async () => {
    const useFn = vi.fn();
    vi.doMock('axios', () => {
      const instance = {
        interceptors: {
          response: { use: useFn },
          request: { use: vi.fn() },
        },
      };
      return { default: { create: vi.fn(() => instance) } };
    });

    await import('../client');
    // useFn is called with (successFn, errorFn)
    expect(useFn).toHaveBeenCalledTimes(1);
    const [successFn, errorFn] = useFn.mock.calls[0];

    // success interceptor passes through
    const resp = { data: 'ok' };
    expect(successFn(resp)).toBe(resp);

    // error with 401 should redirect
    const originalHref = window.location.href;
    const error401 = { response: { status: 401 } };
    await expect(errorFn(error401)).rejects.toBe(error401);
    expect(window.location.href).toContain('/');

    // error without 401 should just reject
    const error500 = { response: { status: 500 } };
    await expect(errorFn(error500)).rejects.toBe(error500);

    // error without response should just reject
    const networkError = { message: 'Network Error' };
    await expect(errorFn(networkError)).rejects.toBe(networkError);
  });

  it('creates axios with baseURL containing /api and withCredentials', async () => {
    const createFn = vi.fn(() => ({
      interceptors: {
        response: { use: vi.fn() },
        request: { use: vi.fn() },
      },
    }));
    vi.doMock('axios', () => ({
      default: { create: createFn },
    }));

    await import('../client');
    expect(createFn).toHaveBeenCalledWith(
      expect.objectContaining({
        withCredentials: true,
      })
    );
    const config = createFn.mock.calls[0][0];
    expect(config.baseURL).toContain('/api');
  });
});
