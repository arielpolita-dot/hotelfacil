import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { AuthifyClient } from './authify.client';

const mockConfigService = () => ({
  getOrThrow: jest.fn((key: string) => {
    const map: Record<string, string> = {
      AUTHIFY_URL: 'https://auth.test.com',
      AUTHIFY_API_KEY: 'test-api-key',
    };
    return map[key];
  }),
});

const TOKEN = 'user-access-token-xyz';

describe('AuthifyClient', () => {
  let client: AuthifyClient;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthifyClient,
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    client = module.get(AuthifyClient);

    fetchSpy = jest.spyOn(global, 'fetch');
    // Make backoff sleeps no-ops in tests
    jest
      .spyOn(client as unknown as { sleep: () => Promise<void> }, 'sleep')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerContext', () => {
    it('PUTs to the correct URL with X-API-Key and Bearer of caller token', async () => {
      fetchSpy.mockResolvedValueOnce(new Response('{}', { status: 200 }));

      await client.registerContext('emp-123', 'Hotel Beira Mar', TOKEN);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://auth.test.com/auth/contexts/emp-123');
      expect(init.method).toBe('PUT');
      expect(init.headers).toMatchObject({
        'Content-Type': 'application/json',
        'X-API-Key': 'test-api-key',
        Authorization: `Bearer ${TOKEN}`,
      });
    });

    it('uses a different Bearer per call (token comes from request, not config)', async () => {
      fetchSpy
        .mockResolvedValueOnce(new Response('{}', { status: 200 }))
        .mockResolvedValueOnce(new Response('{}', { status: 200 }));

      await client.registerContext('emp-1', 'A', 'token-userA');
      await client.registerContext('emp-2', 'B', 'token-userB');

      expect(fetchSpy.mock.calls[0][1].headers.Authorization).toBe(
        'Bearer token-userA',
      );
      expect(fetchSpy.mock.calls[1][1].headers.Authorization).toBe(
        'Bearer token-userB',
      );
    });

    it('sends name and metadata in body as JSON', async () => {
      fetchSpy.mockResolvedValueOnce(new Response('{}', { status: 200 }));

      const createdAt = new Date('2026-05-07T10:00:00Z');
      await client.registerContext('emp-1', 'Hotel X', TOKEN, {
        type: 'company',
        createdAt,
      });

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string);
      expect(body.name).toBe('Hotel X');
      expect(body.metadata).toEqual({
        type: 'company',
        createdAt: createdAt.toISOString(),
      });
    });

    it('omits metadata key when not provided', async () => {
      fetchSpy.mockResolvedValueOnce(new Response('{}', { status: 200 }));

      await client.registerContext('emp-1', 'Hotel X', TOKEN);

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string);
      expect(body).toEqual({ name: 'Hotel X' });
    });

    it('encodes the externalContextId in the URL', async () => {
      fetchSpy.mockResolvedValueOnce(new Response('{}', { status: 200 }));

      await client.registerContext('emp/with spaces', 'Hotel', TOKEN);

      expect(fetchSpy.mock.calls[0][0]).toBe(
        'https://auth.test.com/auth/contexts/emp%2Fwith%20spaces',
      );
    });

    it('retries on 5xx and resolves once a 200 comes back', async () => {
      fetchSpy
        .mockResolvedValueOnce(new Response('boom', { status: 503 }))
        .mockResolvedValueOnce(new Response('{}', { status: 200 }));

      await expect(
        client.registerContext('emp-1', 'Hotel', TOKEN),
      ).resolves.toBeUndefined();

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('retries on 429 (rate limit)', async () => {
      fetchSpy
        .mockResolvedValueOnce(new Response('rate', { status: 429 }))
        .mockResolvedValueOnce(new Response('{}', { status: 200 }));

      await client.registerContext('emp-1', 'Hotel', TOKEN);

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('retries on network errors', async () => {
      fetchSpy
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValueOnce(new Response('{}', { status: 200 }));

      await client.registerContext('emp-1', 'Hotel', TOKEN);

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('rejects after exhausting retries on persistent 5xx', async () => {
      fetchSpy.mockImplementation(
        async () => new Response('down', { status: 503 }),
      );

      await expect(
        client.registerContext('emp-1', 'Hotel', TOKEN),
      ).rejects.toThrow(/503/);

      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('does NOT retry on 400 (bad request)', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('invalid name', { status: 400 }),
      );

      await expect(
        client.registerContext('emp-1', '', TOKEN),
      ).rejects.toThrow(/400/);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('does NOT retry on 401 (auth failure)', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('unauthorized', { status: 401 }),
      );

      await expect(
        client.registerContext('emp-1', 'Hotel', TOKEN),
      ).rejects.toThrow(/401/);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('does NOT retry on 404', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('not found', { status: 404 }),
      );

      await expect(
        client.registerContext('emp-1', 'Hotel', TOKEN),
      ).rejects.toThrow(/404/);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
