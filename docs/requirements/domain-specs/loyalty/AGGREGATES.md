# Loyalty Domain - Aggregates

**Domain**: Loyalty
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)

## Overview

Aggregates are clusters of domain objects (entities and value objects) that are treated as a single unit for data changes. Each aggregate has a root entity that controls access to its children.

**v2.0.0 Changes**:
- Added `StoreCreditAggregate` for store credit lifecycle
- Added `DigitalRewardAggregate` for digital reward lifecycle
- Added `WalletAggregate` as virtual aggregate for unified balance view
- Updated concurrency control for multi-tender redemptions

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

## 3. StoreCredit Aggregate (NEW v2.0.0)

**Root**: StoreCredit
**Children**: StoreCreditTransaction[]

### Structure

```typescript
class StoreCreditAggregate {
  private constructor(
    public readonly id: UUID,
    public readonly businessId: UUID,
    public readonly customerId: UUID,
    private amount: Money,
    private balance: Money,
    private method: CreditMethod,
    private reason: string | null,
    private issuedBy: UUID,
    public readonly issuedAt: Date,
    private expiresAt: Date,
    private gracePeriodEndsAt: Date,
    private status: CreditStatus,
    private campaignId: UUID | null,
    private rewardId: UUID | null,
    private transactions: StoreCreditTransaction[],
    private metadata: Record<string, any>,
    public readonly createdAt: Date,
    private updatedAt: Date
  ) {
    this.validateInvariants();
  }

  // Factory method
  public static issue(
    businessId: UUID,
    customerId: UUID,
    amount: Money,
    method: CreditMethod,
    issuedBy: UUID,
    expirationPolicy: ExpirationPolicy,
    reason?: string,
    campaignId?: UUID,
    rewardId?: UUID
  ): StoreCreditAggregate {
    const issuedAt = new Date();
    const expiresAt = expirationPolicy.calculateExpirationDate(issuedAt);
    const gracePeriodEndsAt = expirationPolicy.calculateGracePeriodEnd(expiresAt);

    const credit = new StoreCreditAggregate(
      generateUUID(),
      businessId,
      customerId,
      amount,
      amount,  // Initial balance = amount
      method,
      reason || null,
      issuedBy,
      issuedAt,
      expiresAt,
      gracePeriodEndsAt,
      CreditStatus.ACTIVE,
      campaignId || null,
      rewardId || null,
      [],
      {},
      new Date(),
      new Date()
    );

    // Create issuance transaction
    const transaction = new StoreCreditTransaction(
      generateUUID(),
      businessId,
      credit.id,
      customerId,
      CreditTransactionType.ISSUED,
      amount,
      amount.currency,
      amount,  // Balance after = amount
      null,
      {},
      issuedAt,
      issuedAt
    );

    credit.transactions.push(transaction);

    credit.addDomainEvent(
      new StoreCreditIssuedEvent(
        credit.id,
        customerId,
        businessId,
        amount,
        expiresAt,
        method,
        reason
      )
    );

    return credit;
  }

  // Business methods
  public redeem(amountToRedeem: Money, externalTransactionId?: string): void {
    if (!this.isRedeemable()) {
      throw new Error(`Cannot redeem ${this.status} credit`);
    }

    if (amountToRedeem.currency !== this.balance.currency) {
      throw new Error('Currency mismatch');
    }

    if (amountToRedeem.greaterThan(this.balance)) {
      throw new Error('Insufficient credit balance');
    }

    // Update balance
    this.balance = this.balance.subtract(amountToRedeem);
    this.updatedAt = new Date();

    // Create redemption transaction
    const transaction = new StoreCreditTransaction(
      generateUUID(),
      this.businessId,
      this.id,
      this.customerId,
      CreditTransactionType.REDEEMED,
      amountToRedeem,
      this.balance.currency,
      this.balance,
      externalTransactionId || null,
      {},
      new Date(),
      new Date()
    );

    this.transactions.push(transaction);

    this.addDomainEvent(
      new StoreCreditRedeemedEvent(
        this.id,
        this.customerId,
        this.businessId,
        amountToRedeem,
        this.balance,
        externalTransactionId
      )
    );
  }

  public markExpired(): void {
    if (this.status !== CreditStatus.ACTIVE) {
      return;  // Already expired
    }

    const now = new Date();
    if (now < this.expiresAt) {
      throw new Error('Credit has not expired yet');
    }

    this.status = CreditStatus.EXPIRED;
    this.updatedAt = now;

    this.addDomainEvent(
      new StoreCreditExpiredEvent(
        this.id,
        this.customerId,
        this.businessId,
        this.balance,
        this.expiresAt
      )
    );
  }

  public markFullyExpired(): void {
    if (this.status === CreditStatus.FULLY_EXPIRED) {
      return;  // Already fully expired
    }

    const now = new Date();
    if (now < this.gracePeriodEndsAt) {
      throw new Error('Grace period has not ended yet');
    }

    const breakageAmount = this.balance;
    this.status = CreditStatus.FULLY_EXPIRED;
    this.balance = Money.zero(this.balance.currency);
    this.updatedAt = now;

    // Create expiration transaction
    const transaction = new StoreCreditTransaction(
      generateUUID(),
      this.businessId,
      this.id,
      this.customerId,
      CreditTransactionType.EXPIRED,
      breakageAmount,
      this.balance.currency,
      Money.zero(this.balance.currency),
      null,
      { reason: 'Grace period ended' },
      now,
      now
    );

    this.transactions.push(transaction);

    this.addDomainEvent(
      new StoreCreditBreakageRecognizedEvent(
        this.id,
        this.customerId,
        this.businessId,
        breakageAmount,
        this.gracePeriodEndsAt
      )
    );
  }

  public extendExpiration(additionalMonths: number, extendedBy: UUID, reason: string): void {
    if (this.status === CreditStatus.FULLY_EXPIRED) {
      throw new Error('Cannot extend fully expired credit');
    }

    const oldExpiresAt = this.expiresAt;
    this.expiresAt = new Date(oldExpiresAt);
    this.expiresAt.setMonth(this.expiresAt.getMonth() + additionalMonths);

    const expirationPolicy = ExpirationPolicy.default();
    this.gracePeriodEndsAt = expirationPolicy.calculateGracePeriodEnd(this.expiresAt);

    // Reset status to active if was expired but still in grace
    if (this.status === CreditStatus.EXPIRED) {
      this.status = CreditStatus.ACTIVE;
    }

    this.updatedAt = new Date();

    this.addDomainEvent(
      new StoreCreditExtendedEvent(
        this.id,
        this.customerId,
        this.businessId,
        oldExpiresAt,
        this.expiresAt,
        extendedBy,
        reason
      )
    );
  }

  // Queries
  public getBalance(): Money {
    return this.balance;
  }

  public isRedeemable(): boolean {
    return this.status === CreditStatus.ACTIVE || this.status === CreditStatus.EXPIRED;
  }

  public getTransactionHistory(): StoreCreditTransaction[] {
    return [...this.transactions].sort((a, b) =>
      b.transactionDate.getTime() - a.transactionDate.getTime()
    );
  }

  public shouldNotify(expirationPolicy: ExpirationPolicy, lastNotifiedDaysBefore?: number): number | null {
    return expirationPolicy.shouldNotify(this.expiresAt, lastNotifiedDaysBefore);
  }

  // Invariant validation
  private validateInvariants(): void {
    if (this.amount.amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    if (this.balance.amount < 0) {
      throw new Error('Balance cannot be negative');
    }

    if (this.balance.greaterThan(this.amount)) {
      throw new Error('Balance cannot exceed original amount');
    }

    if (this.gracePeriodEndsAt <= this.expiresAt) {
      throw new Error('Grace period end must be after expiration date');
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

1. Credit amount must be positive
2. Balance cannot be negative
3. Balance cannot exceed original amount
4. Cannot redeem expired (grace period ended) credits
5. Grace period end must be after expiration date
6. Currency must match for redemptions
7. Transactions are immutable once created

### Domain Events

- `store_credit.issued`
- `store_credit.redeemed`
- `store_credit.expired`
- `store_credit.breakage_recognized`
- `store_credit.extended`

---

## 4. DigitalReward Aggregate (NEW v2.0.0)

**Root**: DigitalReward
**Children**: DigitalRewardTransaction[]

### Structure

```typescript
class DigitalRewardAggregate {
  private constructor(
    public readonly id: UUID,
    public readonly businessId: UUID,
    public readonly customerId: UUID,
    private amount: Money,
    private balance: Money,
    private method: RewardMethod,
    private reason: string | null,
    private campaignId: UUID | null,
    private partnerId: UUID | null,
    private merchantId: UUID | null,  // For merchant-specific redemption
    private issuedBy: UUID,
    public readonly issuedAt: Date,
    private expiresAt: Date,
    private gracePeriodEndsAt: Date,
    private status: RewardStatus,
    private rewardId: UUID | null,
    private transactions: DigitalRewardTransaction[],
    private metadata: Record<string, any>,
    public readonly createdAt: Date,
    private updatedAt: Date
  ) {
    this.validateInvariants();
  }

