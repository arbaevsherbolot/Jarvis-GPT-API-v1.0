import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  GoogleStrategy,
  GitHubStrategy,
  AccessTokenStrategy,
  RefreshTokenStrategy,
} from './strategies';

@Module({
  providers: [
    AuthService,
    UsersService,
    JwtService,
    PrismaService,
    GoogleStrategy,
    GitHubStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
