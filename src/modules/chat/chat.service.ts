import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateChatDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createChat(dto: CreateChatDto, userId: number) {
    const { title } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newChat = await this.prisma.chat.create({
      data: {
        userId: user.id,
        title,
      },
    });

    try {
      return newChat;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getChats(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const allChats = await this.prisma.chat.findMany({
      where: {
        userId: user.id,
      },
    });

    try {
      return allChats;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getChat(id: number, userId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const chat = await this.prisma.chat.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!chat) {
      throw new UnauthorizedException('Chat not found');
    }

    try {
      return chat;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
