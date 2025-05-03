import { Module } from '@nestjs/common';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';

import { ServerStatusController } from './server-status.controller';
import { ServerStatusService } from './server-status.service';

@Module({
  providers: [ServerStatusService, SurfPrismaService],
  controllers: [ServerStatusController],
})
export class ServerStatusModule {}
