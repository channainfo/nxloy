# Viral Growth Domain - Aggregates

**Last Updated**: 2025-11-09
**Owner**: Backend Team (Growth Squad)

## Overview

Aggregates are clusters of entities and value objects treated as a single unit for data changes. Each aggregate has a root entity that controls access to all members.

---

## Aggregate 1: ViralMetrics (ROOT)

**Purpose**: Track K-factor and viral performance metrics for a business

**Aggregate Root**: `ViralMetrics` entity

**Aggregate Members**:
- `ViralMetrics` (root entity)
- `ViralSnapshot` (child entities, hourly captures)
- `ViralChannel` (child entities, channel breakdown)
- `KFactorValue` (value object)

### Aggregate Boundary

```typescript
class ViralMetricsAggregate {
  private root: ViralMetrics;
  private snapshots: ViralSnapshot[];
  private channels: ViralChannel[];

  // Only root entity ID exposed
  public get id(): UUID {
    return this.root.id;
  }

  // All changes go through root
  public calculateKFactor(newViralCustomers: number, existingCustomers: number): void {
    const kFactorValue = KFactorValue.create(newViralCustomers, existingCustomers);
    this.root.kFactor = kFactorValue.value;
    this.root.status = ViralMetricsStatus.COMPLETED;
    this.root.calculatedAt = new Date();

    // Create snapshot
    this.captureSnapshot();

    // Publish event
    this.publishEvent(new KFactorCalculatedEvent(this.root));
  }

  private captureSnapshot(): void {
    const snapshot = new ViralSnapshot(
      UUID.create(),
      this.root.businessId,
      new Date(),
      this.root.kFactor,
      this.root.totalCustomers,
      this.root.viralCustomers
    );
    this.snapshots.push(snapshot);
  }
}
```

### Business Invariants

1. **K-Factor Validity**: `kFactor >= 0` always
2. **Period Consistency**: `periodEnd > periodStart`
3. **Channel Sum**: `kFactorReferral + kFactorChallenge + kFactorInfluencer + kFactorUGC ≈ kFactor` (within 0.01 tolerance)
4. **Customer Count**: `existingCustomers > 0` (cannot calculate with zero customers)
5. **Status Consistency**: `status = COMPLETED → calculatedAt IS NOT NULL`

### Aggregate Operations

| Operation | Description | Invariants Enforced |
|-----------|-------------|---------------------|
| `calculateKFactor()` | Compute viral coefficient | #1, #3, #4 |
| `updateChannelBreakdown()` | Update individual channel K-factors | #3 |
| `captureSnapshot()` | Create hourly snapshot | #1, #2 |
| `adjustForChurn()` | Calculate churn-adjusted K-factor | #1, #4 |

---

## Aggregate 2: ReferralChain (ROOT)

**Purpose**: Track multi-level referral relationships (who referred whom)

**Aggregate Root**: `ReferralChain` entity

**Aggregate Members**:
- `ReferralChain` (root entity)
- `ViralCycle` (child entity, timing analysis)
- `ViralCycleTimeValue` (value object)
- `NetworkSizeEstimate` (value object)

### Aggregate Boundary

```typescript
class ReferralChainAggregate {
  private root: ReferralChain;
  private cycle: ViralCycle | null;

  // Extend chain when customer makes first referral
  public recordFirstReferral(referredCustomerId: UUID): void {
    // Update counts
    this.root.primaryReferrals += 1;
    this.root.totalDownstream += 1;

    if (!this.root.firstReferralAt) {
      // First referral ever - start cycle tracking
      this.root.firstReferralAt = new Date();

      const cycleTime = ViralCycleTimeValue.create(
        this.root.createdAt,
        this.root.firstReferralAt
      );

      this.root.viralCycleTime = cycleTime.days;

      // Create cycle entity
      this.cycle = new ViralCycle(
        UUID.create(),
        this.root.businessId,
        this.root.customerId,
        this.root.createdAt,
        this.root.firstReferralAt,
        cycleTime.days
      );

      // Publish event
      this.publishEvent(new ViralCycleStartedEvent(this.cycle));
    }

    // Create new chain node for referred customer
    this.createDownstreamChain(referredCustomerId);
  }

  private createDownstreamChain(referredCustomerId: UUID): void {
    // Create new ReferralChain for the referred customer
    const downstreamChain = new ReferralChain(
      UUID.create(),
      this.root.businessId,
      referredCustomerId,
      this.root.customerId, // referred by root customer
      this.root.level + 1,   // one level deeper
      this.root.rootCustomerId // same root
    );

    // Publish event
    this.publishEvent(new ReferralChainExtendedEvent(downstreamChain));
  }
}
```

### Business Invariants

