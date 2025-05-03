import { Module } from '@nestjs/common';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';

import { ServerStatusController } from './server-status.controller';
import { ServerStatusService } from './server-status.service';

@Module({
  providers: [ServerStatusService, BhopPrismaService],
  controllers: [ServerStatusController],
})
export class ServerStatusModule {}
