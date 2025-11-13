import { PrismaClient, Session } from '@nxloy/database';
import { faker } from '@faker-js/faker';

/**
 * Session Factory
 * Creates realistic test sessions with actual database records
 */
export class SessionFactory {
  constructor(private prisma: PrismaClient) {}

  async create(
    userId: string,
    overrides: Partial<Session> = {}
  ): Promise<Session> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = await this.prisma.session.create({
      data: {
        userId,
        ipAddress: overrides.ipAddress || faker.internet.ip(),
        userAgent: overrides.userAgent || faker.internet.userAgent(),
        expiresAt: overrides.expiresAt || expiresAt,
        revokedAt: overrides.revokedAt,
      },
    });

    return session;
  }

  async createExpired(
    userId: string,
    overrides: Partial<Session> = {}
  ): Promise<Session> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() - 1);

    return this.create(userId, {
      ...overrides,
      expiresAt,
    });
  }

  async createRevoked(
    userId: string,
    overrides: Partial<Session> = {}
  ): Promise<Session> {
    return this.create(userId, {
      ...overrides,
      revokedAt: new Date(),
    });
  }
}
