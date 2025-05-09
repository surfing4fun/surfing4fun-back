import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from 'src/modules/shared/events/events.gateway';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';
import { dashboardPrismaServiceMock } from 'src/modules/shared/prisma/spec/mock/dashboard.service.mock';

import { PaymentService } from '../../../payment/payment.service';
import { RefreshTokenService } from '../../auth/refresh-token.service';
import { UsersService } from '../../users/users.service';
import { RolesService } from '../roles.service';

describe('RolesService (unit)', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: DashboardPrismaService,
          useValue: dashboardPrismaServiceMock,
        },
        {
          provide: EventsGateway,
          useValue: { io: { sockets: { sockets: [] } } },
        },
        { provide: RefreshTokenService, useValue: {} },
        { provide: PaymentService, useValue: {} },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('returns a list of roles (raw model)', async () => {
      const stub = [{ id: 1, name: 'admin', description: 'administrator' }];
      dashboardPrismaServiceMock.roles.findMany.mockResolvedValue(stub);

      const result = await service.findAll();

      expect(dashboardPrismaServiceMock.roles.findMany).toHaveBeenCalled();
      expect(result).toEqual(stub);
    });
  });

  describe('findOne()', () => {
    it('calls findUnique with include and returns full record', async () => {
      const stub = {
        id: 1,
        name: 'admin',
        description: 'administrator',
        permissionRole: [{ permission: { name: 'perm1' } }],
      };
      dashboardPrismaServiceMock.roles.findUnique.mockResolvedValue(
        stub as any,
      );

      const result = await service.findOne(1);

      expect(dashboardPrismaServiceMock.roles.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { permissionRole: { include: { permission: true } } },
      });
      expect(result).toEqual(stub);
    });
  });

  describe('create()', () => {
    it('creates with correct data and returns raw model', async () => {
      const dto = { name: 'user', description: 'standard', permissions: [] };
      const stub = { id: 2, name: 'user', description: 'standard' };
      dashboardPrismaServiceMock.roles.create.mockResolvedValue(stub as any);

      const result = await service.create(dto);

      expect(dashboardPrismaServiceMock.roles.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          description: dto.description,
          permissionRole: { create: [] },
        },
      });
      expect(result).toEqual(stub);
    });
  });

  describe('update()', () => {
    it('updates with correct where/data/include and returns full record', async () => {
      const dto = { name: 'editor', description: 'can edit', permissions: [] };
      const stub = {
        id: 3,
        name: 'editor',
        description: 'can edit',
        permissionRole: [],
      };
      dashboardPrismaServiceMock.roles.update.mockResolvedValue(stub as any);

      const result = await service.update(3, dto);

      expect(dashboardPrismaServiceMock.roles.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: {
          name: dto.name,
          description: dto.description,
          permissionRole: { upsert: [] },
        },
        include: { permissionRole: { include: { permission: true } } },
      });
      expect(result).toEqual(stub);
    });
  });

  describe('remove()', () => {
    it('deletes the role and returns the deleted record when no users exist', async () => {
      const stub = { id: 4, name: 'guest', description: 'read-only' };
      dashboardPrismaServiceMock.users.findFirst.mockResolvedValue(null as any);
      dashboardPrismaServiceMock.roles.delete.mockResolvedValue(stub as any);

      const result = await service.remove(4);

      expect(dashboardPrismaServiceMock.users.findFirst).toHaveBeenCalledWith({
        where: { roleId: 4 },
      });
      expect(dashboardPrismaServiceMock.roles.delete).toHaveBeenCalledWith({
        where: { id: 4 },
      });
      expect(result).toEqual(stub);
    });

    it('throws if a user with that role exists', async () => {
      dashboardPrismaServiceMock.users.findFirst.mockResolvedValue({
        id: 99,
      } as any);
      await expect(service.remove(5)).rejects.toThrow(
        'Cannot delete role with users',
      );
    });
  });
});
