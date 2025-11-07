# Loyalty Domain - Value Objects

**Domain**: Loyalty
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

Value Objects in the Loyalty domain are immutable objects defined by their attributes rather than identity. They encapsulate domain concepts and validation logic.

## Core Value Objects

### 1. PointBalance

**Purpose**: Represents a customer's point balance with expiration tracking

```typescript
class PointBalance {
  constructor(
    public readonly totalPoints: number,
    public readonly availablePoints: number,
    public readonly pendingPoints: number,
    public readonly expiringSoon: number, // Points expiring in next 30 days
    public readonly expiringAt?: Date
  ) {
    if (totalPoints < 0) throw new Error('Points cannot be negative');
    if (availablePoints > totalPoints) throw new Error('Available cannot exceed total');
  }

  public canRedeem(points: number): boolean {
    return this.availablePoints >= points;
  }

  public deduct(points: number): PointBalance {
    if (!this.canRedeem(points)) {
      throw new Error('Insufficient points');
    }
    return new PointBalance(
      this.totalPoints - points,
      this.availablePoints - points,
      this.pendingPoints,
      this.expiringSoon,
      this.expiringAt
    );
  }

  public add(points: number, expiresAt?: Date): PointBalance {
    return new PointBalance(
      this.totalPoints + points,
      this.availablePoints + points,
      this.pendingPoints,
      this.expiringSoon,
      expiresAt
    );
  }
}
```

**Invariants**:
- Total points ≥ 0
- Available points ≤ Total points
- Pending points ≥ 0

---

### 2. RuleConfiguration

**Purpose**: Type-safe configuration for different rule types

```typescript
// Points-Based Configuration
class PointsBasedConfig {
  constructor(
    public readonly pointsPerDollar: number,
    public readonly minPurchaseAmount: number,
    public readonly maxPointsPerTransaction?: number,
    public readonly excludedCategories?: string[]
  ) {
    if (pointsPerDollar <= 0) throw new Error('Points per dollar must be positive');
    if (minPurchaseAmount < 0) throw new Error('Min purchase cannot be negative');
  }

  public calculatePoints(amount: number): number {
    if (amount < this.minPurchaseAmount) return 0;
    const points = Math.floor(amount * this.pointsPerDollar);
    return this.maxPointsPerTransaction
      ? Math.min(points, this.maxPointsPerTransaction)
      : points;
  }
}

// Punch Card Configuration
class PunchCardConfig {
  constructor(
    public readonly requiredPunches: number,
    public readonly rewardType: RewardType,
    public readonly rewardValue: string
  ) {
    if (requiredPunches < 2 || requiredPunches > 50) {
      throw new Error('Required punches must be between 2 and 50');
    }
  }

  public isComplete(currentPunches: number): boolean {
    return currentPunches >= this.requiredPunches;
  }
}

// Amount Spent Configuration
class AmountSpentConfig {
  constructor(
    public readonly targetAmount: number,
    public readonly periodDays: number,
    public readonly rewardType: RewardType,
    public readonly rewardValue: string
  ) {
    if (targetAmount <= 0) throw new Error('Target amount must be positive');
    if (periodDays < 1) throw new Error('Period must be at least 1 day');
  }
}

// Tier-Based Configuration
class TierBasedConfig {
  constructor(
    public readonly tiers: TierDefinition[],
    public readonly evaluationPeriod: 'LIFETIME' | 'ROLLING_YEAR' | 'CALENDAR_YEAR'
  ) {
    if (tiers.length < 2) throw new Error('Must have at least 2 tiers');
    this.validateTierRanges(tiers);
  }

  private validateTierRanges(tiers: TierDefinition[]): void {
    const sorted = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].maxPoints && sorted[i].maxPoints! >= sorted[i + 1].minPoints) {
        throw new Error('Tier ranges cannot overlap');
      }
    }
  }
}

// Visit Frequency Configuration
class VisitFrequencyConfig {
  constructor(
    public readonly requiredVisits: number,
    public readonly periodDays: number,
    public readonly rewardType: RewardType,
    public readonly rewardValue: string
  ) {
    if (requiredVisits < 2) throw new Error('Must require at least 2 visits');
    if (periodDays < 1) throw new Error('Period must be at least 1 day');
  }
}

// Stamp Card Configuration
class StampCardConfig {
  constructor(
    public readonly requiredStamps: number,
    public readonly stampsPerVisit: number,
    public readonly rewardType: RewardType,
    public readonly rewardValue: string
  ) {
    if (requiredStamps < stampsPerVisit) {
      throw new Error('Required stamps must be >= stamps per visit');
    }
  }
}
```

