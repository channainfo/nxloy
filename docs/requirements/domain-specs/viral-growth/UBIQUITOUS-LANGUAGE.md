# Viral Growth Domain - Ubiquitous Language

**Last Updated**: 2025-11-09
**Owner**: Backend Team (Growth Squad)

## Core Terminology

### K-Factor (Viral Coefficient)
**Definition**: The number of new customers each existing customer brings through viral channels.

**Formula**: K = (New Customers from Viral Channels) / (Existing Customers)

**Interpretation**:
- K < 1.0: Linear growth (not viral)
- K = 1.0: Sustainable growth (replacement rate)
- K > 1.0: Exponential growth (viral!)
- **Target**: 0.5-0.7 for sustainable viral growth

**Example**:
```
Month 1: 1,000 customers
Month 2: 500 new customers from viral channels (referrals + challenges + influencers)
K-Factor = 500 / 1,000 = 0.5 (viral growth achieved!)
```

---

### Viral Channel
**Definition**: A source of customer acquisition driven by existing customers' actions.

**Channels**:
1. **Referral** - Direct referral code sharing
2. **Challenge** - Viral challenge participation and social sharing
3. **Influencer** - Influencer promotion to their followers
4. **UGC** - User-generated content shared to social media

**Attribution**: First-touch (which channel brought the customer initially)

---

### Super Referrer
**Definition**: Top 20% of customers who drive 80% of viral growth (Pareto principle).

**Criteria**:
- Minimum 5 direct referrals
- Above-average network size (estimated from social graph)
- High influence score (based on engagement and conversions)

**Benefits**:
- VIP status badge
- Bonus reward multipliers (2x-5x points)
- Early access to new features
- Personalized growth manager

**Example**: Alice referred 12 friends (top 5%), marked as Super Referrer

---

### Viral Loop
**Definition**: The cyclical process where customers bring new customers, who in turn bring more customers.

**Loop Structure**:
```
Primary Referral:   Customer A → Customer B
Secondary Referral: Customer B → Customer C (friend-of-friend)
Tertiary Referral:  Customer C → Customer D (3rd degree)
```

**Complete Loop**: When tertiary referral occurs (3+ levels deep)

---

### Referral Chain
**Definition**: The multi-level relationship graph tracking who referred whom.

**Depth**: Up to 5 levels deep (primary → secondary → tertiary → quaternary → quinary)

**Tracking**: Each customer has `referredById` pointing to their referrer

**Example Chain**:
```
Alice → Bob → Carol → Dan → Eve → Frank
  1      2      3       4      5    (levels)
```

---

### Viral Cycle Time
**Definition**: Average time for a referred customer to make their first referral.

**Formula**: Median(days between signup and first referral made)

**Benchmarks**:
- Fast: <7 days
- Average: 7-30 days
- Slow: >30 days

**Optimization Goal**: Reduce cycle time to accelerate viral growth

---

### Network Size
**Definition**: Estimated number of people in a customer's social network.

**Calculation**: Based on social graph connections, email domain (@gmail vs @company), location

**Tiers**:
- Small: <100 connections
- Medium: 100-500 connections
- Large: 500-2,000 connections
- Mega: >2,000 connections

**Usage**: Predict referral potential

---

### Influence Score
**Definition**: 0-100 score predicting a customer's ability to drive referrals.

**Factors**:
- Network size (30%)
- Past referral success (40%)
- Engagement rate (20%)
- Social media presence (10%)

**Tiers**:
- Low: 0-30
- Medium: 31-60
- High: 61-85
- Elite: 86-100

---

### Referral Potential
**Definition**: Predicted number of referrals a customer will make in next 90 days.

**Model**: Regression based on network size, influence score, past behavior

**Example**: Alice has referral potential of 8.5 (predicted to refer 8-9 people in 90 days)

---

### Viral Milestone
**Definition**: Significant K-factor achievement that triggers celebration/reward.

**Milestones**:
- K = 0.3: Bronze (viral traction)
- K = 0.5: Silver (sustainable viral growth)
- K = 0.7: Gold (strong viral growth)
- K = 1.0: Platinum (exponential growth)

**Action**: Notify business, celebrate with customers, adjust marketing spend

---

### Growth Recommendation
**Definition**: AI-generated suggestion for increasing K-factor.

**Examples**:
- "Launch challenge using trending hashtag #SummerVibes (predicted K-factor impact: +0.08)"
- "Reward super referrers with 2x points (predicted K-factor impact: +0.12)"
- "Partner with influencer @coffee_lover_sf (predicted K-factor impact: +0.15)"

