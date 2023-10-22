import { Global, Module } from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';

@Global()
@Module({
  providers: [ChatGptService],
  exports: [ChatGptService]
})
export class ChatGptModule {}
