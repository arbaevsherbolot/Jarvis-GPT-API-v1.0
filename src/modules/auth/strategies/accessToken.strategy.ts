import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  id: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    if (!payload || !payload.id) {
      throw new UnauthorizedException('Invalid token or user does not exist');
    }

    return payload;
  }
}
