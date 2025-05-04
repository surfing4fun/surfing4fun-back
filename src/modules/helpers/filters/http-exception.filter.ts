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

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exc: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'InternalServerError';
    let detail = 'Internal server error';
    let errors: ErrorDetail[] | undefined;

    if (exc instanceof HttpException) {
      status = exc.getStatus();

      // Use the exception payload if it's a BadRequestException
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

      // Map status → title/detail
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          title = 'BadRequest';
          detail = 'One or more parameters failed validation';
          break;
        case HttpStatus.UNAUTHORIZED:
          title = 'Unauthorized';
          detail = 'Authentication credentials were missing or invalid';
          break;
        case HttpStatus.FORBIDDEN:
          title = 'Forbidden';
          detail = 'You do not have permission to access this resource';
          break;
        case HttpStatus.NOT_FOUND:
          title = 'NotFound';
          detail = 'Requested resource was not found';
          break;
        case HttpStatus.CONFLICT:
          title = 'Conflict';
          detail = 'Request conflicts with current resource state';
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
          // For other HttpExceptions, attempt to pull message/error from payload
          const responsePayload = exc.getResponse();
          if (typeof responsePayload === 'object') {
            detail = (responsePayload as any).message ?? exc.message;
            title = (responsePayload as any).error ?? exc.name;
          } else if (typeof responsePayload === 'string') {
            detail = responsePayload;
            title = exc.name;
          }
      }
    }

    // RFC 7807 type URI
    const type = `https://httpstatuses.com/${status}`;

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
