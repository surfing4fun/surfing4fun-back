// src/modules/api/core/auth/auth.controller.spec.ts

import { normalizePermissions } from 'src/utils/normalizePermissions';

import { PaymentService } from '../../../payment/payment.service';
import { UsersService } from '../../users/users.service';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { cookieConstants } from '../constants';
import { RefreshTokenService } from '../refresh-token.service';

jest.mock('src/utils/normalizePermissions');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;
  let usersService: Partial<UsersService>;
  let refreshTokenService: Partial<RefreshTokenService>;
  let paymentService: Partial<PaymentService>;

  beforeEach(() => {
    authService = { loginSteam: jest.fn() };
    usersService = { findOne: jest.fn() };
    refreshTokenService = { generateTokenPair: jest.fn() };
    paymentService = { getActiveSubscription: jest.fn() };

    controller = new AuthController(
      authService as AuthService,
      usersService as UsersService,
      refreshTokenService as RefreshTokenService,
      paymentService as PaymentService,
    );
  });

  describe('steamReturn', () => {
    it('should call loginSteam, set cookies, and redirect', async () => {
      const fakeUser = { id: 'u1' } as any;
      const fakeTokens = { accessToken: 'A', refreshToken: 'R' };
      (authService.loginSteam as jest.Mock).mockResolvedValue(fakeTokens);

      const req: any = { user: fakeUser };
      const res: any = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      };

      await controller.steamReturn(req, res);

      expect(authService.loginSteam).toHaveBeenCalledWith(fakeUser);

      expect(res.cookie).toHaveBeenNthCalledWith(
        1,
        'accessToken',
        'A',
        expect.objectContaining({
          ...cookieConstants,
          httpOnly: false,
          maxAge: 24 * 60 * 60 * 1000,
        }),
      );
      expect(res.cookie).toHaveBeenNthCalledWith(
        2,
        'refreshToken',
        'R',
        expect.objectContaining({
          ...cookieConstants,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        }),
      );

      expect(res.redirect).toHaveBeenCalledWith(process.env.STEAM_REALM);
    });
  });

  describe('refreshTokens', () => {
    it('should re-issue tokens and set cookies', async () => {
      const fakeStoredUser = {
        id: 'u2',
        role: { name: 'Admin' },
        avatar: 'av.png',
        profile: '/p',
        name: 'Bob',
        currentRefreshToken: 'oldRT',
        refreshTokenExpiresAt: new Date(Date.now() + 1000),
      } as any;

      // normalizePermissions returns array of permission names
      (normalizePermissions as jest.Mock).mockReturnValue(['perm1', 'perm2']);
      (paymentService.getActiveSubscription as jest.Mock).mockResolvedValue(
        true,
      );

      const newTokens = { accessToken: 'NA', refreshToken: 'NR' };
      (refreshTokenService.generateTokenPair as jest.Mock).mockResolvedValue(
        newTokens,
      );

      const req: any = { user: fakeStoredUser };
      const res: any = {
        cookie: jest.fn(),
      };

      await controller.refreshTokens(req, res);

      // The payload passed to generateTokenPair should include normalized permissions
      expect(paymentService.getActiveSubscription).toHaveBeenCalledWith('u2');
      expect(refreshTokenService.generateTokenPair).toHaveBeenCalledWith(
        fakeStoredUser,
        expect.objectContaining({
          sub: 'u2',
          role: 'Admin',
          avatar: 'av.png',
          profile: '/p',
          name: 'Bob',
          hasActiveSubscription: true,
          permissions: ['perm1', 'perm2'],
        }),
        'oldRT',
        fakeStoredUser.refreshTokenExpiresAt,
      );

      expect(res.cookie).toHaveBeenNthCalledWith(
        1,
        'accessToken',
        'NA',
        expect.objectContaining({
          ...cookieConstants,
          httpOnly: false,
          maxAge: 24 * 60 * 60 * 1000,
        }),
      );
      expect(res.cookie).toHaveBeenNthCalledWith(
        2,
        'refreshToken',
        'NR',
        expect.objectContaining({
          ...cookieConstants,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        }),
      );
    });
  });

  describe('me', () => {
    it('should return current user plus fresh permissions', async () => {
      const dtoUser = {
        sub: 'u3',
        role: 'User',
        avatar: '',
        profile: '',
        name: '',
        hasActiveSubscription: false,
        permissions: [],
      };
      const storedUser = { id: 'u3' } as any;
      (usersService.findOne as jest.Mock).mockResolvedValue(storedUser);
      (normalizePermissions as jest.Mock).mockReturnValue(['pA', 'pB']);

      const req: any = { user: dtoUser };
      const result = await controller.me(req);

      expect(usersService.findOne).toHaveBeenCalledWith('u3', {
        withPermissions: true,
      });
      expect(result).toEqual({ ...dtoUser, permissions: ['pA', 'pB'] });
    });
  });
});
