import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { ServerStatusController } from './server-status.controller';
import { ServerStatusService } from './server-status.service';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';

@Module({
  imports: [HelpersModule],
  providers: [ServerStatusService, SurfPrismaService],
  controllers: [ServerStatusController],
})
export class ServerStatusModule {}
