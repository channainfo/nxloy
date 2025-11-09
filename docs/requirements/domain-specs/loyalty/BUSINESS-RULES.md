# Loyalty Domain - Business Rules

**Domain**: Loyalty
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)

## Overview

Business Rules are constraints and policies that govern the behavior of the Loyalty domain. They ensure data integrity, enforce business requirements, and maintain consistency.

**v2.0.0 Changes**:
- Added store credit business rules (SC-001 to SC-007)
- Added digital reward business rules (DR-001 to DR-007)
- Added wallet redemption rules (WR-001 to WR-005)
- Added distributed locking rule for concurrent redemptions

## Rule Categories

1. **Invariants**: Conditions that must ALWAYS be true
2. **Validation Rules**: Input validation before operations
3. **Business Constraints**: Business policy enforcement
4. **Calculation Rules**: Logic for point/progress computation
5. **Workflow Rules**: State transition constraints

---

## 1. Loyalty Program Rules

### PR-001: Program Name Uniqueness

**Rule**: A business cannot have two programs with the same name

**Type**: Validation Rule

**Enforcement**: Pre-save validation

```typescript
async validateUniqueName(businessId: UUID, name: string): Promise<void> {
  const existing = await this.programRepo.existsByBusinessAndName(businessId, name);
  if (existing) {
    throw new DuplicateProgramNameError(name);
  }
}
```

**Impact**: Prevents confusion for business owners and customers

---

### PR-002: Program Status Transitions

**Rule**: Programs can only transition through valid status paths

**Valid Transitions**:
- DRAFT → ACTIVE
- ACTIVE → PAUSED
- PAUSED → ACTIVE
- ACTIVE → ENDED
- PAUSED → ENDED

**Invalid Transitions**:
- DRAFT → PAUSED (must activate first)
- ENDED → any status (terminal state)
- DRAFT → ENDED (must activate first)

**Enforcement**: State machine in aggregate

```typescript
class LoyaltyProgramAggregate {
  activate(): void {
    if (this.status !== ProgramStatus.DRAFT) {
      throw new InvalidStatusTransitionError(this.status, ProgramStatus.ACTIVE);
    }
    this.status = ProgramStatus.ACTIVE;
  }
}
```

---

### PR-003: Active Program Requirements

**Rule**: Programs can only be activated if they meet requirements

**Requirements**:
1. Must have at least one rule configured
2. Must have valid enrollment settings
3. End date (if set) must be in the future
4. Rule configuration must be valid

**Enforcement**: Pre-activation validation

```typescript
activate(): void {
  if (this.rules.length === 0) {
    throw new CannotActivateError('Program must have at least one rule');
  }
  if (this.endDate && this.endDate < new Date()) {
    throw new CannotActivateError('End date must be in the future');
  }
  this.status = ProgramStatus.ACTIVE;
}
```

---

### PR-004: Program Modification Constraints

**Rule**: Active programs cannot have their rules modified

**Rationale**: Prevents changing rules that affect existing enrollments

**Workaround**: Pause program, modify rules, re-activate

**Enforcement**: Pre-save validation

```typescript
addRule(rule: LoyaltyRule): void {
  if (this.status === ProgramStatus.ACTIVE) {
    throw new CannotModifyActiveProgram('Cannot add rules to active program');
  }
  this.rules.push(rule);
}
```

---

### PR-005: End Date Validation

**Rule**: End date must be after start date

**Type**: Invariant

**Enforcement**: Value object constructor

```typescript
class DateRange {
  constructor(start: Date, end: Date) {
    if (end < start) {
      throw new InvalidDateRangeError('End date must be after start date');
    }
  }
}
```

---

## 2. Enrollment Rules

### ER-001: One Enrollment Per Customer Per Program

**Rule**: A customer can only be enrolled once in a program

**Rationale**: Prevents duplicate enrollments and balance tracking issues

**Enforcement**: Database unique constraint + pre-enrollment check

```sql
ALTER TABLE customer_enrollments
ADD CONSTRAINT unique_customer_program UNIQUE (customer_id, program_id);
```

```typescript
async enroll(customerId: UUID, programId: UUID): Promise<void> {
  const existing = await this.enrollmentRepo.existsByCustomerAndProgram(
    customerId,
    programId
  );
  if (existing) {
    throw new AlreadyEnrolledError(customerId, programId);
  }
}
```

