# Testing Guide

**Version**: 1.0
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

Comprehensive testing strategy for NxLoy platform covering unit, integration, E2E, and performance testing.

## Testing Stack

- **Unit Testing**: Jest
- **Integration Testing**: Jest + Supertest
- **E2E Testing**: Playwright (web), Detox (mobile)
- **Load Testing**: k6
- **API Testing**: Postman/Newman

## Test Coverage Requirements

| Layer | Minimum Coverage | Target |
|-------|------------------|--------|
| Business Logic | 100% | 100% |
| Domain Services | 90% | 95% |
| Controllers | 80% | 85% |
| Overall | 80% | 85% |

## Unit Testing

### Testing Aggregates

```typescript
// customer-enrollment.aggregate.spec.ts
describe('CustomerEnrollmentAggregate', () => {
  let enrollment: CustomerEnrollmentAggregate;

  beforeEach(() => {
    enrollment = CustomerEnrollmentAggregate.create(
      'cust-123',
      'prog-456'
    );
  });

  describe('earnPoints', () => {
    it('should earn points on active enrollment', () => {
      enrollment.earnPoints(50, 'PURCHASE', 'order-789', 'Purchase points');

      expect(enrollment.getBalance().totalPoints).toBe(50);
      expect(enrollment.getDomainEvents()).toHaveLength(1);
      expect(enrollment.getDomainEvents()[0].eventType).toBe('loyalty.points.earned');
    });

    it('should throw error on paused enrollment', () => {
      enrollment.pauseEnrollment();

      expect(() => {
        enrollment.earnPoints(50, 'PURCHASE', 'order-789', 'Purchase points');
      }).toThrow('Can only earn points on active enrollments');
    });

    it('should throw error for negative points', () => {
      expect(() => {
        enrollment.earnPoints(-10, 'PURCHASE', 'order-789', 'Invalid');
      }).toThrow('Points must be positive');
    });
  });
});
```

### Testing Value Objects

```typescript
describe('PointBalance', () => {
  it('should create valid balance', () => {
    const balance = new PointBalance(1000, 900, 100, 50);
    expect(balance.totalPoints).toBe(1000);
    expect(balance.availablePoints).toBe(900);
  });

  it('should throw error for negative points', () => {
    expect(() => new PointBalance(-10, 0, 0, 0)).toThrow('Points cannot be negative');
  });

  it('should deduct points correctly', () => {
    const balance = new PointBalance(1000, 900, 100, 50);
    const newBalance = balance.deduct(200);

    expect(newBalance.totalPoints).toBe(800);
    expect(newBalance.availablePoints).toBe(700);
  });
});
```

### Testing Domain Services

```typescript
describe('EarnPointsService', () => {
  let service: EarnPointsService;
  let enrollmentRepo: jest.Mocked<CustomerEnrollmentRepository>;
  let ruleEngine: jest.Mocked<LoyaltyRuleEngine>;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    enrollmentRepo = createMock<CustomerEnrollmentRepository>();
    ruleEngine = createMock<LoyaltyRuleEngine>();
    eventBus = createMock<EventBus>();
    service = new EarnPointsService(enrollmentRepo, ruleEngine, eventBus);
  });

  it('should earn points successfully', async () => {
    const enrollment = CustomerEnrollmentAggregate.create('cust-123', 'prog-456');
    enrollmentRepo.findByCustomerAndProgram.mockResolvedValue(enrollment);
    ruleEngine.calculatePoints.mockResolvedValue(50);

    const points = await service.execute('cust-123', 'prog-456', {
      type: 'PURCHASE',
      amount: 25,
    });

    expect(points).toBe(50);
    expect(enrollmentRepo.save).toHaveBeenCalledWith(enrollment);
    expect(eventBus.publishAll).toHaveBeenCalled();
  });

  it('should throw error for non-enrolled customer', async () => {
    enrollmentRepo.findByCustomerAndProgram.mockResolvedValue(null);

    await expect(
      service.execute('cust-123', 'prog-456', { type: 'PURCHASE', amount: 25 })
    ).rejects.toThrow(NotEnrolledError);
  });
});
```