---

### 3. EnrollmentSettings

**Purpose**: Configuration for customer enrollment behavior

```typescript
class EnrollmentSettings {
  constructor(
    public readonly autoEnroll: boolean,
    public readonly requireConsent: boolean,
    public readonly selfEnrollEnabled: boolean,
    public readonly maxEnrollments?: number,
    public readonly eligibilityCriteria?: EligibilityCriteria
  ) {}

  public canEnroll(customer: CustomerSnapshot): boolean {
    if (this.eligibilityCriteria) {
      return this.eligibilityCriteria.isMet(customer);
    }
    return true;
  }
}

class EligibilityCriteria {
  constructor(
    public readonly minAge?: number,
    public readonly minLifetimeSpend?: number,
    public readonly requiredTags?: string[],
    public readonly excludedTags?: string[]
  ) {}

  public isMet(customer: CustomerSnapshot): boolean {
    if (this.minAge && customer.age < this.minAge) return false;
    if (this.minLifetimeSpend && customer.lifetimeSpend < this.minLifetimeSpend) return false;
    if (this.requiredTags && !this.requiredTags.every(tag => customer.tags.includes(tag))) {
      return false;
    }
    if (this.excludedTags && this.excludedTags.some(tag => customer.tags.includes(tag))) {
      return false;
    }
    return true;
  }
}
```

---

### 4. RewardDefinition

**Purpose**: Defines what reward customers receive

```typescript
class RewardDefinition {
  constructor(
    public readonly type: RewardType,
    public readonly value: string | number,
    public readonly description: string,
    public readonly expiryDays?: number,
    public readonly restrictions?: RewardRestrictions
  ) {}

  public isValid(): boolean {
    switch (this.type) {
      case RewardType.FREE_ITEM:
        return typeof this.value === 'string' && this.value.length > 0;
      case RewardType.DISCOUNT_PERCENTAGE:
      case RewardType.DISCOUNT_AMOUNT:
        return typeof this.value === 'number' && this.value > 0;
      case RewardType.POINTS:
        return typeof this.value === 'number' && this.value > 0;
      default:
        return false;
    }
  }
}

enum RewardType {
  FREE_ITEM = 'FREE_ITEM',
  DISCOUNT_PERCENTAGE = 'DISCOUNT_PERCENTAGE',
  DISCOUNT_AMOUNT = 'DISCOUNT_AMOUNT',
  POINTS = 'POINTS',
  TIER_UPGRADE = 'TIER_UPGRADE'
}

class RewardRestrictions {
  constructor(
    public readonly minPurchaseAmount?: number,
    public readonly maxRedemptionsPerCustomer?: number,
    public readonly excludedProducts?: string[],
    public readonly validDays?: number[] // 0=Sunday, 1=Monday, etc.
  ) {}
}
```

---

### 5. ProgressSnapshot

**Purpose**: Immutable snapshot of customer progress

