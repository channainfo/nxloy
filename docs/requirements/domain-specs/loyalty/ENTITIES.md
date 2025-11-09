# Loyalty Domain - Entities

**Domain**: Loyalty
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)

## Overview

This document defines all entities within the Loyalty domain, their attributes, relationships, and lifecycle management.

**v2.0.0 Changes**:
- Added `Wallet` aggregate for unified balance management
- Added `StoreCredit` entity (CASHBACK reward type)
- Added `DigitalReward` entity (DIGITAL_GIFT reward type)
- Added `StoreCreditTransaction` and `DigitalRewardTransaction` entities
- Added `WalletConfiguration` entity for business-level wallet settings
- Updated `LoyaltyTransaction` to integrate with wallet redemptions

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

### 8. Wallet

**Purpose**: Unified view of all customer loyalty assets (points, store credit, digital rewards)

**Attributes**:
```typescript
interface Wallet {
  id: UUID
  customerId: UUID
  businessId: UUID

  // Aggregated Balance Summary
  totalValueUsd: number  // Approximate total value across all balance types
  lastUpdatedAt: Date

  // Relationships
  points: LoyaltyTransaction[]  // Active points balance
  storeCredits: StoreCredit[]  // Active store credits
  digitalRewards: DigitalReward[]  // Active digital rewards

  // Configuration reference
  configurationId: UUID

  createdAt: Date
  updatedAt: Date
}
```

**Business Rules**:
- One wallet per customer per business
- Virtual aggregate (computed from underlying balances)
- Balance updates trigger cache invalidation
- Real-time sync across devices (WebSocket)

**Lifecycle**:
1. Created upon first loyalty interaction (auto-enrollment)
2. Updated whenever points/credits/rewards change
3. Never deleted (soft delete via customer deletion)

**Domain Events Published**:
- `wallet.balance_updated` (aggregated event for real-time sync)

---

### 9. StoreCredit

**Purpose**: Cash-equivalent credits earned through cashback, refunds, or promotions

**Attributes**:
```typescript
interface StoreCredit {
  id: UUID
  businessId: UUID
  customerId: UUID

  // Financial Details
  amount: Money  // Original amount issued
  currency: Currency  // USD, KHR, SGD, THB, VND, MYR, PHP, IDR
  balance: Money  // Remaining balance (amount - redeemed)

  // Issuance Details
  method: CreditMethod  // promotional, refund, cashback_reward, automated
  reason?: string
  issuedBy: UUID  // User ID (admin, system, partner)
  issuedAt: Date

  // Expiration Management
  expiresAt: Date
  gracePeriodEndsAt: Date
  status: CreditStatus  // active, expired, grace_period, fully_expired

  // Campaign/Reward References
  campaignId?: UUID
  rewardId?: UUID  // Links to RewardCatalog CASHBACK reward type

  // Metadata
  metadata: Record<string, any>

  // Audit Trail
  createdAt: Date
  updatedAt: Date

  // Relationships
  transactions: StoreCreditTransaction[]
}

enum CreditMethod {
  PROMOTIONAL = 'promotional',
  REFUND = 'refund',
  CASHBACK_REWARD = 'cashback_reward',
  AUTOMATED = 'automated'
}

enum CreditStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  GRACE_PERIOD = 'grace_period',
  FULLY_EXPIRED = 'fully_expired'
}
```

**Business Rules**:
- Balance cannot exceed original amount
- Balance cannot be negative
- Multi-currency support (no post-issuance conversion)
- FIFO redemption (earliest expiration first within same currency)
- Grace period: 30 days after expiration
- VAT/GST excluded from credit (customer pays tax separately)

**Lifecycle**:
1. Issued via admin portal, campaign, or reward redemption
2. Status: `active` (can redeem)
3. Expires after 12 months → `expired` (can still redeem during grace period)
4. Grace period ends → `fully_expired` (breakage recognized)

**Domain Events Published**:
- `store_credit.issued`
- `store_credit.redeemed`
- `store_credit.expired`
- `store_credit.breakage_recognized`

---

### 10. StoreCreditTransaction

