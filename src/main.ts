import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function start() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.PORT || 3000;

  //Set CORS configuration
  app.enableCors();

  //Set the global prefix for our server
  app.setGlobalPrefix('api');

  //Set the global validation pipes for our server
  app.useGlobalPipes(new ValidationPipe());

  //Set the Cookie Parser
  app.use(cookieParser());

  await app.listen(port, () =>
    console.log(`📢 Server starting on: http://localhost:${port}/ ⚡️`),
  );
}
start();
