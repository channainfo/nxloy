# Loyalty Domain - Aggregates

**Domain**: Loyalty
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

Aggregates are clusters of domain objects (entities and value objects) that are treated as a single unit for data changes. Each aggregate has a root entity that controls access to its children.

## Aggregate Design Principles

1. **Single Root**: Only the root can be referenced from outside
2. **Transaction Boundary**: Changes within aggregate are atomic
3. **Consistency Boundary**: Invariants enforced within aggregate
4. **Small Aggregates**: Keep aggregates as small as possible
5. **Reference by ID**: Aggregates reference each other by ID, not object

---

## 1. LoyaltyProgram Aggregate

**Root**: LoyaltyProgram
**Children**: LoyaltyRule[], Tier[]

### Structure

```typescript
class LoyaltyProgramAggregate {
  private constructor(
    public readonly id: UUID,
    public readonly businessId: UUID,
    private name: string,
    private description: string,
    private status: ProgramStatus,
    private startDate: Date,
    private endDate: Date | null,
    private enrollmentSettings: EnrollmentSettings,
    private rules: LoyaltyRule[],
    private tiers: Tier[],
    private templateId: UUID | null,
    public readonly createdAt: Date,
    private updatedAt: Date
  ) {
    this.validateInvariants();
  }

  // Factory method
  public static create(
    businessId: UUID,
    name: string,
    description: string,
    enrollmentSettings: EnrollmentSettings,
    templateId?: UUID
  ): LoyaltyProgramAggregate {
    const program = new LoyaltyProgramAggregate(
      generateUUID(),
      businessId,
      name,
      description,
      ProgramStatus.DRAFT,
      new Date(),
      null,
      enrollmentSettings,
      [],
      [],
      templateId || null,
      new Date(),
      new Date()
    );

    program.addDomainEvent(new LoyaltyProgramCreatedEvent(program.id, businessId));
    return program;
  }

  // Business methods
  public activate(): void {
    if (this.status !== ProgramStatus.DRAFT) {
      throw new Error('Can only activate draft programs');
    }
    if (this.rules.length === 0) {
      throw new Error('Cannot activate program without rules');
    }

    this.status = ProgramStatus.ACTIVE;
    this.updatedAt = new Date();
    this.addDomainEvent(new LoyaltyProgramActivatedEvent(this.id, this.businessId));
  }

  public pause(): void {
    if (this.status !== ProgramStatus.ACTIVE) {
      throw new Error('Can only pause active programs');
    }

    this.status = ProgramStatus.PAUSED;
    this.updatedAt = new Date();
    this.addDomainEvent(new LoyaltyProgramPausedEvent(this.id, this.businessId));
  }

  public resume(): void {
    if (this.status !== ProgramStatus.PAUSED) {
      throw new Error('Can only resume paused programs');
    }

    this.status = ProgramStatus.ACTIVE;
    this.updatedAt = new Date();
    this.addDomainEvent(new LoyaltyProgramResumedEvent(this.id, this.businessId));
  }

  public end(): void {
    if (this.status === ProgramStatus.ENDED) {
      throw new Error('Program already ended');
    }

    this.status = ProgramStatus.ENDED;
    this.endDate = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(new LoyaltyProgramEndedEvent(this.id, this.businessId));
  }

  public addRule(rule: LoyaltyRule): void {
    if (this.status === ProgramStatus.ACTIVE) {
      throw new Error('Cannot add rules to active program');
    }

    // MVP: Only one rule per program
    if (this.rules.length > 0) {
      throw new Error('Program already has a rule (MVP limitation)');
    }

    this.rules.push(rule);
    this.updatedAt = new Date();
  }

  public addTier(tier: Tier): void {
    this.validateTierRanges([...this.tiers, tier]);
    this.tiers.push(tier);
    this.updatedAt = new Date();
  }

  public canEnroll(customer: CustomerSnapshot): boolean {
    if (this.status !== ProgramStatus.ACTIVE) {
      return false;
    }
    return this.enrollmentSettings.canEnroll(customer);
  }

  // Invariant validation
  private validateInvariants(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Program name is required');
    }
    if (this.endDate && this.endDate < this.startDate) {
      throw new Error('End date must be after start date');
    }
    if (this.status === ProgramStatus.ACTIVE && this.rules.length === 0) {
      throw new Error('Active programs must have at least one rule');
    }
  }

  private validateTierRanges(tiers: Tier[]): void {
    const sorted = [...tiers].sort((a, b) => a.level - b.level);
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.maxPoints && current.maxPoints >= next.minPoints) {
        throw new Error('Tier ranges cannot overlap');
      }
    }
  }

  // Domain events
  private domainEvents: DomainEvent[] = [];

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
```

