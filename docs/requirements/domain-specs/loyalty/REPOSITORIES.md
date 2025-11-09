# Loyalty Domain - Repositories

**Domain**: Loyalty
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)

## Overview

Repositories provide an abstraction over data persistence, allowing aggregates to be stored and retrieved without domain logic knowing about database details.

**v2.0.0 Changes**:
- Added StoreCreditRepository for store credit aggregate persistence
- Added DigitalRewardRepository for digital reward aggregate persistence
- Added WalletBalanceRepository (read-only, virtual aggregate)
- Added indexes for FIFO redemption queries

## Repository Pattern Principles

1. **Aggregate-Oriented**: One repository per aggregate root
2. **Collection Metaphor**: Repositories act like in-memory collections
3. **Domain Language**: Methods use ubiquitous language
4. **Persistence Ignorance**: Domain doesn't know about database
5. **No Business Logic**: Repositories only handle persistence

---

## Core Repositories

### 1. LoyaltyProgramRepository

**Purpose**: Persist and retrieve LoyaltyProgram aggregates

```typescript
interface LoyaltyProgramRepository {
  // Basic CRUD
  findById(id: UUID): Promise<LoyaltyProgramAggregate | null>;
  save(program: LoyaltyProgramAggregate): Promise<void>;
  delete(id: UUID): Promise<void>;

  // Query methods
  findByBusiness(businessId: UUID): Promise<LoyaltyProgramAggregate[]>;
  findActiveByBusiness(businessId: UUID): Promise<LoyaltyProgramAggregate[]>;
  findByStatus(status: ProgramStatus): Promise<LoyaltyProgramAggregate[]>;
  findByTemplate(templateId: UUID): Promise<LoyaltyProgramAggregate[]>;

  // Count methods
  countByBusiness(businessId: UUID): Promise<number>;
  countByStatus(status: ProgramStatus): Promise<number>;

  // Existence checks
  existsById(id: UUID): Promise<boolean>;
  existsByBusinessAndName(businessId: UUID, name: string): Promise<boolean>;
}
```

**Implementation** (Prisma):

```typescript
class PrismaLoyaltyProgramRepository implements LoyaltyProgramRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: UUID): Promise<LoyaltyProgramAggregate | null> {
    const program = await this.prisma.loyaltyProgram.findUnique({
      where: { id },
      include: {
        rules: true,
        tiers: true,
      },
    });

    if (!program) return null;
    return this.toDomain(program);
  }

  async save(program: LoyaltyProgramAggregate): Promise<void> {
    const data = this.toPersistence(program);

    await this.prisma.loyaltyProgram.upsert({
      where: { id: program.id },
      create: data,
      update: data,
    });
  }

  async findActiveByBusiness(businessId: UUID): Promise<LoyaltyProgramAggregate[]> {
    const programs = await this.prisma.loyaltyProgram.findMany({
      where: {
        businessId,
        status: 'ACTIVE',
      },
      include: {
        rules: true,
        tiers: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return programs.map((p) => this.toDomain(p));
  }

  // Mapping methods
  private toDomain(raw: any): LoyaltyProgramAggregate {
    // Map database row to domain aggregate
    // Implementation details...
  }

  private toPersistence(program: LoyaltyProgramAggregate): any {
    // Map domain aggregate to database row
    // Implementation details...
  }
}
```

---

### 2. CustomerEnrollmentRepository

**Purpose**: Persist and retrieve CustomerEnrollment aggregates

