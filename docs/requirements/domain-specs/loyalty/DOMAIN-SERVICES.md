# Loyalty Domain - Domain Services

**Domain**: Loyalty
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

Domain Services contain business logic that doesn't naturally fit within a single entity or value object. They orchestrate operations across aggregates and enforce complex business rules.

## Core Domain Services

### 1. EnrollCustomerService

**Purpose**: Handle customer enrollment in loyalty programs

```typescript
class EnrollCustomerService {
  constructor(
    private programRepo: LoyaltyProgramRepository,
    private enrollmentRepo: CustomerEnrollmentRepository,
    private customerService: CustomerDomainService,
    private eventBus: EventBus
  ) {}

  async execute(customerId: UUID, programId: UUID): Promise<CustomerEnrollmentAggregate> {
    // Load program
    const program = await this.programRepo.findById(programId);
    if (!program) {
      throw new ProgramNotFoundError(programId);
    }

    // Check program status
    if (program.status !== ProgramStatus.ACTIVE) {
      throw new ProgramNotActiveError(programId);
    }

    // Check for existing enrollment
    const existing = await this.enrollmentRepo.findByCustomerAndProgram(
      customerId,
      programId
    );
    if (existing) {
      throw new AlreadyEnrolledError(customerId, programId);
    }

    // Check eligibility
    const customer = await this.customerService.getCustomerSnapshot(customerId);
    if (!program.canEnroll(customer)) {
      throw new NotEligibleError(customerId, programId);
    }

    // Create enrollment
    const enrollment = CustomerEnrollmentAggregate.create(
      customerId,
      programId,
      program.getDefaultTierId()
    );

    // Initialize progress tracking
    const progress = this.initializeProgress(program.getRules()[0]);
    enrollment.setProgress(progress);

    // Save
    await this.enrollmentRepo.save(enrollment);

    // Publish events
    await this.eventBus.publishAll(enrollment.getDomainEvents());
    enrollment.clearDomainEvents();

    return enrollment;
  }

  private initializeProgress(rule: LoyaltyRule): LoyaltyProgress {
    return new LoyaltyProgress(
      generateUUID(),
      null, // enrollmentId set later
      rule.ruleType,
      0,
      this.getTargetValue(rule),
      this.getUnit(rule),
      new Date(),
      null,
      false,
      null
    );
  }

  private getTargetValue(rule: LoyaltyRule): number {
    switch (rule.ruleType) {
      case RuleType.PUNCH_CARD:
        return (rule.config as PunchCardConfig).requiredPunches;
      case RuleType.AMOUNT_SPENT:
        return (rule.config as AmountSpentConfig).targetAmount;
      case RuleType.VISIT_FREQUENCY:
        return (rule.config as VisitFrequencyConfig).requiredVisits;
      default:
        return 0;
    }
  }

  private getUnit(rule: LoyaltyRule): string {
    switch (rule.ruleType) {
      case RuleType.POINTS_BASED:
        return 'points';
      case RuleType.PUNCH_CARD:
        return 'punches';
      case RuleType.AMOUNT_SPENT:
        return 'dollars';
      case RuleType.VISIT_FREQUENCY:
        return 'visits';
      default:
        return 'units';
    }
  }
}
```

---

### 2. EarnPointsService

**Purpose**: Process point earning based on rule configuration

```typescript
class EarnPointsService {
  constructor(
    private enrollmentRepo: CustomerEnrollmentRepository,
    private ruleEngine: LoyaltyRuleEngine,
    private tierService: TierManagementService,
    private eventBus: EventBus
  ) {}

  async execute(
    customerId: UUID,
    programId: UUID,
    transaction: TransactionSnapshot
  ): Promise<number> {
    // Load enrollment
    const enrollment = await this.enrollmentRepo.findByCustomerAndProgram(
      customerId,
      programId
    );
    if (!enrollment) {
      throw new NotEnrolledError(customerId, programId);
    }

    // Calculate points using rule engine
    const points = await this.ruleEngine.calculatePoints(enrollment, transaction);

    if (points > 0) {
      // Apply tier multiplier if applicable
      const finalPoints = await this.tierService.applyTierBenefits(
        enrollment,
        points
      );

      // Earn points
      enrollment.earnPoints(
        finalPoints,
        transaction.type,
        transaction.id,
        `Earned ${finalPoints} points from ${transaction.type}`,
        this.calculateExpiryDate(programId)
      );

      // Check for tier upgrade
      await this.tierService.checkAndUpgradeTier(enrollment);

      // Save
      await this.enrollmentRepo.save(enrollment);

      // Publish events
      await this.eventBus.publishAll(enrollment.getDomainEvents());
      enrollment.clearDomainEvents();

      return finalPoints;
    }

    return 0;
  }

  private async calculateExpiryDate(programId: UUID): Promise<Date | undefined> {
    const program = await this.programRepo.findById(programId);
    if (!program.pointExpiryDays) {
      return undefined;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + program.pointExpiryDays);
    return expiryDate;
  }
}
```