---

### ER-002: Enrollment Eligibility

**Rule**: Customers must meet eligibility criteria to enroll

**Criteria**:
- Minimum age (if configured)
- Minimum lifetime spend (if configured)
- Required tags (if configured)
- No excluded tags

**Enforcement**: Pre-enrollment validation

```typescript
canEnroll(customer: CustomerSnapshot): boolean {
  if (this.minAge && customer.age < this.minAge) {
    return false;
  }
  if (this.minLifetimeSpend && customer.lifetimeSpend < this.minLifetimeSpend) {
    return false;
  }
  return true;
}
```

---

### ER-003: Active Program Enrollment

**Rule**: Customers can only enroll in ACTIVE programs

**Enforcement**: Pre-enrollment validation

```typescript
async enroll(customerId: UUID, programId: UUID): Promise<void> {
  const program = await this.programRepo.findById(programId);
  if (program.status !== ProgramStatus.ACTIVE) {
    throw new ProgramNotActiveError(programId);
  }
}
```

---

### ER-004: Enrollment Status Transitions

**Rule**: Enrollments can transition between valid states

**Valid Transitions**:
- ACTIVE → PAUSED
- PAUSED → ACTIVE
- ACTIVE → CANCELLED
- ACTIVE → COMPLETED (when program ends)

**Invalid Transitions**:
- CANCELLED → any status (terminal state)
- COMPLETED → any status (terminal state)

---

## 3. Point Rules

### PT-001: Non-Negative Balance

**Rule**: Point balance can never be negative

**Type**: Invariant

**Enforcement**: Aggregate + value object

```typescript
class PointBalance {
  constructor(totalPoints: number, availablePoints: number) {
    if (totalPoints < 0) {
      throw new InvalidBalanceError('Points cannot be negative');
    }
    if (availablePoints > totalPoints) {
      throw new InvalidBalanceError('Available cannot exceed total');
    }
  }
}

redeemPoints(points: number): void {
  if (!this.balance.canRedeem(points)) {
    throw new InsufficientPointsError(this.balance.availablePoints, points);
  }
  this.balance = this.balance.deduct(points);
}
```

---

### PT-002: Point Earning on Active Enrollments Only

**Rule**: Points can only be earned on ACTIVE enrollments

**Enforcement**: Pre-earning validation

```typescript
earnPoints(points: number): void {
  if (this.status !== EnrollmentStatus.ACTIVE) {
    throw new EnrollmentNotActiveError('Can only earn points on active enrollments');
  }
  this.balance = this.balance.add(points);
}
```

---

### PT-003: Point Expiration

**Rule**: Points expire based on program configuration

**Default**: 12 months from earning date

**Enforcement**: Scheduled job + domain service

```typescript
class PointExpirationService {
  async processExpiredPoints(): Promise<void> {
    const expiringTransactions = await this.transactionRepo.findExpiringBefore(
      new Date()
    );
    for (const txn of expiringTransactions) {
      await this.expireTransaction(txn);
    }
  }
}
```

---

### PT-004: Transaction Immutability

**Rule**: Transactions cannot be modified after creation

**Rationale**: Maintains audit trail integrity

**Enforcement**: No update methods on transaction entity

```typescript
class LoyaltyTransaction {
  // Only getters, no setters
  get points(): number {
    return this._points;
  }
}
```

---

### PT-005: Minimum Point Earning

**Rule**: Points earned must be positive (> 0)

**Enforcement**: Pre-earning validation

```typescript
earnPoints(points: number): void {
  if (points <= 0) {
    throw new InvalidPointAmountError('Points must be positive');
  }
}
```

---

## 4. Rule Configuration Rules

### RC-001: Points Per Dollar Validation

**Rule**: Points per dollar must be positive

**Type**: Validation Rule

**Enforcement**: Value object constructor

```typescript
class PointsBasedConfig {
  constructor(pointsPerDollar: number, minPurchaseAmount: number) {
    if (pointsPerDollar <= 0) {
      throw new InvalidConfigError('Points per dollar must be positive');
    }
    if (minPurchaseAmount < 0) {
      throw new InvalidConfigError('Min purchase cannot be negative');
    }
  }
}
```

---

### RC-002: Punch Card Range