```typescript
interface CustomerEnrollmentRepository {
  // Basic CRUD
  findById(id: UUID): Promise<CustomerEnrollmentAggregate | null>;
  save(enrollment: CustomerEnrollmentAggregate): Promise<void>;

  // Query methods
  findByCustomer(customerId: UUID): Promise<CustomerEnrollmentAggregate[]>;
  findByProgram(programId: UUID): Promise<CustomerEnrollmentAggregate[]>;
  findByCustomerAndProgram(
    customerId: UUID,
    programId: UUID
  ): Promise<CustomerEnrollmentAggregate | null>;
  findActiveByCustomer(customerId: UUID): Promise<CustomerEnrollmentAggregate[]>;
  findWithExpiringPoints(
    expiryDate: Date
  ): Promise<CustomerEnrollmentAggregate[]>;

  // Count methods
  countByProgram(programId: UUID): Promise<number>;
  countActiveByProgram(programId: UUID): Promise<number>;

  // Existence checks
  existsByCustomerAndProgram(customerId: UUID, programId: UUID): Promise<boolean>;
}
```

**Implementation**:

```typescript
class PrismaCustomerEnrollmentRepository implements CustomerEnrollmentRepository {
  constructor(private prisma: PrismaClient) {}

  async findByCustomerAndProgram(
    customerId: UUID,
    programId: UUID
  ): Promise<CustomerEnrollmentAggregate | null> {
    const enrollment = await this.prisma.customerEnrollment.findFirst({
      where: {
        customerId,
        programId,
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 100, // Recent transactions
        },
        progress: true,
      },
    });

    if (!enrollment) return null;
    return this.toDomain(enrollment);
  }

  async save(enrollment: CustomerEnrollmentAggregate): Promise<void> {
    const data = this.toPersistence(enrollment);

    await this.prisma.$transaction(async (tx) => {
      // Save enrollment
      await tx.customerEnrollment.upsert({
        where: { id: enrollment.id },
        create: data.enrollment,
        update: data.enrollment,
      });

      // Save new transactions
      if (data.newTransactions.length > 0) {
        await tx.loyaltyTransaction.createMany({
          data: data.newTransactions,
        });
      }

      // Update progress
      if (data.progress) {
        await tx.loyaltyProgress.upsert({
          where: { enrollmentId: enrollment.id },
          create: data.progress,
          update: data.progress,
        });
      }
    });
  }

  async findWithExpiringPoints(expiryDate: Date): Promise<CustomerEnrollmentAggregate[]> {
    const enrollments = await this.prisma.customerEnrollment.findMany({
      where: {
        transactions: {
          some: {
            expiresAt: {
              lte: expiryDate,
            },
            type: 'EARN',
          },
        },
      },
      include: {
        transactions: true,
        progress: true,
      },
    });

    return enrollments.map((e) => this.toDomain(e));
  }

  private toDomain(raw: any): CustomerEnrollmentAggregate {
    // Map to domain aggregate
  }

  private toPersistence(enrollment: CustomerEnrollmentAggregate): any {
    // Map to database format
  }
}
```

---

### 3. LoyaltyTemplateRepository

**Purpose**: Persist and retrieve LoyaltyTemplate entities

```typescript
interface LoyaltyTemplateRepository {
  // Basic CRUD
  findById(id: UUID): Promise<LoyaltyTemplate | null>;
  findAll(): Promise<LoyaltyTemplate[]>;
  save(template: LoyaltyTemplate): Promise<void>;

  // Query methods
  findByIndustry(industry: Industry): Promise<LoyaltyTemplate[]>;
  findByRuleType(ruleType: RuleType): Promise<LoyaltyTemplate[]>;
  findPopular(limit: number): Promise<LoyaltyTemplate[]>;
  search(query: string): Promise<LoyaltyTemplate[]>;

  // Count methods
  count(): Promise<number>;
  countByIndustry(industry: Industry): Promise<number>;
}
```

**Implementation**:

