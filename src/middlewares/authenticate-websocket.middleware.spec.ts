/* eslint-disable import/order */
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

// 1) Mock JwtStrategy before any imports from it:
const mockValidate = jest.fn();
jest.mock('src/modules/api/core/auth/strategies/jwt.strategy', () => ({
  JwtStrategy: jest.fn().mockImplementation(() => ({
    validate: mockValidate,
  })),
}));

// real entities:
import { IAuthenticatedUser } from 'src/modules/api/core/auth/dto/authenticate-user.dto';
import { PermissionRole } from 'src/modules/api/core/permission-roles/entities/permission-role.entity';
import {
  Permission,
  EPermission,
} from 'src/modules/api/core/permissions/entities/permission.entity';
import { Role } from 'src/modules/api/core/roles/entities/role.entity';

import { AuthenticateWebsocketMiddleware } from './authenticate-websocket.middleware';

describe('AuthenticateWebsocketMiddleware', () => {
  let jwtService: Partial<JwtService>;
  let next: jest.Mock;
  let middleware: ReturnType<typeof AuthenticateWebsocketMiddleware>;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    next = jest.fn();
    middleware = AuthenticateWebsocketMiddleware(jwtService as JwtService);

    // clear our validate mock each test
    mockValidate.mockReset();
  });

  function makeSocket(token?: string): Socket {
    return {
      handshake: { auth: { token } },
    } as unknown as Socket;
  }

  it('should call next(Unauthorized) if no token is provided', async () => {
    await middleware(makeSocket(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Unauthorized');
  });

  it('should call next(Unauthorized) if verifyAsync throws', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
      new Error('bad token'),
    );

    await middleware(makeSocket('bad.token'), next);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('bad.token', {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Unauthorized');
  });

  it('should call next(Unauthorized) if strategy.validate returns null', async () => {
    const fakePayload = {
      sub: 'u1',
      role: 'admin',
      permissions: [EPermission.USERS],
    } as unknown as IAuthenticatedUser;
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(fakePayload);

    mockValidate.mockResolvedValueOnce(null);

    await middleware(makeSocket('valid.jwt'), next);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.jwt', {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    expect(mockValidate).toHaveBeenCalledWith(fakePayload);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Unauthorized');
  });

  it('happy path: should succeed when validate returns a PermissionRole', async () => {
    // 1) mock JWT payload
    const fakePayload = {
      sub: 'u2',
      role: 'user',
      permissions: [EPermission.ROLES],
    } as unknown as IAuthenticatedUser;
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(fakePayload);

    // 2) build a real PermissionRole
    const perm = new Permission();
    perm.id = 10;
    perm.name = EPermission.ROLES;
    perm.description = 'manage roles';

    const role = new Role();
    role.id = 5;
    role.name = 'Member';
    role.description = 'regular user';
    role.users = [];

    const permissionRole = new PermissionRole();
    permissionRole.id = 42;
    permissionRole.create = false;
    permissionRole.read = true;
    permissionRole.update = false;
    permissionRole.delete = false;
    permissionRole.permissionId = perm.id;
    permissionRole.roleId = role.id;
    permissionRole.permission = perm;
    permissionRole.role = role;

    mockValidate.mockResolvedValueOnce(permissionRole);

    await middleware(makeSocket('good.jwt'), next);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('good.jwt', {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    expect(mockValidate).toHaveBeenCalledWith(fakePayload);

    // success => next() with no args
    expect(next).toHaveBeenCalledWith();
  });
});
