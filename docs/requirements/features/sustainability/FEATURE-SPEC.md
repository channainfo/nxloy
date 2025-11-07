# Sustainability & ESG Tracking - Feature Specification

**Feature**: Sustainability & ESG Tracking
**Version**: 1.0.0
**Status**: 🟡 Phase 5 Feature (Months 13-18)
**Priority**: P1 (Critical for brand differentiation and Gen Z appeal)
**Last Updated**: 2025-11-07

---

## Problem Statement

**Current Challenge**: Customers increasingly care about environmental and social impact, but loyalty programs don't measure or reward sustainable behavior:
- No visibility into carbon footprint of purchases
- No incentive for eco-friendly choices
- Businesses can't track or report ESG metrics
- Younger demographics (73% of Gen Z) prefer brands with strong sustainability commitments
- Regulatory pressure (EU CSRD, SEC climate disclosure rules)

**Business Impact**:
- Losing Gen Z/Millennial customers to sustainability-focused competitors
- Missing $150B+ sustainable products market opportunity
- Cannot demonstrate ESG credentials to investors/partners
- No data to support sustainability claims (greenwashing risk)

**Why This Matters**:
- **73% of consumers** willing to pay more for sustainable products
- **Patagonia** built $3B brand on sustainability transparency
- **Allbirds** carbon labels on every product drove 40% sales increase
- **Klarna** CO2 tracking in app increased user engagement by 25%

---

## Solution Summary

Build comprehensive sustainability tracking that enables:

1. **Carbon Footprint Tracking**: Calculate CO2 emissions for every purchase
2. **Eco-Rewards**: Bonus points for sustainable choices (reusable cups, plant-based items, bike deliveries)
3. **Impact Dashboard**: Show customer's environmental impact (trees planted, plastic avoided, CO2 saved)
4. **Green Challenges**: Gamified sustainability goals ("Zero Waste Week," "Meatless Monday")
5. **Offset Marketplace**: Redeem points for carbon offsets, tree planting, ocean cleanup
6. **ESG Reporting**: Business dashboard with ESG metrics for investors/regulators
7. **Supply Chain Transparency**: Blockchain-verified sustainable sourcing

**Technology Stack**:
- Carbon APIs: Climatiq, Carbon Interface, Watershed
- Blockchain: Polygon (for supply chain verification)
- Data Visualization: D3.js, Recharts
- Offset Providers: Pachama, Nori, Verra Registry

---

## Success Criteria

| Metric | Current Baseline | Target (6 months) | Measurement |
|--------|------------------|-------------------|-------------|
| Carbon Tracked | 0 kg CO2 | 10M+ kg CO2 tracked | Total emissions calculated |
| Eco-Purchases | 0% | 25%+ of transactions | % with sustainable options |
| Offset Redemptions | 0 | 50,000+ offsets | Total carbon offsets purchased |
| Green Challenge Participation | 0% | 20%+ of users | % joined ≥1 sustainability challenge |
| ESG Report Adoption | 0% | 50%+ of businesses | % using ESG dashboard |
| Sustainability NPS | N/A | 60+ | Net Promoter Score for feature |
| Revenue from Eco-Products | $0 | $2M+/month | Sales of sustainable items |

---

## User Stories

### Customer (Sustainability-Conscious)

**Story 1: Track Personal Carbon Footprint**
```
As an environmentally-conscious customer,
I want to see the carbon footprint of my purchases,
So that I can make more sustainable choices and reduce my impact.

Acceptance Criteria:
- Every purchase shows CO2 emissions (kg)
- Dashboard shows total carbon footprint (monthly, yearly)
- Compare my footprint vs. community average
- Breakdown by category (coffee, food, merchandise)
- Tips to reduce carbon footprint
```

**Story 2: Earn Rewards for Sustainable Choices**
```
As a customer,
I want to earn bonus points for eco-friendly choices (reusable cup, bike delivery),
So that I'm incentivized to make sustainable decisions.

Acceptance Criteria:
- 2x points for bringing reusable cup
- 50 bonus points for choosing bike delivery
- Badge for 10+ sustainable purchases
- "Eco-Hero" tier with exclusive green rewards
```

### Business Owner

