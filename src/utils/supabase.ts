import { BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqyhpkpfgerxvsbdnguj.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxeWhwa3BmZ2VyeHZzYmRuZ3VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODA3NjczMiwiZXhwIjoyMDEzNjUyNzMyfQ.tS6y3AQv1MTYGVtQ2PTFQ9sboyFebuD1KcRFP_RpulY';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const getUrl = (bucket: string, filename: string) => {
  if (!filename) return '';
  return `${supabaseUrl}/storage/v1/object/public${bucket}/${filename}`;
};

const generateUniqueFileName = (userId: number, originalFileName: string) => {
  const timestamp = Date.now();
  const fileExtension = originalFileName.split('.').pop();
  return `user-${userId}-photo-${timestamp}.${fileExtension}`;
};

export const uploadPhoto = async (
  userId: number,
  file: Express.Multer.File,
) => {
  const maxSize = 15 * 1024 * 1024; // 15 MB
  if (file.size > maxSize) {
    throw new BadRequestException('File size exceeds the 15 MB limit');
  }

  try {
    const filename = generateUniqueFileName(userId, file.originalname);

    const { data } = await supabase.storage
      .from('/photos')
      .upload(filename, file.buffer, {
        upsert: true,
      });

    return data.path;
  } catch (e) {
    console.error(e);
    throw new Error('Error uploading file to supabase');
  }
};

export const uploadAudio = async (userId: number, buffer: Buffer) => {
  try {
    let num = (Math.random() * 100000000).toFixed(0);
    const filename = `user-${userId}-audio-${num}.mp3`;

    const { data } = await supabase.storage
      .from('/audios')
      .upload(filename, buffer, {
        upsert: true,
      });

    return data.path;
  } catch (e) {
    console.error(e);
    throw new Error('Error uploading file to supabase');
  }
};
