# Viral Analytics & Growth Metrics - Feature Specification

**Feature**: K-Factor Tracking, Super Referrer Identification & Viral Loop Optimization
**Version**: 1.0.0
**Status**: 🟢 Ready for Implementation
**Priority**: P1 (Critical for Viral Growth - Phase 2-3)
**Phase**: Integrated across Phases 2-3
**Teams**: Backend, Analytics, Growth, Data Science
**Estimated Effort**: 4 weeks
**Target Release**: 2026-Q2-Q3
**Last Updated**: 2025-11-09

---

## Executive Summary

This feature provides comprehensive analytics and optimization for viral growth across all NxLoy features (UGC, Challenges, Referrals, Influencers). It calculates K-factors, identifies super referrers, tracks viral loops, and provides actionable insights to maximize viral coefficient.

**Key Value**: Turn NxLoy into a **growth engine** with K = 0.5-0.7, enabling 50-70% compounding monthly growth without paid ads.

---

## Problem Statement

**Current Challenge**: Businesses have no visibility into viral mechanics:
- Don't know their viral coefficient (K-factor)
- Can't identify which customers drive most referrals ("super referrers")
- No insight into viral loops (primary, secondary, tertiary referrals)
- Can't optimize viral features for maximum growth
- Miss opportunities to amplify what's working

**Impact**: Without viral analytics, businesses:
- Spend on ineffective marketing (high CAC)
- Fail to leverage network effects
- Can't replicate viral successes
- Underinvest in top referrers

**Solution**: Comprehensive viral analytics dashboard showing K-factor, viral loops, super referrers, channel performance, and optimization recommendations.

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Overall K-Factor** | 0.5-0.7 | New customers / Existing customers (monthly) |
| **Super Referrer Identification** | Identify top 20% | Pareto analysis of referral distribution |
| **Viral Loop Visibility** | Track 3 levels deep | Primary, secondary, tertiary referrals |
| **Channel Attribution** | 95%+ accuracy | Correctly attribute referrals to channels |
| **Optimization Impact** | 20%+ K-factor lift | Before/after optimization recommendations |

---

## Core Features

### 1. K-Factor Calculation & Tracking

**Viral Coefficient (K-Factor) Formula**:
```
K = (New Customers Acquired via Referrals) / (Existing Customers)

Interpretation:
- K < 1.0: Sub-viral (still good, reduces CAC)
- K = 1.0: Self-sustaining (each customer brings 1 more)
- K > 1.0: Viral (exponential growth)

NxLoy Target: K = 0.5-0.7
```

**Multi-Channel K-Factor Breakdown**:
```typescript
interface KFactorBreakdown {
  overall: number;  // 0.62 (target: 0.5-0.7)
  byChannel: {
    referrals: number;        // 0.30 (direct referral codes)
    challenges: number;        // 0.15 (viral challenge participation)
    influencers: number;       // 0.12 (influencer partnerships)
    ugc: number;              // 0.05 (social sharing of UGC)
  };
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  projectedGrowth: string;  // "65% monthly growth at K=0.62"
}
```

**Time-Series Tracking**:
- Daily K-factor (7-day moving average)
- Weekly K-factor (month-over-month comparison)
- Monthly K-factor (annual trend)
- Forecast: Project next 3-6 months based on current K

### 2. Super Referrer Identification

**Pareto Analysis** (80/20 Rule):
```
Top 20% of customers drive 80% of referrals

Super Referrer Criteria:
1. Large social network (1,000+ Instagram followers)
2. High influence score (engagement rate >5%)
3. Historical referral success (5+ successful referrals)
4. Referral conversion rate >20% (5 referred, 1+ convert)
```

**Super Referrer Scoring Algorithm**:
```python
def identify_super_referrers(customers):
    """
    Score each customer's referral potential
    """
    for customer in customers:
        score = (
            customer.network_size * 0.30 +
            customer.influence_score * 0.25 +
            customer.past_referrals * 0.25 +
            customer.conversion_rate * 0.20
        )

        if score >= 70:
            customer.is_super_referrer = True
            # Offer 2x points for super referrers
            customer.referral_bonus_multiplier = 2.0
```

**Super Referrer Benefits**:
- **2x Referral Points**: Earn 200 points per referral (vs 100 for regular)
- **VIP Status**: Exclusive perks, early access to products
- **Ambassador Program**: Formal partnership with higher rewards
- **Personalized Outreach**: "We see you have a large network. Join our Ambassador program!"

### 3. Viral Loop Tracking

