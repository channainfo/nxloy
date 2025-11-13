/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { requireEnv } from './common/utils/env.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Helmet (HTTP headers)
  app.use(helmet());

  // Security: CORS - Must specify FRONTEND_URL (no fallback per CLAUDE.md)
  const frontendUrl = requireEnv('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // Cookie parser (for CSRF tokens)
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = requireEnv('PORT');

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
