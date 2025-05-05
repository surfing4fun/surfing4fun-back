import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DiscordLoggerService } from '../modules/helpers/services/discord-logger.service';
import { MetricsService } from '../modules/helpers/services/metrics.service';

@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
  private readonly internalLogger = new Logger('ObservabilityInterceptor');

  constructor(
    private readonly discordLogger: DiscordLoggerService,
    private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest<Record<string, any>>();
    const { method, url } = req;

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.metrics.recordRequest(`${method} ${url}`, ms, false);
          this.discordLogger.sendLogEmbed(
            `📗 [${method}] ${url}`,
            `✅ completed in ${ms}ms`,
          );
          this.internalLogger.log(`[${method}] ${url} → ${ms}ms`);
        },
        error: (err) => {
          const ms = Date.now() - start;
          this.metrics.recordRequest(`${method} ${url}`, ms, true);
          this.internalLogger.error(`[${method}] ${url} → ${ms}ms`, err?.stack);
        },
      }),
    );
  }
}
