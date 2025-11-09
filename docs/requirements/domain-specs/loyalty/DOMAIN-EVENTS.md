# Loyalty Domain - Domain Events

**Domain**: Loyalty
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)

## Overview

Domain Events represent significant occurrences within the Loyalty domain. They enable loose coupling between bounded contexts and support event-driven architecture.

**v2.0.0 Changes**:
- Added store credit events (10-15)
- Added digital reward events (16-21)
- Added wallet redemption events (22-23)
- Added saga coordination events

## Event Design Principles

1. **Past Tense**: Events are named in past tense (e.g., `PointsEarned`)
2. **Immutable**: Events cannot be changed once published
3. **Self-Contained**: Events contain all necessary information
4. **Versioned**: Events support schema evolution
5. **Idempotent**: Consumers handle duplicate events gracefully

---

## Core Domain Events

### 1. LoyaltyProgramCreatedEvent

**Purpose**: Published when a new loyalty program is created

```typescript
interface LoyaltyProgramCreatedEvent {
  eventId: UUID;
  eventType: 'loyalty.program.created';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID; // programId
  businessId: UUID;
  data: {
    programName: string;
    programStatus: ProgramStatus;
    templateId?: UUID;
    createdBy: UUID;
  };
  metadata: {
    correlationId?: UUID;
    causationId?: UUID;
  };
}
```

**Consumers**:
- Analytics Service: Track program creation metrics
- Notification Service: Notify business owner
- Audit Service: Log program creation

**Example**:
```json
{
  "eventId": "a1b2c3d4-...",
  "eventType": "loyalty.program.created",
  "version": "1.0",
  "timestamp": "2025-11-07T10:30:00Z",
  "aggregateId": "prog-123",
  "businessId": "biz-456",
  "data": {
    "programName": "Coffee Rewards",
    "programStatus": "DRAFT",
    "templateId": "template-789",
    "createdBy": "user-001"
  }
}
```

---

### 2. LoyaltyProgramActivatedEvent

**Purpose**: Published when a program transitions to ACTIVE status

```typescript
interface LoyaltyProgramActivatedEvent {
  eventId: UUID;
  eventType: 'loyalty.program.activated';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    programName: string;
    ruleType: RuleType;
    ruleConfig: RuleConfiguration;
  };
  metadata: {
    correlationId?: UUID;
  };
}
```

**Consumers**:
- Customer Service: Enable enrollment for customers
- Notification Service: Notify customers about new program
- Analytics Service: Track program activation

---

### 3. LoyaltyProgramPausedEvent

**Purpose**: Published when a program is paused

```typescript
interface LoyaltyProgramPausedEvent {
  eventId: UUID;
  eventType: 'loyalty.program.paused';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    programName: string;
    pausedBy: UUID;
    reason?: string;
  };
}
```

**Consumers**:
- Customer Service: Prevent new enrollments
- Notification Service: Notify enrolled customers
- Analytics Service: Track pause events

---

### 4. CustomerEnrolledEvent

**Purpose**: Published when a customer enrolls in a program

```typescript
interface CustomerEnrolledEvent {
  eventId: UUID;
  eventType: 'loyalty.customer.enrolled';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID; // enrollmentId
  businessId: UUID;
  data: {
    customerId: UUID;
    programId: UUID;
    programName: string;
    enrollmentMethod: 'MANUAL' | 'AUTO' | 'SELF';
    initialTierId?: UUID;
  };
}
```

**Consumers**:
- Customer Service: Update customer profile
- Notification Service: Send welcome message
- Analytics Service: Track enrollment metrics
- Reward Service: Check for signup bonuses

**Example**:
```json
{
  "eventId": "e1e2e3e4-...",
  "eventType": "loyalty.customer.enrolled",
  "version": "1.0",
  "timestamp": "2025-11-07T14:15:00Z",
  "aggregateId": "enrollment-111",
  "businessId": "biz-456",
  "data": {
    "customerId": "cust-222",
    "programId": "prog-123",
    "programName": "Coffee Rewards",
    "enrollmentMethod": "SELF",
    "initialTierId": "tier-bronze"
  }
}
```

