// main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import { validatorOptions } from './configs/validator-options';
import { CacheVersioningInterceptor } from './interceptors/cache-versioning.interceptor';
import { PaginationHeadersInterceptor } from './interceptors/pagination-headers.interceptor';
import { ResponseTimeInterceptor } from './interceptors/respone-time.interceptor';
import { WrapResponseInterceptor } from './interceptors/wrap-response.interceptor';
import { AppModule } from './modules/app/app.module';
import { ErrorResponseDto } from './modules/helpers/dto/error-response.dto';
import { HttpErrorFilter } from './modules/helpers/filters/http-exception.filter';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  const allowedOrigins = [
    !isProd && 'http://localhost:3010',
    'https://surfing4.fun',
  ].filter(Boolean) as string[];

  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Set-Cookie'],
    },
    rawBody: true,
  });

  // Cookie parsing & validation
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(validatorOptions));

  // Swagger (only non-production)
  if (!isProd) {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('API example')
      .setDescription('This is an API example')
      .setVersion('1.0')
      .build();

    const document: OpenAPIObject = SwaggerModule.createDocument(app, config, {
      extraModels: [ErrorResponseDto],
    });

    // Standard error responses with examples
    const defaultErrorResponses = {
      400: {
        description: 'Bad Request – invalid parameters',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            examples: {
              BadRequest: {
                summary: 'Validation errors',
                value: {
                  type: 'https://httpstatuses.com/400',
                  title: 'BadRequest',
                  status: 400,
                  detail: 'One or more parameters failed validation',
                  instance: '/recent-times?page=0&pageSize=101',
                  errors: [
                    {
                      field: 'pageSize',
                      message: 'must not be greater than 100',
                    },
                    { field: 'page', message: 'must be an integer' },
                  ],
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized – authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            examples: {
              Unauthorized: {
                summary: 'Missing or invalid token',
                value: {
                  type: 'https://httpstatuses.com/401',
                  title: 'Unauthorized',
                  status: 401,
                  detail: 'Authentication credentials were missing or invalid',
                  instance: '/recent-times',
                },
              },
            },
          },
        },
      },
      403: {
        description: 'Forbidden – insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            examples: {
              Forbidden: {
                summary: 'Access denied',
                value: {
                  type: 'https://httpstatuses.com/403',
                  title: 'Forbidden',
                  status: 403,
                  detail: 'You do not have permission to access this resource',
                  instance: '/admin/dashboard',
                },
              },
            },
          },
        },
      },
      404: {
        description: 'Not Found – resource does not exist',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            examples: {
              NotFound: {
                summary: 'Missing resource',
                value: {
                  type: 'https://httpstatuses.com/404',
                  title: 'NotFound',
                  status: 404,
                  detail: 'The requested resource was not found',
                  instance: '/recent-times/unknown-map',
                },
              },
            },
          },
        },
      },
      409: {
        description: 'Conflict – resource conflict',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            examples: {
              Conflict: {
                summary: 'Duplicate entry',
                value: {
                  type: 'https://httpstatuses.com/409',
                  title: 'Conflict',
                  status: 409,
                  detail: 'A record with these identifiers already exists',
                  instance: '/users',
                },
              },
            },
          },
        },
      },
      422: {
        description: 'Unprocessable Entity – validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            examples: {
              Unprocessable: {
                summary: 'Semantic validation error',
                value: {
                  type: 'https://httpstatuses.com/422',
                  title: 'UnprocessableEntity',
                  status: 422,
                  detail:
                    'The JSON data is syntactically correct but semantically invalid',
                  instance: '/orders',
                },
              },
            },
          },
        },
      },
      429: {
        description: 'Too Many Requests – rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            examples: {
              TooManyRequests: {
                summary: 'Rate limit reached',
                value: {
                  type: 'https://httpstatuses.com/429',
                  title: 'TooManyRequests',
                  status: 429,
                  detail: 'Rate limit exceeded, retry after some time',
                  instance: '/recent-times',
                },
              },
            },
          },
        },
      },
      500: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            examples: {
              ServerError: {
                summary: 'Unexpected server failure',
                value: {
                  type: 'https://httpstatuses.com/500',
                  title: 'InternalServerError',
                  status: 500,
                  detail: 'An unexpected error occurred',
                  instance: '/recent-times',
                },
              },
            },
          },
        },
      },
    };

    // Inject into every operation's responses
    for (const pathItem of Object.values(document.paths)) {
      for (const op of Object.values(pathItem)) {
        op.responses = {
          ...defaultErrorResponses,
          ...op.responses,
        };
      }
    }

    SwaggerModule.setup('docs', app, document);
  }

  // Session support
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new WrapResponseInterceptor(),
    new ResponseTimeInterceptor(),
    new PaginationHeadersInterceptor(),
    new CacheVersioningInterceptor(),
  );

  // Global filters
  app.useGlobalFilters(new HttpErrorFilter());

  await app.listen(process.env.API_PORT);
}

bootstrap();
