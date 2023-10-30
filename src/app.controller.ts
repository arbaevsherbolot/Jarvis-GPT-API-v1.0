import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from './modules/auth/common/decorators';

@Public()
@Controller()
export class AppController {
  @Get()
  @HttpCode(HttpStatus.OK)
  async main() {
    const response = {
      status: HttpStatus.OK,
      message: 'Hello World!',
      
    };

    return response;
  }
}
