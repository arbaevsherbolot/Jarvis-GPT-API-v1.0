import { Global, Module } from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';
import { SupabaseService } from '../supabase/supabase.service';

@Global()
@Module({
  providers: [ChatGptService, SupabaseService],
  exports: [ChatGptService],
})
export class ChatGptModule {}