```typescript
class PrismaLoyaltyTemplateRepository implements LoyaltyTemplateRepository {
  constructor(
    private prisma: PrismaClient,
    private cache: CacheService
  ) {}

  async findAll(): Promise<LoyaltyTemplate[]> {
    // Check cache first
    const cached = await this.cache.get('loyalty:templates:all');
    if (cached) return cached;

    const templates = await this.prisma.loyaltyRuleTemplate.findMany({
      where: { isActive: true },
      orderBy: { popularity: 'desc' },
    });

    const result = templates.map((t) => this.toDomain(t));

    // Cache for 5 minutes
    await this.cache.set('loyalty:templates:all', result, 300);

    return result;
  }

  async findByIndustry(industry: Industry): Promise<LoyaltyTemplate[]> {
    const cacheKey = `loyalty:templates:industry:${industry}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const templates = await this.prisma.loyaltyRuleTemplate.findMany({
      where: {
        industry,
        isActive: true,
      },
      orderBy: { popularity: 'desc' },
    });

    const result = templates.map((t) => this.toDomain(t));

    // Cache for 5 minutes
    await this.cache.set(cacheKey, result, 300);

    return result;
  }

  async save(template: LoyaltyTemplate): Promise<void> {
    await this.prisma.loyaltyRuleTemplate.upsert({
      where: { id: template.id },
      create: this.toPersistence(template),
      update: this.toPersistence(template),
    });

    // Invalidate cache
    await this.cache.del('loyalty:templates:*');
  }

  private toDomain(raw: any): LoyaltyTemplate {
    return new LoyaltyTemplate(
      raw.id,
      raw.name,
      raw.industry,
      raw.ruleType,
      raw.config,
      raw.description,
      raw.estimatedROI,
      raw.popularity,
      raw.isActive,
      raw.createdAt,
      raw.updatedAt
    );
  }

  private toPersistence(template: LoyaltyTemplate): any {
    return {
      id: template.id,
      name: template.name,
      industry: template.industry,
      ruleType: template.ruleType,
      config: template.config,
      description: template.description,
      estimatedROI: template.estimatedROI,
      popularity: template.popularity,
      isActive: template.isActive,
      updatedAt: new Date(),
    };
  }
}
```

---

### 4. LoyaltyTransactionRepository

**Purpose**: Persist and retrieve LoyaltyTransaction entities

```typescript
interface LoyaltyTransactionRepository {
  // Basic CRUD
  findById(id: UUID): Promise<LoyaltyTransaction | null>;
  save(transaction: LoyaltyTransaction): Promise<void>;

  // Query methods
  findByEnrollment(
    enrollmentId: UUID,
    limit?: number
  ): Promise<LoyaltyTransaction[]>;
  findByCustomer(customerId: UUID, limit?: number): Promise<LoyaltyTransaction[]>;
  findExpiringBefore(date: Date): Promise<LoyaltyTransaction[]>;
  findByDateRange(
    enrollmentId: UUID,
    startDate: Date,
    endDate: Date
  ): Promise<LoyaltyTransaction[]>;

  // Aggregation methods
  sumPointsByEnrollment(enrollmentId: UUID): Promise<number>;
  sumPointsByType(
    enrollmentId: UUID,
    type: TransactionType
  ): Promise<number>;
}
```

---

### 5. TierRepository

**Purpose**: Persist and retrieve Tier entities

```typescript
interface TierRepository {
  // Basic CRUD
  findById(id: UUID): Promise<Tier | null>;
  save(tier: Tier): Promise<void>;
  delete(id: UUID): Promise<void>;

  // Query methods
  findByProgram(programId: UUID): Promise<Tier[]>;
  findByLevel(programId: UUID, level: number): Promise<Tier | null>;
  findQualifyingTier(programId: UUID, points: number): Promise<Tier | null>;
}
```

---

## Wallet Repositories (NEW v2.0.0)

### 6. StoreCreditRepository

**Purpose**: Persist and retrieve StoreCredit aggregates

```typescript
interface StoreCreditRepository {
  // Basic CRUD
  findById(id: UUID): Promise<StoreCreditAggregate | null>;
  save(credit: StoreCreditAggregate): Promise<void>;

  // Query methods
  findActive(filter: StoreCreditFilter): Promise<StoreCredit[]>;
  findByCustomer(customerId: UUID): Promise<StoreCredit[]>;
  findExpiring(before: Date): Promise<StoreCredit[]>;
  findInGracePeriod(): Promise<StoreCredit[]>;

