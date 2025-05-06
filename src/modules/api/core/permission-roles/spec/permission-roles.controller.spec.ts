import { NotFoundException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PermissionsService } from '../../permissions/permissions.service';
import { RolesService } from '../../roles/roles.service';
import { CreatePermissionRoleDto } from '../dto/create-permission-role.dto';
import { UpdatePermissionRoleDto } from '../dto/update-permission-role.dto';
import { PermissionRolesController } from '../permission-roles.controller';
import { PermissionRolesService } from '../permission-roles.service';

describe('PermissionRolesController (unit)', () => {
  let controller: PermissionRolesController;

  const mockPRService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const mockPermService = { findOne: jest.fn() };
  const mockRoleService = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionRolesController],
      providers: [
        { provide: PermissionRolesService, useValue: mockPRService },
        { provide: PermissionsService, useValue: mockPermService },
        { provide: RolesService, useValue: mockRoleService },
      ],
    }).compile();

    controller = module.get<PermissionRolesController>(
      PermissionRolesController,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    const dto: CreatePermissionRoleDto = {
      create: true,
      read: true,
      update: false,
      delete: false,
      permissionId: 1,
      roleId: 2,
    };

    it('throws NotFound if permission missing', async () => {
      mockPermService.findOne.mockResolvedValue(null);
      await expect(controller.create('1', '2', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPermService.findOne).toHaveBeenCalledWith(1);
    });

    it('throws NotFound if role missing', async () => {
      mockPermService.findOne.mockResolvedValue({ id: 1 });
      mockRoleService.findOne.mockResolvedValue(null);
      await expect(controller.create('1', '2', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRoleService.findOne).toHaveBeenCalledWith(2);
    });

    it('throws Conflict if already assigned', async () => {
      mockPermService.findOne.mockResolvedValue({ id: 1 });
      mockRoleService.findOne.mockResolvedValue({ id: 2 });
      mockPRService.findOne.mockResolvedValue({ permissionId: 1, roleId: 2 });
      await expect(controller.create('1', '2', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates when valid', async () => {
      mockPermService.findOne.mockResolvedValue({ id: 1 });
      mockRoleService.findOne.mockResolvedValue({ id: 2 });
      mockPRService.findOne.mockResolvedValue(null);
      mockPRService.create.mockResolvedValue({ ...dto, id: 3 });
      const result = await controller.create('1', '2', dto);
      expect(mockPRService.create).toHaveBeenCalledWith({
        ...dto,
        permissionId: 1,
        roleId: 2,
      });
      expect(result).toEqual({ ...dto, id: 3 });
    });
  });

  describe('findOne()', () => {
    it('throws NotFound if not assigned', async () => {
      mockPRService.findOne.mockResolvedValue(null);
      await expect(controller.findOne('5', '6')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPRService.findOne).toHaveBeenCalledWith(5, 6);
    });

    it('returns when assigned', async () => {
      const stub = { id: 7, permissionId: 5, roleId: 6 };
      mockPRService.findOne.mockResolvedValue(stub);
      const result = await controller.findOne('5', '6');
      expect(result).toEqual(stub);
    });
  });

  describe('update()', () => {
    const dto: UpdatePermissionRoleDto = { read: false };

    it('throws NotFound if not assigned', async () => {
      mockPRService.findOne.mockResolvedValue(null);
      await expect(controller.update('1', '2', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates when assigned', async () => {
      const stub = { id: 8, permissionId: 1, roleId: 2, read: false };
      mockPRService.findOne.mockResolvedValue(stub);
      mockPRService.update.mockResolvedValue(stub);
      const result = await controller.update('1', '2', dto);
      expect(mockPRService.update).toHaveBeenCalledWith(
        { permissionId: 1, roleId: 2 },
        dto,
      );
      expect(result).toEqual(stub);
    });
  });

  describe('remove()', () => {
    it('throws NotFound if not assigned', async () => {
      mockPRService.findOne.mockResolvedValue(null);
      await expect(controller.remove('3', '4')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('removes when assigned', async () => {
      mockPRService.findOne.mockResolvedValue({
        id: 9,
        permissionId: 3,
        roleId: 4,
      });
      mockPRService.remove.mockResolvedValue({ id: 9 });
      const result = await controller.remove('3', '4');
      expect(mockPRService.remove).toHaveBeenCalledWith(3, 4);
      expect(result).toEqual({ id: 9 });
    });
  });
});
