import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ChatGptService } from '../chat-gpt/chat-gpt.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [
    MessagesService,
    ChatGptService,
    SupabaseService,
    UsersService,
    PrismaService,
  ],
  controllers: [MessagesController],
})
export class MessagesModule {}
