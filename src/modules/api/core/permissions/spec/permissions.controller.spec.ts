import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionsController } from '../permissions.controller';
import { PermissionsService } from '../permissions.service';

describe('PermissionsController (unit)', () => {
  let controller: PermissionsController;
  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [{ provide: PermissionsService, useValue: mockService }],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    const dto: CreatePermissionDto = { name: 'users' };
    it('throws ConflictException if name exists', async () => {
      mockService.findByName.mockResolvedValue({ id: 1, name: 'users' });
      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
      expect(mockService.findByName).toHaveBeenCalledWith('users');
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('creates and returns new permission when name is unique', async () => {
      mockService.findByName.mockResolvedValue(null);
      mockService.create.mockResolvedValue({ id: 2, name: 'users' });
      const result = await controller.create(dto);
      expect(mockService.findByName).toHaveBeenCalledWith('users');
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 2, name: 'users' });
    });
  });

  describe('findAll()', () => {
    it('returns array of permissions', () => {
      mockService.findAll.mockReturnValue([{ id: 1, name: 'users' }]);
      expect(controller.findAll()).toEqual([{ id: 1, name: 'users' }]);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('throws NotFoundException if not found', async () => {
      mockService.findOne.mockResolvedValue(null);
      await expect(controller.findOne('5')).rejects.toThrow(NotFoundException);
      expect(mockService.findOne).toHaveBeenCalledWith(5);
    });

    it('returns permission if found', async () => {
      const stub = { id: 3, name: 'roles' };
      mockService.findOne.mockResolvedValue(stub);
      const result = await controller.findOne('3');
      expect(mockService.findOne).toHaveBeenCalledWith(3);
      expect(result).toEqual(stub);
    });
  });

  describe('update()', () => {
    const dto: UpdatePermissionDto = { name: 'perm_x' };

    it('throws NotFoundException if permission does not exist', async () => {
      mockService.findOne.mockResolvedValue(null);
      await expect(controller.update('7', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockService.findOne).toHaveBeenCalledWith(7);
      expect(mockService.update).not.toHaveBeenCalled();
    });

    it('throws ConflictException if new name conflicts', async () => {
      mockService.findOne.mockResolvedValue({ id: 7, name: 'old' });
      mockService.findByName.mockResolvedValue({ id: 8, name: 'perm_x' });
      await expect(controller.update('7', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockService.findByName).toHaveBeenCalledWith('perm_x');
    });

    it('updates and returns when valid', async () => {
      mockService.findOne.mockResolvedValue({ id: 7, name: 'old' });
      mockService.findByName.mockResolvedValue(null);
      mockService.update.mockResolvedValue({ id: 7, name: 'perm_x' });
      const result = await controller.update('7', dto);
      expect(mockService.update).toHaveBeenCalledWith(7, dto);
      expect(result).toEqual({ id: 7, name: 'perm_x' });
    });
  });

  describe('remove()', () => {
    it('throws NotFoundException if not found', async () => {
      mockService.findOne.mockResolvedValue(null);
      await expect(controller.remove('9')).rejects.toThrow(NotFoundException);
      expect(mockService.findOne).toHaveBeenCalledWith(9);
      expect(mockService.remove).not.toHaveBeenCalled();
    });

    it('removes and returns id when found', async () => {
      mockService.findOne.mockResolvedValue({ id: 9, name: 'foo' });
      mockService.remove.mockResolvedValue(9);
      const result = await controller.remove('9');
      expect(mockService.remove).toHaveBeenCalledWith(9);
      expect(result).toEqual(9);
    });
  });
});
