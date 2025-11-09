# Loyalty Domain - Value Objects

**Domain**: Loyalty
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)

## Overview

Value Objects in the Loyalty domain are immutable objects defined by their attributes rather than identity. They encapsulate domain concepts and validation logic.

**v2.0.0 Changes**:
- Updated `Money` value object to support ASEAN currencies (KHR, SGD, THB, VND, MYR, PHP, IDR)
- Added `WalletBalance` value object for unified balance representation
- Added `DepletionOrder` value object for multi-tender redemption rules
- Added `ExpirationPolicy` value object for credit/reward expiration management
- Added `MultiCurrencyBalance` value object for currency-grouped balances

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

### 8. Money (Updated v2.0.0)

**Purpose**: Represents monetary values with currency (ASEAN currencies supported)

```typescript
type Currency = 'USD' | 'KHR' | 'SGD' | 'THB' | 'VND' | 'MYR' | 'PHP' | 'IDR' | 'EUR' | 'GBP';

class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency = 'USD'
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
    if (!this.isValidCurrency(currency)) throw new Error('Invalid currency');
    this.validatePrecision();
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

  public greaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount >= other.amount;
  }

  public lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  public equals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  public toDisplay(): string {
    const decimals = this.getDecimalPlaces();
    return `${this.getCurrencySymbol()}${this.amount.toFixed(decimals)}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot operate on different currencies: ${this.currency} vs ${other.currency}`);
    }
  }

  private isValidCurrency(currency: string): boolean {
    return ['USD', 'KHR', 'SGD', 'THB', 'VND', 'MYR', 'PHP', 'IDR', 'EUR', 'GBP'].includes(currency);
  }

  private validatePrecision(): void {
    const decimals = this.getDecimalPlaces();
    const rounded = parseFloat(this.amount.toFixed(decimals));
    if (rounded !== this.amount) {
      throw new Error(`Amount has too many decimal places for ${this.currency} (max: ${decimals})`);
    }
  }

  private getDecimalPlaces(): number {
    // ASEAN currencies with 0 decimals: KHR, VND, IDR
    if (['KHR', 'VND', 'IDR'].includes(this.currency)) {
      return 0;
    }
    // All other currencies: 2 decimals
    return 2;
  }

  private getCurrencySymbol(): string {
    const symbols: Record<Currency, string> = {
      'USD': '$',
      'KHR': '៛',
      'SGD': 'S$',
      'THB': '฿',
      'VND': '₫',
      'MYR': 'RM',
      'PHP': '₱',
      'IDR': 'Rp',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[this.currency] || this.currency;
  }

  public static zero(currency: Currency = 'USD'): Money {
    return new Money(0, currency);
  }

  public static fromCents(cents: number, currency: Currency = 'USD'): Money {
    if (['KHR', 'VND', 'IDR'].includes(currency)) {
      // These currencies don't use cents/decimals
      return new Money(cents, currency);
    }
    return new Money(cents / 100, currency);
  }
}
```

**Invariants** (v2.0.0):
- Amount ≥ 0
- Currency must be valid ASEAN or international currency
- Decimal precision: 0 for KHR/VND/IDR, 2 for all others
- Cannot mix currencies in operations

---

### 9. WalletBalance (NEW v2.0.0)

**Purpose**: Unified representation of all customer loyalty assets

```typescript
class WalletBalance {
  constructor(
    public readonly points: PointBalance,
    public readonly storeCredit: MultiCurrencyBalance,
    public readonly digitalRewards: MultiCurrencyBalance,
    public readonly totalValueUsd: Money,
    public readonly lastUpdatedAt: Date
  ) {}

  public hasAnyBalance(): boolean {
    return this.points.availablePoints > 0 ||
           this.storeCredit.hasAnyBalance() ||
           this.digitalRewards.hasAnyBalance();
  }

  public hasExpiringSoon(days: number = 30): boolean {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    return (this.points.expiringAt && this.points.expiringAt <= threshold) ||
           this.storeCredit.hasExpiringSoon(threshold) ||
           this.digitalRewards.hasExpiringSoon(threshold);
  }

  public calculateTotalValue(pointsToUsdRate: number): Money {
    const pointsValue = this.points.availablePoints * pointsToUsdRate;
    const storeCreditValue = this.storeCredit.getTotalInUsd();
    const digitalRewardsValue = this.digitalRewards.getTotalInUsd();

    return new Money(pointsValue + storeCreditValue + digitalRewardsValue, 'USD');
  }

  public getExpiringValue(days: number = 30): Money {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    let totalExpiring = 0;

    if (this.points.expiringAt && this.points.expiringAt <= threshold) {
      totalExpiring += this.points.expiringSoon * 0.01; // Assuming 1 point = $0.01
    }

    totalExpiring += this.storeCredit.getExpiringValue(threshold);
    totalExpiring += this.digitalRewards.getExpiringValue(threshold);

    return new Money(totalExpiring, 'USD');
  }
}
```

