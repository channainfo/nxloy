# Database Migration Examples - NxLoy Platform

 (NxLoy Platform)
**Last Updated**: 2025-11-07
**Version**: 1.0.0

---

## Table of Contents

1. [Common NxLoy Patterns](#common-nxloy-patterns)
2. [Authentication Domain Examples](#authentication-domain-examples)
3. [Loyalty Domain Examples](#loyalty-domain-examples)
4. [Rewards Domain Examples](#rewards-domain-examples)
5. [Customer Domain Examples](#customer-domain-examples)
6. [Multi-Tenant Examples](#multi-tenant-examples)
7. [Soft Delete Examples](#soft-delete-examples)
8. [Data Migration Examples](#data-migration-examples)
9. [Zero-Downtime Examples](#zero-downtime-examples)
10. [Complex Relationship Examples](#complex-relationship-examples)

---

## Common NxLoy Patterns

### Base Table Template

Every NxLoy table follows this pattern:

```prisma
model EntityName {
  // Primary Key
  id String @id @default(cuid())

  // Multi-tenant isolation
  businessId String

  // Soft delete
  deletedAt DateTime?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  business Business @relation(fields: [businessId], references: [id])

  // Indexes
  @@index([businessId])
  @@index([deletedAt])
  @@map("entity_names")
}
```

**Migration Command**:
```bash
cd packages/database
pnpm prisma migrate dev --name add_entity_name_table
```

---

## Authentication Domain Examples

### Example 1: Add Email Verification

**File**: `packages/database/prisma/schema/auth.prisma`

**Before**:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**After**:
```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  emailVerified   Boolean   @default(false)
  emailVerifiedAt DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

**Migration Command**:
```bash
pnpm prisma migrate dev --name add_user_email_verification
```

**Generated SQL**:
```sql
-- Add email verification fields
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
```

### Example 2: Add PIN Verification Table

**File**: `packages/database/prisma/schema/auth.prisma`

**Schema**:
```prisma
enum VerificationType {
  EMAIL
  PHONE
}

enum VerificationStatus {
  PENDING
  VERIFIED
  EXPIRED
  FAILED
}

model VerificationCode {
  id        String             @id @default(cuid())
  userId    String
  type      VerificationType
  code      String
  status    VerificationStatus @default(PENDING)
  expiresAt DateTime
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([code])
  @@index([expiresAt])
  @@map("verification_codes")
}
```

**Migration Command**:
```bash
pnpm prisma migrate dev --name add_verification_codes
```

**Generated SQL**:
```sql
-- Create enums
CREATE TYPE "VerificationType" AS ENUM ('EMAIL', 'PHONE');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED');

-- Create table
CREATE TABLE "verification_codes" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "VerificationType" NOT NULL,
  "code" TEXT NOT NULL,
  "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "verification_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "verification_codes_userId_idx" ON "verification_codes"("userId");
CREATE INDEX "verification_codes_code_idx" ON "verification_codes"("code");
CREATE INDEX "verification_codes_expiresAt_idx" ON "verification_codes"("expiresAt");
```

### Example 3: Add OAuth Account Linking

**File**: `packages/database/prisma/schema/auth.prisma`

**Schema**:
```prisma
enum OAuthProvider {
  GOOGLE
  APPLE
  FACEBOOK
  TELEGRAM
}

model Account {
  id           String        @id @default(cuid())
  userId       String
  provider     OAuthProvider
  providerId   String        // Provider's user ID
  accessToken  String?       @db.Text
  refreshToken String?       @db.Text
  expiresAt    DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@index([userId])
  @@map("accounts")
}
```

**Migration Command**:
```bash
pnpm prisma migrate dev --name add_oauth_accounts
```

---

## Loyalty Domain Examples

### Example 1: Add Loyalty Program Table

**File**: `packages/database/prisma/schema/loyalty.prisma`

**Schema**:
```prisma
enum ProgramStatus {
  DRAFT
  ACTIVE
  PAUSED
  ARCHIVED
}

enum ProgramType {
  POINTS
  STAMPS
  TIERED
  SUBSCRIPTION
}

model LoyaltyProgram {
  id          String        @id @default(cuid())
  businessId  String
  name        String
  description String?       @db.Text
  type        ProgramType
  status      ProgramStatus @default(DRAFT)
  currency    Currency      @default(USD)
  pointsName  String        @default("Points")

  // Settings
  settings    Json          @default("{}")

  // Soft delete
  deletedAt   DateTime?

  // Timestamps
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relations
  business Business @relation(fields: [businessId], references: [id])
  tiers    LoyaltyTier[]

  @@index([businessId])
  @@index([status])
  @@index([deletedAt])
  @@map("loyalty_programs")
}
```

**Migration Command**:
```bash
pnpm prisma migrate dev --name add_loyalty_programs
```

### Example 2: Add Loyalty Tiers

**File**: `packages/database/prisma/schema/loyalty.prisma`

**Schema**:
```prisma
model LoyaltyTier {
  id              String  @id @default(cuid())
  programId       String
  businessId      String
  name            String
  description     String? @db.Text
  requiredPoints  Int     @default(0)
  multiplier      Decimal @default(1.0) @db.Decimal(4, 2)
  color           String  @default("#000000")
  icon            String?
  benefits        Json    @default("[]")

  // Soft delete
  deletedAt       DateTime?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  business Business       @relation(fields: [businessId], references: [id])
  program  LoyaltyProgram @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@unique([programId, name])
  @@index([businessId])
  @@index([programId])
  @@index([deletedAt])
  @@map("loyalty_tiers")
}
```

**Migration Command**:
```bash
pnpm prisma migrate dev --name add_loyalty_tiers
```

### Example 3: Add Point Transactions

**File**: `packages/database/prisma/schema/loyalty.prisma`

**Schema**:
```prisma
enum TransactionType {
  EARNED
  REDEEMED
  EXPIRED
  ADJUSTED
  REFUNDED
}

model PointTransaction {
  id          String          @id @default(cuid())
  customerId  String
  programId   String
  businessId  String
  type        TransactionType
  amount      Int
  balance     Int
  description String?         @db.Text
  metadata    Json            @default("{}")

  // Optional reference to order/redemption
  orderId     String?
  redemptionId String?

  // Timestamps
  createdAt   DateTime        @default(now())

  // Relations
  business   Business        @relation(fields: [businessId], references: [id])
  customer   Customer        @relation(fields: [customerId], references: [id])
  program    LoyaltyProgram  @relation(fields: [programId], references: [id])

  @@index([customerId])
  @@index([programId])
  @@index([businessId])
  @@index([type])
  @@index([createdAt])
  @@map("point_transactions")
}
```

**Migration Command**:
```bash
pnpm prisma migrate dev --name add_point_transactions
```

---

## Rewards Domain Examples

### Example 1: Add Reward Catalog

**File**: `packages/database/prisma/schema/rewards.prisma`

**Schema**:
```prisma
enum RewardType {
  DISCOUNT_PERCENTAGE
  DISCOUNT_FIXED
  FREE_ITEM
  FREE_SHIPPING
  GIFT_CARD
  EXPERIENCE
  NFT
}

enum RewardStatus {
  DRAFT
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
  ARCHIVED
}

model Reward {
  id          String       @id @default(cuid())
  businessId  String
  programId   String?
  name        String
  description String       @db.Text
  type        RewardType
  status      RewardStatus @default(DRAFT)

  // Cost
  pointsCost  Int
  moneyCost   Int?         // In cents
  currency    Currency     @default(USD)

  // Inventory
  totalStock  Int?         // null = unlimited
  currentStock Int?

  // Display
  image       String?
  category    String?
  tags        String[]     @default([])

  // Restrictions
  startDate   DateTime?
  endDate     DateTime?
  maxPerUser  Int?

  // Soft delete
  deletedAt   DateTime?

  // Timestamps
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // Relations
  business    Business         @relation(fields: [businessId], references: [id])
  program     LoyaltyProgram?  @relation(fields: [programId], references: [id])
  redemptions RewardRedemption[]

  @@index([businessId])
  @@index([programId])
  @@index([status])
  @@index([deletedAt])
  @@map("rewards")
}
```

**Migration Command**:
```bash
pnpm prisma migrate dev --name add_rewards_catalog
```

### Example 2: Add Reward Redemptions

**File**: `packages/database/prisma/schema/rewards.prisma`

**Schema**:
```prisma
enum RedemptionStatus {
  PENDING
  APPROVED
  FULFILLED
  CANCELLED
  REFUNDED
}

model RewardRedemption {
  id          String            @id @default(cuid())
  customerId  String
  rewardId    String
  businessId  String
  status      RedemptionStatus  @default(PENDING)

  // Cost at redemption time
  pointsCost  Int
  moneyCost   Int?
  currency    Currency?

  // Fulfillment
  code        String?           @unique
  expiresAt   DateTime?
  fulfilledAt DateTime?

  // Notes
  notes       String?           @db.Text

  // Timestamps
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  // Relations
  business Business @relation(fields: [businessId], references: [id])
  customer Customer @relation(fields: [customerId], references: [id])
  reward   Reward   @relation(fields: [rewardId], references: [id])

  @@index([customerId])
  @@index([rewardId])
  @@index([businessId])
  @@index([status])
  @@index([code])
  @@map("reward_redemptions")
}
```

**Migration Command**:
```bash
pnpm prisma migrate dev --name add_reward_redemptions
```

---

## Customer Domain Examples

### Example 1: Add Customer Profile

**File**: `packages/database/prisma/schema/customer.prisma`

**Schema**:
```prisma
enum CustomerStatus {
  ACTIVE
  INACTIVE
  BLOCKED
  PENDING
}

model Customer {
  id          String         @id @default(cuid())
  businessId  String
  email       String
  phoneNumber String?
  firstName   String?
  lastName    String?
  status      CustomerStatus @default(PENDING)

  // Profile
  dateOfBirth DateTime?
  gender      String?
  avatar      String?

  // Preferences
  preferences Json           @default("{}")

  // Communication
  emailOptIn  Boolean        @default(true)
  smsOptIn    Boolean        @default(false)

  // Soft delete
  deletedAt   DateTime?

  // Timestamps
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  // Relations
  business       Business           @relation(fields: [businessId], references: [id])
  pointTransactions PointTransaction[]
  redemptions    RewardRedemption[]

  @@unique([email, businessId])
  @@index([businessId])
  @@index([status])
  @@index([deletedAt])
  @@map("customers")
}
```

**Migration Command**:
```bash
pnpm prisma migrate dev --name add_customers
```

### Example 2: Add Customer Segments

**File**: `packages/database/prisma/schema/customer.prisma`

**Schema**:
```prisma
model CustomerSegment {
  id          String   @id @default(cuid())
  businessId  String
  name        String
  description String?  @db.Text

  // Segment rules
  rules       Json     @default("{}")

  // Computed count
  memberCount Int      @default(0)

  // Soft delete
  deletedAt   DateTime?

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  business Business @relation(fields: [businessId], references: [id])

  @@unique([businessId, name])
  @@index([businessId])
  @@index([deletedAt])
  @@map("customer_segments")
}
```

**Migration Command**:
```bash
pnpm prisma migrate dev --name add_customer_segments
```

---

## Multi-Tenant Examples

### Example 1: Add businessId to Existing Table

**Scenario**: You created a table without `businessId`, now need to add it.

**Original Schema** (`loyalty.prisma`):
```prisma
model LoyaltyTier {
  id       String @id @default(cuid())
  name     String
  minPoints Int
}
```

**Step 1: Add businessId as Optional**

```prisma
model LoyaltyTier {
  id         String  @id @default(cuid())
  name       String
  minPoints  Int
  businessId String? // ← Add as optional first

  business Business? @relation(fields: [businessId], references: [id])
}
```

**Migration**:
```bash
pnpm prisma migrate dev --name add_businessid_to_loyalty_tiers_optional
```

**Step 2: Run Data Migration to Populate**

Create script: `packages/database/scripts/migrations/populate-businessid-loyalty-tiers.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Populating businessId for loyalty tiers...');

  // Get default business (or determine logic)
  const defaultBusiness = await prisma.business.findFirst();

  if (!defaultBusiness) {
    throw new Error('No business found');
  }

  // Update all tiers without businessId
  const result = await prisma.loyaltyTier.updateMany({
    where: { businessId: null },
    data: { businessId: defaultBusiness.id }
  });

  console.log(`Updated ${result.count} loyalty tiers`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run script:
```bash
pnpm tsx scripts/migrations/populate-businessid-loyalty-tiers.ts
```

**Step 3: Make businessId Required**

```prisma
model LoyaltyTier {
  id         String @id @default(cuid())
  name       String
  minPoints  Int
  businessId String // ← Now required

  business Business @relation(fields: [businessId], references: [id])

  @@index([businessId])
}
```

**Create migration (create-only to edit SQL)**:
```bash
pnpm prisma migrate dev --name make_businessid_required_loyalty_tiers --create-only
```

**Edit generated SQL** to only set NOT NULL (no drop/add):
```sql
-- Only make column NOT NULL (data already populated)
ALTER TABLE "loyalty_tiers" ALTER COLUMN "businessId" SET NOT NULL;

-- Add index
CREATE INDEX "loyalty_tiers_businessId_idx" ON "loyalty_tiers"("businessId");

-- Add foreign key
ALTER TABLE "loyalty_tiers" ADD CONSTRAINT "loyalty_tiers_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "businesses"("id");
```

**Apply migration**:
```bash
pnpm prisma migrate dev
```

---

## Soft Delete Examples

### Example 1: Add Soft Delete to Existing Table

**Before** (`customer.prisma`):
```prisma
model Customer {
  id         String   @id @default(cuid())
  email      String   @unique
  businessId String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**After**:
```prisma
model Customer {
  id         String    @id @default(cuid())
  email      String    @unique
  businessId String
  deletedAt  DateTime? // ← Add soft delete
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([deletedAt]) // ← Index for filtering
}
```

**Migration**:
```bash
pnpm prisma migrate dev --name add_soft_delete_to_customers
```

**Generated SQL**:
```sql
ALTER TABLE "customers" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "customers_deletedAt_idx" ON "customers"("deletedAt");
```

### Example 2: Implement Soft Delete Middleware

**File**: `packages/database/src/middleware/soft-delete.ts`

```typescript
import { Prisma } from '@prisma/client';

export function softDeleteMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    // Convert delete to update
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }

    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      params.args.data = { deletedAt: new Date() };
    }

    // Auto-filter deleted records
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        deletedAt: null
      };
    }

    if (params.action === 'findMany') {
      if (params.args.where?.deletedAt === undefined) {
        params.args.where = {
          ...params.args.where,
          deletedAt: null
        };
      }
    }

    return next(params);
  };
}
```

**Register**: `packages/database/src/index.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { softDeleteMiddleware } from './middleware/soft-delete';

export const prisma = new PrismaClient();

// Register middleware
prisma.$use(softDeleteMiddleware());

export * from '@prisma/client';
```

---

## Data Migration Examples

### Example 1: Split Name Field into First/Last

**Before**:
```prisma
model Customer {
  id   String @id
  name String // ← Single name field
}
```

**After**:
```prisma
model Customer {
  id        String  @id
  name      String? // ← Keep for migration
  firstName String?
  lastName  String?
}
```

**Migration**:
```bash
pnpm prisma migrate dev --name add_firstname_lastname_to_customers
```

**Data Migration Script**: `scripts/migrations/split-customer-names.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Splitting customer names...');

  const customers = await prisma.customer.findMany({
    where: {
      name: { not: null },
      firstName: null // Not yet migrated
    }
  });

  console.log(`Found ${customers.length} customers to migrate`);

  for (const customer of customers) {
    if (!customer.name) continue;

    const nameParts = customer.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    await prisma.customer.update({
      where: { id: customer.id },
      data: { firstName, lastName }
    });

    console.log(`✓ ${customer.id}: "${customer.name}" → "${firstName}" "${lastName}"`);
  }

  console.log('Migration complete!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run**:
```bash
cd packages/database
pnpm tsx scripts/migrations/split-customer-names.ts
```

**After Verification, Remove Old Field**:
```prisma
model Customer {
  id        String @id
  firstName String
  lastName  String
}
```

**Migration**:
```bash
pnpm prisma migrate dev --name remove_name_field_from_customers
```

---

## Zero-Downtime Examples

### Example 1: Rename Column (Zero-Downtime)

**Scenario**: Rename `points` → `pointsBalance` in production without downtime.

**Phase 1: Expand (Add new column)**

```prisma
model Customer {
  id            String @id
  points        Int    // ← Old column (keep)
  pointsBalance Int?   // ← New column (add)
}
```

**Migration**:
```bash
pnpm prisma migrate dev --name add_pointsbalance_column
```

**Deploy**: ✅ Old code still works

**Phase 2: Migrate Data**

```typescript
// scripts/migrations/copy-points-to-balance.ts
await prisma.$executeRaw`
  UPDATE customers
  SET "pointsBalance" = points
  WHERE "pointsBalance" IS NULL;
`;
```

**Phase 3: Deploy Code (Dual-Write)**

```typescript
// Write to both columns during transition
await prisma.customer.update({
  where: { id },
  data: {
    points: newBalance,        // Keep for old instances
    pointsBalance: newBalance  // New column
  }
});
```

**Deploy**: ✅ All instances can read from either column

**Phase 4: Contract (Remove old column)**

```prisma
model Customer {
  id            String @id
  pointsBalance Int    // ← Only new column
}
```

**Migration**:
```bash
pnpm prisma migrate dev --name remove_points_column
```

**Deploy**: ✅ Only new code deployed, using `pointsBalance`

---

## Complex Relationship Examples

### Example 1: Many-to-Many Relationship

**Scenario**: Customers can have multiple segments, segments have multiple customers.

**Schema** (`customer.prisma`):
```prisma
model Customer {
  id       String   @id @default(cuid())
  email    String
  segments CustomerToSegment[]
}

model CustomerSegment {
  id        String @id @default(cuid())
  name      String
  customers CustomerToSegment[]
}

// Join table
model CustomerToSegment {
  customerId String
  segmentId  String
  assignedAt DateTime @default(now())

  customer Customer        @relation(fields: [customerId], references: [id], onDelete: Cascade)
  segment  CustomerSegment @relation(fields: [segmentId], references: [id], onDelete: Cascade)

  @@id([customerId, segmentId])
  @@index([customerId])
  @@index([segmentId])
  @@map("customer_segments_mapping")
}
```

**Migration**:
```bash
pnpm prisma migrate dev --name add_customer_segment_relationship
```

### Example 2: Self-Referential Relationship

**Scenario**: Referral system where customers refer other customers.

**Schema** (`customer.prisma`):
```prisma
model Customer {
  id         String     @id @default(cuid())
  email      String
  referredBy String?    // ← ID of referring customer

  // Self-referential relations
  referrer   Customer?  @relation("Referrals", fields: [referredBy], references: [id])
  referrals  Customer[] @relation("Referrals")

  @@index([referredBy])
}
```

**Migration**:
```bash
pnpm prisma migrate dev --name add_customer_referral_relationship
```

**Generated SQL**:
```sql
ALTER TABLE "customers" ADD COLUMN "referredBy" TEXT;
CREATE INDEX "customers_referredBy_idx" ON "customers"("referredBy");
ALTER TABLE "customers" ADD CONSTRAINT "customers_referredBy_fkey"
  FOREIGN KEY ("referredBy") REFERENCES "customers"("id");
```

---

## Complete Real-World Example

### Scenario: Launch New Loyalty Program Feature

**Requirements**:
1. Add loyalty programs with multiple tiers
2. Track customer point balances
3. Record all point transactions
4. Support multi-tenant
5. Support soft delete

**Step-by-Step Implementation**:

**1. Create Schema Files**

`base.prisma` (add enums):
```prisma
enum ProgramType {
  POINTS
  STAMPS
  TIERED
}

enum TransactionType {
  EARNED
  REDEEMED
  EXPIRED
}
```

`loyalty.prisma`:
```prisma
model LoyaltyProgram {
  id          String      @id @default(cuid())
  businessId  String
  name        String
  type        ProgramType
  deletedAt   DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  business Business      @relation(fields: [businessId], references: [id])
  tiers    LoyaltyTier[]
  balances CustomerBalance[]

  @@index([businessId])
  @@index([deletedAt])
  @@map("loyalty_programs")
}

model LoyaltyTier {
  id             String  @id @default(cuid())
  programId      String
  businessId     String
  name           String
  requiredPoints Int
  deletedAt      DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  business Business       @relation(fields: [businessId], references: [id])
  program  LoyaltyProgram @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@index([businessId])
  @@index([programId])
  @@index([deletedAt])
  @@map("loyalty_tiers")
}

model CustomerBalance {
  id         String @id @default(cuid())
  customerId String
  programId  String
  businessId String
  balance    Int    @default(0)
  updatedAt  DateTime @updatedAt

  business Business       @relation(fields: [businessId], references: [id])
  customer Customer       @relation(fields: [customerId], references: [id])
  program  LoyaltyProgram @relation(fields: [programId], references: [id])

  @@unique([customerId, programId])
  @@index([businessId])
  @@index([customerId])
  @@index([programId])
  @@map("customer_balances")
}

model PointTransaction {
  id          String          @id @default(cuid())
  customerId  String
  programId   String
  businessId  String
  type        TransactionType
  amount      Int
  balance     Int
  description String?
  createdAt   DateTime        @default(now())

  business Business       @relation(fields: [businessId], references: [id])
  customer Customer       @relation(fields: [customerId], references: [id])
  program  LoyaltyProgram @relation(fields: [programId], references: [id])

  @@index([businessId])
  @@index([customerId])
  @@index([programId])
  @@index([createdAt])
  @@map("point_transactions")
}
```

**2. Create Migration**:
```bash
cd packages/database
pnpm prisma migrate dev --name add_loyalty_system
```

**3. Verify Generated SQL**:
```bash
cat prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql
```

**4. Test Migration**:
```bash
pnpm prisma migrate reset  # Reset + reapply all
pnpm prisma generate       # Regenerate client
```

**5. Update Tests**:
```bash
cd ../..
nx affected:test
```

**6. Commit**:
```bash
git add packages/database/prisma/
git commit -m "feat(database): add loyalty program system with tiers and point tracking"
```

---

**Last Updated**: 2025-11-07

**Next Review**: 2025-12-07