---

### 5. PointsEarnedEvent

**Purpose**: Published when a customer earns points

```typescript
interface PointsEarnedEvent {
  eventId: UUID;
  eventType: 'loyalty.points.earned';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID; // enrollmentId
  businessId: UUID;
  data: {
    customerId: UUID;
    programId: UUID;
    pointsEarned: number;
    totalPoints: number;
    transactionId: UUID;
    referenceType: string;
    referenceId: UUID;
    expiresAt?: Date;
  };
}
```

**Consumers**:
- Analytics Service: Track earning patterns
- Notification Service: Notify customer of points earned
- Reward Service: Check if customer is eligible for rewards
- Tier Service: Check for tier upgrades

**Example**:
```json
{
  "eventId": "p1p2p3p4-...",
  "eventType": "loyalty.points.earned",
  "version": "1.0",
  "timestamp": "2025-11-07T15:30:00Z",
  "aggregateId": "enrollment-111",
  "businessId": "biz-456",
  "data": {
    "customerId": "cust-222",
    "programId": "prog-123",
    "pointsEarned": 50,
    "totalPoints": 250,
    "transactionId": "txn-333",
    "referenceType": "PURCHASE",
    "referenceId": "order-444",
    "expiresAt": "2026-11-07T00:00:00Z"
  }
}
```

---

### 6. PointsRedeemedEvent

**Purpose**: Published when a customer redeems points

```typescript
interface PointsRedeemedEvent {
  eventId: UUID;
  eventType: 'loyalty.points.redeemed';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    programId: UUID;
    pointsRedeemed: number;
    remainingPoints: number;
    rewardId: UUID;
    rewardName: string;
    transactionId: UUID;
  };
}
```

**Consumers**:
- Reward Service: Issue reward to customer
- Notification Service: Send redemption confirmation
- Analytics Service: Track redemption patterns
- Inventory Service: Update stock if physical reward

---

### 7. PointsExpiredEvent

**Purpose**: Published when points expire

```typescript
interface PointsExpiredEvent {
  eventId: UUID;
  eventType: 'loyalty.points.expired';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    programId: UUID;
    pointsExpired: number;
    remainingPoints: number;
    expirationDate: Date;
  };
}
```

**Consumers**:
- Notification Service: Warn customer about expiring points
- Analytics Service: Track expiration metrics

---

### 8. TierUpgradedEvent

**Purpose**: Published when a customer is upgraded to a higher tier

```typescript
interface TierUpgradedEvent {
  eventId: UUID;
  eventType: 'loyalty.tier.upgraded';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    programId: UUID;
    fromTierId?: UUID;
    toTierId: UUID;
    tierName: string;
    tierLevel: number;
    qualifyingPoints: number;
  };
}
```

**Consumers**:
- Notification Service: Congratulate customer on upgrade
- Customer Service: Update customer segment
- Analytics Service: Track tier progression
- Reward Service: Apply tier benefits

**Example**:
```json
{
  "eventId": "t1t2t3t4-...",
  "eventType": "loyalty.tier.upgraded",
  "version": "1.0",
  "timestamp": "2025-11-07T16:00:00Z",
  "aggregateId": "enrollment-111",
  "businessId": "biz-456",
  "data": {
    "customerId": "cust-222",
    "programId": "prog-123",
    "fromTierId": "tier-bronze",
    "toTierId": "tier-silver",
    "tierName": "Silver Member",
    "tierLevel": 2,
    "qualifyingPoints": 500
  }
}
```

---

### 9. LoyaltyTemplateUsedEvent

**Purpose**: Published when a template is used to create a program

```typescript
interface LoyaltyTemplateUsedEvent {
  eventId: UUID;
  eventType: 'loyalty.template.used';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID; // templateId
  data: {
    templateId: UUID;
    templateName: string;
    businessId: UUID;
    programId: UUID;
    customized: boolean;
    industry: Industry;
  };
}
```

**Consumers**:
- Analytics Service: Track template popularity
- Template Service: Increment usage counter

---

## Store Credit Events (NEW v2.0.0)

