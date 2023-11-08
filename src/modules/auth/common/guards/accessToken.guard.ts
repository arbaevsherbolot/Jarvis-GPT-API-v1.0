import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const tokenFromHeader = this.extractTokenFromHeader(request);
    const tokenFromCookies = this.extractTokenFromCookies(request);

    if (!tokenFromHeader && !tokenFromCookies) {
      throw new UnauthorizedException('Access token is missing');
    }

    const token = tokenFromHeader || tokenFromCookies;

    try {
      request.headers.authorization = `Bearer ${token}`;
      return super.canActivate(context);
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }

      throw e;
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  private extractTokenFromCookies(request: any): string | null {
    if (request.cookies && request.cookies.access_token) {
      return request.cookies.access_token;
    }
    return null;
  }
}
