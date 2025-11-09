# Viral Growth Domain

**Status**: 🟢 Complete (9-file DDD specification)
**Priority**: P0 (Critical - Foundation for all viral features)
**Owner**: Backend Team (Growth Squad)
**Last Updated**: 2025-11-09

## Quick Start

Read files in this order:
1. [DOMAIN-OVERVIEW.md](./DOMAIN-OVERVIEW.md) - Purpose and scope
2. [UBIQUITOUS-LANGUAGE.md](./UBIQUITOUS-LANGUAGE.md) - Key terminology
3. [AGGREGATES.md](./AGGREGATES.md) - Core domain model
4. [BUSINESS-RULES.md](./BUSINESS-RULES.md) - Constraints and policies

## Domain Purpose

Track viral coefficient (K-factor), identify super referrers, optimize viral loops, and provide AI-powered growth recommendations.

**Target K-Factor**: 0.5-0.7 (each customer brings 0.5-0.7 new customers)

## Core Concepts

**K-Factor Formula**:
```
K = (New Customers from Viral Channels) / (Existing Customers)

Example:
- 1,000 existing customers
- 500 new customers from referrals/challenges/influencers
- K = 500 / 1,000 = 0.5 (viral growth achieved!)
```

**Super Referrer** (Pareto Principle):
- Top 20% of referrers drive 80% of viral growth
- Automatically identified and rewarded
- VIP status with bonus points

**Viral Loop**:
```
Customer A → Customer B (primary referral)
          → Customer C (secondary referral, referred by B)
          → Customer D (tertiary referral, referred by C)
```

## Aggregates

1. **ViralMetrics** - K-factor calculation and tracking
2. **ReferralChain** - Multi-level referral graph
3. **SuperReferrer** - Top performer identification

## Key Entities

- **ViralSnapshot**: Point-in-time K-factor measurement
- **ChannelPerformance**: Attribution by source (referral, challenge, influencer, UGC)
- **GrowthRecommendation**: AI-generated optimization tips
- **ViralCycle**: Time-to-viral metrics

## Domain Events

- `viral.k_factor.calculated` - Hourly K-factor update
- `viral.super_referrer.identified` - New top performer
- `viral.milestone.reached` - K-factor > target threshold
- `viral.recommendation.generated` - AI optimization tip

## File Structure

| File | Purpose | Lines |
|------|---------|-------|
| [DOMAIN-OVERVIEW.md](./DOMAIN-OVERVIEW.md) | Purpose, responsibilities, relationships | 80 |
| [ENTITIES.md](./ENTITIES.md) | All entities with attributes and lifecycles | 400+ |
| [VALUE-OBJECTS.md](./VALUE-OBJECTS.md) | Immutable value objects with validation | 300+ |
| [AGGREGATES.md](./AGGREGATES.md) | Aggregate roots, boundaries, invariants | 500+ |
| [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md) | Cross-aggregate orchestration | 350+ |
| [REPOSITORIES.md](./REPOSITORIES.md) | Data persistence abstractions | 300+ |
| [DOMAIN-EVENTS.md](./DOMAIN-EVENTS.md) | Event schemas and publishing | 250+ |
| [UBIQUITOUS-LANGUAGE.md](./UBIQUITOUS-LANGUAGE.md) | Shared vocabulary | 200+ |
| [BUSINESS-RULES.md](./BUSINESS-RULES.md) | Constraints and policies | 350+ |

**Total**: 2,700+ lines of comprehensive DDD specification

## Implementation Status

- [x] Domain Overview
- [x] Ubiquitous Language
- [x] Aggregates
- [x] Entities
- [x] Value Objects
- [x] Domain Services
- [x] Repositories
- [x] Domain Events
- [x] Business Rules

## Related Domains

- **Referrals** - Source of primary referral data
- **Social** - Challenges and influencer attribution
- **Content** - UGC sharing metrics
- **Customer Management** - Customer relationships

## References

- [Feature Spec: Viral Analytics](../../features/viral-analytics/FEATURE-SPEC.md)
- [Viral Growth Suite](../../features/VIRAL-GROWTH-SUITE.md)
- [Priority Roadmap](../../features/VIRAL-GROWTH-PRIORITY-ROADMAP.md)

---

**Status**: ✅ Complete - Ready for implementation