### 10. StoreCreditIssuedEvent

**Purpose**: Published when store credit is issued to a customer

```typescript
interface StoreCreditIssuedEvent {
  eventId: UUID;
  eventType: 'store_credit.issued';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID; // creditId
  businessId: UUID;
  data: {
    customerId: UUID;
    amount: Money;
    currency: string;
    method: CreditMethod; // promotional, refund, cashback_reward, automated
    reason?: string;
    expiresAt: Date;
    gracePeriodEndsAt: Date;
    campaignId?: UUID;
    rewardId?: UUID;
    issuedBy: UUID;
  };
}
```

**Consumers**:
- Customer Service: Update customer wallet balance
- Notification Service: Notify customer of credit received
- Analytics Service: Track credit issuance metrics
- Accounting Service: Record deferred revenue liability

**Example**:
```json
{
  "eventId": "sc1-...",
  "eventType": "store_credit.issued",
  "version": "1.0",
  "timestamp": "2025-11-09T10:00:00Z",
  "aggregateId": "credit-001",
  "businessId": "biz-456",
  "data": {
    "customerId": "cust-222",
    "amount": { "amount": 10.00, "currency": "USD" },
    "currency": "USD",
    "method": "cashback_reward",
    "reason": "Loyalty points converted to store credit",
    "expiresAt": "2026-11-09T00:00:00Z",
    "gracePeriodEndsAt": "2026-12-09T00:00:00Z",
    "rewardId": "reward-789",
    "issuedBy": "system"
  }
}
```

---

### 11. StoreCreditRedeemedEvent

**Purpose**: Published when store credit is redeemed (partially or fully)

```typescript
interface StoreCreditRedeemedEvent {
  eventId: UUID;
  eventType: 'store_credit.redeemed';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID; // creditId
  businessId: UUID;
  data: {
    customerId: UUID;
    amountRedeemed: Money;
    balanceRemaining: Money;
    externalTransactionId?: string; // Order ID
    transactionId: UUID; // Store credit transaction ID
  };
}
```

**Consumers**:
- Customer Service: Update wallet balance
- Notification Service: Send redemption confirmation
- Analytics Service: Track redemption patterns
- Accounting Service: Recognize revenue

---

### 12. StoreCreditExpiredEvent

**Purpose**: Published when store credit reaches expiration date (enters grace period)

```typescript
interface StoreCreditExpiredEvent {
  eventId: UUID;
  eventType: 'store_credit.expired';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    balanceAtExpiration: Money;
    expiresAt: Date;
    gracePeriodEndsAt: Date;
  };
}
```

**Consumers**:
- Notification Service: Warn customer about grace period
- Analytics Service: Track expiration metrics

---

### 13. StoreCreditBreakageRecognizedEvent

**Purpose**: Published when grace period ends and credit becomes fully expired (breakage revenue recognized)

```typescript
interface StoreCreditBreakageRecognizedEvent {
  eventId: UUID;
  eventType: 'store_credit.breakage_recognized';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    breakageAmount: Money;
    originalAmount: Money;
    issuedAt: Date;
    expiresAt: Date;
    gracePeriodEndsAt: Date;
    fullyExpiredAt: Date;
  };
}
```

**Consumers**:
- Accounting Service: Recognize breakage revenue
- Analytics Service: Track breakage rates
- Compliance Service: Ensure regulatory compliance (IFRS 15)

**Accounting Treatment**:
```typescript
// On issuance: Debit Cash, Credit Deferred Revenue Liability
// On redemption: Debit Deferred Revenue, Credit Revenue
// On breakage: Debit Deferred Revenue, Credit Breakage Revenue
```

---

### 14. StoreCreditExtendedEvent

**Purpose**: Published when credit expiration date is extended

```typescript
interface StoreCreditExtendedEvent {
  eventId: UUID;
  eventType: 'store_credit.extended';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    oldExpiresAt: Date;
    newExpiresAt: Date;
    additionalMonths: number;
    extendedBy: UUID; // User who authorized extension
    reason: string;
  };
}
```

