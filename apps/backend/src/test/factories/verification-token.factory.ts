import {
  PrismaClient,
  VerificationToken,
  VerificationType,
} from '@nxloy/database';
import { faker } from '@faker-js/faker';
import * as crypto from 'crypto';

/**
 * VerificationToken Factory
 * Creates realistic verification tokens for testing PIN flows
 */
export class VerificationTokenFactory {
  constructor(private prisma: PrismaClient) {}

  async create(
    overrides: Partial<VerificationToken> = {}
  ): Promise<VerificationToken> {
    const pin = this.generatePin();
    const { pinHash, pinSalt } = this.hashPin(pin);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const token = await this.prisma.verificationToken.create({
      data: {
        identifier: overrides.identifier || faker.internet.email(),
        type: overrides.type || VerificationType.EMAIL_VERIFICATION,
        pinHash: overrides.pinHash || pinHash,
        pinSalt: overrides.pinSalt || pinSalt,
        token: overrides.token || faker.string.uuid(),
        expiresAt: overrides.expiresAt || expiresAt,
        attempts: overrides.attempts || 0,
        usedAt: overrides.usedAt,
        userId: overrides.userId,
      },
    });

    return { ...token, plainPin: pin };
  }

  async createExpired(
    overrides: Partial<VerificationToken> = {}
  ): Promise<VerificationToken> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() - 5);

    return this.create({
      ...overrides,
      expiresAt,
    });
  }

  async createUsed(
    overrides: Partial<VerificationToken> = {}
  ): Promise<VerificationToken> {
    return this.create({
      ...overrides,
      usedAt: new Date(),
    });
  }

  private generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private hashPin(pin: string): { pinHash: string; pinSalt: string } {
    const pinSalt = crypto.randomBytes(16).toString('hex');
    const pinHash = crypto
      .createHash('sha256')
      .update(pin + pinSalt)
      .digest('hex');
    return { pinHash, pinSalt };
  }
}
