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

/**
 * Adds:
 * - X-API-Version header
 * - Cache-Control header
 * - ETag header (SHA1 of the response body)
 */
@Injectable()
export class CacheVersioningInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const res = http.getResponse<Response>();
    const req = http.getRequest<Request>();
    const version = '1';

    // 1) Always set API version + Cache-Control
    res.setHeader('X-API-Version', version);
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');

    // 2) We can’t compute ETag until we know the body, so we wrap next.handle…
    return next.handle().pipe(
      tap((body) => {
        if (!body || typeof body !== 'object' || !body.meta) return;

        // compute ETag
        const hash = createHash('sha1')
          .update(JSON.stringify(body))
          .digest('hex');
        res.setHeader('ETag', hash);

        // 3) Now do conditional GET
        if (req.headers['if-none-match'] === hash) {
          // this commits the response
          res.status(304).end();
          // short-circuit: don’t let Nest send another response
          throw new Error('__CACHE__');
        }
      }),
    );
  }
}
