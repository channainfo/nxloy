# Viral Growth Domain - Business Rules

**Last Updated**: 2025-11-09
**Owner**: Backend Team (Growth Squad)

## Overview

Business rules define constraints, policies, and domain logic for the Viral Growth domain.

---

## Rule Category 1: K-Factor Calculation

### BR-VG-001: K-Factor Non-Negativity
**Rule**: K-factor must always be >= 0

**Rationale**: Negative K-factor is mathematically impossible (can't have negative customers)

**Enforcement**: Value object validation
```typescript
if (kFactor < 0) {
  throw new Error('K-factor cannot be negative');
}
```

---

### BR-VG-002: K-Factor Calculation Formula
**Rule**: K = (New Viral Customers) / (Existing Customers)

**Channels**: Referral + Challenge + Influencer + UGC

**Enforcement**: Domain service
```typescript
const kFactor = newViralCustomers / existingCustomers;
```

---

### BR-VG-003: Churn-Adjusted K-Factor
**Rule**: K_adjusted = K × (1 - churn_rate)

**Rationale**: Account for customer attrition in viral growth projections

**When to Use**: Long-term forecasting (>6 months)

---

### BR-VG-004: Channel Attribution Sum
**Rule**: K_referral + K_challenge + K_influencer + K_ugc ≈ K_total (within 0.01 tolerance)

**Rationale**: Channels must account for all viral signups

**Enforcement**: Aggregate invariant

---

## Rule Category 2: Super Referrer Identification

### BR-VG-010: Top 20% Threshold
**Rule**: Super referrers must be in top 20% of all referrers

**Calculation**: percentile >= 80.0

**Enforcement**: Domain service
```typescript
if (percentile < 80.0) {
  throw new Error('Not in top 20%');
}
```

---

### BR-VG-011: Minimum Referral Count
**Rule**: Super referrers must have made >= 5 referrals

**Rationale**: Prevents one-time referrers from getting VIP status

**Enforcement**: Domain service

---

### BR-VG-012: Tier Assignment
**Rule**: Tier based on percentile:
- BRONZE: 80-85%
- SILVER: 85-95%
- GOLD: 95-99%
- PLATINUM: 99-100%

**Bonus Multipliers**: 2x, 3x, 4x, 5x respectively

---

### BR-VG-013: Super Referrer Demotion
**Rule**: Demote if percentile drops below 80%

**Frequency**: Monthly re-evaluation

**Grace Period**: None (immediate demotion)

---

## Rule Category 3: Referral Chain Tracking

### BR-VG-020: Maximum Chain Depth
**Rule**: Track referral chains up to 5 levels deep

**Rationale**: Diminishing returns beyond 5 levels, database performance

**Levels**:
1. Primary (direct referral)
2. Secondary (friend-of-friend)
3. Tertiary (3rd degree)
4. Quaternary (4th degree)
5. Quinary (5th degree)

---

### BR-VG-021: Root Node Invariant
**Rule**: Level 1 nodes must have `referredById = NULL`

**Rationale**: Root nodes are original customers (not referred by anyone)

**Enforcement**: Entity validation

---

### BR-VG-022: Parent Existence
**Rule**: Level >1 nodes must have valid `referredById`

**Enforcement**: Database foreign key constraint

---

### BR-VG-023: Downstream Count Consistency
**Rule**: `totalDownstream = primaryReferrals + secondaryReferrals + tertiary + ...`

**Frequency**: Recalculated on each referral extension

---

## Rule Category 4: Viral Cycle Time

### BR-VG-030: Cycle Time Definition
**Rule**: Days between customer signup and their first referral

**Formula**: `cycleTime = firstReferralDate - signupDate` (in days)

---

### BR-VG-031: Cycle Time Benchmarks
**Rule**:
- FAST: < 7 days
- AVERAGE: 7-30 days
- SLOW: > 30 days

**Target**: <14 days median across all customers

---

### BR-VG-032: Complete Viral Loop
**Rule**: Loop considered "complete" when reaches 3+ levels (tertiary referrals)

**Rationale**: Network effects kick in at 3rd degree

---

## Rule Category 5: Growth Recommendations

### BR-VG-040: High Priority Threshold
**Rule**: Recommendations with predicted impact >0.10 are HIGH priority

**Rationale**: +0.10 K-factor = 10% viral growth boost (significant)

---

### BR-VG-041: Confidence Requirement
**Rule**: Only generate recommendations with confidence >50%

**Rationale**: Low-confidence suggestions waste business time

---

### BR-VG-042: Implementation Tracking
**Rule**: Can only record actual impact for IMPLEMENTED recommendations

**Enforcement**: Status validation

---

### BR-VG-043: Daily Generation Limit
**Rule**: Generate max 5 recommendations per business per day

**Rationale**: Prevent information overload

---

## Rule Category 6: Viral Milestones

### BR-VG-050: Milestone Thresholds
**Rule**:
- BRONZE: K >= 0.3 (viral traction)
- SILVER: K >= 0.5 (sustainable viral growth)
- GOLD: K >= 0.7 (strong viral growth)
- PLATINUM: K >= 1.0 (exponential growth)

---

### BR-VG-051: Milestone Celebration
**Rule**: Celebrate each milestone once (don't spam for fluctuations)

**Implementation**: Track highest achieved milestone, only celebrate when surpassing

---

## Rule Category 7: Multi-Touch Attribution

### BR-VG-060: Attribution Model
**Rule**: 40% first-touch, 60% last-touch

**Rationale**: Industry standard for viral/referral attribution

---

### BR-VG-061: Minimum Touchpoints
**Rule**: At least one touchpoint required for attribution

**Fallback**: If no touchpoints, attribute to "ORGANIC"

---

## Rule Category 8: Data Retention

### BR-VG-070: Viral Metrics Retention
**Rule**: Store 24 months of viral metrics

**Rationale**: Sufficient for year-over-year analysis

**After 24 months**: Archive to cold storage

---

### BR-VG-071: Snapshot Frequency
**Rule**: Capture viral snapshots hourly

**Rationale**: Real-time K-factor tracking for businesses

---

### BR-VG-072: Referral Chain Permanence
**Rule**: Referral chains never deleted (permanent record)

**Rationale**: Audit trail for super referrer rewards

---

## Validation Rules Summary

| Rule ID | Description | Enforcement Point |
|---------|-------------|-------------------|
| BR-VG-001 | K-factor >= 0 | Value Object |
| BR-VG-002 | K-factor formula | Domain Service |
| BR-VG-010 | Top 20% threshold | Domain Service |
| BR-VG-011 | Min 5 referrals | Aggregate |
| BR-VG-020 | Max 5 chain levels | Entity |
| BR-VG-030 | Cycle time calculation | Value Object |
| BR-VG-040 | High priority threshold | Aggregate |
| BR-VG-050 | Milestone thresholds | Domain Service |
| BR-VG-060 | Attribution model | Value Object |

---

## Business Policies

### Policy 1: Fair Super Referrer Rewards
**Policy**: All super referrers receive same tier benefits regardless of business

**Rationale**: Platform-wide consistency, prevents gaming

---

### Policy 2: Real-Time K-Factor Updates
**Policy**: K-factor updated hourly, not daily

**Rationale**: Businesses need real-time viral tracking for marketing decisions

---

### Policy 3: AI Recommendation Transparency
**Policy**: All AI recommendations must include:
1. Predicted impact
2. Confidence level
3. Data sources used
4. Rationale

**Rationale**: Business trust in AI suggestions

---

**Document Owner**: Backend Team (Growth Squad)
**Last Updated**: 2025-11-09
**Status**: ✅ Complete