```typescript
class ProgressSnapshot {
  constructor(
    public readonly currentValue: number,
    public readonly targetValue: number,
    public readonly unit: string,
    public readonly percentageComplete: number,
    public readonly remainingToComplete: number,
    public readonly isCompleted: boolean,
    public readonly capturedAt: Date
  ) {}

  public static create(current: number, target: number, unit: string): ProgressSnapshot {
    const percentage = Math.min((current / target) * 100, 100);
    const remaining = Math.max(target - current, 0);
    const isCompleted = current >= target;

    return new ProgressSnapshot(
      current,
      target,
      unit,
      percentage,
      remaining,
      isCompleted,
      new Date()
    );
  }
}
```

---

### 6. TierBenefit

**Purpose**: Defines benefits for tier members

```typescript
class TierBenefit {
  constructor(
    public readonly type: BenefitType,
    public readonly value: string | number,
    public readonly description: string,
    public readonly isActive: boolean = true
  ) {}

  public apply(baseValue: number): number {
    switch (this.type) {
      case BenefitType.POINT_MULTIPLIER:
        return baseValue * (this.value as number);
      case BenefitType.DISCOUNT_PERCENTAGE:
        return baseValue * (1 - (this.value as number) / 100);
      default:
        return baseValue;
    }
  }
}

enum BenefitType {
  POINT_MULTIPLIER = 'POINT_MULTIPLIER',
  DISCOUNT_PERCENTAGE = 'DISCOUNT_PERCENTAGE',
  FREE_SHIPPING = 'FREE_SHIPPING',
  PRIORITY_SUPPORT = 'PRIORITY_SUPPORT',
  EXCLUSIVE_ACCESS = 'EXCLUSIVE_ACCESS',
  EARLY_ACCESS = 'EARLY_ACCESS'
}
```

---

### 7. DateRange

**Purpose**: Represents a period of time

```typescript
class DateRange {
  constructor(
    public readonly start: Date,
    public readonly end: Date
  ) {
    if (end < start) {
      throw new Error('End date must be after start date');
    }
  }

  public contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  public overlaps(other: DateRange): boolean {
    return this.start <= other.end && this.end >= other.start;
  }

  public durationDays(): number {
    return Math.floor((this.end.getTime() - this.start.getTime()) / (1000 * 60 * 60 * 24));
  }

  public static currentYear(): DateRange {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    return new DateRange(start, end);
  }

  public static rollingYear(): DateRange {
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    return new DateRange(start, now);
  }
}
```

---

### 8. Money

**Purpose**: Represents monetary values with currency

```typescript
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'USD'
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
    if (!this.isValidCurrency(currency)) throw new Error('Invalid currency');
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    if (this.amount < other.amount) throw new Error('Insufficient funds');
    return new Money(this.amount - other.amount, this.currency);
  }

  public multiply(multiplier: number): Money {
    return new Money(this.amount * multiplier, this.currency);
  }

  public greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error('Cannot operate on different currencies');
    }
  }

  private isValidCurrency(currency: string): boolean {
    return ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(currency);
  }
}
```

---

## Value Object Design Principles

1. **Immutability**: All value objects are immutable
2. **Self-Validation**: Constructors enforce invariants
3. **Equality by Value**: Two objects with same values are equal
4. **No Identity**: Value objects have no unique ID
5. **Behavior-Rich**: Encapsulate domain logic

## Usage Examples

```typescript
// Creating a point balance
const balance = new PointBalance(1000, 900, 100, 50, new Date('2025-12-31'));
const newBalance = balance.deduct(200); // Returns new instance

// Rule configuration
const config = new PointsBasedConfig(1.5, 10);
const points = config.calculatePoints(50); // Returns 75 points

// Enrollment settings
const settings = new EnrollmentSettings(true, false, true);
if (settings.canEnroll(customer)) {
  // Enroll customer
}

// Date range validation
const programPeriod = new DateRange(
  new Date('2025-01-01'),
  new Date('2025-12-31')
);
if (programPeriod.contains(new Date())) {
  // Program is active
}
```

## References

- [ENTITIES.md](./ENTITIES.md)
- [AGGREGATES.md](./AGGREGATES.md)
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-07