---

### 3. LoyaltyRuleEngine

**Purpose**: Execute rule logic to calculate points/progress

```typescript
class LoyaltyRuleEngine {
  async calculatePoints(
    enrollment: CustomerEnrollmentAggregate,
    transaction: TransactionSnapshot
  ): Promise<number> {
    const program = await this.programRepo.findById(enrollment.programId);
    const rules = program.getRules();

    // MVP: Single rule per program
    if (rules.length === 0) {
      throw new NoRulesConfiguredError(program.id);
    }

    const rule = rules[0];

    switch (rule.ruleType) {
      case RuleType.POINTS_BASED:
        return this.calculatePointsBased(rule.config as PointsBasedConfig, transaction);

      case RuleType.PUNCH_CARD:
        return this.calculatePunchCard(rule.config as PunchCardConfig, transaction);

      case RuleType.AMOUNT_SPENT:
        return this.calculateAmountSpent(rule.config as AmountSpentConfig, transaction);

      case RuleType.VISIT_FREQUENCY:
        return this.calculateVisitFrequency(
          rule.config as VisitFrequencyConfig,
          transaction
        );

      default:
        throw new UnsupportedRuleTypeError(rule.ruleType);
    }
  }

  private calculatePointsBased(
    config: PointsBasedConfig,
    transaction: TransactionSnapshot
  ): number {
    if (transaction.amount < config.minPurchaseAmount) {
      return 0;
    }

    const points = Math.floor(transaction.amount * config.pointsPerDollar);

    if (config.maxPointsPerTransaction) {
      return Math.min(points, config.maxPointsPerTransaction);
    }

    return points;
  }

  private calculatePunchCard(
    config: PunchCardConfig,
    transaction: TransactionSnapshot
  ): number {
    // For punch cards, each qualifying transaction = 1 punch
    return 1;
  }

  private calculateAmountSpent(
    config: AmountSpentConfig,
    transaction: TransactionSnapshot
  ): number {
    // For amount spent, track cumulative spending
    return transaction.amount;
  }

  private calculateVisitFrequency(
    config: VisitFrequencyConfig,
    transaction: TransactionSnapshot
  ): number {
    // For visit frequency, each visit = 1
    return 1;
  }
}
```

---

### 4. TierManagementService

**Purpose**: Handle tier upgrades and benefit application

```typescript
class TierManagementService {
  constructor(
    private tierRepo: TierRepository,
    private enrollmentRepo: CustomerEnrollmentRepository,
    private eventBus: EventBus
  ) {}

  async applyTierBenefits(
    enrollment: CustomerEnrollmentAggregate,
    basePoints: number
  ): Promise<number> {
    if (!enrollment.currentTierId) {
      return basePoints;
    }

    const tier = await this.tierRepo.findById(enrollment.currentTierId);
    if (!tier) {
      return basePoints;
    }

    // Find point multiplier benefit
    const multiplierBenefit = tier.benefits.find(
      (b) => b.type === BenefitType.POINT_MULTIPLIER
    );

    if (multiplierBenefit) {
      return multiplierBenefit.apply(basePoints);
    }

    return basePoints;
  }

  async checkAndUpgradeTier(enrollment: CustomerEnrollmentAggregate): Promise<void> {
    const currentPoints = enrollment.getBalance().totalPoints;

    const tiers = await this.tierRepo.findByProgram(enrollment.programId);
    const sortedTiers = tiers.sort((a, b) => a.level - b.level);

    // Find the highest tier the customer qualifies for
    let qualifyingTier: Tier | null = null;
    for (const tier of sortedTiers) {
      if (currentPoints >= tier.minPoints) {
        if (!tier.maxPoints || currentPoints <= tier.maxPoints) {
          qualifyingTier = tier;
        }
      }
    }

    // Check if upgrade needed
    if (
      qualifyingTier &&
      qualifyingTier.id !== enrollment.currentTierId
    ) {
      enrollment.upgradeTier(qualifyingTier.id, qualifyingTier.name);
      await this.enrollmentRepo.save(enrollment);
      await this.eventBus.publishAll(enrollment.getDomainEvents());
      enrollment.clearDomainEvents();
    }
  }
}
```

---

### 5. RedeemPointsService

**Purpose**: Handle point redemption for rewards

