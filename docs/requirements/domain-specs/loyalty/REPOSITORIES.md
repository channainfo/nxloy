# Loyalty Domain - Repositories

**Domain**: Loyalty
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

Repositories provide an abstraction over data persistence, allowing aggregates to be stored and retrieved without domain logic knowing about database details.

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

- [AGGREGATES.md](./AGGREGATES.md)
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md)
- [ENTITIES.md](./ENTITIES.md)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-07
