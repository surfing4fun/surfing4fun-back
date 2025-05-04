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

      // Determine title & detail
      if (typeof res === 'string') {
        detail = res;
        title = exception.name;
      } else {
        const err = res as any;
        detail = err.message ?? exception.message;
        title = err.error ?? exception.name;

        // Extract field errors for validation failures
        if (Array.isArray(err.message)) {
          errors = (err.message as string[])
            .filter((msg) => typeof msg === 'string')
            .map((msg) => {
              const [field, ...rest] = msg.split(' ');
              return {
                field,
                message: rest.join(' '),
              };
            });
        }
      }
    } else {
      // Fallback for non-HTTP exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      title = 'InternalServerError';
      detail = 'Internal server error';
    }

    // Map status code to official RFC7807 type URI
    const type = `https://httpstatuses.com/${status}`;

    const errorResponse: ErrorResponseDto = {
      type,
      title,
      status,
      detail,
      instance: request.url,
      errors,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
