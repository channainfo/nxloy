import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/oauth/google.strategy';
import { AppleStrategy } from './strategies/oauth/apple.strategy';
import { FacebookStrategy } from './strategies/oauth/facebook.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VerificationModule } from '../verification/verification.module';
import { requireEnv } from '../common/utils/env.util';

/**
 * Auth Module
 * Handles authentication and authorization
 *
 * Provides:
 * - Email/Password authentication
 * - JWT token generation and validation
 * - Refresh token rotation
 * - User session management
 * - Email verification via PIN
 *
 * Future phases will add:
 * - OAuth (Google, Apple, Facebook)
 * - 2FA/MFA
 * - Password reset
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: requireEnv('JWT_SECRET'),
      signOptions: {
        expiresIn: requireEnv('JWT_EXPIRES_IN'),
      },
    }),
    VerificationModule,
  ],
  controllers: [AuthController],
  providers: [
    PrismaClient,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    AppleStrategy,
    FacebookStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