  // Factory method
  public static issue(
    businessId: UUID,
    customerId: UUID,
    amount: Money,
    method: RewardMethod,
    issuedBy: UUID,
    expirationPolicy: ExpirationPolicy,
    reason?: string,
    campaignId?: UUID,
    partnerId?: UUID,
    merchantId?: UUID,
    rewardId?: UUID
  ): DigitalRewardAggregate {
    const issuedAt = new Date();
    const expiresAt = expirationPolicy.calculateExpirationDate(issuedAt);
    const gracePeriodEndsAt = expirationPolicy.calculateGracePeriodEnd(expiresAt);

    const reward = new DigitalRewardAggregate(
      generateUUID(),
      businessId,
      customerId,
      amount,
      amount,  // Initial balance = amount
      method,
      reason || null,
      campaignId || null,
      partnerId || null,
      merchantId || null,
      issuedBy,
      issuedAt,
      expiresAt,
      gracePeriodEndsAt,
      RewardStatus.ACTIVE,
      rewardId || null,
      [],
      {},
      new Date(),
      new Date()
    );

    // Create issuance transaction
    const transaction = new DigitalRewardTransaction(
      generateUUID(),
      businessId,
      reward.id,
      customerId,
      RewardTransactionType.ISSUED,
      amount,
      amount.currency,
      amount,
      null,
      {},
      issuedAt,
      issuedAt
    );

    reward.transactions.push(transaction);

    reward.addDomainEvent(
      new DigitalRewardIssuedEvent(
        reward.id,
        customerId,
        businessId,
        amount,
        expiresAt,
        method,
        merchantId,
        reason
      )
    );

    return reward;
  }

