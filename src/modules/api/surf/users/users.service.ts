import { Injectable } from '@nestjs/common';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: SurfPrismaService) {}

  async getUsers(auth?: number) {
    try {
      const where = auth ? { auth } : {};

      const users = await this.prisma.users.findMany({
        where,
        select: {
          auth: true,
          name: true,
          firstlogin: true,
          lastlogin: true,
          points: true,
          playtime: true,
        },
      });

      return users.map((user) => ({
        ...user,
        ip: user.ip?.toString(),
        firstlogin: user.firstlogin?.toString(),
        lastlogin: user.lastlogin?.toString(),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }
}
