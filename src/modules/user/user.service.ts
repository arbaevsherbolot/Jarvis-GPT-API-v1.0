import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(userId: number): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    try {
      return user;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async findByEmailOrName(emailOrName: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrName }, { firstName: emailOrName }],
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    try {
      return user;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    try {
      return user;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