  // Balance methods (for wallet)
  getBalance(customerId: UUID, currency?: string): Promise<MultiCurrencyBalance>;
  getTotalBalance(customerId: UUID): Promise<Money[]>; // All currencies

  // Aggregation methods
  sumBalanceByCustomer(customerId: UUID, currency: string): Promise<Money>;
  countActiveByCustomer(customerId: UUID): Promise<number>;
}

interface StoreCreditFilter {
  customerId: UUID;
  currency: string;
  sortBy: 'expires_at ASC' | 'created_at DESC'; // FIFO or chronological
  status?: CreditStatus[];
}
```

**Implementation**:

```typescript
class PrismaStoreCreditRepository implements StoreCreditRepository {
  constructor(private prisma: PrismaClient) {}

  async findActive(filter: StoreCreditFilter): Promise<StoreCredit[]> {
    const credits = await this.prisma.storeCredit.findMany({
      where: {
        customerId: filter.customerId,
        currency: filter.currency,
        status: filter.status || {
          in: [CreditStatus.ACTIVE, CreditStatus.EXPIRED]
        },
        balance: { gt: 0 }, // Only credits with balance
      },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 10
        }
      },
      orderBy: this.getSortOrder(filter.sortBy),
    });

    return credits.map(c => this.toDomain(c));
  }

  async getBalance(
    customerId: UUID,
    currency?: string
  ): Promise<MultiCurrencyBalance> {
    const where: any = {
      customerId,
      status: { in: [CreditStatus.ACTIVE, CreditStatus.EXPIRED] },
      balance: { gt: 0 }
    };

    if (currency) {
      where.currency = currency;
    }

    const balances = await this.prisma.storeCredit.groupBy({
      by: ['currency'],
      where,
      _sum: {
        balance: true
      }
    });

    return new MultiCurrencyBalance(
      balances.map(b => new Money(b._sum.balance || 0, b.currency as Currency))
    );
  }

  async save(credit: StoreCreditAggregate): Promise<void> {
    const data = this.toPersistence(credit);

    await this.prisma.$transaction(async (tx) => {
      // Save store credit
      await tx.storeCredit.upsert({
        where: { id: credit.id },
        create: data.credit,
        update: data.credit
      });

      // Save new transactions
      if (data.newTransactions.length > 0) {
        await tx.storeCreditTransaction.createMany({
          data: data.newTransactions,
          skipDuplicates: true
        });
      }

      // Publish domain events
      const events = credit.getDomainEvents();
      if (events.length > 0) {
        await this.eventBus.publishAll(events);
        credit.clearDomainEvents();
      }
    });
  }

  async findExpiring(before: Date): Promise<StoreCredit[]> {
    const credits = await this.prisma.storeCredit.findMany({
      where: {
        expiresAt: { lte: before },
        status: CreditStatus.ACTIVE,
        balance: { gt: 0 }
      },
      include: {
        transactions: true
      }
    });

    return credits.map(c => this.toDomain(c));
  }

  async findInGracePeriod(): Promise<StoreCredit[]> {
    const now = new Date();

    const credits = await this.prisma.storeCredit.findMany({
      where: {
        status: CreditStatus.EXPIRED,
        gracePeriodEndsAt: { gt: now },
        balance: { gt: 0 }
      },
      include: {
        transactions: true
      }
    });

    return credits.map(c => this.toDomain(c));
  }

  private getSortOrder(sortBy: string): any {
    if (sortBy === 'expires_at ASC') {
      return { expiresAt: 'asc' }; // FIFO
    }
    return { createdAt: 'desc' };
  }

  private toDomain(raw: any): StoreCredit {
    // Map database row to domain entity
  }

  private toPersistence(credit: StoreCreditAggregate): any {
    // Map domain aggregate to database format
    return {
      credit: {
        id: credit.id,
        businessId: credit.businessId,
        customerId: credit.customerId,
        amount: credit.amount.amount,
        currency: credit.currency,
        balance: credit.balance.amount,
        method: credit.method,
        reason: credit.reason,
        issuedBy: credit.issuedBy,
        issuedAt: credit.issuedAt,
        expiresAt: credit.expiresAt,
        gracePeriodEndsAt: credit.gracePeriodEndsAt,
        status: credit.status,
        campaignId: credit.campaignId,
        rewardId: credit.rewardId,
        metadata: credit.metadata,
        updatedAt: new Date()
      },
      newTransactions: credit.getNewTransactions().map(t => ({
        id: t.id,
        businessId: t.businessId,
        creditId: credit.id,
        customerId: credit.customerId,
        type: t.type,
        amount: t.amount.amount,
        currency: t.currency,
        balanceAfter: t.balanceAfter.amount,
        externalTransactionId: t.externalTransactionId,
        metadata: t.metadata,
        transactionDate: t.transactionDate,
        createdAt: t.createdAt
      }))
    };
  }
}
```

---

### 7. DigitalRewardRepository

**Purpose**: Persist and retrieve DigitalReward aggregates

```typescript
interface DigitalRewardRepository {
  // Basic CRUD
  findById(id: UUID): Promise<DigitalRewardAggregate | null>;
  save(reward: DigitalRewardAggregate): Promise<void>;