**Business Rules**:
- Aggregates balances from Points, StoreCredit, DigitalRewards services
- Total value calculated in USD for display purposes
- Expiring soon defined as within 30 days
- Immutable snapshot (updated via new instance)

---

### 10. MultiCurrencyBalance (NEW v2.0.0)

**Purpose**: Represents balances grouped by currency

```typescript
interface CurrencyBalance {
  currency: Currency;
  balance: Money;
  expiringBalances: Array<{
    amount: Money;
    expiresAt: Date;
  }>;
}

class MultiCurrencyBalance {
  constructor(
    public readonly balances: CurrencyBalance[]
  ) {
    this.validateNoDuplicateCurrencies();
  }

  public getBalance(currency: Currency): Money {
    const currencyBalance = this.balances.find(b => b.currency === currency);
    return currencyBalance ? currencyBalance.balance : Money.zero(currency);
  }

  public hasAnyBalance(): boolean {
    return this.balances.some(b => b.balance.amount > 0);
  }

  public hasBalanceInCurrency(currency: Currency): boolean {
    const balance = this.getBalance(currency);
    return balance.amount > 0;
  }

  public hasExpiringSoon(threshold: Date): boolean {
    return this.balances.some(b =>
      b.expiringBalances.some(e => e.expiresAt <= threshold && e.amount.amount > 0)
    );
  }

  public getExpiringValue(threshold: Date): number {
    return this.balances.reduce((total, b) => {
      const expiring = b.expiringBalances
        .filter(e => e.expiresAt <= threshold)
        .reduce((sum, e) => sum + this.convertToUsd(e.amount), 0);
      return total + expiring;
    }, 0);
  }

  public getTotalInUsd(): number {
    return this.balances.reduce((total, b) => {
      return total + this.convertToUsd(b.balance);
    }, 0);
  }

  private validateNoDuplicateCurrencies(): void {
    const currencies = this.balances.map(b => b.currency);
    const uniqueCurrencies = new Set(currencies);
    if (currencies.length !== uniqueCurrencies.size) {
      throw new Error('Duplicate currencies not allowed in MultiCurrencyBalance');
    }
  }

  private convertToUsd(money: Money): number {
    // Note: In production, use actual exchange rates from exchange rate service
    // This is a simplified example using hardcoded rates
    const rates: Record<Currency, number> = {
      'USD': 1.0,
      'KHR': 0.00025,  // 1 KHR = $0.00025 (approx 4000 KHR = $1)
      'SGD': 0.75,     // 1 SGD = $0.75
      'THB': 0.029,    // 1 THB = $0.029
      'VND': 0.000041, // 1 VND = $0.000041
      'MYR': 0.22,     // 1 MYR = $0.22
      'PHP': 0.018,    // 1 PHP = $0.018
      'IDR': 0.000063, // 1 IDR = $0.000063
      'EUR': 1.10,     // 1 EUR = $1.10
      'GBP': 1.27      // 1 GBP = $1.27
    };
    return money.amount * rates[money.currency];
  }

  public static empty(): MultiCurrencyBalance {
    return new MultiCurrencyBalance([]);
  }

  public static fromSingleCurrency(balance: Money, expiringBalances: Array<{ amount: Money; expiresAt: Date }> = []): MultiCurrencyBalance {
    return new MultiCurrencyBalance([{
      currency: balance.currency,
      balance,
      expiringBalances
    }]);
  }
}
```

**Business Rules**:
- Each currency appears at most once
- Balance operations are currency-specific
- USD conversion uses snapshot exchange rates (not real-time)
- Empty balance is valid state

---

### 11. DepletionOrder (NEW v2.0.0)

**Purpose**: Defines order in which balance types are used during multi-tender redemption

