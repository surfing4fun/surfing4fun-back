import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SseService } from 'src/modules/shared/sse/sse.service';

import { RolesService } from '../../roles/roles.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController (unit)', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const mockRolesService = { findOne: jest.fn() };
  const mockSseService = { emitEvent: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: RolesService, useValue: mockRolesService },
        { provide: SseService, useValue: mockSseService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('returns all users', async () => {
      const stub = [{ id: 'u1' }];
      mockUsersService.findAll.mockReturnValue(stub);
      expect(controller.findAll()).toEqual(stub);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('throws NotFoundException if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      await expect(controller.findOne('x')).rejects.toThrow(NotFoundException);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('x', {
        withPermissions: true,
      });
    });

    it('returns user and emits SSE event when found', async () => {
      const stub = { id: 'u2' };
      mockUsersService.findOne.mockResolvedValue(stub);
      const result = await controller.findOne('u2');
      expect(mockUsersService.findOne).toHaveBeenCalledWith('u2', {
        withPermissions: true,
      });
      expect(mockSseService.emitEvent).toHaveBeenCalledWith(
        'user-fetched',
        stub,
      );
      expect(result).toEqual(stub);
    });
  });

  describe('update()', () => {
    const dto: UpdateUserDto = { name: 'Alice', roleId: 3 };

    it('throws NotFoundException if user missing', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      await expect(controller.update('y', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith('y');
    });

    it('throws NotFoundException if new role not found', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: 'u3', roleId: 2 });
      mockRolesService.findOne.mockResolvedValue(null);
      await expect(controller.update('u3', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRolesService.findOne).toHaveBeenCalledWith(dto.roleId);
    });

    it('updates and returns user when valid', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: 'u4', roleId: 3 });
      mockRolesService.findOne.mockResolvedValue({ id: 3 });
      mockUsersService.update.mockResolvedValue({ id: 'u4', name: 'Alice' });
      const result = await controller.update('u4', dto);
      expect(mockUsersService.update).toHaveBeenCalledWith('u4', dto);
      expect(result).toEqual({ id: 'u4', name: 'Alice' });
    });
  });

  describe('remove()', () => {
    it('throws NotFoundException if user missing', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      await expect(controller.remove('z')).rejects.toThrow(NotFoundException);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('z');
    });

    it('removes and returns id when found', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: 'u5' });
      mockUsersService.remove.mockResolvedValue('u5');
      const result = await controller.remove('u5');
      expect(mockUsersService.remove).toHaveBeenCalledWith('u5');
      expect(result).toEqual('u5');
    });
  });
});
