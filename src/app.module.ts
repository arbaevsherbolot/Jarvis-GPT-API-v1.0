import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import {
  AuthModule,
  ChatGptModule,
  JwtModule,
  PrismaModule,
  SpeechToTextModule,
  ChatModule,
} from './modules';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './modules/auth/common/guards';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
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
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
