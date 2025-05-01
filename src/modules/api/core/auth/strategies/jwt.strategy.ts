import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // still support Bearer on Authorization if you ever need it
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // primary source: the cookie-parser’d accessToken cookie
        (req) => {
          return req?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: { sub: string; role: string; permissions: any }) {
    const { sub, role, permissions } = payload;
    return { sub, role, permissions };
  }
}
