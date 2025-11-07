# Loyalty Domain - Business Rules

**Domain**: Loyalty
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

Business Rules are constraints and policies that govern the behavior of the Loyalty domain. They ensure data integrity, enforce business requirements, and maintain consistency.

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

## References

- [DOMAIN-OVERVIEW.md](./DOMAIN-OVERVIEW.md)
- [AGGREGATES.md](./AGGREGATES.md)
- [VALUE-OBJECTS.md](./VALUE-OBJECTS.md)
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-07
