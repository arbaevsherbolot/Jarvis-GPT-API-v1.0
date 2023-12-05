import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function start() {
  //Set CORS options
  const corsOptions: CorsOptions = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  };

  const app = await NestFactory.create(AppModule, { cors: corsOptions });
  const port = process.env.PORT || 3000;

  //Set CORS configuration
  app.enableCors(corsOptions);

  //Set the global validation pipes for our server
  app.useGlobalPipes(new ValidationPipe());

  //Set the Cookie Parser
  app.use(cookieParser('SECRET_KEY'));

  // Start the Nest.js application and log the server's address
  await app.listen(port, () =>
    console.log(`📢 Server starting on: http://localhost:${port}/ ⚡️`),
  );
}
start();
