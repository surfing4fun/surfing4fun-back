import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ErrorResponseDto, ErrorDetail } from '../dto/error-response.dto';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let title: string;
    let detail: string;
    let type: string;
    let errors: ErrorDetail[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      // Determine title and detail from response
      if (typeof res === 'string') {
        detail = res;
        title = exception.name;
      } else if (typeof res === 'object') {
        const err = res as any;
        detail = err.message ?? exception.message;
        title = err.error ?? exception.name;

        // Extract field errors if present
        if (Array.isArray(err.message)) {
          errors = (err.message as string[])
            .filter((msg) => typeof msg === 'string')
            .map((msg) => ({ field: '', message: msg }));
        }
      }
    } else {
      // Non-HTTP exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      title = 'InternalServerError';
      detail = 'Internal server error';
    }

    // Map status to RFC7807 type URI
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        type = 'https://httpstatuses.com/400';
        break;
      case HttpStatus.UNAUTHORIZED:
        type = 'https://httpstatuses.com/401';
        break;
      case HttpStatus.FORBIDDEN:
        type = 'https://httpstatuses.com/403';
        break;
      case HttpStatus.NOT_FOUND:
        type = 'https://httpstatuses.com/404';
        break;
      case HttpStatus.CONFLICT:
        type = 'https://httpstatuses.com/409';
        break;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        type = 'https://httpstatuses.com/422';
        break;
      case HttpStatus.TOO_MANY_REQUESTS:
        type = 'https://httpstatuses.com/429';
        break;
      default:
        type = 'https://httpstatuses.com/' + status;
    }

    const errorResponse: ErrorResponseDto = {
      type,
      title,
      status,
      detail,
      instance: request.url,
      timestamp: new Date().toISOString(),
      errors,
    };

    response.status(status).json(errorResponse);
  }
}
