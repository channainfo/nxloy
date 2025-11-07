# Loyalty Domain - Entities

**Domain**: Loyalty
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

This document defines all entities within the Loyalty domain, their attributes, relationships, and lifecycle management.

## Core Entities

### 1. LoyaltyProgram

**Purpose**: Root aggregate representing a loyalty program configuration

**Attributes**:
```typescript
interface LoyaltyProgram {
  id: UUID
  businessId: UUID
  templateId?: UUID
  name: string
  description: string
  status: ProgramStatus // DRAFT, ACTIVE, PAUSED, ENDED
  startDate: Date
  endDate?: Date
  enrollmentSettings: EnrollmentSettings
  createdAt: Date
  updatedAt: Date
  createdBy: UUID

  // Relationships
  rules: LoyaltyRule[]
  enrollments: CustomerEnrollment[]
  tiers: Tier[]
}

enum ProgramStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED'
}
```

**Business Rules**:
- Must have at least one active rule
- Status transitions: DRAFT → ACTIVE → PAUSED ↔ ACTIVE → ENDED
- Cannot delete if has active enrollments
- End date must be after start date

**Lifecycle**:
1. Created in DRAFT status
2. Activated when ready (publishes `loyalty.program.activated`)
3. Can be paused (publishes `loyalty.program.paused`)
4. Eventually ended (publishes `loyalty.program.ended`)

---

### 2. LoyaltyRule

**Purpose**: Defines earning/redemption logic for a program

**Attributes**:
```typescript
interface LoyaltyRule {
  id: UUID
  programId: UUID
  ruleType: RuleType
  config: RuleConfiguration
  priority: number
  isActive: boolean
  validFrom: Date
  validTo?: Date
  createdAt: Date
  updatedAt: Date
}

enum RuleType {
  POINTS_BASED = 'POINTS_BASED',
  PUNCH_CARD = 'PUNCH_CARD',
  AMOUNT_SPENT = 'AMOUNT_SPENT',
  TIER_BASED = 'TIER_BASED',
  VISIT_FREQUENCY = 'VISIT_FREQUENCY',
  STAMP_CARD = 'STAMP_CARD'
}

type RuleConfiguration =
  | PointsBasedConfig
  | PunchCardConfig
  | AmountSpentConfig
  | TierBasedConfig
  | VisitFrequencyConfig
  | StampCardConfig
```

**Business Rules**:
- One rule per program (for MVP)
- Cannot change rule type after program activation
- Config validation based on rule type
- Priority determines evaluation order (lower = higher priority)

---

### 3. CustomerEnrollment

**Purpose**: Tracks customer participation in a loyalty program

**Attributes**:
```typescript
interface CustomerEnrollment {
  id: UUID
  customerId: UUID
  programId: UUID
  status: EnrollmentStatus
  enrolledAt: Date
  lastActivityAt: Date
  currentTierId?: UUID
  metadata: Record<string, any>

  // Relationships
  transactions: LoyaltyTransaction[]
  progress: LoyaltyProgress
}

enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}
```

**Business Rules**:
- One enrollment per customer per program
- Cannot enroll in DRAFT or ENDED programs
- Auto-enrollment available if configured
- Paused enrollments don't earn/redeem points

**Lifecycle**:
1. Enrolled (manual or auto)
2. Active participation (earning/redeeming)
3. Optionally paused/resumed
4. Eventually cancelled or completed

---

### 4. LoyaltyTransaction

**Purpose**: Records all point earning/redemption events

**Attributes**:
```typescript
interface LoyaltyTransaction {
  id: UUID
  enrollmentId: UUID
  type: TransactionType
  points: number
  referenceType: string // 'PURCHASE', 'VISIT', 'REFERRAL', 'MANUAL_ADJUSTMENT'
  referenceId: UUID
  description: string
  metadata: Record<string, any>
  createdAt: Date
  processedAt: Date
  expiresAt?: Date
}

enum TransactionType {
  EARN = 'EARN',
  REDEEM = 'REDEEM',
  EXPIRE = 'EXPIRE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT'
}
```

**Business Rules**:
- Immutable after creation (audit trail)
- Points cannot make balance negative
- Expiration tracked per transaction
- Transactions processed in order (FIFO)

**Domain Events Published**:
- `loyalty.points.earned`
- `loyalty.points.redeemed`
- `loyalty.points.expired`

---

### 5. LoyaltyProgress

**Purpose**: Tracks customer progress toward rewards