**Rule**: Punch cards must require between 2 and 50 punches

**Rationale**: Too few = no engagement, too many = customer frustration

**Enforcement**: Value object constructor

```typescript
class PunchCardConfig {
  constructor(requiredPunches: number) {
    if (requiredPunches < 2 || requiredPunches > 50) {
      throw new InvalidConfigError('Required punches must be between 2 and 50');
    }
  }
}
```

---

### RC-003: Amount Spent Target

**Rule**: Target amount must be positive

**Enforcement**: Value object constructor

```typescript
class AmountSpentConfig {
  constructor(targetAmount: number, periodDays: number) {
    if (targetAmount <= 0) {
      throw new InvalidConfigError('Target amount must be positive');
    }
    if (periodDays < 1) {
      throw new InvalidConfigError('Period must be at least 1 day');
    }
  }
}
```

---

### RC-004: Visit Frequency Constraints

**Rule**: Visit frequency must require at least 2 visits

**Enforcement**: Value object constructor

```typescript
class VisitFrequencyConfig {
  constructor(requiredVisits: number, periodDays: number) {
    if (requiredVisits < 2) {
      throw new InvalidConfigError('Must require at least 2 visits');
    }
  }
}
```

---

## 5. Tier Rules

### TR-001: Tier Range Validation

**Rule**: Tier point ranges cannot overlap

**Example**:
- Bronze: 0-500
- Silver: 501-1000
- Gold: 1001+

**Invalid**:
- Bronze: 0-600
- Silver: 500-1000 (overlap at 500-600)

**Enforcement**: Aggregate validation

```typescript
private validateTierRanges(tiers: Tier[]): void {
  const sorted = [...tiers].sort((a, b) => a.level - b.level);
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (current.maxPoints && current.maxPoints >= next.minPoints) {
      throw new OverlappingTierRangesError();
    }
  }
}
```

---

### TR-002: Tier Level Uniqueness

**Rule**: Each tier in a program must have unique level number

**Enforcement**: Database constraint + validation

```sql
ALTER TABLE tiers
ADD CONSTRAINT unique_program_level UNIQUE (program_id, level);
```

---

### TR-003: Tier Upgrade Permanence

**Rule**: Tier upgrades are permanent (no downgrades by default)

**Rationale**: Customer satisfaction and retention

**Enforcement**: Domain service

```typescript
async checkAndUpgradeTier(enrollment: CustomerEnrollmentAggregate): Promise<void> {
  const currentTier = await this.getTier(enrollment.currentTierId);
  const qualifyingTier = await this.getQualifyingTier(enrollment);

  if (qualifyingTier && qualifyingTier.level > currentTier.level) {
    enrollment.upgradeTier(qualifyingTier.id, qualifyingTier.name);
  }
  // No downgrade logic
}
```

---

### TR-004: Minimum Two Tiers

**Rule**: Tier-based programs must have at least 2 tiers

**Rationale**: Single tier defeats the purpose of tiering

**Enforcement**: Configuration validation

```typescript
class TierBasedConfig {
  constructor(tiers: TierDefinition[]) {
    if (tiers.length < 2) {
      throw new InvalidConfigError('Must have at least 2 tiers');
    }
  }
}
```

---

## 6. Template Rules

### TM-001: Template Immutability

**Rule**: Templates cannot be modified after creation

**Rationale**: Existing programs depend on original template definition

**Workaround**: Create new template version

**Enforcement**: Repository (no update methods)

---

### TM-002: Template Popularity Increment

**Rule**: Template popularity increments when used to create program

**Enforcement**: Domain service

```typescript
async createFromTemplate(templateId: UUID): Promise<LoyaltyProgram> {
  const template = await this.templateRepo.findById(templateId);
  const program = this.createProgram(template);

  template.incrementPopularity();
  await this.templateRepo.save(template);

  return program;
}
```

---

## 7. Calculation Rules

### CR-001: Points-Based Calculation

**Formula**: `points = floor(amount * pointsPerDollar)`

**Example**: $25.50 × 1.5 = 38.25 → 38 points (floor)

**Enforcement**: Rule engine

```typescript
calculatePoints(amount: number, config: PointsBasedConfig): number {
  if (amount < config.minPurchaseAmount) {
    return 0;
  }
  return Math.floor(amount * config.pointsPerDollar);
}
```

