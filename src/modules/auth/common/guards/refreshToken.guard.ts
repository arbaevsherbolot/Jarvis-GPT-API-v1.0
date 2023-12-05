import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//Declare JWT Refresh Token guard
@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
