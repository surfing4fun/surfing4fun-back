import { createHash } from 'crypto';

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Observable, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

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

    // always set these
    res.setHeader('X-API-Version', '1');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');

    return next.handle().pipe(
      // after controller produces `body`
      mergeMap((body) => {
        if (
          body &&
          typeof body === 'object' &&
          body.meta != null &&
          body.data != null
        ) {
          const hash = createHash('sha1')
            .update(JSON.stringify(body))
            .digest('hex');
          res.setHeader('ETag', hash);

          if (req.headers['if-none-match'] === hash) {
            // 1) send 304
            res.status(304).end();
            // 2) stop here
            return EMPTY;
          }
        }
        // if not a 304, keep flowing the real body
        return new Observable((subscriber) => {
          subscriber.next(body);
          subscriber.complete();
        });
      }),
    );
  }
}
