# Store Credit Feature Specification

**Feature**: Store Credit (CASHBACK Reward Type)
**Version**: 1.0.0
**Date**: 2025-11-09
**Status**: Phase 1 - Ready for Implementation
**Owner**: NxLoy Platform Team
**Context**: Cambodia-based, ASEAN expansion, Loyalty Program Structure

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
10. [User Experience](#user-experience)
11. [Integration Points](#integration-points)
12. [Compliance & Accounting](#compliance--accounting)
13. [Testing Strategy](#testing-strategy)
14. [Success Metrics](#success-metrics)

---

## Overview

### Feature Description

Store credit is a **cash-equivalent balance** that customers earn through the loyalty program and can use as payment for goods or services. Store credit is implemented as the **CASHBACK reward type** in the reward catalog.

**Key Characteristics**:
- **Earned, not purchased**: Customers earn store credit through purchases, referrals, promotions
- **Loyalty program benefit**: Part of NxLoy's loyalty/rewards program structure
- **Cash-equivalent**: Can be used like money at redemption
- **Expirable**: 12-month expiration with 30-day grace period (configurable)
- **Multi-currency**: Supports USD, KHR (Cambodia), SGD (Singapore), others

### Business Value

**For Merchants**:
- **Customer retention**: Incentivize repeat purchases
- **Marketing tool**: Issue promotional credits for engagement
- **Refund alternative**: Offer store credit instead of cash refunds
- **Breakage revenue**: 10-15% of unredeemed credits = revenue (ASEAN advantage: no escheatment)

**For Customers**:
- **Rewards value**: Earn cash-equivalent credits
- **Payment flexibility**: Use credits toward future purchases
- **No tax**: Credits not taxable to customer (ASEAN markets)

### Scope

**Phase 1 (MVP)**:
- ✅ Store credit issuance (promotional, refund, cashback reward)
- ✅ Balance tracking and management
- ✅ Redemption as payment method
- ✅ Expiration handling (12 months + grace period)
- ✅ Multi-currency support (USD, KHR, SGD)
- ✅ VAT/GST compliance (Cambodia 10%, Singapore 9%)
- ✅ IFRS 15 accounting (breakage recognition)

**Out of Scope (Phase 1)**:
- ❌ Store credit purchase (customers cannot buy credits directly)
- ❌ Store credit transfers between customers
- ❌ P2P gifting of credits
- ❌ Cash withdrawal of credits

---

## Strategic Positioning

### Loyalty Program Structure

**Critical**: Store credit is **NOT a purchased product** - it's a **loyalty program benefit**

**Why This Matters** (ASEAN Compliance):
- ✅ **Philippines exemption**: Loyalty rewards exempt from Gift Check Act (no expiration prohibition)
- ✅ **Singapore licensing**: No Payment Services Act licensing required
- ✅ **Cambodia simplicity**: Minimal regulation
- ✅ **Operational flexibility**: Can set expiration, terms, redemption rules

### Integration with Reward Catalog

Store credit is implemented as **CASHBACK reward type** in the existing reward catalog:

```
Reward Catalog:
├── DISCOUNT (percentage or fixed off)
├── FREE_ITEM (complimentary product)
├── CASHBACK ← Store Credit Implementation
├── EXPERIENCE (VIP access, events)
├── DIGITAL_GIFT (vouchers, codes)
├── POINTS_MULTIPLIER (bonus points)
└── EXCLUSIVE_ACCESS (early access)
```

**Customer Journey**:
1. Customer earns points through purchases
2. Customer redeems points for **CASHBACK reward**
3. CASHBACK reward credits **store credit balance**
4. Customer uses store credit as payment method

---

## User Stories

### Epic: Store Credit Management

**US-SC-001**: As a **merchant**, I want to issue promotional store credits to customers so that I can incentivize engagement and purchases.

**US-SC-002**: As a **merchant**, I want to offer store credit refunds instead of cash refunds so that I can retain revenue and encourage repeat purchases.

**US-SC-003**: As a **merchant**, I want customers to redeem loyalty points for store credit so that I can offer flexible reward options.

**US-SC-004**: As a **customer**, I want to view my store credit balance so that I know how much credit I have available.

**US-SC-005**: As a **customer**, I want to use store credit as payment so that I can reduce my out-of-pocket cost.

**US-SC-006**: As a **customer**, I want to receive notifications about expiring store credits so that I don't lose my rewards.

**US-SC-007**: As a **system administrator**, I want to configure store credit expiration policies by business so that I can comply with different market requirements.

**US-SC-008**: As a **finance team member**, I want to view store credit liability reports so that I can accurately report financial position.

**US-SC-009**: As a **finance team member**, I want to recognize breakage revenue so that I can optimize accounting for unredeemed credits.

### Epic: Multi-Currency Support

**US-SC-010**: As a **merchant in Cambodia**, I want to issue store credits in KHR so that customers see amounts in local currency.

**US-SC-011**: As a **merchant in Singapore**, I want to issue store credits in SGD so that amounts are displayed in Singapore Dollars.

**US-SC-012**: As a **customer**, I want to see my store credit in my preferred currency so that I understand the value.

### Epic: Compliance & Accounting

**US-SC-013**: As a **compliance officer**, I want to ensure store credit is structured as loyalty reward so that we maintain ASEAN exemptions.

**US-SC-014**: As an **accountant**, I want store credit to be recorded as deferred revenue liability so that financial statements are accurate.

**US-SC-015**: As a **tax specialist**, I want VAT/GST to be calculated at redemption so that we comply with ASEAN tax laws.

---

## Functional Requirements

### FR-SC-001: Store Credit Issuance

**Priority**: P0 (Must Have)

**Description**: System must support multiple methods of issuing store credits to customers.

**Issuance Methods**:

1. **Promotional Credit** (Admin-initiated):
   - Admin selects customer(s)
   - Enters credit amount and reason
   - Optional expiration override
   - System creates store credit record
   - Customer receives notification

2. **Refund Credit** (Return processing):
   - Customer returns product
   - Merchant offers store credit instead of cash
   - Customer accepts store credit option
   - System creates store credit for refund amount
   - Original purchase VAT/GST refunded separately

3. **CASHBACK Reward Redemption** (Customer-initiated):
   - Customer browses reward catalog
   - Selects CASHBACK reward (e.g., "Redeem 1000 points for $10 store credit")
   - Confirms redemption
   - Points deducted, store credit issued
   - Customer receives confirmation

4. **Automated Issuance** (Rule-based):
   - Business configures rules (e.g., "Spend $100, get $10 credit")
   - System monitors transactions
   - Auto-issues credit when conditions met
   - Customer receives notification

**Business Rules**:
- Minimum credit amount: $1 (or equivalent in KHR/SGD)
- Maximum credit per issuance: Configurable by business (default: $500)
- Credits issued in business's base currency
- Expiration: 12 months from issuance (configurable: 6-24 months)

**Acceptance Criteria**:
- [ ] Admin can issue promotional credit with reason
- [ ] Refund workflow offers store credit option
- [ ] CASHBACK reward redemption creates store credit
- [ ] Automated rules issue credits based on conditions
- [ ] All issuances logged in audit trail
- [ ] Customer receives email/SMS notification
- [ ] Credit appears in customer wallet within 1 minute

### FR-SC-002: Balance Tracking

**Priority**: P0 (Must Have)

**Description**: System must track store credit balances accurately across all transactions.

**Requirements**:
- Real-time balance updates
- Transaction history (issuance, redemption, expiration, adjustment)
- Multi-currency balance tracking
- Balance holds for pending transactions
- Concurrent transaction handling (prevent over-redemption)

**Balance Display**:
```
Customer Wallet:
├── Points Balance: 5,000 points
├── Store Credit: $25.00 USD
│   ├── Available: $25.00
│   ├── Pending: $0.00
│   └── Expires: 2026-05-15 (6 months)
└── Digital Rewards: 2 active
```

**Acceptance Criteria**:
- [ ] Balance updates in real-time (within 1 second)
- [ ] Transaction history shows all activities
- [ ] Multi-currency balances displayed correctly
- [ ] Pending holds prevent over-redemption
- [ ] Concurrent transactions handled without race conditions
- [ ] Balance correct after server restart (persistence)

### FR-SC-003: Redemption as Payment

**Priority**: P0 (Must Have)

**Description**: Customers must be able to use store credit as payment method at checkout.

**Redemption Flow**:
1. Customer adds items to cart
2. Proceeds to checkout
3. Selects payment methods
4. Applies store credit (full or partial)
5. System calculates:
   - Product total
   - Store credit applied
   - Remaining amount (if partial)
   - VAT/GST on product total
6. Customer pays remaining amount + VAT/GST
7. Transaction completes
8. Store credit balance updated

**Payment Scenarios**:

**Scenario A: Full Credit Payment**
```
Cart Total:        $40.00
Store Credit:      $50.00 available
Credit Applied:    $40.00
VAT (10%):         $4.00
Customer Pays:     $4.00 (VAT only)
Remaining Credit:  $10.00
```

**Scenario B: Partial Credit Payment**
```
Cart Total:        $60.00
Store Credit:      $25.00 available
Credit Applied:    $25.00
Subtotal:          $35.00 (remaining)
VAT (10%):         $6.00
Customer Pays:     $41.00 (cash/card)
Remaining Credit:  $0.00
```

**Scenario C: Multi-Tender Payment**
```
Cart Total:        $100.00
Points:            2000 pts = $20.00
Store Credit:      $30.00
Subtotal:          $50.00 (remaining)
VAT (10%):         $10.00
Customer Pays:     $60.00 (cash/card)
```

**Business Rules**:
- Store credit applied before other payment methods
- VAT/GST calculated on product total (before credit)
- Customer pays VAT/GST separately (cannot use credit for tax)
- Partial redemption allowed
- No change given (if credit > cart total, excess remains as credit)

**Acceptance Criteria**:
- [ ] Store credit appears as payment option at checkout
- [ ] Full credit payment works correctly
- [ ] Partial credit payment works correctly
- [ ] Multi-tender payment (points + credit + cash) works
- [ ] VAT/GST calculated correctly
- [ ] Transaction fails if insufficient credit + other payment
- [ ] Balance updated immediately after payment
- [ ] Receipt shows credit applied

### FR-SC-004: Expiration Management

**Priority**: P0 (Must Have)

**Description**: System must manage store credit expiration according to configured policies.

**Expiration Policy** (Default):
- **Expiration period**: 12 months from issuance
- **Grace period**: 30 days after expiration date
- **Notifications**:
  - 30 days before expiration
  - 7 days before expiration
  - 1 day before expiration
  - Day of expiration
- **After expiration + grace**: Credit marked as expired, balance = 0

**Expiration Process**:
```
Daily Batch Job (runs at 00:00 UTC):
1. Identify credits expiring in next 30/7/1 days
2. Send reminder notifications
3. Identify credits past expiration + grace period
4. Mark as expired
5. Update customer balance
6. Record breakage revenue
7. Generate breakage report
```

**Customer Communication**:
```
Email/SMS Template (30 days before):
"Your $25.00 store credit will expire on June 15, 2026. Use it before it's gone!
[Shop Now Button]"
```

**Acceptance Criteria**:
- [ ] Credits expire after configured period (12 months default)
- [ ] Grace period honored (30 days)
- [ ] Notifications sent at 30/7/1 days before expiration
- [ ] Expired credits removed from balance
- [ ] Breakage revenue recorded
- [ ] Admin can extend expiration for individual credits
- [ ] Customer service can view expiration dates

### FR-SC-005: Multi-Currency Support

**Priority**: P0 (Must Have)

**Description**: System must support store credits in multiple currencies for ASEAN markets.

**Supported Currencies** (Phase 1):
- **USD**: US Dollar (base currency)
- **KHR**: Cambodian Riel
- **SGD**: Singapore Dollar

**Currency Handling**:
- Credits issued in business's base currency
- Display in customer's preferred currency
- Exchange rate at time of issuance (locked)
- No currency conversion after issuance
- Multi-currency wallets (separate balances per currency)

**Example**:
```
Cambodian Business:
- Base currency: KHR
- Customer earns: 40,000 KHR credit
- Display: "៛40,000" (40,000 Riel)
- Exchange rate locked: 1 USD = 4,000 KHR

Singapore Business:
- Base currency: SGD
- Customer earns: SGD 20.00 credit
- Display: "S$20.00"
```

**Acceptance Criteria**:
- [ ] Credits issued in business base currency (USD/KHR/SGD)
- [ ] Customer wallet displays all currency balances
- [ ] Exchange rates locked at issuance
- [ ] No post-issuance currency conversion
- [ ] Currency symbols displayed correctly
- [ ] Decimal precision correct (KHR: 0 decimals, USD/SGD: 2)

### FR-SC-006: Audit Trail

**Priority**: P1 (Should Have)

**Description**: System must maintain comprehensive audit trail of all store credit activities.

**Logged Events**:
- Credit issued (who, when, amount, reason, method)
- Credit redeemed (who, when, amount, transaction ID)
- Credit expired (when, amount, breakage revenue)
- Credit adjusted (admin, reason, old/new balance)
- Credit extended (admin, old/new expiration)

**Audit Log Entry**:
```json
{
  "id": "audit_log_123",
  "timestamp": "2025-11-09T10:30:00Z",
  "event_type": "credit_issued",
  "customer_id": "cust_456",
  "business_id": "biz_789",
  "actor_id": "admin_001",
  "actor_type": "admin",
  "details": {
    "credit_id": "credit_abc",
    "amount": 25.00,
    "currency": "USD",
    "method": "promotional",
    "reason": "Welcome bonus",
    "expiration_date": "2026-11-09"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Acceptance Criteria**:
- [ ] All credit activities logged
- [ ] Logs include actor, timestamp, details
- [ ] Admin can search/filter audit logs
- [ ] Logs retained for 7 years (compliance)
- [ ] Logs immutable (append-only)
- [ ] Export audit logs (CSV, JSON)

---

## Non-Functional Requirements

### NFR-SC-001: Performance

- **Balance lookup**: < 100ms (p95)
- **Credit issuance**: < 500ms (p95)
- **Redemption processing**: < 1s (p95)
- **Concurrent transactions**: Support 1000 TPS per business
- **Database queries**: Indexed for sub-100ms response

### NFR-SC-002: Reliability

- **Uptime**: 99.9% (excluding planned maintenance)
- **Data persistence**: No credit loss on system failure
- **Transaction atomicity**: All-or-nothing credit operations
- **Idempotency**: Duplicate issuance requests handled safely

### NFR-SC-003: Security

- **Authentication**: JWT-based auth for all credit operations
- **Authorization**: Role-based access (customer, merchant, admin)
- **Encryption**: Credits encrypted at rest (AES-256)
- **Audit**: All sensitive operations logged
- **Fraud detection**: Velocity checks on issuance/redemption

### NFR-SC-004: Scalability

- **Horizontal scaling**: Stateless API servers
- **Database**: Sharded by business_id
- **Caching**: Redis for balance lookups
- **Growth**: Support 10M customers, 100M credits

### NFR-SC-005: Compliance

- **IFRS 15**: Accounting standard compliance
- **VAT/GST**: Tax calculation at redemption
- **GDPR/CCPA**: Data privacy (if applicable)
- **Loyalty structure**: Documented as loyalty program benefit

---

## Technical Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Customer Apps                            │
│              (Web, Mobile - Next.js, React Native)          │
└────────────────┬──────────────────┬─────────────────────────┘
                 │                  │
                 ▼                  ▼
┌────────────────────────────┐  ┌──────────────────────────┐
│      API Gateway (NestJS)   │  │   Merchant Dashboard     │
└────────────────┬────────────┘  └──────────┬───────────────┘
                 │                          │
                 ▼                          ▼
┌──────────────────────────────────────────────────────────────┐
│                 Store Credit Service (NestJS)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Issuance   │  │  Redemption  │  │    Expiration     │  │
│  │   Module     │  │    Module    │  │     Module        │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Balance    │  │Multi-Currency│  │  Audit Logging    │  │
│  │   Module     │  │    Module    │  │     Module        │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
└────────────────┬────────────────────────────┬────────────────┘
                 │                            │
                 ▼                            ▼
┌────────────────────────────┐  ┌──────────────────────────┐
│   PostgreSQL Database      │  │   Redis Cache            │
│   (store_credits table)    │  │   (balance cache)        │
└────────────────────────────┘  └──────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│               Event Bus (RabbitMQ / Kafka)                  │
│   Events: credit.issued, credit.redeemed, credit.expired   │
└──────────────┬──────────────────────┬──────────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────┐  ┌──────────────────────────────┐
│  Notification        │  │  Accounting Service          │
│  Service             │  │  (Breakage Recognition)      │
└──────────────────────┘  └──────────────────────────────┘
```

### Component Breakdown

**Store Credit Service**:
- **Issuance Module**: Handles credit creation (promotional, refund, reward)
- **Redemption Module**: Processes credit as payment
- **Expiration Module**: Daily batch job for expiration checks
- **Balance Module**: Real-time balance tracking and queries
- **Multi-Currency Module**: Currency conversion and display
- **Audit Logging Module**: Comprehensive activity logging

**External Dependencies**:
- **Reward Catalog Service**: CASHBACK reward type integration
- **Payment Service**: Multi-tender payment processing
- **Notification Service**: Email/SMS for issuance and expiration
- **Accounting Service**: IFRS 15 breakage revenue recognition

---

## API Contracts

### POST /api/v1/store-credits/issue

**Description**: Issue store credit to a customer

**Authentication**: Bearer token (admin, merchant)

**Request**:
```json
{
  "customer_id": "cust_123",
  "amount": 25.00,
  "currency": "USD",
  "method": "promotional",
  "reason": "Welcome bonus",
  "expiration_months": 12,
  "metadata": {
    "campaign_id": "welcome_2025",
    "source": "admin_dashboard"
  }
}
```

**Response (201)**:
```json
{
  "id": "credit_abc123",
  "customer_id": "cust_123",
  "business_id": "biz_456",
  "amount": 25.00,
  "currency": "USD",
  "method": "promotional",
  "reason": "Welcome bonus",
  "issued_at": "2025-11-09T10:30:00Z",
  "expires_at": "2026-11-09T10:30:00Z",
  "grace_period_ends_at": "2026-12-09T10:30:00Z",
  "status": "active",
  "balance": 25.00
}
```

**Errors**:
- 400: Invalid amount or currency
- 404: Customer not found
- 403: Unauthorized

### GET /api/v1/store-credits/balance

**Description**: Get customer's store credit balance

**Authentication**: Bearer token (customer, merchant, admin)

**Query Parameters**:
- `customer_id` (required if admin/merchant)
- `currency` (optional, default: all)

**Response (200)**:
```json
{
  "customer_id": "cust_123",
  "balances": [
    {
      "currency": "USD",
      "total": 75.00,
      "available": 75.00,
      "pending": 0.00,
      "expiring_soon": [
        {
          "amount": 25.00,
          "expires_at": "2025-12-15T00:00:00Z"
        }
      ]
    },
    {
      "currency": "KHR",
      "total": 100000,
      "available": 100000,
      "pending": 0,
      "expiring_soon": []
    }
  ],
  "total_value_usd": 100.00
}
```

### POST /api/v1/store-credits/redeem

**Description**: Redeem store credit as payment

**Authentication**: Bearer token (customer)

**Request**:
```json
{
  "customer_id": "cust_123",
  "amount": 30.00,
  "currency": "USD",
  "transaction_id": "txn_789",
  "order_id": "order_456"
}
```

**Response (200)**:
```json
{
  "redemption_id": "redemption_xyz",
  "amount_redeemed": 30.00,
  "currency": "USD",
  "new_balance": 45.00,
  "credits_used": [
    {
      "credit_id": "credit_abc",
      "amount": 25.00
    },
    {
      "credit_id": "credit_def",
      "amount": 5.00
    }
  ],
  "redeemed_at": "2025-11-09T11:00:00Z"
}
```

**Errors**:
- 400: Insufficient balance
- 404: Customer not found
- 409: Concurrent redemption conflict

### GET /api/v1/store-credits/history

**Description**: Get customer's credit transaction history

**Authentication**: Bearer token (customer, merchant, admin)

**Query Parameters**:
- `customer_id` (required if merchant/admin)
- `start_date` (optional)
- `end_date` (optional)
- `type` (optional: issued, redeemed, expired, adjusted)
- `page` (default: 1)
- `limit` (default: 20)

**Response (200)**:
```json
{
  "customer_id": "cust_123",
  "transactions": [
    {
      "id": "txn_001",
      "type": "issued",
      "amount": 25.00,
      "currency": "USD",
      "method": "promotional",
      "reason": "Welcome bonus",
      "timestamp": "2025-11-09T10:30:00Z",
      "balance_after": 100.00
    },
    {
      "id": "txn_002",
      "type": "redeemed",
      "amount": -30.00,
      "currency": "USD",
      "order_id": "order_456",
      "timestamp": "2025-11-09T11:00:00Z",
      "balance_after": 70.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "has_more": true
  }
}
```

### POST /api/v1/store-credits/extend

**Description**: Extend expiration date of credit (admin only)

**Authentication**: Bearer token (admin)

**Request**:
```json
{
  "credit_id": "credit_abc",
  "new_expiration": "2027-11-09T00:00:00Z",
  "reason": "Customer service exception"
}
```

**Response (200)**:
```json
{
  "credit_id": "credit_abc",
  "old_expiration": "2026-11-09T00:00:00Z",
  "new_expiration": "2027-11-09T00:00:00Z",
  "extended_by": "admin_001",
  "reason": "Customer service exception",
  "updated_at": "2025-11-09T12:00:00Z"
}
```

---

## Database Schema

### Table: `store_credits`

```sql
CREATE TABLE store_credits (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Credit Details
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL, -- USD, KHR, SGD
  balance DECIMAL(15, 2) NOT NULL CHECK (balance >= 0),

  -- Issuance
  method VARCHAR(50) NOT NULL, -- promotional, refund, cashback_reward, automated
  reason TEXT,
  issued_by_user_id UUID REFERENCES users(id),
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  grace_period_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, fully_redeemed, expired, cancelled

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Indexes
  CONSTRAINT check_balance_not_exceed_amount CHECK (balance <= amount)
);

-- Indexes
CREATE INDEX idx_store_credits_customer ON store_credits(customer_id) WHERE status = 'active';
CREATE INDEX idx_store_credits_business ON store_credits(business_id);
CREATE INDEX idx_store_credits_expires ON store_credits(expires_at) WHERE status = 'active';
CREATE INDEX idx_store_credits_status ON store_credits(status);
CREATE INDEX idx_store_credits_currency ON store_credits(customer_id, currency) WHERE status = 'active';
```

### Table: `store_credit_transactions`

```sql
CREATE TABLE store_credit_transactions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  store_credit_id UUID NOT NULL REFERENCES store_credits(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Transaction Details
  type VARCHAR(20) NOT NULL, -- issued, redeemed, expired, adjusted, extended
  amount DECIMAL(15, 2) NOT NULL, -- positive for issuance/adjustment, negative for redemption/expiration
  currency VARCHAR(3) NOT NULL,
  balance_before DECIMAL(15, 2) NOT NULL,
  balance_after DECIMAL(15, 2) NOT NULL,

  -- Related Entities
  order_id UUID REFERENCES orders(id),
  redemption_id UUID,

  -- Actor
  actor_id UUID REFERENCES users(id),
  actor_type VARCHAR(20), -- customer, admin, system

  -- Metadata
  reason TEXT,
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_balance_after_correct CHECK (balance_after = balance_before + amount)
);

-- Indexes
CREATE INDEX idx_credit_txns_credit ON store_credit_transactions(store_credit_id);
CREATE INDEX idx_credit_txns_customer ON store_credit_transactions(customer_id);
CREATE INDEX idx_credit_txns_order ON store_credit_transactions(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_credit_txns_created ON store_credit_transactions(created_at DESC);
```

### Table: `store_credit_breakage`

```sql
CREATE TABLE store_credit_breakage (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Breakage Metrics
  total_issued DECIMAL(15, 2) NOT NULL,
  total_redeemed DECIMAL(15, 2) NOT NULL,
  total_expired DECIMAL(15, 2) NOT NULL,
  breakage_revenue DECIMAL(15, 2) NOT NULL,
  breakage_rate DECIMAL(5, 4) NOT NULL, -- e.g., 0.1500 = 15%

  -- Currency
  currency VARCHAR(3) NOT NULL,

  -- Metadata
  credits_expired_count INTEGER NOT NULL,
  recognition_method VARCHAR(20) NOT NULL, -- proportional, remote

  -- Audit
  recognized_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  recognized_by_user_id UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT unique_business_period_currency UNIQUE (business_id, period_start, period_end, currency)
);

-- Indexes
CREATE INDEX idx_breakage_business ON store_credit_breakage(business_id);
CREATE INDEX idx_breakage_period ON store_credit_breakage(period_start, period_end);
```

---

## Business Rules

### BR-SC-001: Credit Issuance Limits

**Rule**: Maximum credit issuance per customer per day
- **Default**: $500 USD equivalent
- **Configurable**: By business
- **Purpose**: Fraud prevention

**Implementation**:
```typescript
async validateIssuanceLimit(
  customerId: string,
  businessId: string,
  amount: number,
  currency: string
): Promise<void> {
  const limit = await this.getBusinessIssuanceLimit(businessId);
  const dailyTotal = await this.getDailyIssuanceTotal(customerId, businessId);
  const amountUSD = await this.convertToUSD(amount, currency);

  if (dailyTotal + amountUSD > limit) {
    throw new BusinessRuleException(
      `Daily issuance limit exceeded: ${dailyTotal + amountUSD} > ${limit}`
    );
  }
}
```

### BR-SC-002: Expiration Calculation

**Rule**: Expiration date = issued_at + expiration_months + grace_period

**Default Settings**:
- Expiration: 12 months
- Grace period: 30 days

**Implementation**:
```typescript
calculateExpiration(
  issuedAt: Date,
  expirationMonths: number = 12
): { expiresAt: Date; gracePeriodEndsAt: Date } {
  const expiresAt = addMonths(issuedAt, expirationMonths);
  const gracePeriodEndsAt = addDays(expiresAt, 30);

  return { expiresAt, gracePeriodEndsAt };
}
```

### BR-SC-003: Redemption Order (FIFO)

**Rule**: Credits redeemed in First-In-First-Out order (earliest expiration first)

**Purpose**: Minimize breakage, maximize customer value

**Implementation**:
```typescript
async getCreditsForRedemption(
  customerId: string,
  amount: number,
  currency: string
): Promise<StoreCredit[]> {
  return await this.storeCreditRepo.find({
    where: {
      customer_id: customerId,
      currency: currency,
      status: 'active',
      balance: MoreThan(0)
    },
    order: {
      expires_at: 'ASC' // FIFO by expiration
    }
  });
}
```

### BR-SC-004: VAT/GST Exclusion

**Rule**: Store credit cannot be used to pay VAT/GST

**Rationale**: Tax must be paid with cash/card (ASEAN compliance)

**Implementation**:
```typescript
calculatePayment(
  cartTotal: number,
  creditApplied: number,
  vatRate: number
): PaymentBreakdown {
  const vat = cartTotal * vatRate;
  const amountAfterCredit = Math.max(0, cartTotal - creditApplied);
  const totalDue = amountAfterCredit + vat;

  return {
    cartTotal,
    creditApplied,
    amountAfterCredit,
    vat,
    totalDue
  };
}
```

### BR-SC-005: Multi-Currency Isolation

**Rule**: Credits can only be redeemed in the currency they were issued

**Rationale**: No post-issuance currency conversion (exchange rate locked)

**Implementation**:
```typescript
async redeemCredit(
  customerId: string,
  amount: number,
  currency: string
): Promise<Redemption> {
  const credits = await this.getCreditsForRedemption(
    customerId,
    amount,
    currency // Must match
  );

  if (this.getTotalBalance(credits) < amount) {
    throw new InsufficientBalanceException(
      `Insufficient ${currency} credit balance`
    );
  }

  // Process redemption...
}
```

### BR-SC-006: Breakage Recognition

**Rule**: Recognize breakage revenue when credit expires (Remote Method)

**Accounting Entry**:
```typescript
async recognizeBreakage(expiredCredit: StoreCredit): Promise<void> {
  await this.accountingService.createJournalEntry({
    date: new Date(),
    entries: [
      {
        account: 'Store Credit Liability',
        debit: expiredCredit.balance,
        credit: 0
      },
      {
        account: 'Breakage Revenue',
        debit: 0,
        credit: expiredCredit.balance
      }
    ],
    reference: `Credit ${expiredCredit.id} expired`,
    type: 'breakage_recognition'
  });
}
```

---

## User Experience

### Customer Wallet View

**Mobile App (React Native)**:
```
┌─────────────────────────────────────┐
│  My Wallet                     [?]   │
├─────────────────────────────────────┤
│  💰 Store Credit                     │
│  $75.00 USD                          │
│  ├─ Available: $75.00                │
│  └─ Expiring Soon: $25.00 (Dec 15)  │
│                                      │
│  [View Transaction History]          │
├─────────────────────────────────────┤
│  ⭐ Loyalty Points                   │
│  5,000 points                        │
│                                      │
│  [Redeem for Rewards]                │
├─────────────────────────────────────┤
│  🎁 Digital Rewards                  │
│  2 active rewards                    │
│                                      │
│  [View Rewards]                      │
└─────────────────────────────────────┘
```

### Checkout Flow

**Web App (Next.js)**:
```
Step 3: Payment
├─ Cart Total: $100.00
├─ Payment Methods:
│  ☑️ Use Store Credit ($75.00 available)
│  │  Amount to use: [$75.00] [Apply]
│  │  Remaining: $0.00
│  │
│  ☑️ Credit Card
│     Amount: $25.00 (product) + $10.00 (VAT) = $35.00
│
└─ [Complete Purchase]
```

### Merchant Dashboard

**Credit Issuance**:
```
Issue Store Credit
├─ Customer: [Search by name/email]
├─ Amount: [$____.__]
├─ Currency: [USD ▼]
├─ Method: [Promotional ▼]
│  Options: Promotional, Refund, Manual Adjustment
├─ Reason: [___________________________]
├─ Expiration: [12 months ▼]
│
└─ [Issue Credit] [Cancel]
```

**Breakage Report**:
```
Store Credit Breakage Report
Period: November 2025

├─ Total Issued:        $120,000
├─ Total Redeemed:      $85,000
├─ Total Expired:       $18,000
├─ Breakage Revenue:    $18,000
├─ Breakage Rate:       15.0%
│
└─ [Export CSV] [View Details]
```

---

## Integration Points

### INT-SC-001: Reward Catalog

**Integration**: CASHBACK reward type creates store credit

**Flow**:
```
1. Customer redeems CASHBACK reward (e.g., 1000 points → $10 credit)
2. Reward Catalog Service → Store Credit Service API
3. Store Credit Service issues credit
4. Event published: credit.issued
5. Notification Service sends confirmation
6. Customer sees credit in wallet
```

**API Call**:
```typescript
// Reward Catalog Service
await storeCreditService.issueCredit({
  customer_id: customerId,
  amount: 10.00,
  currency: 'USD',
  method: 'cashback_reward',
  reason: `Redeemed reward: ${reward.name}`,
  metadata: {
    reward_id: reward.id,
    points_redeemed: 1000
  }
});
```

### INT-SC-002: Payment Service

**Integration**: Store credit as payment method

**Flow**:
```
1. Customer checks out with store credit
2. Payment Service → Store Credit Service: Check balance
3. Payment Service → Store Credit Service: Hold balance
4. Payment processed (cash/card for remaining + VAT)
5. Payment Service → Store Credit Service: Redeem credit
6. Event published: credit.redeemed
7. Transaction complete
```

**API Calls**:
```typescript
// Payment Service
const balance = await storeCreditService.getBalance(customerId, 'USD');
const hold = await storeCreditService.holdBalance(customerId, amount, 'USD');

try {
  await processOtherPayments();
  await storeCreditService.redeemCredit(customerId, amount, 'USD', orderId);
} catch (error) {
  await storeCreditService.releaseHold(hold.id);
  throw error;
}
```

### INT-SC-003: Accounting Service

**Integration**: Breakage revenue recognition

**Flow**:
```
1. Daily batch job identifies expired credits
2. Store Credit Service → Accounting Service: Record breakage
3. Journal entry created (DR: Liability, CR: Revenue)
4. Breakage report generated
5. Finance team notified
```

**Event**:
```typescript
// Store Credit Service publishes event
eventBus.publish('credit.expired', {
  credit_id: credit.id,
  customer_id: credit.customer_id,
  business_id: credit.business_id,
  amount: credit.balance,
  currency: credit.currency,
  expired_at: new Date()
});

// Accounting Service subscribes
@EventSubscriber('credit.expired')
async handleCreditExpired(event: CreditExpiredEvent) {
  await this.recognizeBreakageRevenue(event);
}
```

---

## Compliance & Accounting

### Compliance Summary

**ASEAN Structure**: Loyalty program benefit (not purchased product)

**Key Compliance Points**:
- ✅ Cambodia: No specific regulation, VAT 10% at redemption
- ✅ Singapore: Limited-purpose exemption, GST 9% at redemption
- ✅ Philippines: Loyalty exemption from Gift Check Act
- ✅ No escheatment obligations in ASEAN
- ✅ IFRS 15 accounting standard

**Reference**: See `/docs/requirements/features/store-credit/COMPLIANCE.md` for full details

### Accounting Implementation

**Liability Tracking**:
```typescript
class StoreCreditAccountingService {
  async recordIssuance(credit: StoreCredit): Promise<void> {
    await this.journalEntry({
      debit: { account: 'Marketing Expense', amount: credit.amount },
      credit: { account: 'Store Credit Liability', amount: credit.amount },
      reference: `Credit ${credit.id} issued`
    });
  }

  async recordRedemption(redemption: Redemption): Promise<void> {
    await this.journalEntry({
      debit: { account: 'Store Credit Liability', amount: redemption.amount },
      credit: { account: 'Revenue', amount: redemption.amount },
      reference: `Credit redeemed, Order ${redemption.order_id}`
    });
  }

  async recordBreakage(expiredCredit: StoreCredit): Promise<void> {
    await this.journalEntry({
      debit: { account: 'Store Credit Liability', amount: expiredCredit.balance },
      credit: { account: 'Breakage Revenue', amount: expiredCredit.balance },
      reference: `Credit ${expiredCredit.id} expired`
    });
  }
}
```

**Breakage Recognition**:
- **Method**: Remote (at expiration)
- **Rate**: 15% initial estimate (adjust quarterly based on actual data)
- **Frequency**: Monthly reconciliation, quarterly adjustment

---

## Testing Strategy

### Unit Tests

**Coverage Target**: 100% for business logic

**Key Test Cases**:
```typescript
describe('StoreCreditService', () => {
  describe('issueCredit', () => {
    it('should issue credit successfully');
    it('should calculate expiration correctly');
    it('should enforce issuance limits');
    it('should handle multi-currency');
    it('should create audit log entry');
  });

  describe('redeemCredit', () => {
    it('should redeem full balance');
    it('should redeem partial balance');
    it('should use FIFO order');
    it('should handle concurrent redemptions');
    it('should fail with insufficient balance');
  });

  describe('expireCredit', () => {
    it('should expire after grace period');
    it('should record breakage revenue');
    it('should not expire if grace period active');
  });
});
```

### Integration Tests

**Coverage Target**: All API endpoints and service integrations

**Test Scenarios**:
```typescript
describe('Store Credit Integration', () => {
  it('should complete end-to-end flow: issue → redeem → expire');
  it('should integrate with Reward Catalog (CASHBACK)');
  it('should integrate with Payment Service (multi-tender)');
  it('should integrate with Accounting Service (breakage)');
  it('should handle multi-currency correctly');
});
```

### E2E Tests

**Coverage Target**: Critical user journeys

**User Journeys**:
1. Customer redeems CASHBACK reward → sees credit in wallet → uses credit at checkout
2. Merchant issues promotional credit → customer receives notification → customer uses credit
3. Credit expires → breakage recognized → accounting entry created

---

## Success Metrics

### Business Metrics

**Adoption**:
- **Target**: 30% of customers with active store credit within 6 months
- **Measurement**: Customers with credit balance > 0

**Redemption Rate**:
- **Target**: 70% redemption rate (30% breakage acceptable)
- **Measurement**: (Total redeemed / Total issued) * 100

**Breakage Revenue**:
- **Target**: 10-15% of issued credits expire unredeemed
- **Measurement**: Monthly breakage revenue tracking

### Technical Metrics

**Performance**:
- Balance lookup: < 100ms (p95) ✅
- Credit issuance: < 500ms (p95) ✅
- Redemption: < 1s (p95) ✅

**Reliability**:
- Uptime: 99.9% ✅
- Transaction success rate: 99.5% ✅
- Zero credit loss incidents ✅

### Customer Satisfaction

**NPS**: Track Net Promoter Score for store credit feature
**Support Tickets**: < 1% of credits result in support ticket
**Expiration Complaints**: < 0.5% customers complain about expiration

---

**Document Status**: Ready for Technical Review & Implementation
**Next Steps**:
1. Review with engineering team
2. Create technical design doc
3. Begin implementation (Sprint 1)
4. Integration with Reward Catalog

**Related Documents**:
- `/docs/requirements/features/store-credit/COMPLIANCE.md`
- `/docs/requirements/features/unified-wallet/COMPLIANCE-SUMMARY.md`
- `/docs/requirements/features/reward-catalog/FEATURE-SPEC.md`
