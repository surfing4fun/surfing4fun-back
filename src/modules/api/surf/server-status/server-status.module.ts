import { Module } from '@nestjs/common';

import { ServerStatusController } from './server-status.controller';
import { ServerStatusService } from './server-status.service';
import { SurfPrismaService } from '../../../shared/prisma/surf.service';

@Module({
  providers: [ServerStatusService, SurfPrismaService],
  controllers: [ServerStatusController],
})
export class ServerStatusModule {}