  // Business methods
  public redeem(
    amountToRedeem: Money,
    redeemingMerchantId: string | null,
    externalTransactionId?: string
  ): void {
    if (!this.isRedeemable()) {
      throw new Error(`Cannot redeem ${this.status} reward`);
    }

    // Validate merchant restriction
    if (this.merchantId && this.merchantId !== redeemingMerchantId) {
      throw new Error(
        `This reward can only be redeemed at merchant ${this.merchantId}, not ${redeemingMerchantId}`
      );
    }

    if (amountToRedeem.currency !== this.balance.currency) {
      throw new Error('Currency mismatch');
    }

    if (amountToRedeem.greaterThan(this.balance)) {
      throw new Error('Insufficient reward balance');
    }

    // Update balance
    this.balance = this.balance.subtract(amountToRedeem);
    this.updatedAt = new Date();

    // Create redemption transaction
    const transaction = new DigitalRewardTransaction(
      generateUUID(),
      this.businessId,
      this.id,
      this.customerId,
      RewardTransactionType.REDEEMED,
      amountToRedeem,
      this.balance.currency,
      this.balance,
      externalTransactionId || null,
      { merchantId: redeemingMerchantId },
      new Date(),
      new Date()
    );

    this.transactions.push(transaction);

    this.addDomainEvent(
      new DigitalRewardRedeemedEvent(
        this.id,
        this.customerId,
        this.businessId,
        amountToRedeem,
        this.balance,
        redeemingMerchantId,
        externalTransactionId
      )
    );
  }

  public markExpired(): void {
    if (this.status !== RewardStatus.ACTIVE) {
      return;
    }

    const now = new Date();
    if (now < this.expiresAt) {
      throw new Error('Reward has not expired yet');
    }

    this.status = RewardStatus.EXPIRED;
    this.updatedAt = now;

    this.addDomainEvent(
      new DigitalRewardExpiredEvent(
        this.id,
        this.customerId,
        this.businessId,
        this.balance,
        this.expiresAt
      )
    );
  }

  public markFullyExpired(): void {
    if (this.status === RewardStatus.FULLY_EXPIRED) {
      return;
    }

    const now = new Date();
    if (now < this.gracePeriodEndsAt) {
      throw new Error('Grace period has not ended yet');
    }

    const breakageAmount = this.balance;
    this.status = RewardStatus.FULLY_EXPIRED;
    this.balance = Money.zero(this.balance.currency);
    this.updatedAt = now;

    // Create expiration transaction
    const transaction = new DigitalRewardTransaction(
      generateUUID(),
      this.businessId,
      this.id,
      this.customerId,
      RewardTransactionType.EXPIRED,
      breakageAmount,
      this.balance.currency,
      Money.zero(this.balance.currency),
      null,
      { reason: 'Grace period ended' },
      now,
      now
    );

    this.transactions.push(transaction);

    this.addDomainEvent(
      new DigitalRewardBreakageRecognizedEvent(
        this.id,
        this.customerId,
        this.businessId,
        breakageAmount,
        this.gracePeriodEndsAt
      )
    );
  }

