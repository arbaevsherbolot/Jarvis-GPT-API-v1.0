import {
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { GetCurrentUserId } from '../auth/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('speech-to-text')
export class SpeechToTextController {
  constructor(private speechToTextService: SpeechToTextService) {}

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async startRecognition(
    @GetCurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'audio/*',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.speechToTextService.startRecognition(file, userId, id);
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
