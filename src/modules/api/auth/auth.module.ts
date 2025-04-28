import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { EmailModule } from 'src/modules/shared/email/email.module';

import { UsersModule } from '../users/users.module';
import { PaymentService } from '../payment/payment.service';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { PermissionGuard } from './guards/permission.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { RefreshTokenService } from './refresh-token.service';
import { SteamAuthStrategy } from './strategies/steam.strategy';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    PassportModule.register({ defaultStrategy: 'steam', session: true }),
    JwtModule.register({
      secret: jwtConstants.secret,
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
  ],
  controllers: [AuthController],
  exports: [AuthService, RefreshTokenService, JwtModule],
})
export class AuthModule {}
