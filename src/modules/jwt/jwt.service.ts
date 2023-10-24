import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtSignOptions, JwtService as NestJwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtService extends NestJwtService {
  constructor() {
    super();
  }

  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  async compareToken(token1: string, token2: string): Promise<boolean> {
    return bcrypt.compare(token1, token2);
  }

  async createAccessToken(userId: number): Promise<string> {
    return this.signAsync(
      { id: userId } as object,
      {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: 60 * 30, // 30 minutes
      } as JwtSignOptions,
    );
  }

  async createRefreshToken(userId: number): Promise<string> {
    return this.signAsync({ id: userId }, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: 60 * 60 * 24 * 7, // 1 week
    } as JwtSignOptions);
  }

  async generateTokens(
    userId: number,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const accessToken = await this.createAccessToken(userId);
    const refreshToken = await this.createRefreshToken(userId);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async generateResetPasswordSecret(userId: number): Promise<string> {
    const token = await this.signAsync({ id: userId }, {
      secret: process.env.JWT_ACCESS_TOKEN_RESET_SECRET,
      expiresIn: 60 * 2, // 2 minutes
    } as JwtSignOptions);

    return token;
  }

  async compareResetPasswordSecret(token: string) {
    try {
      const decoded = await this.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_TOKEN_RESET_SECRET,
      });

      return decoded;
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    }
  }
}