  // Query methods
  findActive(filter: DigitalRewardFilter): Promise<DigitalReward[]>;
  findByCustomer(customerId: UUID): Promise<DigitalReward[]>;
  findByMerchant(merchantId: UUID): Promise<DigitalReward[]>;
  findExpiring(before: Date): Promise<DigitalReward[]>;
  findInGracePeriod(): Promise<DigitalReward[]>;

  // Balance methods (for wallet)
  getBalance(customerId: UUID, currency?: string): Promise<MultiCurrencyBalance>;
  getBalanceByMerchant(
    customerId: UUID,
    merchantId: string,
    currency: string
  ): Promise<Money>;

  // Aggregation methods
  sumBalanceByCustomer(customerId: UUID, currency: string): Promise<Money>;
  countActiveByCustomer(customerId: UUID): Promise<number>;
}

interface DigitalRewardFilter {
  customerId: UUID;
  currency: string;
  merchantId?: string;
  sortBy: 'merchant_priority' | 'expires_at ASC' | 'created_at DESC';
  status?: RewardStatus[];
}
```

**Implementation**:

```typescript
class PrismaDigitalRewardRepository implements DigitalRewardRepository {
  constructor(private prisma: PrismaClient) {}

  async findActive(filter: DigitalRewardFilter): Promise<DigitalReward[]> {
    const rewards = await this.prisma.digitalReward.findMany({
      where: {
        customerId: filter.customerId,
        currency: filter.currency,
        status: filter.status || {
          in: [RewardStatus.ACTIVE, RewardStatus.EXPIRED]
        },
        balance: { gt: 0 },
        // Filter by merchant if specified
        ...(filter.merchantId && {
          OR: [
            { merchantId: filter.merchantId }, // Exact match
            { merchantId: null }                // Generic rewards
          ]
        })
      },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 10
        }
      },
      orderBy: this.getSortOrder(filter.sortBy, filter.merchantId),
    });

    return rewards.map(r => this.toDomain(r));
  }

  async getBalanceByMerchant(
    customerId: UUID,
    merchantId: string,
    currency: string
  ): Promise<Money> {
    const result = await this.prisma.digitalReward.aggregate({
      where: {
        customerId,
        currency,
        status: { in: [RewardStatus.ACTIVE, RewardStatus.EXPIRED] },
        balance: { gt: 0 },
        OR: [
          { merchantId },     // Merchant-specific
          { merchantId: null } // Generic
        ]
      },
      _sum: {
        balance: true
      }
    });

    return new Money(result._sum.balance || 0, currency as Currency);
  }

  async save(reward: DigitalRewardAggregate): Promise<void> {
    const data = this.toPersistence(reward);

    await this.prisma.$transaction(async (tx) => {
      // Save digital reward
      await tx.digitalReward.upsert({
        where: { id: reward.id },
        create: data.reward,
        update: data.reward
      });

      // Save new transactions
      if (data.newTransactions.length > 0) {
        await tx.digitalRewardTransaction.createMany({
          data: data.newTransactions,
          skipDuplicates: true
        });
      }

      // Publish domain events
      const events = reward.getDomainEvents();
      if (events.length > 0) {
        await this.eventBus.publishAll(events);
        reward.clearDomainEvents();
      }
    });
  }

  private getSortOrder(sortBy: string, merchantId?: string): any {
    if (sortBy === 'merchant_priority') {
      // Merchant-specific first, then by expiration
      return [
        { merchantId: merchantId ? 'desc' : 'asc' },
        { expiresAt: 'asc' }
      ];
    }

    if (sortBy === 'expires_at ASC') {
      return { expiresAt: 'asc' }; // FIFO
    }

    return { createdAt: 'desc' };
  }

  private toDomain(raw: any): DigitalReward {
    // Map database row to domain entity
  }

  private toPersistence(reward: DigitalRewardAggregate): any {
    // Map domain aggregate to database format
  }
}
```

---

### 8. WalletBalanceRepository (Virtual Aggregate - Read-Only)

**Purpose**: Provide unified wallet balance view across points, store credit, and digital rewards

**Note**: This repository does NOT persist data - it aggregates from underlying repositories.

```typescript
interface WalletBalanceRepository {
  // Read-only queries (no save method)
  getBalance(customerId: UUID, businessId: UUID): Promise<WalletBalance>;
  getBalanceByCurrency(
    customerId: UUID,
    businessId: UUID,
    currency: string
  ): Promise<WalletBalance>;
  hasExpiringSoon(customerId: UUID, days: number): Promise<boolean>;
  getExpiringValue(customerId: UUID, days: number): Promise<Money[]>;
}
```

**Implementation**:

```typescript
class CompositeWalletBalanceRepository implements WalletBalanceRepository {
  constructor(
    private pointsService: PointsService,
    private storeCreditRepository: StoreCreditRepository,
    private digitalRewardRepository: DigitalRewardRepository
  ) {}

