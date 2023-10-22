import { Injectable } from '@nestjs/common';
import { ChatGptService } from '../chat-gpt/chat-gpt.service';
import { StartRecognitionDto } from './dto/speech-to-text.dto';
import { Readable } from 'stream';
import FormData from 'form-data'; 
import axios from 'axios';

@Injectable()
export class SpeechToTextService {
  constructor(private chatGptService: ChatGptService) {}

  async startRecognition(dto: StartRecognitionDto) {
    const { audio: base64Audio } = dto;
    const audioData = Buffer.from(base64Audio, 'base64');

    const bufferToStream = (buffer) => {
      return Readable.from(buffer);
    };

    const formData = new FormData();
    const audioStream = bufferToStream(audioData);
    const model = 'whisper-1';
    const language = 'en';
    const format = 'json';
    const apiKey = process.env.OPEN_AI_SECRET_KEY;
    const url = process.env.WHISPER_AI_API_URL;

    formData.append('model', model);
    formData.append('language', language);
    formData.append('response_format', format);
    formData.append('file', audioStream, {
      filename: 'audio.mp3',
      contentType: 'audio/webm',
    });

    const config = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        //@ts-ignore
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
      },
    };

    try {
      const response = await axios.post(url, formData, config);
      const transcript = response.data.text;

      const aiReply = await this.chatGptService.chatGptRequest(
        transcript,
        'Just answer to my questions',
      );

      return { transcript, aiReply };
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
