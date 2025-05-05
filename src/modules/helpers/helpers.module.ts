import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheVersioningInterceptor } from 'src/interceptors/cache-versioning.interceptor';

import { createAxios } from './instances/axios.instance';
import { DiscordLoggerService } from './services/discord-logger.service';
import { MetricsDashboardService } from './services/metrics-dashboard.service';
import { MetricsService } from './services/metrics.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    DiscordLoggerService,
    MetricsService,
    MetricsDashboardService,
    CacheVersioningInterceptor,
    {
      provide: 'AXIOS_INSTANCE',
      useFactory: (metrics: MetricsService) => createAxios(metrics),
      inject: [MetricsService],
    },
  ],
  exports: [
    DiscordLoggerService,
    MetricsService,
    CacheVersioningInterceptor,
    'AXIOS_INSTANCE',
  ],
})
export class HelpersModule {}
