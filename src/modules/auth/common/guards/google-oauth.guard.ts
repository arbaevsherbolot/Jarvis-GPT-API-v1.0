import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//Declare Google guard
@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {}