**Consumers**:
- Audit Service: Log extension for compliance
- Notification Service: Notify customer of extension
- Analytics Service: Track extension patterns

---

### 15. StoreCreditReversedEvent (NEW v2.0.0)

**Purpose**: Published when credit redemption is reversed (refund/compensation)

```typescript
interface StoreCreditReversedEvent {
  eventId: UUID;
  eventType: 'store_credit.reversed';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    amountRestored: Money;
    balanceAfter: Money;
    originalTransactionId: UUID;
    reversalReason: string;
    reversedBy: UUID;
  };
}
```

**Consumers**:
- Customer Service: Update wallet balance
- Notification Service: Notify customer of reversal
- Accounting Service: Reverse revenue recognition

---

## Digital Reward Events (NEW v2.0.0)

### 16. DigitalRewardIssuedEvent

**Purpose**: Published when digital reward is issued to customer

```typescript
interface DigitalRewardIssuedEvent {
  eventId: UUID;
  eventType: 'digital_reward.issued';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID; // rewardId
  businessId: UUID;
  data: {
    customerId: UUID;
    amount: Money;
    currency: string;
    method: RewardMethod; // promotional, referral, milestone, compensation
    reason?: string;
    merchantId?: UUID; // For merchant-specific rewards
    partnerId?: UUID; // For partner network rewards
    expiresAt: Date;
    gracePeriodEndsAt: Date;
    campaignId?: UUID;
    issuedBy: UUID;
  };
}
```

**Consumers**:
- Customer Service: Update wallet balance
- Notification Service: Notify customer of reward
- Analytics Service: Track reward issuance
- Partner Service: Notify partner if partner reward

---

### 17. DigitalRewardRedeemedEvent

**Purpose**: Published when digital reward is redeemed

```typescript
interface DigitalRewardRedeemedEvent {
  eventId: UUID;
  eventType: 'digital_reward.redeemed';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    amountRedeemed: Money;
    balanceRemaining: Money;
    merchantId?: string; // Where it was redeemed
    externalTransactionId?: string;
    transactionId: UUID;
  };
}
```

**Consumers**:
- Customer Service: Update wallet balance
- Notification Service: Send redemption confirmation
- Analytics Service: Track redemption patterns
- Partner Service: Notify partner of redemption

---

### 18. DigitalRewardExpiredEvent

**Purpose**: Published when digital reward reaches expiration date

```typescript
interface DigitalRewardExpiredEvent {
  eventId: UUID;
  eventType: 'digital_reward.expired';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    balanceAtExpiration: Money;
    expiresAt: Date;
    gracePeriodEndsAt: Date;
    merchantId?: UUID;
  };
}
```

**Consumers**:
- Notification Service: Warn customer about grace period
- Analytics Service: Track expiration metrics

---

### 19. DigitalRewardBreakageRecognizedEvent

**Purpose**: Published when grace period ends and reward becomes fully expired

```typescript
interface DigitalRewardBreakageRecognizedEvent {
  eventId: UUID;
  eventType: 'digital_reward.breakage_recognized';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    breakageAmount: Money;
    originalAmount: Money;
    issuedAt: Date;
    expiresAt: Date;
    gracePeriodEndsAt: Date;
    fullyExpiredAt: Date;
    merchantId?: UUID;
  };
}
```

**Consumers**:
- Accounting Service: Recognize breakage revenue
- Analytics Service: Track breakage rates
- Partner Service: Update partner reporting

---

### 20. DigitalRewardExtendedEvent

**Purpose**: Published when reward expiration is extended

```typescript
interface DigitalRewardExtendedEvent {
  eventId: UUID;
  eventType: 'digital_reward.extended';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    oldExpiresAt: Date;
    newExpiresAt: Date;
    additionalMonths: number;
    extendedBy: UUID;
    reason: string;
  };
}
```

**Consumers**:
- Audit Service: Log extension
- Notification Service: Notify customer
- Analytics Service: Track extension patterns

---

### 21. DigitalRewardReversedEvent

**Purpose**: Published when reward redemption is reversed

