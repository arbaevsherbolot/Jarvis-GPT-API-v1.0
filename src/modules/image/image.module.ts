import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { ChatGptService } from '../chat-gpt/chat-gpt.service';
import { UsersService } from '../users/users.service';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  providers: [ImageService, ChatGptService, UsersService, SupabaseService],
  controllers: [ImageController],
})
export class ImageModule {}
