# Unified Wallet Feature Specification

**Document Version**: 1.0.0
**Last Updated**: 2025-11-09
**Status**: Draft
**Owner**: Product Team
**Compliance Review**: Required before implementation

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

### What Is the Unified Wallet?

The **Unified Wallet** is a single, consolidated view of all customer loyalty assets within the NxLoy platform:

- **Loyalty Points**: Non-cash rewards earned through purchases, engagement
- **Store Credit**: Cash-equivalent credits from cashback, refunds (CASHBACK reward type)
- **Digital Rewards**: Promotional credits, referral bonuses (DIGITAL_GIFT reward type)

### Key Benefits

**For Customers**:
- ✅ Single place to view all loyalty assets
- ✅ Flexible redemption (combine multiple balance types in one transaction)
- ✅ Clear visibility into expiration dates and balances
- ✅ Multi-currency support (USD, KHR, SGD)

**For Businesses**:
- ✅ Unified customer experience across channels (web, mobile, POS)
- ✅ Simplified balance management (one API for all balance types)
- ✅ Enhanced customer engagement (visibility drives usage)
- ✅ Better financial tracking (consolidated liability reporting)

**For NxLoy Platform**:
- ✅ Consistent architecture across balance types
- ✅ Easier multi-tenant management
- ✅ Scalable for future balance types (subscriptions, NFTs, etc.)

### Vision

**"One wallet, infinite possibilities"** - Customers manage all loyalty assets in a single, intuitive interface, with flexible redemption options that maximize value.

---

## Strategic Positioning

### Business Context

**NxLoy is Cambodia-based with expansion to Singapore and ASEAN markets.**

The unified wallet serves as the **central hub** for customer loyalty engagement, replacing fragmented balance tracking across multiple systems.

### Architecture Decision: Unified vs. Federated

**Decision**: **Unified Wallet with Federated Data Sources**

**Rationale**:
- ✅ **Single API**: `/api/v1/wallet/balance/{customer_id}` returns all balance types
- ✅ **Consistent UX**: Same interface for points, store credit, digital rewards
- ✅ **Federated Data**: Each balance type managed by specialized service (Points Service, Store Credit Service, Digital Reward Service)
- ✅ **Aggregation Layer**: Wallet Service aggregates balances from underlying services
- ✅ **Scalability**: Add new balance types without changing customer-facing API

**Alternative Considered**: Separate APIs per balance type (rejected - poor UX, fragmented data)

### ASEAN Compliance Alignment

The unified wallet maintains compliance advantages by structuring all balances as **loyalty program benefits**:

- **Store Credit**: CASHBACK reward type (not purchased, earned as cashback/refund)
- **Digital Rewards**: DIGITAL_GIFT reward type (promotional, not purchased)
- **Points**: Traditional loyalty points (earned, not purchased)

**Key Compliance Benefit**: All balance types exempt from gift card regulations in Philippines, Singapore, Cambodia.

**See**: `/docs/requirements/features/unified-wallet/COMPLIANCE-SUMMARY.md` for executive summary.

---

## User Stories

### Epic 1: Unified Balance View

