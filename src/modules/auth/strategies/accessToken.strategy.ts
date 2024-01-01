import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/modules/users/users.service';

type JwtPayload = {
  id: string;
};

const extractToken = (request: any): string | null => {
  const authHeader = request.headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  } else if (request.cookies && request.cookies.access_token) {
    return request.cookies.access_token;
  }

  return null;
};

//Declare JWT Access Token strategy
@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractToken]),
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.userService.findById(parseInt(payload.id));
    return payload;
  }
}
