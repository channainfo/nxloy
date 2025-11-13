/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { requireEnv } from './common/utils/env.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // HTTP Request Logger - Log all incoming requests
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    Logger.log(`[${timestamp}] ${req.method} ${req.url}`, 'HTTP');
    next();
  });

  // Security: Conditional Helmet (HTTP headers)
  // Relaxed CSP for Swagger UI, strict for everything else
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/docs')) {
      // Swagger UI needs inline scripts and styles
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
      })(req, res, next);
    } else {
      // Strict CSP for all other routes
      helmet()(req, res, next);
    }
  });

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

  // Set global prefix FIRST
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Swagger/OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('NxLoy Loyalty Platform API')
    .setDescription(
      'Multi-tenant loyalty platform with industry templates, flexible reward mechanisms, and AI-powered recommendations.'
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /auth/login or /auth/signup',
      },
      'JWT-auth'
    )
    .addServer(`http://localhost:${requireEnv('PORT')}/${globalPrefix}`, 'Local development')
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('User', 'User profile and session management')
    .addTag('MFA', 'Multi-Factor Authentication (TOTP, backup codes)')
    .addTag('Verification', 'Email and SMS verification with PIN codes')
    .addTag('RBAC', 'Role-Based Access Control')
    .addTag('Audit', 'Audit logs and security events')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = requireEnv('PORT');

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 Swagger UI is available at: http://localhost:${port}/${globalPrefix}/docs`);
}

bootstrap();
