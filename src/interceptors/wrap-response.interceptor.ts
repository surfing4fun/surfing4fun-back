// src/common/interceptors/wrap-response.interceptor.ts
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
        // Only proceed if body.meta is an object and data is an array
        if (
          body &&
          typeof body === 'object' &&
          Array.isArray((body as any).data) &&
          (body as any).meta &&
          typeof (body as any).meta === 'object'
        ) {
          const { data, meta, durationMs } = body as any;
          // Merge durationMs into meta if present
          const wrappedMeta = {
            ...meta,
            ...(typeof durationMs === 'number' ? { durationMs } : {}),
          };
          return { data, meta: wrappedMeta };
        }
        // Fallback: return untouched
        return body;
      }),
    );
  }
}