---

### CR-002: Tier Benefit Application

**Rule**: Tier benefits apply AFTER base point calculation

**Example**:
1. Base calculation: $50 × 1 point/$1 = 50 points
2. Silver tier multiplier: 1.5x
3. Final points: 50 × 1.5 = 75 points

**Enforcement**: Domain service

```typescript
async applyTierBenefits(enrollment: Enrollment, basePoints: number): Promise<number> {
  const tier = await this.getTier(enrollment.currentTierId);
  const multiplier = tier.getPointMultiplier();
  return Math.floor(basePoints * multiplier);
}
```

---

### CR-003: Minimum Purchase Enforcement

**Rule**: Transactions below minimum purchase amount earn 0 points

**Enforcement**: Rule engine

```typescript
if (amount < config.minPurchaseAmount) {
  return 0;
}
```

---

## 8. Concurrency Rules

### CC-001: Optimistic Locking

**Rule**: Use version numbers to prevent lost updates

**Enforcement**: Database + repository

```sql
UPDATE customer_enrollments
SET balance = $1, version = version + 1
WHERE id = $2 AND version = $3;
```

```typescript
async save(enrollment: CustomerEnrollmentAggregate): Promise<void> {
  const result = await this.prisma.customerEnrollment.updateMany({
    where: {
      id: enrollment.id,
      version: enrollment.version,
    },
    data: {
      balance: enrollment.balance.totalPoints,
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    throw new ConcurrentUpdateError('Enrollment was modified by another transaction');
  }
}
```

---

## 9. Multi-Tenancy Rules

### MT-001: Business Isolation

**Rule**: All queries must be scoped to businessId

**Enforcement**: Query filters

```typescript
async findActivePrograms(businessId: UUID): Promise<LoyaltyProgram[]> {
  return await this.prisma.loyaltyProgram.findMany({
    where: {
      businessId, // ALWAYS required
      status: 'ACTIVE',
    },
  });
}
```

---

### MT-002: Cross-Business Enrollment Prevention

**Rule**: Customers cannot enroll in programs from different businesses (unless partner network)

**Enforcement**: Pre-enrollment validation

---

## 10. Performance Rules

### PF-001: Response Time SLA

**Rule**: Earn/redeem operations must complete in < 200ms (p95)

**Enforcement**: Monitoring + alerts

```typescript
@Timeout(200)
async earnPoints(customerId: UUID, programId: UUID): Promise<void> {
  // Implementation with timeout
}
```

---

### PF-002: Cache Template List

**Rule**: Template list must be cached for 5 minutes

**Enforcement**: Repository caching layer

```typescript
async findAll(): Promise<LoyaltyTemplate[]> {
  const cached = await this.cache.get('templates:all');
  if (cached) return cached;

  const templates = await this.prisma.loyaltyRuleTemplate.findMany();
  await this.cache.set('templates:all', templates, 300); // 5 min
  return templates;
}
```

---

## 11. Store Credit Rules (NEW v2.0.0)

### SC-001: Non-Negative Credit Balance

**Rule**: Store credit balance can never be negative

**Type**: Invariant

**Enforcement**: Aggregate validation

```typescript
class StoreCreditAggregate {
  private validateInvariants(): void {
    if (this.balance.amount < 0) {
      throw new Error('Balance cannot be negative');
    }
    if (this.balance.greaterThan(this.amount)) {
      throw new Error('Balance cannot exceed original amount');
    }
  }
}
```

---

### SC-002: FIFO Redemption Order

**Rule**: Store credits must be redeemed in FIFO order (earliest expiration first)

**Rationale**: Maximize utilization, reduce breakage, improve customer satisfaction

**Enforcement**: Service layer

```typescript
class StoreCreditService {
  async redeem(
    customerId: UUID,
    amountToRedeem: Money,
    currency: string
  ): Promise<RedemptionResult> {
    // Fetch active credits sorted by expiration (FIFO)
    const credits = await this.creditRepository.findActive({
      customerId,
      currency,
      sortBy: 'expires_at ASC'  // Earliest expiration first
    });

    // Deplete credits in FIFO order
    let remaining = amountToRedeem.amount;
    const creditsUsed: CreditUsage[] = [];

    for (const credit of credits) {
      if (remaining <= 0) break;

      const amountToUse = Math.min(credit.balance.amount, remaining);
      const creditAggregate = await this.toAggregate(credit);

      creditAggregate.redeem(new Money(amountToUse, currency));
      await this.repository.save(creditAggregate);

      creditsUsed.push({
        creditId: credit.id,
        amountUsed: new Money(amountToUse, currency),
        balanceRemaining: credit.balance.subtract(new Money(amountToUse, currency))
      });

      remaining -= amountToUse;
    }

    return { creditsUsed, totalRedeemed: amountToRedeem };
  }
}
```

