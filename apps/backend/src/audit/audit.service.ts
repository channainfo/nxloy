import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { PrismaClient, AuditAction } from '@prisma/client';

/**
 * Audit Service
 * Centralized audit logging for compliance and security
 *
 * Logs:
 * - User actions (create, update, delete)
 * - Authentication events (login, logout, password change)
 * - Permission changes (role assignment)
 * - Data access (sensitive data views)
 * - Security events (lockout, MFA)
 *
 * Audit logs are immutable (no updates/deletes)
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly prisma: PrismaClient;

  constructor(@Optional() @Inject(PrismaClient) prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Log audit event
   *
   * @param userId User ID performing action
   * @param action Action performed
   * @param resource Resource/table name
   * @param metadata Additional context
   * @param ipAddress IP address
   */
  async log(
    userId: string,
    action: string,
    resource: string,
    metadata: Record<string, any> = {},
    ipAddress?: string,
  ): Promise<void> {
    const auditAction = this.mapActionToEnum(action);

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: auditAction,
        resource,
        resourceId: metadata.resourceId || null,
        metadata: { ...metadata, originalAction: action },
        ipAddress,
      },
    });

    this.logger.log(`Audit: ${action} on ${resource} by user ${userId}`);
  }

  /**
   * Map action string to AuditAction enum
   */
  private mapActionToEnum(action: string): AuditAction {
    const actionUpper = action.toUpperCase();

    if (actionUpper.includes('CREATE')) return AuditAction.CREATE;
    if (actionUpper.includes('UPDATE') || actionUpper.includes('PROFILE')) return AuditAction.UPDATE;
    if (actionUpper.includes('DELETE') || actionUpper.includes('REVOKE')) return AuditAction.DELETE;
    if (actionUpper.includes('LOGIN')) return AuditAction.LOGIN;
    if (actionUpper.includes('LOGOUT')) return AuditAction.LOGOUT;
    if (actionUpper.includes('GRANT') || actionUpper.includes('PERMISSION')) return AuditAction.GRANT_PERMISSION;
    if (actionUpper.includes('EXPORT')) return AuditAction.EXPORT_DATA;
    if (actionUpper.includes('IMPORT')) return AuditAction.IMPORT_DATA;

    return AuditAction.UPDATE; // Default
  }

  /**
   * Get audit logs for user
   */
  async getUserLogs(userId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get recent audit logs (admin only)
   */
  async getRecentLogs(limit = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