**Purpose**: Immutable ledger of all store credit operations

**Attributes**:
```typescript
interface StoreCreditTransaction {
  id: UUID
  businessId: UUID
  creditId: UUID
  customerId: UUID

  // Transaction Details
  transactionType: CreditTransactionType  // issued, redeemed, expired, extended
  amount: Money
  currency: Currency
  balanceAfter: Money

  // External References
  externalTransactionId?: string  // e.g., order_id, refund_id

  // Metadata
  metadata: Record<string, any>

  // Audit Trail
  transactionDate: Date
  createdAt: Date
}

enum CreditTransactionType {
  ISSUED = 'issued',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  EXTENDED = 'extended'
}
```

**Business Rules**:
- Immutable after creation (audit trail)
- Positive amount for issued/extended, negative for redeemed/expired
- balanceAfter must match credit.balance after transaction
- Transactions must be ordered (sequence)

---

### 11. DigitalReward

**Purpose**: Promotional credits, referral bonuses, partner rewards

**Attributes**:
```typescript
interface DigitalReward {
  id: UUID
  businessId: UUID
  customerId: UUID

  // Financial Details
  amount: Money
  currency: Currency
  balance: Money

  // Issuance Details
  method: RewardMethod  // promotional, referral, campaign, partner
  reason?: string
  campaignId?: UUID
  partnerId?: UUID
  merchantId?: UUID  // For merchant-specific redemption
  issuedBy: UUID
  issuedAt: Date

  // Expiration Management
  expiresAt: Date
  gracePeriodEndsAt: Date
  status: RewardStatus  // active, expired, grace_period, fully_expired

  // Reward Catalog Reference
  rewardId?: UUID  // Links to RewardCatalog DIGITAL_GIFT reward type

  // Metadata
  metadata: Record<string, any>

  // Audit Trail
  createdAt: Date
  updatedAt: Date

  // Relationships
  transactions: DigitalRewardTransaction[]
}

enum RewardMethod {
  PROMOTIONAL = 'promotional',
  REFERRAL = 'referral',
  CAMPAIGN = 'campaign',
  PARTNER = 'partner'
}

enum RewardStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  GRACE_PERIOD = 'grace_period',
  FULLY_EXPIRED = 'fully_expired'
}
```

**Business Rules**:
- Balance cannot exceed original amount
- Balance cannot be negative
- Multi-currency support (no post-issuance conversion)
- FIFO redemption (earliest expiration first within same currency)
- Merchant-specific redemption (if merchantId present)
- Grace period: 30 days after expiration
- VAT/GST excluded from reward (customer pays tax separately)

**Lifecycle**:
1. Issued via campaign, referral, or partner promotion
2. Status: `active` (can redeem)
3. Expires after 12 months → `expired` (can still redeem during grace period)
4. Grace period ends → `fully_expired` (breakage recognized)

**Domain Events Published**:
- `digital_reward.issued`
- `digital_reward.redeemed`
- `digital_reward.expired`
- `digital_reward.breakage_recognized`

---

### 12. DigitalRewardTransaction

**Purpose**: Immutable ledger of all digital reward operations

**Attributes**:
```typescript
interface DigitalRewardTransaction {
  id: UUID
  businessId: UUID
  rewardId: UUID
  customerId: UUID

  // Transaction Details
  transactionType: RewardTransactionType  // issued, redeemed, expired, extended
  amount: Money
  currency: Currency
  balanceAfter: Money

  // External References
  externalTransactionId?: string  // e.g., order_id

  // Metadata
  metadata: Record<string, any>

  // Audit Trail
  transactionDate: Date
  createdAt: Date
}

enum RewardTransactionType {
  ISSUED = 'issued',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  EXTENDED = 'extended'
}
```

**Business Rules**:
- Immutable after creation (audit trail)
- Positive amount for issued/extended, negative for redeemed/expired
- balanceAfter must match reward.balance after transaction
- Transactions must be ordered (sequence)

---

### 13. WalletConfiguration

**Purpose**: Business-level wallet settings and redemption rules

