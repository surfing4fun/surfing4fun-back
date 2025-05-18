import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from 'src/modules/shared/email/email.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { JwtAuthGuard } from './guards/jwt.guard';
import { PermissionGuard } from './guards/permission.guard';
import { RefreshTokenService } from './refresh-token.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SteamAuthStrategy } from './strategies/steam.strategy';

import { PaymentService } from '../../payment/payment.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    PassportModule,
    PassportModule.register({ defaultStrategy: 'steam', session: true }),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
    EmailModule,
  ],
  providers: [
    AuthService,
    RefreshTokenService,
    JwtStrategy,
    JwtRefreshStrategy,
    SteamAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    PaymentService,
    UsersService,
  ],
  controllers: [AuthController],
  exports: [AuthService, RefreshTokenService, JwtModule],
})
export class AuthModule {}