**Story 3: Generate ESG Report**
```
As a business owner,
I want to generate an ESG report showing our environmental impact,
So that I can share metrics with investors, partners, and regulators.

Acceptance Criteria:
- One-click ESG report generation (PDF)
- Metrics: Total CO2 saved, plastic avoided, offsets purchased
- Year-over-year comparison
- Compliance with GRI, SASB, TCFD frameworks
- Export to Excel for custom analysis
```

**Story 4: Launch Green Product Line**
```
As a business owner,
I want to tag products as "sustainable" and track their performance,
So that I can expand eco-friendly offerings based on data.

Acceptance Criteria:
- Tag products with sustainability attributes (organic, fair trade, recyclable)
- Dashboard showing eco-product sales vs. total sales
- Customer feedback on sustainable products
- Inventory recommendations (which green products to stock more)
```

---

## Functional Requirements

### Must Have (Phase 5.1: Months 13-15)

#### FR1: Carbon Footprint Calculator

**Description**: Calculate CO2 emissions for every purchase using product category and lifecycle data

**Methodology**:
```typescript
interface CarbonCalculation {
  productId: UUID;
  category: ProductCategory; // COFFEE, FOOD, MERCHANDISE
  quantity: number;

  // Emission factors (kg CO2e per unit)
  production: number; // Growing, manufacturing
  transportation: number; // Shipping to store
  packaging: number; // Cups, bags, boxes
  disposal: number; // Waste, recycling

  totalEmissions: number; // Sum of above
}

// Example: Latte
const latte = {
  category: 'COFFEE',
  quantity: 1,
  production: 0.54, // Coffee beans, milk (dairy = high emissions)
  transportation: 0.08,
  packaging: 0.06, // Disposable cup
  disposal: 0.02,
  totalEmissions: 0.70 // kg CO2e
};

// With reusable cup (-86% packaging)
const latteReusable = {
  ...latte,
  packaging: 0.008, // Reusable cup (amortized)
  totalEmissions: 0.64 // kg CO2e (0.06 kg saved!)
};
```

**Carbon API Integration**:
```typescript
// Use Climatiq or Carbon Interface for emission factors
const carbonAPI = new ClimatiqAPI(process.env.CLIMATIQ_API_KEY);

const emissions = await carbonAPI.calculate({
  emission_factor: {
    activity_id: 'consumer_goods-type_coffee_beverages',
    region: 'US'
  },
  parameters: {
    weight: 0.35, // kg (12 oz latte)
    weight_unit: 'kg'
  }
});

// Response: { co2e: 0.70, co2e_unit: 'kg' }
```

**Purchase Carbon Display**:
```
┌─────────────────────────────────────────────────────────┐
│  Receipt - Order #12345                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Grande Latte                          $5.50            │
│  🌱 Carbon Impact: 0.64 kg CO2                          │
│  💚 You saved 0.06 kg CO2 (reusable cup!)               │
│                                                         │
│  Blueberry Muffin                      $3.50            │
│  🌱 Carbon Impact: 0.23 kg CO2                          │
│                                                         │
│  Total                                 $9.00            │
│  🌍 Total Carbon Impact: 0.87 kg CO2                    │
│                                                         │
│  That's like driving 2.2 miles! 🚗                      │
│                                                         │
│  [View My Impact Dashboard]                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**API Endpoints**:
```typescript
// Calculate carbon for product
POST /api/v1/sustainability/carbon/calculate
{
  "productId": "prod-123",
  "quantity": 1,
  "modifiers": {
    "reusableCup": true,
    "bikeDelivery": true
  }
}

Response:
{
  "totalEmissions": 0.64, // kg CO2e
  "breakdown": {
    "production": 0.54,
    "transportation": 0.08,
    "packaging": 0.008,
    "disposal": 0.02
  },
  "savings": {
    "reusableCup": 0.052,
    "bikeDelivery": 0.04
  },
  "equivalent": "Driving 1.6 miles"
}

// Get customer's total carbon footprint
GET /api/v1/sustainability/customers/me/carbon-footprint
  ?period=THIS_MONTH // THIS_WEEK, THIS_MONTH, THIS_YEAR, ALL_TIME

Response:
{
  "totalEmissions": 45.2, // kg CO2e
  "period": "THIS_MONTH",
  "breakdown": {
    "coffee": 28.3,
    "food": 12.8,
    "merchandise": 4.1
  },
  "comparison": {
    "vsLastMonth": -12.3, // % (reduced 12.3%)
    "vsAverage": -8.5 // % (below avg by 8.5%)
  },
  "equivalent": "Driving 114 miles"
}
```

---

#### FR2: Eco-Rewards (Bonus Points)

**Description**: Reward customers for sustainable choices

**Reward Triggers**:
```typescript
interface EcoReward {
  trigger: EcoAction;
  bonusPoints: number;
  description: string;
}

