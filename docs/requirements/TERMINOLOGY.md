# NxLoy Terminology Reference

**Version**: 1.0.0
**Date**: 2025-11-06
**Purpose**: Standardized terminology for the NxLoy loyalty platform
**Author**: Ploy Lab

## Table of Contents

1. [Core Platform Terms](#core-platform-terms)
2. [Loyalty System Terms](#loyalty-system-terms)
3. [Reward System Terms](#reward-system-terms)
4. [Customer Management Terms](#customer-management-terms)
5. [Business Management Terms](#business-management-terms)
6. [Partner Network Terms](#partner-network-terms)
7. [Subscription Terms](#subscription-terms)
8. [Referral Terms](#referral-terms)
9. [Blockchain/NFT Terms](#blockchainnft-terms)
10. [Technical Terms](#technical-terms)
11. [Analytics Terms](#analytics-terms)
12. [Industry Variations](#industry-variations)

---

## Core Platform Terms

### Platform Description

- **Primary**: "NxLoy - Multi-tenant loyalty platform"
- **Marketing**: "Flexible loyalty programs for every industry"
- **Technical**: "Nx monorepo-based loyalty rule engine with multi-tenancy"
- **Positioning**: "Industry templates + flexible rules + AI recommendations"

### System Components

- **Loyalty Engine**: Core rule processing for points, tiers, rewards
- **Reward Catalog**: Inventory and management of redeemable rewards
- **Customer Profile System**: Unified customer data and segmentation
- **Partner Network**: Cross-business reward earning and redemption
- **AI/MCP System**: Intelligent recommendations and automation
- **Blockchain Module**: NFT rewards and token-based incentives (Phase 4)
- **Rule Engine**: Processing system for all loyalty logic
- **Multi-Tenancy Framework**: Complete business isolation and data security

---

## Loyalty System Terms

### Core Concepts

- **Loyalty Program**: A configured set of rules for earning and redeeming rewards
- **Loyalty Rule**: Specific logic determining how customers earn rewards
- **Loyalty Template**: Pre-configured program for specific industry
- **Rule Type**: Category of loyalty mechanism (6 types supported)
- **Program Status**: DRAFT, ACTIVE, PAUSED, ENDED

### Loyalty Rule Types

**1. POINTS_BASED**
- **Definition**: Earn points per dollar spent
- **Terms**: Points, point balance, point-to-dollar ratio, points multiplier
- **Customer Facing**: "Earn 10 points for every $1 spent"
- **Common In**: Retail, ecommerce, most industries

**2. PUNCH_CARD**
- **Definition**: Digital stamp/punch cards (buy X, get Y free)
- **Terms**: Punch, stamp, progress, completion, required punches
- **Customer Facing**: "Buy 10 coffees, get 1 free"
- **Common In**: Coffee shops, car washes, quick service
- **Variations**: "punch" (coffee), "stamp" (salons), "visit" (restaurants)

**3. AMOUNT_SPENT**
- **Definition**: Spend-based milestones for rewards
- **Terms**: Milestone, threshold, cumulative spending, reward tier
- **Customer Facing**: "Spend $100, get $10 off your next purchase"
- **Common In**: Retail, salons, professional services

**4. TIER_BASED**
- **Definition**: Bronze/Silver/Gold/Platinum membership tiers
- **Terms**: Tier, tier status, tier upgrade, tier benefits, tier threshold
- **Customer Facing**: "Reach Gold status for 20% off all purchases"
- **Common In**: Airlines, hotels, subscription services

**5. VISIT_FREQUENCY**
- **Definition**: Reward based on visit count in time period
- **Terms**: Visit, check-in, visit count, time window, consecutive visits
- **Customer Facing**: "Visit 5 times this month for a bonus reward"
- **Common In**: Fitness centers, restaurants, entertainment

**6. STAMP_CARD**
- **Definition**: Item-specific collection tracking
- **Terms**: Stamp, collection, item tracking, mix-and-match
- **Customer Facing**: "Try all 5 menu categories to complete your collection"
- **Common In**: Restaurants, entertainment, education

### Loyalty Actions

- **Earn**: Action of receiving credit toward a reward
- **Progress**: Current advancement toward completion
- **Completion**: Fulfillment of all requirements
- **Redemption**: Using earned rewards for benefits
- **Expiration**: Time limit on earned rewards or points

### Industry-Customizable Terms

```typescript
// Example: Coffee shop terminology
interface IndustryTerms {
  cardName: "Coffee Punch Card";       // vs "Loyalty Program"
  earnAction: "Get a punch";           // vs "Earn points"
  progressLabel: "8 punches earned";   // vs "8 points earned"
  rewardLabel: "Free coffee";          // vs "Reward unlocked"
  notification: "One more punch for your free coffee!";
}
```

---

## Reward System Terms

### Core Concepts

- **Reward Catalog**: Collection of available rewards
- **Reward Item**: Specific benefit customers can redeem
- **Redemption**: Act of using points/progress for reward
- **Point Cost**: Points required to redeem a reward
- **Inventory**: Available stock of redeemable rewards
- **Reward Category**: Grouping of similar rewards

### Reward Types

- **Discount Reward**: Percentage or dollar-amount discount
- **Free Item**: Complimentary product or service
- **Cashback**: Money credited back to customer
- **Partner Reward**: Redeemable at partner business
- **NFT Reward**: Digital collectible or token (Phase 4)
- **Tier Benefit**: Exclusive perk for tier members

### Redemption Terms

- **Redemption Limit**: Maximum redemptions per customer/period
- **Partial Redemption**: Use points + cash for higher-value items
- **Redemption History**: Record of all redeemed rewards
- **Redemption Code**: Unique code for reward validation
- **Expiration**: Time limit for using redeemed reward

---

## Customer Management Terms

### Customer Lifecycle

- **Customer**: End user enrolled in loyalty program
- **Registration**: Initial sign-up process
- **Profile**: Customer's personal information and preferences
- **Status**: ACTIVE, INACTIVE, SUSPENDED
- **Segment**: Group of customers with shared characteristics
- **Customer ID**: Unique identifier for customer

### Customer Data

- **Contact Information**: Email, phone, address
- **Demographics**: Age, gender, location
- **Preferences**: Communication preferences, interests
- **Transaction History**: All purchases and interactions
- **Point Balance**: Current available points
- **Tier Status**: Current membership tier
- **Lifetime Value (LTV)**: Total customer worth

### Customer Engagement

- **Active Customer**: Engaged within last 30-90 days
- **Inactive Customer**: No activity for 90+ days
- **At-Risk Customer**: Showing churn signals (AI-identified)
- **VIP Customer**: High-value tier or spending threshold
- **Retention**: Keeping customers engaged over time
- **Churn**: Customer stops engaging with business

---

## Business Management Terms

### Business Entities

- **Business**: Tenant on the platform (single or multi-location)
- **Tenant**: Isolated business account with own data
- **Business Owner**: Primary admin for business account
- **Staff**: Employee with limited access permissions
- **Location**: Physical or virtual business site
- **Multi-Location**: Business with multiple sites

### Business Operations

- **Dashboard**: Central management interface
- **Rule Configuration**: Setting up loyalty program parameters
- **Analytics**: Performance metrics and insights
- **Campaign**: Marketing initiative with loyalty component
- **Integration**: Connection to external systems (POS, CRM, etc.)

### Business Status

- **Trial**: Free trial period (30 days)
- **Active**: Paying subscriber
- **Suspended**: Account temporarily disabled
- **Canceled**: Subscription ended

---

## Partner Network Terms

### Partner Relationships

- **Partner**: Another business in the network
- **Partner Program**: Shared loyalty arrangement
- **Partner Directory**: List of available partners
- **Partner Link**: Connection between two businesses
- **Cross-Business Reward**: Earn at one business, redeem at another

### Partner Operations

- **Partner Invitation**: Request to join network
- **Revenue Share**: Commission on cross-business transactions
- **Partner Analytics**: Performance of partner relationships
- **Partner Transaction**: Purchase at partner location
- **Partner Integration**: Technical connection between systems

---

## Subscription Terms

### Subscription Tiers

- **Starter**: $49/month, up to 500 customers
- **Growth**: $149/month, up to 2,500 customers
- **Pro**: $299/month, up to 10,000 customers
- **Enterprise**: Custom pricing, unlimited customers

### Billing Terms

- **Monthly Recurring Revenue (MRR)**: Monthly subscription income
- **Annual Recurring Revenue (ARR)**: Yearly subscription income
- **Usage-Based Pricing**: Charges based on consumption (SMS, emails)
- **Invoice**: Billing statement
- **Payment Method**: Credit card, ACH, etc.
- **Billing Cycle**: Subscription renewal period

### Subscription Actions

- **Upgrade**: Move to higher-tier plan
- **Downgrade**: Move to lower-tier plan
- **Cancel**: End subscription
- **Reactivate**: Resume canceled subscription
- **Trial**: Free evaluation period

---

## Referral Terms

### Referral Mechanics

- **Referrer**: Customer who refers others
- **Referred Customer**: New customer from referral
- **Referral Code**: Unique code for tracking referrals
- **Referral Link**: Shareable URL with embedded code
- **Referral Reward**: Benefit for successful referral
- **Dual-Sided Reward**: Both referrer and referred earn rewards

### Referral Tracking

- **Referral Completion**: When referred customer meets criteria
- **Completion Criteria**: Requirements for reward (signup, first purchase, spend $X)
- **Referral Leaderboard**: Top referrers ranking
- **Referral Analytics**: Performance of referral program
- **Fraud Detection**: Prevention of self-referrals and gaming

---

## Blockchain/NFT Terms

### Web3 Concepts (Phase 4)

- **NFT (Non-Fungible Token)**: Unique digital asset representing reward
- **Wallet**: Digital storage for NFTs and tokens
- **Smart Contract**: Self-executing blockchain agreement
- **Token**: Digital currency or point representation
- **Minting**: Creating new NFT
- **Blockchain**: Distributed ledger technology

### NFT Rewards

- **NFT Reward**: Digital collectible earned through loyalty
- **NFT Metadata**: Information about NFT (image, attributes)
- **NFT Transfer**: Moving NFT between wallets
- **NFT Marketplace**: Platform for trading NFTs
- **On-Chain**: Recorded on blockchain
- **Off-Chain**: Stored outside blockchain

### Wallet Types

- **Custodial Wallet**: Platform manages private keys
- **Non-Custodial Wallet**: User controls private keys
- **MetaMask**: Popular browser extension wallet
- **WalletConnect**: Mobile wallet connection protocol

### Blockchain Networks

- **Ethereum**: Primary blockchain network
- **Polygon**: Low-cost Layer 2 network
- **Base**: Coinbase Layer 2 network
- **Multi-Chain**: Support for multiple networks
- **Gas Fee**: Transaction cost on blockchain

---

## Technical Terms

### Architecture

- **Monorepo**: Single repository for all applications
- **Nx**: Monorepo build system
- **Multi-Tenant**: Single platform serving multiple businesses
- **API-First**: Built for integration and extensibility
- **Event-Driven**: Real-time processing architecture
- **Microservices**: Modular architecture (future, not current)
- **Modular Monolith**: Current architecture pattern

### Integration

- **REST API**: Request/response web service
- **GraphQL**: Query language for APIs (Phase 3)
- **Webhook**: Real-time event notifications
- **SDK**: Software Development Kit for partners
- **White-Label**: Customizable branding
- **API Rate Limiting**: Request throttling
- **OAuth 2.0**: Authorization framework
- **JWT**: JSON Web Token for authentication

### Domain-Driven Design

- **Bounded Context**: Domain boundary with own model
- **Domain Event**: Something that happened in the domain
- **Aggregate**: Cluster of domain objects treated as unit
- **Repository**: Data access abstraction
- **Value Object**: Immutable object defined by attributes
- **Entity**: Object with unique identity

### Development

- **Contract-First**: Design API contracts before coding
- **OpenAPI**: REST API specification format
- **AsyncAPI**: Event/message specification format
- **Prism**: Mock server for OpenAPI contracts
- **Pact**: Consumer-driven contract testing
- **Nx Tags**: Dependency boundary enforcement

---

## Analytics Terms

### Metrics

- **Customer Lifetime Value (CLV)**: Total customer worth
- **Customer Acquisition Cost (CAC)**: Cost to acquire customer
- **Churn Rate**: Percentage of customers leaving
- **Retention Rate**: Percentage of customers staying
- **Engagement Rate**: Percentage of active customers
- **Redemption Rate**: Percentage redeeming rewards

### Analysis Types

- **Cohort Analysis**: Grouping customers by shared characteristics
- **RFM Analysis**: Recency, Frequency, Monetary segmentation
- **Behavioral Segmentation**: Groups based on actions
- **Predictive Analytics**: AI-forecasted outcomes
- **A/B Testing**: Comparing two variants
- **Conversion Rate**: Percentage completing desired action

### Reporting

- **Dashboard**: Visual metrics display
- **Report**: Structured data presentation
- **Export**: Download data (CSV, PDF)
- **Scheduled Report**: Automated periodic delivery
- **Real-Time Metrics**: Live updating data
- **Historical Analysis**: Past performance review

---

## Industry Variations

### Coffee Shops

```typescript
const coffeeTerms = {
  program: "Coffee Punch Card",
  action: "Get a punch",
  progress: "8 punches earned",
  reward: "Free coffee of any size",
  notification: "One more punch for your free coffee!",
  tierName: "Coffee Connoisseur" // instead of "Gold Member"
};
```

### Beauty Salons

```typescript
const salonTerms = {
  program: "Beauty Stamp Card",
  action: "Earn a stamp",
  progress: "5 stamps collected",
  reward: "Free treatment or 20% off",
  notification: "You've earned another stamp!",
  tierName: "VIP Beauty Member"
};
```

### Restaurants

```typescript
const restaurantTerms = {
  program: "Dining Rewards",
  action: "Log a visit",
  progress: "7 visits recorded",
  reward: "Free appetizer or dessert",
  notification: "Thanks for dining with us!",
  tierName: "Frequent Diner"
};
```

### Fitness Centers

```typescript
const fitnessTerms = {
  program: "Workout Tracker",
  action: "Check in",
  progress: "15 workouts completed",
  reward: "Free personal training session",
  notification: "Great workout! 5 more for your reward!",
  tierName: "Fitness Elite"
};
```

### E-commerce

```typescript
const ecommerceTerms = {
  program: "Rewards Program",
  action: "Earn points",
  progress: "1,250 points earned",
  reward: "$10 off your next order",
  notification: "You've earned 100 points!",
  tierName: "Gold Shopper"
};
```

### Hotels

```typescript
const hotelTerms = {
  program: "Guest Rewards",
  action: "Stay night",
  progress: "12 nights stayed",
  reward: "Free night or room upgrade",
  notification: "Thank you for your stay!",
  tierName: "Elite Guest"
};
```

---

## Implementation Guidelines

### For Documentation

- Use **"loyalty program"** as primary term
- Use **"digital loyalty card"** when emphasizing digital nature
- Use **"reward catalog"** for collection of redeemable items
- Use **"customer"** (not "user") in loyalty context
- Use **"business"** (not "merchant" or "client") for platform customers

### For Code

```typescript
// Generic terms in core logic
interface LoyaltyProgram {
  type: LoyaltyRuleType;
  earnAction: string;        // Customizable per industry
  progress: number;
  required: number;
  reward: RewardDefinition;
}

// Industry customization
const industryConfig = {
  COFFEE: {
    cardName: "Punch Card",
    earnAction: "punch",
    earnVerb: "Get a punch"
  },
  FITNESS: {
    cardName: "Workout Tracker",
    earnAction: "check-in",
    earnVerb: "Check in"
  }
};
```

### For Marketing

- **Lead with familiar concepts**: "Like Starbucks Rewards, but for your business"
- **Emphasize flexibility**: "6 loyalty rule types that work for any industry"
- **Highlight templates**: "21 pre-configured industry templates"
- **Mention AI**: "AI-powered recommendations increase redemption rates"
- **Be specific**: "Increase repeat visits by 15-25%" (not vague claims)
- **Avoid jargon**: Customer-facing materials should be simple

### For User Interface

- **Consistency**: Use same terms throughout app
- **Context**: Adjust language based on industry
- **Clarity**: Prefer simple words over technical terms
- **Action-Oriented**: Use verbs for buttons ("Redeem Reward" not "Redemption")
- **Progressive Disclosure**: Show simple terms first, advanced terms in settings

### Regional Considerations

- **US Market**: "Punch card" more common
- **UK/Europe**: "Stamp card" more familiar
- **Asia**: "Point card" often preferred
- **Global**: Allow regional customization while maintaining core terminology
- **Localization**: Support multiple languages (Phase 2+)

---

## Ubiquitous Language

### What is Ubiquitous Language?

In Domain-Driven Design, **Ubiquitous Language** is the common vocabulary shared by developers, domain experts, and business stakeholders. Using consistent terminology reduces miscommunication.

### NxLoy Ubiquitous Language Rules

1. **One Term per Concept**: Don't use "customer", "user", "member" interchangeably
2. **Same Terms in Code and Docs**: Variable names should match documentation
3. **Domain-Specific**: Each bounded context has its own vocabulary
4. **Avoid Technical Jargon**: Business terms in domain layer, tech terms in infrastructure layer

### Example: Good vs Bad

```typescript
// ❌ BAD: Inconsistent terminology
class UserService {
  createMember(data: CustomerDto) {
    // Mixing "user", "member", "customer"
  }
}

// ✅ GOOD: Consistent ubiquitous language
class CustomerService {
  registerCustomer(data: RegisterCustomerDto) {
    // Clear, consistent terminology
  }
}
```

---

## Glossary Quick Reference

| Term | Definition | Used By |
|------|------------|---------|
| Loyalty Program | Configured set of earning/redemption rules | All teams |
| Rule Type | Category of loyalty mechanism (points, punch card, etc.) | Backend, Web, Mobile |
| Template | Pre-configured program for specific industry | Product, Backend |
| Reward Catalog | Collection of redeemable rewards | Backend, Web, Mobile |
| Redemption | Using earned rewards for benefits | All teams |
| Tier | Membership level (Bronze, Silver, Gold, Platinum) | Backend, Web, Mobile |
| Partner Network | Cross-business reward system | Backend, Web, Infrastructure |
| Multi-Tenancy | Multiple isolated businesses on single platform | Backend, Infrastructure |
| Bounded Context | Domain boundary with own model | Backend (DDD) |
| Domain Event | Something that happened in the domain | Backend, AI/MCP |
| NFT Reward | Blockchain-based digital collectible | Blockchain, Backend |
| Customer Segment | Group of customers with shared characteristics | Backend, Web, AI/MCP |
| Churn Prediction | AI forecast of at-risk customers | AI/MCP, Analytics |

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-06 | 1.0.0 | Initial NxLoy terminology (extracted from Ploy) | Ploy Lab |

---

**Document Owner**: Product Team + Engineering Team
**Review Cycle**: Quarterly
**Last Review**: 2025-11-06
**Next Review**: 2026-02-06

**Note**: This terminology reference should be consulted when:
- Writing user-facing text
- Naming code variables and functions
- Creating API endpoints and DTOs
- Designing database schemas
- Writing documentation
