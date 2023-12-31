import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CreateMessageDto } from './dto';
import { MessagesService } from './messages.service';
import { GetCurrentUserId } from '../auth/common/decorators';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

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

  @Post(':chatId/stream')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files'))
  async createStreamMessage(
    @Body() dto: CreateMessageDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Param('chatId', ParseIntPipe) chatId: number,
    @GetCurrentUserId() userId: number,
    @Res() response: Response,
  ) {
    return await this.messagesService.createStreamMessage(
      dto,
      files,
      chatId,
      userId,
      response,
    );
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
