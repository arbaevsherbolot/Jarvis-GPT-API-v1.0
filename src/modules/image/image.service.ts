import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatGptService } from '../chat-gpt/chat-gpt.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { generateImageDto, newImageDto } from './dto';
import { getUrl, uploadPhoto } from '../../utils/supabase';

@Injectable()
export class ImageService {
  constructor(
    private chatGptService: ChatGptService,
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async newImage(
    id: number,
    userId: number,
    file: Express.Multer.File,
    dto: newImageDto,
  ) {
    const { text } = dto;

    const user = await this.userService.getUser(userId);

    const chat = await this.prisma.chat.findFirst({
      where: {
        id,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const path = await uploadPhoto(user.id, file);
    const url = getUrl('/photos', path);

    const output = await this.chatGptService.chatGptVision(text, url);
    const audioUrl = await this.chatGptService.synthesizeSpeech(
      user.id,
      output,
    );

    const image = await this.prisma.image.create({
      data: {
        chatId: chat.id,
        text,
        url,
        output,
        audioSource: audioUrl,
      },
    });

    try {
      return image;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getImage(id: number, userId: number) {
    await this.userService.getUser(userId);

    const image = await this.prisma.image.findFirst({
      where: {
        id,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    try {
      return image;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getImages(userId: number) {
    await this.userService.getUser(userId);

    const images = await this.prisma.image.findMany();

    if (!images) {
      throw new NotFoundException('Images not found');
    }

    try {
      return images;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async generateImage(id: number, userId: number, dto: generateImageDto) {
    const { text } = dto;

    await this.userService.getUser(userId);

    const chat = await this.prisma.chat.findFirst({
      where: {
        id,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const url = await this.chatGptService.generateImage(text);

    try {
      return url;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
