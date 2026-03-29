import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuditLoggerInterceptor } from './audit-logger.interceptor';

jest.mock('uuid', () => ({
  v4: () => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
}));

function createMockContext(user?: { id: string; email: string }) {
  const request: any = {
    method: 'GET',
    url: '/api/test',
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest' },
    user: user || undefined,
  };
  const response = { statusCode: 200 };

  return {
    context: {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as any,
    request,
    response,
  };
}

describe('AuditLoggerInterceptor', () => {
  let interceptor: AuditLoggerInterceptor;

  beforeEach(() => {
    interceptor = new AuditLoggerInterceptor();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log success with statusCode and duration', (done) => {
    const { context } = createMockContext();
    const logSpy = jest.spyOn(Logger.prototype, 'log');
    const next = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        const logArg = logSpy.mock.calls[0][0];
        const parsed = JSON.parse(logArg);
        expect(parsed.statusCode).toBe(200);
        expect(parsed.duration).toMatch(/\d+ms/);
        done();
      },
    });
  });

  it('should log error with error.message', (done) => {
    const { context } = createMockContext();
    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    const next = { handle: () => throwError(() => new Error('fail')) };

    interceptor.intercept(context, next).subscribe({
      error: () => {
        const logArg = errorSpy.mock.calls[0][0];
        const parsed = JSON.parse(logArg);
        expect(parsed.error).toBe('fail');
        done();
      },
    });
  });

  it('should log anonymous when no user present', (done) => {
    const { context } = createMockContext();
    const logSpy = jest.spyOn(Logger.prototype, 'log');
    const next = { handle: () => of(null) };

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        const parsed = JSON.parse(logSpy.mock.calls[0][0]);
        expect(parsed.userId).toBe('anonymous');
        expect(parsed.userEmail).toBe('');
        done();
      },
    });
  });

  it('should log authenticated user id and email', (done) => {
    const { context } = createMockContext({
      id: 'user-123',
      email: 'test@test.com',
    });
    const logSpy = jest.spyOn(Logger.prototype, 'log');
    const next = { handle: () => of(null) };

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        const parsed = JSON.parse(logSpy.mock.calls[0][0]);
        expect(parsed.userId).toBe('user-123');
        expect(parsed.userEmail).toBe('test@test.com');
        done();
      },
    });
  });

  it('should set requestId in UUID format', (done) => {
    const { context, request } = createMockContext();
    const logSpy = jest.spyOn(Logger.prototype, 'log');
    const next = { handle: () => of(null) };

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(request.requestId).toBe(
          'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        );
        const parsed = JSON.parse(logSpy.mock.calls[0][0]);
        expect(parsed.requestId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
        done();
      },
    });
  });
});
