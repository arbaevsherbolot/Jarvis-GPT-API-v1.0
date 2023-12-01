import {
  Body,
  Controller,
  Get,
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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getImage(@Param('id', ParseIntPipe) id: number) {
    return await this.imageService.getImage(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getImages() {
    return await this.imageService.getImages();
  }

  @Post(':id/generate')
  @HttpCode(HttpStatus.OK)
  async generateImage(
    @Body() dto: generateImageDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.imageService.generateImage(id, dto);
  }
}
