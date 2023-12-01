import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UsersService } from '../users/users.service';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [UploadService, UsersService, SupabaseService, PrismaService],
  controllers: [UploadController],
})
export class UploadModule {}
