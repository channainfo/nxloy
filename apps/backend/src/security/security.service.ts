import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { PrismaClient, AuditAction } from '@prisma/client';
import {
  SecurityEventType,
  LockoutStatus,
} from './interfaces/security.interface';
import { requireEnvInt } from '../common/utils/env.util';

/**
 * Security Service
 * Handles security features:
 * - Account lockout after failed login attempts
 * - Security event tracking
 * - Suspicious activity detection
 *
 * Configuration (from env):
 * - ACCOUNT_LOCKOUT_THRESHOLD - Failed attempts before lockout (default: 5)
 * - ACCOUNT_LOCKOUT_DURATION - Lockout duration in minutes (default: 30)
 *
 * Standards (CLAUDE.md):
 * - Max 40 lines per method
 * - Max 3 parameters
 */
@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly lockoutThreshold: number;
  private readonly lockoutDuration: number;
  private readonly prisma: PrismaClient;

  constructor(@Optional() @Inject(PrismaClient) prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
    this.lockoutThreshold = requireEnvInt('ACCOUNT_LOCKOUT_THRESHOLD');
    this.lockoutDuration = requireEnvInt('ACCOUNT_LOCKOUT_DURATION');
  }

  /**
   * Record login attempt
   * Increments failed attempts and locks account if threshold reached
   *
   * @param email User email
   * @param success Whether login succeeded
   * @param ipAddress IP address of attempt
   */
  async recordLoginAttempt(
    email: string,
    success: boolean,
    ipAddress?: string,
  ): Promise<void> {
    const user = await this.findUserByEmail(email);

    if (!user) {
      return; // Don't reveal if email exists
    }

    if (success) {
      await this.handleSuccessfulLogin(user.id);
    } else {
      await this.handleFailedLogin(user.id, ipAddress);
    }

    await this.logSecurityEvent(
      user.id,
      success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE,
      ipAddress,
    );
  }

  /**
   * Check if account is locked
   *
   * @param email User email
   * @returns Lockout status
   */
  async checkLockoutStatus(email: string): Promise<LockoutStatus> {
    const user = await this.findUserByEmail(email);

    if (!user) {
      return {
        isLocked: false,
        failedAttempts: 0,
        remainingAttempts: this.lockoutThreshold,
      };
    }

    const isLocked = await this.isAccountLocked(user);

    return {
      isLocked,
      lockedUntil: user.lockedUntil || undefined,
      failedAttempts: user.failedLoginAttempts,
      remainingAttempts: Math.max(
        0,
        this.lockoutThreshold - user.failedLoginAttempts,
      ),
    };
  }

  /**
   * Manually unlock account
   * Used by admins or after verification
   *
   * @param userId User ID
   */
  async unlockAccount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.logSecurityEvent(userId, SecurityEventType.ACCOUNT_UNLOCKED);

    this.logger.log(`Account unlocked: ${userId}`);
  }

  /**
   * Log security event
   *
   * @param userId User ID
   * @param eventType Event type
   * @param ipAddress Optional IP address
   */
  async logSecurityEvent(
    userId: string,
    eventType: SecurityEventType,
    ipAddress?: string,
  ): Promise<void> {
    const action = this.mapEventTypeToAction(eventType);

    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        resource: 'User',
        resourceId: userId,
        ipAddress,
        metadata: { eventType },
      },
    });
  }

  /**
   * Map SecurityEventType to AuditAction
   */
  private mapEventTypeToAction(eventType: SecurityEventType): AuditAction {
    const mapping: Record<SecurityEventType, AuditAction> = {
      [SecurityEventType.LOGIN_ATTEMPT]: AuditAction.LOGIN,
      [SecurityEventType.LOGIN_SUCCESS]: AuditAction.LOGIN,
      [SecurityEventType.LOGIN_FAILURE]: AuditAction.LOGIN,
      [SecurityEventType.PASSWORD_RESET]: AuditAction.UPDATE,
      [SecurityEventType.ACCOUNT_LOCKED]: AuditAction.UPDATE,
      [SecurityEventType.ACCOUNT_UNLOCKED]: AuditAction.UPDATE,
      [SecurityEventType.SUSPICIOUS_ACTIVITY]: AuditAction.READ,
    };

    return mapping[eventType] || AuditAction.UPDATE;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Find user by email
   */
  private async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });
  }

  /**
   * Handle successful login
   * Resets failed attempts counter
   */
  private async handleSuccessfulLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  /**
   * Handle failed login
   * Increments counter and locks account if threshold reached
   */
  private async handleFailedLogin(userId: string, ipAddress?: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return;
    }

    const newAttempts = user.failedLoginAttempts + 1;

    if (newAttempts >= this.lockoutThreshold) {
      await this.lockAccount(userId);
    } else {
      await this.incrementFailedAttempts(userId, newAttempts);
    }
  }

  /**
   * Lock account
   */
  private async lockAccount(userId: string): Promise<void> {
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + this.lockoutDuration);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: this.lockoutThreshold,
        lockedUntil,
      },
    });

    await this.logSecurityEvent(userId, SecurityEventType.ACCOUNT_LOCKED);

    this.logger.warn(
      `Account locked until ${lockedUntil.toISOString()}: ${userId}`,
    );
  }

  /**
   * Increment failed login attempts
   */
  private async incrementFailedAttempts(
    userId: string,
    attempts: number,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: attempts },
    });
  }

  /**
   * Check if account is currently locked
   */
  private async isAccountLocked(user: any): Promise<boolean> {
    if (!user.lockedUntil) {
      return false;
    }

    const now = new Date();

    if (now < user.lockedUntil) {
      return true; // Still locked
    }

    // Lock expired, auto-unlock
    await this.unlockAccount(user.id);
    return false;
  }
}
