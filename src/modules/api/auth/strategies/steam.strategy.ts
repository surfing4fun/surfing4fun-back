import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as SteamStrategy } from 'passport-steam';

import { UsersService } from '../../users/users.service';

@Injectable()
export class SteamAuthStrategy extends PassportStrategy(
  SteamStrategy,
  'steam',
) {
  constructor(private usersService: UsersService) {
    super({
      apiKey: process.env.STEAM_API_KEY,
      returnURL: process.env.STEAM_RETURN_URL,
      realm: process.env.STEAM_REALM,
      stateless: true,
    });
  }

  async validate(identifier: string, profile: any, done: any) {
    const steamId = profile.id;
    const displayName = profile.displayName;

    let user = await this.usersService.findBySteamId(steamId, true);

    if (!user) {
      user = await this.usersService.create({
        steamId,
        name: displayName,
        roleId: 3,
      });
    }

    done(null, user);
  }
}