### Invariants

1. Program must have a name
2. End date (if set) must be after start date
3. Active programs must have at least one rule
4. Cannot change rules on active programs
5. Tier ranges cannot overlap
6. Only one rule per program (MVP)

### Domain Events

- `loyalty.program.created`
- `loyalty.program.activated`
- `loyalty.program.paused`
- `loyalty.program.resumed`
- `loyalty.program.ended`

---

## 2. CustomerEnrollment Aggregate

**Root**: CustomerEnrollment
**Children**: LoyaltyTransaction[], LoyaltyProgress

### Structure

```typescript
class CustomerEnrollmentAggregate {
  private constructor(
    public readonly id: UUID,
    public readonly customerId: UUID,
    public readonly programId: UUID,
    private status: EnrollmentStatus,
    private balance: PointBalance,
    private progress: LoyaltyProgress,
    private currentTierId: UUID | null,
    public readonly enrolledAt: Date,
    private lastActivityAt: Date,
    private transactions: LoyaltyTransaction[]
  ) {
    this.validateInvariants();
  }

  // Factory method
  public static create(
    customerId: UUID,
    programId: UUID,
    initialTierId?: UUID
  ): CustomerEnrollmentAggregate {
    const enrollment = new CustomerEnrollmentAggregate(
      generateUUID(),
      customerId,
      programId,
      EnrollmentStatus.ACTIVE,
      new PointBalance(0, 0, 0, 0),
      null as any, // Will be set by domain service
      initialTierId || null,
      new Date(),
      new Date(),
      []
    );

    enrollment.addDomainEvent(
      new CustomerEnrolledEvent(enrollment.id, customerId, programId)
    );
    return enrollment;
  }

  // Business methods
  public earnPoints(
    points: number,
    referenceType: string,
    referenceId: UUID,
    description: string,
    expiresAt?: Date
  ): void {
    if (this.status !== EnrollmentStatus.ACTIVE) {
      throw new Error('Can only earn points on active enrollments');
    }
    if (points <= 0) {
      throw new Error('Points must be positive');
    }

    const transaction = new LoyaltyTransaction(
      generateUUID(),
      this.id,
      TransactionType.EARN,
      points,
      referenceType,
      referenceId,
      description,
      {},
      new Date(),
      new Date(),
      expiresAt
    );

    this.transactions.push(transaction);
    this.balance = this.balance.add(points, expiresAt);
    this.lastActivityAt = new Date();

    this.addDomainEvent(
      new PointsEarnedEvent(
        this.id,
        this.customerId,
        this.programId,
        points,
        this.balance.totalPoints
      )
    );
  }

  public redeemPoints(
    points: number,
    referenceType: string,
    referenceId: UUID,
    description: string
  ): void {
    if (this.status !== EnrollmentStatus.ACTIVE) {
      throw new Error('Can only redeem points on active enrollments');
    }
    if (!this.balance.canRedeem(points)) {
      throw new Error('Insufficient points');
    }

    const transaction = new LoyaltyTransaction(
      generateUUID(),
      this.id,
      TransactionType.REDEEM,
      -points,
      referenceType,
      referenceId,
      description,
      {},
      new Date(),
      new Date()
    );

    this.transactions.push(transaction);
    this.balance = this.balance.deduct(points);
    this.lastActivityAt = new Date();

    this.addDomainEvent(
      new PointsRedeemedEvent(
        this.id,
        this.customerId,
        this.programId,
        points,
        this.balance.totalPoints
      )
    );
  }

  public expirePoints(points: number): void {
    if (points <= 0) return;

    const transaction = new LoyaltyTransaction(
      generateUUID(),
      this.id,
      TransactionType.EXPIRE,
      -points,
      'EXPIRATION',
      this.id,
      'Points expired',
      {},
      new Date(),
      new Date()
    );

    this.transactions.push(transaction);
    this.balance = this.balance.deduct(points);

    this.addDomainEvent(
      new PointsExpiredEvent(this.id, this.customerId, this.programId, points)
    );
  }

  public upgradeTier(newTierId: UUID, tierName: string): void {
    if (this.currentTierId === newTierId) {
      throw new Error('Already at this tier');
    }

    const oldTierId = this.currentTierId;
    this.currentTierId = newTierId;

    this.addDomainEvent(
      new TierUpgradedEvent(
        this.id,
        this.customerId,
        this.programId,
        oldTierId,
        newTierId,
        tierName
      )
    );
  }

  public pauseEnrollment(): void {
    if (this.status !== EnrollmentStatus.ACTIVE) {
      throw new Error('Can only pause active enrollments');
    }

    this.status = EnrollmentStatus.PAUSED;
    this.addDomainEvent(
      new EnrollmentPausedEvent(this.id, this.customerId, this.programId)
    );
  }

  public resumeEnrollment(): void {
    if (this.status !== EnrollmentStatus.PAUSED) {
      throw new Error('Can only resume paused enrollments');
    }

    this.status = EnrollmentStatus.ACTIVE;
    this.addDomainEvent(
      new EnrollmentResumedEvent(this.id, this.customerId, this.programId)
    );
  }

  public cancelEnrollment(): void {
    if (this.status === EnrollmentStatus.CANCELLED) {
      throw new Error('Enrollment already cancelled');
    }

    this.status = EnrollmentStatus.CANCELLED;
    this.addDomainEvent(
      new EnrollmentCancelledEvent(this.id, this.customerId, this.programId)
    );
  }

  // Queries
  public getBalance(): PointBalance {
    return this.balance;
  }

  public getTransactionHistory(limit: number = 10): LoyaltyTransaction[] {
    return this.transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Invariant validation
  private validateInvariants(): void {
    if (this.balance.totalPoints < 0) {
      throw new Error('Point balance cannot be negative');
    }
  }

  // Domain events
  private domainEvents: DomainEvent[] = [];

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
```

