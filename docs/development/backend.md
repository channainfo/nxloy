# Backend Development Guide

**Last Updated**: 2025-11-08

[← Back to main README](../../README.md)

Complete guide for developing the NestJS backend API for NxLoy.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [API Design Standards](#api-design-standards)
6. [Database Operations](#database-operations)
7. [Testing](#testing)
8. [Common Tasks](#common-tasks)

---

## Overview

The NxLoy backend is built with **NestJS**, a progressive Node.js framework that provides:

- Modular architecture with dependency injection
- Built-in OpenAPI/Swagger documentation
- Strong TypeScript support
- Microservices-ready design
- Extensive ecosystem of plugins

**Current Status**: 🚧 Framework configured, no domain modules implemented yet

---

## Technology Stack

### NestJS Framework

**Version**: 10.x

**Key Features**:
- Modular architecture - Each domain is a separate module
- Dependency injection - Clean, testable code
- Built-in OpenAPI - Auto-generated API docs
- Microservices-ready - Easy to extract domains later

### PostgreSQL Database

**Version**: 16 or 17 (recommended: 17)

**Features Used**:
- Relational data model
- ACID transactions
- Full-text search
- JSON support for flexible fields (metadata columns)

### Prisma ORM

**Version**: 6.7.0+

**Why Prisma**:
- Type-safe database access
- Multi-file schema support (one file per domain)
- Excellent migration management
- Query optimization and performance monitoring

**Schema Location**: `packages/database/prisma/schema/`

### REST API Standards

**API Specification**: OpenAPI 3.1

**Key Patterns**:
- RESTful resource design
- JSON request/response format
- JWT authentication with Bearer tokens
- Cursor-based pagination
- RFC 7807 error responses

### Events & AsyncAPI

**Event-Driven Architecture**:
- Domain events published after state changes
- AsyncAPI specification for event contracts
- Message queues (planned: RabbitMQ or Kafka)

**Event Examples**:
- `loyalty.points.earned`
- `rewards.redeemed`
- `customer.tier.upgraded`

### Authentication

**Passport.js Integration**:
- Multiple OAuth 2.0 strategies (Google, Apple, Facebook, Telegram)
- JWT token generation and validation
- Session management
- Role-based access control (RBAC)

---

## Project Structure

```
apps/backend/
├── src/
│   ├── app/
│   │   ├── app.module.ts       # Root module
│   │   ├── app.controller.ts   # Health check endpoint
│   │   └── app.service.ts
│   ├── auth/                   # 📋 Authentication domain (to be built)
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── strategies/         # OAuth strategies
│   ├── loyalty/                # 📋 Loyalty domain (to be built)
│   ├── rewards/                # 📋 Rewards domain (to be built)
│   ├── customers/              # 📋 Customer domain (to be built)
│   ├── common/                 # Shared utilities
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Auth guards
│   │   ├── interceptors/      # Request/response interceptors
│   │   └── pipes/             # Validation pipes
│   └── main.ts                # Application entry point
├── test/                      # E2E tests
└── project.json               # Nx configuration
```

---

## Development Workflow

### Start Development Server

```bash
# Serve with watch mode (auto-reload)
nx serve backend

# API available at: http://localhost:8080
# API docs: http://localhost:8080/api/docs
```

### Development Commands

```bash
# Serve with specific configuration
nx serve backend --configuration=production

# Build for production
nx build backend --configuration=production

# Run tests
nx test backend

# Run tests with coverage
nx test backend --coverage

# Lint code
nx lint backend --fix

# Format code
nx format:write
```

---

## API Design Standards

### Base URL

**Development**: `http://localhost:8080`
**Production**: `https://api.nxloy.com/v1`

### Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <jwt-token>
```

### Request/Response Format

**Content-Type**: `application/json`

**Success Response**:
```json
{
  "data": {
    "id": "123",
    "email": "customer@example.com"
  }
}
```

**Error Response** (RFC 7807):
```json
{
  "type": "https://api.nxloy.com/errors/validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Email is required",
  "instance": "/api/customers/123"
}
```

### Pagination

**Cursor-Based Pagination**:

Request:
```bash
GET /api/customers?cursor=abc123&limit=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "cursor": "def456",
    "hasMore": true,
    "limit": 20
  }
}
```

### OpenAPI Specification

**Location**: `docs/contracts/openapi.yaml`

**Auto-Generated from NestJS**:
- Use `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` decorators
- Swagger UI available at `/api/docs`
- Interactive API explorer

**Example**:
```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  @Get()
  @ApiOperation({ summary: 'List all customers' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async findAll() {
    return this.customerService.findAll();
  }
}
```

### AsyncAPI (Events)

**Location**: `docs/contracts/events.asyncapi.yaml`

**Event Pattern**:
```typescript
{
  "eventType": "loyalty.points.earned",
  "aggregateId": "customer-123",
  "aggregateType": "Customer",
  "data": {
    "customerId": "customer-123",
    "programId": "program-456",
    "points": 100,
    "transactionId": "txn-789"
  },
  "metadata": {
    "timestamp": "2025-11-08T12:00:00Z",
    "userId": "user-001"
  }
}
```

---

## Database Operations

### Using Prisma Client

**Import from centralized package**:
```typescript
import { prisma, Customer, LoyaltyProgram } from '@nxloy/database';

export class CustomerService {
  async findById(id: string): Promise<Customer> {
    return prisma.customer.findUnique({
      where: { id },
      include: { loyaltyAccount: true }
    });
  }
}
```

### Common Database Commands

Navigate to database package:
```bash
cd packages/database
```

**Create Migration**:
```bash
pnpm prisma migrate dev --name add_customer_email_verification
```

**Apply Migrations** (production):
```bash
pnpm prisma migrate deploy
```

**Generate Prisma Client**:
```bash
pnpm prisma generate
```

**Open Prisma Studio** (database GUI):
```bash
pnpm prisma studio
```

**Reset Database** (DEV ONLY - destroys data!):
```bash
pnpm prisma migrate reset
```

### Multi-Tenant Pattern

**All tenant-scoped queries must filter by `businessId`**:

```typescript
// ❌ Bad - Exposes data across businesses
async findAll() {
  return prisma.customer.findMany();
}

// ✅ Good - Isolated by business
async findAll(businessId: string) {
  return prisma.customer.findMany({
    where: { businessId, deletedAt: null }
  });
}
```

### Soft Delete Pattern

**Never hard delete - use soft delete**:

```typescript
// ❌ Bad - Hard delete
async delete(id: string) {
  return prisma.customer.delete({ where: { id } });
}

// ✅ Good - Soft delete
async delete(id: string) {
  return prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}
```

---

## Testing

### Testing Philosophy

From `CLAUDE.md`:

- **❌ NEVER use mocks** - Causes false positives
- **✅ Use factories and Faker** - Create real database records
- **✅ Test against real dependencies** - Use test database, not mocked repositories
- **✅ 80% coverage minimum**, 100% for business logic

### Factory Pattern

**Create test factories**:
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
}
```

**Use in tests**:
```typescript
describe('CustomerService', () => {
  let testCustomer: Customer;

  beforeEach(async () => {
    testCustomer = await CustomerFactory.create();
  });

  afterEach(async () => {
    await prisma.customer.delete({ where: { id: testCustomer.id } });
  });

  it('should find customer by email', async () => {
    const found = await customerService.findByEmail(testCustomer.email);
    expect(found.email).toBe(testCustomer.email);
  });
});
```

### Run Tests

```bash
# Test backend
nx test backend

# Test with coverage
nx test backend --coverage

# Test in watch mode
nx test backend --watch

# E2E tests
nx e2e backend-e2e
```

---

## Common Tasks

### Creating a New Domain Module

```bash
# Generate new module
nx g @nx/nest:module loyalty --project=backend

# Generate controller
nx g @nx/nest:controller loyalty --project=backend

# Generate service
nx g @nx/nest:service loyalty --project=backend
```

### Adding Environment Variables

1. Add to `.env.example`:
   ```
   NEW_API_KEY=your_key_here
   ```

2. Add to `apps/backend/src/config/`:
   ```typescript
   export const config = {
     newApiKey: process.env.NEW_API_KEY
   };
   ```

3. Update `.env` locally

### Code Standards

From `CLAUDE.md`:

- **Max 40 lines per method**
- **Max 3 parameters per method** (use DTOs for more)
- **Single responsibility** (no "and" in method names)
- **No environment-specific code**

---

## Related Documentation

- [Architecture Overview](../architecture/overview.md)
- [API Design Patterns](../architecture/tech-stack.md)
- [Database Architecture](../architecture/data-architecture.md)
- [Testing Standards](../contributing/testing-standards.md)
- [Code Standards](../contributing/code-standards.md)

---

**Navigation**:
- [← Back to main README](../../README.md)
- [Next: Web Development →](web.md)