```typescript
interface DigitalRewardReversedEvent {
  eventId: UUID;
  eventType: 'digital_reward.reversed';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID;
  businessId: UUID;
  data: {
    customerId: UUID;
    amountRestored: Money;
    balanceAfter: Money;
    originalTransactionId: UUID;
    reversalReason: string;
    reversedBy: UUID;
  };
}
```

---

## Wallet Redemption Events (NEW v2.0.0)

### 22. WalletRedemptionStartedEvent

**Purpose**: Published when multi-tender wallet redemption begins (Saga start)

```typescript
interface WalletRedemptionStartedEvent {
  eventId: UUID;
  eventType: 'wallet.redemption.started';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID; // sagaId
  businessId: UUID;
  data: {
    sagaId: UUID;
    customerId: UUID;
    cartTotal: Money;
    currency: string;
    depletionOrder: DepletionRule[];
    externalTransactionId?: string;
  };
}
```

**Consumers**:
- Analytics Service: Track multi-tender usage
- Saga Coordinator: Begin saga orchestration

---

### 23. WalletRedemptionCompletedEvent

**Purpose**: Published when multi-tender wallet redemption completes successfully

```typescript
interface WalletRedemptionCompletedEvent {
  eventId: UUID;
  eventType: 'wallet.redemption.completed';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID; // sagaId
  businessId: UUID;
  data: {
    sagaId: UUID;
    customerId: UUID;
    breakdown: RedemptionBreakdown[];
    totalRedeemed: Money;
    remainingToPay: Money;
    externalTransactionId?: string;
  };
}

interface RedemptionBreakdown {
  type: BalanceType; // digital_rewards, store_credit, points
  amount: Money;
  transactionId: UUID;
}
```

**Consumers**:
- Customer Service: Update wallet balance
- Notification Service: Send redemption summary
- Analytics Service: Track multi-tender metrics
- Accounting Service: Recognize revenue for each type

---

### 24. WalletRedemptionFailedEvent

**Purpose**: Published when multi-tender redemption fails (Saga rollback)

```typescript
interface WalletRedemptionFailedEvent {
  eventId: UUID;
  eventType: 'wallet.redemption.failed';
  version: '1.0';
  timestamp: Date;
  aggregateId: UUID; // sagaId
  businessId: UUID;
  data: {
    sagaId: UUID;
    customerId: UUID;
    cartTotal: Money;
    failureReason: string;
    completedSteps: string[]; // Which steps succeeded before failure
    compensatedSteps: string[]; // Which steps were rolled back
    failedStep?: string;
  };
}
```

**Consumers**:
- Error Monitoring: Alert on saga failures
- Analytics Service: Track failure patterns
- Saga Coordinator: Handle compensation completion

---

## Event Publishing

### Event Bus Interface

```typescript
interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
}

interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
}
```

### Implementation (Redis Pub/Sub)

```typescript
class RedisEventBus implements EventBus {
  constructor(private redis: Redis) {}

  async publish(event: DomainEvent): Promise<void> {
    const channel = `events:${event.eventType}`;
    await this.redis.publish(channel, JSON.stringify(event));
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    for (const event of events) {
      const channel = `events:${event.eventType}`;
      pipeline.publish(channel, JSON.stringify(event));
    }
    await pipeline.exec();
  }

  subscribe(eventType: string, handler: EventHandler): void {
    const channel = `events:${eventType}`;
    this.redis.subscribe(channel, async (message) => {
      const event = JSON.parse(message);
      await handler.handle(event);
    });
  }
}
```

---

## Event Handling Patterns

### 1. At-Least-Once Delivery

Events may be delivered multiple times. Handlers must be idempotent:

```typescript
class PointsEarnedHandler implements EventHandler {
  private processedEvents = new Set<UUID>();

  async handle(event: PointsEarnedEvent): Promise<void> {
    // Check if already processed
    if (this.processedEvents.has(event.eventId)) {
      return;
    }

    // Process event
    await this.analyticsService.trackPointsEarned(event.data);

    // Mark as processed
    this.processedEvents.add(event.eventId);
  }
}
```

### 2. Event Sourcing (Optional)

Store all events for audit/replay:

