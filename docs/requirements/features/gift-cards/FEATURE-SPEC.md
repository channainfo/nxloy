# Gift Cards Feature Specification

**Document Version**: 1.0.0
**Last Updated**: 2025-11-09
**Status**: Draft
**Owner**: Product Team
**Compliance Review**: Required before Phase 2 implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Strategic Positioning](#strategic-positioning)
3. [User Stories](#user-stories)
4. [Functional Requirements](#functional-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [Technical Architecture](#technical-architecture)
7. [API Contracts](#api-contracts)
8. [Database Schema](#database-schema)
9. [Business Rules](#business-rules)
10. [UX Mockups](#ux-mockups)
11. [Integration Points](#integration-points)
12. [Compliance & Accounting](#compliance--accounting)
13. [Testing Strategy](#testing-strategy)
14. [Success Metrics](#success-metrics)

---

## Overview

### What Are Gift Cards?

**Gift cards** in the NxLoy platform are digital rewards that can be issued, redeemed, and tracked as part of the loyalty program ecosystem.

### Phase 1 Implementation: Digital Rewards Only

**🎯 CRITICAL STRATEGIC DECISION**: Phase 1 implements **DIGITAL_GIFT reward type only** (loyalty program benefits), **NOT purchased gift cards**.

**Why?**
- ✅ **ASEAN Compliance Advantage**: Loyalty rewards exempt from gift card regulations
- ✅ **Philippines Safety**: Avoid Gift Check Act restrictions (no expiration allowed on purchased cards)
- ✅ **Singapore Simplicity**: No Payment Services Act licensing required
- ✅ **Cambodia Focus**: Minimal regulation for loyalty programs
- ✅ **Operational Flexibility**: Can set expiration, fees, redemption rules

**Phase 1 Scope** (This Document):
- Digital rewards as loyalty program benefits
- Earned through promotions, campaigns, partner offers
- Redeemable at merchant locations
- Tracked in unified wallet

**Phase 2+ Consideration** (Future):
- Purchased gift cards (if strong business case emerges)
- Requires legal clearance in each jurisdiction
- **AVOID Philippines entirely** for purchased gift cards

### Reward Type Mapping

```typescript
enum RewardType {
  POINTS = 'POINTS',              // Loyalty points
  CASHBACK = 'CASHBACK',          // Store credit (see store-credit/FEATURE-SPEC.md)
  DIGITAL_GIFT = 'DIGITAL_GIFT',  // ← THIS FEATURE (digital rewards/promotional credits)
  PHYSICAL = 'PHYSICAL',          // Physical products
  EXPERIENCE = 'EXPERIENCE',      // Events, services
  PARTNER = 'PARTNER'             // Partner merchant rewards
}
```

**Gift Card Implementation**: Uses existing `DIGITAL_GIFT` reward type from reward catalog.

---

## Strategic Positioning

### Business Context

**NxLoy is Cambodia-based with expansion to Singapore and ASEAN markets.**

Gift cards serve multiple business objectives:
1. **Customer Acquisition**: Welcome bonuses as digital rewards
2. **Campaign Promotions**: Seasonal offers, referral bonuses
3. **Partner Integration**: Co-branded digital rewards from partner merchants
4. **Engagement**: Gamification rewards (milestones, challenges)

### Loyalty Program Structure (Phase 1)

**DIGITAL_GIFT rewards are loyalty program benefits** - NOT purchased products.

**Why This Matters** (ASEAN Compliance):
- ✅ **Philippines exemption**: Loyalty rewards exempt from Gift Check Act (no expiration prohibition)
- ✅ **Singapore licensing**: No Payment Services Act requirements
- ✅ **Cambodia simplicity**: No specific gift card regulation
- ✅ **Operational flexibility**: Business sets expiration, terms, redemption rules
- ✅ **Better economics**: Breakage revenue recognized without escheatment complications

### Purchased Gift Cards (Phase 2+)

**If implementing purchased gift cards in future**:

**Decision Framework**:
1. **Strong business case required** (customer demand, revenue model)
2. **Legal clearance per jurisdiction** (Cambodia, Singapore, Vietnam, Thailand, etc.)
3. **Permanent exclusion: Philippines** (Gift Check Act prohibits expiration = indefinite liability)
4. **Singapore**: Obtain MAS guidance on limited-purpose exemption
5. **Compliance burden**: Multi-country regulatory monitoring

**See**: `/docs/requirements/features/gift-cards/COMPLIANCE.md` for detailed analysis.

---

## User Stories

### Epic 1: Digital Reward Issuance

**GC-US-001: Issue Welcome Bonus as Digital Reward**
- **As a**: Business owner
- **I want to**: Automatically issue $10 digital reward to new customers
- **So that**: I can increase customer acquisition and first purchase rates
- **Acceptance Criteria**:
  - Digital reward issued upon account creation or first purchase
  - Amount configurable per campaign (e.g., $5, $10, $20)
  - Expiration: 12 months from issuance
  - Grace period: 30 days after expiration
  - Customer receives notification (email, SMS, in-app)
  - Balance appears in unified wallet

**GC-US-002: Issue Referral Rewards**
- **As a**: Customer
- **I want to**: Receive digital reward when I refer a friend
- **So that**: I'm incentivized to promote the loyalty program
- **Acceptance Criteria**:
  - Referrer receives $15 digital reward when referee makes first purchase
  - Referee receives $10 digital reward upon signup
  - Rewards issued automatically upon trigger conditions
  - Track referral source attribution
  - Prevent self-referral fraud

**GC-US-003: Issue Campaign Rewards**
- **As a**: Marketing manager
- **I want to**: Issue digital rewards for seasonal campaigns (e.g., holiday promo)
- **So that**: I can drive traffic during specific periods
- **Acceptance Criteria**:
  - Create campaign with reward amount, expiration, eligibility criteria
  - Issue rewards to segment (all customers, VIP tier, inactive customers)
  - Set campaign start/end dates
  - Track campaign ROI (rewards issued vs. redemption revenue)

**GC-US-004: Issue Partner Merchant Rewards**
- **As a**: Partner merchant
- **I want to**: Issue co-branded digital rewards to customers
- **So that**: I can drive traffic to my business through loyalty program
- **Acceptance Criteria**:
  - Partner can issue rewards redeemable at their locations only
  - Partner branding displayed on digital reward
  - Redemption restricted to partner's merchant locations
  - Partner pays NxLoy for reward liability

### Epic 2: Digital Reward Redemption

**GC-US-005: Redeem Digital Reward at Checkout**
- **As a**: Customer
- **I want to**: Apply my digital reward balance at checkout
- **So that**: I can get discounts on purchases
- **Acceptance Criteria**:
  - Customer selects digital reward as payment method
  - System calculates discount (gift card balance applied to cart total)
  - VAT/GST calculated separately (customer pays tax)
  - Multi-tender supported (digital reward + cash/card)
  - Balance deducted upon successful transaction
  - Receipt shows breakdown (product total, digital reward applied, VAT, amount due)

**GC-US-006: View Digital Reward Balance**
- **As a**: Customer
- **I want to**: See my current digital reward balance in unified wallet
- **So that**: I know how much I can redeem
- **Acceptance Criteria**:
  - Display total digital reward balance (sum of all active rewards)
  - Show individual digital rewards with expiration dates
  - Sort by soonest to expire (FIFO redemption)
  - Highlight rewards expiring within 30 days
  - Display transaction history (issued, redeemed, expired)

**GC-US-007: Receive Expiration Reminders**
- **As a**: Customer
- **I want to**: Receive notifications before my digital reward expires
- **So that**: I don't lose my rewards
- **Acceptance Criteria**:
  - Reminder 30 days before expiration
  - Reminder 7 days before expiration
  - Reminder 1 day before expiration
  - Grace period notification (30 days after expiration)
  - Multi-channel (email, SMS, push notification)

### Epic 3: Multi-Currency & Multi-Tenant

**GC-US-008: Support Multi-Currency Rewards**
- **As a**: Business operating in multiple countries
- **I want to**: Issue digital rewards in local currencies (USD, KHR, SGD)
- **So that**: Customers see rewards in familiar currency
- **Acceptance Criteria**:
  - Currency determined by business default or customer location
  - No post-issuance currency conversion (locked at issuance)
  - Separate balances per currency
  - Redemption restricted to matching currency
  - Decimal precision: USD/SGD (2 decimals), KHR (0 decimals)

**GC-US-009: Partner-Specific Redemption**
- **As a**: Partner merchant
- **I want to**: Restrict my digital rewards to redemption at my locations only
- **So that**: I ensure rewards drive traffic to my business
- **Acceptance Criteria**:
  - Digital reward tagged with `partner_id` or `merchant_id`
  - Redemption validated against merchant location
  - Generic rewards redeemable anywhere
  - Partner-specific rewards shown separately in wallet

---

## Functional Requirements

### FR-GC-001: Digital Reward Issuance
**Priority**: P0 (Must Have)

**Description**: System must issue digital rewards through multiple trigger mechanisms.

**Sub-Requirements**:
- FR-GC-001.1: Manual issuance via admin portal (business owner/manager)
- FR-GC-001.2: Automated issuance via campaign rules engine
- FR-GC-001.3: API-triggered issuance (partner integrations)
- FR-GC-001.4: Bulk issuance for customer segments
- FR-GC-001.5: Configurable expiration (default: 12 months)
- FR-GC-001.6: Grace period (default: 30 days post-expiration)
- FR-GC-001.7: Notification upon issuance (email/SMS/push)

**Dependencies**:
- Reward Catalog Service (DIGITAL_GIFT reward type)
- Customer Management Service (customer records)
- Notification Service (customer alerts)

### FR-GC-002: Balance Tracking
**Priority**: P0 (Must Have)

**Description**: System must maintain accurate digital reward balances across all operations.

**Sub-Requirements**:
- FR-GC-002.1: Real-time balance calculation (issued - redeemed - expired)
- FR-GC-002.2: Multi-currency balance tracking (USD, KHR, SGD)
- FR-GC-002.3: FIFO redemption order (earliest expiration first)
- FR-GC-002.4: Grace period balance retention (30 days post-expiration)
- FR-GC-002.5: Atomic balance updates (no race conditions)
- FR-GC-002.6: Balance audit trail (all state changes logged)

**Performance**:
- Balance lookup: < 100ms (p95)
- Balance update: < 200ms (p95)
- Concurrent updates: Optimistic locking or distributed locks

### FR-GC-003: Redemption Processing
**Priority**: P0 (Must Have)

**Description**: System must process digital reward redemptions at checkout.

**Sub-Requirements**:
- FR-GC-003.1: Validate sufficient balance before applying
- FR-GC-003.2: Multi-tender support (digital reward + points + cash)
- FR-GC-003.3: VAT/GST exclusion (customer pays tax separately)
- FR-GC-003.4: FIFO depletion (redeem soonest-to-expire first)
- FR-GC-003.5: Transaction atomicity (balance deduction + payment processing)
- FR-GC-003.6: Redemption receipt (itemized breakdown)
- FR-GC-003.7: Reversal support (refunds restore digital reward balance)

**Business Rules**:
- Digital reward applies to product total (before tax)
- Customer pays VAT/GST in cash/card
- Multi-currency redemption must match transaction currency

### FR-GC-004: Expiration & Grace Period
**Priority**: P0 (Must Have)

**Description**: System must enforce expiration policies with customer-friendly grace periods.

**Sub-Requirements**:
- FR-GC-004.1: Expiration date calculation (issue_date + expiration_months)
- FR-GC-004.2: Grace period calculation (expiration_date + 30 days)
- FR-GC-004.3: Status transitions: `active` → `expired` → `grace_period` → `fully_expired`
- FR-GC-004.4: Automated expiration job (daily batch process)
- FR-GC-004.5: Expiration notifications (30d, 7d, 1d before expiration)
- FR-GC-004.6: Grace period notifications (during grace period)
- FR-GC-004.7: Breakage recognition (upon full expiration)

**See**: Business Rules section for detailed expiration logic.

### FR-GC-005: Multi-Currency Support
**Priority**: P0 (Must Have)

**Description**: System must support digital rewards in multiple ASEAN currencies.

**Sub-Requirements**:
- FR-GC-005.1: Supported currencies: USD, KHR, SGD (extensible to THB, VND, MYR, PHP, IDR)
- FR-GC-005.2: Currency locked at issuance (no post-issuance conversion)
- FR-GC-005.3: Separate balances per currency
- FR-GC-005.4: Decimal precision: USD/SGD (2), KHR (0)
- FR-GC-005.5: Redemption currency must match transaction currency
- FR-GC-005.6: Multi-currency display in unified wallet

**Example**:
- Customer has: $10 USD + 40,000 KHR + $5 SGD digital rewards
- At checkout in Cambodia (KHR): Can use 40,000 KHR reward only
- At checkout in Singapore (SGD): Can use $5 SGD reward only

### FR-GC-006: Audit Trail & Compliance
**Priority**: P0 (Must Have)

**Description**: System must maintain comprehensive audit trail for regulatory compliance.

**Sub-Requirements**:
- FR-GC-006.1: Log all digital reward transactions (issued, redeemed, expired, extended)
- FR-GC-006.2: Immutable transaction history (append-only ledger)
- FR-GC-006.3: Track issued_by user (admin, system, partner)
- FR-GC-006.4: Track method (promotional, referral, campaign, partner)
- FR-GC-006.5: Financial reconciliation reports (liability balance)
- FR-GC-006.6: Breakage tracking (expired rewards by currency)
- FR-GC-006.7: IFRS 15 compliant accounting integration

---

## Non-Functional Requirements

### Performance
- **Balance Lookup**: < 100ms (p95), < 50ms (p50)
- **Redemption Processing**: < 200ms (p95), < 100ms (p50)
- **Issuance**: < 300ms (p95), < 150ms (p50)
- **Bulk Issuance**: 1,000 rewards/minute minimum
- **Concurrent Users**: Support 10,000 concurrent balance checks

### Reliability
- **Uptime**: 99.9% availability (8.76 hours downtime/year max)
- **Data Durability**: 99.999999999% (11 nines) - Zero balance loss
- **Transaction Atomicity**: ACID compliance for balance updates
- **Disaster Recovery**: RPO < 1 hour, RTO < 4 hours

### Security
- **Authentication**: OAuth 2.0 + JWT for API access
- **Authorization**: RBAC (admin, manager, partner, customer roles)
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **PCI Compliance**: Not required (no card data stored)
- **Fraud Prevention**: Rate limiting (max 5 redemptions/minute per customer)
- **Audit Logging**: All admin actions logged with user identity

### Scalability
- **Database**: Horizontal scaling via read replicas (PostgreSQL)
- **Caching**: Redis cluster for balance lookups
- **Event Streaming**: RabbitMQ/Kafka for asynchronous processing
- **Sharding**: Support multi-tenant partitioning by `business_id`

### Compliance
- **IFRS 15**: Revenue recognition for breakage
- **ASEAN VAT/GST**: Tax at redemption (Cambodia 10%, Singapore 9%)
- **Data Retention**: 7 years minimum (accounting records)
- **Multi-Jurisdiction**: Cambodia, Singapore, Vietnam, Thailand support
- **Privacy**: GDPR-ready (data export, deletion upon request)

---

## Technical Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
│  (Next.js Web App, React Native Mobile, Partner API Clients)   │
└────────────┬──────────────────────────────────┬─────────────────┘
             │                                  │
             ▼                                  ▼
┌─────────────────────────┐       ┌─────────────────────────────┐
│   API Gateway (NestJS)  │       │  Admin Portal (Next.js)     │
│  - Authentication       │       │  - Manual Issuance          │
│  - Rate Limiting        │       │  - Campaign Management      │
│  - Request Validation   │       │  - Reporting                │
└────────────┬────────────┘       └─────────────┬───────────────┘
             │                                  │
             ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Digital Reward Service (NestJS)               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Issuance    │  │  Redemption  │  │  Expiration         │   │
│  │  Controller  │  │  Controller  │  │  Batch Job          │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────────────┘   │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         Digital Reward Domain Service                 │      │
│  │  - Issue Reward      - Validate Balance               │      │
│  │  - Redeem Reward     - Calculate Expiration           │      │
│  │  - Extend Expiration - Process Breakage               │      │
│  └────────┬─────────────────────────────────────┬────────┘      │
│           │                                     │               │
│           ▼                                     ▼               │
│  ┌──────────────────┐                 ┌──────────────────┐     │
│  │  Reward          │                 │  Transaction     │     │
│  │  Repository      │                 │  Repository      │     │
│  └────────┬─────────┘                 └────────┬─────────┘     │
└───────────┼──────────────────────────────────────┼─────────────┘
            │                                      │
            ▼                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│  ┌─────────────────┐  ┌───────────────────────┐  ┌───────────┐ │
│  │ digital_rewards │  │ digital_reward_       │  │ digital_  │ │
│  │                 │  │ transactions          │  │ reward_   │ │
│  │ - id            │  │                       │  │ breakage  │ │
│  │ - business_id   │  │ - id                  │  │           │ │
│  │ - customer_id   │  │ - reward_id           │  │ - id      │ │
│  │ - amount        │  │ - transaction_type    │  │ - amount  │ │
│  │ - balance       │  │ - amount              │  │ - period  │ │
│  │ - currency      │  │ - balance_after       │  │           │ │
│  │ - expires_at    │  │ - metadata            │  │           │ │
│  │ - status        │  └───────────────────────┘  └───────────┘ │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
            │                                      │
            ▼                                      ▼
┌─────────────────────┐                 ┌──────────────────────┐
│  Redis Cache        │                 │  Event Bus           │
│  - Balance Lookup   │                 │  (RabbitMQ/Kafka)    │
│  - Active Rewards   │                 │  - RewardIssued      │
│  - TTL: 5 minutes   │                 │  - RewardRedeemed    │
└─────────────────────┘                 │  - RewardExpired     │
                                        └──────────┬───────────┘
                                                   │
                    ┌──────────────────────────────┼─────────────┐
                    │                              │             │
                    ▼                              ▼             ▼
         ┌────────────────────┐       ┌──────────────────┐  ┌────────────┐
         │  Notification      │       │  Accounting      │  │  Analytics │
         │  Service           │       │  Service         │  │  Service   │
         │  - Email           │       │  - Liability     │  │  - Breakage│
         │  - SMS             │       │  - Breakage      │  │  - Redemp- │
         │  - Push            │       │  - IFRS 15       │  │    tion    │
         └────────────────────┘       └──────────────────┘  └────────────┘
```

### Technology Stack

**Backend**:
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL 16+ (multi-tenant partitioning)
- **Cache**: Redis 7+ (balance lookups)
- **Event Bus**: RabbitMQ or Kafka (asynchronous processing)
- **ORM**: Prisma (when database added)

**Frontend**:
- **Web**: Next.js (React)
- **Mobile**: React Native
- **Admin**: Next.js with shadcn/ui

**Infrastructure**:
- **Hosting**: AWS/GCP/Azure (containerized)
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

---

## API Contracts

### 1. Issue Digital Reward

**Endpoint**: `POST /api/v1/digital-rewards/issue`

**Request**:
```typescript
interface IssueDigitalRewardRequest {
  customer_id: string;           // UUID
  amount: number;                // Decimal (e.g., 25.00)
  currency: 'USD' | 'KHR' | 'SGD'; // ASEAN currencies
  method: 'promotional' | 'referral' | 'campaign' | 'partner';
  reason?: string;               // Optional description
  campaign_id?: string;          // Optional campaign reference
  partner_id?: string;           // Optional for partner-specific rewards
  merchant_id?: string;          // Optional for merchant-specific redemption
  expiration_months?: number;    // Default: 12
  issued_by_user_id?: string;    // Admin user issuing (if manual)
  metadata?: Record<string, any>; // Custom data
}
```

**Example Request**:
```json
{
  "customer_id": "cust_abc123",
  "amount": 25.00,
  "currency": "USD",
  "method": "promotional",
  "reason": "Welcome bonus for new customer",
  "campaign_id": "campaign_welcome2025",
  "expiration_months": 12
}
```

**Response (201 Created)**:
```typescript
interface IssueDigitalRewardResponse {
  id: string;                    // reward_abc123
  customer_id: string;
  amount: number;
  currency: string;
  balance: number;               // Initially equals amount
  method: string;
  reason?: string;
  campaign_id?: string;
  partner_id?: string;
  merchant_id?: string;
  issued_at: string;             // ISO 8601 timestamp
  expires_at: string;            // ISO 8601 timestamp
  grace_period_ends_at: string;  // ISO 8601 timestamp
  status: 'active' | 'expired' | 'grace_period' | 'fully_expired';
  metadata?: Record<string, any>;
}
```

**Example Response**:
```json
{
  "id": "reward_abc123",
  "customer_id": "cust_abc123",
  "amount": 25.00,
  "currency": "USD",
  "balance": 25.00,
  "method": "promotional",
  "reason": "Welcome bonus for new customer",
  "campaign_id": "campaign_welcome2025",
  "issued_at": "2025-11-09T10:30:00Z",
  "expires_at": "2026-11-09T10:30:00Z",
  "grace_period_ends_at": "2026-12-09T10:30:00Z",
  "status": "active",
  "metadata": {}
}
```

**Errors**:
- `400 Bad Request`: Invalid amount, currency, or customer_id
- `404 Not Found`: Customer not found
- `403 Forbidden`: User not authorized to issue rewards
- `500 Internal Server Error`: Database or system failure

---

### 2. Get Customer Digital Reward Balance

**Endpoint**: `GET /api/v1/digital-rewards/balance/{customer_id}`

**Query Parameters**:
```typescript
interface GetBalanceQuery {
  currency?: 'USD' | 'KHR' | 'SGD'; // Optional: filter by currency
  include_expired?: boolean;         // Default: false
}
```

**Response (200 OK)**:
```typescript
interface GetBalanceResponse {
  customer_id: string;
  balances: Array<{
    currency: string;
    total_balance: number;           // Sum of all active rewards
    active_rewards_count: number;
    rewards: Array<{
      id: string;
      amount: number;
      balance: number;
      issued_at: string;
      expires_at: string;
      grace_period_ends_at: string;
      status: string;
      method: string;
      reason?: string;
      partner_id?: string;
      merchant_id?: string;
      days_until_expiration?: number; // Null if expired
    }>;
  }>;
}
```

**Example Response**:
```json
{
  "customer_id": "cust_abc123",
  "balances": [
    {
      "currency": "USD",
      "total_balance": 45.00,
      "active_rewards_count": 2,
      "rewards": [
        {
          "id": "reward_001",
          "amount": 25.00,
          "balance": 25.00,
          "issued_at": "2025-11-09T10:30:00Z",
          "expires_at": "2026-11-09T10:30:00Z",
          "grace_period_ends_at": "2026-12-09T10:30:00Z",
          "status": "active",
          "method": "promotional",
          "reason": "Welcome bonus",
          "days_until_expiration": 365
        },
        {
          "id": "reward_002",
          "amount": 20.00,
          "balance": 20.00,
          "issued_at": "2025-10-15T08:00:00Z",
          "expires_at": "2026-10-15T08:00:00Z",
          "grace_period_ends_at": "2026-11-14T08:00:00Z",
          "status": "active",
          "method": "referral",
          "reason": "Friend referral bonus",
          "days_until_expiration": 340
        }
      ]
    },
    {
      "currency": "KHR",
      "total_balance": 40000,
      "active_rewards_count": 1,
      "rewards": [
        {
          "id": "reward_003",
          "amount": 40000,
          "balance": 40000,
          "issued_at": "2025-11-01T12:00:00Z",
          "expires_at": "2026-11-01T12:00:00Z",
          "grace_period_ends_at": "2026-12-01T12:00:00Z",
          "status": "active",
          "method": "campaign",
          "reason": "Holiday promotion",
          "days_until_expiration": 357
        }
      ]
    }
  ]
}
```

**Errors**:
- `404 Not Found`: Customer not found
- `403 Forbidden`: User not authorized to view this customer's balance

---

### 3. Redeem Digital Reward

**Endpoint**: `POST /api/v1/digital-rewards/redeem`

**Request**:
```typescript
interface RedeemDigitalRewardRequest {
  customer_id: string;
  amount: number;                // Amount to redeem
  currency: 'USD' | 'KHR' | 'SGD';
  transaction_id: string;        // External transaction reference (e.g., order_id)
  merchant_id?: string;          // Optional: validate merchant-specific rewards
  metadata?: Record<string, any>; // Custom data (e.g., cart details)
}
```

**Example Request**:
```json
{
  "customer_id": "cust_abc123",
  "amount": 15.00,
  "currency": "USD",
  "transaction_id": "order_xyz789",
  "merchant_id": "merchant_main_store",
  "metadata": {
    "cart_total": 50.00,
    "vat_rate": 0.10,
    "items": ["product_1", "product_2"]
  }
}
```

**Response (200 OK)**:
```typescript
interface RedeemDigitalRewardResponse {
  redemption_id: string;         // Unique redemption transaction ID
  customer_id: string;
  amount_redeemed: number;
  currency: string;
  remaining_balance: number;     // Total balance across all rewards after redemption
  rewards_used: Array<{
    reward_id: string;
    amount_used: number;
    balance_remaining: number;
  }>;
  transaction_id: string;
  redeemed_at: string;           // ISO 8601 timestamp
  metadata?: Record<string, any>;
}
```

**Example Response**:
```json
{
  "redemption_id": "redemption_abc123",
  "customer_id": "cust_abc123",
  "amount_redeemed": 15.00,
  "currency": "USD",
  "remaining_balance": 30.00,
  "rewards_used": [
    {
      "reward_id": "reward_002",
      "amount_used": 15.00,
      "balance_remaining": 5.00
    }
  ],
  "transaction_id": "order_xyz789",
  "redeemed_at": "2025-11-09T14:45:00Z",
  "metadata": {
    "cart_total": 50.00,
    "vat_rate": 0.10
  }
}
```

**Errors**:
- `400 Bad Request`: Invalid amount, currency, or insufficient balance
- `404 Not Found`: Customer not found or no active rewards in currency
- `409 Conflict`: Concurrent redemption detected (retry)
- `422 Unprocessable Entity`: Merchant restriction violated (partner-specific reward used at wrong merchant)

---

### 4. Get Digital Reward Transaction History

**Endpoint**: `GET /api/v1/digital-rewards/history/{customer_id}`

**Query Parameters**:
```typescript
interface GetHistoryQuery {
  currency?: 'USD' | 'KHR' | 'SGD'; // Optional filter
  transaction_type?: 'issued' | 'redeemed' | 'expired' | 'extended'; // Optional filter
  start_date?: string;              // ISO 8601 (e.g., 2025-01-01)
  end_date?: string;                // ISO 8601 (e.g., 2025-12-31)
  limit?: number;                   // Default: 50, Max: 200
  offset?: number;                  // Default: 0
}
```

**Response (200 OK)**:
```typescript
interface GetHistoryResponse {
  customer_id: string;
  total_count: number;
  transactions: Array<{
    id: string;
    reward_id: string;
    transaction_type: 'issued' | 'redeemed' | 'expired' | 'extended';
    amount: number;
    currency: string;
    balance_after: number;
    transaction_date: string;      // ISO 8601
    metadata?: Record<string, any>;
  }>;
  pagination: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
}
```

**Example Response**:
```json
{
  "customer_id": "cust_abc123",
  "total_count": 8,
  "transactions": [
    {
      "id": "txn_001",
      "reward_id": "reward_001",
      "transaction_type": "issued",
      "amount": 25.00,
      "currency": "USD",
      "balance_after": 25.00,
      "transaction_date": "2025-11-09T10:30:00Z",
      "metadata": {
        "method": "promotional",
        "reason": "Welcome bonus"
      }
    },
    {
      "id": "txn_002",
      "reward_id": "reward_002",
      "transaction_type": "redeemed",
      "amount": -15.00,
      "currency": "USD",
      "balance_after": 5.00,
      "transaction_date": "2025-11-09T14:45:00Z",
      "metadata": {
        "transaction_id": "order_xyz789"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

---

### 5. Extend Digital Reward Expiration (Admin)

**Endpoint**: `POST /api/v1/digital-rewards/extend`

**Authentication**: Admin/Manager role required

**Request**:
```typescript
interface ExtendExpirationRequest {
  reward_id: string;
  extension_months: number;      // Additional months to extend (e.g., 3)
  reason: string;                // Required for audit trail
  extended_by_user_id: string;   // Admin user making extension
}
```

**Example Request**:
```json
{
  "reward_id": "reward_001",
  "extension_months": 3,
  "reason": "Customer loyalty gesture - VIP customer request",
  "extended_by_user_id": "admin_user_123"
}
```

**Response (200 OK)**:
```typescript
interface ExtendExpirationResponse {
  reward_id: string;
  old_expires_at: string;
  new_expires_at: string;
  new_grace_period_ends_at: string;
  extension_months: number;
  reason: string;
  extended_by: string;
  extended_at: string;
}
```

**Example Response**:
```json
{
  "reward_id": "reward_001",
  "old_expires_at": "2026-11-09T10:30:00Z",
  "new_expires_at": "2027-02-09T10:30:00Z",
  "new_grace_period_ends_at": "2027-03-11T10:30:00Z",
  "extension_months": 3,
  "reason": "Customer loyalty gesture - VIP customer request",
  "extended_by": "admin_user_123",
  "extended_at": "2025-11-09T16:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Invalid extension_months (must be > 0)
- `403 Forbidden`: User not authorized (admin/manager only)
- `404 Not Found`: Reward not found
- `422 Unprocessable Entity`: Reward already fully expired

---

## Database Schema

### Table: `digital_rewards`

```sql
CREATE TABLE digital_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Financial Details
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL,  -- USD, KHR, SGD, THB, VND, MYR, PHP, IDR
  balance DECIMAL(15, 2) NOT NULL CHECK (balance >= 0 AND balance <= amount),

  -- Issuance Details
  method VARCHAR(50) NOT NULL,  -- promotional, referral, campaign, partner
  reason TEXT,
  campaign_id UUID REFERENCES campaigns(id),
  partner_id UUID REFERENCES partners(id),
  merchant_id UUID REFERENCES merchants(id),  -- For merchant-specific redemption
  issued_by_user_id UUID REFERENCES users(id),

  -- Expiration Management
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  grace_period_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  -- Status: 'active', 'expired', 'grace_period', 'fully_expired'

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_currency CHECK (currency IN ('USD', 'KHR', 'SGD', 'THB', 'VND', 'MYR', 'PHP', 'IDR')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'expired', 'grace_period', 'fully_expired')),
  CONSTRAINT valid_method CHECK (method IN ('promotional', 'referral', 'campaign', 'partner'))
);

-- Indexes for Performance
CREATE INDEX idx_digital_rewards_customer_id ON digital_rewards(customer_id);
CREATE INDEX idx_digital_rewards_business_id ON digital_rewards(business_id);
CREATE INDEX idx_digital_rewards_status ON digital_rewards(status);
CREATE INDEX idx_digital_rewards_expires_at ON digital_rewards(expires_at);
CREATE INDEX idx_digital_rewards_currency ON digital_rewards(currency);
CREATE INDEX idx_digital_rewards_partner_id ON digital_rewards(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX idx_digital_rewards_merchant_id ON digital_rewards(merchant_id) WHERE merchant_id IS NOT NULL;

-- Composite Index for Balance Queries (Most Common Query)
CREATE INDEX idx_digital_rewards_customer_currency_status
  ON digital_rewards(customer_id, currency, status)
  WHERE status = 'active';

-- Partial Index for Expiration Processing
CREATE INDEX idx_digital_rewards_expiration_job
  ON digital_rewards(expires_at, status)
  WHERE status IN ('active', 'expired');
```

---

### Table: `digital_reward_transactions`

```sql
CREATE TABLE digital_reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES digital_rewards(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Transaction Details
  transaction_type VARCHAR(20) NOT NULL,  -- issued, redeemed, expired, extended
  amount DECIMAL(15, 2) NOT NULL,  -- Positive for issued/extended, negative for redeemed/expired
  currency VARCHAR(3) NOT NULL,
  balance_after DECIMAL(15, 2) NOT NULL,

  -- External References
  external_transaction_id VARCHAR(255),  -- e.g., order_id, refund_id

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit Trail
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('issued', 'redeemed', 'expired', 'extended'))
);

-- Indexes
CREATE INDEX idx_digital_reward_txns_reward_id ON digital_reward_transactions(reward_id);
CREATE INDEX idx_digital_reward_txns_customer_id ON digital_reward_transactions(customer_id);
CREATE INDEX idx_digital_reward_txns_business_id ON digital_reward_transactions(business_id);
CREATE INDEX idx_digital_reward_txns_type ON digital_reward_transactions(transaction_type);
CREATE INDEX idx_digital_reward_txns_date ON digital_reward_transactions(transaction_date);
CREATE INDEX idx_digital_reward_txns_external_id ON digital_reward_transactions(external_transaction_id)
  WHERE external_transaction_id IS NOT NULL;
```

---

### Table: `digital_reward_breakage`

**Purpose**: Track breakage revenue recognition for accounting (IFRS 15).

```sql
CREATE TABLE digital_reward_breakage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Reporting Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  currency VARCHAR(3) NOT NULL,

  -- Breakage Metrics
  expired_rewards_count INTEGER NOT NULL DEFAULT 0,
  total_expired_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  breakage_revenue_recognized DECIMAL(15, 2) NOT NULL DEFAULT 0,

  -- Accounting References
  journal_entry_id VARCHAR(255),  -- External accounting system reference
  recognized_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(business_id, period_start, period_end, currency)
);

-- Indexes
CREATE INDEX idx_digital_reward_breakage_business_id ON digital_reward_breakage(business_id);
CREATE INDEX idx_digital_reward_breakage_period ON digital_reward_breakage(period_start, period_end);
CREATE INDEX idx_digital_reward_breakage_currency ON digital_reward_breakage(currency);
```

---

## Business Rules

### BR-GC-001: FIFO Redemption Order

**Rule**: When redeeming digital rewards, deplete rewards with the earliest expiration date first (First-In-First-Out).

**Rationale**: Maximizes customer value by using soonest-to-expire rewards first, reducing breakage.

**Implementation**:
```typescript
class DigitalRewardService {
  async redeemReward(
    customerId: string,
    amountToRedeem: number,
    currency: string
  ): Promise<RedemptionResult> {
    // 1. Fetch active rewards sorted by expiration (FIFO)
    const rewards = await this.rewardRepository.findActive({
      customerId,
      currency,
      sortBy: 'expires_at ASC'  // FIFO order
    });

    // 2. Validate sufficient balance
    const totalBalance = rewards.reduce((sum, r) => sum + r.balance, 0);
    if (totalBalance < amountToRedeem) {
      throw new InsufficientBalanceError();
    }

    // 3. Deplete rewards in FIFO order
    let remaining = amountToRedeem;
    const rewardsUsed: RewardUsage[] = [];

    for (const reward of rewards) {
      if (remaining <= 0) break;

      const amountToUse = Math.min(reward.balance, remaining);

      await this.rewardRepository.updateBalance(
        reward.id,
        reward.balance - amountToUse
      );

      rewardsUsed.push({
        rewardId: reward.id,
        amountUsed: amountToUse,
        balanceRemaining: reward.balance - amountToUse
      });

      remaining -= amountToUse;
    }

    return { rewardsUsed, totalRedeemed: amountToRedeem };
  }
}
```

---

### BR-GC-002: Multi-Currency Isolation

**Rule**: Digital rewards are locked to the currency at issuance. No post-issuance currency conversion is allowed.

**Rationale**: Avoid exchange rate complexity, accounting complications, and customer confusion.

**Implementation**:
```typescript
class DigitalRewardService {
  async redeemReward(
    customerId: string,
    amountToRedeem: number,
    transactionCurrency: string
  ): Promise<RedemptionResult> {
    // Only fetch rewards matching transaction currency
    const rewards = await this.rewardRepository.findActive({
      customerId,
      currency: transactionCurrency,  // Must match exactly
      sortBy: 'expires_at ASC'
    });

    if (rewards.length === 0) {
      throw new Error(
        `No active digital rewards found in ${transactionCurrency}. ` +
        `Customer has balances in other currencies but cannot convert.`
      );
    }

    // Proceed with FIFO redemption in matching currency only
    return this.processFifoRedemption(rewards, amountToRedeem);
  }

  async getCustomerBalance(customerId: string): Promise<BalanceResponse> {
    // Return separate balances per currency
    const rewards = await this.rewardRepository.findByCustomer(customerId);

    const balancesByCurrency = rewards.reduce((acc, reward) => {
      if (!acc[reward.currency]) {
        acc[reward.currency] = {
          currency: reward.currency,
          totalBalance: 0,
          rewards: []
        };
      }
      acc[reward.currency].totalBalance += reward.balance;
      acc[reward.currency].rewards.push(reward);
      return acc;
    }, {} as Record<string, CurrencyBalance>);

    return { balances: Object.values(balancesByCurrency) };
  }
}
```

**Example**:
- Customer has: $10 USD + 40,000 KHR digital rewards
- Transaction in Singapore (SGD): **Cannot use USD or KHR rewards** (no SGD balance)
- Transaction in Cambodia (KHR): Can use 40,000 KHR reward only

---

### BR-GC-003: VAT/GST Exclusion

**Rule**: Digital reward redemptions reduce product total **before tax**. Customer pays VAT/GST separately in cash/card.

**Rationale**: Align with ASEAN tax principles (tax on goods/services, not on discounts). Clearer accounting.

**Implementation**:
```typescript
interface PaymentBreakdown {
  cartTotal: number;           // Product total (before tax, before digital reward)
  digitalRewardApplied: number; // Digital reward discount
  amountAfterReward: number;   // cartTotal - digitalRewardApplied
  vat: number;                 // Tax calculated on cartTotal (not reduced amount)
  totalDue: number;            // amountAfterReward + vat
}

function calculatePayment(
  cartTotal: number,
  digitalRewardApplied: number,
  vatRate: number  // e.g., 0.10 for 10% VAT
): PaymentBreakdown {
  const vat = cartTotal * vatRate;  // VAT on full product total
  const amountAfterReward = Math.max(0, cartTotal - digitalRewardApplied);
  const totalDue = amountAfterReward + vat;

  return {
    cartTotal,
    digitalRewardApplied,
    amountAfterReward,
    vat,
    totalDue
  };
}

// Example Usage
const breakdown = calculatePayment(
  50.00,  // Cart total
  15.00,  // Digital reward applied
  0.10    // 10% VAT (Cambodia)
);

console.log(breakdown);
// {
//   cartTotal: 50.00,
//   digitalRewardApplied: 15.00,
//   amountAfterReward: 35.00,
//   vat: 5.00,          // Tax on full $50, not $35
//   totalDue: 40.00     // Customer pays $35 cash + $5 VAT
// }
```

**Receipt Example**:
```
Product Total:           $50.00
Digital Reward Applied: -$15.00
                        -------
Subtotal After Reward:   $35.00
VAT (10%):               $5.00
                        -------
Total Due:               $40.00

Payment:
  Digital Reward:        $15.00
  Cash:                  $35.00
  VAT (Cash):            $5.00
```

---

### BR-GC-004: Expiration Status Transitions

**Rule**: Digital rewards transition through statuses: `active` → `expired` → `grace_period` → `fully_expired`.

**Status Definitions**:
- **active**: Current date < `expires_at` (can redeem normally)
- **expired**: Current date >= `expires_at` AND < `grace_period_ends_at` (visible warning, can still redeem)
- **grace_period**: Same as expired (deprecated status, kept for backwards compatibility)
- **fully_expired**: Current date >= `grace_period_ends_at` (cannot redeem, breakage recognized)

**Implementation**:
```typescript
class ExpirationBatchJob {
  async processExpirations(): Promise<void> {
    const now = new Date();

    // Transition: active → expired (reached expiration date)
    await this.rewardRepository.updateMany(
      {
        status: 'active',
        expires_at: { lte: now }
      },
      { status: 'expired' }
    );

    // Transition: expired → fully_expired (grace period ended)
    const fullyExpiredRewards = await this.rewardRepository.findMany({
      status: 'expired',
      grace_period_ends_at: { lte: now }
    });

    for (const reward of fullyExpiredRewards) {
      // Update status
      await this.rewardRepository.update(reward.id, {
        status: 'fully_expired',
        balance: 0  // Zero out balance
      });

      // Create breakage transaction
      await this.transactionRepository.create({
        rewardId: reward.id,
        customerId: reward.customerId,
        businessId: reward.businessId,
        transactionType: 'expired',
        amount: -reward.balance,  // Negative (balance reduction)
        currency: reward.currency,
        balanceAfter: 0,
        metadata: { reason: 'Grace period ended' }
      });

      // Emit event for accounting service
      await this.eventBus.publish('DigitalRewardExpired', {
        rewardId: reward.id,
        customerId: reward.customerId,
        businessId: reward.businessId,
        amount: reward.balance,
        currency: reward.currency,
        expiredAt: now
      });
    }

    // Send notifications for upcoming expirations (30d, 7d, 1d)
    await this.sendExpirationReminders();
  }

  private async sendExpirationReminders(): Promise<void> {
    const now = new Date();

    // 30 days before expiration
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = await this.rewardRepository.findMany({
      status: 'active',
      expires_at: { gte: now, lte: in30Days },
      notificationSent: false
    });

    for (const reward of expiringSoon) {
      await this.notificationService.sendExpirationReminder(reward, 30);
      await this.rewardRepository.markNotificationSent(reward.id, '30d');
    }

    // Repeat for 7d, 1d...
  }
}
```

---

### BR-GC-005: Merchant-Specific Redemption Validation

**Rule**: If a digital reward has a `merchant_id`, it can only be redeemed at that specific merchant's locations.

**Rationale**: Support partner merchant campaigns (e.g., Starbucks issues $10 reward redeemable only at Starbucks).

**Implementation**:
```typescript
class DigitalRewardService {
  async redeemReward(
    customerId: string,
    amountToRedeem: number,
    currency: string,
    transactionMerchantId: string  // Merchant processing the transaction
  ): Promise<RedemptionResult> {
    const rewards = await this.rewardRepository.findActive({
      customerId,
      currency,
      sortBy: 'expires_at ASC'
    });

    // Filter rewards by merchant restriction
    const eligibleRewards = rewards.filter(reward => {
      if (reward.merchantId === null) {
        return true;  // Generic reward (redeemable anywhere)
      }
      return reward.merchantId === transactionMerchantId;
    });

    if (eligibleRewards.length === 0) {
      throw new Error(
        `Customer has digital rewards in ${currency}, but none are ` +
        `redeemable at merchant ${transactionMerchantId}. ` +
        `Available balances: ` +
        rewards.map(r => `${r.balance} ${r.currency} (${r.merchantId || 'any merchant'})`).join(', ')
      );
    }

    const totalEligibleBalance = eligibleRewards.reduce(
      (sum, r) => sum + r.balance,
      0
    );

    if (totalEligibleBalance < amountToRedeem) {
      throw new InsufficientBalanceError(
        `Insufficient merchant-eligible balance. ` +
        `Requested: ${amountToRedeem}, Available: ${totalEligibleBalance}`
      );
    }

    return this.processFifoRedemption(eligibleRewards, amountToRedeem);
  }
}
```

**Example**:
- Customer has:
  - $10 USD (generic, redeemable anywhere)
  - $20 USD (merchant_id = "starbucks", redeemable at Starbucks only)
- Transaction at Nike (merchant_id = "nike"): Can use $10 generic reward only
- Transaction at Starbucks (merchant_id = "starbucks"): Can use both ($10 generic + $20 Starbucks-specific)

---

### BR-GC-006: Breakage Revenue Recognition

**Rule**: Recognize breakage revenue when digital rewards become `fully_expired` (grace period ends).

**Method**: Remote method (recognize at expiration, not proportional method).

**Accounting Standard**: IFRS 15 / SFRS (Singapore FRS)

**Implementation**:
```typescript
class AccountingService {
  async recognizeBreakage(
    businessId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<BreakageReport> {
    // Fetch all fully expired rewards in period, grouped by currency
    const expiredRewards = await this.rewardRepository.findFullyExpired({
      businessId,
      gracePeriodEnded: { gte: periodStart, lte: periodEnd },
      breakageRecognized: false
    });

    const breakageByCurrency = expiredRewards.reduce((acc, reward) => {
      if (!acc[reward.currency]) {
        acc[reward.currency] = {
          currency: reward.currency,
          count: 0,
          totalAmount: 0
        };
      }
      acc[reward.currency].count += 1;
      acc[reward.currency].totalAmount += reward.balance;
      return acc;
    }, {} as Record<string, BreakageMetrics>);

    // Create accounting entries per currency
    for (const [currency, metrics] of Object.entries(breakageByCurrency)) {
      const journalEntry = await this.createJournalEntry({
        businessId,
        date: periodEnd,
        entries: [
          {
            account: 'Digital Reward Liability',
            debit: metrics.totalAmount,
            currency
          },
          {
            account: 'Breakage Revenue',
            credit: metrics.totalAmount,
            currency
          }
        ],
        description: `Breakage recognition for ${metrics.count} expired digital rewards`,
        period: `${periodStart.toISOString().slice(0, 10)} to ${periodEnd.toISOString().slice(0, 10)}`
      });

      // Record breakage summary
      await this.breakageRepository.create({
        businessId,
        periodStart,
        periodEnd,
        currency,
        expiredRewardsCount: metrics.count,
        totalExpiredAmount: metrics.totalAmount,
        breakageRevenueRecognized: metrics.totalAmount,
        journalEntryId: journalEntry.id,
        recognizedAt: new Date()
      });

      // Mark rewards as breakage recognized
      await this.rewardRepository.markBreakageRecognized(
        expiredRewards
          .filter(r => r.currency === currency)
          .map(r => r.id)
      );
    }

    return { breakageByCurrency };
  }
}
```

**Journal Entry Example** (Cambodia, 10% VAT):
```
Period: 2025-Q4 (Oct 1 - Dec 31)
Currency: USD

Expired Rewards: 120 rewards, $1,800 total

Journal Entry:
  DR: Digital Reward Liability    $1,800
  CR: Breakage Revenue            $1,800

Note: Breakage revenue is taxable income (20% corporate tax in Cambodia).
      No VAT on breakage (no goods/services provided).
```

---

## UX Mockups

### 1. Customer Wallet - Digital Rewards Tab

```
┌────────────────────────────────────────────────────────────┐
│  NxLoy Wallet                                    [Profile] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [Points] [Store Credit] [Digital Rewards] ← Active Tab   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  💳 Digital Rewards                                  │ │
│  │                                                      │ │
│  │  Total Balance: $45.00 USD                          │ │
│  │                 40,000 KHR                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Active Rewards (USD):                                     │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  🎁 Welcome Bonus                                    │ │
│  │  $25.00                                              │ │
│  │  Expires: Nov 9, 2026 (365 days left)               │ │
│  │  Reason: New customer welcome offer                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  👥 Referral Bonus                       [Expiring!] │ │
│  │  $20.00                                              │ │
│  │  Expires: Oct 15, 2026 (340 days left)              │ │
│  │  Reason: Friend referral reward                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Active Rewards (KHR):                                     │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  🎉 Holiday Promotion                                │ │
│  │  40,000 KHR                                          │ │
│  │  Expires: Nov 1, 2026 (357 days left)               │ │
│  │  Reason: Seasonal campaign                          │ │
│  │  Redeemable at: Any merchant                        │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [View Transaction History]                                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 2. Checkout - Multi-Tender Payment

```
┌────────────────────────────────────────────────────────────┐
│  Checkout                                         [Cancel] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Order Summary:                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Product A                              $30.00       │ │
│  │  Product B                              $20.00       │ │
│  │  ────────────────────────────────────────────────    │ │
│  │  Cart Total:                            $50.00       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Payment Methods:                                          │
│                                                            │
│  ☑ Digital Rewards (USD)                                   │
│  └─ Available: $45.00                                      │
│     Use: [$15.00________________] [Max]                    │
│                                                            │
│  ☑ Loyalty Points                                          │
│  └─ Available: 1,000 points ($10.00 value)                 │
│     Use: [500 points ($5.00)____] [Max]                    │
│                                                            │
│  ☐ Cash/Card                                               │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Payment Breakdown:                                  │ │
│  │                                                      │ │
│  │  Cart Total:                            $50.00      │ │
│  │  Digital Rewards Applied:              -$15.00      │ │
│  │  Loyalty Points Applied:                -$5.00      │ │
│  │  ──────────────────────────────────────────────     │ │
│  │  Subtotal After Discounts:              $30.00      │ │
│  │  VAT (10%):                              $5.00      │ │
│  │  ──────────────────────────────────────────────     │ │
│  │  Total Due (Cash/Card):                 $35.00      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [Complete Purchase]                                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 3. Admin Portal - Issue Digital Reward

```
┌────────────────────────────────────────────────────────────┐
│  Issue Digital Reward                            [Cancel] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Customer:                                                 │
│  [John Doe (john.doe@example.com)_____] [Search]          │
│                                                            │
│  Amount:                                                   │
│  [25.00________________]                                   │
│                                                            │
│  Currency:                                                 │
│  ( ) USD   (•) KHR   ( ) SGD                              │
│                                                            │
│  Method:                                                   │
│  [Promotional ▼]                                           │
│  └─ Options: Promotional, Referral, Campaign, Partner     │
│                                                            │
│  Reason (optional):                                        │
│  [Welcome bonus for VIP customer___________________]       │
│  [____________________________________________]            │
│                                                            │
│  Campaign (optional):                                      │
│  [Select Campaign ▼]                                       │
│                                                            │
│  Partner/Merchant Restriction (optional):                  │
│  [ ] Restrict to specific merchant                         │
│  └─ Merchant: [Select Merchant ▼]                          │
│                                                            │
│  Expiration:                                               │
│  [12_] months from issuance                                │
│                                                            │
│  Preview:                                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Digital Reward Details:                             │ │
│  │  - Amount: 25.00 KHR                                 │ │
│  │  - Issued: Nov 9, 2025                               │ │
│  │  - Expires: Nov 9, 2026                              │ │
│  │  - Grace Period Ends: Dec 9, 2026                    │ │
│  │  - Method: Promotional                               │ │
│  │  - Reason: Welcome bonus for VIP customer            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [Issue Reward]                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Reward Catalog Service

**Integration**: Digital rewards use existing `DIGITAL_GIFT` reward type from reward catalog.

**Responsibilities**:
- Reward Catalog: Define reward types, eligibility, earning rules
- Digital Reward Service: Issue, redeem, track balances for DIGITAL_GIFT rewards

**Data Flow**:
```typescript
// Reward Catalog defines reward type
const rewardType: RewardType = {
  type: 'DIGITAL_GIFT',
  name: 'Digital Reward',
  description: 'Promotional credits and digital gift rewards',
  valueType: 'CURRENCY',  // vs. POINTS
  expirationPolicy: {
    defaultMonths: 12,
    gracePeriodDays: 30
  }
};

// Digital Reward Service issues reward
const digitalReward = await digitalRewardService.issue({
  customerId: 'cust_123',
  amount: 25.00,
  currency: 'USD',
  method: 'promotional',
  rewardType: 'DIGITAL_GIFT'  // Links to Reward Catalog
});
```

**Events**:
- `RewardCatalog.RewardTypeCreated` → Digital Reward Service updates supported types
- `DigitalReward.Issued` → Reward Catalog updates redemption statistics
- `DigitalReward.Redeemed` → Reward Catalog tracks redemption rates

---

### 2. Payment Service

**Integration**: Digital rewards as payment method at checkout.

**Responsibilities**:
- Payment Service: Orchestrate multi-tender payments (digital reward + points + cash)
- Digital Reward Service: Validate balance, process redemption

**Multi-Tender Flow**:
```typescript
// Payment Service orchestrates checkout
class PaymentService {
  async processCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const { customerId, cartTotal, currency, paymentMethods } = request;

    let remainingAmount = cartTotal;
    const appliedPayments: Payment[] = [];

    // Step 1: Apply digital rewards (if selected)
    if (paymentMethods.digitalReward?.enabled) {
      const digitalRewardAmount = paymentMethods.digitalReward.amount;

      const redemption = await this.digitalRewardService.redeem({
        customerId,
        amount: digitalRewardAmount,
        currency,
        transactionId: request.orderId
      });

      appliedPayments.push({
        method: 'digital_reward',
        amount: digitalRewardAmount
      });

      remainingAmount -= digitalRewardAmount;
    }

    // Step 2: Apply loyalty points (if selected)
    if (paymentMethods.points?.enabled) {
      const pointsValue = paymentMethods.points.value;

      await this.loyaltyService.redeemPoints({
        customerId,
        points: paymentMethods.points.amount,
        transactionId: request.orderId
      });

      appliedPayments.push({
        method: 'points',
        amount: pointsValue
      });

      remainingAmount -= pointsValue;
    }

    // Step 3: Calculate VAT/GST (on original cart total, not reduced amount)
    const vat = cartTotal * request.vatRate;

    // Step 4: Collect cash/card for remaining amount + VAT
    const cashAmount = remainingAmount + vat;

    if (cashAmount > 0) {
      const cashPayment = await this.paymentGateway.charge({
        amount: cashAmount,
        currency,
        metadata: { orderId: request.orderId }
      });

      appliedPayments.push({
        method: 'cash_card',
        amount: cashAmount
      });
    }

    return {
      orderId: request.orderId,
      cartTotal,
      appliedPayments,
      vat,
      totalPaid: cartTotal + vat,
      breakdown: {
        cartTotal,
        digitalRewardApplied: paymentMethods.digitalReward?.amount || 0,
        pointsApplied: paymentMethods.points?.value || 0,
        amountAfterDiscounts: remainingAmount,
        vat,
        cashPaid: cashAmount
      }
    };
  }
}
```

**Events**:
- `Payment.CheckoutStarted` → Digital Reward Service reserves balance (optional)
- `Payment.CheckoutCompleted` → Digital Reward Service finalizes redemption
- `Payment.CheckoutCanceled` → Digital Reward Service reverses redemption

---

### 3. Accounting Service

**Integration**: Liability tracking and breakage revenue recognition (IFRS 15).

**Responsibilities**:
- Digital Reward Service: Track issuance, redemption, expiration
- Accounting Service: Generate journal entries, financial reports

**Event-Driven Accounting**:
```typescript
// Digital Reward Service emits events
class DigitalRewardService {
  async issueReward(request: IssueRequest): Promise<Reward> {
    const reward = await this.rewardRepository.create(request);

    // Emit event for accounting
    await this.eventBus.publish('DigitalReward.Issued', {
      rewardId: reward.id,
      businessId: reward.businessId,
      customerId: reward.customerId,
      amount: reward.amount,
      currency: reward.currency,
      issuedAt: reward.issuedAt,
      method: reward.method
    });

    return reward;
  }

  async redeemReward(request: RedeemRequest): Promise<Redemption> {
    const redemption = await this.processRedemption(request);

    // Emit event for accounting
    await this.eventBus.publish('DigitalReward.Redeemed', {
      redemptionId: redemption.id,
      businessId: redemption.businessId,
      customerId: redemption.customerId,
      amount: redemption.amount,
      currency: redemption.currency,
      redeemedAt: redemption.redeemedAt,
      transactionId: redemption.transactionId
    });

    return redemption;
  }
}

// Accounting Service listens to events
class AccountingEventHandler {
  @EventHandler('DigitalReward.Issued')
  async handleRewardIssued(event: DigitalRewardIssuedEvent): Promise<void> {
    // Create journal entry
    await this.journalEntryService.create({
      businessId: event.businessId,
      date: event.issuedAt,
      entries: [
        {
          account: 'Marketing Expense',  // or 'Promotional Expense'
          debit: event.amount,
          currency: event.currency
        },
        {
          account: 'Digital Reward Liability',
          credit: event.amount,
          currency: event.currency
        }
      ],
      description: `Digital reward issued: ${event.rewardId} (${event.method})`,
      metadata: { rewardId: event.rewardId, method: event.method }
    });
  }

  @EventHandler('DigitalReward.Redeemed')
  async handleRewardRedeemed(event: DigitalRewardRedeemedEvent): Promise<void> {
    // Create journal entry
    await this.journalEntryService.create({
      businessId: event.businessId,
      date: event.redeemedAt,
      entries: [
        {
          account: 'Digital Reward Liability',
          debit: event.amount,
          currency: event.currency
        },
        {
          account: 'Revenue',
          credit: event.amount,
          currency: event.currency
        }
      ],
      description: `Digital reward redeemed: ${event.redemptionId}`,
      metadata: {
        redemptionId: event.redemptionId,
        transactionId: event.transactionId
      }
    });
  }

  @EventHandler('DigitalReward.Expired')
  async handleRewardExpired(event: DigitalRewardExpiredEvent): Promise<void> {
    // Create breakage journal entry
    await this.journalEntryService.create({
      businessId: event.businessId,
      date: event.expiredAt,
      entries: [
        {
          account: 'Digital Reward Liability',
          debit: event.amount,
          currency: event.currency
        },
        {
          account: 'Breakage Revenue',
          credit: event.amount,
          currency: event.currency
        }
      ],
      description: `Digital reward breakage: ${event.rewardId}`,
      metadata: { rewardId: event.rewardId }
    });
  }
}
```

**Financial Reports**:
- **Balance Sheet**: Digital Reward Liability (current liabilities)
- **Income Statement**: Breakage Revenue (other income)
- **Cash Flow**: No direct cash flow impact (non-cash liability)

---

### 4. Notification Service

**Integration**: Customer alerts for issuance, expiration, redemption.

**Notification Types**:
1. **Reward Issued**: Welcome email/SMS with balance details
2. **Expiration Reminders**: 30d, 7d, 1d before expiration
3. **Grace Period Alert**: Reminder during grace period
4. **Redemption Confirmation**: Receipt after successful redemption

**Example Notification** (30-day expiration reminder):
```typescript
// Digital Reward Service triggers notification
class ExpirationBatchJob {
  async sendExpirationReminders(): Promise<void> {
    const rewards = await this.rewardRepository.findExpiringSoon(30);

    for (const reward of rewards) {
      await this.notificationService.send({
        customerId: reward.customerId,
        channels: ['email', 'sms', 'push'],
        template: 'digital_reward_expiring_soon',
        data: {
          customerName: reward.customer.name,
          amount: reward.balance,
          currency: reward.currency,
          expiresAt: reward.expiresAt,
          daysRemaining: 30,
          deepLink: 'nxloy://wallet/digital-rewards'
        }
      });
    }
  }
}

// Email Template (digital_reward_expiring_soon)
Subject: Your ${{ amount }} {{ currency }} digital reward expires in {{ daysRemaining }} days

Hi {{ customerName }},

You have a digital reward that will expire soon!

Amount: {{ amount }} {{ currency }}
Expires: {{ expiresAt | format_date }}
Days Remaining: {{ daysRemaining }}

Don't lose your reward! Use it before it expires.

[View My Rewards]

Thank you,
NxLoy Team
```

---

## Compliance & Accounting

### ASEAN Compliance Summary

**Phase 1 Strategy**: Digital rewards as **loyalty program benefits** (not purchased gift cards).

**Key Compliance Advantages**:
1. ✅ **Philippines Exemption**: Loyalty rewards exempt from Gift Check Act (no expiration prohibition)
2. ✅ **Singapore Licensing**: No Payment Services Act requirements (limited-purpose exemption)
3. ✅ **Cambodia Simplicity**: No specific gift card regulations
4. ✅ **Operational Flexibility**: Business sets expiration, terms, redemption rules
5. ✅ **No Escheatment**: Breakage stays with business (not remitted to government)

**Critical Distinctions** (Loyalty Rewards vs. Purchased Gift Cards):

| Factor | Loyalty Rewards (Phase 1) | Purchased Gift Cards (Phase 2+) |
|--------|---------------------------|--------------------------------|
| **Purchase Required** | NO (earned, not bought) | YES (customer pays money) |
| **Philippines Gift Check Act** | ✅ EXEMPT | ❌ APPLIES (no expiration) |
| **Singapore PS Act** | ✅ EXEMPT | ⚠️ May require licensing |
| **Expiration Allowed** | ✅ YES (12 months recommended) | Varies (NO in Philippines) |
| **Breakage Recognition** | ✅ Easier (no escheatment) | Complex (escheatment risk) |
| **Compliance Burden** | ✅ LOW | ⚠️ MEDIUM-HIGH |

**Recommended Approach**:
- **Phase 1**: Implement digital rewards as loyalty benefits (this spec)
- **Phase 2+**: Consider purchased gift cards ONLY if:
  1. Strong business case (customer demand, revenue model)
  2. Legal clearance per jurisdiction
  3. **AVOID Philippines entirely** (Gift Check Act too restrictive)

**See**: `/docs/requirements/features/gift-cards/COMPLIANCE.md` (v2.0.0) for full analysis.

---

### Accounting Treatment (IFRS 15)

**Standard**: IFRS 15 (International) / SFRS (Singapore)

**Digital Reward Lifecycle**:

1. **Issuance** (Loyalty Program Benefit):
   ```
   DR: Marketing Expense (or Promotional Expense)
   CR: Digital Reward Liability
   ```

   **Example**: Issue $25 USD digital reward
   ```
   DR: Marketing Expense              $25.00
   CR: Digital Reward Liability       $25.00
   ```

2. **Redemption** (Customer Uses Reward):
   ```
   DR: Digital Reward Liability
   CR: Revenue
   ```

   **Example**: Customer redeems $15 USD digital reward
   ```
   DR: Digital Reward Liability       $15.00
   CR: Revenue                        $15.00
   ```

3. **Expiration** (Breakage Recognition):
   ```
   DR: Digital Reward Liability
   CR: Breakage Revenue
   ```

   **Example**: $10 USD digital reward expires (grace period ended)
   ```
   DR: Digital Reward Liability       $10.00
   CR: Breakage Revenue               $10.00
   ```

**Breakage Estimation**:
- **Method**: Remote method (recognize at expiration, not proportional)
- **Initial Estimate**: 15% breakage rate (industry benchmark: 10-20%)
- **Review Frequency**: Quarterly adjustment based on actual data
- **Recognition Timing**: When grace period ends (fully expired)

**Liability Calculation**:
```typescript
function calculateLiability(businessId: string, currency: string): number {
  const activeRewards = getActiveRewards(businessId, currency);
  return activeRewards.reduce((sum, reward) => sum + reward.balance, 0);
}

// Example:
// - 100 active rewards at $10 each = $1,000 liability
// - Expected breakage: 15% = $150
// - Expected redemption: 85% = $850
// - Current liability on balance sheet: $1,000 (until expiration)
```

---

### Tax Treatment (ASEAN Markets)

**Principle**: VAT/GST applies at **redemption** (when goods/services provided), not at issuance.

#### Cambodia (10% VAT)

**Issuance**: No VAT (liability created)
**Redemption**: VAT on product total (before digital reward discount)
**Breakage**: No VAT (no goods/services provided)

**Example**:
```
Customer buys $50 product using $15 digital reward:
  Product Total:             $50.00
  Digital Reward Applied:   -$15.00
                            -------
  Subtotal After Reward:     $35.00
  VAT (10% on $50):          $5.00
                            -------
  Total Due (Cash):          $40.00

Accounting:
  DR: Cash                           $40.00
  DR: Digital Reward Liability       $15.00
  CR: Revenue                        $50.00
  CR: VAT Payable                    $5.00
```

**Corporate Tax**: 20% on breakage revenue (taxable income)

#### Singapore (9% GST)

**Issuance**: No GST (Multi-Purpose Voucher treatment)
**Redemption**: GST on product total (before digital reward discount)
**Breakage**: No GST

**Treatment**: Same as Cambodia, but 9% GST rate

**Example**:
```
Customer buys SGD 50 product using SGD 15 digital reward:
  Product Total:             SGD 50.00
  Digital Reward Applied:   -SGD 15.00
                            ----------
  Subtotal After Reward:     SGD 35.00
  GST (9% on SGD 50):        SGD 4.50
                            ----------
  Total Due (Cash):          SGD 39.50
```

**Corporate Tax**: 17% on breakage revenue

#### Philippines (VAT TBD)

**Important**: If expanding to Philippines, use loyalty rewards ONLY (not purchased gift cards).

**Issuance**: No VAT (loyalty program benefit)
**Redemption**: VAT on product total (rate TBD, typically 12%)
**Breakage**: No VAT

**Critical**: Loyalty rewards EXEMPT from Gift Check Act (no expiration prohibition).

---

### Financial Statement Disclosure

**Balance Sheet** (Liabilities):
```
Current Liabilities:
  Digital Reward Liability - USD        $10,000
  Digital Reward Liability - KHR        40,000,000 KHR
  Digital Reward Liability - SGD        SGD 5,000
```

**Income Statement** (Revenue):
```
Other Income:
  Breakage Revenue - Digital Rewards    $1,500
```

**Notes to Financial Statements**:
```
Note 12: Digital Reward Liability

The Company operates a loyalty program that issues digital rewards to customers.
Digital rewards are redeemable for goods and services at the Company's locations.

As of December 31, 2025, the Company has the following digital reward liabilities:
  - USD:      $10,000
  - KHR:      40,000,000 KHR (approx. $10,000 USD)
  - SGD:      SGD 5,000 (approx. $3,750 USD)

Digital rewards expire 12 months from issuance, with a 30-day grace period.
The Company recognizes breakage revenue when rewards become fully expired.

Breakage revenue recognized in 2025: $1,500 (15% of issued rewards).

The Company reviews breakage estimates quarterly based on historical redemption patterns.
```

---

## Testing Strategy

### Unit Tests

**Coverage Target**: 80% minimum, 100% for business logic

**Test Cases**:

1. **Issuance Logic**:
   - ✅ Issue digital reward with valid parameters
   - ✅ Calculate expiration date correctly (issued_at + 12 months)
   - ✅ Calculate grace period correctly (expires_at + 30 days)
   - ❌ Reject issuance with invalid amount (zero, negative)
   - ❌ Reject issuance with invalid currency
   - ❌ Reject issuance with non-existent customer

2. **Redemption Logic (FIFO)**:
   - ✅ Redeem single reward fully
   - ✅ Redeem single reward partially
   - ✅ Redeem multiple rewards in FIFO order (earliest expiration first)
   - ✅ Validate sufficient balance before redemption
   - ❌ Reject redemption with insufficient balance
   - ❌ Reject redemption with currency mismatch

3. **Expiration Logic**:
   - ✅ Transition `active` → `expired` at expiration date
   - ✅ Transition `expired` → `fully_expired` at grace period end
   - ✅ Send notifications at 30d, 7d, 1d before expiration
   - ✅ Recognize breakage revenue upon full expiration
   - ❌ Do not allow redemption of fully expired rewards
   - ✅ Allow redemption during grace period

4. **Multi-Currency Logic**:
   - ✅ Calculate separate balances per currency
   - ✅ Redeem rewards in matching currency only
   - ❌ Reject redemption with currency mismatch
   - ✅ Display balances grouped by currency

5. **Merchant Restriction Logic**:
   - ✅ Redeem generic reward at any merchant
   - ✅ Redeem merchant-specific reward at correct merchant
   - ❌ Reject merchant-specific reward at wrong merchant
   - ✅ Prioritize generic rewards over merchant-specific (optional business rule)

---

### Integration Tests

**Test Scenarios**:

1. **End-to-End Issuance Flow**:
   ```typescript
   it('should issue digital reward and notify customer', async () => {
     // 1. Issue reward
     const reward = await digitalRewardService.issue({
       customerId: 'cust_123',
       amount: 25.00,
       currency: 'USD',
       method: 'promotional'
     });

     // 2. Verify reward created in database
     const dbReward = await db.digitalRewards.findById(reward.id);
     expect(dbReward).toBeDefined();
     expect(dbReward.balance).toBe(25.00);

     // 3. Verify transaction logged
     const txn = await db.digitalRewardTransactions.findByRewardId(reward.id);
     expect(txn.transactionType).toBe('issued');
     expect(txn.amount).toBe(25.00);

     // 4. Verify accounting event published
     expect(eventBus.publish).toHaveBeenCalledWith(
       'DigitalReward.Issued',
       expect.objectContaining({ rewardId: reward.id })
     );

     // 5. Verify notification sent
     expect(notificationService.send).toHaveBeenCalledWith(
       expect.objectContaining({
         customerId: 'cust_123',
         template: 'digital_reward_issued'
       })
     );
   });
   ```

2. **End-to-End Redemption Flow**:
   ```typescript
   it('should redeem digital rewards in FIFO order at checkout', async () => {
     // Setup: Create 2 rewards (different expiration dates)
     const reward1 = await createReward({
       customerId: 'cust_123',
       amount: 10.00,
       expiresAt: '2026-10-01'  // Expires sooner
     });

     const reward2 = await createReward({
       customerId: 'cust_123',
       amount: 20.00,
       expiresAt: '2026-12-01'  // Expires later
     });

     // Action: Redeem $15
     const redemption = await digitalRewardService.redeem({
       customerId: 'cust_123',
       amount: 15.00,
       currency: 'USD',
       transactionId: 'order_xyz'
     });

     // Verify: FIFO order (reward1 fully depleted, reward2 partially used)
     expect(redemption.rewardsUsed).toEqual([
       { rewardId: reward1.id, amountUsed: 10.00, balanceRemaining: 0 },
       { rewardId: reward2.id, amountUsed: 5.00, balanceRemaining: 15.00 }
     ]);

     // Verify balances updated
     const updatedReward1 = await db.digitalRewards.findById(reward1.id);
     expect(updatedReward1.balance).toBe(0);

     const updatedReward2 = await db.digitalRewards.findById(reward2.id);
     expect(updatedReward2.balance).toBe(15.00);

     // Verify accounting event
     expect(eventBus.publish).toHaveBeenCalledWith(
       'DigitalReward.Redeemed',
       expect.objectContaining({ amount: 15.00 })
     );
   });
   ```

3. **Expiration Batch Job**:
   ```typescript
   it('should expire rewards and recognize breakage', async () => {
     // Setup: Create reward that expired 31 days ago (grace period ended)
     const expiredReward = await createReward({
       customerId: 'cust_123',
       amount: 10.00,
       expiresAt: sub(new Date(), { days: 31 }),  // Expired
       gracePeriodEndsAt: sub(new Date(), { days: 1 }),  // Grace period ended
       status: 'expired'
     });

     // Action: Run expiration batch job
     await expirationBatchJob.processExpirations();

     // Verify: Reward marked as fully_expired
     const updatedReward = await db.digitalRewards.findById(expiredReward.id);
     expect(updatedReward.status).toBe('fully_expired');
     expect(updatedReward.balance).toBe(0);

     // Verify: Breakage transaction created
     const breakageTxn = await db.digitalRewardTransactions.findOne({
       rewardId: expiredReward.id,
       transactionType: 'expired'
     });
     expect(breakageTxn).toBeDefined();
     expect(breakageTxn.amount).toBe(-10.00);

     // Verify: Accounting event published
     expect(eventBus.publish).toHaveBeenCalledWith(
       'DigitalReward.Expired',
       expect.objectContaining({ rewardId: expiredReward.id })
     );
   });
   ```

---

### Performance Tests

**Load Test Scenarios**:

1. **Balance Lookup** (100,000 requests):
   - Target: < 100ms (p95), < 50ms (p50)
   - Concurrency: 1,000 concurrent users
   - Cache hit rate: > 90%

2. **Redemption Processing** (10,000 redemptions):
   - Target: < 200ms (p95), < 100ms (p50)
   - Concurrency: 500 concurrent redemptions
   - ACID compliance: No double-spend or race conditions

3. **Bulk Issuance** (10,000 rewards):
   - Target: 1,000 rewards/minute minimum
   - Total time: < 10 minutes for 10,000 rewards
   - Failure rate: < 0.1%

---

### Compliance Tests

**Regulatory Validation**:

1. **Philippines Loyalty Exemption**:
   - ✅ Verify digital rewards structured as loyalty benefits (not purchased)
   - ✅ Verify expiration allowed (12 months + 30-day grace)
   - ✅ Verify clear terms of service (loyalty program language)

2. **Singapore Limited-Purpose Exemption**:
   - ✅ Verify rewards redeemable at specific merchants only (not general-purpose)
   - ✅ Verify no Payment Services Act licensing required

3. **ASEAN VAT/GST Compliance**:
   - ✅ Verify VAT/GST calculated on product total (before digital reward discount)
   - ✅ Verify customer pays VAT/GST separately (not included in digital reward)
   - ✅ Verify correct tax rates: Cambodia 10%, Singapore 9%

4. **IFRS 15 Accounting**:
   - ✅ Verify liability recognized at issuance
   - ✅ Verify revenue recognized at redemption
   - ✅ Verify breakage recognized at full expiration
   - ✅ Verify financial statement disclosures

---

## Success Metrics

### Business Metrics

**Issuance**:
- **Digital Rewards Issued**: 10,000 rewards/month (target Year 1)
- **Total Value Issued**: $50,000 USD equivalent/month
- **Issuance Methods**: 40% promotional, 30% campaign, 20% referral, 10% partner

**Redemption**:
- **Redemption Rate**: 70% (industry target: 60-80%)
- **Average Time to Redemption**: 45 days
- **Multi-Tender Usage**: 30% of transactions use digital reward + another payment method

**Customer Engagement**:
- **Active Customers with Balances**: 5,000 customers
- **Repeat Redemption Rate**: 40% (customers who redeem multiple times)
- **Wallet App Usage**: 60% of customers check balance monthly

**Breakage**:
- **Breakage Rate**: 15% (initial estimate, adjust quarterly)
- **Breakage Revenue**: $7,500 USD/month (15% of $50,000 issued)
- **Expiration Reminder Effectiveness**: 20% reduction in breakage with reminders

---

### Technical Metrics

**Performance**:
- **Balance Lookup Latency**: < 100ms (p95)
- **Redemption Latency**: < 200ms (p95)
- **Issuance Latency**: < 300ms (p95)
- **Cache Hit Rate**: > 90% (Redis)

**Reliability**:
- **Uptime**: 99.9% (8.76 hours downtime/year max)
- **Data Accuracy**: 100% (zero balance discrepancies)
- **Transaction Atomicity**: 100% (no double-spend or lost redemptions)

**Scalability**:
- **Concurrent Users**: Support 10,000 concurrent balance checks
- **Bulk Issuance**: 1,000 rewards/minute
- **Database Growth**: Plan for 100 million reward records (5 years)

---

### Compliance Metrics

**Regulatory**:
- **Audit Trail Completeness**: 100% (all transactions logged)
- **Data Retention**: 7 years (accounting records)
- **Financial Reconciliation**: Daily (liability balance matches database)

**Accounting**:
- **Liability Accuracy**: 100% (balance sheet matches database)
- **Breakage Recognition**: Quarterly review and adjustment
- **VAT/GST Compliance**: 100% (correct rates applied)

---

## Appendix

### Glossary

**Digital Reward**: Cash-equivalent loyalty program benefit redeemable for goods/services. Issued as promotional credits, referral bonuses, or campaign rewards.

**DIGITAL_GIFT Reward Type**: Existing reward type in NxLoy reward catalog. Used to implement digital rewards.

**Breakage**: Unredeemed digital rewards that expire (grace period ends). Recognized as revenue under IFRS 15.

**FIFO Redemption**: First-In-First-Out order. Redeem rewards with earliest expiration date first.

**Multi-Tender Payment**: Combining multiple payment methods (digital reward + points + cash) in single transaction.

**Grace Period**: 30-day period after expiration where customer can still redeem reward (customer-friendly policy).

**Loyalty Program Structure**: Positioning digital rewards as loyalty benefits (earned, not purchased) to maximize ASEAN compliance exemptions.

---

### Related Documents

**Compliance**:
- `/docs/requirements/features/gift-cards/COMPLIANCE.md` (v2.0.0) - Detailed ASEAN compliance analysis
- `/docs/compliance/ASEAN-GIFT-CARD-STORE-CREDIT-REGULATIONS.md` - 1,352-line regulatory research

**Feature Specs**:
- `/docs/requirements/features/store-credit/FEATURE-SPEC.md` - Store credit specification (CASHBACK reward type)
- `/docs/requirements/features/unified-wallet/FEATURE-SPEC.md` - Unified wallet specification (coming next)

**Compliance Summary**:
- `/docs/requirements/features/unified-wallet/COMPLIANCE-SUMMARY.md` - Executive summary of ASEAN compliance

**Domain Model** (to be updated):
- `/docs/requirements/domain-specs/loyalty/ENTITIES.md`
- `/docs/requirements/domain-specs/loyalty/VALUE-OBJECTS.md`
- `/docs/requirements/domain-specs/loyalty/AGGREGATES.md`
- `/docs/requirements/domain-specs/loyalty/BUSINESS-RULES.md`

---

**Document Prepared By**: Claude (NxLoy Documentation Assistant)
**Review Status**: Ready for Product & Legal Review
**Next Review**: 2026-01-09 or upon regulatory changes
**Implementation Target**: Phase 1 (Cambodia Launch, Months 1-3)