**Generation**: Daily via GPT-4o analysis of viral metrics

---

### Viral Attribution
**Definition**: Process of determining which viral channel caused a signup.

**Model**: Multi-touch attribution (40% first-touch, 60% last-touch)

**Example**:
```
Customer journey:
1. Saw influencer post (first-touch)
2. Joined viral challenge (engagement)
3. Clicked referral link (last-touch)

Attribution: 40% Influencer, 60% Referral
```

---

### Churn-Adjusted K-Factor
**Definition**: K-factor accounting for customer churn (more conservative metric).

**Formula**: K_adjusted = K × (1 - churn_rate)

**Example**:
- K = 0.6
- Churn rate = 20%
- K_adjusted = 0.6 × (1 - 0.20) = 0.48

**Usage**: More accurate for long-term growth forecasting

---

## Domain-Specific Verbs

### Calculate K-Factor
**Action**: Compute viral coefficient from new viral signups and existing customer base.

**Trigger**: Hourly scheduled job

**Output**: K-factor value (0.0-2.0 typical range)

---

### Identify Super Referrer
**Action**: Detect top 20% referrers using Pareto analysis.

**Criteria**: Sort by total referrals, take top 20% with minimum 5 referrals

**Output**: List of customer IDs marked as super referrers

---

### Extend Referral Chain
**Action**: Add new link to multi-level referral graph.

**Trigger**: New customer signup with referral code

**Output**: Updated referral chain with new node

---

### Measure Viral Cycle
**Action**: Calculate time between customer signup and their first referral.

**Output**: Cycle time in days (median across all customers)

---

### Generate Growth Recommendation
**Action**: Use AI to suggest K-factor optimization tactics.

**Trigger**: Daily job analyzing past 30 days of data

**Output**: 3-5 actionable recommendations with predicted impact

---

### Attribute Viral Signup
**Action**: Assign credit to viral channels for new customer.

**Method**: Multi-touch attribution (first-touch + last-touch)

**Output**: Channel attribution percentages (sum to 100%)

---

## Anti-Patterns (What NOT to Say)

❌ "Referral count" → ✅ "K-factor" (use standard metric)
❌ "Top referrer" → ✅ "Super referrer" (domain-specific term)
❌ "Friend-of-friend" → ✅ "Secondary referral" (precise terminology)
❌ "Viral rate" → ✅ "Viral coefficient" or "K-factor" (industry standard)
❌ "Growth score" → ✅ "Influence score" (specific meaning)
❌ "Sharing chain" → ✅ "Referral chain" (domain term)

---

## Cross-Domain Terms

### From Referrals Domain
- **Referral Code**: Unique identifier for tracking who referred whom
- **Referral Reward**: Points awarded for successful referral
- **Dual-Sided Incentive**: Both referrer and referred receive rewards

### From Social Domain
- **Challenge Participation**: Joining viral challenge (contributes to K-factor)
- **Influencer Partnership**: Collaborating with micro-influencer
- **UGC Submission**: Sharing user-generated content

### From Customer Management
- **Customer**: Person enrolled in loyalty program
- **Signup Date**: When customer created account
- **Churn**: Customer stops using platform

---

## Formulas Reference

### K-Factor (Basic)
```
K = New_Viral_Customers / Existing_Customers
```

### K-Factor (By Channel)
```
K_referral = New_Referral_Customers / Existing_Customers
K_challenge = New_Challenge_Customers / Existing_Customers
K_influencer = New_Influencer_Customers / Existing_Customers
K_ugc = New_UGC_Customers / Existing_Customers

K_total = K_referral + K_challenge + K_influencer + K_ugc
```

### Churn-Adjusted K-Factor
```
K_adjusted = K × (1 - Churn_Rate)
```

### Viral Cycle Time
```
Cycle_Time = Median(Signup_Date - First_Referral_Date) for all customers
```

### Influence Score
```
Influence = (Network_Size × 0.3) + (Referral_Success × 0.4) + (Engagement × 0.2) + (Social_Presence × 0.1)
```

### Super Referrer Threshold
```
Super_Referrer = Top_20_Percent(Customers_Sorted_By_Referrals) WHERE Referrals >= 5
```

---

**Document Owner**: Backend Team (Growth Squad)
**Last Updated**: 2025-11-09
**Status**: ✅ Complete
