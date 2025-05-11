import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((body) => {
        if (
          body &&
          typeof body === 'object' &&
          Array.isArray((body as any).data) &&
          (body as any).meta &&
          typeof (body as any).meta === 'object'
        ) {
          const { durationMs, ...rest } = body as any;
          const wrappedMeta = {
            ...rest.meta,
            ...(typeof durationMs === 'number' ? { durationMs } : {}),
          };
          // `rest` includes data, meta (old), links, etc.; we override meta
          return {
            ...rest,
            meta: wrappedMeta,
          };
        }
        return body;
      }),
    );
  }
}
