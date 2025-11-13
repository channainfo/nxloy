import { PrismaClient, Account, AccountType, Provider } from '@nxloy/database';
import { faker } from '@faker-js/faker';

/**
 * Account Factory
 * Creates realistic test OAuth/credential accounts with actual database records
 * No mocks - all data is persisted to test database
 */
export class AccountFactory {
  constructor(private prisma: PrismaClient) {}

  async create(
    userId: string,
    overrides: Partial<Account> = {},
  ): Promise<Account> {
    const provider = overrides.provider || Provider.GOOGLE;

    const account = await this.prisma.account.create({
      data: {
        userId,
        type: overrides.type || AccountType.OAUTH,
        provider,
        providerAccountId: overrides.providerAccountId || faker.string.uuid(),
        access_token: overrides.access_token || faker.string.alphanumeric(40),
        refresh_token: overrides.refresh_token || faker.string.alphanumeric(40),
        expires_at: overrides.expires_at,
        token_type: overrides.token_type || 'Bearer',
        scope: overrides.scope || 'email profile',
        id_token: overrides.id_token,
        session_state: overrides.session_state,
        firstName: overrides.firstName || faker.person.firstName(),
        lastName: overrides.lastName || faker.person.lastName(),
      },
    });

    return account;
  }

  async createGoogle(userId: string, overrides: Partial<Account> = {}): Promise<Account> {
    return this.create(userId, {
      ...overrides,
      provider: Provider.GOOGLE,
      scope: 'email profile',
    });
  }

  async createFacebook(userId: string, overrides: Partial<Account> = {}): Promise<Account> {
    return this.create(userId, {
      ...overrides,
      provider: Provider.FACEBOOK,
      scope: 'email public_profile',
    });
  }

  async createApple(userId: string, overrides: Partial<Account> = {}): Promise<Account> {
    return this.create(userId, {
      ...overrides,
      provider: Provider.APPLE,
      scope: 'name email',
    });
  }

  async createCredential(userId: string, overrides: Partial<Account> = {}): Promise<Account> {
    return this.create(userId, {
      ...overrides,
      type: AccountType.CREDENTIALS,
      provider: Provider.CREDENTIALS,
      access_token: null,
      refresh_token: null,
    });
  }
}