---

### SC-003: Currency Matching

**Rule**: Redemption currency must match credit currency

**Rationale**: No post-issuance currency conversion allowed

**Enforcement**: Aggregate validation

```typescript
redeem(amountToRedeem: Money, externalTransactionId?: string): void {
  if (amountToRedeem.currency !== this.balance.currency) {
    throw new Error(
      `Currency mismatch: credit is ${this.balance.currency}, ` +
      `redemption is ${amountToRedeem.currency}`
    );
  }
}
```

---

### SC-004: Expiration Status Validation

**Rule**: Store credits can only be redeemed if status is ACTIVE or EXPIRED (grace period)

**Rationale**: FULLY_EXPIRED credits are breakage (recognized as revenue)

**Enforcement**: Aggregate validation

```typescript
public isRedeemable(): boolean {
  return this.status === CreditStatus.ACTIVE ||
         this.status === CreditStatus.EXPIRED;
}

redeem(amountToRedeem: Money): void {
  if (!this.isRedeemable()) {
    throw new Error(`Cannot redeem ${this.status} credit`);
  }
}
```

---

### SC-005: Expiration Policy Enforcement

**Rule**: Store credits must expire within 12 months + 30-day grace period

**Rationale**: ASEAN compliance (Cambodia, Singapore standards)

**Default Configuration**:
- Expiration: 12 months from issuance
- Grace period: 30 days after expiration
- Notifications: 30 days, 7 days, 1 day before expiration

**Enforcement**: Value object + domain service

```typescript
class ExpirationPolicy {
  public static default(): ExpirationPolicy {
    return new ExpirationPolicy(
      12,        // 12 months expiration
      30,        // 30 days grace period
      [30, 7, 1] // Notify at 30, 7, and 1 day before expiration
    );
  }

  public calculateExpirationDate(issuedAt: Date): Date {
    const expiresAt = new Date(issuedAt);
    expiresAt.setMonth(expiresAt.getMonth() + this.expirationMonths);
    return expiresAt;
  }

  public calculateGracePeriodEnd(expiresAt: Date): Date {
    const gracePeriodEnds = new Date(expiresAt);
    gracePeriodEnds.setDate(gracePeriodEnds.getDate() + this.gracePeriodDays);
    return gracePeriodEnds;
  }
}
```

---

### SC-006: Breakage Revenue Recognition

**Rule**: Breakage revenue is recognized when credit reaches FULLY_EXPIRED status

**Accounting Standard**: IFRS 15 / SFRS(I) 15 (Revenue from Contracts with Customers)

**Timing**: After grace period ends

**Enforcement**: Domain service + scheduled job

```typescript
class StoreCreditExpirationService {
  async processFullExpiration(creditId: UUID): Promise<void> {
    const credit = await this.repository.findById(creditId);
    const aggregate = this.toAggregate(credit);

    if (new Date() >= credit.gracePeriodEndsAt) {
      // Mark as fully expired (triggers breakage event)
      aggregate.markFullyExpired();
      await this.repository.save(aggregate);

      // Event handler will recognize breakage revenue
      const events = aggregate.getDomainEvents();
      await this.eventBus.publishAll(events);
      aggregate.clearDomainEvents();
    }
  }
}
```

---

### SC-007: Extension Authorization

**Rule**: Only authorized personnel can extend credit expiration dates

**Rationale**: Prevent unauthorized gift of value to customers

**Enforcement**: Authorization guard + audit trail

```typescript
@UseGuards(AuthorizationGuard)
@RequiresRole('STORE_MANAGER', 'CUSTOMER_SERVICE_MANAGER')
async extendCredit(
  @CurrentUser() user: User,
  creditId: UUID,
  additionalMonths: number,
  reason: string
): Promise<void> {
  const credit = await this.repository.findById(creditId);
  const aggregate = this.toAggregate(credit);

  aggregate.extendExpiration(additionalMonths, user.id, reason);
  await this.repository.save(aggregate);

  // Audit log created via domain event
  const events = aggregate.getDomainEvents();
  await this.eventBus.publishAll(events);
}
```

