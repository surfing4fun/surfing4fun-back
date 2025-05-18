import { Test, TestingModule } from '@nestjs/testing';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';
import { dashboardPrismaServiceMock } from 'src/modules/shared/prisma/spec/mock/dashboard.service.mock';

import { CreatePermissionRoleDto } from '../dto/create-permission-role.dto';
import { UpdatePermissionRoleDto } from '../dto/update-permission-role.dto';
import { PermissionRolesService } from '../permission-roles.service';

describe('PermissionRolesService (unit)', () => {
  let service: PermissionRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionRolesService,
        {
          provide: DashboardPrismaService,
          useValue: dashboardPrismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<PermissionRolesService>(PermissionRolesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('creates a permissionRole', async () => {
      const dto: CreatePermissionRoleDto = {
        create: true,
        read: true,
        update: false,
        delete: false,
        permissionId: 10,
        roleId: 20,
      };
      const stub = { ...dto, id: 1 };
      dashboardPrismaServiceMock.permissionRole.create.mockResolvedValue(
        stub as any,
      );

      const result = await service.create(dto);
      expect(
        dashboardPrismaServiceMock.permissionRole.create,
      ).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(stub);
    });
  });

  describe('findAll()', () => {
    it('returns all permissionRoles with includes', async () => {
      const stub = [
        {
          id: 1,
          create: true,
          read: true,
          update: false,
          delete: false,
          permission: {},
          role: {},
        },
      ];
      dashboardPrismaServiceMock.permissionRole.findMany.mockResolvedValue(
        stub as any,
      );

      const result = await service.findAll();
      expect(
        dashboardPrismaServiceMock.permissionRole.findMany,
      ).toHaveBeenCalledWith({
        include: { permission: true, role: true },
      });
      expect(result).toEqual(stub);
    });
  });

  describe('findOne()', () => {
    it('finds by composite key', async () => {
      const stub = { id: 2, permissionId: 5, roleId: 6 };
      dashboardPrismaServiceMock.permissionRole.findFirst.mockResolvedValue(
        stub as any,
      );

      const result = await service.findOne(5, 6);
      expect(
        dashboardPrismaServiceMock.permissionRole.findFirst,
      ).toHaveBeenCalledWith({
        where: { AND: [{ permissionId: 5 }, { roleId: 6 }] },
      });
      expect(result).toEqual(stub);
    });
  });

  describe('update()', () => {
    it('updates with composite key and data', async () => {
      const dto: UpdatePermissionRoleDto = { read: false };
      const stub = {
        id: 3,
        permissionId: 7,
        roleId: 8,
        create: true,
        read: false,
        update: true,
        delete: true,
      };
      dashboardPrismaServiceMock.permissionRole.update.mockResolvedValue(
        stub as any,
      );

      const result = await service.update({ permissionId: 7, roleId: 8 }, dto);
      expect(
        dashboardPrismaServiceMock.permissionRole.update,
      ).toHaveBeenCalledWith({
        where: { roleId_permissionId: { permissionId: 7, roleId: 8 } },
        data: dto,
      });
      expect(result).toEqual(stub);
    });
  });

  describe('remove()', () => {
    it('deletes by composite key', async () => {
      const stub = { id: 4, permissionId: 9, roleId: 10 };
      dashboardPrismaServiceMock.permissionRole.delete.mockResolvedValue(
        stub as any,
      );

      const result = await service.remove(9, 10);
      expect(
        dashboardPrismaServiceMock.permissionRole.delete,
      ).toHaveBeenCalledWith({
        where: { roleId_permissionId: { permissionId: 9, roleId: 10 } },
      });
      expect(result).toEqual(stub);
    });
  });
});