**Multi-Level Referral Tracking**:
```
Level 1 (Primary): Customer A refers Customer B
Level 2 (Secondary): Customer B refers Customer C
Level 3 (Tertiary): Customer C refers Customer D

Viral Loop Metrics:
- Primary referrals: 100 (direct from Customer A)
- Secondary referrals: 20 (20% of primary referred others)
- Tertiary referrals: 4 (20% of secondary referred others)
- Total viral impact: 124 customers from 1 original customer

Viral Multiplier: 1.24x
```

**Viral Cycle Time**:
```
Average time from:
- Customer A joins → Customer A refers Customer B: 7 days
- Customer B joins → Customer B refers Customer C: 14 days

Faster cycle = faster growth
Optimization: Reduce cycle time via:
- Immediate onboarding bonus ("Refer a friend in first 24 hours for 2x points!")
- Push notifications ("Your friend Sarah just joined. Invite 2 more for bonus!")
```

### 4. Channel Performance Analytics

**Attribution Model**:
```typescript
interface ChannelAttribution {
  channel: 'REFERRAL' | 'CHALLENGE' | 'INFLUENCER' | 'UGC' | 'ORGANIC';
  newCustomers: number;
  cost: number;  // Reward costs
  cac: number;   // Cost per acquisition
  ltv: number;   // Lifetime value
  roi: number;   // LTV / CAC
  kFactor: number;
}

// Example:
{
  channel: 'REFERRAL',
  newCustomers: 150,
  cost: 15000,  // $100 reward per referral
  cac: 100,
  ltv: 500,
  roi: 5.0,
  kFactor: 0.30
}
```

**Optimization Recommendations**:
```typescript
interface OptimizationRecommendation {
  type: 'INCREASE_BUDGET' | 'DECREASE_BUDGET' | 'OPTIMIZE_CREATIVE' | 'CHANGE_TARGETING';
  channel: string;
  currentKFactor: number;
  projectedKFactor: number;
  reasoning: string;
  actionItems: string[];
}

// Example:
{
  type: 'INCREASE_BUDGET',
  channel: 'CHALLENGES',
  currentKFactor: 0.15,
  projectedKFactor: 0.22,
  reasoning: "Viral challenges show highest engagement rate (60%) and lowest CAC ($20). Increasing challenge frequency from 1/month to 2/month could boost K-factor 47%.",
  actionItems: [
    "Launch 2 challenges per month (currently 1)",
    "Increase challenge reward budget from $500 to $1,000",
    "Run challenges during peak engagement (Friday evenings)"
  ]
}
```

### 5. Viral Dashboard

**Real-Time Metrics Display**:
```
┌─────────────────────────────────────────────┐
│  Viral Growth Dashboard                     │
├─────────────────────────────────────────────┤
│  Overall K-Factor: 0.62 ✅ (Target: 0.5-0.7)│
│  Monthly Growth: 65% ↑ (Viral!)             │
│  Viral Cycle Time: 9.5 days ↓ (Improving)   │
├─────────────────────────────────────────────┤
│  Channel Breakdown                          │
├─────────────────────────────────────────────┤
│  Referrals:    K=0.30  |███████░░░| 30%     │
│  Challenges:   K=0.15  |████░░░░░░| 15%     │
│  Influencers:  K=0.12  |███░░░░░░░| 12%     │
│  UGC Sharing:  K=0.05  |█░░░░░░░░░| 5%      │
├─────────────────────────────────────────────┤
│  Super Referrers                            │
├─────────────────────────────────────────────┤
│  Identified: 47 (Top 20% of 235 customers)  │
│  Avg Referrals: 8.2 per super referrer      │
│  Contribution: 72% of total referrals       │
├─────────────────────────────────────────────┤
│  Viral Loops                                │
├─────────────────────────────────────────────┤
│  Primary Referrals: 150                     │
│  Secondary Referrals: 34 (22.7%)            │
│  Tertiary Referrals: 8 (23.5%)              │
│  Total Viral Impact: 192 (1.28x multiplier) │
├─────────────────────────────────────────────┤
│  Optimization Opportunities                 │
├─────────────────────────────────────────────┤
│  🎯 Increase challenge frequency (K +0.07)  │
│  🎯 Target super referrers with 2x rewards  │
│  🎯 Reduce viral cycle time to 7 days       │
│  💡 Projected K-Factor: 0.75 (+21%)         │
└─────────────────────────────────────────────┘
```

---

## Functional Requirements

### FR-1: K-Factor Calculation Engine

