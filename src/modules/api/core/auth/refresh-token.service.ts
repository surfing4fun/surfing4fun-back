import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';

import { jwtConstants } from './constants';
import { IAuthenticatedUser } from './dto/authenticate-user.dto';
import { User } from '../users/entity/user';

@Injectable()
export class RefreshTokenService {
  constructor(
    private jwtService: JwtService,
    private prismaService: DashboardPrismaService,
  ) {}

  async generateRefreshToken(
    authUserId: string,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date,
  ) {
    const newRefreshToken = this.jwtService.sign(
      { sub: authUserId },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: jwtConstants.refreshExpiresIn,
      },
    );

    if (currentRefreshToken && currentRefreshTokenExpiresAt) {
      if (
        await this.isRefreshTokenBlackListed(currentRefreshToken, authUserId)
      ) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      await this.prismaService.refreshTokens.create({
        data: {
          token: currentRefreshToken,
          expiresAt: currentRefreshTokenExpiresAt,
          userId: authUserId,
        },
      });
    }

    return newRefreshToken;
  }

  private isRefreshTokenBlackListed(token: string, userId: string) {
    return this.prismaService.refreshTokens.findFirst({
      where: {
        token,
        userId,
      },
    });
  }

  async generateTokenPair(
    user: Pick<User, 'id'>,
    payload: IAuthenticatedUser,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date,
  ) {
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: await this.generateRefreshToken(
        user.id,
        currentRefreshToken,
        currentRefreshTokenExpiresAt,
      ),
    };
  }

  generateAccessToken(payload: IAuthenticatedUser) {
    return this.jwtService.sign(payload);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async clearExpiredRefreshTokens() {
    await this.prismaService.refreshTokens.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });
  }
}
