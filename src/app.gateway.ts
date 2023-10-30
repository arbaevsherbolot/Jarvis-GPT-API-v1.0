import { OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AppGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Connected');
      console.log(socket.id);
    });
  }

  @SubscribeMessage('newMessage')
  async onNewMessage(@MessageBody() message: any) {
    console.log(message);

    this.server.emit('onMessage', {
      msg: 'New Message',
      content: message,
    });
  }
}