**Daily K-Factor Calculation**:
```python
def calculate_k_factor(period='monthly'):
    """
    Calculate viral coefficient for specified period
    """
    # Get existing customers at start of period
    existing_customers = Customer.objects.filter(
        created_at__lt=period_start
    ).count()

    # Get new customers acquired via referrals during period
    new_customers_via_referrals = Customer.objects.filter(
        created_at__gte=period_start,
        created_at__lt=period_end,
        acquisition_channel__in=['REFERRAL', 'CHALLENGE', 'INFLUENCER', 'UGC']
    ).count()

    # Calculate K-factor
    if existing_customers > 0:
        k_factor = new_customers_via_referrals / existing_customers
    else:
        k_factor = 0

    return {
        'k_factor': round(k_factor, 3),
        'existing_customers': existing_customers,
        'new_customers_via_referrals': new_customers_via_referrals,
        'period': period,
        'interpretation': interpret_k_factor(k_factor)
    }

def interpret_k_factor(k):
    if k >= 1.0:
        return "VIRAL: Exponential growth!"
    elif k >= 0.5:
        return "STRONG: Excellent viral mechanics"
    elif k >= 0.3:
        return "GOOD: Healthy viral growth"
    elif k >= 0.1:
        return "MODERATE: Some viral activity"
    else:
        return "LOW: Needs optimization"
```

### FR-2: Super Referrer Identification

**Weekly Batch Job**:
```python
def identify_and_reward_super_referrers():
    """
    Run weekly: Identify super referrers, offer enhanced rewards
    """
    customers = Customer.objects.all()

    for customer in customers:
        # Get social graph data
        social_graph = CustomerSocialGraph.objects.get(customer_id=customer.id)

        # Calculate referral score
        score = (
            (social_graph.network_size / 10000) * 30 +  # Normalize to 0-30
            social_graph.influence_score * 0.25 +
            customer.total_referrals * 2.5 +  # 10 referrals = 25 points
            (customer.referral_conversion_rate * 100) * 0.20
        )

        # Classify as super referrer if score >= 70
        if score >= 70 and not customer.is_super_referrer:
            customer.is_super_referrer = True
            customer.referral_bonus_multiplier = 2.0
            customer.save()

            # Send personalized email
            send_email(
                to=customer.email,
                subject="You're a VIP Referrer! 🌟",
                body=f"Hi {customer.first_name}, we see you have a large network! You've been upgraded to our Ambassador program. Earn 2x points on every referral. Invite friends to unlock exclusive perks!"
            )

            # Create notification
            create_notification(
                customer_id=customer.id,
                type='SUPER_REFERRER_UPGRADE',
                title='VIP Referrer Status Unlocked!',
                message='You now earn 2x points per referral. Keep sharing!'
            )
```

### FR-3: Viral Loop Tracking

**Recursive Referral Tracking**:
```python
def track_viral_loop(customer_id, level=1, max_level=3):
    """
    Recursively track referrals up to 3 levels deep
    """
    if level > max_level:
        return []

    # Get direct referrals (Level N)
    referrals = Referral.objects.filter(
        referrer_id=customer_id,
        status='QUALIFIED'
    )

    results = []
    for referral in referrals:
        referred_customer_id = referral.referred_id

        results.append({
            'level': level,
            'referrer_id': customer_id,
            'referred_id': referred_customer_id,
            'referral_date': referral.qualified_at
        })

        # Recursively get next level
        if level < max_level:
            sub_referrals = track_viral_loop(referred_customer_id, level + 1, max_level)
            results.extend(sub_referrals)

    return results

# Usage:
viral_tree = track_viral_loop(customer_id='cust_123', level=1, max_level=3)

# Analyze:
primary = [r for r in viral_tree if r['level'] == 1]
secondary = [r for r in viral_tree if r['level'] == 2]
tertiary = [r for r in viral_tree if r['level'] == 3]

print(f"Primary: {len(primary)}, Secondary: {len(secondary)}, Tertiary: {len(tertiary)}")
# Output: "Primary: 10, Secondary: 3, Tertiary: 1"
# Viral multiplier: (10 + 3 + 1) / 10 = 1.4x
```

### FR-4: Channel Attribution

