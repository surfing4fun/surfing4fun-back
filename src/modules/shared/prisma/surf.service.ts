import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'prisma/surf/client';
import { MetricsService } from 'src/modules/helpers/services/metrics.service';

@Injectable()
export class SurfPrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly metrics: MetricsService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const duration = Date.now() - start;

      if (params.action) {
        this.metrics.recordDbLatency(duration);
      }

      return result;
    });
  }
}