  public extendExpiration(additionalMonths: number, extendedBy: UUID, reason: string): void {
    if (this.status === RewardStatus.FULLY_EXPIRED) {
      throw new Error('Cannot extend fully expired reward');
    }

    const oldExpiresAt = this.expiresAt;
    this.expiresAt = new Date(oldExpiresAt);
    this.expiresAt.setMonth(this.expiresAt.getMonth() + additionalMonths);

    const expirationPolicy = ExpirationPolicy.default();
    this.gracePeriodEndsAt = expirationPolicy.calculateGracePeriodEnd(this.expiresAt);

    if (this.status === RewardStatus.EXPIRED) {
      this.status = RewardStatus.ACTIVE;
    }

    this.updatedAt = new Date();

    this.addDomainEvent(
      new DigitalRewardExtendedEvent(
        this.id,
        this.customerId,
        this.businessId,
        oldExpiresAt,
        this.expiresAt,
        extendedBy,
        reason
      )
    );
  }

  // Queries
  public getBalance(): Money {
    return this.balance;
  }

  public isRedeemable(): boolean {
    return this.status === RewardStatus.ACTIVE || this.status === RewardStatus.EXPIRED;
  }

  public isRedeemableAtMerchant(merchantId: string): boolean {
    return this.isRedeemable() && (!this.merchantId || this.merchantId === merchantId);
  }

  public getTransactionHistory(): DigitalRewardTransaction[] {
    return [...this.transactions].sort((a, b) =>
      b.transactionDate.getTime() - a.transactionDate.getTime()
    );
  }