```typescript
interface EventStore {
  append(event: DomainEvent): Promise<void>;
  getEvents(aggregateId: UUID): Promise<DomainEvent[]>;
  replay(aggregateId: UUID): Promise<AggregateRoot>;
}

class PrismaEventStore implements EventStore {
  async append(event: DomainEvent): Promise<void> {
    await this.prisma.domainEvent.create({
      data: {
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        data: event.data,
        timestamp: event.timestamp,
      },
    });
  }

  async getEvents(aggregateId: UUID): Promise<DomainEvent[]> {
    const events = await this.prisma.domainEvent.findMany({
      where: { aggregateId },
      orderBy: { timestamp: 'asc' },
    });
    return events.map((e) => this.toDomain(e));
  }
}
```

### 3. Saga Pattern (Cross-Aggregate Transactions)

Coordinate multiple aggregates:

```typescript
class EnrollmentSaga {
  async handle(event: CustomerEnrolledEvent): Promise<void> {
    // Step 1: Check for signup bonus
    const bonus = await this.rewardService.getSignupBonus(event.data.programId);

    if (bonus) {
      // Step 2: Award signup bonus
      const command = new AwardSignupBonusCommand(
        event.data.customerId,
        event.data.programId,
        bonus.points
      );
      await this.commandBus.send(command);
    }

    // Step 3: Send welcome notification
    await this.notificationService.sendWelcome(
      event.data.customerId,
      event.data.programName
    );
  }
}
```

---

## Event Schema Versioning

### Backward Compatibility

```typescript
// Version 1.0
interface PointsEarnedEventV1 {
  eventType: 'loyalty.points.earned';
  version: '1.0';
  data: {
    points: number;
  };
}

// Version 2.0 (added expiresAt)
interface PointsEarnedEventV2 {
  eventType: 'loyalty.points.earned';
  version: '2.0';
  data: {
    points: number;
    expiresAt?: Date; // New field (optional for backward compatibility)
  };
}

// Handler supports both versions
class PointsEarnedHandler {
  async handle(event: PointsEarnedEventV1 | PointsEarnedEventV2): Promise<void> {
    const points = event.data.points;
    const expiresAt = event.version === '2.0' ? event.data.expiresAt : undefined;

    await this.process(points, expiresAt);
  }
}
```

---

## Event Monitoring

### Metrics to Track

```typescript
// Event publishing metrics
metrics.increment('events.published', {
  eventType: event.eventType,
  aggregateType: 'LoyaltyProgram',
});

// Event processing metrics
metrics.timing('events.processing_time', duration, {
  eventType: event.eventType,
  handler: 'PointsEarnedHandler',
});

// Event failures
metrics.increment('events.failed', {
  eventType: event.eventType,
  error: error.message,
});
```

### Dead Letter Queue

Handle failed events:

```typescript
class EventRetryHandler {
  async handle(event: DomainEvent): Promise<void> {
    try {
      await this.processEvent(event);
    } catch (error) {
      if (event.retryCount < 3) {
        // Retry with exponential backoff
        await this.scheduleRetry(event, event.retryCount + 1);
      } else {
        // Move to dead letter queue
        await this.deadLetterQueue.add(event, error);
      }
    }
  }
}
```

---

## References

- [AGGREGATES.md](./AGGREGATES.md) - Aggregate implementations that publish these events
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md) - Domain services that coordinate cross-aggregate events
- [BUSINESS-RULES.md](./BUSINESS-RULES.md) - Business rules that trigger events
- [VALUE-OBJECTS.md](./VALUE-OBJECTS.md) - Value objects used in event payloads
- [AsyncAPI Contract](../../../contracts/events.asyncapi.yaml) - Event schema contracts

**Feature Specifications**:
- [Store Credit Feature Spec](../../features/store-credit/FEATURE-SPEC.md) - Store credit event flows
- [Gift Cards Feature Spec](../../features/gift-cards/FEATURE-SPEC.md) - Digital reward event flows
- [Unified Wallet Feature Spec](../../features/unified-wallet/FEATURE-SPEC.md) - Wallet redemption saga events

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)