---

## 12. Digital Reward Rules (NEW v2.0.0)

### DR-001: Merchant Restriction Enforcement

**Rule**: Merchant-specific rewards can only be redeemed at designated merchant

**Rationale**: Partnership agreements and reward targeting

**Enforcement**: Aggregate validation

```typescript
public redeem(
  amountToRedeem: Money,
  redeemingMerchantId: string | null,
  externalTransactionId?: string
): void {
  // Validate merchant restriction
  if (this.merchantId && this.merchantId !== redeemingMerchantId) {
    throw new Error(
      `This reward can only be redeemed at merchant ${this.merchantId}, ` +
      `not ${redeemingMerchantId}`
    );
  }
}
```

**Example**:
```typescript
// Generic reward (no merchant restriction)
const genericReward = DigitalRewardAggregate.issue({
  merchantId: null,  // Redeemable anywhere
  // ...
});

// Merchant-specific reward
const starbucksReward = DigitalRewardAggregate.issue({
  merchantId: 'merchant_starbucks_123',  // Only Starbucks
  // ...
});
```

---

### DR-002: Loyalty Program Benefit Structure

**Rule**: Digital rewards MUST be structured as loyalty program benefits (not purchased gift cards)

**Rationale**: Regulatory compliance (ASEAN, especially Philippines Gift Check Act)

**Enforcement**: Issuance method validation

```typescript
enum RewardMethod {
  PROMOTIONAL = 'promotional',      // ✅ OK - Marketing campaign
  REFERRAL = 'referral',            // ✅ OK - Referral reward
  MILESTONE = 'milestone',          // ✅ OK - Achievement reward
  COMPENSATION = 'compensation',    // ✅ OK - Customer service gesture
  // PURCHASED = 'purchased',       // ❌ NOT ALLOWED in Phase 1
}

public static issue(
  businessId: UUID,
  customerId: UUID,
  amount: Money,
  method: RewardMethod,
  // ...
): DigitalRewardAggregate {
  if (method === 'purchased') {
    throw new Error(
      'Purchased digital rewards not supported in Phase 1. ' +
      'Use promotional/referral/milestone/compensation methods only.'
    );
  }
  // ...
}
```

---

### DR-003: Partner Network Redemption

**Rule**: Partner rewards can be redeemed at partner merchant locations

**Enforcement**: Service layer validation

```typescript
class DigitalRewardService {
  async redeem(request: RedeemRequest): Promise<RedemptionResult> {
    const rewards = await this.findEligibleRewards(
      request.customerId,
      request.currency,
      request.merchantId
    );

    // Filter by merchant eligibility
    const eligibleRewards = rewards.filter(reward => {
      if (reward.merchantId === null) {
        return true;  // Generic reward (redeemable anywhere)
      }

      if (reward.merchantId === request.merchantId) {
        return true;  // Exact merchant match
      }

      // Check partner network
      if (reward.partnerId) {
        return this.partnerService.isPartnerMerchant(
          reward.partnerId,
          request.merchantId
        );
      }

      return false;
    });

    if (eligibleRewards.length === 0) {
      throw new Error(
        `Customer has digital rewards in ${request.currency}, but none are ` +
        `redeemable at merchant ${request.merchantId}.`
      );
    }

    return this.processFifoRedemption(eligibleRewards, request.amount);
  }
}
```

---

### DR-004: FIFO Redemption with Merchant Priority

**Rule**: Digital rewards redeem in FIFO order, merchant-specific before generic

**Rationale**: Maximize merchant-specific reward utilization before generic

**Enforcement**: Service layer sorting

```typescript
async findEligibleRewards(
  customerId: UUID,
  currency: string,
  merchantId: string
): Promise<DigitalReward[]> {
  const rewards = await this.repository.findActive({
    customerId,
    currency,
    sortBy: [
      // 1. Merchant-specific rewards first (exact match)
      { merchantId: merchantId, order: 'DESC' },
      // 2. Then by earliest expiration (FIFO)
      { expiresAt: 'ASC' }
    ]
  });

  return rewards;
}
```

