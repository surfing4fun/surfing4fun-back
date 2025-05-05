import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DiscordLoggerService } from 'src/modules/helpers/services/discord-logger.service';
import { MetricsService } from 'src/modules/helpers/services/metrics.service';

@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
  private readonly internalLogger = new Logger('ObservabilityInterceptor');

  /** Any request slower than this will emit a WARN */
  private static readonly WARN_THRESHOLD_MS = 500; // e.g. 500ms

  constructor(
    private readonly discord: DiscordLoggerService,
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

          if (ms > ObservabilityInterceptor.WARN_THRESHOLD_MS) {
            const title = `📙 [${method}] ${url}`;
            const desc = `⚠️ took ${ms}ms (>${ObservabilityInterceptor.WARN_THRESHOLD_MS}ms)`;
            this.discord.sendWarnEmbed(title, desc);
            this.internalLogger.warn(`[${method}] ${url} → ${ms}ms`);
          } else {
            const title = `📗 [${method}] ${url}`;
            const desc = `✅ completed in ${ms}ms`;
            this.discord.sendLogEmbed(title, desc);
            this.internalLogger.log(`[${method}] ${url} → ${ms}ms`);
          }
        },
        error: (err) => {
          const ms = Date.now() - start;
          this.metrics.recordRequest(`${method} ${url}`, ms, true);

          const msg = `❌ [${method}] ${url} → ${ms}ms`;
          this.internalLogger.error(msg, err?.stack);
        },
      }),
    );
  }
}
