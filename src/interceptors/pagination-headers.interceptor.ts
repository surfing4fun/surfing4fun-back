import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Global interceptor that adds HTTP pagination headers based on response body.
 * - X-Total-Count: total number of records
 * - Link: RFC5988 pagination links
 * - Exposes headers for browsers via CORS
 */
@Injectable()
export class PaginationHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<Response>();

    // always expose these headers
    if (!res.headersSent) {
      res.header('Access-Control-Expose-Headers', 'X-Total-Count, Link');
    }

    return next.handle().pipe(
      tap((body) => {
        // never stomp on a committed response
        if (res.headersSent) return;

        if (body?.meta?.total != null && body?.links) {
          res.header('X-Total-Count', String(body.meta.total));

          const links: string[] = [];
          links.push(`<${body.links.first}>; rel="first"`);
          if (body.links.prev) links.push(`<${body.links.prev}>; rel="prev"`);
          links.push(`<${body.links.self}>; rel="self"`);
          if (body.links.next) links.push(`<${body.links.next}>; rel="next"`);
          links.push(`<${body.links.last}>; rel="last"`);

          res.header('Link', links.join(', '));
        }
      }),
    );
  }
}