### Invariants

1. Point balance cannot be negative
2. Cannot earn/redeem on inactive enrollments
3. Cannot redeem more points than available
4. Transactions are immutable once created
5. Status transitions must be valid

### Domain Events

- `loyalty.customer.enrolled`
- `loyalty.points.earned`
- `loyalty.points.redeemed`
- `loyalty.points.expired`
- `loyalty.tier.upgraded`
- `loyalty.enrollment.paused`
- `loyalty.enrollment.resumed`
- `loyalty.enrollment.cancelled`

---

## Aggregate Boundaries

### Why These Boundaries?

**LoyaltyProgram Aggregate**:
- Controls program configuration and rules
- Small, focused on program management
- Rules and tiers are part of configuration
- Transactions are NOT part of this aggregate (separate lifecycle)

**CustomerEnrollment Aggregate**:
- Controls customer participation and point balance
- Transactions are children (audit trail)
- Progress tracking is tightly coupled
- Tier membership is reference (by ID)

### Cross-Aggregate Operations

Operations spanning multiple aggregates must use domain services:

```typescript
class EnrollCustomerService {
  async execute(
    customerId: UUID,
    programId: UUID
  ): Promise<CustomerEnrollmentAggregate> {
    // Load program aggregate
    const program = await this.programRepo.findById(programId);

    // Check eligibility
    const customer = await this.customerRepo.findById(customerId);
    if (!program.canEnroll(customer)) {
      throw new Error('Customer not eligible');
    }

    // Create enrollment aggregate
    const enrollment = CustomerEnrollmentAggregate.create(
      customerId,
      programId,
      program.getDefaultTierId()
    );

    // Save
    await this.enrollmentRepo.save(enrollment);

    // Publish events
    await this.eventBus.publishAll(enrollment.getDomainEvents());
    enrollment.clearDomainEvents();

    return enrollment;
  }
}
```

## Concurrency Control

### Optimistic Locking

Use version numbers to prevent lost updates:

```typescript
interface AggregateRoot {
  version: number;
}

// Update with version check
UPDATE customer_enrollments
SET balance = $1, version = version + 1
WHERE id = $2 AND version = $3;

// If no rows updated, version mismatch (concurrent update)
```

## References

- [ENTITIES.md](./ENTITIES.md)
- [VALUE-OBJECTS.md](./VALUE-OBJECTS.md)
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md)
- [DOMAIN-EVENTS.md](./DOMAIN-EVENTS.md)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-07
