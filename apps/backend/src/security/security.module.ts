import { Module, Global } from '@nestjs/common';
import { SecurityService } from './security.service';

/**
 * Security Module
 * Provides security features across the application
 *
 * Features:
 * - Account lockout after failed login attempts
 * - Security event tracking
 * - Suspicious activity detection
 *
 * Configuration:
 * - ACCOUNT_LOCKOUT_THRESHOLD (default: 5 attempts)
 * - ACCOUNT_LOCKOUT_DURATION (default: 30 minutes)
 */
@Global()
@Module({
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
