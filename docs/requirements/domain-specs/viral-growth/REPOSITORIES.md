# Viral Growth Domain - Repositories

**Last Updated**: 2025-11-09
**Owner**: Backend Team (Growth Squad)

## Overview

Repositories abstract data persistence, providing collection-like interfaces for aggregates.

---

## Repository 1: ViralMetricsRepository

**Purpose**: Persist ViralMetrics aggregates

**Interface**:
```typescript
interface IViralMetricsRepository {
  findById(id: UUID): Promise<ViralMetricsAggregate | null>;
  findByBusiness(businessId: UUID): Promise<ViralMetricsAggregate | null>;
  findByPeriod(businessId: UUID, start: Date, end: Date): Promise<ViralMetricsAggregate[]>;
  findLast30Days(businessId: UUID): Promise<ViralMetricsAggregate[]>;
  save(aggregate: ViralMetricsAggregate): Promise<void>;
  delete(id: UUID): Promise<void>;
}
```

**Prisma Implementation**:
```typescript
class ViralMetricsRepository implements IViralMetricsRepository {
  async findByBusiness(businessId: UUID): Promise<ViralMetricsAggregate | null> {
    const record = await prisma.viralMetrics.findFirst({
      where: { businessId },
      include: {
        snapshots: { orderBy: { snapshotDate: 'desc' }, take: 100 },
        channels: true
      }
    });

    if (!record) return null;

    return ViralMetricsAggregate.fromPrisma(record);
  }

  async save(aggregate: ViralMetricsAggregate): Promise<void> {
    const data = aggregate.toPrisma();

    await prisma.viralMetrics.upsert({
      where: { id: data.id },
      create: data,
      update: data
    });

    // Save child entities (snapshots, channels)
    await this.saveSnapshots(aggregate);
    await this.saveChannels(aggregate);
  }
}
```

---

## Repository 2: ReferralChainRepository

**Purpose**: Persist ReferralChain aggregates

**Interface**:
```typescript
interface IReferralChainRepository {
  findById(id: UUID): Promise<ReferralChainAggregate | null>;
  findByCustomer(customerId: UUID): Promise<ReferralChainAggregate | null>;
  findByRoot(rootCustomerId: UUID): Promise<ReferralChainAggregate[]>;
  findAllWithCounts(businessId: UUID): Promise<ReferralChainAggregate[]>;
  findWithFirstReferral(businessId: UUID): Promise<ReferralChainAggregate[]>;
  save(aggregate: ReferralChainAggregate): Promise<void>;
}
```

**Queries**:
```typescript
class ReferralChainRepository implements IReferralChainRepository {
  async findAllWithCounts(businessId: UUID): Promise<ReferralChainAggregate[]> {
    const records = await prisma.referralChain.findMany({
      where: { businessId },
      orderBy: { totalDownstream: 'desc' }
    });

    return records.map(r => ReferralChainAggregate.fromPrisma(r));
  }

  async findDownstreamChain(customerId: UUID): Promise<ReferralChainAggregate[]> {
    // Recursive query to get all downstream referrals
    const query = `
      WITH RECURSIVE chain AS (
        SELECT * FROM referral_chains WHERE customer_id = $1
        UNION ALL
        SELECT rc.* FROM referral_chains rc
        INNER JOIN chain c ON rc.referred_by_id = c.customer_id
      )
      SELECT * FROM chain
    `;

    const records = await prisma.$queryRaw(query, customerId);
    return records.map(r => ReferralChainAggregate.fromPrisma(r));
  }
}
```

---

## Repository 3: SuperReferrerRepository

**Interface**:
```typescript
interface ISuperReferrerRepository {
  findById(id: UUID): Promise<SuperReferrerAggregate | null>;
  findByCustomer(customerId: UUID): Promise<SuperReferrerAggregate | null>;
  findByBusiness(businessId: UUID): Promise<SuperReferrerAggregate[]>;
  findByTier(businessId: UUID, tier: Tier): Promise<SuperReferrerAggregate[]>;
  save(aggregate: SuperReferrerAggregate): Promise<void>;
  delete(id: UUID): Promise<void>;
}
```

---

## Repository 4: GrowthRecommendationRepository

**Interface**:
```typescript
interface IGrowthRecommendationRepository {
  findById(id: UUID): Promise<GrowthRecommendationAggregate | null>;
  findByBusiness(businessId: UUID, status?: RecommendationStatus): Promise<GrowthRecommendationAggregate[]>;
  findPending(businessId: UUID): Promise<GrowthRecommendationAggregate[]>;
  save(aggregate: GrowthRecommendationAggregate): Promise<void>;
}
```

---

## Repository Patterns

### Aggregate Reconstruction
```typescript
static fromPrisma(record: PrismaViralMetrics): ViralMetricsAggregate {
  const aggregate = new ViralMetricsAggregate(record);
  // Reconstruct all child entities
  aggregate.snapshots = record.snapshots.map(s => ViralSnapshot.fromPrisma(s));
  aggregate.channels = record.channels.map(c => ViralChannel.fromPrisma(c));
  return aggregate;
}
```

### Unit of Work Pattern
```typescript
async save(aggregate: ViralMetricsAggregate): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.viralMetrics.upsert(...);
    await tx.viralSnapshot.createMany(...);
    await tx.viralChannel.updateMany(...);
  });
}
```

---

**Document Owner**: Backend Team (Growth Squad)
**Last Updated**: 2025-11-09
**Status**: ✅ Complete