1. **Level Depth**: `1 <= level <= 5` (max 5 levels tracked)
2. **Root Consistency**: `level = 1 → referredById IS NULL`
3. **Parent Existence**: `level > 1 → referredById IS NOT NULL`
4. **Downstream Sum**: `totalDownstream >= primaryReferrals`
5. **Cycle Time Validity**: `viralCycleTime = firstReferralAt - createdAt` (in days)

### Aggregate Operations

| Operation | Description | Invariants Enforced |
|-----------|-------------|---------------------|
| `recordFirstReferral()` | Track customer's first referral | #4, #5 |
| `extendToSecondary()` | Add secondary (friend-of-friend) | #1, #3 |
| `calculateDownstream()` | Sum all downstream referrals | #4 |

---

## Aggregate 3: SuperReferrer (ROOT)

**Purpose**: Manage top 20% referrers who drive 80% of growth

**Aggregate Root**: `SuperReferrer` entity

**Aggregate Members**:
- `SuperReferrer` (root entity)
- `InfluenceScore` (value object)
- `ReferralPotential` (value object)
- `SuperReferrerTier` (value object)

### Aggregate Boundary

```typescript
class SuperReferrerAggregate {
  private root: SuperReferrer;

  // Promote customer to super referrer
  public static identify(
    customerId: UUID,
    totalReferrals: number,
    percentile: number,
    networkSize: number,
    influenceScore: InfluenceScore
  ): SuperReferrerAggregate {
    // Business rule: Must be top 20% with minimum 5 referrals
    if (percentile < 80.0 || totalReferrals < 5) {
      throw new Error('Does not meet super referrer criteria');
    }

    const tier = SuperReferrerTier.fromPercentile(percentile);

    const superReferrer = new SuperReferrer(
      UUID.create(),
      customerId,
      new Date(),
      totalReferrals,
      0, // monthly referrals (calculated separately)
      networkSize,
      influenceScore.value,
      0, // referral potential (calculated separately)
      percentile,
      tier.tier,
      tier.bonusMultiplier,
      SuperReferrerStatus.ACTIVE
    );

    return new SuperReferrerAggregate(superReferrer);
  }

  // Check if should be demoted
  public checkDemotion(currentPercentile: number): void {
    if (currentPercentile < 80.0) {
      this.root.status = SuperReferrerStatus.DEMOTED;
      this.root.updatedAt = new Date();

      this.publishEvent(new SuperReferrerDemotedEvent(this.root));
    }
  }

  // Update tier based on current percentile
  public updateTier(currentPercentile: number): void {
    const newTier = SuperReferrerTier.fromPercentile(currentPercentile);

    if (newTier.tier !== this.root.tier) {
      this.root.tier = newTier.tier;
      this.root.bonusMultiplier = newTier.bonusMultiplier;
      this.root.percentile = currentPercentile;
      this.root.updatedAt = new Date();

      this.publishEvent(new SuperReferrerTierChangedEvent(this.root));
    }
  }
}
```

### Business Invariants

1. **Minimum Referrals**: `totalReferrals >= 5`
2. **Top 20% Rule**: `percentile >= 80.0`
3. **Influence Range**: `0 <= influenceScore <= 100`
4. **Bonus Range**: `1.0 <= bonusMultiplier <= 5.0`
5. **Tier Mapping**:
   - BRONZE: 80-85%
   - SILVER: 85-95%
   - GOLD: 95-99%
   - PLATINUM: 99-100%

### Aggregate Operations

| Operation | Description | Invariants Enforced |
|-----------|-------------|---------------------|
| `identify()` | Promote to super referrer | #1, #2 |
| `updateTier()` | Change tier based on percentile | #5 |
| `checkDemotion()` | Remove super referrer status | #2 |
| `calculateReferralPotential()` | Predict future referrals | #3 |

---

## Aggregate 4: GrowthRecommendation (ROOT)

**Purpose**: AI-generated optimization suggestions

**Aggregate Root**: `GrowthRecommendation` entity

**Aggregate Members**:
- `GrowthRecommendation` (root entity)
- `GrowthImpactPrediction` (value object)

### Aggregate Boundary

