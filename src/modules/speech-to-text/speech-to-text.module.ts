import { Module } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { SpeechToTextController } from './speech-to-text.controller';
import { ChatGptService } from '../chat-gpt/chat-gpt.service';
import { UsersService } from '../users/users.service';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  providers: [
    SpeechToTextService,
    ChatGptService,
    UsersService,
    SupabaseService,
  ],
  controllers: [SpeechToTextController],
})
export class SpeechToTextModule {}
