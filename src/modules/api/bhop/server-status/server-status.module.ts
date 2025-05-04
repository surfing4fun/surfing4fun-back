import { Module } from '@nestjs/common';

import { ServerStatusController } from './server-status.controller';
import { ServerStatusService } from './server-status.service';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';

@Module({
  providers: [ServerStatusService, BhopPrismaService],
  controllers: [ServerStatusController],
})
export class ServerStatusModule {}