const ecoRewards: EcoReward[] = [
  {
    trigger: 'REUSABLE_CUP',
    bonusPoints: 25, // 2x base points
    description: 'Brought reusable cup'
  },
  {
    trigger: 'BIKE_DELIVERY',
    bonusPoints: 50,
    description: 'Chose bike delivery (zero emissions)'
  },
  {
    trigger: 'PLANT_BASED',
    bonusPoints: 30,
    description: 'Chose plant-based option (70% lower emissions than meat)'
  },
  {
    trigger: 'NO_BAG',
    bonusPoints: 10,
    description: 'Declined single-use bag'
  },
  {
    trigger: 'COMPOSTABLE_PACKAGING',
    bonusPoints: 15,
    description: 'Compostable packaging used'
  }
];
```

**Eco-Hero Tier**:
```typescript
interface EcoHeroTier {
  name: string;
  requirement: string;
  benefits: string[];
}

const ecoHeroTier = {
  name: 'Eco-Hero',
  requirement: '50+ sustainable purchases OR 100 kg CO2 saved',
  benefits: [
    '3x points on all eco-products',
    'Exclusive green rewards (carbon offsets, tree planting)',
    'Early access to sustainable product launches',
    'Eco-Hero badge on profile',
    'Quarterly impact report'
  ]
};
```

---

#### FR3: Impact Dashboard

**Description**: Visual dashboard showing customer's environmental impact

**Metrics Displayed**:
```typescript
interface ImpactMetrics {
  // Carbon
  carbonFootprint: number; // kg CO2e
  carbonSaved: number; // kg CO2e (vs. baseline)
  carbonOffsetPurchased: number; // kg CO2e

  // Equivalents (for visualization)
  treesEquivalent: number; // trees needed to offset
  milesEquivalent: number; // miles driven

  // Plastic
  plasticAvoided: number; // grams (reusable cups)
  plasticRecycled: number; // grams

  // Other
  waterSaved: number; // liters (plant-based choices)
  sustainablePurchases: number; // count
  ecoRewardsEarned: number; // bonus points
}
```

**Dashboard Wireframe**:
```
┌─────────────────────────────────────────────────────────────┐
│  🌍 Your Environmental Impact                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This Year (2025):                                          │
│                                                             │
│  Carbon Footprint: 234 kg CO2                               │
│  ████████████░░░░░░░░ 18% below average 🎉                  │
│                                                             │
│  That's equivalent to:                                      │
│  🚗 Driving 590 miles                                       │
│  🌳 12 trees needed to offset                               │
│                                                             │
│  Your Impact:                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  💚 89 kg CO2 saved                                 │    │
│  │     Reusable cups (67 times)                        │    │
│  │     Plant-based meals (23 times)                    │    │
│  │     Bike deliveries (8 times)                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  ♻️  1.2 kg plastic avoided                         │    │
│  │     That's 48 disposable cups! 🥤                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  🌊 340 liters water saved                          │    │
│  │     Choosing plant-based options                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  Carbon Trend:                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │     kg CO2                                          │    │
│  │  30 │                                               │    │
│  │  25 │     ●                                         │    │
│  │  20 │   ●   ●                                       │    │
│  │  15 │ ●       ●   ●                                 │    │
│  │  10 │                 ●   ●   ●                     │    │
│  │   0 └───────────────────────────                   │    │
│  │      Jan Feb Mar Apr May Jun Jul                   │    │
│  │      ● Your Footprint   ○ Avg Customer             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  🎯 Goal: Reduce footprint by 25% by year-end               │
│  Progress: ████████████░░░░ 72% (54 kg CO2 reduction)      │
│                                                             │
│  [Offset My Footprint] [Share Impact] [Set New Goal]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### FR4: Green Challenges

**Description**: Gamified sustainability challenges