---

### DR-005: Currency Immutability

**Rule**: Digital reward currency cannot be changed after issuance

**Rationale**: No post-issuance currency conversion allowed

**Enforcement**: Immutable value object

```typescript
class DigitalRewardAggregate {
  constructor(
    // ...
    private readonly amount: Money,  // Immutable
    private balance: Money,  // Mutable (decreases with redemptions)
    // ...
  ) {}

  // No setCurrency() method
  // No convertCurrency() method
}
```

---

### DR-006: Balance Tracking Accuracy

**Rule**: Balance must always equal original amount minus total redemptions

**Type**: Invariant

**Enforcement**: Aggregate validation

```typescript
private validateInvariants(): void {
  const totalRedeemed = this.transactions
    .filter(t => t.type === RewardTransactionType.REDEEMED)
    .reduce((sum, t) => sum + t.amount.amount, 0);

  const expectedBalance = this.amount.amount - totalRedeemed;

  if (Math.abs(this.balance.amount - expectedBalance) > 0.01) {
    throw new Error('Balance mismatch: balance does not match amount - redemptions');
  }
}
```

---

### DR-007: Expiration Grace Period

**Rule**: Digital rewards follow same expiration policy as store credit

**Configuration**:
- Default expiration: 12 months
- Grace period: 30 days
- Notifications: 30, 7, 1 days before expiration

**Enforcement**: Same ExpirationPolicy value object as store credit

```typescript
const reward = DigitalRewardAggregate.issue(
  businessId,
  customerId,
  amount,
  method,
  issuedBy,
  ExpirationPolicy.default(),  // Same as store credit
  // ...
);
```

---

## 13. Wallet Redemption Rules (NEW v2.0.0)

### WR-001: Depletion Order Configuration

**Rule**: Wallet redemptions must follow configured depletion order

**Default Order**:
1. Digital Rewards (earliest expiration)
2. Store Credit (earliest expiration)
3. Points (earliest expiration)
4. Cash

**Rationale**: Maximize loyalty asset utilization, reduce breakage

**Enforcement**: Domain service

```typescript
class WalletRedemptionService {
  async execute(
    customerId: UUID,
    businessId: UUID,
    cartTotal: Money,
    depletionOrder?: DepletionOrder
  ): Promise<WalletRedemptionResult> {
    const order = depletionOrder || DepletionOrder.default();

    // Process redemption in configured order
    for (const rule of order.rules.sort((a, b) => a.priority - b.priority)) {
      if (!order.canUseBalanceType(rule.type, cartTotal, remainingAmount)) {
        continue;  // Skip this balance type
      }

      // Redeem from this balance type
      await this.redeemBalanceType(rule.type, remainingAmount);
    }
  }
}
```

---

### WR-002: Distributed Locking Requirement

**Rule**: All wallet redemptions MUST acquire distributed lock before execution

**Rationale**: Prevent double-spend in concurrent redemption scenarios

**Enforcement**: Service layer (Redis Redlock)

```typescript
class WalletRedemptionService {
  async execute(
    customerId: UUID,
    businessId: UUID,
    cartTotal: Money
  ): Promise<WalletRedemptionResult> {
    // Create lock key per customer + currency
    const lockKey = `wallet:redemption:${customerId}:${cartTotal.currency}`;

    // Acquire lock with 5-second TTL
    const lock = await this.redlock.acquire([lockKey], 5000);

    try {
      // Critical section: Check balance and execute redemption
      return await this.executeRedemption(customerId, cartTotal);
    } finally {
      // Always release lock
      await lock.release();
    }
  }
}
```

**Lock Configuration**:
- **Scope**: Per customer + currency
- **TTL**: 5 seconds
- **Retry**: 3 attempts with 200ms delay
- **Failure Mode**: Reject redemption if lock cannot be acquired

---

### WR-003: Saga Pattern for Multi-Tender

**Rule**: Multi-tender redemptions MUST use Saga pattern with compensating transactions

**Rationale**: Ensure atomicity across multiple balance types (eventual consistency)

**Enforcement**: Domain service

