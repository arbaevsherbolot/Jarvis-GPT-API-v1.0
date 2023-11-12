import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatGptService } from '../chat-gpt/chat-gpt.service';
import { PrismaService } from '../prisma/prisma.service';
import { StartRecognitionDto } from './dto/speech-to-text.dto';
import { UserService } from '../user/user.service';
import { Response } from 'express';

type Languages = 'EN' | 'RU';

@Injectable()
export class SpeechToTextService {
  constructor(
    private chatGptService: ChatGptService,
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async startRecognition(dto: StartRecognitionDto, userId: number, id: number) {
    const { audio: base64Audio } = dto;
    const audioData = Buffer.from(base64Audio, 'base64');
    const allMessages = [];

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

    let lang: Languages = 'EN';
    if (chat.language === 'RU') {
      lang = 'RU';
    }

    if (chat.messages.length > 0) {
      allMessages.push(...chat.messages);
    }

    try {
      const transcript = await this.chatGptService.transcribeAudio(
        audioData,
        lang,
      );
      allMessages.push({
        text: transcript,
      });

      console.log(`
      YOU (transcript): ${transcript}
      `);

      const aiReply = await this.chatGptService.chatGptRequest(
        lang === 'EN'
          ? `Imagine you're an AI functioning as my personal Jarvis, you're name is Jarvis!, and you can call me Sher!, assisting me in various tasks. Answer very shortly and clear, you're reply limit is 1000 characters`
          : `Представьте, что вы - ИИ, работающий в качестве моего личного Джарвиса, вас зовут Джарвис!, а меня вы можете называть Шер!, и помогающий мне в решении различных задач. Отвечайте очень коротко и ясно, ограничение на ответ - 1000 символов`,
        allMessages,
      );

      console.log(`
      AI (GPT-4): ${aiReply.toString().trim()}
       `);

      const audioUrl = await this.chatGptService.synthesizeSpeech(
        user.id,
        aiReply,
      );

      const message = await this.prisma.message.create({
        data: {
          chatId: chat.id,
          userId: user.id,
          text: transcript,
          audioSource: audioUrl as string,
        },
      });

      const reply = await this.prisma.message.create({
        data: {
          chatId: chat.id,
          userId: user.id,
          text: aiReply.toString().trim(),
          ai: true,
        },
      });

      const result = {
        message,
        reply,
      };

      return result;
    } catch (e) {
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
      throw new Error(e.message);
    }
  }
}
