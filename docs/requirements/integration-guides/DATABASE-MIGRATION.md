# Database Migration Guide

**Version**: 1.0
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

This guide covers database schema management, migrations, seeding, and best practices for the NxLoy platform.

## Database Stack

- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Migration Tool**: Prisma Migrate
- **Seeding**: Prisma Seed Scripts

## Schema Management

### Prisma Schema Location

```
packages/database/
├── prisma/
│   ├── schema.prisma          # Main schema
│   ├── migrations/            # Migration history
│   └── seed.ts                # Seed data
└── package.json
```

### Schema Structure

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model LoyaltyProgram {
  id          String   @id @default(uuid()) @db.Uuid
  businessId  String   @db.Uuid
  name        String   @db.VarChar(255)
  status      String   @db.VarChar(50)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  rules       LoyaltyRule[]
  enrollments CustomerEnrollment[]

  @@index([businessId, status])
  @@map("loyalty_programs")
}
```

## Creating Migrations

### Step 1: Modify Schema

Edit `prisma/schema.prisma`:

```prisma
model LoyaltyProgram {
  // ... existing fields
  templateId  String?  @db.Uuid  // New field
}
```

### Step 2: Create Migration

```bash
cd packages/database
npx prisma migrate dev --name add_template_id_to_programs
```

This generates:
- Migration SQL in `prisma/migrations/`
- Updates Prisma Client types

### Step 3: Review Migration

```sql
-- Migration: 20251107_add_template_id_to_programs
ALTER TABLE loyalty_programs ADD COLUMN template_id UUID;
CREATE INDEX idx_programs_template ON loyalty_programs(template_id);
```

### Step 4: Apply to Other Environments

**Staging**:
```bash
npx prisma migrate deploy
```

**Production**:
```bash
# Run as part of CI/CD pipeline
npx prisma migrate deploy
```

## Migration Best Practices

### 1. Backward-Compatible Migrations

Always make changes backward-compatible:

**Adding Column (Safe)**:
```sql
-- Step 1: Add nullable column
ALTER TABLE loyalty_programs ADD COLUMN new_field TEXT;

-- Step 2: Backfill data
UPDATE loyalty_programs SET new_field = 'default';

-- Step 3: Make NOT NULL (separate migration)
ALTER TABLE loyalty_programs ALTER COLUMN new_field SET NOT NULL;
```

**Removing Column (Safe)**:
```sql
-- Step 1: Deploy code that stops using column
-- Step 2: Drop column in next deployment
ALTER TABLE loyalty_programs DROP COLUMN old_field;
```

### 2. Zero-Downtime Migrations

For large tables, use online DDL:

```sql
-- Add index concurrently (doesn't lock table)
CREATE INDEX CONCURRENTLY idx_transactions_created
ON loyalty_transactions(created_at DESC);

-- Add column with default (fast in Postgres 11+)
ALTER TABLE loyalty_transactions
ADD COLUMN new_field TEXT DEFAULT 'default' NOT NULL;
```

### 3. Test Migrations Locally

```bash
# Apply migration
npx prisma migrate dev

# Run tests
nx test backend

# Rollback if needed
npx prisma migrate reset
```

## Seeding

### Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed loyalty templates
  const templates = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Coffee Punch Card',
      industry: 'COFFEE',
      ruleType: 'PUNCH_CARD',
      config: {
        requiredPunches: 10,
        rewardType: 'FREE_ITEM',
        rewardValue: 'Free coffee',
      },
      description: 'Buy 10 coffees, get 1 free',
      estimatedROI: '15-25% increase in repeat visits',
      popularity: 847,
    },
    // ... 20 more templates
  ];

  for (const template of templates) {
    await prisma.loyaltyRuleTemplate.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    });
  }

  console.log('✅ Seeded 21 loyalty templates');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Running Seeds

```bash
# Development
npx prisma db seed

# Production (one-time)
NODE_ENV=production npx prisma db seed
```

## Rollbacks

### Manual Rollback

```bash
# View migration history
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back 20251107_add_template_id

# Apply previous state
npx prisma db push
```

### Automated Rollback (CI/CD)

```yaml
# .github/workflows/deploy.yml
- name: Apply migrations
  run: npx prisma migrate deploy
  continue-on-error: true

- name: Rollback on failure
  if: failure()
  run: |
    git checkout HEAD~1
    npx prisma migrate deploy
```

## Multi-Tenancy

### Tenant Isolation

All tables have `businessId`:

```prisma
model LoyaltyProgram {
  businessId String @db.Uuid
  // ... other fields

  @@index([businessId])
}
```

### Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their business's programs
CREATE POLICY business_isolation ON loyalty_programs
FOR ALL
USING (business_id = current_setting('app.business_id')::uuid);
```

### Prisma Client with RLS

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Set business_id for all queries in this session
await prisma.$executeRaw`SET app.business_id = ${businessId}`;
```

## Performance Optimization

### Indexes

Required indexes for performance:

```sql
-- Loyalty Programs
CREATE INDEX idx_programs_business_status ON loyalty_programs(business_id, status);
CREATE INDEX idx_programs_template ON loyalty_programs(template_id);

-- Customer Enrollments
CREATE INDEX idx_enrollments_customer ON customer_enrollments(customer_id);
CREATE INDEX idx_enrollments_program_status ON customer_enrollments(program_id, status);
CREATE INDEX idx_enrollments_customer_program ON customer_enrollments(customer_id, program_id);

-- Loyalty Transactions
CREATE INDEX idx_transactions_enrollment ON loyalty_transactions(enrollment_id);
CREATE INDEX idx_transactions_created ON loyalty_transactions(created_at DESC);
CREATE INDEX idx_transactions_expiry ON loyalty_transactions(expires_at) WHERE type = 'EARN';
```

### Connection Pooling

```typescript
// Use PgBouncer for connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Points to PgBouncer
    },
  },
});
```

## Backup and Recovery

### Automated Backups

```bash
# Daily backups (cron job)
0 2 * * * pg_dump -U postgres nxloy_prod > /backups/nxloy_$(date +\%Y\%m\%d).sql
```

### Point-in-Time Recovery

```bash
# Restore to specific time
pg_restore -U postgres -d nxloy_prod -t 2025-11-07T10:00:00Z backup.dump
```

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Domain Specifications](../domain-specs/)

---

**Document Owner**: Database Team
**Last Updated**: 2025-11-07
