import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'prisma/surf/client';

@Injectable()
export class SurfPrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
