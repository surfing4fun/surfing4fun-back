import { Injectable } from '@nestjs/common';

import { DashboardPrismaService } from '../../shared/prisma/dashboard.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: DashboardPrismaService) {}

  create(user: CreateUserDto) {
    const { name, roleId, steamId, avatar, profile } = user;

    return this.prismaService.users.create({
      data: {
        name,
        steamId,
        role: {
          connect: {
            id: roleId,
          },
        },
        avatar,
        profile,
      },
      include: {
        role: {
          include: {
            permissionRole: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  findAll() {
    return this.prismaService.users.findMany();
  }

  findOne(id: string, options: { withPermissions: boolean } = null) {
    return this.prismaService.users.findUnique({
      where: { id },
      ...(options?.withPermissions && {
        include: {
          role: {
            include: {
              permissionRole: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      }),
    });
  }

  findBySteamId(steamId: string, withPermissions: boolean = false) {
    return this.prismaService.users.findFirst({
      where: { steamId },
      ...(withPermissions && {
        include: {
          role: {
            include: {
              permissionRole: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      }),
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prismaService.users.update({
      where: { id },
      data: updateUserDto,
      include: {
        role: {
          include: {
            permissionRole: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  remove(id: string) {
    return this.prismaService.users.delete({ where: { id } });
  }
}