**Attributes**:
```typescript
interface WalletConfiguration {
  id: UUID
  businessId: UUID

  // Depletion Order Configuration
  depletionOrder: DepletionRule[]
  expirationOverride: boolean  // If true, use expiring balances first

  // Redemption Rules
  minRedemptionPoints: number  // Minimum points for redemption
  minRedemptionStoreCredit: Money
  minRedemptionDigitalRewards: Money

  // Points Valuation (for total value calculation)
  pointsToUsdRate: number  // e.g., 0.01 (1 point = $0.01)

  // Multi-Tender Settings
  allowMultiTender: boolean
  allowPartialRedemption: boolean

  // Metadata
  metadata: Record<string, any>

  // Audit Trail
  createdAt: Date
  updatedAt: Date
}

interface DepletionRule {
  type: BalanceType  // points, store_credit, digital_rewards, cash
  priority: number  // Lower = higher priority
  conditions?: RuleConditions
}

interface RuleConditions {
  minTransactionAmount?: Money
  minRedemptionPoints?: number
  maxRedemptionPercentage?: number  // e.g., 50% max loyalty payment
}

enum BalanceType {
  POINTS = 'points',
  STORE_CREDIT = 'store_credit',
  DIGITAL_REWARDS = 'digital_rewards',
  CASH = 'cash'
}
```

**Business Rules**:
- One configuration per business
- Depletion order must include all balance types
- Priority values must be unique
- Conditions are optional (no conditions = always apply)

**Lifecycle**:
1. Created with default settings upon business creation
2. Updated by business admin via admin portal
3. Never deleted (updated with new config)

**Domain Events Published**:
- `wallet.configuration_updated`

---

## Entity Relationships

```
// Existing Relationships
LoyaltyProgram (1) ←→ (N) LoyaltyRule
LoyaltyProgram (1) ←→ (N) CustomerEnrollment
LoyaltyProgram (1) ←→ (N) Tier
LoyaltyProgram (N) ←→ (1) LoyaltyTemplate [optional]

CustomerEnrollment (1) ←→ (N) LoyaltyTransaction
CustomerEnrollment (1) ←→ (1) LoyaltyProgress
CustomerEnrollment (N) ←→ (1) Tier [current tier]

Customer (external) (1) ←→ (N) CustomerEnrollment
Business (external) (1) ←→ (N) LoyaltyProgram

// NEW: Wallet Relationships (v2.0.0)
Customer (1) ←→ (1) Wallet per Business
Business (1) ←→ (1) WalletConfiguration

Wallet (1) ←→ (N) LoyaltyTransaction [points balance]
Wallet (1) ←→ (N) StoreCredit
Wallet (1) ←→ (N) DigitalReward

StoreCredit (1) ←→ (N) StoreCreditTransaction
DigitalReward (1) ←→ (N) DigitalRewardTransaction

WalletConfiguration (1) ←→ (N) Wallet [configuration reference]

// Reward Catalog Integration
StoreCredit (N) ←→ (1) Reward [CASHBACK type]
DigitalReward (N) ←→ (1) Reward [DIGITAL_GIFT type]
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
- **NEW (v2.0.0)**:
  - `wallets` (virtual - computed from balances)
  - `store_credits`
  - `store_credit_transactions`
  - `digital_rewards`
  - `digital_reward_transactions`
  - `wallet_configuration`

## Indexes

Required indexes for performance:

**Existing Indexes**:
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

**NEW Wallet Indexes (v2.0.0)**:
```sql
-- Store Credit Indexes
CREATE INDEX idx_store_credits_customer_id ON store_credits(customer_id);
CREATE INDEX idx_store_credits_business_id ON store_credits(business_id);
CREATE INDEX idx_store_credits_status ON store_credits(status);
CREATE INDEX idx_store_credits_expires_at ON store_credits(expires_at);
CREATE INDEX idx_store_credits_currency ON store_credits(currency);

-- Composite index for balance queries (most common query)
CREATE INDEX idx_store_credits_customer_currency_status
  ON store_credits(customer_id, currency, status)
  WHERE status = 'active';

