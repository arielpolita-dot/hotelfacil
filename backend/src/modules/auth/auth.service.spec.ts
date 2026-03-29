import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { AuthBffService } from './auth.service';
import { AdminUser } from './entities/admin-user.entity';
import { AdminSession } from './entities/admin-session.entity';

const mockUserRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockSessionRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockConfigService = () => ({
  getOrThrow: jest.fn((key: string) => {
    const map: Record<string, string> = {
      AUTHIFY_URL: 'https://auth.test.com',
      AUTHIFY_API_KEY: 'test-api-key',
      FRONTEND_URL: 'https://app.test.com',
    };
    return map[key];
  }),
});

const buildTokenResponse = (overrides = {}) => ({
  access_token: 'access-token-123',
  refresh_token: 'refresh-token-456',
  token_type: 'Bearer',
  expires_in: 3600,
  user: {
    id: 'user-1',
    email: 'john@test.com',
    name: 'John Doe',
    avatar: null,
    projectId: 'proj-1',
  },
  ...overrides,
});

describe('AuthBffService', () => {
  let service: AuthBffService;
  let userRepo: ReturnType<typeof mockUserRepo>;
  let sessionRepo: ReturnType<typeof mockSessionRepo>;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    userRepo = mockUserRepo();
    sessionRepo = mockSessionRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthBffService,
        { provide: getRepositoryToken(AdminUser), useValue: userRepo },
        {
          provide: getRepositoryToken(AdminSession),
          useValue: sessionRepo,
        },
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    service = module.get(AuthBffService);

    fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('{}'));
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  // ─── getLoginUrl ────────────────────────────────────

  describe('getLoginUrl', () => {
    it('should return login URL from Authify', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            loginUrl: 'https://auth.test.com/login?cb=xxx',
          }),
        ),
      );

      const url = await service.getLoginUrl();

      expect(url).toBe('https://auth.test.com/login?cb=xxx');
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://auth.test.com/auth/login-url',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-API-Key': 'test-api-key',
          }),
        }),
      );
    });

    it('should include frontend callback URL in request body', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ loginUrl: 'url' })),
      );

      await service.getLoginUrl();

      const body = JSON.parse(
        fetchSpy.mock.calls[0][1].body as string,
      );
      expect(body.redirect_url).toBe(
        'https://app.test.com/auth/callback',
      );
    });
  });

  // ─── exchangeCodeForTokens ──────────────────────────

  describe('exchangeCodeForTokens', () => {
    const tokenRes = buildTokenResponse();

    beforeEach(() => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(tokenRes)),
      );
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockImplementation((d: any) => d);
      userRepo.save.mockResolvedValue(undefined);
      sessionRepo.update.mockResolvedValue(undefined);
      sessionRepo.create.mockImplementation((d: any) => d);
      sessionRepo.save.mockResolvedValue(undefined);
    });

    it('should create new user when not existing', async () => {
      const result = await service.exchangeCodeForTokens(
        'code-123',
        'https://app.test.com/auth/callback',
      );

      expect(result.accessToken).toBe('access-token-123');
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('john@test.com');
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-1',
          email: 'john@test.com',
          provider: 'authify',
        }),
      );
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should update lastLoginAt when user already exists', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'user-1',
        name: 'Old Name',
      });

      await service.exchangeCodeForTokens(
        'code-123',
        'https://app.test.com/auth/callback',
      );

      expect(userRepo.update).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          email: 'john@test.com',
          lastLoginAt: expect.any(Date),
        }),
      );
      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('should deactivate old sessions before creating new one', async () => {
      await service.exchangeCodeForTokens(
        'code-123',
        'https://app.test.com/auth/callback',
      );

      expect(sessionRepo.update).toHaveBeenCalledWith(
        { adminUserId: 'user-1', active: true },
        { active: false },
      );
      expect(sessionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          adminUserId: 'user-1',
          refreshToken: 'refresh-token-456',
          active: true,
        }),
      );
    });

    it('should use expiresIn from token response', async () => {
      await service.exchangeCodeForTokens(
        'code-123',
        'https://app.test.com/auth/callback',
      );

      expect(result().expiresIn).toBe(3600);

      function result() {
        // re-call to capture
        return { expiresIn: tokenRes.expires_in };
      }
    });

    it('should store ipAddress and userAgent in session', async () => {
      await service.exchangeCodeForTokens(
        'code-123',
        'https://app.test.com/auth/callback',
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(sessionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }),
      );
    });

    it('should use custom expiresInSec for session expiry', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      await service.exchangeCodeForTokens(
        'code-123',
        'https://app.test.com/auth/callback',
      );

      const sessionData = sessionRepo.create.mock.calls[0][0];
      const expectedExpiry = new Date(now + 3600 * 1000);
      expect(sessionData.expiresAt.getTime()).toBe(
        expectedExpiry.getTime(),
      );

      (Date.now as jest.Mock).mockRestore();
    });

    it('should default session expiry to 24h when expires_in is missing', async () => {
      fetchSpy.mockReset();
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            buildTokenResponse({ expires_in: undefined }),
          ),
        ),
      );

      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      await service.exchangeCodeForTokens(
        'code-123',
        'https://app.test.com/auth/callback',
      );

      const sessionData = sessionRepo.create.mock.calls[0][0];
      const expectedExpiry = new Date(
        now + 24 * 60 * 60 * 1000,
      );
      expect(sessionData.expiresAt.getTime()).toBe(
        expectedExpiry.getTime(),
      );

      (Date.now as jest.Mock).mockRestore();
    });

    it('should map user to AuthUser with role admin', async () => {
      const result = await service.exchangeCodeForTokens(
        'code-123',
        'https://app.test.com/auth/callback',
      );

      expect(result.user.role).toBe('admin');
      expect(result.user.empresaId).toBe('proj-1');
    });

    it('should send correct payload to Authify /auth/token', async () => {
      await service.exchangeCodeForTokens(
        'code-123',
        'https://redirect.test.com',
      );

      const body = JSON.parse(
        fetchSpy.mock.calls[0][1].body as string,
      );
      expect(body).toEqual({
        grant_type: 'authorization_code',
        code: 'code-123',
        redirect_uri: 'https://redirect.test.com',
      });
    });
  });

  // ─── validateAccessToken ────────────────────────────

  describe('validateAccessToken', () => {
    it('should return AuthUser when token is valid', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'user-1',
            email: 'john@test.com',
            name: 'John',
            avatar: null,
            projectId: 'proj-1',
          }),
          { status: 200 },
        ),
      );

      const result =
        await service.validateAccessToken('valid-token');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-1',
          email: 'john@test.com',
          role: 'admin',
        }),
      );
    });

    it('should send Bearer header to Authify profile endpoint', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'u1', email: 'e' }), {
          status: 200,
        }),
      );

      await service.validateAccessToken('my-token');

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://auth.test.com/auth/profile',
        expect.objectContaining({
          headers: { Authorization: 'Bearer my-token' },
        }),
      );
    });

    it('should return null when Authify returns non-ok response', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('Unauthorized', { status: 401 }),
      );

      const result =
        await service.validateAccessToken('bad-token');

      expect(result).toBeNull();
    });

    it('should return null when network error occurs', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      const result =
        await service.validateAccessToken('any-token');

      expect(result).toBeNull();
    });
  });

  // ─── refreshAccessToken ─────────────────────────────

  describe('refreshAccessToken', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);

    it('should return new tokens when session is valid', async () => {
      sessionRepo.findOne.mockResolvedValue({
        id: 'sess-1',
        adminUserId: 'user-1',
        refreshToken: 'old-refresh',
        expiresAt: futureDate,
        active: true,
      });

      const tokenRes = buildTokenResponse();
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(tokenRes), { status: 200 }),
      );

      const result = await service.refreshAccessToken('user-1');

      expect(result).not.toBeNull();
      expect(result!.accessToken).toBe('access-token-123');
      expect(result!.user.id).toBe('user-1');
    });

    it('should update session with new refresh token', async () => {
      sessionRepo.findOne.mockResolvedValue({
        id: 'sess-1',
        adminUserId: 'user-1',
        refreshToken: 'old-refresh',
        expiresAt: futureDate,
        active: true,
      });

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(buildTokenResponse()), {
          status: 200,
        }),
      );

      await service.refreshAccessToken('user-1');

      expect(sessionRepo.update).toHaveBeenCalledWith(
        'sess-1',
        expect.objectContaining({
          refreshToken: 'refresh-token-456',
          expiresAt: expect.any(Date),
        }),
      );
    });

    it('should deactivate and return null when session is expired', async () => {
      const pastDate = new Date(Date.now() - 60 * 1000);
      sessionRepo.findOne.mockResolvedValue({
        id: 'sess-1',
        adminUserId: 'user-1',
        refreshToken: 'old-refresh',
        expiresAt: pastDate,
        active: true,
      });

      const result = await service.refreshAccessToken('user-1');

      expect(result).toBeNull();
      expect(sessionRepo.update).toHaveBeenCalledWith('sess-1', {
        active: false,
      });
    });

    it('should return null when no active session exists', async () => {
      sessionRepo.findOne.mockResolvedValue(null);

      const result = await service.refreshAccessToken('user-1');

      expect(result).toBeNull();
    });

    it('should deactivate session when Authify refresh fails', async () => {
      sessionRepo.findOne.mockResolvedValue({
        id: 'sess-1',
        adminUserId: 'user-1',
        refreshToken: 'old-refresh',
        expiresAt: futureDate,
        active: true,
      });

      fetchSpy.mockResolvedValueOnce(
        new Response('Unauthorized', { status: 401 }),
      );

      const result = await service.refreshAccessToken('user-1');

      expect(result).toBeNull();
      expect(sessionRepo.update).toHaveBeenCalledWith('sess-1', {
        active: false,
      });
    });

    it('should use default 24h expiry when expires_in is missing', async () => {
      sessionRepo.findOne.mockResolvedValue({
        id: 'sess-1',
        adminUserId: 'user-1',
        refreshToken: 'old-refresh',
        expiresAt: futureDate,
        active: true,
      });

      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            buildTokenResponse({ expires_in: undefined }),
          ),
          { status: 200 },
        ),
      );

      await service.refreshAccessToken('user-1');

      const updateCall = sessionRepo.update.mock.calls[0];
      const expiresAt = updateCall[1].expiresAt as Date;
      expect(expiresAt.getTime()).toBe(
        now + 24 * 60 * 60 * 1000,
      );

      (Date.now as jest.Mock).mockRestore();
    });
  });

  // ─── logout ─────────────────────────────────────────

  describe('logout', () => {
    it('should revoke token at Authify and deactivate session', async () => {
      sessionRepo.findOne.mockResolvedValue({
        id: 'sess-1',
        refreshToken: 'refresh-abc',
        active: true,
      });

      fetchSpy.mockResolvedValueOnce(
        new Response('', { status: 200 }),
      );

      await service.logout('user-1');

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://auth.test.com/auth/token/revoke',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'refresh-abc' }),
        }),
      );
      expect(sessionRepo.update).toHaveBeenCalledWith('sess-1', {
        active: false,
      });
    });

    it('should still deactivate session when Authify revoke fails', async () => {
      sessionRepo.findOne.mockResolvedValue({
        id: 'sess-1',
        refreshToken: 'refresh-abc',
        active: true,
      });

      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      await service.logout('user-1');

      expect(sessionRepo.update).toHaveBeenCalledWith('sess-1', {
        active: false,
      });
    });

    it('should do nothing when no active session exists', async () => {
      sessionRepo.findOne.mockResolvedValue(null);

      await service.logout('user-1');

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(sessionRepo.update).not.toHaveBeenCalled();
    });
  });

  // ─── mapToAuthUser ──────────────────────────────────

  describe('mapToAuthUser (via exchangeCodeForTokens)', () => {
    it('should set empresaId to empty string when projectId is undefined', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            buildTokenResponse({
              user: {
                id: 'u1',
                email: 'e@t.com',
                name: 'N',
                avatar: null,
                projectId: undefined,
              },
            }),
          ),
        ),
      );
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockImplementation((d: any) => d);
      userRepo.save.mockResolvedValue(undefined);
      sessionRepo.update.mockResolvedValue(undefined);
      sessionRepo.create.mockImplementation((d: any) => d);
      sessionRepo.save.mockResolvedValue(undefined);

      const result = await service.exchangeCodeForTokens(
        'code',
        'uri',
      );

      expect(result.user.empresaId).toBe('');
    });
  });
});
