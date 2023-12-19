import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatDto, EditChatDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async createChat(dto: CreateChatDto, userId: number) {
    const { title, language } = dto;

    const slug = title
      .replace(/[:?#[\]@!$&'()*+%|,/;=]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\s/g, '-');

    const user = await this.usersService.findById(userId);

    const existChat = await this.prisma.chat.findFirst({
      where: {
        userId: user.id,
        title,
        language,
      },
    });

    if (existChat) {
      throw new ConflictException('Chat already exists');
    }

    const newChat = await this.prisma.chat.create({
      data: {
        userId: user.id,
        title,
        slug,
        language,
      },
    });

    try {
      return newChat;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getChats(userId: number) {
    const user = await this.usersService.findById(userId);

    const allChats = await this.prisma.chat.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    try {
      return allChats;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getChat(id: number, userId: number) {
    const user = await this.usersService.findById(userId);

    const chat = await this.prisma.chat.findFirst({
      where: {
        id,
        userId: user.id,
        isActive: true,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    try {
      return chat;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async archiveChat(id: number, userId: number) {
    const user = await this.usersService.findById(userId);

    const chat = await this.prisma.chat.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const archivedChat = await this.prisma.chat.update({
      where: {
        id: chat.id,
        userId: user.id,
      },
      data: {
        isActive: false,
      },
    });

    try {
      return archivedChat;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async editChat(id: number, userId: number, dto: EditChatDto) {
    const { title, language } = dto;

    const user = await this.usersService.findById(userId);

    const chat = await this.prisma.chat.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const updatedChat = await this.prisma.chat.update({
      where: {
        id: chat.id,
        userId: user.id,
      },
      data: {
        title,
        language,
      },
    });

    try {
      return updatedChat;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
