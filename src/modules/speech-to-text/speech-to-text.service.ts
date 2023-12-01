import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatGptService } from '../chat-gpt/chat-gpt.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

type Languages = 'EN' | 'RU';

@Injectable()
export class SpeechToTextService {
  constructor(
    private chatGptService: ChatGptService,
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async startRecognition(
    file: Express.Multer.File,
    userId: number,
    chatId: number,
  ) {
    const user = await this.usersService.findById(userId);
    const chat = await this.findChatByIdAndUserId(chatId, user.id);

    const lang: Languages = chat.language as Languages;

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        userId: user.id,
        chatId: chat.id,
      },
    });

    if (user.role === 'USER' && messages.length > 3) {
      throw new ForbiddenException('Limit of 3 requests has been exceeded');
    }

    try {
      const transcript = await this.chatGptService.transcribeAudio(
        file.buffer,
        lang,
      );

      const allMessages = [
        ...chat.messages,
        {
          text: transcript,
        },
      ];

      const aiReply = await this.getAiReply(lang, allMessages);

      const [message, reply] = await this.saveMessages(
        chat,
        user,
        transcript,
        aiReply,
      );

      return { message, reply };
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getMessages(chatId: number, userId: number) {
    const user = await this.usersService.findById(userId);
    const chat = await this.findChatByIdAndUserId(chatId, user.id);

    try {
      return chat.messages;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  private async findChatByIdAndUserId(chatId: number, userId: number) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: { messages: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  private async getAiReply(lang: Languages, messages: any[]) {
    const template =
      lang === 'EN'
        ? "Imagine you're an AI functioning as my personal Jarvis, your name is Jarvis!, and you can call me Sher!, assisting me in various tasks. Answer very shortly and clear, your reply limit is 1000 characters"
        : 'Представьте, что вы - ИИ, работающий в качестве моего личного Джарвиса, вас зовут Джарвис!, а меня вы можете называть Шер!, и помогающий мне в решении различных задач. Отвечайте очень коротко и ясно, ограничение на ответ - 1000 символов';

    return this.chatGptService.chatGptRequest(template, messages);
  }

  private async saveMessages(
    chat: any,
    user: any,
    transcript: string,
    aiReply: string,
  ) {
    return this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          chatId: chat.id,
          userId: user.id,
          text: transcript,
        },
      }),
      this.prisma.message.create({
        data: {
          chatId: chat.id,
          userId: user.id,
          text: aiReply.trim(),
          ai: true,
          audioSource: await this.chatGptService.synthesizeSpeech(
            user.id,
            aiReply,
          ),
        },
      }),
    ]);
  }
}
