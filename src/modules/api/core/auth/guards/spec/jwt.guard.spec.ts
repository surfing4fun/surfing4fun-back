import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtAuthGuard } from '../jwt.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Partial<Reflector>;
  const fakeCtx = {
    getHandler: () => {}, // used by the public‐route check
    getClass: () => {},
  } as any;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new JwtAuthGuard(reflector as Reflector);
  });

  it('allows public routes via @Public()', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    expect(guard.canActivate(fakeCtx)).toBe(true);
  });

  it('handleRequest throws UnauthorizedException when no user', () => {
    // handleRequest is invoked after Passport, so we can test it standalone:
    expect(() => guard.handleRequest(null, null)).toThrow(
      UnauthorizedException,
    );
  });
});
