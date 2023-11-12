import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAIApi from 'openai';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';
import { getUrl, uploadAudio } from '../../utils/supabase';
import { File } from 'openai/_shims/web-types';

type Message = {
  id: number;
  userId: number;
  chatId: number;
  text: string;
  ai?: boolean;
  audioSource?: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ChatGptService {
  public openai: OpenAIApi;
  public file: File;

  constructor() {
    this.openai = new OpenAIApi({
      apiKey: process.env.OPEN_AI_SECRET_KEY,
    });
  }

  async chatGptRequest(prompt: string, messages: Message[]): Promise<string> {
    try {
      const history = messages.map(
        (message): ChatCompletionMessageParam => ({
          role: message.ai ? 'assistant' : 'user',
          content: message.text,
        }),
      );

      const completion: ChatCompletion =
        await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: prompt,
            },
            ...history,
          ],
          temperature: 0.5,
          max_tokens: 1000,
        });

      const [content] = completion.choices.map(
        (choice) => choice.message.content,
      );

      return content;
    } catch (e) {
      console.error(e);
      throw new ServiceUnavailableException('Failed request to ChatGPT');
    }
  }

  async synthesizeSpeech(userId: number, text: string): Promise<string> {
    try {
      const ttsResponse = await this.openai.audio.speech.create({
        input: text,
        model: 'tts-1-hd',
        voice: 'alloy',
      });

      const arrayBuffer = await ttsResponse.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      const path = await uploadAudio(userId, audioBuffer);
      const audioUrl = getUrl('/audios', path);

      return audioUrl;
    } catch (e) {
      console.error(e);
      throw new ServiceUnavailableException('Failed to synthesize speech');
    }
  }

  async transcribeAudio(
    audioBuffer: Buffer,
    language: string,
  ): Promise<string> {
    const blob = new Blob([audioBuffer], {
      type: 'audio/wav',
    });
    this.file = new File([blob], 'input.wav', { type: 'audio/wav' });

    try {
      const whisperResponse = await this.openai.audio.transcriptions.create({
        model: 'whisper-1',
        language,
        file: this.file,
        response_format: 'json',
      });

      return whisperResponse.text;
    } catch (e) {
      console.error(e);
      throw new ServiceUnavailableException('Failed to transcribe audio');
    }
  }
}