**Challenge Types**:
```typescript
interface GreenChallenge {
  id: UUID;
  name: string;
  description: string;
  type: ChallengeType;
  goal: ChallengeGoal;
  duration: number; // days
  rewards: ChallengeReward[];
}

const challenges: GreenChallenge[] = [
  {
    id: 'challenge-1',
    name: 'Zero Waste Week',
    description: 'Avoid single-use items for 7 days',
    type: 'INDIVIDUAL',
    goal: {
      metric: 'PLASTIC_AVOIDED',
      target: 200, // grams
      targetDescription: '7 reusable cups'
    },
    duration: 7,
    rewards: [
      { type: 'POINTS', amount: 500 },
      { type: 'BADGE', name: 'Zero Waste Warrior' }
    ]
  },
  {
    id: 'challenge-2',
    name: 'Plant-Based Week',
    description: 'Choose plant-based options for 7 days',
    type: 'INDIVIDUAL',
    goal: {
      metric: 'PLANT_BASED_MEALS',
      target: 7,
      targetDescription: '7 plant-based meals'
    },
    duration: 7,
    rewards: [
      { type: 'POINTS', amount: 750 },
      { type: 'DISCOUNT', value: '20% off next purchase' }
    ]
  },
  {
    id: 'challenge-3',
    name: 'Eco-Team Challenge',
    description: 'Team of 5 saves 50 kg CO2',
    type: 'TEAM',
    goal: {
      metric: 'CO2_SAVED',
      target: 50, // kg
      targetDescription: '50 kg CO2 saved collectively'
    },
    duration: 30,
    rewards: [
      { type: 'POINTS', amount: 2000, distribution: 'SPLIT' },
      { type: 'CARBON_OFFSET', value: 100 } // 100 kg CO2 offset
    ]
  }
];
```

---

#### FR5: Offset Marketplace

**Description**: Redeem points for carbon offsets and environmental projects

**Offset Options**:
```typescript
interface CarbonOffset {
  id: UUID;
  name: string;
  provider: string; // Pachama, Nori, Verra
  type: OffsetType; // FORESTRY, DIRECT_AIR_CAPTURE, RENEWABLE_ENERGY
  region: string;
  verification: string; // Verra VCS, Gold Standard
  costPerKg: number; // points per kg CO2
  description: string;
  images: string[];
}

const offsets: CarbonOffset[] = [
  {
    id: 'offset-1',
    name: 'Amazon Rainforest Protection',
    provider: 'Pachama',
    type: 'FORESTRY',
    region: 'Brazil',
    verification: 'Verra VCS',
    costPerKg: 10, // 10 points per kg CO2
    description: 'Protect 1 hectare of rainforest for 1 year',
    images: ['https://cdn.nxloy.com/offsets/amazon-1.jpg']
  },
  {
    id: 'offset-2',
    name: 'Ocean Plastic Cleanup',
    provider: 'The Ocean Cleanup',
    type: 'OCEAN_CLEANUP',
    region: 'Pacific Ocean',
    verification: 'Third-party audited',
    costPerKg: 15, // 15 points per kg plastic
    description: 'Remove 1 kg of plastic from the ocean',
    images: ['https://cdn.nxloy.com/offsets/ocean-1.jpg']
  },
  {
    id: 'offset-3',
    name: 'Plant a Tree',
    provider: 'One Tree Planted',
    type: 'REFORESTATION',
    region: 'USA',
    verification: 'Verified planting',
    costPerKg: 100, // 100 points = 1 tree
    description: 'Plant 1 tree in a reforestation project',
    images: ['https://cdn.nxloy.com/offsets/tree-1.jpg']
  }
];
```

**Redemption Flow**:
```
┌─────────────────────────────────────────────────────────┐
│  🌍 Offset Marketplace                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your Carbon Footprint: 234 kg CO2 (this year)          │
│  Your Balance: 1,250 points                             │
│                                                         │
│  Recommended Offset:                                    │
│  🌳 Plant 12 trees to offset your footprint             │
│  Cost: 1,200 points                                     │
│  [Offset My Footprint]                                  │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Browse Offsets:                                        │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  🌳 Amazon Rainforest Protection                  │ │
│  │  10 points per kg CO2                              │ │
│  │  ✅ Verra VCS certified                            │ │
│  │  [Learn More] [Redeem]                             │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  🌊 Ocean Plastic Cleanup                         │ │
│  │  15 points per kg plastic                          │ │
│  │  ✅ Third-party audited                            │ │
│  │  [Learn More] [Redeem]                             │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [View My Offsets] [Share Impact]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Should Have (Phase 5.2: Months 16-17)

#### FR6: ESG Reporting Dashboard (Business)

**Description**: Business dashboard with ESG metrics for investors and regulators

**Report Sections**:
```typescript
interface ESGReport {
  businessId: UUID;
  period: ReportPeriod; // MONTHLY, QUARTERLY, YEARLY