**UW-US-001: View All Balances in One Place**
- **As a**: Customer
- **I want to**: See all my loyalty assets (points, store credit, digital rewards) in one wallet
- **So that**: I understand my total value and can decide how to redeem
- **Acceptance Criteria**:
  - Display total value across all balance types (converted to customer's preferred currency)
  - Show individual balances by type (points, store credit, digital rewards)
  - Display balances by currency (USD, KHR, SGD)
  - Highlight soonest-to-expire balances
  - Show transaction history across all balance types
  - Real-time balance updates (< 1 second latency)

**UW-US-002: Multi-Currency Balance Display**
- **As a**: Customer in multiple countries
- **I want to**: See my wallet balances in different currencies (USD, KHR, SGD)
- **So that**: I can use the right currency in each location
- **Acceptance Criteria**:
  - Group balances by currency
  - Display exchange rate reference (informational only, no conversion)
  - Show total value in customer's preferred currency
  - Highlight which balances are usable in current location

**UW-US-003: Expiration Dashboard**
- **As a**: Customer
- **I want to**: See which balances are expiring soon
- **So that**: I can use them before losing value
- **Acceptance Criteria**:
  - Display balances expiring within 30 days (sorted by soonest first)
  - Show countdown (e.g., "23 days remaining")
  - Highlight grace period balances (already expired but still usable)
  - Send notifications at 30d, 7d, 1d before expiration

### Epic 2: Multi-Tender Redemption

**UW-US-004: Combine Multiple Payment Methods**
- **As a**: Customer
- **I want to**: Pay using points + store credit + digital rewards + cash in one transaction
- **So that**: I can maximize my loyalty value and minimize out-of-pocket cost
- **Acceptance Criteria**:
  - Select multiple payment methods at checkout
  - Configure payment order/priority (e.g., use digital rewards first, then store credit, then points, then cash)
  - Display real-time payment breakdown as customer adjusts amounts
  - Support partial balance usage (don't have to use entire balance)
  - VAT/GST calculated correctly (on product total, not reduced by loyalty assets)
  - Receipt shows itemized breakdown by payment method

**UW-US-005: Automatic Optimal Redemption**
- **As a**: Customer
- **I want to**: Option to automatically apply balances optimally
- **So that**: I don't have to manually calculate the best combination
- **Acceptance Criteria**:
  - "Optimize Redemption" button at checkout
  - System calculates optimal balance usage:
    - Use soonest-to-expire balances first
    - Use cash-equivalent balances (store credit, digital rewards) before points
    - Minimize cash payment
  - Display proposed breakdown for customer approval
  - Customer can override and manually adjust

**UW-US-006: Depletion Order Configuration**
- **As a**: Business owner
- **I want to**: Configure the default order in which balances are depleted
- **So that**: I can optimize for customer experience or business goals
- **Acceptance Criteria**:
  - Admin portal: Configure depletion order (e.g., "Digital Rewards → Store Credit → Points → Cash")
  - Customer can override default order at checkout
  - Depletion order respects expiration (soonest-to-expire within each type first)
  - Apply business rules (e.g., minimum points redemption threshold)

### Epic 3: Transaction History & Reporting

**UW-US-007: Unified Transaction History**
- **As a**: Customer
- **I want to**: See all transactions across all balance types in one place
- **So that**: I can track how I earned and spent my loyalty assets
- **Acceptance Criteria**:
  - Display transactions for points, store credit, digital rewards
  - Filter by balance type, transaction type (earned, redeemed, expired, transferred)
  - Filter by date range
  - Search by transaction ID or description
  - Export transaction history (CSV, PDF)
  - Pagination (50 transactions per page)

**UW-US-008: Balance Reconciliation Report (Admin)**
- **As a**: Finance manager
- **I want to**: Generate balance reconciliation report across all balance types
- **So that**: I can verify liability accuracy for financial statements
- **Acceptance Criteria**:
  - Report shows total liability by balance type and currency
  - Compare wallet balances to accounting system balances
  - Highlight discrepancies (if any)
  - Downloadable report (PDF, Excel)
  - Scheduled reports (daily, weekly, monthly)

### Epic 4: Cross-Platform Sync

**UW-US-009: Real-Time Sync Across Devices**
- **As a**: Customer using web and mobile apps
- **I want to**: See consistent balances across all devices instantly
- **So that**: I can trust my wallet regardless of where I access it
- **Acceptance Criteria**:
  - Balance updates propagate to all devices within 1 second
  - WebSocket or Server-Sent Events for real-time updates
  - Offline mode: Show last known balance + "syncing" indicator
  - Automatic sync when connection restored
  - No stale data displayed

**UW-US-010: POS Integration**
- **As a**: Cashier at merchant location
- **I want to**: Access customer wallet balances at POS checkout
- **So that**: Customer can redeem loyalty assets in-store
- **Acceptance Criteria**:
  - POS system queries wallet API by customer ID or phone number
  - Display all available balances (points, store credit, digital rewards)
  - Support multi-tender redemption at POS
  - Print receipt with loyalty balance breakdown
  - Offline mode: Queue redemptions for sync when online

---

## Functional Requirements

### FR-UW-001: Balance Aggregation
**Priority**: P0 (Must Have)

**Description**: System must aggregate balances from multiple services (Points, Store Credit, Digital Rewards) into unified view.

**Sub-Requirements**:
- FR-UW-001.1: Query Points Service for active points balance
- FR-UW-001.2: Query Store Credit Service for active credit balance (by currency)
- FR-UW-001.3: Query Digital Reward Service for active reward balance (by currency)
- FR-UW-001.4: Aggregate balances into unified response within 100ms (p95)
- FR-UW-001.5: Cache aggregated balances in Redis (TTL: 5 minutes)
- FR-UW-001.6: Invalidate cache on balance changes (event-driven)
- FR-UW-001.7: Support multi-currency aggregation (USD, KHR, SGD)

**API Contract**:
```typescript
GET /api/v1/wallet/balance/{customer_id}

Response:
{
  "customer_id": "cust_123",
  "points": {
    "balance": 1500,
    "expiring_soon": 200,  // Points expiring within 30 days
    "value_usd": 15.00     // Estimated cash value (1 point = $0.01)
  },
  "store_credit": {
    "balances": [
      { "currency": "USD", "balance": 45.00, "expiring_soon": 10.00 },
      { "currency": "KHR", "balance": 40000, "expiring_soon": 0 }
    ]
  },
  "digital_rewards": {
    "balances": [
      { "currency": "USD", "balance": 25.00, "expiring_soon": 25.00 },
      { "currency": "SGD", "balance": 15.00, "expiring_soon": 0 }
    ]
  },
  "total_value_usd": 100.00  // Approximate total value in USD
}
```

**Dependencies**:
- Points Service
- Store Credit Service
- Digital Reward Service
- Redis (caching)

### FR-UW-002: Multi-Tender Redemption
**Priority**: P0 (Must Have)

**Description**: System must support combining multiple balance types in single transaction.

**Sub-Requirements**:
- FR-UW-002.1: Accept payment split across points, store credit, digital rewards, cash
- FR-UW-002.2: Validate sufficient balance across all selected payment methods
- FR-UW-002.3: Execute redemptions atomically (all succeed or all fail)
- FR-UW-002.4: Apply depletion order (configurable business rule)
- FR-UW-002.5: Calculate VAT/GST correctly (on product total, before loyalty deductions)
- FR-UW-002.6: Generate unified receipt showing all payment methods
- FR-UW-002.7: Support reversal/refund across all payment methods

**Transaction Flow**:
```typescript
POST /api/v1/wallet/redeem

Request:
{
  "customer_id": "cust_123",
  "transaction_id": "order_xyz789",
  "cart_total": 100.00,
  "currency": "USD",
  "vat_rate": 0.10,
  "payment_methods": [
    { "type": "digital_rewards", "amount": 25.00 },
    { "type": "store_credit", "amount": 20.00 },
    { "type": "points", "points": 1000, "value": 10.00 },
    { "type": "cash", "amount": 55.00 }  // Includes VAT
  ]
}

Response:
{
  "redemption_id": "redemption_abc123",
  "breakdown": {
    "cart_total": 100.00,
    "digital_rewards_applied": 25.00,
    "store_credit_applied": 20.00,
    "points_applied": 10.00,
    "subtotal_after_loyalty": 45.00,
    "vat": 10.00,  // 10% of original $100
    "total_cash_due": 55.00  // $45 + $10 VAT
  },
  "balances_remaining": {
    "points": 500,
    "store_credit_usd": 25.00,
    "digital_rewards_usd": 0
  }
}
```

**Error Handling**:
- Insufficient balance in any payment method → 400 Bad Request
- Currency mismatch → 400 Bad Request
- Concurrent redemption (race condition) → 409 Conflict (retry)
- Service unavailable (Points Service down) → 503 Service Unavailable

### FR-UW-003: Real-Time Sync
**Priority**: P0 (Must Have)

**Description**: System must synchronize wallet balances across all customer touchpoints in real-time.

**Sub-Requirements**:
- FR-UW-003.1: WebSocket or Server-Sent Events for real-time updates
- FR-UW-003.2: Publish balance change events on Redis Pub/Sub or RabbitMQ
- FR-UW-003.3: Connected clients receive updates within 1 second
- FR-UW-003.4: Support offline mode (show last synced balance + indicator)
- FR-UW-003.5: Automatic reconnection and balance refresh
- FR-UW-003.6: Optimistic UI updates (immediate feedback, rollback on error)

**Event Flow**:
```typescript
// Customer redeems store credit on mobile app
1. Mobile app sends redemption request
2. Store Credit Service processes redemption
3. Store Credit Service publishes event: "StoreCredit.Redeemed"
4. Wallet Service listens to event
5. Wallet Service invalidates cache for customer_id
6. Wallet Service broadcasts update via WebSocket to all connected clients
7. Web app, mobile app, POS receive balance update within 1 second
```

**WebSocket Message Format**:
```typescript
{
  "event": "wallet.balance_updated",
  "customer_id": "cust_123",
  "timestamp": "2025-11-09T10:30:00Z",
  "changes": {
    "store_credit_usd": {
      "old_balance": 45.00,
      "new_balance": 25.00,
      "change": -20.00
    }
  }
}
```

### FR-UW-004: Transaction History
**Priority**: P1 (Should Have)

**Description**: System must provide unified transaction history across all balance types.

**Sub-Requirements**:
- FR-UW-004.1: Query transactions from Points, Store Credit, Digital Reward services
- FR-UW-004.2: Merge and sort by timestamp (descending)
- FR-UW-004.3: Filter by balance type, transaction type, date range
- FR-UW-004.4: Pagination (50 transactions per page, max 200)
- FR-UW-004.5: Export to CSV, PDF
- FR-UW-004.6: Search by transaction ID, description, amount

**API Contract**:
```typescript
GET /api/v1/wallet/history/{customer_id}?type=store_credit&start_date=2025-01-01&limit=50

Response:
{
  "customer_id": "cust_123",
  "total_count": 245,
  "transactions": [
    {
      "id": "txn_001",
      "balance_type": "store_credit",
      "transaction_type": "redeemed",
      "amount": -20.00,
      "currency": "USD",
      "balance_after": 25.00,
      "description": "Redeemed at Merchant A",
      "timestamp": "2025-11-09T14:30:00Z",
      "metadata": { "order_id": "order_xyz789" }
    },
    {
      "id": "txn_002",
      "balance_type": "digital_rewards",
      "transaction_type": "issued",
      "amount": 25.00,
      "currency": "USD",
      "balance_after": 25.00,
      "description": "Welcome bonus",
      "timestamp": "2025-11-09T10:00:00Z",
      "metadata": { "campaign_id": "welcome2025" }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

### FR-UW-005: Depletion Order Configuration
**Priority**: P1 (Should Have)

**Description**: System must support configurable depletion order for multi-tender redemptions.

**Sub-Requirements**:
- FR-UW-005.1: Admin configures default depletion order per business
- FR-UW-005.2: Customer can override default order at checkout
- FR-UW-005.3: Within each balance type, deplete soonest-to-expire first (FIFO)
- FR-UW-005.4: Support complex rules (e.g., "Use digital rewards first, unless expiring points exist")
- FR-UW-005.5: Validate depletion order against business rules (e.g., minimum redemption thresholds)

**Configuration Example**:
```typescript
// Business configuration
{
  "business_id": "biz_123",
  "depletion_order": [
    {
      "type": "digital_rewards",
      "priority": 1,
      "conditions": {
        "min_transaction_amount": 10.00  // Only use if transaction >= $10
      }
    },
    {
      "type": "store_credit",
      "priority": 2
    },
    {
      "type": "points",
      "priority": 3,
      "conditions": {
        "min_redemption_points": 100  // Only use if redeeming >= 100 points
      }
    },
    {
      "type": "cash",
      "priority": 4
    }
  ],
  "expiration_override": true  // If true, use expiring balances first regardless of priority
}
```

### FR-UW-006: Liability Reporting
**Priority**: P1 (Should Have)

**Description**: System must provide financial reconciliation reports for accounting compliance.

**Sub-Requirements**:
- FR-UW-006.1: Calculate total liability across all balance types and currencies
- FR-UW-006.2: Compare wallet balances to accounting system balances
- FR-UW-006.3: Highlight discrepancies (if any) with drill-down capability
- FR-UW-006.4: Support scheduled reports (daily, weekly, monthly)
- FR-UW-006.5: Export to PDF, Excel
- FR-UW-006.6: Audit trail for all balance changes

**Report Structure**:
```typescript
{
  "business_id": "biz_123",
  "report_date": "2025-11-09",
  "period": "2025-11-01 to 2025-11-09",
  "liabilities": {
    "points": {
      "total_points": 1500000,
      "estimated_value_usd": 15000.00,
      "accounting_liability_usd": 15000.00,
      "variance_usd": 0
    },
    "store_credit": {
      "usd": { "balance": 50000.00, "accounting_liability": 50000.00, "variance": 0 },
      "khr": { "balance": 200000000, "accounting_liability": 200000000, "variance": 0 },
      "sgd": { "balance": 10000.00, "accounting_liability": 10000.00, "variance": 0 }
    },
    "digital_rewards": {
      "usd": { "balance": 25000.00, "accounting_liability": 25000.00, "variance": 0 },
      "sgd": { "balance": 5000.00, "accounting_liability": 5000.00, "variance": 0 }
    }
  },
  "total_liability_usd": 155000.00,  // Approximate, converted to USD
  "discrepancies": []
}
```

---

## Non-Functional Requirements

### Performance
- **Balance Lookup**: < 100ms (p95), < 50ms (p50)
- **Multi-Tender Redemption**: < 300ms (p95), < 150ms (p50)
- **Real-Time Update Propagation**: < 1 second from source event to client notification
- **Transaction History Query**: < 200ms (p95) for 50 transactions
- **Concurrent Users**: Support 10,000 concurrent wallet balance checks

### Reliability
- **Uptime**: 99.9% availability (8.76 hours downtime/year max)
- **Data Consistency**: Eventual consistency (1 second max) across services
- **Transaction Atomicity**: Multi-tender redemptions are atomic (all succeed or all fail)
- **Disaster Recovery**: RPO < 1 hour, RTO < 4 hours

### Security
- **Authentication**: OAuth 2.0 + JWT for API access
- **Authorization**: RBAC (customer can only access own wallet, admin can access all)
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Audit Logging**: All wallet transactions logged with user identity and IP address
- **Fraud Prevention**: Rate limiting (max 10 balance queries/minute per customer)
- **PCI Compliance**: Not required (no card data stored)

### Scalability
- **Database**: Horizontal scaling via read replicas (PostgreSQL)
- **Caching**: Redis cluster for balance lookups (90%+ hit rate)
- **Event Streaming**: RabbitMQ/Kafka for asynchronous processing
- **Sharding**: Support multi-tenant partitioning by `business_id`
- **Microservices**: Independent scaling of Points, Store Credit, Digital Reward services

### Compliance
- **IFRS 15**: Revenue recognition for all balance types
- **ASEAN VAT/GST**: Tax at redemption (Cambodia 10%, Singapore 9%)
- **Data Retention**: 7 years minimum (accounting records)
- **Multi-Jurisdiction**: Cambodia, Singapore, Vietnam, Thailand, Malaysia support
- **Privacy**: GDPR-ready (data export, deletion upon request)

---

## Technical Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                      Client Applications                           │
│   (Next.js Web, React Native Mobile, POS Terminals)               │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS)                            │
│  - Authentication (OAuth 2.0 + JWT)                                │
│  - Rate Limiting (10 requests/min per customer)                   │
│  - Request Validation                                              │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                   Wallet Service (NestJS)                          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │         Wallet Aggregation Layer                             │ │
│  │  - Balance Aggregation      - Multi-Tender Orchestration     │ │
│  │  - Transaction History      - Real-Time Sync                 │ │
│  │  - Depletion Order Logic    - Liability Reporting            │ │
│  └───────┬──────────────────────────────────────────────┬────────┘ │
└──────────┼──────────────────────────────────────────────┼──────────┘
           │                                              │
           ▼                                              ▼
┌──────────────────────┐                      ┌─────────────────────┐
│  Cache Layer (Redis) │                      │  Event Bus          │
│  - Balance Cache     │                      │  (RabbitMQ/Kafka)   │
│  - TTL: 5 minutes    │                      │  - Balance Updates  │
│  - Pub/Sub for       │                      │  - WebSocket Relay  │
│    real-time updates │                      └─────────────────────┘
└──────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Underlying Services                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────────┐ │
│  │  Points Service │  │ Store Credit    │  │ Digital Reward     │ │
│  │                 │  │ Service         │  │ Service            │ │
│  │  - Points       │  │ - Credit        │  │ - Reward           │ │
│  │    Balance      │  │   Balance       │  │   Balance          │ │
│  │  - Earn/Redeem  │  │ - Issue/Redeem  │  │ - Issue/Redeem     │ │
│  │  - Expiration   │  │ - Expiration    │  │ - Expiration       │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬───────────┘ │
└───────────┼────────────────────┼──────────────────────┼────────────┘
            │                    │                      │
            ▼                    ▼                      ▼
┌────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                           │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐    │
│  │ points       │  │ store_credits │  │ digital_rewards      │    │
│  │ transactions │  │ transactions  │  │ transactions         │    │
│  └──────────────┘  └───────────────┘  └──────────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
            │                    │                      │
            └────────────────────┴──────────────────────┘
                                 │
                                 ▼
                   ┌──────────────────────────┐
                   │  Accounting Service      │
                   │  - Liability Tracking    │
                   │  - Breakage Revenue      │
                   │  - IFRS 15 Compliance    │
                   └──────────────────────────┘
```

### Service Responsibilities

**Wallet Service** (Aggregation Layer):
- Aggregate balances from Points, Store Credit, Digital Reward services
- Orchestrate multi-tender redemptions (coordinate across services)
- Manage real-time sync (WebSocket broadcasting)
- Provide unified transaction history
- Handle depletion order logic
- Generate liability reports

**Points Service** (Existing):
- Manage loyalty points balance
- Handle points earning and redemption
- Process points expiration

**Store Credit Service** (New):
- Manage store credit balance (CASHBACK reward type)
- Handle credit issuance and redemption
- Process credit expiration
- Multi-currency support

**Digital Reward Service** (New):
- Manage digital reward balance (DIGITAL_GIFT reward type)
- Handle reward issuance and redemption
- Process reward expiration
- Multi-currency support
- Merchant-specific redemption validation

**Accounting Service**:
- Track liabilities for all balance types
- Generate financial reports
- Recognize breakage revenue
- IFRS 15 compliance

### Data Flow: Multi-Tender Redemption

```typescript
// Example: Customer pays with digital rewards + store credit + points + cash

1. Customer initiates checkout
   - Cart total: $100 USD
   - VAT rate: 10%

2. Wallet Service receives redemption request
   POST /api/v1/wallet/redeem
   {
     "customer_id": "cust_123",
     "cart_total": 100.00,
     "currency": "USD",
     "vat_rate": 0.10,
     "payment_methods": [
       { "type": "digital_rewards", "amount": 25.00 },
       { "type": "store_credit", "amount": 20.00 },
       { "type": "points", "points": 1000, "value": 10.00 }
     ]
   }

3. Wallet Service validates balances (parallel queries)
   - Query Digital Reward Service: Has $25 USD digital rewards?
   - Query Store Credit Service: Has $20 USD store credit?
   - Query Points Service: Has 1000 points?

4. All balances sufficient → Proceed with redemption
   4a. Start distributed transaction (Saga pattern or 2PC)
   4b. Digital Reward Service: Redeem $25 USD
   4c. Store Credit Service: Redeem $20 USD
   4d. Points Service: Redeem 1000 points
   4e. Commit all redemptions atomically

5. Calculate final payment breakdown
   - Cart total: $100.00
   - Digital rewards applied: -$25.00
   - Store credit applied: -$20.00
   - Points applied: -$10.00
   - Subtotal after loyalty: $45.00
   - VAT (10% of $100): $10.00
   - Total cash due: $55.00

6. Collect cash payment ($55.00)

7. Emit events for accounting
   - DigitalReward.Redeemed ($25)
   - StoreCredit.Redeemed ($20)
   - Points.Redeemed (1000 points)

8. Invalidate cache and broadcast balance updates
   - Redis: Delete cached balance for cust_123
   - WebSocket: Broadcast balance update to all connected clients

9. Return success response with breakdown
```

---

## API Contracts

### 1. Get Unified Wallet Balance

**Endpoint**: `GET /api/v1/wallet/balance/{customer_id}`

**Query Parameters**:
```typescript
interface GetBalanceQuery {
  include_expired?: boolean;  // Default: false
  preferred_currency?: 'USD' | 'KHR' | 'SGD';  // For total value calculation
}
```

**Response (200 OK)**:
```typescript
interface WalletBalanceResponse {
  customer_id: string;
  last_updated: string;  // ISO 8601 timestamp

  points: {
    balance: number;
    expiring_soon: number;  // Points expiring within 30 days
    expiring_soon_details: Array<{
      amount: number;
      expires_at: string;
      days_remaining: number;
    }>;
    value_usd: number;  // Estimated cash value (configurable conversion rate)
  };

  store_credit: {
    balances: Array<{
      currency: string;
      balance: number;
      expiring_soon: number;
      expiring_soon_details: Array<{
        amount: number;
        expires_at: string;
        days_remaining: number;
      }>;
    }>;
  };

  digital_rewards: {
    balances: Array<{
      currency: string;
      balance: number;
      expiring_soon: number;
      expiring_soon_details: Array<{
        amount: number;
        expires_at: string;
        days_remaining: number;
      }>;
    }>;
  };

  total_value: {
    usd: number;  // Approximate total value converted to USD
    preferred_currency: string;  // From query param
    preferred_currency_value: number;
  };
}
```

**Example Response**:
```json
{
  "customer_id": "cust_123",
  "last_updated": "2025-11-09T10:30:00Z",
  "points": {
    "balance": 1500,
    "expiring_soon": 200,
    "expiring_soon_details": [
      {
        "amount": 200,
        "expires_at": "2025-12-01T00:00:00Z",
        "days_remaining": 22
      }
    ],
    "value_usd": 15.00
  },
  "store_credit": {
    "balances": [
      {
        "currency": "USD",
        "balance": 45.00,
        "expiring_soon": 10.00,
        "expiring_soon_details": [
          {
            "amount": 10.00,
            "expires_at": "2025-11-20T10:30:00Z",
            "days_remaining": 11
          }
        ]
      },
      {
        "currency": "KHR",
        "balance": 40000,
        "expiring_soon": 0,
        "expiring_soon_details": []
      }
    ]
  },
  "digital_rewards": {
    "balances": [
      {
        "currency": "USD",
        "balance": 25.00,
        "expiring_soon": 25.00,
        "expiring_soon_details": [
          {
            "amount": 25.00,
            "expires_at": "2025-11-15T10:00:00Z",
            "days_remaining": 6
          }
        ]
      }
    ]
  },
  "total_value": {
    "usd": 95.00,
    "preferred_currency": "USD",
    "preferred_currency_value": 95.00
  }
}
```

**Caching Strategy**:
- Cache balance in Redis with 5-minute TTL
- Invalidate cache on any balance change (event-driven)
- Cache key: `wallet:balance:${customer_id}`

**Errors**:
- `404 Not Found`: Customer not found
- `403 Forbidden`: User not authorized to view this wallet
- `503 Service Unavailable`: Underlying service (Points, Store Credit, Digital Reward) unavailable

---

### 2. Multi-Tender Redemption

**Endpoint**: `POST /api/v1/wallet/redeem`

**Request**:
```typescript
interface WalletRedemptionRequest {
  customer_id: string;
  transaction_id: string;  // External transaction reference (e.g., order_id)
  cart_total: number;
  currency: 'USD' | 'KHR' | 'SGD';
  vat_rate: number;  // e.g., 0.10 for 10% VAT
  merchant_id?: string;  // Optional for merchant-specific validation

  payment_methods: Array<{
    type: 'points' | 'store_credit' | 'digital_rewards' | 'cash';
    amount?: number;  // For store_credit, digital_rewards, cash
    points?: number;  // For points
    value?: number;   // For points (cash equivalent value)
  }>;

  depletion_override?: Array<string>;  // Optional custom depletion order
  metadata?: Record<string, any>;
}
```

**Example Request**:
```json
{
  "customer_id": "cust_123",
  "transaction_id": "order_xyz789",
  "cart_total": 100.00,
  "currency": "USD",
  "vat_rate": 0.10,
  "merchant_id": "merchant_main_store",
  "payment_methods": [
    { "type": "digital_rewards", "amount": 25.00 },
    { "type": "store_credit", "amount": 20.00 },
    { "type": "points", "points": 1000, "value": 10.00 },
    { "type": "cash", "amount": 55.00 }
  ],
  "metadata": {
    "cart_items": ["product_1", "product_2"],
    "channel": "mobile_app"
  }
}
```

**Response (200 OK)**:
```typescript
interface WalletRedemptionResponse {
  redemption_id: string;
  customer_id: string;
  transaction_id: string;

  breakdown: {
    cart_total: number;
    digital_rewards_applied: number;
    store_credit_applied: number;
    points_applied: number;  // Cash value
    subtotal_after_loyalty: number;
    vat: number;
    total_cash_due: number;
  };

  redemptions: Array<{
    type: string;
    amount: number;
    service_redemption_id: string;  // Underlying service's redemption ID
  }>;

  balances_remaining: {
    points: number;
    store_credit: Record<string, number>;  // By currency
    digital_rewards: Record<string, number>;  // By currency
  };

  redeemed_at: string;  // ISO 8601 timestamp
  metadata?: Record<string, any>;
}
```

**Example Response**:
```json
{
  "redemption_id": "redemption_abc123",
  "customer_id": "cust_123",
  "transaction_id": "order_xyz789",
  "breakdown": {
    "cart_total": 100.00,
    "digital_rewards_applied": 25.00,
    "store_credit_applied": 20.00,
    "points_applied": 10.00,
    "subtotal_after_loyalty": 45.00,
    "vat": 10.00,
    "total_cash_due": 55.00
  },
  "redemptions": [
    {
      "type": "digital_rewards",
      "amount": 25.00,
      "service_redemption_id": "dr_redemption_001"
    },
    {
      "type": "store_credit",
      "amount": 20.00,
      "service_redemption_id": "sc_redemption_002"
    },
    {
      "type": "points",
      "amount": 10.00,
      "service_redemption_id": "pts_redemption_003"
    }
  ],
  "balances_remaining": {
    "points": 500,
    "store_credit": { "USD": 25.00, "KHR": 40000 },
    "digital_rewards": { "USD": 0 }
  },
  "redeemed_at": "2025-11-09T14:45:00Z",
  "metadata": {
    "cart_items": ["product_1", "product_2"],
    "channel": "mobile_app"
  }
}
```

**Transaction Atomicity** (Saga Pattern):
```typescript
class WalletRedemptionSaga {
  async execute(request: WalletRedemptionRequest): Promise<WalletRedemptionResponse> {
    const compensations: Array<() => Promise<void>> = [];

    try {
      // Step 1: Redeem digital rewards
      if (request.payment_methods.find(pm => pm.type === 'digital_rewards')) {
        const drRedemption = await this.digitalRewardService.redeem({...});
        compensations.push(async () => {
          await this.digitalRewardService.reverseRedemption(drRedemption.id);
        });
      }

      // Step 2: Redeem store credit
      if (request.payment_methods.find(pm => pm.type === 'store_credit')) {
        const scRedemption = await this.storeCreditService.redeem({...});
        compensations.push(async () => {
          await this.storeCreditService.reverseRedemption(scRedemption.id);
        });
      }

      // Step 3: Redeem points
      if (request.payment_methods.find(pm => pm.type === 'points')) {
        const ptsRedemption = await this.pointsService.redeem({...});
        compensations.push(async () => {
          await this.pointsService.reverseRedemption(ptsRedemption.id);
        });
      }

      // All succeeded → Return success
      return { redemption_id, breakdown, ... };

    } catch (error) {
      // Any step failed → Execute compensations (rollback)
      for (const compensate of compensations.reverse()) {
        await compensate();
      }
      throw error;
    }
  }
}
```

**Errors**:
- `400 Bad Request`: Invalid request (negative amounts, currency mismatch, etc.)
- `404 Not Found`: Customer not found
- `422 Unprocessable Entity`: Insufficient balance in any payment method
- `409 Conflict`: Concurrent redemption detected (retry with exponential backoff)
- `503 Service Unavailable`: Underlying service unavailable

---

### 3. Get Unified Transaction History

**Endpoint**: `GET /api/v1/wallet/history/{customer_id}`

**Query Parameters**:
```typescript
interface GetHistoryQuery {
  balance_type?: 'points' | 'store_credit' | 'digital_rewards';  // Optional filter
  transaction_type?: 'earned' | 'issued' | 'redeemed' | 'expired' | 'extended';  // Optional filter
  start_date?: string;  // ISO 8601 (e.g., 2025-01-01)
  end_date?: string;    // ISO 8601 (e.g., 2025-12-31)
  currency?: 'USD' | 'KHR' | 'SGD';  // Optional filter (for store_credit, digital_rewards)
  limit?: number;       // Default: 50, Max: 200
  offset?: number;      // Default: 0
}
```

**Response (200 OK)**:
```typescript
interface WalletHistoryResponse {
  customer_id: string;
  total_count: number;

  transactions: Array<{
    id: string;
    balance_type: 'points' | 'store_credit' | 'digital_rewards';
    transaction_type: 'earned' | 'issued' | 'redeemed' | 'expired' | 'extended';
    amount: number;  // Positive for earned/issued, negative for redeemed/expired
    currency?: string;  // For store_credit, digital_rewards
    points?: number;    // For points
    balance_after: number;
    description: string;
    timestamp: string;  // ISO 8601
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
  "customer_id": "cust_123",
  "total_count": 58,
  "transactions": [
    {
      "id": "txn_001",
      "balance_type": "store_credit",
      "transaction_type": "redeemed",
      "amount": -20.00,
      "currency": "USD",
      "balance_after": 25.00,
      "description": "Redeemed at Merchant A",
      "timestamp": "2025-11-09T14:45:00Z",
      "metadata": {
        "order_id": "order_xyz789",
        "merchant_id": "merchant_main_store"
      }
    },
    {
      "id": "txn_002",
      "balance_type": "digital_rewards",
      "transaction_type": "issued",
      "amount": 25.00,
      "currency": "USD",
      "balance_after": 25.00,
      "description": "Welcome bonus",
      "timestamp": "2025-11-09T10:00:00Z",
      "metadata": {
        "campaign_id": "welcome2025",
        "method": "promotional"
      }
    },
    {
      "id": "txn_003",
      "balance_type": "points",
      "transaction_type": "earned",
      "amount": 100,
      "points": 100,
      "balance_after": 1500,
      "description": "Purchase reward",
      "timestamp": "2025-11-08T15:30:00Z",
      "metadata": {
        "order_id": "order_abc456",
        "earn_rate": "1x"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

---

### 4. WebSocket Real-Time Balance Updates

**Endpoint**: `wss://api.nxloy.com/wallet/updates`

**Authentication**: JWT token in query string or header

**Connection**:
```typescript
const ws = new WebSocket('wss://api.nxloy.com/wallet/updates?token=JWT_TOKEN');

ws.on('open', () => {
  // Subscribe to customer's wallet updates
  ws.send(JSON.stringify({
    action: 'subscribe',
    customer_id: 'cust_123'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);

  if (message.event === 'wallet.balance_updated') {
    // Update UI with new balances
    updateWalletUI(message.changes);
  }
});
```

**Message Format**:
```typescript
interface BalanceUpdateMessage {
  event: 'wallet.balance_updated';
  customer_id: string;
  timestamp: string;  // ISO 8601

  changes: {
    points?: {
      old_balance: number;
      new_balance: number;
      change: number;
    };
    store_credit?: Record<string, {  // By currency
      old_balance: number;
      new_balance: number;
      change: number;
    }>;
    digital_rewards?: Record<string, {  // By currency
      old_balance: number;
      new_balance: number;
      change: number;
    }>;
  };

  trigger: {
    type: 'redemption' | 'issuance' | 'expiration' | 'adjustment';
    transaction_id?: string;
    description?: string;
  };
}
```

**Example Message**:
```json
{
  "event": "wallet.balance_updated",
  "customer_id": "cust_123",
  "timestamp": "2025-11-09T14:45:00Z",
  "changes": {
    "store_credit": {
      "USD": {
        "old_balance": 45.00,
        "new_balance": 25.00,
        "change": -20.00
      }
    },
    "points": {
      "old_balance": 1500,
      "new_balance": 500,
      "change": -1000
    }
  },
  "trigger": {
    "type": "redemption",
    "transaction_id": "order_xyz789",
    "description": "Multi-tender checkout at Merchant A"
  }
}
```

---

## Database Schema

### Table: `wallet_configuration`

**Purpose**: Store business-level wallet configuration (depletion order, redemption rules).

```sql
CREATE TABLE wallet_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Depletion Order Configuration
  depletion_order JSONB NOT NULL DEFAULT '[]',
  -- Example: [
  --   {"type": "digital_rewards", "priority": 1, "conditions": {...}},
  --   {"type": "store_credit", "priority": 2},
  --   {"type": "points", "priority": 3},
  --   {"type": "cash", "priority": 4}
  -- ]

  expiration_override BOOLEAN NOT NULL DEFAULT true,  -- Use expiring balances first

  -- Redemption Rules
  min_redemption_points INTEGER DEFAULT 100,
  min_redemption_store_credit DECIMAL(10, 2) DEFAULT 1.00,
  min_redemption_digital_rewards DECIMAL(10, 2) DEFAULT 1.00,

  -- Points Valuation (for total value calculation)
  points_to_usd_rate DECIMAL(10, 6) DEFAULT 0.01,  -- 1 point = $0.01

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(business_id)
);

CREATE INDEX idx_wallet_config_business_id ON wallet_configuration(business_id);
```

---

### Table: `wallet_transaction_log`

**Purpose**: Unified audit trail for all wallet transactions (aggregated view).

```sql
CREATE TABLE wallet_transaction_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Transaction Details
  balance_type VARCHAR(20) NOT NULL,  -- points, store_credit, digital_rewards
  transaction_type VARCHAR(20) NOT NULL,  -- earned, issued, redeemed, expired, extended
  amount DECIMAL(15, 2),  -- For store_credit, digital_rewards
  currency VARCHAR(3),    -- For store_credit, digital_rewards
  points INTEGER,         -- For points

  balance_after_amount DECIMAL(15, 2),  -- Balance after transaction (for currency-based)
  balance_after_points INTEGER,         -- Balance after transaction (for points)

  -- External References
  source_service VARCHAR(50) NOT NULL,  -- points_service, store_credit_service, digital_reward_service
  source_transaction_id VARCHAR(255) NOT NULL,  -- ID from source service
  external_transaction_id VARCHAR(255),  -- e.g., order_id, refund_id

  -- Description
  description TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit Trail
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_balance_type CHECK (balance_type IN ('points', 'store_credit', 'digital_rewards')),
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('earned', 'issued', 'redeemed', 'expired', 'extended', 'adjusted'))
);

-- Indexes
CREATE INDEX idx_wallet_txn_log_customer_id ON wallet_transaction_log(customer_id);
CREATE INDEX idx_wallet_txn_log_business_id ON wallet_transaction_log(business_id);
CREATE INDEX idx_wallet_txn_log_balance_type ON wallet_transaction_log(balance_type);
CREATE INDEX idx_wallet_txn_log_txn_type ON wallet_transaction_log(transaction_type);
CREATE INDEX idx_wallet_txn_log_date ON wallet_transaction_log(transaction_date);
CREATE INDEX idx_wallet_txn_log_external_id ON wallet_transaction_log(external_transaction_id)
  WHERE external_transaction_id IS NOT NULL;
```

**Populated By**: Event handlers listening to Points, Store Credit, Digital Reward services.

---

## Business Rules

### BR-UW-001: Depletion Order Execution

**Rule**: Apply payment methods in configured depletion order, with expiration override.

**Priority Logic**:
1. **Expiration Override**: If enabled, use soonest-to-expire balances first (across all types)
2. **Configured Order**: Follow business-configured depletion order
3. **FIFO Within Type**: Within each balance type, use FIFO (soonest-to-expire first)

**Implementation**:
```typescript
class DepletionOrderService {
  async calculateDepletionPlan(
    customerId: string,
    cartTotal: number,
    currency: string,
    businessConfig: WalletConfiguration
  ): Promise<DepletionPlan> {
    // Fetch all available balances
    const points = await this.pointsService.getBalance(customerId);
    const storeCredit = await this.storeCreditService.getBalance(customerId, currency);
    const digitalRewards = await this.digitalRewardService.getBalance(customerId, currency);

    let remaining = cartTotal;
    const plan: DepletionPlan = [];

    // Apply expiration override if enabled
    if (businessConfig.expirationOverride) {
      const expiringBalances = this.getExpiringBalances([
        ...storeCredit.credits,
        ...digitalRewards.rewards,
        ...points.pointBatches  // Assuming points have expiration
      ]);

      for (const balance of expiringBalances) {
        if (remaining <= 0) break;

        const amountToUse = Math.min(balance.balance, remaining);
        plan.push({
          type: balance.type,
          amount: amountToUse,
          reason: 'Expiring soon (override)'
        });
        remaining -= amountToUse;
      }
    }

    // Apply configured depletion order
    for (const rule of businessConfig.depletionOrder) {
      if (remaining <= 0) break;

      // Check rule conditions
      if (!this.meetsConditions(rule.conditions, cartTotal, remaining)) {
        continue;
      }

      switch (rule.type) {
        case 'digital_rewards':
          const drAmount = Math.min(digitalRewards.balance, remaining);
          if (drAmount > 0) {
            plan.push({ type: 'digital_rewards', amount: drAmount });
            remaining -= drAmount;
          }
          break;

        case 'store_credit':
          const scAmount = Math.min(storeCredit.balance, remaining);
          if (scAmount > 0) {
            plan.push({ type: 'store_credit', amount: scAmount });
            remaining -= scAmount;
          }
          break;

        case 'points':
          const pointsValue = points.balance * businessConfig.pointsToUsdRate;
          const ptsAmount = Math.min(pointsValue, remaining);
          if (ptsAmount > 0) {
            const pointsToRedeem = Math.floor(ptsAmount / businessConfig.pointsToUsdRate);
            plan.push({
              type: 'points',
              points: pointsToRedeem,
              value: pointsToRedeem * businessConfig.pointsToUsdRate
            });
            remaining -= ptsAmount;
          }
          break;
      }
    }

    // Remaining amount requires cash
    if (remaining > 0) {
      plan.push({ type: 'cash', amount: remaining });
    }

    return plan;
  }

  private getExpiringBalances(balances: Balance[]): Balance[] {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return balances
      .filter(b => b.expiresAt && b.expiresAt <= thirtyDaysFromNow)
      .sort((a, b) => a.expiresAt!.getTime() - b.expiresAt!.getTime());
  }

  private meetsConditions(
    conditions: RuleConditions | undefined,
    cartTotal: number,
    remaining: number
  ): boolean {
    if (!conditions) return true;

    if (conditions.minTransactionAmount && cartTotal < conditions.minTransactionAmount) {
      return false;
    }

    if (conditions.minRedemptionPoints && remaining < conditions.minRedemptionPoints) {
      return false;
    }

    return true;
  }
}
```

**Example**:
- Business config: Digital Rewards (priority 1) → Store Credit (priority 2) → Points (priority 3)
- Expiration override: ENABLED
- Customer has:
  - $10 USD digital rewards (expires in 60 days)
  - $20 USD store credit (expires in 5 days ← EXPIRING SOON)
  - 1000 points = $10 value (no expiration)
- Cart total: $30 USD

**Depletion Plan**:
1. $20 USD store credit (expiring soon, override kicks in)
2. $10 USD digital rewards (priority 1 in config)
3. $0 points (not needed)
4. $0 cash (fully covered by loyalty)

---

### BR-UW-002: VAT/GST Calculation

**Rule**: Calculate VAT/GST on original cart total (before loyalty deductions), customer pays tax separately.

**Rationale**: Align with ASEAN tax principles (tax on goods/services, not on discounts).

**Implementation**:
```typescript
interface PaymentBreakdown {
  cartTotal: number;
  loyaltyApplied: number;  // Sum of digital rewards + store credit + points value
  subtotalAfterLoyalty: number;
  vat: number;
  totalCashDue: number;
}

function calculatePaymentBreakdown(
  cartTotal: number,
  loyaltyApplied: number,
  vatRate: number
): PaymentBreakdown {
  const vat = cartTotal * vatRate;  // VAT on full product total
  const subtotalAfterLoyalty = Math.max(0, cartTotal - loyaltyApplied);
  const totalCashDue = subtotalAfterLoyalty + vat;

  return {
    cartTotal,
    loyaltyApplied,
    subtotalAfterLoyalty,
    vat,
    totalCashDue
  };
}

// Example
const breakdown = calculatePaymentBreakdown(
  100.00,  // Cart total
  55.00,   // Loyalty applied ($25 digital + $20 credit + $10 points)
  0.10     // 10% VAT (Cambodia)
);

console.log(breakdown);
// {
//   cartTotal: 100.00,
//   loyaltyApplied: 55.00,
//   subtotalAfterLoyalty: 45.00,
//   vat: 10.00,        // Tax on full $100, not $45
//   totalCashDue: 55.00  // Customer pays $45 + $10 VAT = $55
// }
```

---

### BR-UW-003: Multi-Currency Isolation

**Rule**: Store credit and digital rewards are currency-specific. Cannot mix currencies in single redemption.

**Rationale**: Avoid exchange rate complexity, accounting complications.

**Implementation**:
```typescript
class WalletRedemptionService {
  async validateRedemptionRequest(
    request: WalletRedemptionRequest
  ): Promise<ValidationResult> {
    const { currency, payment_methods } = request;

    // Validate all payment methods match transaction currency
    for (const pm of payment_methods) {
      if (pm.type === 'store_credit' || pm.type === 'digital_rewards') {
        const balance = await this.getBalance(pm.type, request.customer_id, currency);

        if (balance.currency !== currency) {
          throw new Error(
            `Currency mismatch: Transaction currency is ${currency}, ` +
            `but ${pm.type} balance is in ${balance.currency}. ` +
            `Cannot convert between currencies. Please use matching currency.`
          );
        }

        if (balance.balance < pm.amount!) {
          throw new Error(
            `Insufficient ${pm.type} balance in ${currency}. ` +
            `Available: ${balance.balance}, Requested: ${pm.amount}`
          );
        }
      }
    }

    return { valid: true };
  }
}
```

**Example**:
- Customer has:
  - $45 USD store credit
  - 40,000 KHR store credit
  - $25 USD digital rewards
- Transaction in Singapore (SGD): **Cannot use USD or KHR balances** (no currency conversion)
- Customer must transact in USD or KHR to use existing balances

---

### BR-UW-004: Real-Time Balance Sync

**Rule**: All connected clients receive balance updates within 1 second of source event.

**Event Flow**:
```typescript
// 1. Customer redeems store credit on mobile app
mobile_app -> POST /api/v1/wallet/redeem

// 2. Wallet Service processes redemption
wallet_service -> store_credit_service.redeem()
wallet_service -> points_service.redeem()

// 3. Underlying services publish events
store_credit_service -> EventBus.publish('StoreCredit.Redeemed', {...})
points_service -> EventBus.publish('Points.Redeemed', {...})

// 4. Wallet Service listens to events
wallet_service -> EventHandler('StoreCredit.Redeemed')
wallet_service -> EventHandler('Points.Redeemed')

// 5. Invalidate cache
wallet_service -> Redis.delete('wallet:balance:cust_123')

// 6. Broadcast update via WebSocket
wallet_service -> WebSocket.broadcast('wallet.balance_updated', {
  customer_id: 'cust_123',
  changes: { store_credit: {...}, points: {...} }
})

// 7. All connected clients receive update
web_app <- WebSocket message (< 1 second)
mobile_app <- WebSocket message (< 1 second)
pos_terminal <- WebSocket message (< 1 second)
```

**Implementation**:
```typescript
class WalletEventHandler {
  @EventHandler('StoreCredit.Redeemed')
  @EventHandler('StoreCredit.Issued')
  @EventHandler('DigitalReward.Redeemed')
  @EventHandler('DigitalReward.Issued')
  @EventHandler('Points.Earned')
  @EventHandler('Points.Redeemed')
  async handleBalanceChange(event: BalanceChangeEvent): Promise<void> {
    const { customer_id, balance_type } = event;

    // Invalidate cache
    await this.redis.del(`wallet:balance:${customer_id}`);

    // Fetch fresh balance
    const newBalance = await this.walletService.getBalance(customer_id);

    // Broadcast to WebSocket clients
    await this.websocketGateway.broadcastToCustomer(customer_id, {
      event: 'wallet.balance_updated',
      customer_id,
      timestamp: new Date().toISOString(),
      changes: this.calculateChanges(event, newBalance),
      trigger: {
        type: event.type,
        transaction_id: event.transaction_id,
        description: event.description
      }
    });
  }

  private calculateChanges(
    event: BalanceChangeEvent,
    newBalance: WalletBalance
  ): BalanceChanges {
    // Calculate old balance from event + new balance
    // Return delta for UI update
    return {...};
  }
}
```

---

## UX Mockups

### 1. Unified Wallet Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  NxLoy Wallet                                         [Profile] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  💰 Total Value: ~$95.00 USD                                   │
│     (Approximate value across all balance types)               │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  📊 Balance Summary                                       │ │
│  │                                                           │ │
│  │  🔵 Loyalty Points               1,500 points (~$15.00)  │ │
│  │     ⚠️ 200 points expiring in 22 days                    │ │
│  │                                                           │ │
│  │  💳 Store Credit (USD)                        $45.00     │ │
│  │     ⚠️ $10.00 expiring in 11 days                        │ │
│  │                                                           │ │
│  │  💳 Store Credit (KHR)                        40,000 KHR │ │
│  │     No expiring balances                                 │ │
│  │                                                           │ │
│  │  🎁 Digital Rewards (USD)                     $25.00     │ │
│  │     ⚠️ ALL expiring in 6 days!                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ⚠️ Expiring Soon (30 days)                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  🎁 $25.00 USD Digital Rewards → 6 days left             │ │
│  │  💳 $10.00 USD Store Credit → 11 days left               │ │
│  │  🔵 200 Points → 22 days left                            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [View Transaction History]  [Redeem Now]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. Multi-Tender Checkout

```
┌─────────────────────────────────────────────────────────────────┐
│  Checkout                                              [Cancel] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Order Summary:                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Product A                                       $30.00   │ │
│  │  Product B                                       $70.00   │ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │  Cart Total:                                    $100.00   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  How would you like to pay?                                    │
│                                                                 │
│  ☑ Digital Rewards (USD) - $25.00 available                    │
│     Use: [$25.00_______________] [Max]  ⚠️ Expiring in 6 days │
│                                                                 │
│  ☑ Store Credit (USD) - $45.00 available                       │
│     Use: [$20.00_______________] [Max]                         │
│                                                                 │
│  ☑ Loyalty Points - 1,500 points available (~$15.00)           │
│     Use: [1000 points ($10.00)_] [Max]                         │
│                                                                 │
│  ☐ Cash/Card                                                   │
│                                                                 │
│  [✨ Optimize Redemption]  ← Auto-calc best combination        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  💵 Payment Breakdown:                                    │ │
│  │                                                           │ │
│  │  Cart Total:                                   $100.00   │ │
│  │  Digital Rewards Applied:                      -$25.00   │ │
│  │  Store Credit Applied:                         -$20.00   │ │
│  │  Loyalty Points Applied (1000 pts):            -$10.00   │ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │  Subtotal After Loyalty:                        $45.00   │ │
│  │  VAT (10%):                                     $10.00   │ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │  💰 Total Due (Cash/Card):                      $55.00   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ✅ You're saving $55.00 with loyalty rewards!                 │
│                                                                 │
│  [Complete Purchase]                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3. Transaction History

```
┌─────────────────────────────────────────────────────────────────┐
│  Transaction History                                   [Export] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Filters:                                                       │
│  [All Types ▼] [All Transactions ▼] [Last 30 Days ▼] [Search] │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  💳 Store Credit Redeemed                      -$20.00 USD│ │
│  │  Nov 9, 2025 2:45 PM                                      │ │
│  │  Order #xyz789 at Merchant A                              │ │
│  │  Balance after: $25.00 USD                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  🔵 Loyalty Points Redeemed                    -1000 points│ │
│  │  Nov 9, 2025 2:45 PM                                      │ │
│  │  Order #xyz789 at Merchant A ($10.00 value)              │ │
│  │  Balance after: 500 points                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  🎁 Digital Reward Issued                       +$25.00 USD│ │
│  │  Nov 9, 2025 10:00 AM                                     │ │
│  │  Welcome bonus                                            │ │
│  │  Expires: Nov 15, 2025 (6 days)                           │ │
│  │  Balance after: $25.00 USD                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  🔵 Loyalty Points Earned                       +100 points│ │
│  │  Nov 8, 2025 3:30 PM                                      │ │
│  │  Purchase reward (Order #abc456)                          │ │
│  │  Balance after: 1500 points                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Load More] (Page 1 of 12)                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Points Service (Existing)

**Integration**: Wallet Service queries Points Service for balance and redemption.

**APIs Used**:
- `GET /api/v1/points/balance/{customer_id}` - Get current points balance
- `POST /api/v1/points/redeem` - Redeem points
- `GET /api/v1/points/history/{customer_id}` - Get points transaction history

**Events Consumed**:
- `Points.Earned` → Update wallet cache, broadcast to clients
- `Points.Redeemed` → Update wallet cache, broadcast to clients
- `Points.Expired` → Update wallet cache, broadcast to clients

---

### 2. Store Credit Service (New)

**Integration**: Wallet Service queries Store Credit Service for balance and redemption.

**APIs Used**:
- `GET /api/v1/store-credits/balance/{customer_id}` - Get current store credit balance (by currency)
- `POST /api/v1/store-credits/redeem` - Redeem store credit
- `GET /api/v1/store-credits/history/{customer_id}` - Get store credit transaction history

**Events Consumed**:
- `StoreCredit.Issued` → Update wallet cache, broadcast to clients
- `StoreCredit.Redeemed` → Update wallet cache, broadcast to clients
- `StoreCredit.Expired` → Update wallet cache, broadcast to clients

---

### 3. Digital Reward Service (New)

**Integration**: Wallet Service queries Digital Reward Service for balance and redemption.

**APIs Used**:
- `GET /api/v1/digital-rewards/balance/{customer_id}` - Get current digital reward balance (by currency)
- `POST /api/v1/digital-rewards/redeem` - Redeem digital rewards
- `GET /api/v1/digital-rewards/history/{customer_id}` - Get digital reward transaction history

**Events Consumed**:
- `DigitalReward.Issued` → Update wallet cache, broadcast to clients
- `DigitalReward.Redeemed` → Update wallet cache, broadcast to clients
- `DigitalReward.Expired` → Update wallet cache, broadcast to clients

---

### 4. Payment Service

**Integration**: Payment Service calls Wallet Service for multi-tender checkout orchestration.

**Flow**:
```typescript
// Payment Service receives checkout request
class PaymentService {
  async processCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    // Option 1: Customer specifies loyalty payment amounts
    if (request.loyaltyPayments) {
      return await this.walletService.redeem({
        customer_id: request.customerId,
        transaction_id: request.orderId,
        cart_total: request.cartTotal,
        currency: request.currency,
        vat_rate: request.vatRate,
        payment_methods: request.loyaltyPayments
      });
    }

    // Option 2: Auto-optimize loyalty redemption
    if (request.optimizeLoyalty) {
      const depletionPlan = await this.walletService.calculateOptimalRedemption({
        customer_id: request.customerId,
        cart_total: request.cartTotal,
        currency: request.currency
      });

      return await this.walletService.redeem({
        customer_id: request.customerId,
        transaction_id: request.orderId,
        cart_total: request.cartTotal,
        currency: request.currency,
        vat_rate: request.vatRate,
        payment_methods: depletionPlan.paymentMethods
      });
    }

    // Option 3: Cash-only payment (no loyalty redemption)
    return await this.paymentGateway.charge({
      amount: request.cartTotal + (request.cartTotal * request.vatRate),
      currency: request.currency
    });
  }
}
```

---

### 5. Accounting Service

**Integration**: Accounting Service listens to wallet events for liability tracking.

**Events Consumed**:
- All balance change events (issued, redeemed, expired) from Points, Store Credit, Digital Reward services
- Creates journal entries for accounting compliance

**Liability Reconciliation**:
```typescript
class AccountingService {
  async generateLiabilityReport(
    businessId: string,
    reportDate: Date
  ): Promise<LiabilityReport> {
    // Query wallet service for current balances
    const walletBalances = await this.walletService.getTotalLiabilities(businessId);

    // Query accounting system for recorded liabilities
    const accountingBalances = await this.accountingSystem.getLiabilities(businessId);

    // Compare and highlight discrepancies
    const report = {
      businessId,
      reportDate,
      walletBalances,
      accountingBalances,
      discrepancies: this.calculateDiscrepancies(walletBalances, accountingBalances)
    };

    if (report.discrepancies.length > 0) {
      await this.alertService.notifyFinanceTeam({
        severity: 'HIGH',
        message: `Liability discrepancy detected for business ${businessId}`,
        details: report.discrepancies
      });
    }

    return report;
  }
}
```

---

## Compliance & Accounting

### ASEAN Compliance Summary

All wallet balance types (points, store credit, digital rewards) are structured as **loyalty program benefits**, ensuring compliance across ASEAN markets:

- ✅ **Philippines**: All balances exempt from Gift Check Act (loyalty program exemption)
- ✅ **Singapore**: No Payment Services Act licensing required (limited-purpose exemption)
- ✅ **Cambodia**: Minimal regulation (no specific gift card laws)
- ✅ **No Escheatment**: Breakage revenue stays with business (not remitted to government)

**See**: `/docs/requirements/features/unified-wallet/COMPLIANCE-SUMMARY.md` for executive summary.

---

### Accounting Treatment (IFRS 15)

**Unified Liability Tracking**:

```sql
-- Balance Sheet (Liabilities)
Current Liabilities:
  Loyalty Points Liability (USD equivalent)     $15,000
  Store Credit Liability - USD                  $50,000
  Store Credit Liability - KHR (USD equiv.)     $50,000
  Digital Reward Liability - USD                $25,000
  Digital Reward Liability - SGD (USD equiv.)   $3,750
  ───────────────────────────────────────────────────────
  Total Loyalty Liabilities                    $143,750
```

**Journal Entries** (see individual feature specs for detailed entries):
- **Points**: See existing points accounting
- **Store Credit**: See `/docs/requirements/features/store-credit/FEATURE-SPEC.md#compliance--accounting`
- **Digital Rewards**: See `/docs/requirements/features/gift-cards/FEATURE-SPEC.md#compliance--accounting`

**Breakage Revenue Recognition** (Remote Method):
- Recognized when balances expire (grace period ends)
- Quarterly review and adjustment of breakage estimates
- Separate tracking by balance type and currency

---

### Tax Treatment (ASEAN)

**VAT/GST at Redemption**:
- Tax calculated on **product total** (before loyalty deductions)
- Customer pays VAT/GST in cash (not deducted from loyalty balances)
- Cambodia: 10% VAT
- Singapore: 9% GST

**Example** (Multi-Tender with VAT):
```
Cart Total:                    $100.00
Digital Rewards Applied:       -$25.00
Store Credit Applied:          -$20.00
Points Applied:                -$10.00
────────────────────────────────────────
Subtotal After Loyalty:         $45.00
VAT (10% of $100):              $10.00  ← Tax on full amount
────────────────────────────────────────
Total Cash Due:                 $55.00

Accounting Entry:
  DR: Cash                             $55.00
  DR: Digital Reward Liability         $25.00
  DR: Store Credit Liability           $20.00
  DR: Points Liability                 $10.00
  CR: Revenue                         $100.00
  CR: VAT Payable                      $10.00
```

---

## Testing Strategy

### Unit Tests

**Wallet Service Tests**:

1. **Balance Aggregation**:
   - ✅ Aggregate balances from all services
   - ✅ Handle missing balances (e.g., customer has no store credit)
   - ✅ Convert points to cash value using configured rate
   - ✅ Group balances by currency
   - ❌ Fail gracefully if underlying service unavailable

2. **Multi-Tender Redemption**:
   - ✅ Execute multi-tender with all payment types
   - ✅ Apply depletion order correctly
   - ✅ Rollback all redemptions if any fail (Saga pattern)
   - ✅ Calculate VAT correctly (on original cart total)
   - ❌ Reject redemption with insufficient balance
   - ❌ Reject redemption with currency mismatch

3. **Depletion Order Logic**:
   - ✅ Apply expiration override (use expiring balances first)
   - ✅ Follow configured depletion order
   - ✅ Apply FIFO within each balance type
   - ✅ Respect business rule conditions (min redemption thresholds)
   - ✅ Customer override of depletion order

---

### Integration Tests

**End-to-End Wallet Flows**:

1. **Multi-Tender Checkout**:
   ```typescript
   it('should process multi-tender checkout with points, store credit, digital rewards, and cash', async () => {
     // Setup: Create customer with balances
     const customer = await createCustomer();
     await pointsService.addPoints(customer.id, 1000);
     await storeCreditService.issue(customer.id, 20.00, 'USD');
     await digitalRewardService.issue(customer.id, 25.00, 'USD');

     // Action: Multi-tender checkout
     const redemption = await walletService.redeem({
       customer_id: customer.id,
       transaction_id: 'order_xyz',
       cart_total: 100.00,
       currency: 'USD',
       vat_rate: 0.10,
       payment_methods: [
         { type: 'digital_rewards', amount: 25.00 },
         { type: 'store_credit', amount: 20.00 },
         { type: 'points', points: 1000, value: 10.00 },
         { type: 'cash', amount: 55.00 }
       ]
     });

     // Verify: Breakdown correct
     expect(redemption.breakdown.cart_total).toBe(100.00);
     expect(redemption.breakdown.digital_rewards_applied).toBe(25.00);
     expect(redemption.breakdown.store_credit_applied).toBe(20.00);
     expect(redemption.breakdown.points_applied).toBe(10.00);
     expect(redemption.breakdown.vat).toBe(10.00);  // 10% of $100
     expect(redemption.breakdown.total_cash_due).toBe(55.00);

     // Verify: Balances deducted
     const balance = await walletService.getBalance(customer.id);
     expect(balance.points.balance).toBe(0);
     expect(balance.store_credit.balances[0].balance).toBe(0);
     expect(balance.digital_rewards.balances[0].balance).toBe(0);

     // Verify: Events published
     expect(eventBus.publish).toHaveBeenCalledWith('DigitalReward.Redeemed', expect.anything());
     expect(eventBus.publish).toHaveBeenCalledWith('StoreCredit.Redeemed', expect.anything());
     expect(eventBus.publish).toHaveBeenCalledWith('Points.Redeemed', expect.anything());
   });
   ```

2. **Real-Time Balance Sync**:
   ```typescript
   it('should broadcast balance updates to all connected clients', async () => {
     // Setup: Customer connects from 2 devices
     const customer = await createCustomer();
     const webSocket = new MockWebSocket(customer.id);
     const mobileSocket = new MockWebSocket(customer.id);

     await walletGateway.handleConnection(webSocket);
     await walletGateway.handleConnection(mobileSocket);

     // Action: Issue store credit
     await storeCreditService.issue(customer.id, 25.00, 'USD');

     // Wait for event propagation
     await sleep(500);

     // Verify: Both clients received update
     expect(webSocket.receivedMessages).toContainEqual(
       expect.objectContaining({
         event: 'wallet.balance_updated',
         changes: expect.objectContaining({
           store_credit: expect.objectContaining({
             USD: expect.objectContaining({ change: 25.00 })
           })
         })
       })
     );

     expect(mobileSocket.receivedMessages).toContainEqual(
       expect.objectContaining({
         event: 'wallet.balance_updated'
       })
     );
   });
   ```

---

### Performance Tests

1. **Balance Lookup** (100,000 requests):
   - Target: < 100ms (p95)
   - Cache hit rate: > 90%

2. **Multi-Tender Redemption** (10,000 redemptions):
   - Target: < 300ms (p95)
   - ACID compliance: No double-spend

3. **WebSocket Broadcast** (1,000 concurrent connections):
   - Target: < 1 second message propagation
   - Connection stability: > 99%

---

## Success Metrics

### Business Metrics

**Wallet Adoption**:
- **Active Wallet Users**: 80% of customers view wallet monthly
- **Multi-Balance Usage**: 40% of customers have balances in 2+ types
- **Transaction Frequency**: 5 wallet transactions/customer/month

**Multi-Tender Adoption**:
- **Multi-Tender Usage**: 35% of transactions use 2+ payment methods
- **Loyalty Redemption Rate**: 70% of available loyalty value redeemed
- **Optimal Redemption Usage**: 20% of customers use "Optimize" button

**Customer Engagement**:
- **Expiration Prevention**: 25% reduction in breakage through reminders
- **Wallet Session Duration**: 2 minutes average (viewing balances, history)

---

### Technical Metrics

**Performance**:
- **Balance Lookup**: < 100ms (p95)
- **Multi-Tender Redemption**: < 300ms (p95)
- **WebSocket Latency**: < 1 second

**Reliability**:
- **Uptime**: 99.9%
- **Transaction Success Rate**: > 99.5%
- **Cache Hit Rate**: > 90%

**Compliance**:
- **Liability Reconciliation**: 100% accuracy (zero discrepancies)
- **Audit Trail Completeness**: 100% (all transactions logged)

---

## Appendix

### Glossary

**Unified Wallet**: Single, consolidated view of all customer loyalty assets (points, store credit, digital rewards).

**Multi-Tender Payment**: Combining multiple balance types (e.g., digital rewards + store credit + points + cash) in single transaction.

**Depletion Order**: Configured sequence in which balance types are used during multi-tender redemption.

**Expiration Override**: Business rule that prioritizes soonest-to-expire balances regardless of configured depletion order.

**FIFO (First-In-First-Out)**: Redemption strategy that uses oldest/soonest-to-expire balances first within each balance type.

**Optimal Redemption**: Auto-calculated payment combination that maximizes customer value (uses expiring balances first, minimizes cash payment).

**Saga Pattern**: Distributed transaction pattern ensuring atomicity across multiple services (all succeed or all rollback).

---

### Related Documents

**Feature Specifications**:
- `/docs/requirements/features/store-credit/FEATURE-SPEC.md` - Store credit (CASHBACK reward type)
- `/docs/requirements/features/gift-cards/FEATURE-SPEC.md` - Digital rewards (DIGITAL_GIFT reward type)

**Compliance**:
- `/docs/requirements/features/unified-wallet/COMPLIANCE-SUMMARY.md` - Executive summary
- `/docs/requirements/features/store-credit/COMPLIANCE.md` - Store credit compliance (v2.0.0)
- `/docs/requirements/features/gift-cards/COMPLIANCE.md` - Digital rewards compliance (v2.0.0)
- `/docs/compliance/ASEAN-GIFT-CARD-STORE-CREDIT-REGULATIONS.md` - 1,352-line regulatory research

**Domain Model** (to be updated):
- `/docs/requirements/domain-specs/loyalty/ENTITIES.md`
- `/docs/requirements/domain-specs/loyalty/VALUE-OBJECTS.md`
- `/docs/requirements/domain-specs/loyalty/AGGREGATES.md`
- `/docs/requirements/domain-specs/loyalty/BUSINESS-RULES.md`

---

**Document Prepared By**: Claude (NxLoy Documentation Assistant)
**Review Status**: Ready for Product & Technical Review
**Next Review**: 2026-01-09 or upon architectural changes
**Implementation Target**: Phase 1 (Cambodia Launch, Months 1-3)
