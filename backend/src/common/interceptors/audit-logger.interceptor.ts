import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuditLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLogger');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const requestId = uuidv4();
    const startTime = Date.now();

    request.requestId = requestId;

    const userId = request.user?.id || 'anonymous';
    const userEmail = request.user?.email || '';

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;
          this.logger.log(
            JSON.stringify({
              requestId,
              method,
              url,
              statusCode: response.statusCode,
              duration: `${duration}ms`,
              userId,
              userEmail,
              ip,
              userAgent: headers['user-agent'],
            }),
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            JSON.stringify({
              requestId,
              method,
              url,
              statusCode: error.status || 500,
              duration: `${duration}ms`,
              userId,
              userEmail,
              ip,
              error: error.message,
            }),
          );
        },
      }),
    );
  }
}
