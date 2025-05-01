const isProd = process.env.NODE_ENV === 'production';

export const jwtConstants = {
  expiresIn: '5m',
  refreshExpiresIn: '30d',
};

export const cookieConstants = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  path: '/',
  ...(isProd ? { domain: '.surfing4.fun' } : {}),
};