  async getBalance(
    customerId: UUID,
    businessId: UUID
  ): Promise<WalletBalance> {
    // Fetch balances from all sources in parallel
    const [points, storeCredit, digitalRewards] = await Promise.all([
      this.pointsService.getBalance(customerId),
      this.storeCreditRepository.getBalance(customerId),
      this.digitalRewardRepository.getBalance(customerId)
    ]);

    return new WalletBalance(
      points,
      storeCredit,
      digitalRewards,
      Money.zero('USD'), // Total value (calculated)
      new Date()
    );
  }

  async getBalanceByCurrency(
    customerId: UUID,
    businessId: UUID,
    currency: string
  ): Promise<WalletBalance> {
    // Fetch balances for specific currency
    const [points, storeCredit, digitalRewards] = await Promise.all([
      this.pointsService.getBalanceByCurrency(customerId, currency),
      this.storeCreditRepository.getBalance(customerId, currency),
      this.digitalRewardRepository.getBalance(customerId, currency)
    ]);

    return new WalletBalance(
      points,
      storeCredit,
      digitalRewards,
      Money.zero(currency),
      new Date()
    );
  }

  async hasExpiringSoon(customerId: UUID, days: number): Promise<boolean> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    // Check if any balance type has expiring items
    const [pointsExpiring, creditsExpiring, rewardsExpiring] = await Promise.all([
      this.pointsService.hasExpiringBefore(customerId, expiryDate),
      this.storeCreditRepository.findExpiring(expiryDate).then(c => c.length > 0),
      this.digitalRewardRepository.findExpiring(expiryDate).then(r => r.length > 0)
    ]);

