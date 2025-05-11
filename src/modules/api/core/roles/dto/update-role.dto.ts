import { PartialType } from '@nestjs/swagger';

import { CreateRoleDto } from './create-role.dto';

import { PermissionRole } from '../../permission-roles/entities/permission-role.entity';

interface IPermission extends Partial<PermissionRole> {}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  permissions: IPermission[];
}
