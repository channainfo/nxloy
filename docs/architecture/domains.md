# Domain Structure

**Related**: [Overview](./overview.md) | [Principles](./principles.md) | [Data Architecture](./data-architecture.md)

---

NxLoy is organized into 8 bounded contexts following Domain-Driven Design principles.

## 1. Authentication Domain

**Responsibility**: User identity, sessions, authorization

**Core Entities**:
- User
- Account (OAuth provider links)
- Session
- Role, Permission
- MFADevice
- AuditLog

**Key Features**:
- Multi-provider OAuth (Apple, Google, Facebook, Telegram)
- PIN-based verification (email, SMS)
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Session management
- Audit logging

**Database Schema**: `packages/database/prisma/schema/auth.prisma`

**API Endpoints**: `/api/auth/*`

## 2. Loyalty Domain

**Responsibility**: Loyalty programs, rules, tiers, points

**Core Entities**:
- LoyaltyProgram
- LoyaltyRule (6 rule types)
- Tier
- LoyaltyAccount (customer's membership)
- PointTransaction
- ProgramEvent

**Rule Types**:
1. Points-Based (1 point per $1 spent)
2. Punch Card (10 visits = free item)
3. Amount Spent Tiers (spend $500 → Gold tier)
4. Tier-Based Benefits (Gold members get 2x points)
5. Visit Frequency (visit 5 times/month → bonus)
6. Stamp Card (buy 8 coffees → 9th free)

**Database Schema**: `packages/database/prisma/schema/loyalty.prisma`

**API Endpoints**: `/api/loyalty/*`

## 3. Rewards Domain

**Responsibility**: Reward catalog, inventory, redemptions

**Core Entities**:
- Reward (catalog items)
- RewardInventory
- Redemption
- RedemptionEvent

**Reward Types**:
- Discount (10% off, $5 off)
- Free Item
- Experience (free massage, cooking class)
- Tier Upgrade
- Points Multiplier
- NFT/Digital Collectible

**Database Schema**: `packages/database/prisma/schema/rewards.prisma`

**API Endpoints**: `/api/rewards/*`

## 4. Customer Management Domain

**Responsibility**: Customer profiles, segments, transactions

**Core Entities**:
- Customer
- CustomerProfile (extended data)
- CustomerPreference
- CustomerTransaction
- CustomerVisit
- CustomerSegment

**Key Features**:
- Customer import/export
- RFM analysis (Recency, Frequency, Monetary)
- Segmentation (dynamic rules-based)
- Visit tracking
- Transaction history

**Database Schema**: `packages/database/prisma/schema/customers.prisma`

**API Endpoints**: `/api/customers/*`

## 5. Partner Network Domain

**Responsibility**: Partner management, integrations, revenue sharing

**Core Entities**:
- Partner
- PartnerProgram
- PartnerIntegration
- RevenueShare

**Key Features**:
- Partner onboarding
- Cross-brand loyalty (coalition programs)
- Revenue sharing calculations
- Partner API access

**Database Schema**: `packages/database/prisma/schema/partners.prisma`

**API Endpoints**: `/api/partners/*`

## 6. Subscription Domain

**Responsibility**: Plans, billing, invoicing

**Core Entities**:
- SubscriptionPlan
- Subscription
- Invoice
- Payment

**Key Features**:
- Tiered pricing (Starter, Pro, Enterprise)
- Usage-based billing
- Payment processing integration
- Invoice generation

**Database Schema**: `packages/database/prisma/schema/subscriptions.prisma`

**API Endpoints**: `/api/subscriptions/*`

## 7. Referral Domain

**Responsibility**: Referral codes, tracking, rewards

**Core Entities**:
- ReferralCode
- ReferralEvent
- ReferralReward

**Key Features**:
- Unique referral code generation
- Referral tracking (who referred whom)
- Dual rewards (referrer + referee)

**Database Schema**: `packages/database/prisma/schema/referrals.prisma`

**API Endpoints**: `/api/referrals/*`

## 8. Blockchain/NFT Domain

**Responsibility**: Tokens, wallets, smart contracts

**Core Entities**:
- Wallet
- NFT
- Token
- BlockchainTransaction

**Key Features**:
- NFT rewards (digital collectibles)
- Token-based loyalty points
- Smart contract interactions
- Wallet integration

**Database Schema**: `packages/database/prisma/schema/blockchain.prisma`

**API Endpoints**: `/api/blockchain/*`

**Smart Contracts**: `packages/blockchain-contracts/`

---

**Last Updated**: 2025-11-08
**Source**: ARCHITECTURE.md (Lines 189-364)
