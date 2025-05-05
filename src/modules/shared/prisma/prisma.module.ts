import { Global, Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { BhopPrismaService } from './bhop.service';
import { DashboardPrismaService } from './dashboard.service';
import { SurfPrismaService } from './surf.service';

@Global()
@Module({
  imports: [HelpersModule],
  providers: [DashboardPrismaService, BhopPrismaService, SurfPrismaService],
  exports: [DashboardPrismaService, BhopPrismaService, SurfPrismaService],
})
export class PrismaModule {}
