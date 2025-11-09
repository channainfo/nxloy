# Viral Growth Domain - Domain Services

**Last Updated**: 2025-11-09
**Owner**: Backend Team (Growth Squad)

## Overview

Domain Services contain business logic that doesn't naturally fit within a single aggregate. They orchestrate operations across multiple aggregates or perform complex calculations.

---

## Service 1: CalculateKFactorService

**Purpose**: Calculate viral coefficient across all channels

**Dependencies**:
- `ViralMetricsRepository`
- `CustomerRepository`
- `ReferralRepository`

**Method**:
```typescript
class CalculateKFactorService {
  async execute(businessId: UUID, periodStart: Date, periodEnd: Date): Promise<KFactorValue> {
    // 1. Get existing customer count at period start
    const existingCustomers = await this.customerRepo.countByBusinessBeforeDate(
      businessId,
      periodStart
    );

    // 2. Get new viral customers in period
    const viralChannels = ['REFERRAL', 'CHALLENGE', 'INFLUENCER', 'UGC'];
    const newViralCustomers = await this.customerRepo.countByChannelsInPeriod(
      businessId,
      viralChannels,
      periodStart,
      periodEnd
    );

    // 3. Calculate K-factor
    const kFactor = KFactorValue.create(newViralCustomers, existingCustomers);

    // 4. Update metrics aggregate
    let metrics = await this.viralMetricsRepo.findByBusiness(businessId);
    if (!metrics) {
      metrics = ViralMetricsAggregate.create(businessId);
    }

    metrics.calculateKFactor(newViralCustomers, existingCustomers);
    await this.viralMetricsRepo.save(metrics);

    return kFactor;
  }
}
```

---

## Service 2: IdentifySuperReferrersService

**Purpose**: Detect top 20% referrers using Pareto analysis

**Method**:
```typescript
class IdentifySuperReferrersService {
  async execute(businessId: UUID): Promise<SuperReferrer[]> {
    // 1. Get all customers with referral counts
    const customers = await this.referralChainRepo.findAllWithCounts(businessId);

    // 2. Sort by total referrals (descending)
    const sorted = customers.sort((a, b) => b.totalReferrals - a.totalReferrals);

    // 3. Calculate 80th percentile threshold
    const top20PercentIndex = Math.floor(sorted.length * 0.20);
    const top20Percent = sorted.slice(0, top20PercentIndex);

    // 4. Filter for minimum 5 referrals
    const qualified = top20Percent.filter(c => c.totalReferrals >= 5);

    // 5. Create/update SuperReferrer aggregates
    const superReferrers: SuperReferrer[] = [];

    for (const customer of qualified) {
      const percentile = ((sorted.length - sorted.indexOf(customer)) / sorted.length) * 100;

      const influenceScore = InfluenceScore.calculate(
        customer.networkSize,
        customer.totalReferrals,
        customer.engagementRate,
        customer.socialFollowers
      );

      const aggregate = SuperReferrerAggregate.identify(
        customer.id,
        customer.totalReferrals,
        percentile,
        customer.networkSize,
        influenceScore
      );

      await this.superReferrerRepo.save(aggregate);
      superReferrers.push(aggregate.root);
    }

    return superReferrers;
  }
}
```

---

## Service 3: ExtendReferralChainService

**Purpose**: Add new node to multi-level referral graph

**Method**:
```typescript
class ExtendReferralChainService {
  async execute(referredCustomerId: UUID, referrerId: UUID, businessId: UUID): Promise<void> {
    // 1. Get referrer's chain
    const referrerChain = await this.referralChainRepo.findByCustomer(referrerId);

    // 2. Validate depth limit
    if (referrerChain.level >= 5) {
      // Max depth reached, don't track further
      return;
    }

    // 3. Create new chain node
    const newChain = new ReferralChain(
      UUID.create(),
      businessId,
      referredCustomerId,
      referrerId,
      referrerChain.level + 1,
      referrerChain.rootCustomerId
    );

    await this.referralChainRepo.save(newChain);

    // 4. Update referrer's counts
    referrerChain.recordFirstReferral(referredCustomerId);
    await this.referralChainRepo.save(referrerChain);

    // 5. Update upstream chains (secondary, tertiary referrals)
    await this.updateUpstreamChains(referrerChain);
  }

  private async updateUpstreamChains(chain: ReferralChain): Promise<void> {
    let currentChain = chain;

    while (currentChain.referredById) {
      const parentChain = await this.referralChainRepo.findByCustomer(currentChain.referredById);

      if (currentChain.level === 2) {
        parentChain.secondaryReferrals += 1;
      } else if (currentChain.level === 3) {
        parentChain.tertiaryReferrals += 1;
      }

      parentChain.totalDownstream += 1;
      await this.referralChainRepo.save(parentChain);

      currentChain = parentChain;
    }
  }
}
```

