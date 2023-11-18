import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatGptService } from '../chat-gpt/chat-gpt.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

type Languages = 'EN' | 'RU';

@Injectable()
export class SpeechToTextService {
  constructor(
    private chatGptService: ChatGptService,
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async startRecognition(
    file: Express.Multer.File,
    userId: number,
    id: number,
  ) {
    const user = await this.userService.getUser(userId);
    const chat = await this.prisma.chat.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        messages: true,
      },
    });

    if (!chat) {
      throw new BadRequestException('Chat not found');
    }

    const lang: Languages = chat.language as Languages;

    const allMessages = [];
    if (chat.messages.length > 0) {
      allMessages.push(...chat.messages);
    }

    try {
      const transcript = await this.chatGptService.transcribeAudio(
        file.buffer,
        lang,
      );
      allMessages.push({
        text: transcript,
      });
      const aiReply = await this.chatGptService.chatGptRequest(
        lang === 'EN'
          ? `Imagine you're an AI functioning as my personal Jarvis, you're name is Jarvis!, and you can call me Sher!, assisting me in various tasks. Answer very shortly and clear, you're reply limit is 1000 characters`
          : `Представьте, что вы - ИИ, работающий в качестве моего личного Джарвиса, вас зовут Джарвис!, а меня вы можете называть Шер!, и помогающий мне в решении различных задач. Отвечайте очень коротко и ясно, ограничение на ответ - 1000 символов`,
        allMessages,
      );

      const [message, reply] = await this.prisma.$transaction([
        this.prisma.message.create({
          data: {
            chatId: chat.id,
            userId: user.id,
            text: transcript,
            audioSource: await this.chatGptService.synthesizeSpeech(
              user.id,
              aiReply,
            ),
          },
        }),
        this.prisma.message.create({
          data: {
            chatId: chat.id,
            userId: user.id,
            text: aiReply.toString().trim(),
            ai: true,
          },
        }),
      ]);

      return { message, reply };
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getMessages(id: number, userId: number) {
    const user = await this.userService.getUser(userId);

    const chat = await this.prisma.chat.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        messages: true,
      },
    });

    if (!chat) {
      throw new BadRequestException('Chat not found');
    }

    try {
      return chat.messages;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
