import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function start() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.PORT || 3000;

  //CORS options
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  };

  //Set CORS configuration
  app.enableCors(corsOptions);

  //Set the global validation pipes for our server
  app.useGlobalPipes(new ValidationPipe());

  //Set the Cookie Parser
  app.use(cookieParser());

  await app.listen(port, () =>
    console.log(`📢 Server starting on: http://localhost:${port}/ ⚡️`),
  );
}
start();
