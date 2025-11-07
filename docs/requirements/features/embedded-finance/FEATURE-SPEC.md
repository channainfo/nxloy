# Embedded Finance - Feature Specification

**Feature**: Embedded Finance (Pay with Points+Cash, BNPL, P2P Transfers)
**Version**: 1.0.0
**Status**: 🟡 Phase 5 Feature (Months 13-18)
**Priority**: P1 (Critical for monetization and customer retention)
**Last Updated**: 2025-11-07

---

## Problem Statement

**Current Challenge**: Loyalty programs have rigid redemption models:
- All-or-nothing redemption (500 points = free item, can't use 250 points + $2.50)
- No flexibility in payment methods
- Customers stockpile points instead of spending
- Missed revenue opportunities (customers leave rather than pay full price)
- No modern fintech features (BNPL, P2P transfers, savings wallets)

**Business Impact**:
- $2B+ in unredeemed points liability (across industry)
- Lost sales when customers don't have enough points
- Lower engagement (rigid redemption = less frequent use)
- Missed monetization opportunities (no financial services revenue)

**Why This Matters**:
- **Starbucks** allows "Stars + Cash" payments → 30% more transactions
- **Klarna** BNPL drives 45% higher average order value
- **Venmo** built $1B+ business on P2P payments
- **Apple Card** integrates loyalty (Daily Cash) with payments

---

## Solution Summary

Build comprehensive embedded finance features:

1. **Hybrid Payments**: Pay with points + cash (flexible redemption)
2. **Buy Now, Pay Later (BNPL)**: Split purchases into 4 installments
3. **P2P Transfers**: Send points/money to friends (Venmo-style)
4. **Savings Wallet**: Save points for goals ("Vacation Fund")
5. **Auto-Reload**: Automatically add funds when balance is low
6. **Loyalty Credit Card**: Co-branded credit card with bonus rewards
7. **Cashback**: Earn cash instead of points (customer choice)

**Technology Stack**:
- Payment Processing: Stripe, Adyen
- BNPL: Affirm, Klarna, Afterpay partnerships
- Banking-as-a-Service: Synapse, Unit, Treasury Prime
- Compliance: PCI DSS, PSD2, KYC/AML providers

---

## Success Criteria

| Metric | Current Baseline | Target (6 months) | Measurement |
|--------|------------------|-------------------|-------------|
| Hybrid Payment Adoption | 0% | 40%+ of transactions | % using points+cash |
| BNPL Orders | 0 | 20,000+/month | Orders with BNPL |
| P2P Transfer Volume | $0 | $500K+/month | Total sent peer-to-peer |
| Average Order Value (BNPL) | $12 | $25+ | AOV with BNPL option |
| Points Redemption Rate | 15% | 45%+ | % of earned points redeemed |
| Credit Card Signups | 0 | 10,000+ cards | Loyalty credit card |
| Revenue from Finance Features | $0 | $100K+/month | BNPL fees, card interchange |

---

## User Stories

### Customer (Flexible Spender)

**Story 1: Pay with Points + Cash**
```
As a customer with 300 points (not enough for free latte at 500 points),
I want to use my 300 points + $2.00 cash,
So that I don't lose my points and still get a discount.

Acceptance Criteria:
- At checkout, option to "Use points + cash"
- Slider to choose how many points to use
- Real-time price calculation (e.g., 300 points = $3.00 off)
- Pay remaining balance with credit card
- Seamless transaction (1-click checkout)
```

**Story 2: Buy Now, Pay Later**
```
As a customer making a $50 purchase,
I want to split it into 4 payments of $12.50,
So that I can afford the purchase without upfront payment.

Acceptance Criteria:
- BNPL option at checkout (purchases >$25)
- Choose: Pay in 4 (biweekly) or Pay in 30 days
- 0% interest, no fees (if paid on time)
- Automatic installment charges every 2 weeks
- Notification before each payment
- Earn loyalty points on full purchase amount
```

### Customer (Social User)

**Story 3: Send Points to Friend**
```
As a customer,
I want to send 500 points to my friend for their birthday,
So that they can get a free coffee on me.

Acceptance Criteria:
- "Send Points" button in app
- Enter friend's phone/email or select from friends list
- Add personal message
- Confirm transfer (authenticate with Face ID/PIN)
- Friend receives push notification + points instantly
- Transaction history shows sent/received transfers
```

### Business Owner

**Story 4: Analyze BNPL Impact**
```
As a business owner,
I want to see how BNPL affects order value and conversion rate,
So that I can decide whether to promote BNPL more.

Acceptance Criteria:
- Dashboard shows: BNPL adoption rate, AOV lift, conversion rate
- Segment analysis: BNPL users vs. non-BNPL users
- Revenue impact: Additional sales from BNPL
- Default rate: % of customers who miss payments
- Export data for financial analysis
```

---

## Functional Requirements

### Must Have (Phase 5.1: Months 13-15)

#### FR1: Hybrid Payments (Points + Cash)

**Description**: Flexible redemption - use any amount of points + cash

**Conversion Rate**:
```typescript
interface PointsToCash {
  pointValue: number; // 1 point = $0.01 USD (example)
  minRedemption: number; // Min 100 points ($1.00)
  maxRedemption: number; // Max 10,000 points per transaction
}

const conversion: PointsToCash = {
  pointValue: 0.01, // 100 points = $1.00
  minRedemption: 100,
  maxRedemption: 10000
};
```

**Checkout Flow**:
```
┌─────────────────────────────────────────────────────────┐
│  🛒 Checkout                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Order Total: $12.50                                    │
│                                                         │
│  Your Points Balance: 800 points ($8.00 value)         │
│                                                         │
│  Use Points + Cash:                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Points: [────●──────] 500 points = $5.00 off    │   │
│  │                                                  │   │
│  │ 0 ──────────────────── 800 (max)                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Breakdown:                                             │
│  • Points discount: -$5.00 (500 points)                │
│  • Subtotal: $7.50                                     │
│  • Tax: $0.60                                           │
│  • Total to charge: $8.10                               │
│                                                         │
│  💳 Pay $8.10 with:                                     │
│  ○ Credit Card ending in 1234                           │
│  ○ Apple Pay                                            │
│  ○ Google Pay                                           │
│                                                         │
│  [Complete Purchase]                                    │
│                                                         │
│  After purchase:                                        │
│  • Points remaining: 300                                │
│  • Points earned: 81 (10% of $8.10)                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**API Endpoint**:
```typescript
POST /api/v1/finance/checkout/hybrid
{
  "customerId": "cust-123",
  "orderTotal": 12.50,
  "pointsToUse": 500, // Customer-selected
  "paymentMethodId": "pm_1234"
}

Response:
{
  "pointsRedeemed": 500,
  "pointsValue": 5.00,
  "subtotal": 7.50,
  "tax": 0.60,
  "totalCharged": 8.10,
  "paymentIntentId": "pi_5678",
  "pointsEarned": 81 // On $8.10 charged (10% cashback)
}
```

---

#### FR2: Buy Now, Pay Later (BNPL)

**Description**: Split purchases into installments via Affirm, Klarna, Afterpay

**BNPL Options**:
```typescript
interface BNPLOption {
  provider: 'AFFIRM' | 'KLARNA' | 'AFTERPAY';
  minPurchaseAmount: number; // $25 minimum
  plans: BNPLPlan[];
}

interface BNPLPlan {
  name: string;
  installments: number;
  frequency: 'BIWEEKLY' | 'MONTHLY';
  interestRate: number; // 0% if paid on time
  fees: number; // $0 if paid on time
}

const bnplOptions: BNPLOption[] = [
  {
    provider: 'AFFIRM',
    minPurchaseAmount: 25,
    plans: [
      {
        name: 'Pay in 4',
        installments: 4,
        frequency: 'BIWEEKLY',
        interestRate: 0,
        fees: 0
      },
      {
        name: 'Pay in 12 months',
        installments: 12,
        frequency: 'MONTHLY',
        interestRate: 0.10, // 10% APR (longer term)
        fees: 0
      }
    ]
  },
  {
    provider: 'KLARNA',
    minPurchaseAmount: 25,
    plans: [
      {
        name: 'Pay in 4',
        installments: 4,
        frequency: 'BIWEEKLY',
        interestRate: 0,
        fees: 0
      },
      {
        name: 'Pay in 30 days',
        installments: 1,
        frequency: 'MONTHLY',
        interestRate: 0,
        fees: 0
      }
    ]
  }
];
```

**BNPL Checkout UI**:
```
┌─────────────────────────────────────────────────────────┐
│  💳 Payment Options                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Order Total: $50.00                                    │
│                                                         │
│  ○ Pay Now ($50.00)                                     │
│                                                         │
│  ● Buy Now, Pay Later 💡 Popular                        │
│    ┌───────────────────────────────────────────────┐   │
│    │  Pay in 4 interest-free payments of $12.50    │   │
│    │                                                │   │
│    │  📅 Payment Schedule:                          │   │
│    │  • Today: $12.50                               │   │
│    │  • Dec 1: $12.50                               │   │
│    │  • Dec 15: $12.50                              │   │
│    │  • Dec 29: $12.50                              │   │
│    │                                                │   │
│    │  ✅ 0% interest if paid on time                │   │
│    │  ✅ Earn full 500 points today                 │   │
│    │                                                │   │
│    │  Powered by Affirm                             │   │
│    └───────────────────────────────────────────────┘   │
│                                                         │
│  [Continue with Affirm]                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Integration**:
```typescript
// Affirm checkout
const affirmCheckout = await affirmSDK.checkout({
  merchant: {
    user_confirmation_url: 'https://nxloy.com/affirm/confirm',
    user_cancel_url: 'https://nxloy.com/affirm/cancel'
  },
  order_id: 'order-123',
  shipping_amount: 0,
  tax_amount: 0,
  total: 5000, // $50.00 in cents
  items: [
    {
      display_name: 'Coffee Rewards Purchase',
      sku: 'order-123',
      unit_price: 5000,
      qty: 1
    }
  ]
});

// Customer completes Affirm flow
// Affirm charges $12.50 today, schedules 3 more payments
```

**Business Revenue**:
- BNPL provider pays business upfront ($50.00)
- Business pays BNPL fee (2-6% of transaction)
- Customer pays installments to BNPL provider
- Net: Business gets $47-49 upfront vs. $50 if customer paid normally

---

#### FR3: P2P Point/Money Transfers

**Description**: Send points or money to friends (Venmo/Zelle-style)

**Transfer Types**:
```typescript
interface P2PTransfer {
  senderId: UUID;
  recipientId: UUID;
  type: 'POINTS' | 'MONEY';
  amount: number; // Points or USD
  message?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  fee: number; // 0 for points, 1% for money
}

// Example: Send points
const pointsTransfer: P2PTransfer = {
  senderId: 'cust-123',
  recipientId: 'cust-456',
  type: 'POINTS',
  amount: 500, // 500 points
  message: 'Happy birthday! ☕',
  status: 'COMPLETED',
  fee: 0 // Free
};

// Example: Send money
const moneyTransfer: P2PTransfer = {
  senderId: 'cust-123',
  recipientId: 'cust-456',
  type: 'MONEY',
  amount: 10.00, // $10.00 USD
  message: 'Thanks for coffee!',
  status: 'COMPLETED',
  fee: 0.10 // 1% fee ($0.10)
};
```

**Send Money UI**:
```
┌─────────────────────────────────────────────────────────┐
│  💸 Send Points or Money                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Send to:                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔍 Search friends or enter phone/email          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Recent:                                                │
│  • 👤 Alice Johnson                                     │
│  • 👤 Bob Smith                                         │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [Selected: Alice Johnson]                              │
│                                                         │
│  Amount:                                                │
│  ○ Points: [500] (Your balance: 1,250)                  │
│  ○ Money: [$10.00] (Wallet balance: $45.00)            │
│                                                         │
│  Message (optional):                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Happy birthday! ☕                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Total: 500 points (no fee)                             │
│                                                         │
│  [Send 500 Points]                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘

[Transaction confirmed]

┌─────────────────────────────────────────────────────────┐
│  ✅ Sent!                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  You sent 500 points to Alice Johnson                   │
│  "Happy birthday! ☕"                                    │
│                                                         │
│  Alice will receive a notification now.                 │
│                                                         │
│  [Done]                                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Anti-Fraud**:
- Daily limits: 1,000 points or $50 per day
- Recipient verification: Must have verified phone/email
- Velocity checks: Max 5 transfers per day
- ML fraud detection: Flag suspicious patterns

---

#### FR4: Savings Wallet (Goal-Based Saving)

**Description**: Save points/money for specific goals

**Savings Goals**:
```typescript
interface SavingsGoal {
  id: UUID;
  customerId: UUID;
  name: string; // "Vacation Fund," "Holiday Gifts"
  goalAmount: number; // Target (points or USD)
  currentAmount: number; // Progress
  currency: 'POINTS' | 'USD';
  deadline?: Date;
  autoDeposit: boolean; // Auto-transfer X% of earnings
  autoDepositRate?: number; // 10% = save 10% of all points earned
}

const savingsGoals: SavingsGoal[] = [
  {
    id: 'goal-1',
    customerId: 'cust-123',
    name: 'Vacation Fund',
    goalAmount: 5000, // 5,000 points
    currentAmount: 2340,
    currency: 'POINTS',
    deadline: new Date('2025-08-01'),
    autoDeposit: true,
    autoDepositRate: 0.20 // Save 20% of earned points
  },
  {
    id: 'goal-2',
    customerId: 'cust-123',
    name: 'Holiday Gifts',
    goalAmount: 100.00, // $100
    currentAmount: 45.00,
    currency: 'USD',
    deadline: new Date('2025-12-20'),
    autoDeposit: false
  }
];
```

**Savings Goal UI**:
```
┌─────────────────────────────────────────────────────────┐
│  🎯 Savings Goals                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  ✈️ Vacation Fund                                 │ │
│  │  Target: 5,000 points by Aug 1                    │ │
│  │                                                   │ │
│  │  Progress: ████████████░░░░░░░░ 47% (2,340 pts)  │ │
│  │  Remaining: 2,660 points                          │ │
│  │                                                   │ │
│  │  Auto-save: 20% of all points earned ✅           │ │
│  │                                                   │ │
│  │  [Add Points] [Edit Goal]                         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  🎁 Holiday Gifts                                 │ │
│  │  Target: $100.00 by Dec 20                        │ │
│  │                                                   │ │
│  │  Progress: █████████░░░░░░░░░░░ 45% ($45.00)     │ │
│  │  Remaining: $55.00                                │ │
│  │                                                   │ │
│  │  Auto-save: Off                                   │ │
│  │                                                   │ │
│  │  [Add Money] [Edit Goal]                          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [+ Create New Goal]                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Should Have (Phase 5.2: Months 16-17)

#### FR5: Auto-Reload

**Description**: Automatically reload points/money when balance is low

```typescript
interface AutoReload {
  enabled: boolean;
  triggerAmount: number; // Reload when balance < X
  reloadAmount: number; // Add X points/money
  paymentMethodId: string;
  type: 'POINTS' | 'MONEY';
}

const autoReload: AutoReload = {
  enabled: true,
  triggerAmount: 100, // Reload when < 100 points
  reloadAmount: 500, // Add 500 points ($5.00)
  paymentMethodId: 'pm_1234',
  type: 'POINTS'
};
```

---

#### FR6: Loyalty Credit Card

**Description**: Co-branded credit card with bonus rewards

**Benefits**:
- 3x points on purchases at Coffee Rewards
- 2x points on dining
- 1x points on everything else
- $50 signup bonus
- No annual fee

**Revenue**:
- Interchange fees: 2-3% of transactions
- Partner with issuer (Chase, Capital One)

---

#### FR7: Cashback Option

**Description**: Earn cash instead of points (customer choice)

```typescript
interface RewardPreference {
  customerId: UUID;
  mode: 'POINTS' | 'CASHBACK';
  cashbackRate: number; // 1% = $0.01 per $1 spent
}

const preference: RewardPreference = {
  customerId: 'cust-123',
  mode: 'CASHBACK', // Earn cash instead of points
  cashbackRate: 0.01 // 1% cashback
};
```

---

### Could Have (Phase 5.3: Month 18+)

#### FR8: Crypto Wallet
- Store Bitcoin, Ethereum alongside points
- Pay with crypto at checkout

#### FR9: Stock Rewards
- Earn fractional shares instead of points
- Partner with Robinhood, Stash

#### FR10: Insurance Products
- Phone insurance, purchase protection
- Partner with Aon, Assurant

---

## Non-Functional Requirements

### Security
- **NFR1**: PCI DSS Level 1 compliance (payment security)
- **NFR2**: KYC/AML verification for P2P transfers >$500/day
- **NFR3**: Fraud detection (ML-based)
- **NFR4**: 2FA for high-value transactions ($100+)

### Compliance
- **NFR5**: PSD2 compliance (EU Strong Customer Authentication)
- **NFR6**: SOC 2 Type II audit
- **NFR7**: GDPR compliance (financial data)

### Performance
- **NFR8**: Payment processing: <3s
- **NFR9**: P2P transfers: Instant (<1s)
- **NFR10**: BNPL checkout: <5s

---

## API Endpoints

```typescript
// Hybrid payments
POST /api/v1/finance/checkout/hybrid

// BNPL
POST /api/v1/finance/bnpl/checkout
GET /api/v1/finance/bnpl/installments

// P2P transfers
POST /api/v1/finance/transfer/send
GET /api/v1/finance/transfer/history

// Savings goals
GET /api/v1/finance/savings-goals
POST /api/v1/finance/savings-goals
PUT /api/v1/finance/savings-goals/{id}

// Auto-reload
GET /api/v1/finance/auto-reload
PUT /api/v1/finance/auto-reload
```

---

## Domain Events

```typescript
finance.hybrid_payment.completed: {
  customerId, orderTotal, pointsRedeemed, cashCharged, timestamp
}

finance.bnpl.order_created: {
  customerId, provider, orderAmount, installments, timestamp
}

finance.transfer.sent: {
  senderId, recipientId, type, amount, fee, timestamp
}

finance.savings_goal.achieved: {
  customerId, goalId, goalName, goalAmount, timestamp
}

finance.auto_reload.triggered: {
  customerId, type, amount, timestamp
}
```

---

## Rollout Plan

### Phase 5.1: Core Features (Months 13-15)
- Month 13: Hybrid payments (points+cash)
- Month 14: BNPL integration (Affirm, Klarna)
- Month 15: P2P transfers, savings goals

### Phase 5.2: Advanced Features (Months 16-17)
- Month 16: Auto-reload, loyalty credit card
- Month 17: Cashback option

### Phase 5.3: Expansion (Month 18+)
- Crypto wallet
- Stock rewards
- Insurance products

---

## Success Metrics

**After 6 Months**:
- 40%+ hybrid payment adoption
- 20,000+ BNPL orders/month
- $500K+ P2P transfer volume
- 45%+ points redemption rate
- $100K+/month revenue from finance features

---

## Risks & Mitigation

1. **Regulatory Compliance**: Hire fintech compliance experts, partner with licensed BaaS providers
2. **Fraud**: ML fraud detection, transaction limits, 2FA
3. **BNPL Defaults**: Partner with reputable providers (Affirm, Klarna handle collections)
4. **Customer Confusion**: Clear UI/UX, in-app education, tooltips
5. **Payment Failures**: Retry logic, notifications, grace periods

---

## References

- [Stripe Payments Documentation](https://stripe.com/docs/payments)
- [Affirm Integration Guide](https://docs.affirm.com/)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/)
- [Banking-as-a-Service Providers](https://unit.co)

---

**Document Owner**: Backend Team (Fintech Squad)
**Last Updated**: 2025-11-07
**Status**: Ready for Review
