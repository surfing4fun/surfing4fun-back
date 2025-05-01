import {
  Controller,
  Get,
  Body,
  Param,
  NotFoundException,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SseService } from 'src/modules/shared/sse/sse.service';
import { AllowPermissions } from 'src/decorators/AllowPermissions';

import { RolesService } from '../roles/roles.service';
import { EPermission } from '../permissions/entities/permission.entity';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@AllowPermissions(EPermission.USERS)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly sseService: SseService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id, {
      withPermissions: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.sseService.emitEvent('user-fetched', user);

    return user;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // Check if the user exists
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with id {${id}} not found.`);
    }

    // If user role is being updated, check if it already exists
    if (user.roleId !== updateUserDto.roleId) {
      const existingRole = await this.rolesService.findOne(
        updateUserDto.roleId,
      );

      if (!existingRole) {
        throw new NotFoundException('Role not found');
      }
    }

    // Update the user if it exists and name doesn't already exist
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Check if role exists
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id {${id}} not found.`);
    }

    // Delete the user if it exists
    return this.usersService.remove(id);
  }
}