**Last-Touch Attribution** (Primary Model):
```python
def attribute_customer(customer):
    """
    Attribute new customer to the channel that directly led to signup
    """
    # Check for referral code in signup
    if customer.referral_code:
        referral = ReferralCode.objects.get(code=customer.referral_code)
        return {
            'channel': 'REFERRAL',
            'source_id': referral.id,
            'source_type': referral.type  # PERSONAL, INFLUENCER, CAMPAIGN
        }

    # Check for challenge participation before signup
    challenge_click = ChallengeClick.objects.filter(
        session_id=customer.session_id,
        clicked_at__lte=customer.created_at
    ).order_by('-clicked_at').first()

    if challenge_click:
        return {
            'channel': 'CHALLENGE',
            'source_id': challenge_click.challenge_id
        }

    # Check for UGC social share click
    ugc_click = UGCShareClick.objects.filter(
        session_id=customer.session_id,
        clicked_at__lte=customer.created_at
    ).order_by('-clicked_at').first()

    if ugc_click:
        return {
            'channel': 'UGC',
            'source_id': ugc_click.ugc_submission_id
        }

    # Default: Organic
    return {
        'channel': 'ORGANIC',
        'source_id': None
    }
```

---

## Database Schema

See: `/Users/channaly/nxloy/packages/database/prisma/schema/referrals.prisma` (ReferralAnalytics model)

**Additional Models**:
```prisma
model ViralMetrics {
  id               String   @id @default(cuid())
  businessId       String
  period           String   // "2025-11", "2025-W45"
  periodType       String   // "monthly", "weekly", "daily"

  // K-Factor Metrics
  kFactorOverall   Float    @default(0)
  kFactorReferrals Float    @default(0)
  kFactorChallenges Float   @default(0)
  kFactorInfluencers Float  @default(0)
  kFactorUGC       Float    @default(0)

  // Viral Loop Metrics
  primaryReferrals   Int    @default(0)
  secondaryReferrals Int    @default(0)
  tertiaryReferrals  Int    @default(0)
  viralMultiplier    Float  @default(1.0)

  // Growth Metrics
  existingCustomers  Int
  newCustomers       Int
  viralCustomers     Int
  organicCustomers   Int
  growthRate         Float  // % growth

  // Cycle Metrics
  avgViralCycleTime  Float  // Days

  createdAt        DateTime @default(now())

  @@unique([businessId, period, periodType])
  @@index([businessId, periodType])
  @@map("viral_metrics")
}
```

---

## API Specifications

### Endpoint: Get Viral Metrics

**GET /api/analytics/viral?period=monthly**

**Response** (200 OK):
```json
{
  "kFactor": {
    "overall": 0.62,
    "referrals": 0.30,
    "challenges": 0.15,
    "influencers": 0.12,
    "ugc": 0.05
  },
  "viralLoops": {
    "primary": 150,
    "secondary": 34,
    "tertiary": 8,
    "multiplier": 1.28
  },
  "superReferrers": {
    "count": 47,
    "percentage": 20,
    "avgReferrals": 8.2,
    "contribution": 72
  },
  "growth": {
    "monthlyRate": 65,
    "trend": "INCREASING",
    "projection": "Next month: +73%"
  },
  "recommendations": [
    {
      "type": "INCREASE_FREQUENCY",
      "channel": "CHALLENGES",
      "impact": "+0.07 K-factor",
      "action": "Launch 2 challenges per month"
    }
  ]
}
```

---

## Implementation Phases

### Phase 2B: K-Factor Tracking (Week 6-7)
- Daily K-factor calculation
- Channel attribution
- Basic viral dashboard

### Phase 2C: Super Referrer Identification (Week 7-8)
- Social graph integration
- Referrer scoring algorithm
- Automated VIP upgrades

### Phase 3A: Viral Loop Tracking (Week 9-10)
- Multi-level referral tracking
- Viral multiplier calculations
- Cycle time analysis

### Phase 3B: Optimization Engine (Week 10-12)
- AI recommendations
- A/B testing framework
- Predictive modeling

---

## Risk Mitigation

**Risk 1: Attribution Errors**
- **Mitigation**: Multi-touch attribution, session tracking, cookie-based fallback

**Risk 2: Gaming the System**
- **Mitigation**: Fraud detection, verify real customers, delay rewards 30 days

**Risk 3: Privacy Concerns**
- **Mitigation**: Anonymize viral tree data, GDPR consent for social graph analysis

---

## Conclusion

Viral Analytics is the **control panel** for exponential growth. By tracking K-factor, identifying super referrers, and optimizing viral loops, businesses achieve sustainable 50-70% monthly growth.

**Target**: K = 0.5-0.7 → 10x growth in 6 months

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-09
**Author**: Claude Code + Product Team