```typescript
class RedeemPointsService {
  constructor(
    private enrollmentRepo: CustomerEnrollmentRepository,
    private rewardService: RewardDomainService,
    private eventBus: EventBus
  ) {}

  async execute(
    customerId: UUID,
    programId: UUID,
    rewardId: UUID,
    pointsToRedeem: number
  ): Promise<RedemptionResult> {
    // Load enrollment
    const enrollment = await this.enrollmentRepo.findByCustomerAndProgram(
      customerId,
      programId
    );
    if (!enrollment) {
      throw new NotEnrolledError(customerId, programId);
    }

    // Check sufficient balance
    if (!enrollment.getBalance().canRedeem(pointsToRedeem)) {
      throw new InsufficientPointsError(
        enrollment.getBalance().availablePoints,
        pointsToRedeem
      );
    }

    // Verify reward
    const reward = await this.rewardService.getReward(rewardId);
    if (reward.requiredPoints !== pointsToRedeem) {
      throw new InvalidRedemptionError('Point mismatch');
    }

    // Redeem points
    enrollment.redeemPoints(
      pointsToRedeem,
      'REWARD_REDEMPTION',
      rewardId,
      `Redeemed ${pointsToRedeem} points for ${reward.name}`
    );

    // Create redemption record
    const redemption = await this.rewardService.createRedemption(
      customerId,
      rewardId,
      pointsToRedeem
    );

    // Save
    await this.enrollmentRepo.save(enrollment);

    // Publish events
    await this.eventBus.publishAll(enrollment.getDomainEvents());
    enrollment.clearDomainEvents();

    return {
      redemptionId: redemption.id,
      remainingPoints: enrollment.getBalance().availablePoints,
      reward: reward,
    };
  }
}
```

---

### 6. PointExpirationService

**Purpose**: Process point expiration for enrollments

```typescript
class PointExpirationService {
  constructor(
    private enrollmentRepo: CustomerEnrollmentRepository,
    private transactionRepo: LoyaltyTransactionRepository,
    private eventBus: EventBus
  ) {}

  async processExpiredPoints(): Promise<void> {
    // Find all transactions expiring today
    const expiringTransactions = await this.transactionRepo.findExpiringBefore(
      new Date()
    );

    for (const transaction of expiringTransactions) {
      await this.expireTransaction(transaction);
    }
  }

  private async expireTransaction(transaction: LoyaltyTransaction): Promise<void> {
    // Load enrollment
    const enrollment = await this.enrollmentRepo.findById(
      transaction.enrollmentId
    );
    if (!enrollment) {
      return;
    }

    // Expire points
    enrollment.expirePoints(transaction.points);

    // Mark transaction as processed
    transaction.markAsExpired();

    // Save
    await this.enrollmentRepo.save(enrollment);
    await this.transactionRepo.save(transaction);

    // Publish events
    await this.eventBus.publishAll(enrollment.getDomainEvents());
    enrollment.clearDomainEvents();
  }
}
```

---

### 7. CreateProgramFromTemplateService

**Purpose**: Create loyalty program from template

```typescript
class CreateProgramFromTemplateService {
  constructor(
    private templateRepo: LoyaltyTemplateRepository,
    private programRepo: LoyaltyProgramRepository,
    private eventBus: EventBus
  ) {}

  async execute(
    businessId: UUID,
    templateId: UUID,
    customization: ProgramCustomization
  ): Promise<LoyaltyProgramAggregate> {
    // Load template
    const template = await this.templateRepo.findById(templateId);
    if (!template) {
      throw new TemplateNotFoundError(templateId);
    }

    // Create program from template
    const program = LoyaltyProgramAggregate.create(
      businessId,
      customization.name,
      customization.description,
      customization.enrollmentSettings || this.defaultEnrollmentSettings(),
      templateId
    );

    // Apply template configuration
    const ruleConfig = this.applyCustomization(template.config, customization);
    const rule = new LoyaltyRule(
      generateUUID(),
      program.id,
      template.ruleType,
      ruleConfig,
      1,
      true,
      new Date(),
      null,
      new Date(),
      new Date()
    );

    program.addRule(rule);

    // Activate if requested
    if (customization.activateImmediately) {
      program.activate();
    }

    // Save
    await this.programRepo.save(program);

    // Increment template popularity
    template.incrementPopularity();
    await this.templateRepo.save(template);

    // Publish events
    await this.eventBus.publishAll(program.getDomainEvents());
    program.clearDomainEvents();

    return program;
  }

  private applyCustomization(
    templateConfig: RuleConfiguration,
    customization: ProgramCustomization
  ): RuleConfiguration {
    if (!customization.ruleConfigOverrides) {
      return templateConfig;
    }

    return {
      ...templateConfig,
      ...customization.ruleConfigOverrides,
    };
  }

  private defaultEnrollmentSettings(): EnrollmentSettings {
    return new EnrollmentSettings(false, true, true);
  }
}
```

---

## Service Design Principles

1. **Stateless**: Services don't maintain state between calls
2. **Single Responsibility**: Each service has one clear purpose
3. **Aggregate Coordination**: Services orchestrate multiple aggregates
4. **Event Publishing**: Services publish domain events after successful operations
5. **Transaction Boundaries**: Services define transaction boundaries

## References

- [AGGREGATES.md](./AGGREGATES.md)
- [DOMAIN-EVENTS.md](./DOMAIN-EVENTS.md)
- [REPOSITORIES.md](./REPOSITORIES.md)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-07
