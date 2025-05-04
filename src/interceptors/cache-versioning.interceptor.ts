import { createHash } from 'crypto';

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheVersioningInterceptor implements NestInterceptor {
  /**
   * Adds:
   * - X-API-Version header
   * - Cache-Control header
   * - ETag header (SHA1 of the response body)
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    // 1. API version—can also be pulled from config or route versioning
    response.setHeader('X-API-Version', '1');

    // 2. Cache control: public, cached 60s by client, 120s by CDN
    response.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');

    // 3. Compute ETag after body is ready
    return next.handle().pipe(
      tap((body) => {
        // Only cache paginated payloads
        if (body && typeof body === 'object' && body.data && body.meta) {
          // Create a hash of the JSON payload
          const hash = createHash('sha1')
            .update(JSON.stringify(body))
            .digest('hex');
          response.setHeader('ETag', hash);

          // Optionally handle conditional GET
          const ifNoneMatch = request.headers['if-none-match'];
          if (ifNoneMatch === hash) {
            response.status(304).end();
          }
        }
      }),
    );
  }
}