    return pointsExpiring || creditsExpiring || rewardsExpiring;
  }

  async getExpiringValue(customerId: UUID, days: number): Promise<Money[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    // Get expiring balances from all sources
    const [pointsExpiring, creditsExpiring, rewardsExpiring] = await Promise.all([
      this.pointsService.getExpiringValue(customerId, expiryDate),
      this.getExpiringCreditValue(customerId, expiryDate),
      this.getExpiringRewardValue(customerId, expiryDate)
    ]);

    // Combine by currency
    const byCurrency = new Map<string, number>();

    for (const money of [...creditsExpiring, ...rewardsExpiring]) {
      const current = byCurrency.get(money.currency) || 0;
      byCurrency.set(money.currency, current + money.amount);
    }

    return Array.from(byCurrency.entries()).map(
      ([currency, amount]) => new Money(amount, currency as Currency)
    );
  }

  private async getExpiringCreditValue(
    customerId: UUID,
    before: Date
  ): Promise<Money[]> {
    const credits = await this.storeCreditRepository.findExpiring(before);
    return this.groupByCurrency(credits.map(c => c.balance));
  }

  private async getExpiringRewardValue(
    customerId: UUID,
    before: Date
  ): Promise<Money[]> {
    const rewards = await this.digitalRewardRepository.findExpiring(before);
    return this.groupByCurrency(rewards.map(r => r.balance));
  }

  private groupByCurrency(balances: Money[]): Money[] {
    const byCurrency = new Map<string, number>();

    for (const money of balances) {
      const current = byCurrency.get(money.currency) || 0;
      byCurrency.set(money.currency, current + money.amount);
    }

    return Array.from(byCurrency.entries()).map(
      ([currency, amount]) => new Money(amount, currency as Currency)
    );
  }
}
```

---

## Repository Design Patterns

### 1. Unit of Work Pattern

Group related operations in a transaction:

```typescript
class UnitOfWork {
  constructor(private prisma: PrismaClient) {}

  async execute<T>(work: (tx: PrismaTransaction) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(work);
  }
}

// Usage
await unitOfWork.execute(async (tx) => {
  await programRepo.save(program, tx);
  await enrollmentRepo.save(enrollment, tx);
});
```

### 2. Specification Pattern

Encapsulate query logic:

```typescript
interface Specification<T> {
  toQuery(): any; // Prisma where clause
}

class ActiveProgramsSpecification implements Specification<LoyaltyProgram> {
  toQuery() {
    return { status: 'ACTIVE' };
  }
}

class ProgramsByBusinessSpecification implements Specification<LoyaltyProgram> {
  constructor(private businessId: UUID) {}

  toQuery() {
    return { businessId: this.businessId };
  }
}

// Usage
const specs = [
  new ActiveProgramsSpecification(),
  new ProgramsByBusinessSpecification(businessId),
];

const query = specs.reduce((acc, spec) => ({ ...acc, ...spec.toQuery() }), {});
const programs = await prisma.loyaltyProgram.findMany({ where: query });
```

### 3. Caching Strategy

Repository-level caching:

```typescript
class CachedLoyaltyTemplateRepository implements LoyaltyTemplateRepository {
  constructor(
    private inner: LoyaltyTemplateRepository,
    private cache: CacheService
  ) {}