  // Environmental
  environmental: {
    totalCO2Emissions: number; // kg
    totalCO2Saved: number; // kg (vs. baseline)
    carbonOffsetsPerchased: number; // kg
    plasticAvoided: number; // kg
    waterSaved: number; // liters
    sustainableProductSales: number; // % of total
  };

  // Social
  social: {
    customerParticipation: number; // % in green challenges
    communityImpact: string; // narrative
    employeeEngagement: number; // % aware of sustainability initiatives
  };

  // Governance
  governance: {
    policyCompliance: string[]; // EU CSRD, SEC rules
    thirdPartyAudits: Audit[];
    sustainabilityGoals: Goal[];
  };

  // Financial
  financial: {
    revenueFromEcoProducts: number; // USD
    costOfSustainabilityInitiatives: number; // USD
    roi: number; // %
  };
}
```

**Dashboard Wireframe**:
```
┌─────────────────────────────────────────────────────────────┐
│  📊 ESG Report - Coffee Rewards                             │
│  Q2 2025                                      [Export PDF]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌍 Environmental Impact:                                   │
│  • Total CO2 tracked: 234,000 kg                            │
│  • CO2 saved (vs. baseline): 45,000 kg (16% reduction)      │
│  • Carbon offsets purchased: 50,000 kg                      │
│  • Net carbon: -16,000 kg (carbon negative! 🎉)             │
│  • Plastic avoided: 1,200 kg                                │
│  • Water saved: 340,000 liters                              │
│  • Eco-product sales: 28% of total revenue                  │
│                                                             │
│  👥 Social Impact:                                          │
│  • Customers in green challenges: 34%                       │
│  • Community tree planting events: 3 (127 attendees)        │
│  • Employee sustainability training: 89% completion         │
│                                                             │
│  ⚖️ Governance:                                              │
│  • Policy compliance: ✅ EU CSRD, ✅ SEC Climate Rules       │
│  • Third-party audits: 2 (passed)                           │
│  • Sustainability goals: 4/5 on track                       │
│                                                             │
│  💰 Financial:                                              │
│  • Revenue from eco-products: $2.3M                         │
│  • Investment in sustainability: $450K                      │
│  • ROI: 5.1x                                                │
│                                                             │
│  [Export PDF] [Share with Investors] [Schedule Audit]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### FR7: Supply Chain Transparency (Blockchain)

**Description**: Blockchain-verified sustainable sourcing

**Use Case**: Coffee bean supply chain
```typescript
interface SupplyChainRecord {
  productId: UUID;
  productName: string;

  // Origin
  farm: {
    name: string;
    location: string;
    certifications: string[]; // Fair Trade, Organic, Rainforest Alliance
    farmerId: UUID;
  };

  // Journey
  journey: SupplyChainStep[];

  // Verification
  blockchainTxHash: string; // Immutable record
  verifiedAt: Date;
  verifiedBy: string; // Third-party auditor
}

const coffeeSupplyChain: SupplyChainRecord = {
  productId: 'prod-123',
  productName: 'Colombian Single-Origin Coffee',
  farm: {
    name: 'Finca La Esperanza',
    location: 'Huila, Colombia',
    certifications: ['Fair Trade', 'Organic', 'Rainforest Alliance'],
    farmerId: 'farmer-456'
  },
  journey: [
    { step: 'Harvested', date: '2025-03-15', location: 'Huila, Colombia' },
    { step: 'Processed', date: '2025-03-18', location: 'Huila, Colombia' },
    { step: 'Shipped', date: '2025-04-01', location: 'Buenaventura Port' },
    { step: 'Roasted', date: '2025-05-10', location: 'San Francisco, USA' },
    { step: 'Delivered', date: '2025-05-15', location: 'Coffee Rewards Store' }
  ],
  blockchainTxHash: '0x8f3e2a1b...',
  verifiedAt: new Date('2025-05-15'),
  verifiedBy: 'CertiK Audit'
};
```

