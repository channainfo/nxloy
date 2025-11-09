# Event Integration Guide

**Version**: 1.0
**Last Updated**: 2025-11-07
 (NxLoy Platform)

## Overview

This guide explains how to integrate with NxLoy's event-driven architecture using domain events, webhooks, and message queues.

## Event-Driven Architecture

NxLoy uses events to communicate between domains and with external systems:

```
┌──────────────┐     Publish      ┌────────────┐     Subscribe    ┌─────────────┐
│   Domain     │ ───────────────> │ Event Bus  │ ──────────────> │  Consumer   │
│  (Producer)  │                  │  (Redis)   │                 │  (Handler)  │
└──────────────┘                  └────────────┘                 └─────────────┘
```

## Domain Events

### Event Format

All events follow AsyncAPI 2.6.0 specification:

```typescript
interface DomainEvent {
  eventId: string;          // Unique event ID
  eventType: string;        // e.g., "loyalty.points.earned"
  version: string;          // Schema version (e.g., "1.0")
  timestamp: Date;          // Event occurrence time
  aggregateId: string;      // ID of affected aggregate
  businessId?: string;      // Tenant ID (for multi-tenancy)
  data: Record<string, any>; // Event-specific payload
  metadata?: {
    correlationId?: string; // Request correlation ID
    causationId?: string;   // Parent event ID
    userId?: string;        // User who triggered event
  };
}
```

### Event Catalog

Full event catalog: [/docs/contracts/events.asyncapi.yaml](../../contracts/events.asyncapi.yaml)

#### Loyalty Domain Events

| Event Type | Description | Payload |
|------------|-------------|---------|
| `loyalty.program.created` | Program created | programId, businessId, name |
| `loyalty.program.activated` | Program activated | programId, businessId |
| `loyalty.customer.enrolled` | Customer enrolled | enrollmentId, customerId, programId |
| `loyalty.points.earned` | Points earned | enrollmentId, points, totalPoints |
| `loyalty.points.redeemed` | Points redeemed | enrollmentId, points, remainingPoints |
| `loyalty.tier.upgraded` | Tier upgraded | enrollmentId, fromTier, toTier |

#### Rewards Domain Events

| Event Type | Description |
|------------|-------------|
| `reward.created` | Reward added to catalog |
| `reward.redeemed` | Reward exchanged for points |
| `reward.fulfilled` | Reward delivered to customer |

#### Customer Domain Events

| Event Type | Description |
|------------|-------------|
| `customer.created` | New customer profile |
| `customer.updated` | Profile updated |
| `customer.segmented` | Customer added to segment |

---

## Internal Event Integration

### Publishing Events (Backend)

#### From Aggregates

```typescript
class CustomerEnrollmentAggregate {
  private domainEvents: DomainEvent[] = [];

  earnPoints(points: number): void {
    // Business logic...
    this.balance = this.balance.add(points);

    // Add domain event
    this.addDomainEvent({
      eventId: generateUUID(),
      eventType: 'loyalty.points.earned',
      version: '1.0',
      timestamp: new Date(),
      aggregateId: this.id,
      businessId: this.businessId,
      data: {
        customerId: this.customerId,
        programId: this.programId,
        pointsEarned: points,
        totalPoints: this.balance.totalPoints,
      },
    });
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
```

#### From Domain Services

```typescript
class EarnPointsService {
  async execute(customerId: UUID, programId: UUID, points: number): Promise<void> {
    const enrollment = await this.enrollmentRepo.findByCustomerAndProgram(
      customerId,
      programId
    );

    enrollment.earnPoints(points);
    await this.enrollmentRepo.save(enrollment);

    // Publish events
    const events = enrollment.getDomainEvents();
    await this.eventBus.publishAll(events);
    enrollment.clearDomainEvents();
  }
}
```

### Event Bus Implementation

```typescript
interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
}

class RedisEventBus implements EventBus {
  constructor(private redis: Redis) {}

  async publish(event: DomainEvent): Promise<void> {
    const channel = `events:${event.eventType}`;
    await this.redis.publish(channel, JSON.stringify(event));

    // Also store in event store (optional)
    await this.eventStore.append(event);
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

### Subscribing to Events

```typescript
interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
}

class PointsEarnedHandler implements EventHandler {
  async handle(event: DomainEvent): Promise<void> {
    // Idempotency check
    if (await this.isProcessed(event.eventId)) {
      return;
    }

    // Process event
    await this.analyticsService.trackPointsEarned(event.data);
    await this.notificationService.notifyCustomer(event.data.customerId);

    // Mark as processed
    await this.markProcessed(event.eventId);
  }

  private async isProcessed(eventId: string): Promise<boolean> {
    return await this.redis.exists(`processed:${eventId}`);
  }

  private async markProcessed(eventId: string): Promise<void> {
    await this.redis.set(`processed:${eventId}`, '1', 'EX', 86400); // 24h TTL
  }
}
```

---

## External Event Integration (Webhooks)

### Webhook Configuration

Configure webhooks in the dashboard or via API:

```http
POST /api/v1/webhooks
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://your-server.com/webhooks/nxloy",
  "events": [
    "loyalty.points.earned",
    "loyalty.points.redeemed",
    "reward.fulfilled"
  ],
  "secret": "whsec_abc123..."
}
```

### Webhook Payload

```http
POST https://your-server.com/webhooks/nxloy
Content-Type: application/json
X-NxLoy-Signature: sha256=abc123...
X-NxLoy-Event-Type: loyalty.points.earned
X-NxLoy-Event-Id: evt-123