  // Invariant validation
  private validateInvariants(): void {
    if (this.amount.amount <= 0) {
      throw new Error('Reward amount must be positive');
    }

    if (this.balance.amount < 0) {
      throw new Error('Balance cannot be negative');
    }

    if (this.balance.greaterThan(this.amount)) {
      throw new Error('Balance cannot exceed original amount');
    }

    if (this.gracePeriodEndsAt <= this.expiresAt) {
      throw new Error('Grace period end must be after expiration date');
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

1. Reward amount must be positive
2. Balance cannot be negative
3. Balance cannot exceed original amount
4. Cannot redeem at wrong merchant (if merchant restriction exists)
5. Grace period end must be after expiration date
6. Currency must match for redemptions
7. Transactions are immutable once created

### Domain Events

- `digital_reward.issued`
- `digital_reward.redeemed`
- `digital_reward.expired`
- `digital_reward.breakage_recognized`
- `digital_reward.extended`

---

## 5. Wallet Aggregate (NEW v2.0.0 - Virtual Aggregate)

**Root**: Wallet (Virtual - Computed from underlying balances)
**Children**: None (aggregates data from Points, StoreCredit, DigitalReward services)

### Structure

```typescript
class WalletAggregate {
  private constructor(
    public readonly customerId: UUID,
    public readonly businessId: UUID,
    private walletBalance: WalletBalance,
    private configuration: WalletConfiguration
  ) {}

  // Factory method (loads from services)
  public static async load(
    customerId: UUID,
    businessId: UUID,
    pointsService: PointsService,
    storeCreditService: StoreCreditService,
    digitalRewardService: DigitalRewardService,
    configService: WalletConfigurationService
  ): Promise<WalletAggregate> {
    // Fetch balances from underlying services
    const [points, storeCredit, digitalRewards, config] = await Promise.all([
      pointsService.getBalance(customerId),
      storeCreditService.getBalance(customerId),
      digitalRewardService.getBalance(customerId),
      configService.getConfiguration(businessId)
    ]);

    const walletBalance = new WalletBalance(
      points,
      storeCredit,
      digitalRewards,
      Money.zero('USD'),  // Will be calculated
      new Date()
    );

    return new WalletAggregate(
      customerId,
      businessId,
      walletBalance,
      config
    );
  }

  // Queries
  public getBalance(): WalletBalance {
    return this.walletBalance;
  }

  public getTotalValue(): Money {
    return this.walletBalance.calculateTotalValue(
      this.configuration.pointsToUsdRate
    );
  }

  public hasExpiringSoon(days: number = 30): boolean {
    return this.walletBalance.hasExpiringSoon(days);
  }

  public getExpiringValue(days: number = 30): Money {
    return this.walletBalance.getExpiringValue(days);
  }

  public getDepletionOrder(): DepletionOrder {
    return new DepletionOrder(
      this.configuration.depletionOrder,
      this.configuration.expirationOverride
    );
  }

  // Note: Wallet aggregate does NOT have domain events
  // Events are published by underlying aggregates (StoreCredit, DigitalReward, Points)
}
```

### Design Notes

**Virtual Aggregate Pattern**:
- Wallet is NOT persisted as a single table
- Represents computed state from multiple services
- No transactions or state changes within wallet
- Read-only aggregate for unified view
- Changes happen in underlying aggregates (StoreCredit, DigitalReward, Points)

**Why Virtual?**
- Avoids data duplication
- Single source of truth (underlying services)
- Balances always consistent
- Simpler concurrency control (no distributed locks needed for reads)

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

**StoreCredit Aggregate (NEW v2.0.0)**:
- Controls lifecycle of individual store credit
- Transactions are children (immutable audit trail)
- Small aggregate (one credit = one aggregate)
- Expiration managed within aggregate

**DigitalReward Aggregate (NEW v2.0.0)**:
- Controls lifecycle of individual digital reward
- Transactions are children (immutable audit trail)
- Merchant restriction enforced within aggregate
- Small aggregate (one reward = one aggregate)

**Wallet Aggregate (NEW v2.0.0)**:
- Virtual aggregate (no persistence)
- Read-only unified view
- Aggregates data from Points, StoreCredit, DigitalReward services
- No state changes or transactions

### Cross-Aggregate Operations

Operations spanning multiple aggregates must use domain services:

**Example 1: Enroll Customer (Program + Enrollment)**

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

**Example 2: Multi-Tender Redemption (Wallet + StoreCredit + DigitalReward + Points)** (NEW v2.0.0)

```typescript
class WalletRedemptionService {
  async execute(
    customerId: UUID,
    businessId: UUID,
    cartTotal: Money,
    depletionOrder: DepletionOrder
  ): Promise<WalletRedemptionResult> {
    const sagaId = generateUUID();
    const compensations: Array<() => Promise<void>> = [];

    try {
      // Acquire distributed lock
      const lockKey = `wallet:redemption:${customerId}:${cartTotal.currency}`;
      const lock = await this.redlock.acquire([lockKey], 5000);

      try {
        let remainingAmount = cartTotal;
        const breakdown: RedemptionBreakdown[] = [];

        // Step 1: Redeem digital rewards (if enabled)
        if (depletionOrder.canUse(BalanceType.DIGITAL_REWARDS, cartTotal, remainingAmount)) {
          const drAmount = await this.calculateRedemptionAmount(
            BalanceType.DIGITAL_REWARDS,
            remainingAmount,
            depletionOrder
          );

          if (drAmount.greaterThan(Money.zero(cartTotal.currency))) {
            const drResult = await this.digitalRewardService.redeem({
              customerId,
              amount: drAmount,
              currency: cartTotal.currency
            });

            compensations.push(async () => {
              await this.digitalRewardService.reverseRedemption(drResult.transactionId);
            });

            breakdown.push({
              type: BalanceType.DIGITAL_REWARDS,
              amount: drAmount,
              transactionId: drResult.transactionId
            });

            remainingAmount = remainingAmount.subtract(drAmount);
          }
        }

        // Step 2: Redeem store credit (if enabled)
        if (depletionOrder.canUse(BalanceType.STORE_CREDIT, cartTotal, remainingAmount)) {
          const scAmount = await this.calculateRedemptionAmount(
            BalanceType.STORE_CREDIT,
            remainingAmount,
            depletionOrder
          );

          if (scAmount.greaterThan(Money.zero(cartTotal.currency))) {
            const scResult = await this.storeCreditService.redeem({
              customerId,
              amount: scAmount,
              currency: cartTotal.currency
            });

            compensations.push(async () => {
              await this.storeCreditService.reverseRedemption(scResult.transactionId);
            });

            breakdown.push({
              type: BalanceType.STORE_CREDIT,
              amount: scAmount,
              transactionId: scResult.transactionId
            });

            remainingAmount = remainingAmount.subtract(scAmount);
          }
        }

        // Step 3: Redeem points (if enabled)
        if (depletionOrder.canUse(BalanceType.POINTS, cartTotal, remainingAmount)) {
          const ptsAmount = await this.calculateRedemptionAmount(
            BalanceType.POINTS,
            remainingAmount,
            depletionOrder
          );

          if (ptsAmount.greaterThan(Money.zero(cartTotal.currency))) {
            const ptsResult = await this.pointsService.redeem({
              customerId,
              amount: ptsAmount,
              currency: cartTotal.currency
            });

            compensations.push(async () => {
              await this.pointsService.reverseRedemption(ptsResult.transactionId);
            });

            breakdown.push({
              type: BalanceType.POINTS,
              amount: ptsAmount,
              transactionId: ptsResult.transactionId
            });

            remainingAmount = remainingAmount.subtract(ptsAmount);
          }
        }

        // All steps succeeded
        return {
          sagaId,
          breakdown,
          totalRedeemed: cartTotal.subtract(remainingAmount),
          remainingToPay: remainingAmount
        };

      } finally {
        await lock.release();
      }

    } catch (error) {
      // Saga failed → Execute compensations (rollback)
      this.logger.error(`Wallet redemption saga ${sagaId} failed:`, error);

      for (const compensate of compensations.reverse()) {
        try {
          await this.executeWithTimeout(compensate, 5000);
        } catch (compensationError) {
          this.logger.error(
            `Compensation failed for saga ${sagaId}:`,
            compensationError
          );
          // Escalate to manual intervention
          await this.alertService.notifyCompensationFailure(sagaId, compensationError);
        }
      }

      throw new WalletRedemptionError(
        `Failed to redeem wallet balances: ${error.message}`,
        sagaId
      );
    }
  }

  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
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

### Distributed Locking (NEW v2.0.0)

For multi-tender wallet redemptions, use Redis distributed locks to prevent double-spend:

```typescript
import Redlock from 'redlock';
import Redis from 'ioredis';

class WalletRedemptionService {
  private redlock: Redlock;

  constructor() {
    const redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379')
    });

    this.redlock = new Redlock([redisClient], {
      retryCount: 3,
      retryDelay: 200,  // 200ms between retries
      retryJitter: 200  // Random jitter
    });
  }

  async redeemWallet(
    customerId: UUID,
    currency: string,
    amount: Money
  ): Promise<RedemptionResult> {
    // Create lock key per customer + currency
    const lockKey = `wallet:redemption:${customerId}:${currency}`;

    // Acquire lock with 5-second TTL
    const lock = await this.redlock.acquire([lockKey], 5000);

    try {
      // Critical section: Check balance and execute redemption
      const balance = await this.getBalance(customerId, currency);
      if (balance.lessThan(amount)) {
        throw new InsufficientBalanceError();
      }

      const redemption = await this.executeRedemption({
        customerId,
        currency,
        amount
      });

      return redemption;

    } finally {
      // Always release lock
      await lock.release();
    }
  }
}
```

**Lock Strategy**:
- **Scope**: Lock per customer + currency (allow parallel redemptions for different customers)
- **TTL**: 5 seconds (sufficient for 3-step saga)
- **Retry**: 3 attempts with 200ms delay + jitter
- **Failure Mode**: If lock acquisition fails after retries, reject the redemption (fail-safe)

**Why Distributed Locks?**
- Prevent concurrent redemptions depleting the same balance
- Ensure FIFO order is respected (earliest expiration first)
- Protect against race conditions in multi-step saga
- Required for horizontal scaling (multiple API instances)

## References

- [ENTITIES.md](./ENTITIES.md) - Domain entities including StoreCredit, DigitalReward
- [VALUE-OBJECTS.md](./VALUE-OBJECTS.md) - Value objects including WalletBalance, DepletionOrder, ExpirationPolicy
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md) - Domain services for cross-aggregate operations
- [DOMAIN-EVENTS.md](./DOMAIN-EVENTS.md) - Domain events published by aggregates
- [BUSINESS-RULES.md](./BUSINESS-RULES.md) - Business rules enforced within aggregates

**Feature Specifications**:
- [Store Credit Feature Spec](../../features/store-credit/FEATURE-SPEC.md)
- [Gift Cards Feature Spec](../../features/gift-cards/FEATURE-SPEC.md)
- [Unified Wallet Feature Spec](../../features/unified-wallet/FEATURE-SPEC.md)
- [Unified Wallet Architecture Review](../../features/unified-wallet/ARCHITECTURE-REVIEW.md)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)
