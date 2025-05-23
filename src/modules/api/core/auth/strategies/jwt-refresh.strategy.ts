import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload: any) {
    const authUser = await this.userService.findOne(payload.sub, {
      withPermissions: true,
    });
    if (!authUser) {
      throw new UnauthorizedException();
    }

    return {
      ...authUser,
      refreshTokenExpiresAt: new Date(payload.exp * 1000),
    };
  }
}
