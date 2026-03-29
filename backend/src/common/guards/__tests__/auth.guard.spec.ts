import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';

const mockAuthBffService = () => ({
  validateAccessToken: jest.fn(),
});

const buildContext = (overrides: {
  cookies?: Record<string, string>;
  authorization?: string;
}): ExecutionContext => {
  const request = {
    cookies: overrides.cookies ?? {},
    headers: {
      authorization: overrides.authorization,
    },
    user: undefined as any,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authService: ReturnType<typeof mockAuthBffService>;

  beforeEach(() => {
    authService = mockAuthBffService();
    guard = new JwtAuthGuard(authService as any);
  });

  it('should return true and set request.user when cookie token is valid', async () => {
    const user = { id: 'u1', email: 'e@t.com', role: 'admin' };
    authService.validateAccessToken.mockResolvedValue(user);

    const ctx = buildContext({
      cookies: { ohospedeiro_access_token: 'cookie-token' },
    });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    const req = ctx.switchToHttp().getRequest() as any;
    expect(req.user).toEqual(user);
    expect(authService.validateAccessToken).toHaveBeenCalledWith(
      'cookie-token',
    );
  });

  it('should return true when Bearer token is valid', async () => {
    const user = { id: 'u1', email: 'e@t.com' };
    authService.validateAccessToken.mockResolvedValue(user);

    const ctx = buildContext({
      authorization: 'Bearer bearer-token-123',
    });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(authService.validateAccessToken).toHaveBeenCalledWith(
      'bearer-token-123',
    );
  });

  it('should throw UnauthorizedException when no token provided', async () => {
    const ctx = buildContext({});

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(authService.validateAccessToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    authService.validateAccessToken.mockResolvedValue(null);

    const ctx = buildContext({
      cookies: { ohospedeiro_access_token: 'bad-token' },
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should prefer cookie over Bearer header', async () => {
    const user = { id: 'u1' };
    authService.validateAccessToken.mockResolvedValue(user);

    const ctx = buildContext({
      cookies: { ohospedeiro_access_token: 'cookie-tok' },
      authorization: 'Bearer bearer-tok',
    });

    await guard.canActivate(ctx);

    expect(authService.validateAccessToken).toHaveBeenCalledWith(
      'cookie-tok',
    );
  });

  it('should require "Bearer " prefix for authorization header', async () => {
    const ctx = buildContext({
      authorization: 'Basic some-token',
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should ignore empty authorization header', async () => {
    const ctx = buildContext({
      authorization: '',
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
