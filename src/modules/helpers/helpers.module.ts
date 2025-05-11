import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheVersioningInterceptor } from 'src/interceptors/cache-versioning.interceptor';

import { createAxios } from './instances/axios.instance';
import { DiscordLoggerService } from './services/discord-logger.service';
import { DiscordServerStatusService } from './services/discord-server-status.service';
import { MetricsDashboardService } from './services/metrics-dashboard.service';
import { MetricsService } from './services/metrics.service';

import { CountryFlagService } from '../api/country-flag/country-flag.service';
import { ServerHealthService } from '../api/server-health/server-health.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    DiscordLoggerService,
    MetricsService,
    MetricsDashboardService,
    CacheVersioningInterceptor,
    DiscordServerStatusService,
    ServerHealthService,
    CountryFlagService,
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
    DiscordServerStatusService,
    'AXIOS_INSTANCE',
  ],
})
export class HelpersModule {}
