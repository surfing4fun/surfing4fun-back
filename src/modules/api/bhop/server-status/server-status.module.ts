import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { ServerStatusController } from './server-status.controller';
import { ServerStatusService } from './server-status.service';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';

@Module({
  imports: [HelpersModule],
  providers: [ServerStatusService, BhopPrismaService],
  controllers: [ServerStatusController],
})
export class ServerStatusModule {}