-- FIFO redemption index (critical path)
CREATE INDEX idx_store_credits_fifo
  ON store_credits(customer_id, currency, expires_at, status)
  WHERE status IN ('active', 'expired')
  INCLUDE (balance);

-- Expiration batch job index
CREATE INDEX idx_store_credits_expiration_job
  ON store_credits(expires_at, status)
  WHERE status IN ('active', 'expired');

-- Store Credit Transaction Indexes
CREATE INDEX idx_store_credit_txns_credit_id ON store_credit_transactions(credit_id);
CREATE INDEX idx_store_credit_txns_customer_id ON store_credit_transactions(customer_id);
CREATE INDEX idx_store_credit_txns_business_id ON store_credit_transactions(business_id);
CREATE INDEX idx_store_credit_txns_type ON store_credit_transactions(transaction_type);
CREATE INDEX idx_store_credit_txns_date ON store_credit_transactions(transaction_date);
CREATE INDEX idx_store_credit_txns_external_id ON store_credit_transactions(external_transaction_id)
  WHERE external_transaction_id IS NOT NULL;

-- Digital Reward Indexes (similar to store credit)
CREATE INDEX idx_digital_rewards_customer_id ON digital_rewards(customer_id);
CREATE INDEX idx_digital_rewards_business_id ON digital_rewards(business_id);
CREATE INDEX idx_digital_rewards_status ON digital_rewards(status);
CREATE INDEX idx_digital_rewards_expires_at ON digital_rewards(expires_at);
CREATE INDEX idx_digital_rewards_currency ON digital_rewards(currency);
CREATE INDEX idx_digital_rewards_partner_id ON digital_rewards(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX idx_digital_rewards_merchant_id ON digital_rewards(merchant_id) WHERE merchant_id IS NOT NULL;

-- Composite index for balance queries
CREATE INDEX idx_digital_rewards_customer_currency_status
  ON digital_rewards(customer_id, currency, status)
  WHERE status = 'active';

-- FIFO redemption index
CREATE INDEX idx_digital_rewards_fifo
  ON digital_rewards(customer_id, currency, expires_at, status)
  WHERE status IN ('active', 'expired')
  INCLUDE (balance);

-- Expiration batch job index
CREATE INDEX idx_digital_rewards_expiration_job
  ON digital_rewards(expires_at, status)
  WHERE status IN ('active', 'expired');

-- Digital Reward Transaction Indexes
CREATE INDEX idx_digital_reward_txns_reward_id ON digital_reward_transactions(reward_id);
CREATE INDEX idx_digital_reward_txns_customer_id ON digital_reward_transactions(customer_id);
CREATE INDEX idx_digital_reward_txns_business_id ON digital_reward_transactions(business_id);
CREATE INDEX idx_digital_reward_txns_type ON digital_reward_transactions(transaction_type);
CREATE INDEX idx_digital_reward_txns_date ON digital_reward_transactions(transaction_date);
CREATE INDEX idx_digital_reward_txns_external_id ON digital_reward_transactions(external_transaction_id)
  WHERE external_transaction_id IS NOT NULL;

-- Wallet Configuration Index
CREATE INDEX idx_wallet_config_business_id ON wallet_configuration(business_id);
```

## References

- [DOMAIN-OVERVIEW.md](./DOMAIN-OVERVIEW.md)
- [AGGREGATES.md](./AGGREGATES.md)
- [VALUE-OBJECTS.md](./VALUE-OBJECTS.md)
- **NEW (v2.0.0)**:
  - [/docs/requirements/features/store-credit/FEATURE-SPEC.md](../../features/store-credit/FEATURE-SPEC.md)
  - [/docs/requirements/features/gift-cards/FEATURE-SPEC.md](../../features/gift-cards/FEATURE-SPEC.md)
  - [/docs/requirements/features/unified-wallet/FEATURE-SPEC.md](../../features/unified-wallet/FEATURE-SPEC.md)
  - [/docs/requirements/features/unified-wallet/ARCHITECTURE-REVIEW.md](../../features/unified-wallet/ARCHITECTURE-REVIEW.md)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)
