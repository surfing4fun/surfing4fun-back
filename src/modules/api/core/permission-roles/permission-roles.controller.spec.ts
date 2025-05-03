import { Test, TestingModule } from '@nestjs/testing';

import { PermissionRolesController } from './permission-roles.controller';
import { PermissionRolesService } from './permission-roles.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';

describe('PermissionRolesController', () => {
  let controller: PermissionRolesController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PermissionsModule, RolesModule, PrismaModule],
      controllers: [PermissionRolesController],
      providers: [PermissionRolesService],
    }).compile();

    controller = module.get<PermissionRolesController>(
      PermissionRolesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
