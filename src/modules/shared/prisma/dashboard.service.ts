import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '../../../../prisma/dashboard/client';

@Injectable()
export class DashboardPrismaService
  extends PrismaClient
  implements OnModuleInit
{
  async onModuleInit() {
    await this.$connect();
  }
}
