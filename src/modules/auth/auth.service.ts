import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '../jwt/jwt.service';
import { hash } from '../../utils/bcrypt';
import { RegisterSchema } from './auth.schema';
import { LoginDto, RegisterDto } from './dto';
import { compare } from 'bcrypt';
import { getUrl, uploadPhoto } from '../../utils/supabase';
import {
  EditProfileDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  googleUserDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async googleAuth(dto: googleUserDto) {
    const { firstName, lastName, email, photo } = dto;

    const existUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existUser) {
      const tokens = await this.jwt.generateTokens(existUser.id);
      await this.updateRefreshTokenHash(existUser.id, tokens.refresh_token);

      return {
        tokens,
      };
    }

    const data: RegisterSchema = {
      firstName,
      lastName,
      email,
      photo,
      password: '',
    };

    const newUser = await this.prisma.user.create({
      data,
    });

    const tokens = await this.jwt.generateTokens(newUser.id);
    await this.updateRefreshTokenHash(newUser.id, tokens.refresh_token);

    return {
      tokens,
    };
  }

  async register(dto: RegisterDto) {
    const { firstName, lastName, email, password } = dto;

    const existUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hash(password);

    const data: RegisterSchema = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    };

    const user = await this.prisma.user.create({
      data,
    });

    const tokens = await this.jwt.generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    try {
      return {
        user,
        tokens,
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async login(dto: LoginDto) {
    const { emailOrName, password } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrName }, { firstName: emailOrName }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    if (user.password.length === 0) {
      throw new ConflictException(
        'User has logged in using another service, such as Google',
      );
    }

    const comparedPassword = await compare(password, user.password);

    if (!comparedPassword) {
      throw new UnauthorizedException('Incorrect password');
    }

    const tokens = await this.jwt.generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    try {
      return {
        user,
        tokens,
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    const token = await this.jwt.generateResetPasswordSecret(user.id);
    const forgotLink = `${process.env.CLIENT_APP_URL}/password/reset/?token=${token}`;

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
          <p>To recover your password, please use this <a href="${forgotLink}">link</a>.</p>
      `,
    });

    try {
      return `Password reset link sent to ${user.email}`;
    } catch (e) {
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
      return `User password: ${user.email} successfully updated`;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async logout(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    try {
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
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    let photoUrl: string = user.photo;
    const regexGooglePicture =
      /https:\/\/lh3\.googleusercontent\.com\/a\/[^\/]+\/[^\/]+=s\d+-c/;
    const isNotGooglePicture = regexGooglePicture.test(user.photo);

    if (isNotGooglePicture) {
      photoUrl = getUrl('/photos', user.photo);
    }

    const userOptionalParams = {
      ...user,
      photo: photoUrl,
    };

    try {
      return userOptionalParams;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async editProfile(userId: number, dto: EditProfileDto) {
    const { firstName, lastName, bio } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName,
        lastName,
        bio,
      },
    });

    try {
      return updatedUser;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async uploadPhoto(userId: number, file: Express.Multer.File) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const path = await uploadPhoto(user.id, file);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        photo: path,
      },
    });

    try {
      return updatedUser.photo;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async refreshToken(userId: number, token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    let comparedToken: boolean;

    if (user.refreshToken) {
      comparedToken = await this.jwt.compareToken(token, user.refreshToken);
    }

    if (!comparedToken) {
      throw new ForbiddenException('Access denied, invalid token');
    }

    const tokens = await this.jwt.generateTokens(user.id);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    try {
      return tokens;
    } catch (e) {
      throw new Error(e.message);
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
      throw new Error(e.message);
    }
  }
}
