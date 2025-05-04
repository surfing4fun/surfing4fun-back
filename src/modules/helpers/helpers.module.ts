import { Module } from '@nestjs/common';

import { MetricsService } from './services/metrics.service';
import { PaginatorService } from './services/paginator.service';

@Module({
  providers: [PaginatorService, MetricsService],
  exports: [PaginatorService, MetricsService],
})
export class HelpersModule {}
