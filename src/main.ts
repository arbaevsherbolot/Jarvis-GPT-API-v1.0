import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function start() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.PORT || 888;

  //Set CORS configuration
  app.enableCors();

  //Set the global prefix for our server
  app.setGlobalPrefix('api');

  //Set the global validation pipes for our server
  app.useGlobalPipes(new ValidationPipe());

  // Use the WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(port, () =>
    console.log(`📢 Server starting on: http://localhost:${port}/ ⚡️`),
  );
}
start();
