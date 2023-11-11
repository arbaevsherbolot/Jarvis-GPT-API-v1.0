import { Module } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { SpeechToTextController } from './speech-to-text.controller';
import { ChatGptModule } from '../chat-gpt/chat-gpt.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ChatGptModule, UserModule],
  providers: [SpeechToTextService],
  controllers: [SpeechToTextController]
})
export class SpeechToTextModule {}
