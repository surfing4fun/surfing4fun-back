import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';
import { normalizePermissions } from 'src/utils/normalizePermissions';

import { AuthService } from './auth.service';
import { cookieConstants } from './constants';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RefreshTokenService } from './refresh-token.service';
import { PaymentService } from '../../payment/payment.service';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private refreshTokenService: RefreshTokenService,
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
      ...cookieConstants,
      httpOnly: false,
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
    });

    res.cookie('refreshToken', authTokens.refreshToken, {
      ...cookieConstants,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.redirect(process.env.STEAM_REALM);
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(@Request() req, @Response({ passthrough: true }) res) {
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

    const { accessToken, refreshToken } =
      await this.refreshTokenService.generateTokenPair(
        req.user,
        payload,
        req.user.currentRefreshToken,
        req.user.refreshTokenExpiresAt,
      );

    res.cookie('accessToken', accessToken, {
      ...cookieConstants,
      httpOnly: false,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieConstants,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async me(@Request() req) {
    const user = await this.usersService.findOne(req.user.sub, {
      withPermissions: true,
    });
    const permissions = normalizePermissions(user);

    return { ...req.user, permissions };
  }
}
