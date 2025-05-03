import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import { validatorOptions } from './configs/validator-options';
import { AppModule } from './modules/app/app.module';

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

  // Cookie parsing & global validation
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(validatorOptions));

  // Only enable Swagger in non-production environments
  if (!isProd) {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('API example')
      .setDescription('This is an API example')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
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

  await app.listen(process.env.API_PORT);
}

bootstrap();
