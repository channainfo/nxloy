# Viral Growth Domain - Entities

**Last Updated**: 2025-11-09
**Owner**: Backend Team (Growth Squad)

## Overview

This document defines all entities in the Viral Growth domain. Entities have identity and lifecycle, tracked by unique IDs.

---

## Entity 1: ViralMetrics

**Purpose**: Track K-factor and viral performance metrics for a business over time.

**Lifecycle**: Created when business activates viral features → Updated hourly → Archived after 24 months

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `businessId` | UUID | Yes | Business this metrics belong to |
| `periodStart` | DateTime | Yes | Start of measurement period |
| `periodEnd` | DateTime | Yes | End of measurement period |
| `kFactor` | Decimal | Yes | Viral coefficient (0.0-2.0) |
| `kFactorReferral` | Decimal | Yes | K-factor from referral channel |
| `kFactorChallenge` | Decimal | Yes | K-factor from challenge channel |
| `kFactorInfluencer` | Decimal | Yes | K-factor from influencer channel |
| `kFactorUGC` | Decimal | Yes | K-factor from UGC sharing |
| `existingCustomers` | Integer | Yes | Customer count at period start |
| `newViralCustomers` | Integer | Yes | New customers from viral channels |
| `churnRate` | Decimal | Yes | Customer churn percentage |
| `churnAdjustedKFactor` | Decimal | Yes | K-factor adjusted for churn |
| `status` | Enum | Yes | CALCULATING, COMPLETED, FAILED |
| `calculatedAt` | DateTime | No | When calculation finished |
| `createdAt` | DateTime | Yes | When record created |

### Invariants

- `kFactor >= 0`
- `periodEnd > periodStart`
- `newViralCustomers >= 0`
- `existingCustomers > 0`
- `kFactor = newViralCustomers / existingCustomers`
- `kFactorReferral + kFactorChallenge + kFactorInfluencer + kFactorUGC ≈ kFactor` (within 0.01 tolerance)

### State Transitions

```
CALCULATING → COMPLETED (successful calculation)
CALCULATING → FAILED (error during calculation)
COMPLETED → [terminal state]
FAILED → [terminal state]
```

---

## Entity 2: ReferralChain

**Purpose**: Track multi-level referral relationships (who referred whom, up to 5 levels deep).

**Lifecycle**: Created when customer signs up with referral → Extended when they refer others → Immutable

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `businessId` | UUID | Yes | Business this chain belongs to |
| `customerId` | UUID | Yes | Customer at this node |
| `referredById` | UUID | No | Customer who referred this one (null for root) |
| `level` | Integer | Yes | Depth in chain (1=primary, 2=secondary, etc.) |
| `rootCustomerId` | UUID | Yes | Original customer at top of chain |
| `primaryReferrals` | Integer | Yes | Direct referrals made by this customer |
| `secondaryReferrals` | Integer | Yes | Friend-of-friend referrals |
| `tertiaryReferrals` | Integer | Yes | 3rd degree referrals |
| `totalDownstream` | Integer | Yes | All customers in downstream chain |
| `firstReferralAt` | DateTime | No | When this customer made first referral |
| `viralCycleTime` | Integer | No | Days from signup to first referral |
| `createdAt` | DateTime | Yes | When customer signed up |

### Invariants

- `level >= 1 AND level <= 5`
- `level = 1 → referredById IS NULL` (root node)
- `level > 1 → referredById IS NOT NULL`
- `totalDownstream = primaryReferrals + secondaryReferrals + tertiaryReferrals + ...`
- `viralCycleTime = firstReferralAt - createdAt` (in days)

### State Transitions

```
Created (no referrals) → Active Referrer (made first referral) → Super Referrer (top 20%)
```

---

## Entity 3: SuperReferrer

**Purpose**: Represent top 20% of customers who drive 80% of viral growth.

**Lifecycle**: Identified during daily analysis → Promoted/demoted monthly → Archived after 12 months inactive

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `businessId` | UUID | Yes | Business this referrer belongs to |
| `customerId` | UUID | Yes | Customer identified as super referrer |
| `identifiedAt` | DateTime | Yes | When promoted to super referrer |
| `totalReferrals` | Integer | Yes | All-time referrals made |
| `monthlyReferrals` | Integer | Yes | Referrals in last 30 days |
| `networkSize` | Integer | Yes | Estimated social network connections |
| `influenceScore` | Decimal | Yes | 0-100 influence rating |
| `referralPotential` | Decimal | Yes | Predicted referrals next 90 days |
| `percentile` | Decimal | Yes | Top X% of all referrers (0-100) |
| `tier` | Enum | Yes | BRONZE, SILVER, GOLD, PLATINUM |
| `bonusMultiplier` | Decimal | Yes | Reward multiplier (1.0-5.0x) |
| `status` | Enum | Yes | ACTIVE, INACTIVE, DEMOTED |
| `lastReferralAt` | DateTime | No | Most recent referral date |
| `createdAt` | DateTime | Yes | When record created |
| `updatedAt` | DateTime | Yes | Last update time |

