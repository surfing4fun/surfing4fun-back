import { Test, TestingModule } from '@nestjs/testing';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';
import { dashboardPrismaServiceMock } from 'src/modules/shared/prisma/spec/mock/dashboard.service.mock';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersService } from '../users.service';

describe('UsersService (unit)', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DashboardPrismaService,
          useValue: dashboardPrismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('calls prisma.create with include and returns created user', async () => {
      const dto: CreateUserDto = {
        name: 'John',
        steamId: 'S123',
        roleId: 1,
        avatar: 'url',
        profile: 'profileUrl',
      };
      const stub = { ...dto, id: 'u1', role: { permissionRole: [] } };
      dashboardPrismaServiceMock.users.create.mockResolvedValue(stub as any);

      const result = await service.create(dto);

      expect(dashboardPrismaServiceMock.users.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          steamId: dto.steamId,
          role: { connect: { id: dto.roleId } },
          avatar: dto.avatar,
          profile: dto.profile,
        },
        include: {
          role: {
            include: { permissionRole: { include: { permission: true } } },
          },
        },
      });
      expect(result).toEqual(stub);
    });
  });

  describe('findAll()', () => {
    it('returns all users', async () => {
      const stub = [{ id: 'u1', name: 'John' }];
      dashboardPrismaServiceMock.users.findMany.mockResolvedValue(stub as any);

      const result = await service.findAll();

      expect(dashboardPrismaServiceMock.users.findMany).toHaveBeenCalled();
      expect(result).toEqual(stub);
    });
  });

  describe('findOne()', () => {
    it('includes permissions when requested', async () => {
      const stub = { id: 'u1', name: 'John', role: { permissionRole: [] } };
      dashboardPrismaServiceMock.users.findUnique.mockResolvedValue(
        stub as any,
      );

      const result = await service.findOne('u1', { withPermissions: true });

      expect(dashboardPrismaServiceMock.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        include: {
          role: {
            include: { permissionRole: { include: { permission: true } } },
          },
        },
      });
      expect(result).toEqual(stub);
    });

    it('calls findUnique without include if no options', async () => {
      const stub = { id: 'u2', name: 'Jane' };
      dashboardPrismaServiceMock.users.findUnique.mockResolvedValue(
        stub as any,
      );

      const result = await service.findOne('u2');

      expect(dashboardPrismaServiceMock.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'u2' },
      });
      expect(result).toEqual(stub);
    });
  });

  describe('findBySteamId()', () => {
    it('finds first without include when withPermissions false', async () => {
      const stub = { id: 'u3', steamId: 'S456' };
      dashboardPrismaServiceMock.users.findFirst.mockResolvedValue(stub as any);

      const result = await service.findBySteamId('S456');

      expect(dashboardPrismaServiceMock.users.findFirst).toHaveBeenCalledWith({
        where: { steamId: 'S456' },
      });
      expect(result).toEqual(stub);
    });

    it('includes permissions when withPermissions true', async () => {
      const stub = { id: 'u4', steamId: 'S789', role: { permissionRole: [] } };
      dashboardPrismaServiceMock.users.findFirst.mockResolvedValue(stub as any);

      const result = await service.findBySteamId('S789', true);

      expect(dashboardPrismaServiceMock.users.findFirst).toHaveBeenCalledWith({
        where: { steamId: 'S789' },
        include: {
          role: {
            include: { permissionRole: { include: { permission: true } } },
          },
        },
      });
      expect(result).toEqual(stub);
    });
  });

  describe('update()', () => {
    it('updates and includes permissions', async () => {
      const dto: UpdateUserDto = { name: 'NewName', roleId: 2 };
      const stub = { id: 'u5', name: 'NewName', role: { permissionRole: [] } };
      dashboardPrismaServiceMock.users.update.mockResolvedValue(stub as any);

      const result = await service.update('u5', dto);

      expect(dashboardPrismaServiceMock.users.update).toHaveBeenCalledWith({
        where: { id: 'u5' },
        data: dto,
        include: {
          role: {
            include: { permissionRole: { include: { permission: true } } },
          },
        },
      });
      expect(result).toEqual(stub);
    });
  });

  describe('remove()', () => {
    it('deletes and returns the user', async () => {
      const stub = { id: 'u6' };
      dashboardPrismaServiceMock.users.delete.mockResolvedValue(stub as any);

      const result = await service.remove('u6');

      expect(dashboardPrismaServiceMock.users.delete).toHaveBeenCalledWith({
        where: { id: 'u6' },
      });
      expect(result).toEqual(stub);
    });
  });
});
