import {
  HttpException,
  HttpStatus,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

function createMockHost(url = '/test', method = 'GET') {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });

  return {
    host: {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url, method }),
      }),
    } as any,
    json,
    status,
  };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should format HttpException with correct status and message', () => {
    const { host, status, json } = createMockHost();
    const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    const body = json.mock.calls[0][0];
    expect(body.statusCode).toBe(400);
    expect(body.message).toBe('Bad request');
    expect(body.path).toBe('/test');
    expect(body.method).toBe('GET');
  });

  it('should handle NotFoundException with 404', () => {
    const { host, status, json } = createMockHost();

    filter.catch(new NotFoundException('Not found'), host);

    expect(status).toHaveBeenCalledWith(404);
  });

  it('should default to 500 for unknown errors', () => {
    const { host, status, json } = createMockHost();

    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0];
    expect(body.message).toBe('Internal server error');
  });

  it('should include statusCode, timestamp, path, method, message', () => {
    const { host, json } = createMockHost('/api/users', 'POST');

    filter.catch(new HttpException('fail', 422), host);

    const body = json.mock.calls[0][0];
    expect(body).toHaveProperty('statusCode', 422);
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('path', '/api/users');
    expect(body).toHaveProperty('method', 'POST');
    expect(body).toHaveProperty('message');
  });

  it('should log error with stack for 5xx status codes', () => {
    const { host } = createMockHost();
    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    const error = new Error('server crash');

    filter.catch(error, host);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('500'),
      expect.stringContaining('server crash'),
    );
  });
});
