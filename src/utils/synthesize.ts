import axios from 'axios';
import { getUrl, uploadAudio } from './supabase';

export const synthesizeSpeech = async (userId: number, text: string) => {
  const apiKey = process.env.OPEN_AI_SECRET_KEY;
  const apiUrl = process.env.TTS_AI_API_URL;

  return new Promise(async (resolve, reject) => {
    const response = await axios.post(
      `${apiUrl}`,
      {
        input: text,
        model: 'tts-1-hd',
        voice: 'echo',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        responseType: 'stream',
      },
    );

    const dataBuffer = [];

    response.data.on('data', (chunk) => {
      dataBuffer.push(chunk);
    });

    response.data.on('end', async () => {
      const finalBuffer = Buffer.concat(dataBuffer);
      const path = await uploadAudio(userId, finalBuffer);
      const audioUrl = getUrl('/audios', path);

      resolve(audioUrl);
    });

    response.data.on('error', (error) => {
      reject(error);
    });
  });
};