{
  "eventId": "evt-123",
  "eventType": "loyalty.points.earned",
  "version": "1.0",
  "timestamp": "2025-11-07T10:00:00Z",
  "aggregateId": "enrollment-456",
  "businessId": "biz-789",
  "data": {
    "customerId": "cust-111",
    "programId": "prog-222",
    "pointsEarned": 50,
    "totalPoints": 250
  }
}
```

### Webhook Handler (Your Server)

```typescript
import express from 'express';
import crypto from 'crypto';

const app = express();

app.post('/webhooks/nxloy', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-nxloy-signature'] as string;
  const payload = req.body.toString();

  // Verify signature
  if (!verifySignature(payload, signature, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(payload);

  // Handle event
  switch (event.eventType) {
    case 'loyalty.points.earned':
      await handlePointsEarned(event);
      break;
    case 'loyalty.points.redeemed':
      await handlePointsRedeemed(event);
      break;
    default:
      console.log(`Unhandled event: ${event.eventType}`);
  }

  // Respond immediately (within 5 seconds)
  res.status(200).send('OK');
});

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Webhook Best Practices

1. **Respond Quickly**: Return 200 within 5 seconds
2. **Process Asynchronously**: Queue events for background processing
3. **Idempotency**: Check `eventId` to avoid duplicate processing
4. **Retry Logic**: NxLoy retries failed webhooks with exponential backoff
5. **Verify Signatures**: Always validate `X-NxLoy-Signature`
6. **Log Events**: Store webhooks for debugging

---

## Event Patterns

### 1. Saga Pattern (Multi-Step Workflows)

Coordinate multiple domains:

```typescript
class EnrollmentSaga {
  async handle(event: CustomerEnrolledEvent): Promise<void> {
    // Step 1: Check for signup bonus
    const bonus = await this.rewardService.getSignupBonus(event.data.programId);

    if (bonus) {
      // Step 2: Award signup bonus
      await this.loyaltyService.earnPoints({
        customerId: event.data.customerId,
        programId: event.data.programId,
        points: bonus.points,
        description: 'Signup bonus',
      });
    }

    // Step 3: Send welcome notification
    await this.notificationService.sendWelcomeEmail(event.data.customerId);
  }
}
```

### 2. Event Sourcing (Optional)

Store all events as source of truth:

```typescript
class EventStore {
  async append(event: DomainEvent): Promise<void> {
    await this.db.domainEvent.create({
      data: {
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        data: event.data,
        timestamp: event.timestamp,
      },
    });
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const events = await this.db.domainEvent.findMany({
      where: { aggregateId },
      orderBy: { timestamp: 'asc' },
    });
    return events.map(this.toDomain);
  }

  async replay(aggregateId: string): Promise<CustomerEnrollmentAggregate> {
    const events = await this.getEvents(aggregateId);
    const aggregate = new CustomerEnrollmentAggregate();
    events.forEach(event => aggregate.apply(event));
    return aggregate;
  }
}
```

### 3. CQRS (Command Query Responsibility Segregation)

Separate read/write models:

```typescript
// Write model (commands)
class EarnPointsCommand {
  constructor(
    public customerId: string,
    public programId: string,
    public points: number
  ) {}
}

class EarnPointsHandler {
  async handle(command: EarnPointsCommand): Promise<void> {
    const enrollment = await this.enrollmentRepo.find(...);
    enrollment.earnPoints(command.points);
    await this.enrollmentRepo.save(enrollment);
    await this.eventBus.publish(enrollment.getDomainEvents());
  }
}

// Read model (queries)
class EnrollmentReadModel {
  async getCustomerBalance(customerId: string): Promise<BalanceView> {
    // Optimized for reads
    return await this.readDb.query(`
      SELECT customer_id, SUM(points) as balance
      FROM loyalty_transactions
      WHERE customer_id = $1
      GROUP BY customer_id
    `, [customerId]);
  }
}

// Event handler updates read model
class PointsEarnedReadModelHandler implements EventHandler {
  async handle(event: PointsEarnedEvent): Promise<void> {
    await this.readDb.updateBalance(event.data.customerId, event.data.pointsEarned);
  }
}
```

---

## Monitoring and Debugging

### Event Metrics

Track key metrics:

```typescript
metrics.increment('events.published', {
  eventType: event.eventType,
  aggregateType: 'CustomerEnrollment',
});

metrics.timing('events.processing_time', duration, {
  eventType: event.eventType,
  handler: 'PointsEarnedHandler',
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
        await this.scheduleRetry(event, event.retryCount + 1);
      } else {
        await this.deadLetterQueue.add(event, error);
        await this.alertTeam(event, error);
      }
    }
  }
}
```

### Event Viewer (Dashboard)

View recent events in the dashboard: Settings > Events > Event Log

---

## References

- [AsyncAPI Specification](../../contracts/events.asyncapi.yaml)
- [Domain Events (Loyalty)](../domain-specs/loyalty/DOMAIN-EVENTS.md)
- [Webhook Configuration API](./API-INTEGRATION.md#webhooks)

---

**Document Owner**: Architecture Team
**Last Updated**: 2025-11-07
