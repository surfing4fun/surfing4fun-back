import { Module } from '@nestjs/common';

import { PermissionRolesController } from './permission-roles.controller';
import { PermissionRolesService } from './permission-roles.service';

import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [PermissionsModule, RolesModule],
  controllers: [PermissionRolesController],
  providers: [PermissionRolesService],
})
export class PermissionRolesModule {}
