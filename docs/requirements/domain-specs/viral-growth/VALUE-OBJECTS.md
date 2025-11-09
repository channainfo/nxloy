# Viral Growth Domain - Value Objects

**Last Updated**: 2025-11-09
**Owner**: Backend Team (Growth Squad)

## Overview

Value Objects are immutable objects defined by their attributes, not identity. Two value objects with same attributes are considered equal.

---

## Value Object 1: KFactorValue

**Purpose**: Encapsulate K-factor with validation and business logic.

### Attributes

```typescript
class KFactorValue {
  constructor(
    public readonly value: number, // 0.0-2.0 typical range
    public readonly interpretation: KFactorInterpretation
  ) {}
}

enum KFactorInterpretation {
  NO_GROWTH = 'NO_GROWTH',        // K < 0.2
  LINEAR = 'LINEAR',              // K = 0.2-0.4
  VIRAL_TRACTION = 'VIRAL_TRACTION', // K = 0.4-0.6
  VIRAL_GROWTH = 'VIRAL_GROWTH',  // K = 0.6-0.8
  EXPLOSIVE = 'EXPLOSIVE'          // K > 0.8
}
```

### Validation Rules

- `value >= 0` (cannot be negative)
- `value <= 2.0` (values >2.0 are statistical anomalies, require investigation)

### Factory Method

```typescript
static create(newViralCustomers: number, existingCustomers: number): KFactorValue {
  if (existingCustomers === 0) {
    throw new Error('Cannot calculate K-factor with zero existing customers');
  }

  const value = newViralCustomers / existingCustomers;
  const interpretation = this.interpretKFactor(value);

  return new KFactorValue(value, interpretation);
}

private static interpretKFactor(k: number): KFactorInterpretation {
  if (k < 0.2) return KFactorInterpretation.NO_GROWTH;
  if (k < 0.4) return KFactorInterpretation.LINEAR;
  if (k < 0.6) return KFactorInterpretation.VIRAL_TRACTION;
  if (k < 0.8) return KFactorInterpretation.VIRAL_GROWTH;
  return KFactorInterpretation.EXPLOSIVE;
}
```

### Business Methods

```typescript
isViral(): boolean {
  return this.value >= 0.5; // Industry threshold for viral growth
}

meetsTarget(target: number): boolean {
  return this.value >= target;
}

formatForDisplay(): string {
  return `${(this.value * 100).toFixed(1)}% (${this.interpretation})`;
  // Example: "67.3% (VIRAL_GROWTH)"
}
```

---

## Value Object 2: InfluenceScore

**Purpose**: 0-100 score predicting referral potential.

### Attributes

```typescript
class InfluenceScore {
  constructor(
    public readonly value: number, // 0-100
    public readonly tier: InfluenceTier,
    public readonly breakdown: ScoreBreakdown
  ) {}
}

enum InfluenceTier {
  LOW = 'LOW',       // 0-30
  MEDIUM = 'MEDIUM', // 31-60
  HIGH = 'HIGH',     // 61-85
  ELITE = 'ELITE'    // 86-100
}

interface ScoreBreakdown {
  networkSize: number;      // 0-100 (30% weight)
  referralSuccess: number;  // 0-100 (40% weight)
  engagement: number;       // 0-100 (20% weight)
  socialPresence: number;   // 0-100 (10% weight)
}
```

### Factory Method

```typescript
static calculate(
  networkSize: number,
  pastReferrals: number,
  engagementRate: number,
  socialFollowers: number
): InfluenceScore {
  // Normalize inputs to 0-100 scale
  const networkScore = Math.min(100, (networkSize / 2000) * 100);
  const referralScore = Math.min(100, (pastReferrals / 20) * 100);
  const engagementScore = engagementRate * 100; // Already 0-1
  const socialScore = Math.min(100, (socialFollowers / 10000) * 100);

  const breakdown: ScoreBreakdown = {
    networkSize: networkScore,
    referralSuccess: referralScore,
    engagement: engagementScore,
    socialPresence: socialScore
  };

  // Weighted sum
  const value =
    networkScore * 0.30 +
    referralScore * 0.40 +
    engagementScore * 0.20 +
    socialScore * 0.10;

  const tier = this.determineTier(value);

  return new InfluenceScore(Math.round(value), tier, breakdown);
}
```

---

## Value Object 3: ReferralPotential

**Purpose**: Predicted number of referrals in next 90 days.

### Attributes

