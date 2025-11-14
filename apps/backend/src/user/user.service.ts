import { Injectable, BadRequestException, Inject, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuditService } from '../audit/audit.service';

/**
 * User Service
 * Handles user profile and session management
 */
@Injectable()
export class UserService {
  private readonly prisma: PrismaClient;

  constructor(
    private readonly auditService: AuditService,
    @Optional() @Inject(PrismaClient) prisma?: PrismaClient,
  ) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        phone: true,
        phoneVerified: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        locale: true,
        timezone: true,
        status: true,
        mfaEnabled: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    await this.auditService.log(userId, 'PROFILE_UPDATED', 'User', { resourceId: userId, ...dto });

    return this.excludePassword(user);
  }

  /**
   * Get active sessions
   */
  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Revoke session
   */
  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.session.update({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });

    await this.auditService.log(userId, 'SESSION_REVOKED', 'Session', { resourceId: sessionId });

    return { success: true };
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(userId: string, currentSessionId?: string) {
    await this.prisma.session.updateMany({
      where: {
        userId,
        id: { not: currentSessionId },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    await this.auditService.log(userId, 'ALL_SESSIONS_REVOKED', 'Session', {});

    return { success: true };
  }

  /**
   * Exclude password from user object
   */
  private excludePassword(user: any) {
    const { passwordHash, ...result } = user;
    return result;
  }
}
