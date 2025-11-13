# Authentication Module - Testing Guide

## Testing Philosophy

**No Mocks Policy** (from CLAUDE.md):
- Tests use real database connections (test database)
- Factories create actual records
- Faker generates realistic test data
- Real dependencies tested (not mocked)

**Why?**
- Catches real integration issues
- Validates actual database constraints
- Tests business logic against real data
- No false positives from outdated mocks

---

## Test Structure

```
apps/backend/src/
├── auth/
│   ├── __tests__/
│   │   ├── auth.service.spec.ts      # Unit tests
│   │   ├── auth.controller.spec.ts   # Integration tests
│   │   └── auth.e2e.spec.ts          # E2E tests
│   ├── auth.service.ts
│   └── auth.controller.ts
├── mfa/
│   └── __tests__/
└── test/
    ├── factories/               # Data factories
    │   ├── user.factory.ts
    │   ├── session.factory.ts
    │   └── verification.factory.ts
    ├── helpers/                 # Test utilities
    │   ├── database.helper.ts   # DB setup/cleanup
    │   └── auth.helper.ts       # Auth helpers
    └── setup.ts                 # Global test setup
```

---

## Test Database Setup

### 1. Create Test Database

```sql
CREATE DATABASE nxloy_test;
```

### 2. Configure Test Environment

`.env.test`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nxloy_test"
REDIS_HOST="localhost"
REDIS_PORT="6379"
JWT_SECRET="test-secret-key-min-32-chars-long"
JWT_REFRESH_SECRET="test-refresh-secret-key-min-32"
```

### 3. Run Migrations

```bash
cd packages/database
DATABASE_URL="postgresql://user:password@localhost:5432/nxloy_test" \
  pnpm prisma migrate deploy
```

---

## Factory Pattern (No Mocks!)

### User Factory Example

```typescript
// test/factories/user.factory.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class UserFactory {
  /**
   * Create user with realistic fake data
   */
  static async create(overrides: Partial<User> = {}) {
    const passwordHash = await bcrypt.hash('TestPassword123!', 10);

    const user = await prisma.user.create({
      data: {
        email: overrides.email || faker.internet.email(),
        firstName: overrides.firstName || faker.person.firstName(),
        lastName: overrides.lastName || faker.person.lastName(),
        phone: overrides.phone || faker.phone.number(),
        passwordHash,
        locale: 'EN',
        timezone: 'UTC',
        ...overrides,
      },
    });

    return user;
  }

  /**
   * Create multiple users
   */
  static async createMany(count: number) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create());
    }
    return users;
  }

  /**
   * Create user with verified email
   */
  static async createVerified(overrides = {}) {
    return this.create({
      emailVerified: new Date(),
      ...overrides,
    });
  }

  /**
   * Create user with MFA enabled
   */
  static async createWithMFA(overrides = {}) {
    return this.create({
      mfaEnabled: true,
      mfaSecret: 'JBSWY3DPEHPK3PXP',
      ...overrides,
    });
  }
}
```

### Session Factory Example

```typescript
// test/factories/session.factory.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export class SessionFactory {
  static async create(userId: string, overrides = {}) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return prisma.session.create({
      data: {
        userId,
        ipAddress: faker.internet.ipv4(),
        userAgent: faker.internet.userAgent(),
        expiresAt,
        ...overrides,
      },
    });
  }
}
```

---

## Test Examples

### Unit Test Example (Service)

```typescript
// auth/__tests__/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { VerificationService } from '../../verification/verification.service';
import { SecurityService } from '../../security/security.service';
import { UserFactory } from '../../../test/factories/user.factory';
import { DatabaseHelper } from '../../../test/helpers/database.helper';

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        VerificationService,
        SecurityService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  beforeEach(async () => {
    // Clean database before each test
    await DatabaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await module.close();
    await DatabaseHelper.disconnect();
  });

  describe('signup', () => {
    it('should create user with hashed password', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await service.signup(signupDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(signupDto.email);
      expect(result.passwordHash).toBeUndefined(); // Should be excluded
      expect(result.id).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      // Create existing user
      await UserFactory.create({ email: 'test@example.com' });

      const signupDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      await expect(service.signup(signupDto)).rejects.toThrow(
        'Email already registered',
      );
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      // Create user with known password
      const user = await UserFactory.create({
        email: 'test@example.com',
      });

      const loginDto = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      };

      const result = await service.login(loginDto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe(user.id);
    });

    it('should reject invalid password', async () => {
      await UserFactory.create({ email: 'test@example.com' });

      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      const user = await UserFactory.create({ email: 'test@example.com' });

      const wrongLoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      // Attempt 5 failed logins
      for (let i = 0; i < 5; i++) {
        try {
          await service.login(wrongLoginDto);
        } catch (e) {
          // Expected to fail
        }
      }

      // 6th attempt should be locked
      await expect(service.login(wrongLoginDto)).rejects.toThrow(
        /Account locked until/,
      );
    });
  });
});
```

### Integration Test Example (Controller)

```typescript
// auth/__tests__/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app/app.module';
import { UserFactory } from '../../../test/factories/user.factory';
import { DatabaseHelper } from '../../../test/helpers/database.helper';

