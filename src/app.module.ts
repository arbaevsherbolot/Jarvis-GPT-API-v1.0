import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  AuthModule,
  ChatGptModule,
  JwtModule,
  PrismaModule,
  SpeechToTextModule,
  ChatModule,
  UserModule,
} from './modules';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './modules/auth/common/guards';
import { MailerModule } from '@nestjs-modules/mailer';
import { GoogleStrategy } from './modules/auth/strategies';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        port: 587,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
    }),
    SpeechToTextModule,
    ChatGptModule,
    AuthModule,
    JwtModule,
    PrismaModule,
    ChatModule,
    UserModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    GoogleStrategy,
  ],
})
export class AppModule {}
