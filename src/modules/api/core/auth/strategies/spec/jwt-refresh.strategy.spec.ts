// auth/strategies/jwt-refresh.strategy.spec.ts

import { JwtRefreshStrategy } from '../jwt-refresh.strategy';
import { UnauthorizedException } from '@nestjs/common';

interface FakeUser {
  id: string;
  username: string;
  permissions: any[];
}

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;
  let usersService: { findOne: jest.Mock };

  beforeAll(() => {
    process.env.REFRESH_TOKEN_SECRET = 'refresh-secret';
    // create a fake UsersService
    usersService = {
      findOne: jest.fn(),
    } as any;

    strategy = new JwtRefreshStrategy(usersService as any);
  });

  it('should throw if the user is not found', async () => {
    usersService.findOne.mockResolvedValue(null);
    const payload = {
      sub: 'missing-user',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should return user data plus refreshTokenExpiresAt when found', async () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = { sub: 'u42', exp: now + 7200 };
    const fakeUser: FakeUser = {
      id: 'u42',
      username: 'jane.doe',
      permissions: [{ name: 'roles', read: true }],
    };
    usersService.findOne.mockResolvedValue(fakeUser);

    const result = await strategy.validate(payload);

    // returned object should spread the user and add the expiration date
    expect(result).toMatchObject({
      ...fakeUser,
      refreshTokenExpiresAt: new Date((now + 7200) * 1000),
    });
  });
});