```typescript
class ReferralPotential {
  constructor(
    public readonly predicted: number, // 0-50 typical range
    public readonly confidence: number, // 0-100%
    public readonly factors: PredictionFactors
  ) {}
}

interface PredictionFactors {
  historicalAverage: number;
  influenceScore: number;
  trendMultiplier: number; // 0.5-2.0 (declining to growing)
  seasonalAdjustment: number; // 0.8-1.2
}
```

### Factory Method

```typescript
static predict(
  pastReferrals: number[],  // Last 6 months
  influenceScore: InfluenceScore,
  currentTrend: 'GROWING' | 'STABLE' | 'DECLINING'
): ReferralPotential {
  const historicalAverage = pastReferrals.reduce((a, b) => a + b, 0) / pastReferrals.length;

  const trendMultiplier = {
    GROWING: 1.5,
    STABLE: 1.0,
    DECLINING: 0.7
  }[currentTrend];

  const predicted = historicalAverage * trendMultiplier * (influenceScore.value / 100);

  // Confidence based on data consistency
  const variance = this.calculateVariance(pastReferrals);
  const confidence = 100 - Math.min(50, variance * 10);

  return new ReferralPotential(
    Math.round(predicted),
    Math.round(confidence),
    {
      historicalAverage,
      influenceScore: influenceScore.value,
      trendMultiplier,
      seasonalAdjustment: 1.0 // TODO: Add seasonal logic
    }
  );
}
```

---

## Value Object 4: ViralChannelAttribution

**Purpose**: Multi-touch attribution for viral signup.

### Attributes

```typescript
class ViralChannelAttribution {
  constructor(
    public readonly firstTouch: ChannelCredit,
    public readonly lastTouch: ChannelCredit,
    public readonly touchpoints: Touchpoint[]
  ) {}
}

interface ChannelCredit {
  channel: ViralChannelType;
  percentage: number; // 0-100
}

enum ViralChannelType {
  REFERRAL = 'REFERRAL',
  CHALLENGE = 'CHALLENGE',
  INFLUENCER = 'INFLUENCER',
  UGC = 'UGC'
}

interface Touchpoint {
  channel: ViralChannelType;
  timestamp: Date;
  metadata: any; // Challenge ID, influencer ID, etc.
}
```

### Factory Method

```typescript
static calculate(touchpoints: Touchpoint[]): ViralChannelAttribution {
  if (touchpoints.length === 0) {
    throw new Error('At least one touchpoint required for attribution');
  }

  // Sort by timestamp
  const sorted = touchpoints.sort((a, b) =>
    a.timestamp.getTime() - b.timestamp.getTime()
  );

  const firstTouch: ChannelCredit = {
    channel: sorted[0].channel,
    percentage: 40 // First-touch gets 40%
  };

  const lastTouch: ChannelCredit = {
    channel: sorted[sorted.length - 1].channel,
    percentage: 60 // Last-touch gets 60%
  };

  return new ViralChannelAttribution(firstTouch, lastTouch, sorted);
}
```

---

## Value Object 5: ViralCycleTimeValue

**Purpose**: Time between signup and first referral with benchmarking.

### Attributes

```typescript
class ViralCycleTimeValue {
  constructor(
    public readonly days: number,
    public readonly benchmark: CycleBenchmark
  ) {}
}

enum CycleBenchmark {
  FAST = 'FAST',       // < 7 days
  AVERAGE = 'AVERAGE', // 7-30 days
  SLOW = 'SLOW'        // > 30 days
}
```

### Factory Method

```typescript
static create(signupDate: Date, firstReferralDate: Date): ViralCycleTimeValue {
  const diffMs = firstReferralDate.getTime() - signupDate.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    throw new Error('First referral cannot be before signup');
  }

  const benchmark = days < 7 ? CycleBenchmark.FAST :
                    days <= 30 ? CycleBenchmark.AVERAGE :
                    CycleBenchmark.SLOW;

  return new ViralCycleTimeValue(days, benchmark);
}
```

---

## Value Object 6: SuperReferrerTier

**Purpose**: Tier classification for super referrers with benefits.

### Attributes

```typescript
class SuperReferrerTier {
  constructor(
    public readonly tier: Tier,
    public readonly bonusMultiplier: number,
    public readonly benefits: string[]
  ) {}
}

enum Tier {
  BRONZE = 'BRONZE',     // Top 80-85%
  SILVER = 'SILVER',     // Top 85-95%
  GOLD = 'GOLD',         // Top 95-99%
  PLATINUM = 'PLATINUM'  // Top 99-100%
}
```

### Factory Method

