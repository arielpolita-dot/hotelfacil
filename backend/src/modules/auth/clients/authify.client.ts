import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AuthifyContextMetadata,
  AuthifyRegisterContextPayload,
} from '../interfaces/authify-context.interface';

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [100, 300, 900];
const RETRY_STATUSES = new Set([429]);

@Injectable()
export class AuthifyClient {
  private readonly logger = new Logger(AuthifyClient.name);
  private readonly authServiceUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.authServiceUrl = this.configService.getOrThrow('AUTHIFY_URL');
    this.apiKey = this.configService.getOrThrow('AUTHIFY_API_KEY');
  }

  async registerContext(
    externalContextId: string,
    name: string,
    accessToken: string,
    metadata?: AuthifyContextMetadata,
  ): Promise<void> {
    const url = `${this.authServiceUrl}/auth/contexts/${encodeURIComponent(
      externalContextId,
    )}`;
    const payload: AuthifyRegisterContextPayload = { name };
    if (metadata !== undefined) {
      payload.metadata = metadata;
    }
    const body = JSON.stringify(payload);

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
            Authorization: `Bearer ${accessToken}`,
          },
          body,
        });

        if (response.ok) return;

        const shouldRetry = this.isRetryable(response.status);
        const errorBody = await response.text();
        lastError = new Error(
          `Authify registerContext failed: ${response.status} ${errorBody}`,
        );

        if (!shouldRetry) throw lastError;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (this.isFatalThrown(lastError)) throw lastError;
      }

      if (attempt < MAX_ATTEMPTS - 1) {
        await this.sleep(BACKOFF_MS[attempt]);
      }
    }

    throw lastError ?? new Error('Authify registerContext failed');
  }

  private isRetryable(status: number): boolean {
    return status >= 500 || RETRY_STATUSES.has(status);
  }

  private isFatalThrown(error: Error): boolean {
    return /Authify registerContext failed: 4\d\d /.test(error.message);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