---

## Service 4: GenerateGrowthRecommendationsService

**Purpose**: Use AI to suggest K-factor optimization tactics

**Dependencies**:
- `OpenAI GPT-4o API`
- `ViralMetricsRepository`

**Method**:
```typescript
class GenerateGrowthRecommendationsService {
  async execute(businessId: UUID): Promise<GrowthRecommendation[]> {
    // 1. Get current viral metrics
    const metrics = await this.viralMetricsRepo.findByBusiness(businessId);

    // 2. Get historical performance
    const historicalData = await this.viralMetricsRepo.findLast30Days(businessId);

    // 3. Generate AI prompt
    const prompt = `
      Analyze viral growth data and suggest 3 tactics to increase K-factor:

      Current K-Factor: ${metrics.kFactor}
      Target: 0.7

      Channel Performance:
      - Referral: ${metrics.kFactorReferral}
      - Challenge: ${metrics.kFactorChallenge}
      - Influencer: ${metrics.kFactorInfluencer}
      - UGC: ${metrics.kFactorUGC}

      Provide:
      1. Recommendation title
      2. Detailed explanation
      3. Predicted K-factor impact
      4. Confidence level (%)
    `;

    // 4. Call GPT-4o
    const aiResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    });

    // 5. Parse recommendations
    const recommendations = this.parseAIRecommendations(aiResponse, businessId);

    // 6. Save to database
    for (const rec of recommendations) {
      await this.recommendationRepo.save(rec);
    }

    return recommendations;
  }
}
```

---

## Service 5: CalculateViralCycleTimeService

**Purpose**: Measure time from signup to first referral

**Method**:
```typescript
class CalculateViralCycleTimeService {
  async execute(businessId: UUID): Promise<number> {
    // 1. Get all customers who made referrals
    const chains = await this.referralChainRepo.findWithFirstReferral(businessId);

    // 2. Calculate cycle time for each
    const cycleTimes = chains.map(chain => {
      return ViralCycleTimeValue.create(
        chain.createdAt,
        chain.firstReferralAt!
      ).days;
    });

    // 3. Return median (more robust than mean)
    return this.calculateMedian(cycleTimes);
  }

  private calculateMedian(values: number[]): number {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }
}
```

---

## Service 6: AttributeViralSignupService

**Purpose**: Determine which viral channel caused a signup

**Method**:
```typescript
class AttributeViralSignupService {
  async execute(customerId: UUID): Promise<ViralChannelAttribution> {
    // 1. Get customer journey touchpoints
    const touchpoints = await this.customerJourneyRepo.findTouchpoints(customerId);

    // 2. Filter for viral channels only
    const viralTouchpoints = touchpoints.filter(t =>
      ['REFERRAL', 'CHALLENGE', 'INFLUENCER', 'UGC'].includes(t.channel)
    );

    // 3. Calculate attribution
    const attribution = ViralChannelAttribution.calculate(viralTouchpoints);

    // 4. Update channel performance metrics
    await this.updateChannelMetrics(attribution);

    return attribution;
  }

  private async updateChannelMetrics(attribution: ViralChannelAttribution): Promise<void> {
    // Credit first-touch channel with 40%
    await this.channelRepo.incrementSignups(
      attribution.firstTouch.channel,
      0.4
    );

    // Credit last-touch channel with 60%
    await this.channelRepo.incrementSignups(
      attribution.lastTouch.channel,
      0.6
    );
  }
}
```

---

## Domain Service Patterns

### Orchestration Pattern
Domain services orchestrate across multiple aggregates:

```typescript
// Service coordinates ViralMetrics + ReferralChain + SuperReferrer
async function fullViralAnalysis(businessId: UUID): Promise<void> {
  // Step 1: Calculate K-factor
  const kFactor = await calculateKFactorService.execute(businessId, ...);

  // Step 2: Identify super referrers
  const superReferrers = await identifySuperReferrersService.execute(businessId);

  // Step 3: Generate recommendations
  const recommendations = await generateRecommendationsService.execute(businessId);

  // Each step modifies different aggregates
}
```

### Calculation Pattern
Domain services perform complex calculations:

```typescript
// Service calculates metrics from multiple data sources
const viralCycleTime = await calculateCycleTimeService.execute(businessId);
const kFactor = await calculateKFactorService.execute(businessId, ...);
```

---

**Document Owner**: Backend Team (Growth Squad)
**Last Updated**: 2025-11-09
**Status**: ✅ Complete
