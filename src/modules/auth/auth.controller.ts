import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Put,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  EditProfileDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  requestToLoginDto,
} from './dto';
import { GoogleOauthGuard, RefreshTokenGuard } from './common/guards';
import { GetCurrentUser, GetCurrentUserId, Public } from './common/decorators';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('google/callback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GoogleOauthGuard)
  async googleCallback(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { tokens } = await this.authService.googleAuth(req.user);

    response.cookie('access_token', tokens.access_token);
    response.json({
      status: HttpStatus.OK,
      message: 'Successfully authenticated!',
    });
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Public()
  @Post('requestToLogin')
  @HttpCode(HttpStatus.OK)
  async requestToLogin(@Body() dto: requestToLoginDto) {
    return await this.authService.requestToLogin(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
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

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@GetCurrentUserId() userId: number) {
    return await this.authService.getProfile(userId);
  }

  @Put('profile/edit')
  @HttpCode(HttpStatus.OK)
  async editProfile(
    @Body() dto: EditProfileDto,
    @GetCurrentUserId() userId: number,
  ) {
    return await this.authService.editProfile(userId, dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUserId() userId: number) {
    return await this.authService.logout(userId);
  }

  @Put('upload/photo')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @GetCurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.authService.uploadPhoto(userId, file);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUserId() userId: number,
  ) {
    return await this.authService.refreshToken(userId, refreshToken);
  }
}
