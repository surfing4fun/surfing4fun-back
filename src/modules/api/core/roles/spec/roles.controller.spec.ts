import { Test, TestingModule } from '@nestjs/testing';

import { RolesController } from '../roles.controller';
import { RolesService } from '../roles.service';

describe('RolesController (unit)', () => {
  let controller: RolesController;

  const mockRolesService = {
    findAll: jest
      .fn()
      .mockResolvedValue([
        { id: 1, name: 'admin', description: 'administrator' },
      ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useValue: mockRolesService }],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('calls service.findAll() and returns the list of roles', async () => {
      const result = await controller.findAll();

      expect(mockRolesService.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 1, name: 'admin', description: 'administrator' },
      ]);
    });
  });
});
