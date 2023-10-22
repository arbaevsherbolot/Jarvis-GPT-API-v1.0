import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { StartRecognitionDto } from './dto/speech-to-text.dto';

@Controller('speech-to-text')
export class SpeechToTextController {
  constructor(private speechToTextService: SpeechToTextService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async startRecognition(@Body() dto: StartRecognitionDto) {
    return await this.speechToTextService.startRecognition(dto);
  }
}