```typescript
enum BalanceType {
  DIGITAL_REWARDS = 'digital_rewards',
  STORE_CREDIT = 'store_credit',
  POINTS = 'points',
  CASH = 'cash'
}

interface DepletionRule {
  type: BalanceType;
  priority: number;  // Lower = higher priority (1 = first)
  conditions?: {
    minTransactionAmount?: Money;
    minRedemptionPoints?: number;
    maxRedemptionPercentage?: number; // e.g., 50 = max 50% of cart can be loyalty
  };
}

class DepletionOrder {
  constructor(
    public readonly rules: DepletionRule[],
    public readonly expirationOverride: boolean
  ) {
    this.validateRules();
  }

  public getSortedRules(): DepletionRule[] {
    return [...this.rules].sort((a, b) => a.priority - b.priority);
  }

  public getNextBalanceType(usedTypes: BalanceType[]): BalanceType | null {
    const sortedRules = this.getSortedRules();
    const nextRule = sortedRules.find(rule => !usedTypes.includes(rule.type));
    return nextRule ? nextRule.type : null;
  }

  public canUseBalanceType(
    type: BalanceType,
    cartTotal: Money,
    remainingAmount: Money
  ): boolean {
    const rule = this.rules.find(r => r.type === type);
    if (!rule || !rule.conditions) return true;

    const conditions = rule.conditions;

    // Check min transaction amount
    if (conditions.minTransactionAmount) {
      if (cartTotal.lessThan(conditions.minTransactionAmount)) {
        return false;
      }
    }

    // Check max redemption percentage
    if (conditions.maxRedemptionPercentage) {
      const maxRedemption = cartTotal.multiply(conditions.maxRedemptionPercentage / 100);
      const alreadyRedeemed = cartTotal.subtract(remainingAmount);
      if (alreadyRedeemed.greaterThanOrEqual(maxRedemption)) {
        return false;
      }
    }

    return true;
  }

  private validateRules(): void {
    // Check for duplicate priorities
    const priorities = this.rules.map(r => r.priority);
    const uniquePriorities = new Set(priorities);
    if (priorities.length !== uniquePriorities.size) {
      throw new Error('Duplicate priorities not allowed in DepletionOrder');
    }

    // Check for duplicate balance types
    const types = this.rules.map(r => r.type);
    const uniqueTypes = new Set(types);
    if (types.length !== uniqueTypes.size) {
      throw new Error('Duplicate balance types not allowed in DepletionOrder');
    }

    // Ensure all balance types are present
    const requiredTypes = Object.values(BalanceType);
    const missingTypes = requiredTypes.filter(t => !types.includes(t));
    if (missingTypes.length > 0) {
      throw new Error(`Missing required balance types: ${missingTypes.join(', ')}`);
    }
  }

  public static default(): DepletionOrder {
    return new DepletionOrder([
      { type: BalanceType.DIGITAL_REWARDS, priority: 1 },
      { type: BalanceType.STORE_CREDIT, priority: 2 },
      { type: BalanceType.POINTS, priority: 3 },
      { type: BalanceType.CASH, priority: 4 }
    ], true);  // Expiration override enabled by default
  }
}
```

**Business Rules**:
- Each balance type must have unique priority
- Lower priority number = used first (1 = highest priority)
- All balance types must be present in rules
- Conditions are optional (no conditions = always eligible)
- Expiration override: if true, use soonest-to-expire first regardless of priority

---

### 12. ExpirationPolicy (NEW v2.0.0)

**Purpose**: Encapsulates expiration logic for store credits and digital rewards

```typescript
class ExpirationPolicy {
  constructor(
    public readonly expirationMonths: number,
    public readonly gracePeriodDays: number,
    public readonly notificationDays: number[]  // Days before expiration to notify (e.g., [30, 7, 1])
  ) {
    if (expirationMonths < 1) throw new Error('Expiration months must be at least 1');
    if (gracePeriodDays < 0) throw new Error('Grace period cannot be negative');
    if (notificationDays.some(d => d < 0)) throw new Error('Notification days cannot be negative');
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

  public shouldNotify(expiresAt: Date, lastNotifiedDaysBefore?: number): number | null {
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Find the next notification threshold
    const nextThreshold = this.notificationDays
      .filter(days => days >= daysUntilExpiration)
      .filter(days => !lastNotifiedDaysBefore || days < lastNotifiedDaysBefore)
      .sort((a, b) => b - a)[0];  // Get largest threshold that hasn't been notified

    return nextThreshold !== undefined ? nextThreshold : null;
  }

  public getStatus(expiresAt: Date, gracePeriodEndsAt: Date): 'active' | 'expired' | 'grace_period' | 'fully_expired' {
    const now = new Date();

    if (now < expiresAt) {
      return 'active';
    } else if (now < gracePeriodEndsAt) {
      return 'grace_period';  // Past expiration but within grace period
    } else {
      return 'fully_expired';  // Past grace period
    }
  }

  public isRedeemable(expiresAt: Date, gracePeriodEndsAt: Date): boolean {
    const status = this.getStatus(expiresAt, gracePeriodEndsAt);
    return status === 'active' || status === 'grace_period';
  }

  public static default(): ExpirationPolicy {
    return new ExpirationPolicy(
      12,        // 12 months expiration
      30,        // 30 days grace period
      [30, 7, 1] // Notify at 30, 7, and 1 day before expiration
    );
  }

  public static noExpiration(): ExpirationPolicy {
    return new ExpirationPolicy(
      999 * 12,  // 999 years = effectively no expiration
      0,         // No grace period needed
      []         // No expiration notifications
    );
  }
}
```

