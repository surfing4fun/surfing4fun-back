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
  ].filter((o): o is string => Boolean(o));

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

  // Cookies & Validation
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(validatorOptions));

  // Swagger (non-prod only)
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

    // Default error responses for every operation
    const defaultErrorResponses = {
      400: {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
          },
        },
      },
      401: {
        description: 'Unauthorized – authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
          },
        },
      },
      403: {
        description: 'Forbidden – insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
          },
        },
      },
      404: {
        description: 'Not Found – resource does not exist',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
          },
        },
      },
      409: {
        description: 'Conflict – resource conflict',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
          },
        },
      },
      422: {
        description: 'Unprocessable Entity – validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
          },
        },
      },
      429: {
        description: 'Too Many Requests – rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
          },
        },
      },
      500: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
          },
        },
      },
    };

    // Inject into all paths & methods
    Object.values(document.paths).forEach((pathItem) => {
      Object.values(pathItem).forEach((operation: any) => {
        operation.responses = {
          ...defaultErrorResponses,
          ...operation.responses,
        };
      });
    });

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

  // Global exception filter
  app.useGlobalFilters(new HttpErrorFilter());

  await app.listen(process.env.API_PORT);
}

bootstrap();
