import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'prisma/bhop/client';

@Injectable()
export class BhopPrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
