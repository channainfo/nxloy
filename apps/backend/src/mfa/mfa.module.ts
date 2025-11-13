import { Module } from '@nestjs/common';
import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';

/**
 * MFA Module
 * Handles Multi-Factor Authentication
 *
 * Features:
 * - TOTP (Time-based One-Time Password) via authenticator apps
 * - Backup codes (10 one-time use emergency codes)
 * - Email codes (integrates with verification service)
 * - SMS codes (planned for future)
 *
 * Security:
 * - TOTP secrets stored encrypted
 * - Backup codes hashed with SHA-256
 * - Single-use enforcement for backup codes
 * - 60-second tolerance window for TOTP
 */
@Module({
  controllers: [MfaController],
  providers: [MfaService],
  exports: [MfaService],
})
export class MfaModule {}
