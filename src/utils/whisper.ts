import axios from 'axios';
import type FormData from 'form-data';

export const transcribe = async (formData: FormData) => {
  const apiKey = process.env.OPEN_AI_SECRET_KEY;
  const url = process.env.WHISPER_AI_API_URL;

  const config = {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      //@ts-ignore
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
    },
  };

  const response = await axios.post(url, formData, config);
  const transcript = response.data.text;
  return transcript;
};
