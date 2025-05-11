import { Test, TestingModule } from '@nestjs/testing';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';
import { dashboardPrismaServiceMock } from 'src/modules/shared/prisma/spec/mock/dashboard.service.mock';

import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionsService } from '../permissions.service';

describe('PermissionsService (unit)', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: DashboardPrismaService,
          useValue: dashboardPrismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('calls prisma.create and returns the new permission', async () => {
      const dto: CreatePermissionDto = { name: 'users' };
      const stub = { id: 1, name: 'users' };
      dashboardPrismaServiceMock.permissions.create.mockResolvedValue(
        stub as any,
      );

      const result = await service.create(dto);

      expect(
        dashboardPrismaServiceMock.permissions.create,
      ).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(stub);
    });
  });

  describe('findAll()', () => {
    it('returns all permissions', async () => {
      const stub = [
        { id: 1, name: 'users' },
        { id: 2, name: 'roles' },
      ];
      dashboardPrismaServiceMock.permissions.findMany.mockResolvedValue(
        stub as any,
      );

      const result = await service.findAll();

      expect(
        dashboardPrismaServiceMock.permissions.findMany,
      ).toHaveBeenCalled();
      expect(result).toEqual(stub);
    });
  });

  describe('findByName()', () => {
    it('returns the first matching permission', async () => {
      const stub = { id: 2, name: 'roles' };
      dashboardPrismaServiceMock.permissions.findFirst.mockResolvedValue(
        stub as any,
      );

      const result = await service.findByName('roles');

      expect(
        dashboardPrismaServiceMock.permissions.findFirst,
      ).toHaveBeenCalledWith({
        where: { name: 'roles' },
      });
      expect(result).toEqual(stub);
    });
  });

  describe('findOne()', () => {
    it('returns one permission by id', async () => {
      const stub = { id: 3, name: 'permission_roles' };
      dashboardPrismaServiceMock.permissions.findUnique.mockResolvedValue(
        stub as any,
      );

      const result = await service.findOne(3);

      expect(
        dashboardPrismaServiceMock.permissions.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: 3 },
      });
      expect(result).toEqual(stub);
    });
  });

  describe('update()', () => {
    it('updates and returns the permission', async () => {
      const dto: UpdatePermissionDto = { name: 'users_updated' };
      const stub = { id: 1, name: 'users_updated' };
      dashboardPrismaServiceMock.permissions.update.mockResolvedValue(
        stub as any,
      );

      const result = await service.update(1, dto);

      expect(
        dashboardPrismaServiceMock.permissions.update,
      ).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
      expect(result).toEqual(stub);
    });
  });

  describe('remove()', () => {
    it('deletes and returns the permission', async () => {
      const stub = { id: 4, name: 'to_delete' };
      dashboardPrismaServiceMock.permissions.delete.mockResolvedValue(
        stub as any,
      );

      const result = await service.remove(4);

      expect(
        dashboardPrismaServiceMock.permissions.delete,
      ).toHaveBeenCalledWith({
        where: { id: 4 },
      });
      expect(result).toEqual(stub);
    });
  });
});
