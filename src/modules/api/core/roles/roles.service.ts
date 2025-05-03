import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsGateway } from 'src/modules/shared/events/events.gateway';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaymentService } from '../../payment/payment.service';
import { RefreshTokenService } from '../auth/refresh-token.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class RolesService {
  constructor(
    private prismaService: DashboardPrismaService,
    private eventsGateway: EventsGateway,
    private refreshTokenService: RefreshTokenService,
    private paymentService: PaymentService,
    private usersService: UsersService,
  ) {}

  create(createRoleDto: CreateRoleDto) {
    return this.prismaService.roles.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        permissionRole: {
          create: createRoleDto.permissions.map((permission) => ({
            permission: { connect: { id: permission.permissionId } },
            create: permission.create,
            read: permission.read,
            update: permission.update,
            delete: permission.delete,
          })),
        },
      },
    });
  }

  findAll() {
    return this.prismaService.roles.findMany();
  }

  findByName(name: string) {
    return this.prismaService.roles.findUnique({
      where: {
        name,
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.roles.findUnique({
      where: {
        id,
      },
      include: {
        permissionRole: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const updatedRole = await this.prismaService.roles.update({
      where: {
        id,
      },
      data: {
        name: updateRoleDto.name,
        description: updateRoleDto.description,
        permissionRole: {
          upsert: updateRoleDto.permissions.map((permission) => ({
            where: {
              roleId_permissionId: {
                roleId: id,
                permissionId: permission.permissionId,
              },
            },
            update: {
              create: permission.create,
              read: permission.read,
              update: permission.update,
              delete: permission.delete,
            },
            create: {
              permission: { connect: { id: permission.permissionId } },
              create: permission.create,
              read: permission.read,
              update: permission.update,
              delete: permission.delete,
            },
          })),
        },
      },
      include: {
        permissionRole: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Emit a websocket event to clients with the same role
    this.eventsGateway.io.sockets.sockets.forEach(async (client: any) => {
      // Check if the client's role matches
      if (client.user.role.toLowerCase() === updatedRole.name.toLowerCase()) {
        // Get the updated role with permissions from database
        const permissions = updatedRole.permissionRole?.map(
          (permissionRole) => ({
            name: permissionRole.permission.name,
            create: permissionRole.create,
            read: permissionRole.read,
            update: permissionRole.update,
            delete: permissionRole.delete,
          }),
        );

        const userId = client.user.sub;

        const user = await this.usersService.findOne(userId);

        if (!user) throw new NotFoundException('User not found!');

        // Check if there's an active subscription for the current user
        const hasActiveSubscription =
          await this.paymentService.getActiveSubscription(userId);

        const payload = {
          sub: userId,
          permissions,
          avatar: user.avatar,
          profile: user.profile,
          name: user.name,
          role: updatedRole.name,
          hasActiveSubscription: !!hasActiveSubscription,
        };

        const accessToken =
          await this.refreshTokenService.generateAccessToken(payload);

        // Emit the updated role with permissions to the client
        client.emit('auth:update', {
          permissions,
          hasActiveSubscription: !!hasActiveSubscription,
          accessToken,
        });
      }
    });

    return updatedRole;
  }

  async remove(id: number) {
    // Check if there's a user with this role
    const userWithRole = await this.prismaService.users.findFirst({
      where: {
        roleId: id,
      },
    });

    if (userWithRole) {
      throw new Error('Cannot delete role with users');
    }

    return this.prismaService.roles.delete({
      where: {
        id,
      },
    });
  }
}