**Attributes**:
```typescript
interface LoyaltyProgress {
  id: UUID
  enrollmentId: UUID
  ruleType: RuleType
  currentValue: number
  targetValue: number
  unit: string // 'points', 'punches', 'visits', 'dollars'
  periodStart?: Date
  periodEnd?: Date
  isCompleted: boolean
  completedAt?: Date

  // Computed fields
  percentageComplete: number
  remainingToComplete: number
}
```

**Business Rules**:
- One progress record per rule per enrollment
- Auto-resets when target reached (for repeating rewards)
- Period-based progress (for time-based rules)
- Progress preserved on program pause

---

### 6. Tier

**Purpose**: Defines membership tiers and benefits

**Attributes**:
```typescript
interface Tier {
  id: UUID
  programId: UUID
  name: string
  level: number // 1 = lowest, higher = better
  minPoints: number
  maxPoints?: number
  benefits: TierBenefit[]
  color: string
  icon?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface TierBenefit {
  type: BenefitType
  value: string | number
  description: string
}

enum BenefitType {
  POINT_MULTIPLIER = 'POINT_MULTIPLIER',
  DISCOUNT_PERCENTAGE = 'DISCOUNT_PERCENTAGE',
  FREE_SHIPPING = 'FREE_SHIPPING',
  PRIORITY_SUPPORT = 'PRIORITY_SUPPORT',
  EXCLUSIVE_ACCESS = 'EXCLUSIVE_ACCESS'
}
```

**Business Rules**:
- Tiers must have non-overlapping point ranges
- Level determines hierarchy (cannot skip levels)
- Tier upgrades are permanent (no downgrades by default)
- Benefits stack with program benefits

**Domain Events Published**:
- `loyalty.tier.upgraded`
- `loyalty.tier.downgraded` (if enabled)

---

### 7. LoyaltyTemplate

**Purpose**: Pre-configured program templates

**Attributes**:
```typescript
interface LoyaltyTemplate {
  id: UUID
  name: string
  industry: Industry
  ruleType: RuleType
  config: RuleConfiguration
  description: string
  estimatedROI: string
  popularity: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

enum Industry {
  COFFEE = 'COFFEE',
  RETAIL = 'RETAIL',
  RESTAURANT = 'RESTAURANT',
  FITNESS = 'FITNESS',
  BEAUTY = 'BEAUTY',
  ECOMMERCE = 'ECOMMERCE',
  // ... 15 more industries
}
```

**Business Rules**:
- Templates are read-only for businesses
- Popularity increments when used
- Industry-specific recommendations
- Config must be valid for rule type

---

## Entity Relationships

```
LoyaltyProgram (1) ←→ (N) LoyaltyRule
LoyaltyProgram (1) ←→ (N) CustomerEnrollment
LoyaltyProgram (1) ←→ (N) Tier
LoyaltyProgram (N) ←→ (1) LoyaltyTemplate [optional]

CustomerEnrollment (1) ←→ (N) LoyaltyTransaction
CustomerEnrollment (1) ←→ (1) LoyaltyProgress
CustomerEnrollment (N) ←→ (1) Tier [current tier]

Customer (external) (1) ←→ (N) CustomerEnrollment
Business (external) (1) ←→ (N) LoyaltyProgram
```

## Database Schema References

See `/packages/database/prisma/schema.prisma` for full schema definitions.

Key tables:
- `loyalty_programs`
- `loyalty_rules`
- `customer_enrollments`
- `loyalty_transactions`
- `loyalty_progress`
- `tiers`
- `loyalty_templates`

## Indexes

Required indexes for performance:
```sql
CREATE INDEX idx_programs_business ON loyalty_programs(business_id);
CREATE INDEX idx_programs_status ON loyalty_programs(status);
CREATE INDEX idx_enrollments_customer ON customer_enrollments(customer_id);
CREATE INDEX idx_enrollments_program ON customer_enrollments(program_id);
CREATE INDEX idx_transactions_enrollment ON loyalty_transactions(enrollment_id);
CREATE INDEX idx_transactions_created ON loyalty_transactions(created_at DESC);
CREATE INDEX idx_templates_industry ON loyalty_templates(industry);
CREATE INDEX idx_templates_popularity ON loyalty_templates(popularity DESC);
```

## References

- [DOMAIN-OVERVIEW.md](./DOMAIN-OVERVIEW.md)
- [AGGREGATES.md](./AGGREGATES.md)
- [VALUE-OBJECTS.md](./VALUE-OBJECTS.md)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-07
