import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';

import { AppModule } from './modules/app/app.module';
import { validatorOptions } from './configs/validator-options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    cors: {
      credentials: true,
      origin: ['http://localhost:3010', 'https://surfing4.fun'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    rawBody: true,
  });

  // Middlewares
  app.useGlobalPipes(new ValidationPipe(validatorOptions));

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('API example')
    .setDescription('This is an API example')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

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
