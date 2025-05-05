import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DiscordLoggerService } from './services/discord-logger.service';
import { MetricsDashboardService } from './services/metrics-dashboard.service';
import { MetricsService } from './services/metrics.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [DiscordLoggerService, MetricsService, MetricsDashboardService],
  exports: [DiscordLoggerService, MetricsService],
})
export class HelpersModule {}
