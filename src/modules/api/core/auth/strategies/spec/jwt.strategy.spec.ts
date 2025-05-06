// auth/strategies/jwt.strategy.spec.ts

import { JwtStrategy } from '../jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  it('should validate and return a simple payload', async () => {
    const payload = {
      sub: 'user-id-123',
      role: 'admin',
      permissions: [
        {
          name: 'users',
          create: true,
          read: true,
          update: true,
          delete: false,
        },
      ],
    };

    const result = await strategy.validate(payload);
    expect(result).toEqual(payload);
  });
});
