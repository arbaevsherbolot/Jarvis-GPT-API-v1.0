import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { ChatGptModule } from '../chat-gpt/chat-gpt.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ChatGptModule, UserModule],
  providers: [ImageService],
  controllers: [ImageController],
})
export class ImageModule {}
