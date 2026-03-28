import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { AuthBffService } from './auth.service';

const COOKIE_NAME = 'ohospedeiro_access_token';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24h

@ApiTags('Auth')
@Controller('auth')
export class AuthBffController {
  private readonly frontendUrl: string;

  constructor(
    private readonly authBffService: AuthBffService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.getOrThrow('FRONTEND_URL');
  }

  @Get('login')
  @ApiOperation({ summary: 'Redirect to Authify login' })
  @ApiResponse({ status: 302, description: 'Redirect to login URL' })
  async login(@Res() res: Response) {
    const loginUrl = await this.authBffService.getLoginUrl();
    res.redirect(loginUrl);
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange auth code for token' })
  @ApiResponse({ status: 200, description: 'Token received' })
  @ApiResponse({ status: 401, description: 'Invalid code' })
  async callback(
    @Body('code') code: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!code) {
      throw new UnauthorizedException('Missing authorization code');
    }

    const redirectUri = `${this.frontendUrl}/auth/callback`;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const { accessToken, user, expiresIn } =
      await this.authBffService.exchangeCodeForTokens(
        code,
        redirectUri,
        ipAddress,
        userAgent,
      );

    this.setAccessTokenCookie(res, accessToken, expiresIn);

    return {
      token_type: 'Bearer',
      access_token: accessToken,
      expires_in: expiresIn,
      user,
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user from token' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async me(@Req() req: Request) {
    const accessToken = this.extractToken(req);
    if (!accessToken) {
      throw new UnauthorizedException('Authentication required');
    }

    const user =
      await this.authBffService.validateAccessToken(accessToken);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return { user };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check auth status (no 401)' })
  @ApiResponse({ status: 200, description: 'Auth status' })
  async status(@Req() req: Request) {
    const accessToken = this.extractToken(req);
    if (!accessToken) return { authenticated: false };

    const user =
      await this.authBffService.validateAccessToken(accessToken);
    if (!user) return { authenticated: false };

    return { authenticated: true, user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Refresh failed' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = this.extractToken(req);
    if (!accessToken) {
      throw new UnauthorizedException('No token found');
    }

    const user =
      await this.authBffService.validateAccessToken(accessToken);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    const result =
      await this.authBffService.refreshAccessToken(user.id);
    if (!result) {
      this.clearAccessTokenCookie(res);
      throw new UnauthorizedException('Refresh failed');
    }

    this.setAccessTokenCookie(
      res,
      result.accessToken,
      result.expiresIn,
    );

    return {
      token_type: 'Bearer',
      access_token: result.accessToken,
      expires_in: result.expiresIn,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and clear cookie' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = this.extractToken(req);

    if (accessToken) {
      const user =
        await this.authBffService.validateAccessToken(accessToken);
      if (user) {
        await this.authBffService.logout(user.id);
      }
    }

    this.clearAccessTokenCookie(res);
    return { message: 'Logout realizado' };
  }

  private extractToken(req: Request): string | null {
    const cookieToken = req.cookies?.[COOKIE_NAME];
    if (cookieToken) return cookieToken;

    const authHeader = req.headers.authorization as string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  private setAccessTokenCookie(
    res: Response,
    accessToken: string,
    expiresInSec?: number,
  ): void {
    const maxAge = expiresInSec
      ? expiresInSec * 1000
      : COOKIE_MAX_AGE;

    res.cookie(COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge,
      path: '/',
    });
  }

  private clearAccessTokenCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
  }
}