```typescript
class WalletRedemptionService {
  async execute(request: WalletRedemptionRequest): Promise<WalletRedemptionResponse> {
    const sagaId = generateUUID();
    const compensations: Array<() => Promise<void>> = [];

    try {
      // Step 1: Redeem digital rewards
      const drResult = await this.digitalRewardService.redeem({...});
      compensations.push(async () => {
        await this.digitalRewardService.reverseRedemption(drResult.transactionId);
      });

      // Step 2: Redeem store credit
      const scResult = await this.storeCreditService.redeem({...});
      compensations.push(async () => {
        await this.storeCreditService.reverseRedemption(scResult.transactionId);
      });

      // Step 3: Redeem points
      const ptsResult = await this.pointsService.redeem({...});
      compensations.push(async () => {
        await this.pointsService.reverseRedemption(ptsResult.transactionId);
      });

      // All succeeded
      return { sagaId, breakdown, ... };

    } catch (error) {
      // Execute compensations (rollback)
      for (const compensate of compensations.reverse()) {
        await this.executeWithTimeout(compensate, 5000);
      }
      throw new WalletRedemptionError(`Saga ${sagaId} failed: ${error.message}`);
    }
  }
}
```

---

### WR-004: Redemption Percentage Limits

**Rule**: Individual balance types may have maximum redemption percentage limits

**Example**: "Points can only cover up to 50% of cart total"

**Enforcement**: DepletionOrder value object

```typescript
class DepletionOrder {
  public canUseBalanceType(
    type: BalanceType,
    cartTotal: Money,
    remainingAmount: Money
  ): boolean {
    const rule = this.rules.find(r => r.type === type);
    if (!rule || !rule.conditions) return true;

    // Check max redemption percentage
    if (rule.conditions.maxRedemptionPercentage) {
      const maxRedemption = cartTotal.multiply(
        rule.conditions.maxRedemptionPercentage / 100
      );
      const alreadyRedeemed = cartTotal.subtract(remainingAmount);

      if (alreadyRedeemed.greaterThanOrEqual(maxRedemption)) {
        return false;  // Already hit max percentage
      }
    }

    return true;
  }
}

// Example usage
const depletionOrder = new DepletionOrder([
  {
    type: BalanceType.POINTS,
    priority: 1,
    conditions: {
      maxRedemptionPercentage: 50  // Points can only cover 50% of cart
    }
  },
  { type: BalanceType.STORE_CREDIT, priority: 2 },
  { type: BalanceType.CASH, priority: 3 }
], true);
```

---

### WR-005: Minimum Transaction Amount

**Rule**: Balance types may have minimum transaction amount requirements

**Example**: "Store credit only applies to orders $10+"

**Enforcement**: DepletionOrder value object

```typescript
class DepletionOrder {
  public canUseBalanceType(
    type: BalanceType,
    cartTotal: Money,
    remainingAmount: Money
  ): boolean {
    const rule = this.rules.find(r => r.type === type);
    if (!rule || !rule.conditions) return true;

    // Check min transaction amount
    if (rule.conditions.minTransactionAmount) {
      if (cartTotal.lessThan(rule.conditions.minTransactionAmount)) {
        return false;
      }
    }

    return true;
  }
}

// Example usage
const depletionOrder = new DepletionOrder([
  {
    type: BalanceType.STORE_CREDIT,
    priority: 1,
    conditions: {
      minTransactionAmount: new Money(10, 'USD')  // $10 minimum
    }
  },
  { type: BalanceType.POINTS, priority: 2 }
], true);
```

---

## References

- [DOMAIN-OVERVIEW.md](./DOMAIN-OVERVIEW.md)
- [AGGREGATES.md](./AGGREGATES.md) - Aggregate implementations for wallet features
- [VALUE-OBJECTS.md](./VALUE-OBJECTS.md) - WalletBalance, DepletionOrder, ExpirationPolicy
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md) - Cross-aggregate wallet services
- [ENTITIES.md](./ENTITIES.md) - StoreCredit, DigitalReward entities

**Feature Specifications**:
- [Store Credit Feature Spec](../../features/store-credit/FEATURE-SPEC.md)
- [Gift Cards Feature Spec](../../features/gift-cards/FEATURE-SPEC.md)
- [Unified Wallet Feature Spec](../../features/unified-wallet/FEATURE-SPEC.md)
- [Unified Wallet Architecture Review](../../features/unified-wallet/ARCHITECTURE-REVIEW.md)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)
