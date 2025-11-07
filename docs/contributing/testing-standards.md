# Testing Standards

**Related**: [Code Standards](./code-standards.md) | [Development Workflow](./development-workflow.md)

---

## Testing Philosophy

From `CLAUDE.md`:

**❌ NEVER use mocks** - Mocking causes false positives and hides real integration issues

**✅ ALWAYS use factories and Faker** - Create actual database records for testing

## Why No Mocks?

When you mock a database call, API response, or service method, your test passes even if:
- The actual database schema changed
- The API contract broke
- The service method signature changed
- Business logic has bugs

## Testing Pattern

**Factory-Based Testing**:

```typescript
// ✅ Good: Real database integration test
import { faker } from '@faker-js/faker';
import { prisma } from '@nxloy/database';

describe('CustomerService', () => {
  let testCustomer: Customer;

  beforeEach(async () => {
    // Create real test data using factory
    testCustomer = await prisma.customer.create({
      data: {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        businessId: testBusiness.id
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.customer.delete({ where: { id: testCustomer.id } });
  });

  it('should find customer by email', async () => {
    // Test against real database
    const found = await customerService.findByEmail(testCustomer.email);

    expect(found).toBeDefined();
    expect(found.email).toBe(testCustomer.email);
  });
});
```

**❌ Bad: Mocked test (DO NOT DO THIS)**:
```typescript
// This test could pass even if the real database query is broken!
jest.mock('@nxloy/database');
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

it('should find customer by email', async () => {
  mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
  // ... test passes but might fail in production
});
```

## Factory Pattern

**Create reusable factories**:

```typescript
// test/factories/customer.factory.ts
import { faker } from '@faker-js/faker';
import { prisma } from '@nxloy/database';

export class CustomerFactory {
  static async create(overrides?: Partial<CreateCustomerData>) {
    return prisma.customer.create({
      data: {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        businessId: overrides?.businessId || testBusiness.id,
        ...overrides
      }
    });
  }

  static async createMany(count: number, overrides?: Partial<CreateCustomerData>) {
    return Promise.all(
      Array.from({ length: count }, () => this.create(overrides))
    );
  }
}
```

**Use factories in tests**:

```typescript
it('should calculate total spent', async () => {
  const customer = await CustomerFactory.create();
  const transaction1 = await TransactionFactory.create({
    customerId: customer.id,
    total: 100
  });
  const transaction2 = await TransactionFactory.create({
    customerId: customer.id,
    total: 50
  });

  const total = await customerService.getTotalSpent(customer.id);

  expect(total).toBe(150);
});
```

## Coverage Requirements

- **Minimum 80% coverage** for all packages
- **100% coverage** for business logic (services, calculators, validators)
- Use `nx test <project> --coverage` to check
- Coverage reports in `coverage/` directory

## Test Organization

```
apps/backend/src/customer/
├── customer.service.ts
├── customer.service.spec.ts       # Unit tests
├── customer.controller.ts
└── customer.controller.spec.ts

apps/backend-e2e/src/
└── customer/
    └── customer.spec.ts            # E2E tests
```

---

**Last Updated**: 2025-11-08
**Source**: CONTRIBUTING.md (Lines 920-1060)
