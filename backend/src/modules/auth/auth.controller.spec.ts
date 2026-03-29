import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthBffController } from './auth.controller';
import { AuthBffService } from './auth.service';
import { EmpresasService } from '../empresas/empresas.service';

describe('AuthBffController', () => {
  let controller: AuthBffController;
  let authService: Record<string, jest.Mock>;
  let empresasService: Record<string, jest.Mock>;

  const mockRes = () => ({
    redirect: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  });

  const mockReq = (opts: {
    cookies?: Record<string, string>;
    authorization?: string;
    code?: string;
  } = {}) => ({
    cookies: opts.cookies ?? {},
    headers: {
      authorization: opts.authorization,
      'user-agent': 'test-agent',
    },
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
    body: opts.code ? { code: opts.code } : {},
  });

  beforeEach(async () => {
    authService = {
      getLoginUrl: jest.fn().mockResolvedValue('https://auth.test/login'),
      exchangeCodeForTokens: jest.fn().mockResolvedValue({
        accessToken: 'tok-123',
        user: { id: 'u-1', email: 'a@b.com' },
        expiresIn: 3600,
      }),
      validateAccessToken: jest.fn().mockResolvedValue({
        id: 'u-1',
        email: 'a@b.com',
      }),
      refreshAccessToken: jest.fn().mockResolvedValue({
        accessToken: 'tok-new',
        expiresIn: 3600,
        user: { id: 'u-1' },
      }),
      logout: jest.fn().mockResolvedValue(undefined),
    };

    empresasService = {
      findAllByUser: jest.fn().mockResolvedValue([
        { id: 'emp-1' },
      ]),
    };

    const module = await Test.createTestingModule({
      controllers: [AuthBffController],
      providers: [
        { provide: AuthBffService, useValue: authService },
        { provide: EmpresasService, useValue: empresasService },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('https://app.test'),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthBffController);
  });

  it('login redirects to auth URL', async () => {
    const res = mockRes();
    await controller.login(res as any);
    expect(res.redirect).toHaveBeenCalledWith(
      'https://auth.test/login',
    );
  });

  it('callback throws when code is missing', async () => {
    const req = mockReq();
    const res = mockRes();
    await expect(
      controller.callback(undefined as any, req as any, res as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('callback exchanges code and sets cookie', async () => {
    const req = mockReq({ code: 'code-1' });
    const res = mockRes();
    const result = await controller.callback(
      'code-1',
      req as any,
      res as any,
    );
    expect(authService.exchangeCodeForTokens).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalled();
    expect(result).toHaveProperty('access_token', 'tok-123');
  });

  it('me throws when no token', async () => {
    const req = mockReq();
    await expect(controller.me(req as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('me returns user when token is valid (cookie)', async () => {
    const req = mockReq({
      cookies: { ohospedeiro_access_token: 'tok-123' },
    });
    const result = await controller.me(req as any);
    expect(result).toEqual({
      user: { id: 'u-1', email: 'a@b.com' },
    });
  });

  it('me returns user when token is in Authorization header', async () => {
    const req = mockReq({ authorization: 'Bearer tok-123' });
    const result = await controller.me(req as any);
    expect(result).toEqual({
      user: { id: 'u-1', email: 'a@b.com' },
    });
  });

  it('me throws when token is invalid', async () => {
    authService.validateAccessToken.mockResolvedValue(null);
    const req = mockReq({
      cookies: { ohospedeiro_access_token: 'bad-tok' },
    });
    await expect(controller.me(req as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('status returns authenticated false when no token', async () => {
    const req = mockReq();
    const result = await controller.status(req as any);
    expect(result).toEqual({ authenticated: false });
  });

  it('status returns authenticated true with companies', async () => {
    const req = mockReq({
      cookies: { ohospedeiro_access_token: 'tok-123' },
    });
    const result = await controller.status(req as any);
    expect(result.authenticated).toBe(true);
    expect(result.companies).toHaveLength(1);
    expect(result.activeCompanyId).toBe('emp-1');
  });

  it('status returns authenticated false when token invalid', async () => {
    authService.validateAccessToken.mockResolvedValue(null);
    const req = mockReq({
      cookies: { ohospedeiro_access_token: 'bad' },
    });
    const result = await controller.status(req as any);
    expect(result).toEqual({ authenticated: false });
  });

  it('refresh throws when no token', async () => {
    const req = mockReq();
    const res = mockRes();
    await expect(
      controller.refresh(req as any, res as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('refresh throws when token invalid', async () => {
    authService.validateAccessToken.mockResolvedValue(null);
    const req = mockReq({
      cookies: { ohospedeiro_access_token: 'bad' },
    });
    const res = mockRes();
    await expect(
      controller.refresh(req as any, res as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('refresh succeeds and sets new cookie', async () => {
    const req = mockReq({
      cookies: { ohospedeiro_access_token: 'tok-123' },
    });
    const res = mockRes();
    const result = await controller.refresh(
      req as any,
      res as any,
    );
    expect(res.cookie).toHaveBeenCalled();
    expect(result).toHaveProperty('access_token', 'tok-new');
  });

  it('refresh clears cookie when refreshAccessToken returns null', async () => {
    authService.refreshAccessToken.mockResolvedValue(null);
    const req = mockReq({
      cookies: { ohospedeiro_access_token: 'tok-123' },
    });
    const res = mockRes();
    await expect(
      controller.refresh(req as any, res as any),
    ).rejects.toThrow(UnauthorizedException);
    expect(res.clearCookie).toHaveBeenCalled();
  });

  it('logout clears cookie and calls service', async () => {
    const req = mockReq({
      cookies: { ohospedeiro_access_token: 'tok-123' },
    });
    const res = mockRes();
    const result = await controller.logout(
      req as any,
      res as any,
    );
    expect(authService.logout).toHaveBeenCalledWith('u-1');
    expect(res.clearCookie).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Logout realizado' });
  });

  it('logout still clears cookie when no token', async () => {
    const req = mockReq();
    const res = mockRes();
    const result = await controller.logout(
      req as any,
      res as any,
    );
    expect(authService.logout).not.toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Logout realizado' });
  });
});
