import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/decorators/Public';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { normalizePermissions } from 'src/utils/normalizePermissions';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from '../users/users.service';
import { PaymentService } from '../payment/payment.service';

import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { RefreshTokenService } from './refresh-token.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private refreshToeknService: RefreshTokenService,
    private paymentService: PaymentService,
  ) {}

  @Public()
  @Get('/steam')
  @UseGuards(AuthGuard('steam'))
  steamLogin() {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('steam/return')
  @UseGuards(AuthGuard('steam'))
  async steamReturn(@Request() req, @Response() res) {
    const authTokens = await this.authService.loginSteam(req.user);

    res.cookie('accessToken', authTokens.accessToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
    });

    res.cookie('refreshToken', authTokens.refreshToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.redirect(process.env.STEAM_REALM);
  }

  @Throttle({
    short: { limit: 1, ttl: 1000 },
    long: { limit: 2, ttl: 60000 },
  })
  @ApiBearerAuth()
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refreshTokens(@Request() req) {
    if (!req.user) {
      throw new InternalServerErrorException();
    }

    const normalizedPermissions = normalizePermissions(req.user);

    const hasActiveSubscription =
      await this.paymentService.getActiveSubscription(req.user.id);

    const payload = {
      sub: req.user.id,
      role: req.user.role.name,
      avatar: req.user.avatar,
      profile: req.user.profile,
      name: req.user.name,
      hasActiveSubscription: !!hasActiveSubscription,
      permissions: normalizedPermissions,
    };

    return this.refreshToeknService.generateTokenPair(
      req.user,
      payload,
      req.headers.authorization?.split(' ')[1],
      req.user.refreshTokenExpiresAt,
    );
  }

  @ApiBearerAuth()
  @Get('/me')
  async me(@Request() req) {
    const user = await this.usersService.findOne(req.user.sub, {
      withPermissions: true,
    });
    const permissions = normalizePermissions(user);

    return { ...req.user, permissions };
  }
}
