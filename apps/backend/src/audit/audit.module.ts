import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';

/**
 * Audit Module
 * Centralized audit logging
 *
 * Features:
 * - Immutable audit logs
 * - User action tracking
 * - Security event logging
 * - Compliance reporting
 */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