```typescript
static fromPercentile(percentile: number): SuperReferrerTier {
  if (percentile < 80) {
    throw new Error('Not a super referrer (must be top 20%)');
  }

  if (percentile < 85) {
    return new SuperReferrerTier(Tier.BRONZE, 2.0, [
      'VIP badge',
      '2x points on referrals'
    ]);
  }

  if (percentile < 95) {
    return new SuperReferrerTier(Tier.SILVER, 3.0, [
      'VIP badge',
      '3x points on referrals',
      'Early access to challenges'
    ]);
  }

  if (percentile < 99) {
    return new SuperReferrerTier(Tier.GOLD, 4.0, [
      'VIP badge',
      '4x points on referrals',
      'Early access to challenges',
      'Exclusive rewards'
    ]);
  }

  return new SuperReferrerTier(Tier.PLATINUM, 5.0, [
    'VIP badge',
    '5x points on referrals',
    'Early access to challenges',
    'Exclusive rewards',
    'Personal growth manager'
  ]);
}
```

---

## Value Object 7: GrowthImpactPrediction

**Purpose**: Predicted K-factor impact of a recommendation.

### Attributes

```typescript
class GrowthImpactPrediction {
  constructor(
    public readonly kFactorIncrease: number, // e.g., +0.12
    public readonly confidence: number, // 0-100%
    public readonly rationale: string,
    public readonly evidenceSource: string[]
  ) {}
}
```

### Factory Method

```typescript
static fromAIAnalysis(
  recommendation: string,
  historicalData: any[],
  modelConfidence: number
): GrowthImpactPrediction {
  // Simplified - actual implementation uses ML model
  const baseImpact = 0.05; // Conservative baseline
  const confidenceMultiplier = modelConfidence / 100;

  const kFactorIncrease = baseImpact * confidenceMultiplier;

  return new GrowthImpactPrediction(
    Number(kFactorIncrease.toFixed(2)),
    Math.round(modelConfidence),
    'Based on similar campaigns in historical data',
    ['Past challenge performance', 'Industry benchmarks']
  );
}
```

---

## Value Object 8: NetworkSizeEstimate

**Purpose**: Estimated social network connections for a customer.

### Attributes

```typescript
class NetworkSizeEstimate {
  constructor(
    public readonly estimated: number, // 0-5000+
    public readonly tier: NetworkTier,
    public readonly confidence: number // 0-100%
  ) {}
}

enum NetworkTier {
  SMALL = 'SMALL',     // < 100
  MEDIUM = 'MEDIUM',   // 100-500
  LARGE = 'LARGE',     // 500-2000
  MEGA = 'MEGA'        // > 2000
}
```

### Factory Method

```typescript
static estimate(
  emailDomain: string,
  location: string,
  socialConnections: number
): NetworkSizeEstimate {
  let base = socialConnections || 100; // Default assumption
  let confidence = 50; // Medium confidence

  // Adjust based on email domain
  if (emailDomain.includes('@gmail.com')) {
    base *= 1.2; // Consumer emails suggest broader network
    confidence += 10;
  }

  // Adjust based on urban vs rural
  if (['New York', 'Los Angeles', 'San Francisco'].includes(location)) {
    base *= 1.3; // Urban dwellers have larger networks
    confidence += 15;
  }

  const estimated = Math.round(base);
  const tier = estimated < 100 ? NetworkTier.SMALL :
               estimated < 500 ? NetworkTier.MEDIUM :
               estimated < 2000 ? NetworkTier.LARGE :
               NetworkTier.MEGA;

  return new NetworkSizeEstimate(estimated, tier, Math.min(100, confidence));
}
```

---

## Value Object Equality

All value objects implement value-based equality:

```typescript
equals(other: ValueObject): boolean {
  return JSON.stringify(this) === JSON.stringify(other);
}
```

**Example**:
```typescript
const k1 = KFactorValue.create(500, 1000); // K = 0.5
const k2 = KFactorValue.create(250, 500);  // K = 0.5
k1.equals(k2); // true (same value)
```

---

## Immutability

All value objects are immutable:

```typescript
readonly value: number; // Cannot be changed after construction
```

**Anti-Pattern**:
```typescript
// ❌ WRONG - trying to mutate
kFactor.value = 0.7;

// ✅ CORRECT - create new instance
const newKFactor = KFactorValue.create(700, 1000);
```

---

**Document Owner**: Backend Team (Growth Squad)
**Last Updated**: 2025-11-09
**Status**: ✅ Complete
