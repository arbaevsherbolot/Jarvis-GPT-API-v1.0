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
import { SpeechToTextService } from './speech-to-text.service';
import { StartRecognitionDto } from './dto/speech-to-text.dto';
import { GetCurrentUserId } from '../auth/common/decorators';

@Controller('speech-to-text')
export class SpeechToTextController {
  constructor(private speechToTextService: SpeechToTextService) {}

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async startRecognition(
    @Body() dto: StartRecognitionDto,
    @GetCurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.speechToTextService.startRecognition(dto, userId, id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
  ) {
    return await this.speechToTextService.getMessages(id, userId);
  }
}
