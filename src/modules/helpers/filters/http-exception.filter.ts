import * as os from 'os';
import * as process from 'process';

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ErrorResponseDto, ErrorDetail } from '../dto/error-response.dto';
import { DiscordLoggerService } from '../services/discord-logger.service';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: DiscordLoggerService) {}

  catch(exc: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (res.headersSent) {
      return;
    }

    // — Request & user context —
    const { method, url, params, query, body, headers } = req;
    const clientIp = req.ip;
    const userAgent = headers['user-agent'] || 'unknown';
    const requestId = headers['x-request-id'] as string | undefined;
    const userId = req.user && (req.user as any).id; // if usin g auth guard
    const featureFlags = (req as any).featureFlags; // if middleware sets flags

    // — System & deployment metadata —
    const hostname = os.hostname();
    const environment = process.env.NODE_ENV || 'unknown';
    const commitSha = process.env.COMMIT_SHA || process.env.GIT_SHA;
    const cpuUsage = JSON.stringify(process.cpuUsage());
    const memUsage = JSON.stringify(process.memoryUsage());

    // — Determine HTTP error details —
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'InternalServerError';
    let detail = 'Internal server error';
    let errors: ErrorDetail[] | undefined;

    if (exc instanceof HttpException) {
      status = exc.getStatus();
      if (exc instanceof BadRequestException) {
        const payload = exc.getResponse();
        if (
          typeof payload === 'object' &&
          Array.isArray((payload as any).message)
        ) {
          errors = (payload as any).message
            .filter((m): m is string => typeof m === 'string')
            .map((msg) => {
              const [field, ...rest] = msg.split(' ');
              return { field, message: rest.join(' ') };
            });
        }
      }
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          title = 'BadRequest';
          detail = 'Validation failed';
          break;
        case HttpStatus.UNAUTHORIZED:
          title = 'Unauthorized';
          detail = 'Invalid credentials';
          break;
        case HttpStatus.FORBIDDEN:
          title = 'Forbidden';
          detail = 'Access denied';
          break;
        case HttpStatus.NOT_FOUND:
          title = 'NotFound';
          detail = 'Resource not found';
          break;
        case HttpStatus.CONFLICT:
          title = 'Conflict';
          detail = 'Conflict occurred';
          break;
        case HttpStatus.UNPROCESSABLE_ENTITY:
          title = 'UnprocessableEntity';
          detail = 'Semantic validation failed';
          break;
        case HttpStatus.TOO_MANY_REQUESTS:
          title = 'TooManyRequests';
          detail = 'Rate limit exceeded';
          break;
        default:
          const resp = exc.getResponse();
          if (typeof resp === 'object') {
            detail = (resp as any).message ?? exc.message;
            title = (resp as any).error ?? exc.name;
          } else if (typeof resp === 'string') {
            detail = resp;
            title = exc.name;
          }
      }
    }

    // — Build HTTP error response (RFC-7807) —
    const type = `https://httpstatuses.com/${status}`;
    const errorResponse: ErrorResponseDto = {
      type,
      title,
      status,
      detail,
      instance: url,
      timestamp: new Date().toISOString(),
      errors,
    };

    // — Send to Discord with full context —
    this.logger.errorEmbed({
      title: `❌ Error: [${method}] ${url}`,
      description: detail,
      httpStatus: status,
      params,
      query,
      body: body && Object.keys(body).length ? body : undefined,
      clientIp,
      userAgent,
      requestId,
      userId,
      featureFlags,
      hostname,
      environment,
      commitSha,
      cpuUsage,
      memoryUsage: memUsage,
      traceId: headers['x-trace-id'] as string | undefined,
      spanId: headers['x-span-id'] as string | undefined,
      stack: exc instanceof Error ? exc.stack : undefined,
    });

    // — Return JSON to client —
    res.status(status).json(errorResponse);
  }
}