### Invariants

- `totalReferrals >= 5` (minimum for super referrer)
- `percentile >= 80.0` (top 20%)
- `influenceScore >= 0 AND influenceScore <= 100`
- `bonusMultiplier >= 1.0 AND bonusMultiplier <= 5.0`
- `tier mapping`: BRONZE (80-85%), SILVER (85-95%), GOLD (95-99%), PLATINUM (99-100%)

### State Transitions

```
ACTIVE → INACTIVE (no referrals for 90 days)
ACTIVE → DEMOTED (dropped out of top 20%)
INACTIVE → ACTIVE (made new referral)
DEMOTED → [terminal state]
```

---

## Entity 4: ViralChannel

**Purpose**: Track performance of individual viral acquisition channels.

**Lifecycle**: Created when channel activated → Updated daily → Archived after 24 months

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `businessId` | UUID | Yes | Business this channel belongs to |
| `channelType` | Enum | Yes | REFERRAL, CHALLENGE, INFLUENCER, UGC |
| `channelId` | String | No | Specific channel identifier (challenge ID, influencer ID) |
| `periodStart` | DateTime | Yes | Measurement period start |
| `periodEnd` | DateTime | Yes | Measurement period end |
| `signups` | Integer | Yes | New customers from this channel |
| `conversionRate` | Decimal | Yes | Signup → paid customer rate |
| `averageLTV` | Decimal | Yes | Average customer lifetime value |
| `totalRevenue` | Decimal | Yes | Revenue from this channel |
| `cost` | Decimal | Yes | Channel cost (influencer commissions, etc.) |
| `roi` | Decimal | Yes | Return on investment |
| `kFactorContribution` | Decimal | Yes | This channel's K-factor |
| `rank` | Integer | Yes | Ranking vs other channels (1=best) |
| `status` | Enum | Yes | ACTIVE, PAUSED, ENDED |
| `createdAt` | DateTime | Yes | When channel started |
| `updatedAt` | DateTime | Yes | Last update time |

### Invariants

- `signups >= 0`
- `conversionRate >= 0 AND conversionRate <= 1.0`
- `roi = (totalRevenue - cost) / cost` (if cost > 0)
- `kFactorContribution >= 0`
- `rank >= 1`

### State Transitions

```
ACTIVE → PAUSED (business pauses channel)
ACTIVE → ENDED (channel concludes, e.g., challenge ends)
PAUSED → ACTIVE (business resumes)
ENDED → [terminal state]
```

---

## Entity 5: GrowthRecommendation

**Purpose**: AI-generated suggestion for increasing K-factor.

**Lifecycle**: Generated daily → Reviewed by business → Accepted/Rejected → Archived after 90 days

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `businessId` | UUID | Yes | Business this recommendation for |
| `type` | Enum | Yes | LAUNCH_CHALLENGE, PARTNER_INFLUENCER, REWARD_REFERRERS, etc. |
| `title` | String | Yes | Short recommendation summary |
| `description` | Text | Yes | Detailed explanation (AI-generated) |
| `predictedImpact` | Decimal | Yes | Expected K-factor increase (e.g., +0.12) |
| `confidence` | Decimal | Yes | AI confidence level (0-100%) |
| `priority` | Enum | Yes | HIGH, MEDIUM, LOW |
| `dataSource` | JSON | Yes | Data used for recommendation |
| `generatedBy` | String | Yes | AI model used (e.g., "GPT-4o") |
| `status` | Enum | Yes | PENDING, ACCEPTED, REJECTED, IMPLEMENTED |
| `acceptedAt` | DateTime | No | When business accepted |
| `implementedAt` | DateTime | No | When implemented |
| `actualImpact` | Decimal | No | Measured K-factor change after implementation |
| `createdAt` | DateTime | Yes | When generated |

### Invariants

- `predictedImpact >= 0`
- `confidence >= 0 AND confidence <= 100`
- `priority = HIGH if predictedImpact > 0.10`
- `status = IMPLEMENTED → implementedAt IS NOT NULL`

