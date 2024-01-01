import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { GetCurrentUserId } from '../auth/common/decorators';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @GetCurrentUserId() userId: number,
    @Query('q') query: string,
  ) {
    return await this.usersService.getUsers(userId, query);
  }

  @Get(':username')
  @HttpCode(HttpStatus.OK)
  async getUser(
    @GetCurrentUserId() userId: number,
    @Param('username') username: string,
  ) {
    return await this.usersService.getUser(userId, username);
  }

  @Delete(':username')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @GetCurrentUserId() userId: number,
    @Param('username') username: string,
  ) {
    return await this.usersService.deleteUser(userId, username);
  }
}