**Customer View**:
```
┌─────────────────────────────────────────────────────────┐
│  ☕ Colombian Single-Origin Coffee                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🌍 Sustainable Sourcing:                               │
│  ✅ Fair Trade Certified                                │
│  ✅ Organic Certified                                   │
│  ✅ Rainforest Alliance Certified                       │
│                                                         │
│  🚜 Farm: Finca La Esperanza                            │
│  📍 Huila, Colombia                                     │
│  👤 Farmer: Juan Rodriguez                              │
│                                                         │
│  🛤️  Supply Chain Journey:                              │
│  Mar 15: Harvested 🌱                                   │
│  Mar 18: Processed ⚙️                                   │
│  Apr  1: Shipped 🚢                                     │
│  May 10: Roasted 🔥                                     │
│  May 15: Delivered ✅                                   │
│                                                         │
│  🔒 Blockchain Verified: 0x8f3e...                      │
│  [View Certificate] [Meet the Farmer]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Could Have (Phase 5.3: Month 18+)

#### FR8: Community Carbon Pool
- Customers pool offsets together (bulk discount)
- Monthly community offset purchases

#### FR9: Sustainability Scoring
- Product "eco-score" (A-F rating)
- Compare products side-by-side

#### FR10: Green Subscriptions
- Monthly subscription for carbon-neutral deliveries
- "Planet Pass" - unlimited eco-rewards

---

## Non-Functional Requirements

### Performance
- **NFR1**: Carbon calculation: <500ms per transaction
- **NFR2**: Dashboard load time: <2s
- **NFR3**: ESG report generation: <10s

### Accuracy
- **NFR4**: Carbon data accuracy: ±10% (industry standard)
- **NFR5**: Emission factors updated quarterly
- **NFR6**: Third-party audit annually

### Compliance
- **NFR7**: EU CSRD compliance (Corporate Sustainability Reporting Directive)
- **NFR8**: SEC climate disclosure rules (proposed 2024)
- **NFR9**: GRI Standards (Global Reporting Initiative)
- **NFR10**: SASB Standards (Sustainability Accounting Standards Board)

---

## Domain Events

```typescript
// Carbon tracking events
sustainability.carbon.calculated: {
  customerId, transactionId, totalEmissions, breakdown, timestamp
}

sustainability.carbon.saved: {
  customerId, action, amountSaved, timestamp
}

// Eco-rewards events
sustainability.eco_reward.earned: {
  customerId, trigger, bonusPoints, timestamp
}

sustainability.tier.upgraded: {
  customerId, newTier: 'ECO_HERO', timestamp
}

// Offset events
sustainability.offset.purchased: {
  customerId, offsetId, provider, amount, cost, timestamp
}

// Challenge events
sustainability.challenge.completed: {
  customerId, challengeId, metric, achievement, timestamp
}

// ESG reporting events
sustainability.esg_report.generated: {
  businessId, period, metrics, timestamp
}
```

---

## Rollout Plan

### Phase 5.1: Core Features (Months 13-15)
- Month 13: Carbon calculator, eco-rewards
- Month 14: Impact dashboard, green challenges
- Month 15: Offset marketplace

### Phase 5.2: Business Features (Months 16-17)
- Month 16: ESG reporting dashboard
- Month 17: Supply chain transparency

### Phase 5.3: Advanced Features (Month 18+)
- Community carbon pools
- Sustainability scoring
- Green subscriptions

---

## Success Metrics

**After 6 Months**:
- 10M+ kg CO2 tracked
- 25%+ eco-purchases
- 50,000+ carbon offsets redeemed
- 50%+ businesses using ESG reports
- $2M+/month revenue from eco-products

---

## Risks & Mitigation

1. **Data Accuracy**: Partner with verified carbon API providers (Climatiq, Watershed)
2. **Greenwashing Accusations**: Third-party audits, transparent methodology
3. **Cost**: Offset costs subsidized by business, not passed to customers
4. **Complexity**: Simple UI/UX, clear explanations of carbon metrics
5. **Regulatory Changes**: Monitor EU CSRD, SEC rules, adapt quickly

---

## References

- [Climatiq API Documentation](https://docs.climatiq.io)
- [GRI Standards](https://www.globalreporting.org/standards/)
- [EU CSRD Directive](https://finance.ec.europa.eu/csrd)
- [Pachama Carbon Offsets](https://pachama.com)

---

**Document Owner**: Backend Team (Sustainability Squad)
**Last Updated**: 2025-11-07
**Status**: Ready for Review
