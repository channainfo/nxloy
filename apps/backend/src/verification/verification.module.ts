import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

/**
 * Verification Module
 * Handles PIN-based verification for various use cases
 *
 * Features:
 * - 6-digit PIN generation and validation
 * - SHA-256 hashed storage with salt
 * - Email and SMS delivery (SMS pending)
 * - Token-based email link fallback
 * - Rate limiting (max 5 attempts)
 * - Time-based expiry
 * - Single-use enforcement
 *
 * Use Cases:
 * - Email verification during signup
 * - Phone number verification
 * - Password reset verification
 * - Account linking verification
 * - Two-factor authentication
 * - Phone number change verification
 */
@Module({
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
