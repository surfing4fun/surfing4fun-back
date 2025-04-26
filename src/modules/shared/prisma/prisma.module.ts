import { Global, Module } from '@nestjs/common';

import { DashboardPrismaService } from './dashboard.service';

@Global()
@Module({
  providers: [DashboardPrismaService],
  exports: [DashboardPrismaService],
})
export class PrismaModule {}