  async findById(id: UUID): Promise<LoyaltyTemplate | null> {
    const cacheKey = `template:${id}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const template = await this.inner.findById(id);
    if (template) {
      await this.cache.set(cacheKey, template, 600); // 10 min
    }
    return template;
  }

  async save(template: LoyaltyTemplate): Promise<void> {
    await this.inner.save(template);
    await this.cache.del(`template:${template.id}`);
    await this.cache.del('templates:*');
  }
}
```

---

## Performance Optimization

### Indexes

Required database indexes:

```sql
-- LoyaltyProgram
CREATE INDEX idx_programs_business_status ON loyalty_programs(business_id, status);
CREATE INDEX idx_programs_template ON loyalty_programs(template_id);

-- CustomerEnrollment
CREATE INDEX idx_enrollments_customer ON customer_enrollments(customer_id);
CREATE INDEX idx_enrollments_program_status ON customer_enrollments(program_id, status);
CREATE INDEX idx_enrollments_customer_program ON customer_enrollments(customer_id, program_id);

-- LoyaltyTransaction
CREATE INDEX idx_transactions_enrollment ON loyalty_transactions(enrollment_id);
CREATE INDEX idx_transactions_created ON loyalty_transactions(created_at DESC);
CREATE INDEX idx_transactions_expiry ON loyalty_transactions(expires_at) WHERE type = 'EARN';

-- LoyaltyTemplate
CREATE INDEX idx_templates_industry ON loyalty_rule_templates(industry);
CREATE INDEX idx_templates_popularity ON loyalty_rule_templates(popularity DESC);

-- StoreCredit (NEW v2.0.0) - FIFO redemption critical path
CREATE INDEX idx_store_credits_fifo
  ON store_credits(customer_id, currency, expires_at, status)
  WHERE status IN ('active', 'expired')
  INCLUDE (balance);

-- StoreCredit - Expiration batch job
CREATE INDEX idx_store_credits_expiration_job
  ON store_credits(expires_at, status)
  WHERE status IN ('active', 'expired') AND balance > 0;

-- StoreCredit - Grace period lookup
CREATE INDEX idx_store_credits_grace_period
  ON store_credits(grace_period_ends_at, status)
  WHERE status = 'expired' AND balance > 0;

-- StoreCreditTransaction
CREATE INDEX idx_store_credit_txns_credit ON store_credit_transactions(credit_id);
CREATE INDEX idx_store_credit_txns_customer ON store_credit_transactions(customer_id);
CREATE INDEX idx_store_credit_txns_date ON store_credit_transactions(transaction_date DESC);

-- DigitalReward (NEW v2.0.0) - FIFO with merchant priority
CREATE INDEX idx_digital_rewards_fifo
  ON digital_rewards(customer_id, currency, merchant_id, expires_at, status)
  WHERE status IN ('active', 'expired')
  INCLUDE (balance);

-- DigitalReward - Expiration batch job
CREATE INDEX idx_digital_rewards_expiration_job
  ON digital_rewards(expires_at, status)
  WHERE status IN ('active', 'expired') AND balance > 0;

-- DigitalReward - Grace period lookup
CREATE INDEX idx_digital_rewards_grace_period
  ON digital_rewards(grace_period_ends_at, status)
  WHERE status = 'expired' AND balance > 0;

-- DigitalRewardTransaction
CREATE INDEX idx_digital_reward_txns_reward ON digital_reward_transactions(reward_id);
CREATE INDEX idx_digital_reward_txns_customer ON digital_reward_transactions(customer_id);
CREATE INDEX idx_digital_reward_txns_date ON digital_reward_transactions(transaction_date DESC);
```

### Query Optimization

Use `select` to fetch only needed fields:

```typescript
async findSummary(programId: UUID): Promise<ProgramSummary> {
  return await this.prisma.loyaltyProgram.findUnique({
    where: { id: programId },
    select: {
      id: true,
      name: true,
      status: true,
      _count: {
        select: { enrollments: true }
      }
    }
  });
}
```

---

## References

- [AGGREGATES.md](./AGGREGATES.md) - StoreCreditAggregate, DigitalRewardAggregate, WalletAggregate
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md) - Cross-repository domain services
- [ENTITIES.md](./ENTITIES.md) - StoreCredit, DigitalReward entities
- [VALUE-OBJECTS.md](./VALUE-OBJECTS.md) - Money, MultiCurrencyBalance, WalletBalance
- [BUSINESS-RULES.md](./BUSINESS-RULES.md) - FIFO redemption, expiration rules

**Feature Specifications**:
- [Store Credit Feature Spec](../../features/store-credit/FEATURE-SPEC.md) - Store credit database schema
- [Gift Cards Feature Spec](../../features/gift-cards/FEATURE-SPEC.md) - Digital reward database schema
- [Unified Wallet Feature Spec](../../features/unified-wallet/FEATURE-SPEC.md) - Wallet balance aggregation

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-09
**Version**: 2.0.0 (Unified Wallet Update)
