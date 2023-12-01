import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(
    private usersService: UsersService,
    private supabaseService: SupabaseService,
    private prisma: PrismaService,
  ) {}

  async uploadPhoto(userId: number, file: Express.Multer.File) {
    const user = await this.usersService.findById(userId);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const filename = await this.supabaseService.uploadPhoto(user.id, file);
    const url = await this.supabaseService.getUrl('/photos', filename);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        photo: url,
      },
    });

    try {
      return updatedUser.photo;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
