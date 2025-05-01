const isProd = process.env.NODE_ENV === 'production';

export const jwtConstants = {
  expiresIn: '5m',
  refreshExpiresIn: '30d',
};

export const cookieConstants = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'none' as const,
  path: '/',
  domain: isProd ? '.surfing4.fun' : undefined,
};
