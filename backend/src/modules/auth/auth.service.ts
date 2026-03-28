import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AdminUser } from './entities/admin-user.entity';
import { AdminSession } from './entities/admin-session.entity';
import { AuthUser, TokenResponse } from './interfaces/jwt-payload.interface';

const DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

@Injectable()
export class AuthBffService {
  private readonly logger = new Logger(AuthBffService.name);
  private readonly authServiceUrl: string;
  private readonly apiKey: string;
  private readonly frontendUrl: string;

  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminSession)
    private readonly adminSessionRepository: Repository<AdminSession>,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.getOrThrow('AUTHIFY_URL');
    this.apiKey = this.configService.getOrThrow('AUTHIFY_API_KEY');
    this.frontendUrl = this.configService.getOrThrow('FRONTEND_URL');
  }

  async getLoginUrl(): Promise<string> {
    const callbackUrl = `${this.frontendUrl}/auth/callback`;

    const response = await fetch(
      `${this.authServiceUrl}/auth/login-url`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({ redirect_url: callbackUrl }),
      },
    );

    const data = await response.json();
    return data.loginUrl;
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; user: AuthUser; expiresIn: number }> {
    const response = await fetch(
      `${this.authServiceUrl}/auth/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      },
    );

    const tokenResponse: TokenResponse = await response.json();

    await this.ensureLocalUser(tokenResponse.user);

    await this.saveSession(
      tokenResponse.user.id,
      tokenResponse.refresh_token,
      ipAddress,
      userAgent,
      tokenResponse.expires_in,
    );

    return {
      accessToken: tokenResponse.access_token,
      user: this.mapToAuthUser(tokenResponse.user),
      expiresIn: tokenResponse.expires_in,
    };
  }

  async validateAccessToken(
    accessToken: string,
  ): Promise<AuthUser | null> {
    try {
      const response = await fetch(
        `${this.authServiceUrl}/auth/profile`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!response.ok) return null;

      const user = await response.json();
      return this.mapToAuthUser(user);
    } catch {
      return null;
    }
  }

  async refreshAccessToken(
    userId: string,
  ): Promise<{
    accessToken: string;
    user: AuthUser;
    expiresIn: number;
  } | null> {
    const session = await this.adminSessionRepository.findOne({
      where: { adminUserId: userId, active: true },
      order: { createdAt: 'DESC' },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.adminSessionRepository.update(session.id, {
          active: false,
        });
      }
      return null;
    }

    const response = await fetch(
      `${this.authServiceUrl}/auth/token/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: session.refreshToken,
        }),
      },
    );

    if (!response.ok) {
      await this.adminSessionRepository.update(session.id, {
        active: false,
      });
      return null;
    }

    const tokenResponse: TokenResponse = await response.json();
    const expiresInMs = tokenResponse.expires_in
      ? tokenResponse.expires_in * 1000
      : DEFAULT_EXPIRY_MS;

    await this.adminSessionRepository.update(session.id, {
      refreshToken: tokenResponse.refresh_token,
      expiresAt: new Date(Date.now() + expiresInMs),
    });

    return {
      accessToken: tokenResponse.access_token,
      user: this.mapToAuthUser(tokenResponse.user),
      expiresIn: tokenResponse.expires_in,
    };
  }

  async logout(userId: string): Promise<void> {
    const session = await this.adminSessionRepository.findOne({
      where: { adminUserId: userId, active: true },
      order: { createdAt: 'DESC' },
    });

    if (session) {
      try {
        await fetch(`${this.authServiceUrl}/auth/token/revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: session.refreshToken }),
        });
      } catch (error) {
        this.logger.warn('Failed to revoke token at Authify', error);
      }

      await this.adminSessionRepository.update(session.id, {
        active: false,
      });
    }
  }

  private async ensureLocalUser(
    authUser: TokenResponse['user'],
  ): Promise<void> {
    const existing = await this.adminUserRepository.findOne({
      where: { id: authUser.id },
    });

    if (existing) {
      await this.adminUserRepository.update(authUser.id, {
        email: authUser.email,
        name: authUser.name || existing.name,
        lastLoginAt: new Date(),
      });
    } else {
      const newUser = this.adminUserRepository.create({
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        emailVerified: true,
        provider: 'authify',
        lastLoginAt: new Date(),
      });
      await this.adminUserRepository.save(newUser);
    }
  }

  private async saveSession(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
    expiresInSec?: number,
  ): Promise<void> {
    await this.adminSessionRepository.update(
      { adminUserId: userId, active: true },
      { active: false },
    );

    const expiresInMs = expiresInSec
      ? expiresInSec * 1000
      : DEFAULT_EXPIRY_MS;

    const session = this.adminSessionRepository.create({
      adminUserId: userId,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + expiresInMs),
      active: true,
    });

    await this.adminSessionRepository.save(session);
  }

  private mapToAuthUser(
    user: TokenResponse['user'],
  ): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      projectId: user.projectId,
      empresaId: user.projectId ?? '',
      role: 'admin',
    };
  }
}
