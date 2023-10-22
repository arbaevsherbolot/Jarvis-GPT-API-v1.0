import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChatGptService {
  async chatGptRequest(transcript: string, prompt: string) {
    const data = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPEN_AI_SECRET_KEY}`,
    };

    try {
      const response = await axios.post(process.env.OPEN_AI_MODEL_URL, data, {
        headers,
      });
      const aiReply = response.data.choices[0].message.content;
      return aiReply;
    } catch {
      throw new ServiceUnavailableException('Failed request to ChatGPT');
    }
  }
}
