import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from 'src/modules/helpers/services/metrics.service';

interface ICachedResponse {
  timestamp: number;
  data: any;
}

@Injectable()
export class CacheVersioningInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheVersioningInterceptor.name);
  private readonly ttl = 60 * 1000; // 1 minute
  private cache = new Map<string, ICachedResponse>();

  constructor(private readonly metrics: MetricsService) {} // ← inject MetricsService

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<any>();
    const key = this.cacheKey(req);
    const now = Date.now();

    const entry = this.cache.get(key);
    if (entry && now - entry.timestamp < this.ttl) {
      // CACHE HIT
      this.metrics.recordCacheHit();
      this.logger.log(`Cache hit for ${key}`);
      return of(entry.data);
    }

    // CACHE MISS
    this.metrics.recordCacheMiss();
    this.logger.log(`Cache miss for ${key}`);

    return next.handle().pipe(
      tap((response) => {
        this.cache.set(key, { timestamp: now, data: response });
      }),
    );
  }

  private cacheKey(req: any): string {
    const { method, originalUrl, query, body } = req;
    return `${method}:${originalUrl}:${JSON.stringify(query)}:${JSON.stringify(body)}`;
  }
}