### State Transitions

```
PENDING → ACCEPTED (business approves)
PENDING → REJECTED (business declines)
ACCEPTED → IMPLEMENTED (business executes)
IMPLEMENTED → [terminal state]
REJECTED → [terminal state]
```

---

## Entity 6: ViralCycle

**Purpose**: Measure time-based viral loop performance.

**Lifecycle**: Created when customer makes first referral → Updated as downstream chain grows → Completed when chain stabilizes

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `businessId` | UUID | Yes | Business this cycle belongs to |
| `customerId` | UUID | Yes | Customer who started this cycle |
| `signupDate` | DateTime | Yes | When customer signed up |
| `firstReferralDate` | DateTime | Yes | When they made first referral |
| `cycleTime` | Integer | Yes | Days between signup and first referral |
| `secondaryReferralDate` | DateTime | No | When first secondary referral occurred |
| `secondaryCycleTime` | Integer | No | Days to complete secondary loop |
| `tertiaryReferralDate` | DateTime | No | When first tertiary referral occurred |
| `tertiaryCycleTime` | Integer | No | Days to complete tertiary loop |
| `loopDepth` | Integer | Yes | Maximum depth reached (1-5) |
| `totalCycleTime` | Integer | Yes | Total time to reach max depth |
| `status` | Enum | Yes | ACTIVE, STALLED, COMPLETED |
| `createdAt` | DateTime | Yes | When cycle started |
| `completedAt` | DateTime | No | When cycle completed (3+ levels) |

### Invariants

- `cycleTime = firstReferralDate - signupDate` (in days)
- `loopDepth >= 1 AND loopDepth <= 5`
- `loopDepth = 3 → status = COMPLETED` (minimum for complete viral loop)
- `status = STALLED if no new referrals for 60 days`

### State Transitions

```
ACTIVE → STALLED (no growth for 60 days)
ACTIVE → COMPLETED (reached 3+ loop levels)
STALLED → ACTIVE (new referral in chain)
COMPLETED → [terminal state]
```

---

## Entity 7: ViralSnapshot

**Purpose**: Point-in-time capture of viral metrics for historical trending.

**Lifecycle**: Created hourly via automated job → Immutable → Stored for 24 months

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `businessId` | UUID | Yes | Business this snapshot belongs to |
| `snapshotDate` | DateTime | Yes | Timestamp of snapshot |
| `kFactor` | Decimal | Yes | K-factor at this moment |
| `totalCustomers` | Integer | Yes | Customer count |
| `viralCustomers` | Integer | Yes | Customers from viral channels (all-time) |
| `superReferrersCount` | Integer | Yes | Number of super referrers |
| `activeChannels` | Integer | Yes | Active viral channels count |
| `averageCycleTime` | Decimal | Yes | Average viral cycle time (days) |
| `topChannel` | Enum | Yes | Highest performing channel |
| `milestone` | Enum | No | BRONZE, SILVER, GOLD, PLATINUM (if reached) |
| `createdAt` | DateTime | Yes | When snapshot taken |

### Invariants

- `kFactor >= 0`
- `totalCustomers >= viralCustomers`
- `superReferrersCount <= totalCustomers`
- `activeChannels >= 0`

### State Transitions

```
[Immutable - no state changes after creation]
```

---

## Entity Relationships

```
ViralMetrics 1 ────── * ViralSnapshot (hourly snapshots)
                │
                └──── * ViralChannel (channel breakdown)

ReferralChain * ────── 1 SuperReferrer (top performers)
                │
                └──── 1 ViralCycle (cycle analysis)

GrowthRecommendation * ── 1 ViralMetrics (generated from metrics)
```

---

## Lifecycle Summary

| Entity | Creation Trigger | Update Frequency | Retention |
|--------|------------------|------------------|-----------|
| ViralMetrics | Business activates viral | Hourly | 24 months |
| ReferralChain | Customer signup | On referral | Permanent |
| SuperReferrer | Daily analysis | Daily | 12 months inactive |
| ViralChannel | Channel activation | Daily | 24 months |
| GrowthRecommendation | Daily AI job | Once | 90 days |
| ViralCycle | First referral made | On chain growth | Permanent |
| ViralSnapshot | Hourly job | Never (immutable) | 24 months |

---

**Document Owner**: Backend Team (Growth Squad)
**Last Updated**: 2025-11-09
**Status**: ✅ Complete
