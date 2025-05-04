import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DiscordLoggerService } from '../modules/helpers/services/discord-logger.service';
import { MetricsService } from '../modules/helpers/services/metrics.service';

@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: DiscordLoggerService,
    private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.metrics.recordRequest(duration, false);

          // send a rich embed for this single request metric
          const embed = this.logger.createMetricsEmbed(
            req.method,
            req.url,
            duration,
            this.metrics.totalRequests,
          );
          this.logger.sendMetricsEmbed(embed);
        },
        error: () => {
          const duration = Date.now() - start;
          this.metrics.recordRequest(duration, true);
        },
      }),
    );
  }
}
