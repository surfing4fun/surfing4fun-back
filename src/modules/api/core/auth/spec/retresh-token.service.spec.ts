// src/modules/api/core/auth/refresh-token.service.spec.ts

import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';

import { RefreshTokenService } from '../refresh-token.service';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let jwtService: Partial<JwtService>;
  let prisma: any; // cast to any to accept our partial delegate

  beforeEach(() => {
    jwtService = { sign: jest.fn() };
    prisma = {
      refreshTokens: {
        findFirst: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    service = new RefreshTokenService(
      jwtService as JwtService,
      prisma as DashboardPrismaService,
    );
    process.env.REFRESH_TOKEN_SECRET = 'rsec';
  });

  describe('generateRefreshToken', () => {
    it('issues a new token when no current token provided', async () => {
      (jwtService.sign as jest.Mock).mockReturnValue('NEW');
      const tok = await service.generateRefreshToken('u1');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'u1' },
        { secret: 'rsec', expiresIn: '30d' },
      );
      expect(tok).toBe('NEW');
    });

    it('blacklists and throws if current token already exists', async () => {
      prisma.refreshTokens.findFirst.mockResolvedValue({
        token: 'old',
        userId: 'u1',
      });
      await expect(
        service.generateRefreshToken('u1', 'old', new Date()),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('stores old token then returns new one', async () => {
      prisma.refreshTokens.findFirst.mockResolvedValue(null);
      (jwtService.sign as jest.Mock).mockReturnValue('NEXT');
      const expires = new Date();
      const tok = await service.generateRefreshToken('u1', 'old', expires);
      expect(prisma.refreshTokens.create).toHaveBeenCalledWith({
        data: { token: 'old', expiresAt: expires, userId: 'u1' },
      });
      expect(tok).toBe('NEXT');
    });
  });

  describe('generateTokenPair', () => {
    it('signs access and delegates refresh', async () => {
      jest.spyOn(service, 'generateRefreshToken').mockResolvedValue('R');
      (jwtService.sign as jest.Mock).mockReturnValue('A');
      const out = await service.generateTokenPair({ id: 'u2' }, {
        sub: 'u2',
      } as any);
      expect(out).toEqual({ accessToken: 'A', refreshToken: 'R' });
    });
  });

  describe('clearExpiredRefreshTokens (Cron)', () => {
    it('deletes tokens older than now', async () => {
      await service.clearExpiredRefreshTokens();
      expect(prisma.refreshTokens.deleteMany).toHaveBeenCalledWith({
        where: { expiresAt: { lte: expect.any(Date) } },
      });
    });
  });
});
