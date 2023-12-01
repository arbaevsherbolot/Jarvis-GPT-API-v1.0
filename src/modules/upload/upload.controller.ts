import {
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUserId } from '../auth/common/decorators';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Put('photo')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @GetCurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.uploadService.uploadPhoto(userId, file);
  }
}
