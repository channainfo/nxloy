# Viral Growth Domain - Domain Events

**Last Updated**: 2025-11-09
**Owner**: Backend Team (Growth Squad)

## Overview

Domain Events represent significant occurrences in the Viral Growth domain. They enable loose coupling between domains through event-driven architecture.

---

## Event 1: viral.k_factor.calculated

**Trigger**: K-factor calculation completes

**Schema**:
```typescript
interface KFactorCalculatedEvent {
  eventId: UUID;
  eventType: 'viral.k_factor.calculated';
  timestamp: Date;
  payload: {
    businessId: UUID;
    periodStart: Date;
    periodEnd: Date;
    kFactor: number;
    kFactorInterpretation: 'NO_GROWTH' | 'LINEAR' | 'VIRAL_TRACTION' | 'VIRAL_GROWTH' | 'EXPLOSIVE';
    breakdown: {
      kFactorReferral: number;
      kFactorChallenge: number;
      kFactorInfluencer: number;
      kFactorUGC: number;
    };
    existingCustomers: number;
    newViralCustomers: number;
  };
}
```

**Consumers**:
- **Analytics Domain**: Update business dashboards
- **Notifications Domain**: Alert business if K-factor milestone reached
- **Rewards Domain**: Bonus rewards if K-factor > 0.7

---

## Event 2: viral.super_referrer.identified

**Trigger**: Customer promoted to super referrer

**Schema**:
```typescript
interface SuperReferrerIdentifiedEvent {
  eventId: UUID;
  eventType: 'viral.super_referrer.identified';
  timestamp: Date;
  payload: {
    businessId: UUID;
    customerId: UUID;
    totalReferrals: number;
    percentile: number; // 80-100
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    bonusMultiplier: number; // 2.0-5.0x
    influenceScore: number; // 0-100
  };
}
```

**Consumers**:
- **Customer Management**: Add VIP badge to profile
- **Rewards Domain**: Apply bonus multiplier to future points
- **Notifications Domain**: Send congratulations email

---

## Event 3: viral.milestone.reached

**Trigger**: K-factor crosses threshold (0.3, 0.5, 0.7, 1.0)

**Schema**:
```typescript
interface ViralMilestoneReachedEvent {
  eventId: UUID;
  eventType: 'viral.milestone.reached';
  timestamp: Date;
  payload: {
    businessId: UUID;
    milestone: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    kFactor: number;
    previousKFactor: number;
    message: string; // "Congratulations! You've reached viral growth (K=0.7)"
  };
}
```

**Consumers**:
- **Notifications Domain**: Celebrate with business owner
- **Analytics Domain**: Track milestone achievement dates
- **Marketing Domain**: Adjust ad spend (reduce if viral)

---

## Event 4: viral.referral_chain.extended

**Trigger**: New referral link added to chain

**Schema**:
```typescript
interface ReferralChainExtendedEvent {
  eventId: UUID;
  eventType: 'viral.referral_chain.extended';
  timestamp: Date;
  payload: {
    businessId: UUID;
    customerId: UUID; // New customer who signed up
    referredById: UUID; // Who referred them
    level: number; // 1=primary, 2=secondary, etc.
    rootCustomerId: UUID; // Original customer at top of chain
  };
}
```

**Consumers**:
- **Viral Growth Domain**: Update upstream chains (secondary/tertiary counts)
- **Rewards Domain**: Award referral bonus to referrer

---

## Event 5: viral.recommendation.generated

**Trigger**: AI generates growth optimization suggestion

**Schema**:
```typescript
interface GrowthRecommendationGeneratedEvent {
  eventId: UUID;
  eventType: 'viral.recommendation.generated';
  timestamp: Date;
  payload: {
    businessId: UUID;
    recommendationId: UUID;
    type: 'LAUNCH_CHALLENGE' | 'PARTNER_INFLUENCER' | 'REWARD_REFERRERS';
    title: string;
    predictedImpact: number; // Expected K-factor increase
    confidence: number; // 0-100%
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}
```

**Consumers**:
- **Notifications Domain**: Email recommendation to business owner
- **Business Dashboard**: Display in recommendations widget

---

## Event 6: viral.cycle_time.measured

**Trigger**: Customer makes first referral (viral cycle completes)

**Schema**:
```typescript
interface ViralCycleMeasuredEvent {
  eventId: UUID;
  eventType: 'viral.cycle_time.measured';
  timestamp: Date;
  payload: {
    businessId: UUID;
    customerId: UUID;
    signupDate: Date;
    firstReferralDate: Date;
    cycleTimeDays: number;
    benchmark: 'FAST' | 'AVERAGE' | 'SLOW'; // <7, 7-30, >30 days
  };
}
```

**Consumers**:
- **Viral Growth Domain**: Update average cycle time metric
- **Analytics Domain**: Track cycle time trends

---

## Event Publishing

**Pattern**:
```typescript
class ViralMetricsAggregate {
  private events: DomainEvent[] = [];

  public calculateKFactor(...): void {
    // Perform calculation
    this.root.kFactor = 0.67;

    // Record event (don't publish yet)
    this.events.push(new KFactorCalculatedEvent({
      businessId: this.root.businessId,
      kFactor: this.root.kFactor,
      ...
    }));
  }

  public getUncommittedEvents(): DomainEvent[] {
    return this.events;
  }

  public clearEvents(): void {
    this.events = [];
  }
}

// Repository publishes events after saving
class ViralMetricsRepository {
  async save(aggregate: ViralMetricsAggregate): Promise<void> {
    // 1. Save aggregate
    await prisma.viralMetrics.update(...);

    // 2. Publish events
    const events = aggregate.getUncommittedEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }

    // 3. Clear events
    aggregate.clearEvents();
  }
}
```

---

## Event Ordering

Events are published in the order they were recorded within the aggregate.

**Guarantee**: Events from single aggregate are ordered.
**No Guarantee**: Events across different aggregates.

---

**Document Owner**: Backend Team (Growth Squad)
**Last Updated**: 2025-11-09
**Status**: ✅ Complete