**Business Rules**:
- Expiration date = issued date + expiration months
- Grace period end = expiration date + grace period days
- Status transitions: active → expired (grace_period) → fully_expired
- Redemption allowed during active and grace_period statuses
- Notifications sent at configured thresholds (e.g., 30, 7, 1 days before expiration)

---

## Value Object Design Principles

1. **Immutability**: All value objects are immutable
2. **Self-Validation**: Constructors enforce invariants
3. **Equality by Value**: Two objects with same values are equal
4. **No Identity**: Value objects have no unique ID
5. **Behavior-Rich**: Encapsulate domain logic

## Usage Examples

### Existing Value Objects

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

### NEW Wallet Value Objects (v2.0.0)

```typescript
// Money with ASEAN currencies
const usdAmount = new Money(100.00, 'USD');
const khrAmount = new Money(400000, 'KHR');  // No decimals for KHR
const sgdAmount = new Money(75.50, 'SGD');

console.log(usdAmount.toDisplay());  // "$100.00"
console.log(khrAmount.toDisplay());  // "៛400000"
console.log(sgdAmount.toDisplay());  // "S$75.50"

// Multi-currency balance
const multiCurrency = new MultiCurrencyBalance([
  {
    currency: 'USD',
    balance: new Money(45.00, 'USD'),
    expiringBalances: [
      { amount: new Money(10.00, 'USD'), expiresAt: new Date('2025-12-01') }
    ]
  },
  {
    currency: 'KHR',
    balance: new Money(40000, 'KHR'),
    expiringBalances: []
  }
]);

console.log(multiCurrency.getTotalInUsd());  // ~55.00
console.log(multiCurrency.hasBalanceInCurrency('SGD'));  // false

// Wallet balance (unified view)
const wallet = new WalletBalance(
  new PointBalance(1500, 1500, 0, 200, new Date('2025-12-31')),
  multiCurrency,  // Store credit
  MultiCurrencyBalance.fromSingleCurrency(new Money(25.00, 'USD')),  // Digital rewards
  new Money(95.00, 'USD'),  // Total value
  new Date()
);

console.log(wallet.hasAnyBalance());  // true
console.log(wallet.hasExpiringSoon(30));  // true

// Depletion order configuration
const depletionOrder = DepletionOrder.default();
// Priority: 1. Digital Rewards → 2. Store Credit → 3. Points → 4. Cash

const sortedRules = depletionOrder.getSortedRules();
console.log(sortedRules[0].type);  // 'digital_rewards'

// Check if can use balance type
const canUse = depletionOrder.canUseBalanceType(
  BalanceType.POINTS,
  new Money(100.00, 'USD'),  // Cart total
  new Money(50.00, 'USD')    // Remaining after digital rewards + store credit
);

// Expiration policy
const expirationPolicy = ExpirationPolicy.default();
const issuedAt = new Date();
const expiresAt = expirationPolicy.calculateExpirationDate(issuedAt);
const gracePeriodEnds = expirationPolicy.calculateGracePeriodEnd(expiresAt);

console.log(expiresAt);  // 12 months from now
console.log(gracePeriodEnds);  // 12 months + 30 days from now

const status = expirationPolicy.getStatus(expiresAt, gracePeriodEnds);
console.log(status);  // 'active'

const shouldNotify = expirationPolicy.shouldNotify(expiresAt);
console.log(shouldNotify);  // 30 (notify 30 days before expiration)
```

## References

- [ENTITIES.md](./ENTITIES.md)
- [AGGREGATES.md](./AGGREGATES.md)
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md)
- **NEW (v2.0.0)**:
  - [/docs/requirements/features/store-credit/FEATURE-SPEC.md](../../features/store-credit/FEATURE-SPEC.md)
  - [/docs/requirements/features/gift-cards/FEATURE-SPEC.md](../../features/gift-cards/FEATURE-SPEC.md)
  - [/docs/requirements/features/unified-wallet/FEATURE-SPEC.md](../../features/unified-wallet/FEATURE-SPEC.md)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)