```typescript
class GrowthRecommendationAggregate {
  private root: GrowthRecommendation;

  // Generate recommendation via AI
  public static generate(
    businessId: UUID,
    viralMetrics: ViralMetrics,
    aiAnalysis: string
  ): GrowthRecommendationAggregate {
    // Parse AI output
    const impact = GrowthImpactPrediction.fromAIAnalysis(
      aiAnalysis,
      [], // historical data
      75 // confidence %
    );

    const recommendation = new GrowthRecommendation(
      UUID.create(),
      businessId,
      GrowthRecommendationType.LAUNCH_CHALLENGE,
      'Launch viral challenge using trending hashtag',
      aiAnalysis,
      impact.kFactorIncrease,
      impact.confidence,
      GrowthRecommendationPriority.HIGH,
      { metrics: viralMetrics },
      'GPT-4o',
      GrowthRecommendationStatus.PENDING
    );

    return new GrowthRecommendationAggregate(recommendation);
  }

  // Business accepts recommendation
  public accept(): void {
    if (this.root.status !== GrowthRecommendationStatus.PENDING) {
      throw new Error('Can only accept pending recommendations');
    }

    this.root.status = GrowthRecommendationStatus.ACCEPTED;
    this.root.acceptedAt = new Date();

    this.publishEvent(new GrowthRecommendationAcceptedEvent(this.root));
  }

  // Track actual impact after implementation
  public recordActualImpact(kFactorBefore: number, kFactorAfter: number): void {
    if (this.root.status !== GrowthRecommendationStatus.IMPLEMENTED) {
      throw new Error('Can only record impact for implemented recommendations');
    }

    this.root.actualImpact = kFactorAfter - kFactorBefore;

    // Compare predicted vs actual
    const accuracyRate = (this.root.actualImpact / this.root.predictedImpact) * 100;

    this.publishEvent(new GrowthRecommendationCompletedEvent(
      this.root,
      accuracyRate
    ));
  }
}
```

### Business Invariants

1. **Impact Range**: `predictedImpact >= 0`
2. **Confidence Range**: `0 <= confidence <= 100`
3. **Priority Rule**: `predictedImpact > 0.10 → priority = HIGH`
4. **Status Flow**: `PENDING → ACCEPTED → IMPLEMENTED`
5. **Actual Impact**: Can only record after IMPLEMENTED status

### Aggregate Operations

| Operation | Description | Invariants Enforced |
|-----------|-------------|---------------------|
| `generate()` | Create recommendation | #1, #2, #3 |
| `accept()` | Business approves | #4 |
| `implement()` | Mark as implemented | #4 |
| `recordActualImpact()` | Track results | #5 |

---

## Aggregate Relationships

```
ViralMetrics (Root)
    ├── ViralSnapshot[] (children)
    └── ViralChannel[] (children)

ReferralChain (Root)
    ├── ViralCycle (child)
    └── ReferralChain[] (downstream children)

SuperReferrer (Root)
    └── [No children]

GrowthRecommendation (Root)
    └── [No children]
```

---

## Transaction Boundaries

Each aggregate is a transaction boundary - all changes within an aggregate are atomic.

**Example: Calculate K-Factor**
```typescript
// Atomic transaction
async function calculateKFactor(businessId: UUID): Promise<void> {
  const aggregate = await viralMetricsRepository.findByBusiness(businessId);

  // All changes in single transaction
  aggregate.calculateKFactor(500, 1000); // K = 0.5
  aggregate.captureSnapshot();
  aggregate.updateChannelBreakdown([...]);

  await viralMetricsRepository.save(aggregate);
  // All changes committed together
}
```

**Anti-Pattern: Cross-Aggregate Transaction**
```typescript
// ❌ WRONG - modifying multiple aggregates in one transaction
async function badExample(): Promise<void> {
  const metrics = await viralMetricsRepo.find(id1);
  const chain = await referralChainRepo.find(id2);

  metrics.calculateKFactor(...);
  chain.recordFirstReferral(...);

  // Don't do this! Violates aggregate boundaries
  await Promise.all([
    viralMetricsRepo.save(metrics),
    referralChainRepo.save(chain)
  ]);
}

// ✅ CORRECT - use domain events for cross-aggregate coordination
async function goodExample(): Promise<void> {
  // Update first aggregate
  const metrics = await viralMetricsRepo.find(id1);
  metrics.calculateKFactor(...);
  await viralMetricsRepo.save(metrics);
  // Publishes KFactorCalculatedEvent

  // Event handler updates second aggregate
  onKFactorCalculated(event => {
    const chain = await referralChainRepo.findByCustomer(event.customerId);
    chain.updateDownstreamImpact();
    await referralChainRepo.save(chain);
  });
}
```

---

## Consistency Rules

### Strong Consistency (Within Aggregate)
- K-factor calculation and channel breakdown must be consistent
- Referral chain levels and parent relationships must be valid
- Super referrer tier and bonus multiplier must match

### Eventual Consistency (Across Aggregates)
- ViralMetrics updated → SuperReferrer re-identified (via event)
- ReferralChain extended → ViralMetrics recalculated (daily job)
- GrowthRecommendation accepted → Challenges/Influencers triggered (async)

---

**Document Owner**: Backend Team (Growth Squad)
**Last Updated**: 2025-11-09
**Status**: ✅ Complete
