import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UsersService } from '../users/users.service';

@Module({
  providers: [ChatService, UsersService],
  controllers: [ChatController],
})
export class ChatModule {}
