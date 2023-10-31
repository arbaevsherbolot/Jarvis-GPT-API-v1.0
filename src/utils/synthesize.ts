import axios from 'axios';
import { getUrl, uploadAudio } from './supabase';

export const synthesizeSpeech = async (userId: number, text: string) => {
  return new Promise(async (resolve, reject) => {
    const response = await axios.post(
      `${process.env.ELEVEN_LABS_API_URL}/text-to-speech/${process.env.ELEVEN_LABS_VOICE_ID}/stream`,
      {
        text,
        model_id: process.env.ELEVEN_LABS_MODEL_ID,
        voice_settings: {
          stability: 0.8,
          similarity_boost: 0.7,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
          accept: 'audio/mpeg',
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
