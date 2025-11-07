# Loyalty Domain - Overview

**Domain**: Loyalty
**Bounded Context**: Loyalty Programs, Rules, Points, Tiers
**Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-06

## Purpose

The Loyalty domain manages all aspects of loyalty program configuration, customer progress tracking, points earning/redemption, and tier management.

## Core Responsibilities

1. **Program Management**: Create, configure, activate, pause, end loyalty programs
2. **Rule Engine**: Process 6 rule types (POINTS_BASED, PUNCH_CARD, AMOUNT_SPENT, TIER_BASED, VISIT_FREQUENCY, STAMP_CARD)
3. **Progress Tracking**: Track customer progress (points, punches, visits, tier status)
4. **Point Lifecycle**: Manage earning, redemption, expiration, transfers
5. **Tier Management**: Handle tier upgrades, downgrades, tier benefits
6. **Template System**: Provide 21 pre-configured industry templates

## Key Entities

- **LoyaltyProgram**: Main aggregate root
- **LoyaltyRule**: Rule configuration for earning
- **CustomerEnrollment**: Customer participation in programs
- **LoyaltyTransaction**: Record of points earned/redeemed
- **Tier**: Membership tier definition
- **LoyaltyTemplate**: Pre-configured program templates

## Bounded Context Relationships

**Depends On**:
- **Customer Management**: For customer profiles
- **Business Management**: For business/tenant information
- **Auth**: For user permissions

**Provides To**:
- **Rewards**: Point balances for redemption eligibility
- **Analytics**: Transaction data for reporting
- **Notifications**: Events for customer communications
- **Partner Network**: Point balances for cross-business programs

## Domain Events Published

- `loyalty.program.created`
- `loyalty.program.activated`
- `loyalty.program.paused`
- `loyalty.points.earned`
- `loyalty.points.redeemed`
- `loyalty.tier.upgraded`
- `loyalty.tier.downgraded`
- `loyalty.customer.enrolled`

## Business Rules (Summary)

1. Programs must have valid rule configuration
2. Points cannot be negative
3. Tier upgrades are permanent (no downgrades by default)
4. Expired points are automatically deducted
5. Enrollment requires active program
6. Rule changes require program pause

## Technical Constraints

- Multi-tenancy: All data scoped to businessId
- Concurrency: Optimistic locking for point balance updates
- Performance: Sub-200ms for earning/redemption operations
- Scalability: Support 100K+ active programs

## References

- [Feature Spec: Loyalty Programs](../../requirements/features/loyalty-programs/FEATURE-SPEC.md)
- [Feature Spec: Loyalty Templates](../../requirements/features/loyalty-templates/FEATURE-SPEC.md)
- [ADR-0004: Domain-Driven Organization](../../adr/0004-domain-driven-organization.md)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-06
