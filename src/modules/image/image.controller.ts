import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUserId } from '../auth/common/decorators';
import { newImageDto, generateImageDto } from './dto';

@Controller('image')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async newImage(
    @GetCurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: newImageDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.imageService.newImage(id, userId, file, dto);
  }

  @Post(':id/generate')
  @HttpCode(HttpStatus.OK)
  async generateImage(
    @GetCurrentUserId() userId: number,
    @Body() dto: generateImageDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.imageService.generateImage(id, userId, dto);
  }
}
