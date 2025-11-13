import { PrismaClient, User, Status, Language } from '@nxloy/database';
import { faker } from '@faker-js/faker';
import { PasswordUtil } from '../../auth/utils/password.util';

/**
 * User Factory
 * Creates realistic test users with actual database records
 * No mocks - all data is persisted to test database
 */
export class UserFactory {
  constructor(private prisma: PrismaClient) {}

  async create(overrides: Partial<User> = {}): Promise<User> {
    const passwordHash = overrides.passwordHash
      ? overrides.passwordHash
      : await this.hashPassword('TestPassword123!');

    const user = await this.prisma.user.create({
      data: {
        email: (overrides.email || faker.internet.email()).toLowerCase(),
        passwordHash,
        firstName: overrides.firstName || faker.person.firstName(),
        lastName: overrides.lastName || faker.person.lastName(),
        phone: overrides.phone || faker.phone.number('+1##########'),
        avatarUrl: overrides.avatarUrl || faker.image.avatar(),
        locale: overrides.locale || Language.EN,
        timezone: overrides.timezone || 'America/New_York',
        status: overrides.status || Status.ACTIVE,
        emailVerified: overrides.emailVerified,
        phoneVerified: overrides.phoneVerified,
        mfaEnabled: overrides.mfaEnabled || false,
        mfaSecret: overrides.mfaSecret,
        failedLoginAttempts: overrides.failedLoginAttempts || 0,
        lockedUntil: overrides.lockedUntil,
        lastLoginAt: overrides.lastLoginAt,
      },
    });

    return user;
  }

  async createVerified(overrides: Partial<User> = {}): Promise<User> {
    return this.create({
      ...overrides,
      emailVerified: new Date(),
    });
  }

  async createWithMfa(overrides: Partial<User> = {}): Promise<User> {
    return this.create({
      ...overrides,
      mfaEnabled: true,
      mfaSecret: faker.string.alphanumeric(32),
    });
  }

  async createLocked(overrides: Partial<User> = {}): Promise<User> {
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + 30);

    return this.create({
      ...overrides,
      failedLoginAttempts: 5,
      lockedUntil,
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return PasswordUtil.hash(password);
  }
}
