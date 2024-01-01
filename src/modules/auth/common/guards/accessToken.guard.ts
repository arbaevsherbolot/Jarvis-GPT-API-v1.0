import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

//Declare JWT Access Token guard
@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const accessToken = this.extractToken(request);

      if (!accessToken) {
        throw new UnauthorizedException('Access token is missing');
      }

      const canActivateResult = await super.canActivate(context);
      return canActivateResult as boolean;
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }

      throw e;
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    } else if (request.cookies && request.cookies.session) {
      return request.cookies.session;
    }

    return null;
  }
}
