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
import { CreateMessageDto } from './dto';
import { MessagesService } from './messages.service';
import { GetCurrentUserId } from '../auth/common/decorators';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post(':chatId')
  @HttpCode(HttpStatus.OK)
  async createMessage(
    @Body() dto: CreateMessageDto,
    @Param('chatId', ParseIntPipe) chatId: number,
    @GetCurrentUserId() userId: number,
  ) {
    return await this.messagesService.createMessage(dto, chatId, userId);
  }

  @Get(':chatId')
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Param('chatId', ParseIntPipe) chatId: number,
    @GetCurrentUserId() userId: number,
  ) {
    return await this.messagesService.getMessages(chatId, userId);
  }
}
