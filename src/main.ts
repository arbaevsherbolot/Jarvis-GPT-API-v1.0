import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function start() {
  //Set CORS options
  const corsOptions: CorsOptions = {
    origin: 'https://jarvis-gpt-v1.vercel.app',
    credentials: true,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-HTTP-Method-Override',
      'Set-Cookie',
      'Cookie',
    ],
    // exposedHeaders: ['set-cookie'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  };

  const app = await NestFactory.create(AppModule, { cors: corsOptions });
  const port = process.env.PORT || 3000;

  //Set CORS configuration
  // app.enableCors(corsOptions);

  //Set the global validation pipes for our server
  app.useGlobalPipes(new ValidationPipe());

  //Set the Cookie Parser
  app.use(cookieParser());

  // Start the Nest.js application and log the server's address
  await app.listen(port, () =>
    console.log(`📢 Server starting on: http://localhost:${port}/ ⚡️`),
  );
}
start();
