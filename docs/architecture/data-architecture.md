# Data Architecture

**Related**: [Overview](./overview.md) | [Domains](./domains.md) | [Tech Stack](./tech-stack.md)

---

## Database Design Principles

### 1. Multi-Tenancy at Row Level
- Every table has `businessId` column
- Row-level security (RLS)
- Data isolation per business

### 2. Soft Deletes
- `deletedAt` timestamp instead of hard deletes
- Enables audit trails
- GDPR compliance (hard delete on request)

### 3. Audit Fields
- `createdAt`, `updatedAt` on all entities
- `createdBy`, `updatedBy` (user ID) where applicable

### 4. JSON Flexibility
- `metadata` JSON columns for custom fields
- Balance between structure and flexibility

### 5. Indexes
- Foreign keys indexed
- Query patterns optimized
- Full-text search indexes

## Multi-File Prisma Schema

Schema organized by domain (see [Prisma Multi-File Spec](../requirements/domain-specs/database/PRISMA-MULTI-FILE-SPEC.md)):

```
packages/database/prisma/schema/
├── base.prisma           # Config + shared types
├── auth.prisma           # Authentication domain
├── loyalty.prisma        # Loyalty domain
├── rewards.prisma        # Rewards domain
├── customers.prisma      # Customer domain
├── partners.prisma       # Partner domain
├── subscriptions.prisma  # Subscription domain
├── referrals.prisma      # Referral domain
└── blockchain.prisma     # Blockchain domain
```

**Benefits**:
- Parallel development (agents work on different files)
- Clear domain ownership
- Reduced merge conflicts
- Easier to review changes

## Database Package

Centralized database access via `@nxloy/database`:

```typescript
// Import in any app or package
import { prisma, Customer, LoyaltyProgram } from '@nxloy/database';

// Use Prisma Client
const customer = await prisma.customer.findUnique({ where: { id } });
```

## API Design

### REST API Standards

**Base URL**: `https://api.nxloy.com/v1`

**Authentication**: Bearer token (JWT)
```
Authorization: Bearer <token>
```

**Request/Response Format**: JSON

**Error Format** (RFC 7807 Problem Details):
```json
{
  "type": "https://api.nxloy.com/errors/validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Email is required",
  "instance": "/api/customers/123"
}
```

**Pagination** (cursor-based):
```json
{
  "data": [...],
  "pagination": {
    "cursor": "abc123",
    "hasMore": true,
    "limit": 20
  }
}
```

### OpenAPI Specification

Location: `docs/contracts/openapi.yaml`

**Generation**:
- NestJS decorators → OpenAPI spec
- Spec frozen after review
- Mocks generated for frontend

**Documentation**:
- Available at `/api/docs` (Swagger UI)
- Interactive API explorer

### AsyncAPI (Events)

Location: `docs/contracts/events.asyncapi.yaml`

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
    "timestamp": "2025-11-07T12:00:00Z",
    "userId": "user-001"
  }
}
```

**Key Events**:
- `loyalty.points.earned`
- `loyalty.tier.upgraded`
- `rewards.redeemed`
- `customer.created`
- `subscription.renewed`

---

**Last Updated**: 2025-11-08
**Source**: ARCHITECTURE.md (Lines 478-619)
