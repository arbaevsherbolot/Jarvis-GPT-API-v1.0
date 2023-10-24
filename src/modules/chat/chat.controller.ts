import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto';
import { GetCurrentUserId } from '../auth/common/decorators';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createChat(
    @Body() dto: CreateChatDto,
    @GetCurrentUserId() userId: number,
  ) {
    return await this.chatService.createChat(dto, userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getChats(@GetCurrentUserId() userId: number) {
    return await this.chatService.getChats(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getChat(
    @GetCurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.chatService.getChat(id, userId);
  }
}
