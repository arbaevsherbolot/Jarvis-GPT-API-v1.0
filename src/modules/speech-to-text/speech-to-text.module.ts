import { Module } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { SpeechToTextController } from './speech-to-text.controller';
import { ChatGptModule } from '../chat-gpt/chat-gpt.module';

@Module({
  imports: [ChatGptModule],
  providers: [SpeechToTextService],
  controllers: [SpeechToTextController]
})
export class SpeechToTextModule {}
