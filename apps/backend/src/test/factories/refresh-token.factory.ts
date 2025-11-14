import { PrismaClient, RefreshToken } from '@nxloy/database';
import { faker } from '@faker-js/faker';
import { randomBytes } from 'crypto';

/**
 * RefreshToken Factory
 * Creates realistic test refresh tokens with actual database records
 * No mocks - all data is persisted to test database
 */
export class RefreshTokenFactory {
  constructor(private prisma: PrismaClient) {}

  async create(
    userId: string,
    overrides: Partial<RefreshToken> = {},
  ): Promise<RefreshToken> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days default

    const token = await this.prisma.refreshToken.create({
      data: {
        userId,
        token: overrides.token || this.generateToken(),
        expiresAt: overrides.expiresAt || expiresAt,
        familyId: overrides.familyId || faker.string.uuid(),
        revoked: overrides.revoked || false,
        revokedAt: overrides.revokedAt,
        sessionId: overrides.sessionId,
      },
    });

    return token;
  }

  async createExpired(userId: string, overrides: Partial<RefreshToken> = {}): Promise<RefreshToken> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() - 1); // Yesterday

    return this.create(userId, {
      ...overrides,
      expiresAt,
    });
  }

  async createRevoked(userId: string, overrides: Partial<RefreshToken> = {}): Promise<RefreshToken> {
    return this.create(userId, {
      ...overrides,
      revoked: true,
      revokedAt: new Date(),
    });
  }

  async createFamily(
    userId: string,
    count: number = 3,
  ): Promise<RefreshToken[]> {
    const familyId = faker.string.uuid();
    const tokens: RefreshToken[] = [];

    for (let i = 0; i < count; i++) {
      const token = await this.create(userId, {
        familyId,
      });
      tokens.push(token);
    }

    return tokens;
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }
}
