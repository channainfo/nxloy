# Viral Growth Domain - Overview

**Domain**: Viral Growth
**Bounded Context**: K-Factor Tracking, Viral Loop Optimization, Super Referrer Management
**Owner**: Backend Team (Growth Squad)
**Last Updated**: 2025-11-09

## Purpose

The Viral Growth domain manages all aspects of viral coefficient tracking, viral loop analysis, super referrer identification, and AI-powered growth optimization for the NxLoy platform.

## Core Responsibilities

1. **K-Factor Calculation**: Real-time viral coefficient tracking across all channels (referrals, challenges, influencers, UGC)
2. **Viral Loop Tracking**: Multi-level referral chain analysis (primary, secondary, tertiary referrals)
3. **Super Referrer Management**: Identify and reward top 20% referrers who drive 80% of viral growth
4. **Channel Attribution**: Track viral signups by source (referral code, challenge, influencer, UGC share)
5. **Growth Optimization**: AI-powered recommendations for increasing K-factor
6. **Viral Cycle Analysis**: Measure time-to-viral (how long before referred customers refer others)

## Key Entities

- **ViralMetrics**: Main aggregate root for K-factor calculation
- **ReferralChain**: Multi-level referral tracking (friend-of-friend relationships)
- **SuperReferrer**: Top performers identified by Pareto analysis
- **ViralChannel**: Attribution tracking for different viral sources
- **GrowthRecommendation**: AI-generated optimization suggestions
- **ViralCycle**: Time-based viral loop analysis

## Bounded Context Relationships

**Depends On**:
- **Customer Management**: For customer profiles and relationships
- **Referrals**: For referral code tracking and rewards
- **Social**: For challenge participation and influencer attribution
- **Content**: For UGC sharing metrics

**Provides To**:
- **Analytics**: Viral growth data for business dashboards
- **Notifications**: Alerts for K-factor milestones
- **Rewards**: Data for super referrer bonus programs
- **Marketing**: Channel performance for CAC optimization

## Domain Events Published

- `viral.k_factor.calculated`
- `viral.super_referrer.identified`
- `viral.milestone.reached` (e.g., K-factor > 0.5)
- `viral.channel.performance_changed`
- `viral.recommendation.generated`
- `viral.referral_chain.extended` (secondary/tertiary referrals)
- `viral.cycle_time.measured`

## Business Rules (Summary)

1. K-factor must be calculated hourly for real-time tracking
2. Super referrer status requires minimum 5 direct referrals
3. Referral chains tracked up to 5 levels deep
4. Viral channels must have >10 signups for statistical significance
5. Growth recommendations refreshed daily based on latest data
6. K-factor target: 0.5-0.7 for sustainable viral growth

## Technical Constraints

- Multi-tenancy: All metrics scoped to businessId
- Performance: Sub-5min latency for K-factor calculation
- Scalability: Support 1M+ customer referral graph per business
- Real-time: K-factor updated hourly via scheduled job
- Historical data: Store 24 months of viral metrics

## References

- [Feature Spec: Viral Analytics & Growth](../../features/viral-analytics/FEATURE-SPEC.md)
- [Feature Spec: Referrals](../../features/referrals/FEATURE-SPEC.md)
- [Viral Growth Suite Overview](../../features/VIRAL-GROWTH-SUITE.md)
- [Priority Roadmap](../../features/VIRAL-GROWTH-PRIORITY-ROADMAP.md)

---

**Document Owner**: Backend Team (Growth Squad)
**Last Updated**: 2025-11-09
