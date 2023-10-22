import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SpeechToTextModule } from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SpeechToTextModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
