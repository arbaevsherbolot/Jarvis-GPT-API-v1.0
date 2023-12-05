import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github';
import axios from 'axios';

//Declare GitHub OAuth strategy
@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['public_profile', 'user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ): Promise<any> {
    const { id, provider, username, displayName, photos } = profile;

    const emailResponse = await axios.get(
      'https://api.github.com/user/emails',
      {
        headers: {
          Authorization: `Bearer ${_accessToken}`,
          'User-Agent': 'Jarvis GPT',
        },
      },
    );
    const { email } = emailResponse.data.find((email: any) => email.primary);

    const user = {
      provider: provider || 'github',
      providerId: id,
      email,
      firstName:
        displayName && displayName.length > 0
          ? displayName.split(' ')[0]
          : username,
      lastName:
        displayName && displayName.length > 0
          ? displayName.split(' ')[1]
          : username,
      photo: photos && photos.length > 0 ? photos[0].value : null,
    };

    done(null, user);
  }
}