## Integration Testing

### Testing Controllers

```typescript
describe('LoyaltyProgramController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    prisma = module.get(PrismaClient);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE loyalty_programs CASCADE`;
  });

  describe('POST /api/v1/loyalty/programs', () => {
    it('should create program successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/loyalty/programs')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Coffee Rewards',
          description: 'Earn points on every purchase',
          ruleType: 'POINTS_BASED',
          config: { pointsPerDollar: 1.5, minPurchaseAmount: 5 },
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        name: 'Coffee Rewards',
        status: 'DRAFT',
      });
    });

    it('should return 400 for invalid config', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/loyalty/programs')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Coffee Rewards',
          ruleType: 'POINTS_BASED',
          config: { pointsPerDollar: -1 }, // Invalid
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

## E2E Testing

### Web (Playwright)

```typescript
// loyalty-programs.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Loyalty Programs', () => {
  test('should create program from template', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name=email]', 'owner@test.com');
    await page.fill('[name=password]', 'password');
    await page.click('button[type=submit]');

    // Navigate to templates
    await page.goto('/templates');
    await expect(page.locator('h1')).toContainText('Loyalty Templates');

    // Select template
    await page.click('text=Coffee Punch Card');
    await expect(page.locator('h2')).toContainText('Coffee Punch Card');

    // Create program
    await page.click('button:has-text("Create from Template")');
    await page.fill('[name=programName]', 'My Coffee Rewards');
    await page.click('button:has-text("Activate Program")');

    // Verify success
    await expect(page.locator('.success-message')).toContainText(
      'Program activated successfully!'
    );
    await expect(page).toHaveURL('/programs');
    await expect(page.locator('text=My Coffee Rewards')).toBeVisible();
  });
});
```

### Mobile (Detox)

```typescript
// enrollment.e2e.ts
describe('Customer Enrollment', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should enroll in program', async () => {
    // Navigate to programs
    await element(by.id('programs-tab')).tap();

    // Select program
    await element(by.text('Coffee Rewards')).tap();

    // Enroll
    await element(by.id('enroll-button')).tap();

    // Verify enrollment
    await expect(element(by.text('You are enrolled'))).toBeVisible();
    await expect(element(by.id('point-balance'))).toHaveText('0 points');
  });
});
```

## Performance Testing

### Load Testing (k6)

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests < 200ms
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  const response = http.post(
    'https://api.nxloy.com/api/v1/loyalty/enrollments/earn',
    JSON.stringify({
      customerId: 'cust-123',
      programId: 'prog-456',
      points: 50,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${__ENV.API_TOKEN}`,
      },
    }
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

Run load test:
```bash
k6 run load-test.js
```

## Test Data Management

### Factories

```typescript
// factories/loyalty-program.factory.ts
export class LoyaltyProgramFactory {
  static create(overrides?: Partial<LoyaltyProgram>): LoyaltyProgram {
    return {
      id: faker.string.uuid(),
      businessId: faker.string.uuid(),
      name: faker.company.name() + ' Rewards',
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static batch(count: number): LoyaltyProgram[] {
    return Array.from({ length: count }, () => this.create());
  }
}
```

### Test Database

```bash
# Create test database
createdb nxloy_test

# Run migrations
DATABASE_URL=postgresql://localhost/nxloy_test npx prisma migrate deploy

# Seed test data
DATABASE_URL=postgresql://localhost/nxloy_test npx prisma db seed
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: nxloy_test
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: nx affected:test --coverage
      - run: nx affected:e2e
```

## References

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Acceptance Tests](../features/loyalty-templates/ACCEPTANCE.feature)

---

**Document Owner**: QA Team
**Last Updated**: 2025-11-07
