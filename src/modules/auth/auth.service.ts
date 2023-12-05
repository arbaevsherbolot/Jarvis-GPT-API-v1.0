import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  EditMeDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto';
import { UsersService } from '../users/users.service';
import { compare, hash } from '../../utils/bcrypt';
import { JwtService } from '../jwt/jwt.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Request, Response } from 'express';
import { LocationData, getLocation } from '../../utils/location';
import { User } from '.prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  private async setCookies(response: Response, tokens: any) {
    const isProduction = process.env.MODE === 'PRODUCTION';

    response.cookie('session', tokens['access_token'], {
      maxAge: 60 * 30 * 1000, // 30 minutes
      httpOnly: !isProduction,
      secure: isProduction,
    });

    response.cookie('session-refresh', tokens['refresh_token'], {
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
      httpOnly: !isProduction,
      secure: isProduction,
    });
  }

  private async clearCookies(response: Response) {
    response.clearCookie('session');
    response.clearCookie('session-refresh');
    response.status(200).json({ success: true });
  }

  async googleAuth(request: Request, response: Response) {
    const { firstName, lastName, email } = request.user as User;

    const existUser = await this.usersService.findByEmail(email);

    if (existUser) {
      const tokens = await this.jwt.generateTokens(existUser.id);
      await Promise.all([
        this.updateRefreshTokenHash(existUser.id, tokens.refresh_token),
        this.setCookies(response, tokens),
      ]);

      try {
        return response
          .status(HttpStatus.OK)
          .redirect(process.env.FRONTEND_BASE_URL);
      } catch (e) {
        console.error(e);
        throw new Error(e.message);
      }
    }

    const user = await this.usersService.createUser({
      firstName,
      lastName,
      email,
      password: 'wedevx2023',
    });

    const tokens = await this.jwt.generateTokens(user.id);
    await Promise.all([
      this.updateRefreshTokenHash(user.id, tokens.refresh_token),
      this.setCookies(response, tokens),
    ]);

    try {
      return response
        .status(HttpStatus.OK)
        .redirect(`${process.env.FRONTEND_BASE_URL}`);
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async login(dto: LoginDto, response: Response) {
    const { emailOrUsername, password } = dto;

    const user = await this.usersService.findByEmailOrUsername(emailOrUsername);
    const comparedPassword = await compare(password, user.password);

    if (!comparedPassword) {
      throw new UnauthorizedException('Incorrect password');
    }

    const tokens = await this.jwt.generateTokens(user.id);
    await Promise.all([
      this.updateRefreshTokenHash(user.id, tokens.refresh_token),
      this.setCookies(response, tokens),
    ]);

    try {
      return response.status(HttpStatus.OK).json(user);
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async register(dto: RegisterDto, response: Response) {
    const user = await this.usersService.createUser(dto);

    const tokens = await this.jwt.generateTokens(user.id);
    await Promise.all([
      this.updateRefreshTokenHash(user.id, tokens.refresh_token),
      this.setCookies(response, tokens),
    ]);

    try {
      return response.status(HttpStatus.CREATED).json(user);
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async logout(userId: number, response: Response) {
    const user = await this.usersService.findById(userId);

    if (user.refreshToken !== null) {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: null,
        },
      });
    }

    try {
      await this.clearCookies(response);
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getMe(userId: number, request: Request, response: Response) {
    const user = await this.usersService.findById(userId);
    const ip =
      request.headers['x-real-ip'] ||
      request.headers['x-forwarded-for'] ||
      request.socket.remoteAddress ||
      '';
    const locationData = await getLocation();

    await this.updateOrCreateLocation(user, ip, locationData);

    try {
      return response.status(HttpStatus.OK).json(user);
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async editMe(userId: number, dto: EditMeDto) {
    const user = await this.usersService.findById(userId);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...dto,
      },
      include: {
        location: true,
        chats: true,
        messages: true,
      },
    });

    try {
      return updatedUser;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.usersService.findByEmail(email);

    const token = await this.jwt.generateResetPasswordSecret(user.id);
    const forgotLink = `${process.env.FRONTEND_BASE_URL}/password/reset/?token=${token}`;

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetPasswordSecret: token,
      },
    });

    await this.mailerService.sendMail({
      to: user.email,
      from: process.env.MAILER_USER,
      subject: 'Password reset',
      html: `
          <h2>Hey ${user.firstName}</h2>
          <p>To recover your password, please use this <a target="_self" href="${forgotLink}">link</a>.</p>
      `,
    });

    try {
      return `Password reset link sent to ${user.email}`;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { password, token } = dto;

    const compare = await this.jwt.compareResetPasswordSecret(token);
    const userId = compare.id;
    const hashedPassword = await hash(password);

    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    try {
      return `Password of ${user.email} successfully updated`;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async updateOrCreateLocation(
    user: User,
    ip: string | string[],
    locationData: LocationData,
  ) {
    const existingLocation = await this.prisma.location.findFirst({
      where: { userId: user.id },
    });

    if (existingLocation) {
      await this.prisma.location.update({
        where: { id: existingLocation.id },
        data: {
          ip: Array.isArray(ip) ? ip.join(', ') : ip,
          ...locationData,
        },
      });
    } else {
      await this.prisma.location.create({
        data: {
          userId: user.id,
          ip: Array.isArray(ip) ? ip.join(', ') : ip,
          ...locationData,
        },
      });
    }
  }

  async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hashedToken = await this.jwt.hashToken(refreshToken);

    try {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          refreshToken: hashedToken,
        },
      });
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