describe('AuthController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  beforeEach(async () => {
    await DatabaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
    await DatabaseHelper.disconnect();
  });

  describe('POST /auth/signup', () => {
    it('should create new user', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          firstName: 'New',
          lastName: 'User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe('newuser@example.com');
          expect(res.body.passwordHash).toBeUndefined();
        });
    });

    it('should validate password strength', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'weak',  // Too weak
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return JWT tokens', async () => {
      // Create user
      await UserFactory.create({ email: 'test@example.com' });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
          expect(res.body.user).toBeDefined();
        });
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user', async () => {
      const user = await UserFactory.create();
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'TestPassword123!',
        });

      const token = loginRes.body.accessToken;

      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.userId).toBe(user.id);
          expect(res.body.email).toBe(user.email);
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });
});
```

### E2E Test Example (Full Flow)

```typescript
// auth/__tests__/auth.e2e.spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app/app.module';
import { DatabaseHelper } from '../../../test/helpers/database.helper';

describe('Auth Flow (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await DatabaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('complete auth flow: signup -> verify -> login -> refresh -> logout', async () => {
    const email = 'e2etest@example.com';
    const password = 'E2ETest123!';

    // 1. Signup
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email,
        password,
        firstName: 'E2E',
        lastName: 'Test',
      })
      .expect(201);

    const userId = signupRes.body.id;

    // 2. Login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const { accessToken, refreshToken } = loginRes.body;
    expect(accessToken).toBeDefined();

    // 3. Access protected endpoint
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.userId).toBe(userId);
      });

    // 4. Refresh token
    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    const newAccessToken = refreshRes.body.accessToken;
    expect(newAccessToken).toBeDefined();
    expect(newAccessToken).not.toBe(accessToken); // New token

    // 5. Logout
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${newAccessToken}`)
      .expect(204);

    // 6. Old token should not work after logout
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${newAccessToken}`)
      .expect(401);
  });
});
```

---

## Database Helper

```typescript
// test/helpers/database.helper.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DatabaseHelper {
  /**
   * Clean all test data
   */
  static async cleanDatabase() {
    // Delete in correct order (respect foreign keys)
    await prisma.auditLog.deleteMany();
    await prisma.backupCode.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
  }

  /**
   * Disconnect Prisma
   */
  static async disconnect() {
    await prisma.$disconnect();
  }

  /**
   * Reset database (drop all data and re-run migrations)
   */
  static async resetDatabase() {
    // Use with caution! Only in test environment
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('resetDatabase can only be used in test environment');
    }

    await prisma.$executeRawUnsafe('DROP SCHEMA public CASCADE');
    await prisma.$executeRawUnsafe('CREATE SCHEMA public');
    // Then run migrations
  }
}
```

---

## Running Tests

### Run All Tests
```bash
pnpm test
```

### Run Specific Test File
```bash
pnpm test auth.service.spec.ts
```

### Run with Coverage
```bash
pnpm test:cov
```

### Watch Mode
```bash
pnpm test:watch
```

### E2E Tests Only
```bash
pnpm test:e2e
```

---

## Coverage Goals

- **Minimum:** 80% overall coverage
- **Business Logic:** 100% coverage
- **Services:** 90%+ coverage
- **Controllers:** 85%+ coverage
- **Guards/Decorators:** 90%+ coverage

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: nxloy_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        run: cd packages/database && pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/nxloy_test

      - name: Run tests
        run: pnpm test:cov
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/nxloy_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Best Practices

1. **Isolation:** Each test creates its own data and cleans up
2. **Realistic Data:** Use Faker for realistic test data
3. **No Mocks:** Test against real dependencies
4. **Fast Tests:** Clean database between tests, not before/after all
5. **Clear Names:** Test names describe what they verify
6. **Arrange-Act-Assert:** Follow AAA pattern
7. **Single Assertion:** Each test verifies one thing
8. **Edge Cases:** Test error conditions, not just happy path

---

## Testing Checklist

- [ ] Unit tests for all services (90%+ coverage)
- [ ] Integration tests for all controllers
- [ ] E2E tests for critical flows
- [ ] Test error handling
- [ ] Test validation rules
- [ ] Test authorization (guards)
- [ ] Test rate limiting
- [ ] Test account lockout
- [ ] Test MFA flows
- [ ] Test OAuth flows
- [ ] Test password reset flow
- [ ] Test session management
- [ ] CI/CD pipeline configured
- [ ] Coverage reports generated

**Testing foundation ready for implementation!** 🧪
