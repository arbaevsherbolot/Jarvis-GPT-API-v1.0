import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//Declare GitHub guard
@Injectable()
export class GitHubOauthGuard extends AuthGuard('github') {}
