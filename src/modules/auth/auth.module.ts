import { Module } from '@nestjs/common';
import { JwtModule } from '../jwt/jwt.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { UserModule } from '../user/user.module';

@Module({
  imports: [JwtModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
