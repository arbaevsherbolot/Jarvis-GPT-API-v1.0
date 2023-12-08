import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  LoginDto,
  RegisterDto,
  EditMeDto,
  EmailVerificationDto,
  ForgotPasswordDto,
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

    return response
      .cookie('session', tokens['access_token'], {
        maxAge: 60 * 30 * 1000, // 30 minutes
        secure: isProduction,
        httpOnly: isProduction,
        // sameSite: 'lax',
        // domain: '.vercel.app',
        path: '/',
      })
      .cookie('session-refresh', tokens['refresh_token'], {
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
        secure: isProduction,
        httpOnly: isProduction,
        // sameSite: 'lax',
        // domain: '.vercel.app',
        path: '/',
      });
  }

  private async clearCookies(response: Response) {
    return response
      .clearCookie('session')
      .clearCookie('session-refresh')
      .status(200)
      .json({ success: true });
  }

  async oauth(request: Request, response: Response) {
    const { firstName, lastName, email } = request.user as User;

    const existUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existUser) {
      if (!existUser.isVerified) {
        await this.sendVerificationCode(
          existUser.id,
          existUser.email,
          existUser.firstName,
        );
      }

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
      this.sendVerificationCode(user.id, user.email, user.firstName),
      this.updateRefreshTokenHash(user.id, tokens.refresh_token),
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

  async login(dto: LoginDto, response: Response) {
    const { emailOrUsername, password } = dto;

    const user = await this.usersService.findByEmailOrUsername(emailOrUsername);
    const comparedPassword = await compare(password, user.password);

    if (!comparedPassword) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (!user.isVerified) {
      await this.sendVerificationCode(user.id, user.email, user.firstName);
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
      this.sendVerificationCode(user.id, user.email, user.firstName),
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

  async emailVerification(
    userId: number,
    dto: EmailVerificationDto,
    response: Response,
  ) {
    const { code } = dto;

    const user = await this.usersService.findById(userId);

    if (user.isVerified) {
      throw new BadRequestException('User has already been verified');
    }

    const comparedCode = await compare(code, user.verificationToken);

    if (!comparedCode) {
      throw new ConflictException(`Code doesn't match`);
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
      },
    });

    try {
      return response.status(HttpStatus.OK).json({ success: true });
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

    await Promise.all([
      this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          resetPasswordSecret: token,
        },
      }),
      this.mailerService.sendMail({
        to: user.email,
        from: process.env.MAILER_USER,
        subject: 'Password reset',
        html: `
            <h2>Hey ${user.firstName}</h2>
            <p>To recover your password, please use this <a target="_self" href="${forgotLink}">link</a>.</p>
        `,
      }),
    ]);

    try {
      return `Password reset link has been sent to ${user.email}`;
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

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    try {
      return `Your password has been successfully updated`;
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

  async generateVerificationCode(): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  async sendVerificationCode(
    userId: number,
    userEmail: string,
    userName: string,
  ) {
    const code = await this.generateVerificationCode();
    const verificationToken = await hash(code);

    await Promise.all([
      this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          verificationToken,
        },
      }),
      this.mailerService.sendMail({
        to: userEmail,
        from: process.env.MAILER_USER,
        subject: 'Verification Code',
        html: `
            <h2>Hey ${userName}</h2>
            <p>Your verification code is <strong>${code}</strong>.</p>
        `,
      }),
    ]);
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
