import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserModule } from '../user/user.module';

@Module({
  providers: [ChatService],
  controllers: [ChatController],
  imports: [UserModule],
})
export class ChatModule {}
