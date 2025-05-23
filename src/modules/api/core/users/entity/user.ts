import { Exclude } from 'class-transformer';

import { PermissionRole } from '../../permission-roles/entities/permission-role.entity';
import { Role } from '../../roles/entities/role.entity';

interface IRole extends Partial<Role> {
  permissionRole: Partial<PermissionRole>[] | null;
}

export class User {
  id: string;
  name: string;
  avatar: string;
  profile: string;
  @Exclude()
  roleId: number;
  role: IRole;
}

export type UserWithoutPassword = Omit<User, 'password'>;
