// src/modules/api/core/auth/guards/permission.guard.spec.ts

import { Reflector } from '@nestjs/core';
import { normalizePermissions } from 'src/utils/normalizePermissions';

import { UsersService } from '../../../users/users.service';
import { PermissionGuard } from '../permission.guard';

jest.mock('src/utils/normalizePermissions');

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Partial<Reflector>;
  let usersService: Partial<UsersService>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    usersService = { findOne: jest.fn() };
    (normalizePermissions as jest.Mock).mockReturnValue([
      { name: 'test', create: true, read: false, update: false, delete: false },
    ]);
    guard = new PermissionGuard(
      reflector as Reflector,
      usersService as UsersService,
    );
  });

  function makeCtx(allowed: string[] | undefined, method: string) {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(allowed);
    return {
      getHandler: () => {}, // needed by reflector
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub: 'u1' },
          method,
        }),
      }),
    } as any;
  }

  it('allows when no @AllowPermissions() metadata is present', async () => {
    const ctx = makeCtx(undefined, 'GET');
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('denies when user lacks required permission', async () => {
    const ctx = makeCtx(['other'], 'GET');
    (usersService.findOne as jest.Mock).mockResolvedValue({} as any);
    await expect(guard.canActivate(ctx)).resolves.toBe(false);
  });

  it('allows when user has the permission and method matches', async () => {
    const ctx = makeCtx(['test'], 'POST');
    (usersService.findOne as jest.Mock).mockResolvedValue({} as any);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
