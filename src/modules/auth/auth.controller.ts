import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  LoginDto,
  RegisterDto,
  EditMeDto,
  ResetPasswordDto,
  ForgotPasswordDto,
} from './dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { GetCurrentUserId, Public } from './common/decorators';
import { GoogleOauthGuard } from './common/guards';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('google/callback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GoogleOauthGuard)
  async googleCallback(@Req() request: Request, @Res() response: Response) {
    return await this.authService.googleAuth(request, response);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res() response: Response) {
    return await this.authService.login(dto, response);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Res() response: Response) {
    return await this.authService.register(dto, response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUserId() userId: number, @Res() response: Response) {
    return await this.authService.logout(userId, response);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(
    @GetCurrentUserId() userId: number,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return await this.authService.getMe(userId, request, response);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async editMe(@GetCurrentUserId() userId: number, @Body() dto: EditMeDto) {
    return await this.authService.editMe(userId, dto);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
