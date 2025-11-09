# Unified Wallet Architecture Review

**Document Version**: 1.0.0
**Review Date**: 2025-11-09
**Reviewer**: Architecture Review Agent
**Scope**: Store Credit, Gift Cards, and Unified Wallet Feature Specifications

---

## Executive Summary

### Overall Assessment: **STRONG** ✅

The three wallet feature specifications demonstrate a well-architected, compliance-first approach suitable for ASEAN markets. The design shows strong consideration for:

- ✅ **ASEAN Compliance**: Excellent loyalty program structure avoiding gift card regulations
- ✅ **Multi-Tenancy**: Proper business_id partitioning throughout
- ✅ **Event-Driven Architecture**: Clean service boundaries with event-based integration
- ✅ **Security**: Comprehensive authentication, authorization, and audit trails
- ✅ **Scalability**: Microservices pattern with caching and horizontal scaling support

### Critical Findings: 2 HIGH, 5 MEDIUM, 8 LOW

**HIGH Priority** (Must Address Before Production):
1. Saga compensation logic needs explicit timeout and retry handling
2. Distributed lock mechanism required for concurrent redemption prevention

**MEDIUM Priority** (Should Address Before Scale):
1. WebSocket connection scalability needs load balancer strategy
2. Cache invalidation race condition potential in high-concurrency scenarios
3. Database indexes need optimization for multi-currency queries
4. Breakage revenue recognition timing needs audit-proof implementation
5. Multi-currency exchange rate snapshot strategy undefined

**Strengths**:
- Strong compliance foundation (ASEAN-first, loyalty exemptions)
- Comprehensive audit trails and transaction logging
- Well-designed API contracts with clear error handling
- Thoughtful UX design for multi-tender redemption
- Robust business rules implementation (FIFO, VAT exclusion, depletion order)

### Recommendations Priority

**Phase 1 (Before Implementation)**:
1. Implement distributed locking for redemption atomicity
2. Define Saga timeout and retry policies
3. Add database indexes for performance-critical queries
4. Implement circuit breakers for service resilience

**Phase 2 (Before Scale)**:
1. WebSocket horizontal scaling with Redis Pub/Sub
2. Cache warming strategy for high-traffic periods
3. Database connection pooling optimization
4. Rate limiting refinement based on load testing

**Phase 3 (Continuous Improvement)**:
1. Machine learning for breakage prediction
2. Advanced fraud detection patterns
3. Multi-region data replication strategy

---

## Detailed Findings by Review Area

### 1. Architecture & Design

#### ✅ **Strengths**

**Service Boundaries** (Score: 9/10):
- Clean separation: Wallet Service (aggregation) vs. Points/StoreCredit/DigitalReward Services (domain logic)
- Single Responsibility Principle adhered to
- Clear API contracts between services

**Event-Driven Integration** (Score: 9/10):
- Proper use of domain events (`StoreCredit.Issued`, `DigitalReward.Redeemed`, etc.)
- Event-driven cache invalidation strategy
- Asynchronous processing for accounting integration

**Data Flow** (Score: 8/10):
- Well-documented flows for multi-tender redemption
- Clear separation of concerns (validation → execution → notification)

#### ⚠️ **Issues & Recommendations**

**HIGH: Saga Compensation Needs Timeout Handling**

**Issue**:
```typescript
// Current implementation (from Unified Wallet spec)
class WalletRedemptionSaga {
  async execute(request: WalletRedemptionRequest): Promise<WalletRedemptionResponse> {
    const compensations: Array<() => Promise<void>> = [];

    try {
      // Step 1: Redeem digital rewards
      const drRedemption = await this.digitalRewardService.redeem({...});
      compensations.push(async () => {
        await this.digitalRewardService.reverseRedemption(drRedemption.id);
      });

      // Step 2: Redeem store credit
      const scRedemption = await this.storeCreditService.redeem({...});
      compensations.push(async () => {
        await this.storeCreditService.reverseRedemption(scRedemption.id);
      });

      // ... more steps
    } catch (error) {
      // Compensate in reverse order
      for (const compensate of compensations.reverse()) {
        await compensate();  // ⚠️ No timeout, no retry, no dead-letter handling
      }
      throw error;
    }
  }
}
```

**Problem**: If a compensation step hangs or fails, the saga can leave the system in an inconsistent state.

**Recommendation**:
```typescript
class WalletRedemptionSaga {
  private readonly COMPENSATION_TIMEOUT = 5000; // 5 seconds
  private readonly MAX_RETRIES = 3;

  async execute(request: WalletRedemptionRequest): Promise<WalletRedemptionResponse> {
    const compensations: Array<CompensationStep> = [];
    const sagaId = uuidv4();

    // Persist saga state for recovery
    await this.sagaRepository.create({
      id: sagaId,
      type: 'wallet_redemption',
      status: 'started',
      request,
      timestamp: new Date()
    });

    try {
      // Forward steps with timeout
      const drRedemption = await this.executeWithTimeout(
        () => this.digitalRewardService.redeem({...}),
        10000  // 10 second timeout
      );

      compensations.push({
        name: 'digital_reward_reversal',
        execute: async () => {
          await this.digitalRewardService.reverseRedemption(drRedemption.id);
        }
      });

      // ... more steps

      // Success: Mark saga complete
      await this.sagaRepository.complete(sagaId);
      return result;

    } catch (error) {
      // Compensate with timeout and retry
      await this.sagaRepository.updateStatus(sagaId, 'compensating');

      for (const compensation of compensations.reverse()) {
        await this.compensateWithRetry(
          compensation,
          this.MAX_RETRIES,
          this.COMPENSATION_TIMEOUT
        );
      }

      await this.sagaRepository.updateStatus(sagaId, 'compensated');
      throw error;
    }
  }

  private async compensateWithRetry(
    step: CompensationStep,
    maxRetries: number,
    timeout: number
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.executeWithTimeout(step.execute, timeout);
        return; // Success
      } catch (error) {
        if (attempt === maxRetries) {
          // Final attempt failed → Send to dead-letter queue
          await this.deadLetterQueue.publish({
            type: 'compensation_failed',
            step: step.name,
            error: error.message,
            timestamp: new Date()
          });
          throw error;
        }
        // Exponential backoff
        await sleep(Math.pow(2, attempt) * 100);
      }
    }
  }

  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  }
}
```

**Impact**: Critical for production reliability. Without this, failed compensations can leave customer balances in inconsistent states.

---

**HIGH: Concurrent Redemption Needs Distributed Locking**

**Issue**:
The specs mention "optimistic locking or distributed locks" but don't specify implementation. In a multi-instance deployment, optimistic locking alone is insufficient.

**Scenario**:
```
Time  Instance A                    Instance B
────────────────────────────────────────────────────
T0    Customer has $50 credit
T1    GET balance → $50            GET balance → $50
T2    Redeem $50 ✓                 Redeem $50 ✓
T3    Balance = $0                 Balance = -$50 ❌ (double-spend)
```

**Recommendation**:
```typescript
// Use Redis distributed locks (Redlock algorithm)
import Redlock from 'redlock';

class StoreCredit Service {
  private redlock: Redlock;

  async redeem(request: RedeemRequest): Promise<Redemption> {
    const lockKey = `lock:store_credit:${request.customer_id}:${request.currency}`;
    const lock = await this.redlock.acquire([lockKey], 2000); // 2 second TTL

    try {
      // Critical section: Check balance and execute redemption
      const balance = await this.getBalance(request.customer_id, request.currency);

      if (balance < request.amount) {
        throw new InsufficientBalanceError();
      }

      const redemption = await this.executeRedemption(request);

      return redemption;

    } finally {
      await lock.release();
    }
  }
}

// Redlock configuration (multi-node for HA)
const redlock = new Redlock(
  [redisClient1, redisClient2, redisClient3],  // Multiple Redis instances
  {
    driftFactor: 0.01,
    retryCount: 3,
    retryDelay: 200,
    retryJitter: 200
  }
);
```

**Alternative**: Use PostgreSQL row-level locks (simpler but less scalable):
```typescript
async redeem(request: RedeemRequest): Promise<Redemption> {
  return await this.db.transaction(async (trx) => {
    // SELECT FOR UPDATE locks the row
    const credits = await trx('store_credits')
      .where({
        customer_id: request.customer_id,
        currency: request.currency,
        status: 'active'
      })
      .orderBy('expires_at', 'asc')
      .forUpdate()  // ← Row-level lock
      .select();

    const totalBalance = credits.reduce((sum, c) => sum + c.balance, 0);

    if (totalBalance < request.amount) {
      throw new InsufficientBalanceError();
    }

    // Execute FIFO redemption
    // ...
  });
}
```

**Recommendation**: Use PostgreSQL row locks for Phase 1 (simpler), migrate to Redlock for Phase 2 (when scaling horizontally).

**Impact**: Critical. Without proper locking, customers can double-spend balances.

---

**MEDIUM: WebSocket Scalability Strategy**

**Issue**:
Unified Wallet spec shows WebSocket for real-time updates but doesn't address horizontal scaling:

```typescript
// Current implementation (single-instance)
class WalletEventHandler {
  @EventHandler('StoreCredit.Redeemed')
  async handleBalanceChange(event: BalanceChangeEvent): Promise<void> {
    // Invalidate cache
    await this.redis.del(`wallet:balance:${event.customer_id}`);

    // Broadcast to WebSocket clients
    await this.websocketGateway.broadcastToCustomer(event.customer_id, {
      event: 'wallet.balance_updated',
      changes: {...}
    });
  }
}
```

**Problem**: In a multi-instance deployment, the WebSocket connection might be on a different instance than the event handler.

```
Customer connected to Instance A
Event received by Instance B
→ Customer doesn't get real-time update ❌
```

**Recommendation**:
```typescript
// Use Redis Pub/Sub for cross-instance broadcasting
class WalletEventHandler {
  @EventHandler('StoreCredit.Redeemed')
  async handleBalanceChange(event: BalanceChangeEvent): Promise<void> {
    // Invalidate cache
    await this.redis.del(`wallet:balance:${event.customer_id}`);

    // Publish to Redis channel (all instances subscribe)
    await this.redis.publish('wallet:updates', JSON.stringify({
      customer_id: event.customer_id,
      event: 'wallet.balance_updated',
      changes: {...}
    }));
  }
}

// WebSocket Gateway subscribes to Redis channel
class WebSocketGateway implements OnModuleInit {
  async onModuleInit() {
    this.redisSubscriber.subscribe('wallet:updates');

    this.redisSubscriber.on('message', (channel, message) => {
      const update = JSON.parse(message);

      // Find WebSocket connection on THIS instance
      const connection = this.connections.get(update.customer_id);
      if (connection) {
        connection.send(JSON.stringify(update));
      }
    });
  }
}
```

**Impact**: Medium. Required for horizontal scaling beyond single instance.

---

**MEDIUM: Cache Invalidation Race Condition**

**Issue**:
Cache invalidation happens in event handler, but there's a potential race condition:

```
Time  Thread A                     Thread B
───────────────────────────────────────────────────
T0    Redeem $20 credit
T1    Update DB (balance = $30)
T2    Publish event
T3                                 GET balance (cache miss)
T4                                 Query DB → $30
T5                                 Cache $30 (TTL: 5 min)
T6    Event handler runs
T7    Invalidate cache ❌          (cache already repopulated with stale data)
T8                                 GET balance → $30 ❌ (should be $25 after next redemption)
```

**Recommendation**:
Use cache versioning with timestamps:

```typescript
interface CachedBalance {
  data: WalletBalance;
  version: number;  // Monotonically increasing
  cached_at: number;  // Unix timestamp
}

class WalletService {
  async getBalance(customerId: string): Promise<WalletBalance> {
    const cacheKey = `wallet:balance:${customerId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      const { data, cached_at } = JSON.parse(cached);

      // Check if cache is fresh (< 5 seconds old)
      if (Date.now() - cached_at < 5000) {
        return data;
      }
    }

    // Fetch from services
    const balance = await this.aggregateBalances(customerId);

    // Cache with timestamp
    await this.redis.setex(
      cacheKey,
      300,  // 5 minutes
      JSON.stringify({
        data: balance,
        version: Date.now(),  // Use timestamp as version
        cached_at: Date.now()
      })
    );

    return balance;
  }

  @EventHandler('*.Redeemed')
  async handleBalanceChange(event: BalanceChangeEvent): Promise<void> {
    const cacheKey = `wallet:balance:${event.customer_id}`;

    // Invalidate cache with version check
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      const { version } = JSON.parse(cached);

      // Only invalidate if cached version is older than event
      if (version < event.timestamp.getTime()) {
        await this.redis.del(cacheKey);
      }
    }
  }
}
```

**Impact**: Medium. Can cause temporary stale balance display (up to 5 minutes).

---

### 2. Security

#### ✅ **Strengths**

**Authentication & Authorization** (Score: 9/10):
- OAuth 2.0 + JWT properly specified
- RBAC with clear roles (customer, admin, manager, partner)
- Customer can only access own wallet (authorization checks)

**Audit Trails** (Score: 10/10):
- Comprehensive transaction logging across all balance types
- Immutable append-only ledgers
- User identity and IP address captured
- 7-year data retention for compliance

**Fraud Prevention** (Score: 8/10):
- Rate limiting specified (10 requests/min for balance queries)
- Concurrent redemption handling via 409 Conflict
- Approval workflows for manual credit issuance

#### ⚠️ **Issues & Recommendations**

**MEDIUM: Rate Limiting Refinement Needed**

**Issue**:
Current rate limiting is too coarse:
- 10 requests/min for balance queries (could be abused for DoS)
- No differentiation between read and write operations
- No IP-based rate limiting

**Recommendation**:
```typescript
// Tiered rate limiting
const rateLimits = {
  // Read operations (more lenient)
  'GET /api/v1/wallet/balance': {
    per_user: 60,  // 60 requests/min per user
    per_ip: 300     // 300 requests/min per IP
  },

  // Write operations (stricter)
  'POST /api/v1/wallet/redeem': {
    per_user: 10,   // 10 redemptions/min per user
    per_ip: 50      // 50 redemptions/min per IP (prevents credential stuffing)
  },

  // Admin operations (very strict)
  'POST /api/v1/store-credits/issue': {
    per_user: 30,   // 30 issuances/min per admin
    requires_approval: true  // High-value issuances need dual approval
  }
};

// Suspicious pattern detection
class FraudDetectionService {
  async detectSuspiciousRedemption(request: RedemptionRequest): Promise<boolean> {
    const recentRedemptions = await this.getRecentRedemptions(
      request.customer_id,
      5 * 60 * 1000  // Last 5 minutes
    );

    // Flag suspicious patterns
    if (recentRedemptions.length > 5) {
      await this.alertService.notify({
        severity: 'MEDIUM',
        message: `Suspicious redemption velocity: ${request.customer_id}`,
        details: { count: recentRedemptions.length }
      });
      return true;
    }

    // Check if redemption amount is abnormally high
    const avgRedemption = await this.getAverageRedemption(request.customer_id);
    if (request.amount > avgRedemption * 5) {
      await this.alertService.notify({
        severity: 'HIGH',
        message: `Abnormally high redemption: ${request.customer_id}`,
        details: { amount: request.amount, average: avgRedemption }
      });
      return true;
    }

    return false;
  }
}
```

**Impact**: Medium. Current rate limits may not prevent sophisticated attacks.

---

**LOW: Admin Action Approval Workflow**

**Issue**:
Store Credit and Digital Reward specs allow admins to issue/extend credits without approval workflow for high-value operations.

**Recommendation**:
```typescript
// Dual approval for high-value operations
interface IssuanceLimits {
  auto_approve_threshold: number;  // $100
  requires_manager_approval: number;  // $100 - $1000
  requires_dual_approval: number;  // > $1000
}

class StoreCreditService {
  async issue(request: IssueRequest, issuedBy: User): Promise<StoreCredit> {
    const limits = await this.getLimitsForBusiness(request.business_id);

    if (request.amount > limits.requires_dual_approval) {
      // High-value: Requires manager + finance approval
      const approval = await this.approvalService.requestApproval({
        type: 'store_credit_issuance',
        amount: request.amount,
        requestedBy: issuedBy.id,
        approvers: ['manager', 'finance'],
        expiresIn: 24 * 60 * 60 * 1000  // 24 hours
      });

      if (!approval.approved) {
        throw new ApprovalRequiredError(approval.id);
      }
    } else if (request.amount > limits.requires_manager_approval) {
      // Medium-value: Requires manager approval
      // ... similar logic
    }

    // Proceed with issuance
    return await this.executeIssuance(request);
  }
}
```

**Impact**: Low. Nice-to-have for fraud prevention in large businesses.

---

### 3. ASEAN Compliance Alignment

#### ✅ **Strengths** (Score: 10/10)

**Loyalty Program Structure**:
- Consistently positioned as loyalty benefits (not purchased) across all specs
- Clear documentation of exemption strategy for Philippines, Singapore, Cambodia
- Strong warnings against purchased gift cards in Philippines

**VAT/GST Treatment**:
- Tax at redemption (not issuance) correctly specified
- Customer pays VAT/GST separately (not deducted from loyalty assets)
- Correct rates: Cambodia 10%, Singapore 9%

**Breakage Revenue**:
- Remote method (recognize at expiration) properly documented
- No escheatment complications (ASEAN advantage highlighted)
- Conservative 15% estimate with quarterly review

#### ⚠️ **Issues & Recommendations**

**MEDIUM: Breakage Recognition Timing Audit Trail**

**Issue**:
Breakage revenue recognition happens in batch job (daily), but specs don't specify audit-proof timing:

```typescript
// Current implementation (from Store Credit spec)
class ExpirationBatchJob {
  async processExpirations(): Promise<void> {
    const now = new Date();

    // Transition: expired → fully_expired (grace period ended)
    const fullyExpiredCredits = await this.creditRepository.findMany({
      status: 'expired',
      grace_period_ends_at: { lte: now }
    });

    for (const credit of fullyExpiredCredits) {
      // ⚠️ No audit proof of WHEN breakage was recognized
      await this.creditRepository.update(credit.id, {
        status: 'fully_expired',
        balance: 0
      });
    }
  }
}
```

**Recommendation**:
```typescript
// Add explicit audit fields
interface StoreCredit {
  // ... existing fields
  breakage_recognized_at?: Date;  // When breakage revenue recognized
  breakage_recognition_period?: string;  // E.g., "2025-Q4"
  breakage_journal_entry_id?: string;  // Reference to accounting entry
}

class ExpirationBatchJob {
  async processExpirations(): Promise<void> {
    const now = new Date();
    const period = this.getCurrentFiscalPeriod(now);  // E.g., "2025-Q4"

    const fullyExpiredCredits = await this.creditRepository.findMany({
      status: 'expired',
      grace_period_ends_at: { lte: now },
      breakage_recognized_at: null  // Not yet recognized
    });

    for (const credit of fullyExpiredCredits) {
      // Create journal entry FIRST
      const journalEntry = await this.accountingService.recognizeBreakage({
        business_id: credit.businessId,
        amount: credit.balance,
        currency: credit.currency,
        period,
        credit_id: credit.id
      });

      // Update credit with audit trail
      await this.creditRepository.update(credit.id, {
        status: 'fully_expired',
        balance: 0,
        breakage_recognized_at: now,
        breakage_recognition_period: period,
        breakage_journal_entry_id: journalEntry.id
      });

      // Emit event for secondary audit log
      await this.eventBus.publish('StoreCredit.BreakageRecognized', {
        creditId: credit.id,
        amount: credit.balance,
        period,
        journalEntryId: journalEntry.id,
        timestamp: now
      });
    }
  }

  private getCurrentFiscalPeriod(date: Date): string {
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${year}-Q${quarter}`;
  }
}
```

**Impact**: Medium. Required for audit compliance (external auditors will ask for proof of timing).

---

**LOW: Multi-Currency Exchange Rate Snapshot**

**Issue**:
Specs say "no post-issuance currency conversion" but don't specify how to snapshot exchange rates for financial reporting.

**Scenario**:
- Customer has 40,000 KHR store credit (issued when 1 USD = 4,000 KHR)
- 6 months later, 1 USD = 4,100 KHR
- Balance sheet needs to report KHR liability in USD equivalent
- Which exchange rate to use?

**Recommendation**:
```typescript
interface StoreCredit {
  // ... existing fields
  exchange_rate_snapshot?: {
    base_currency: string;  // E.g., "USD"
    quote_currency: string;  // E.g., "KHR"
    rate: number;  // E.g., 4000 (1 USD = 4000 KHR)
    snapshot_date: Date;
    source: string;  // E.g., "National Bank of Cambodia"
  };
}

class StoreCreditService {
  async issue(request: IssueRequest): Promise<StoreCredit> {
    let exchangeRateSnapshot;

    if (request.currency !== 'USD') {
      // Fetch current exchange rate
      const rate = await this.exchangeRateService.getCurrentRate(
        'USD',
        request.currency
      );

      exchangeRateSnapshot = {
        base_currency: 'USD',
        quote_currency: request.currency,
        rate: rate.value,
        snapshot_date: new Date(),
        source: rate.source
      };
    }

    return await this.creditRepository.create({
      ...request,
      exchange_rate_snapshot: exchangeRateSnapshot
    });
  }
}

// Financial reporting uses snapshot rate
class FinancialReportingService {
  async calculateLiabilityInUSD(credit: StoreCredit): Promise<number> {
    if (credit.currency === 'USD') {
      return credit.balance;
    }

    // Use snapshot rate from issuance (IFRS 15 requirement)
    return credit.balance / credit.exchange_rate_snapshot!.rate;
  }
}
```

**Impact**: Low. Required for accurate financial reporting but not critical for Phase 1.

---

### 4. Data Consistency

#### ✅ **Strengths**

**ACID Compliance** (Score: 9/10):
- Database transactions properly used for balance updates
- Atomic multi-tender redemptions via Saga pattern
- Rollback/compensation logic specified

**Audit Trail** (Score: 10/10):
- Immutable transaction logs
- Balance_after field in all transaction tables
- External transaction ID tracking (e.g., order_id)

#### ⚠️ **Issues & Recommendations**

**MEDIUM: Eventual Consistency Window Undefined**

**Issue**:
Unified Wallet spec states "eventual consistency (1 second max)" but doesn't specify:
- What happens if consistency takes > 1 second?
- How to detect consistency violations?
- Recovery strategy?

**Recommendation**:
```typescript
// Consistency monitoring
class ConsistencyMonitorService {
  @Cron('*/10 * * * *')  // Every 10 minutes
  async checkConsistency(): Promise<void> {
    const businesses = await this.businessRepository.findAll();

    for (const business of businesses) {
      const walletLiability = await this.walletService.getTotalLiability(business.id);
      const accountingLiability = await this.accountingService.getLiability(business.id);

      const variance = Math.abs(walletLiability.usd - accountingLiability.usd);

      if (variance > 0.01) {  // Variance > 1 cent
        await this.alertService.notify({
          severity: 'HIGH',
          message: `Liability variance detected for business ${business.id}`,
          details: {
            wallet: walletLiability.usd,
            accounting: accountingLiability.usd,
            variance
          }
        });

        // Trigger reconciliation
        await this.reconciliationService.reconcile(business.id);
      }
    }
  }
}

// Reconciliation service
class ReconciliationService {
  async reconcile(businessId: string): Promise<ReconciliationReport> {
    const transactions = await this.getUnreconciledTransactions(businessId);

    for (const txn of transactions) {
      // Replay transaction to accounting service
      await this.accountingService.replayTransaction(txn);
    }

    return {
      businessId,
      transactionsReconciled: transactions.length,
      timestamp: new Date()
    };
  }
}
```

**Impact**: Medium. Required for production confidence.

---

### 5. Performance

#### ✅ **Strengths**

**Performance Targets** (Score: 8/10):
- Clear SLOs: Balance lookup < 100ms p95, Redemption < 300ms p95
- Caching strategy with 90%+ hit rate target
- Database indexes specified for performance-critical queries

#### ⚠️ **Issues & Recommendations**

**MEDIUM: Database Index Optimization**

**Issue**:
Multi-currency queries could benefit from additional composite indexes:

**Recommendation**:
```sql
-- Store Credit Service
-- Current indexes (from spec):
CREATE INDEX idx_store_credits_customer_currency_status
  ON store_credits(customer_id, currency, status)
  WHERE status = 'active';

-- Additional recommended indexes:
-- For FIFO redemption (critical path)
CREATE INDEX idx_store_credits_fifo
  ON store_credits(customer_id, currency, expires_at, status)
  WHERE status IN ('active', 'expired')
  INCLUDE (balance);  -- PostgreSQL 11+: Include balance in index

-- For expiration batch job
CREATE INDEX idx_store_credits_expiration_batch
  ON store_credits(status, grace_period_ends_at, business_id)
  WHERE status = 'expired'
  INCLUDE (balance, currency);

-- For accounting reconciliation
CREATE INDEX idx_store_credits_accounting
  ON store_credits(business_id, currency, status, created_at)
  INCLUDE (amount, balance);

-- Digital Reward Service (similar indexes)
-- Unified Wallet transaction log
CREATE INDEX idx_wallet_txn_log_customer_date
  ON wallet_transaction_log(customer_id, transaction_date DESC)
  INCLUDE (balance_type, amount, currency);
```

**Impact**: Medium. Can reduce query latency by 30-50% for high-volume operations.

---

**LOW: Database Connection Pooling**

**Issue**:
Specs don't specify connection pool configuration for high-concurrency scenarios.

**Recommendation**:
```typescript
// PostgreSQL connection pool configuration
const dbConfig = {
  // Connection pool settings
  min: 10,  // Minimum connections
  max: 50,  // Maximum connections (tune based on load testing)

  // Connection lifecycle
  idleTimeoutMillis: 30000,  // Close idle connections after 30s
  connectionTimeoutMillis: 5000,  // Fail after 5s if no connection available

  // Statement timeout (prevent long-running queries)
  statement_timeout: 10000,  // 10 seconds max per query

  // Keep-alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
};

// Monitor pool health
class DatabaseHealthService {
  @Cron('*/1 * * * *')  // Every minute
  async checkPoolHealth(): Promise<void> {
    const pool = await this.db.pool;

    const metrics = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    };

    if (metrics.waiting > 10) {
      await this.alertService.notify({
        severity: 'HIGH',
        message: 'Database connection pool exhausted',
        details: metrics
      });
    }
  }
}
```

**Impact**: Low. Important for scale but not critical for Phase 1.

---

### 6. Business Rules

#### ✅ **Strengths** (Score: 10/10)

**FIFO Redemption**:
- Properly implemented with earliest expiration first
- Clear code examples in all specs

**VAT/GST Calculation**:
- Correctly calculated on cart total (not reduced amount)
- Customer pays tax separately
- Comprehensive examples

**Multi-Currency Isolation**:
- No post-issuance conversion (correctly specified)
- Separate balances per currency
- Clear error messages for currency mismatch

**Depletion Order**:
- Configurable business rules
- Expiration override properly designed
- Customer override option

#### ⚠️ **Issues & Recommendations**

**LOW: Minimum Redemption Thresholds**

**Issue**:
Specs mention minimum redemption thresholds (e.g., "min 100 points") but don't specify user experience when below threshold.

**Recommendation**:
```typescript
// UX for minimum redemption threshold
class WalletService {
  async validateRedemption(request: RedemptionRequest): Promise<ValidationResult> {
    const config = await this.getWalletConfig(request.business_id);

    // Check minimum thresholds
    if (request.payment_methods.find(pm => pm.type === 'points')) {
      const pointsPm = request.payment_methods.find(pm => pm.type === 'points')!;

      if (pointsPm.points! < config.min_redemption_points) {
        return {
          valid: false,
          error: {
            code: 'BELOW_MIN_REDEMPTION',
            message: `Minimum ${config.min_redemption_points} points required for redemption`,
            suggestion: `You have ${pointsPm.points} points. Earn ${config.min_redemption_points - pointsPm.points!} more points to redeem.`,
            user_friendly: true  // Display to customer
          }
        };
      }
    }

    // Similar checks for store_credit, digital_rewards

    return { valid: true };
  }
}
```

**Impact**: Low. UX improvement for customer clarity.

---

### 7. API Design

#### ✅ **Strengths** (Score: 9/10)

**RESTful Conventions**:
- Proper HTTP methods (GET for reads, POST for writes)
- Consistent URL structure (`/api/v1/{resource}/{action}`)
- Standard status codes (200, 201, 400, 404, 409, 422, 503)

**Request/Response Structure**:
- Clear TypeScript interfaces for all endpoints
- Comprehensive examples with realistic data
- Metadata fields for extensibility

**Error Handling**:
- Specific error codes (InsufficientBalanceError, CurrencyMismatchError)
- User-friendly error messages
- Suggestions for resolution

#### ⚠️ **Issues & Recommendations**

**LOW: API Versioning Strategy**

**Issue**:
All APIs use `/api/v1/...` but no migration strategy for v2.

**Recommendation**:
```typescript
// Version deprecation strategy
app.use('/api/v1', (req, res, next) => {
  // Add deprecation header if v2 is available
  if (DEPRECATED_ENDPOINTS.includes(req.path)) {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', 'Sat, 1 Jan 2026 00:00:00 GMT');
    res.setHeader('Link', `</api/v2${req.path}>; rel="successor-version"`);
  }
  next();
});

// API changelog
const API_CHANGELOG = {
  'v2.0.0': {
    released: '2026-01-01',
    changes: [
      'BREAKING: /wallet/balance returns nested structure',
      'NEW: /wallet/optimize-redemption endpoint',
      'DEPRECATED: /wallet/redeem (use /wallet/checkout instead)'
    ]
  }
};
```

**Impact**: Low. Not critical for initial release but important for long-term API evolution.

---

### 8. Testing Strategy

#### ✅ **Strengths** (Score: 8/10)

**Unit Test Coverage**:
- 80% minimum, 100% for business logic (correctly specified)
- Comprehensive test cases listed (FIFO, multi-currency, VAT calculation)

**Integration Tests**:
- End-to-end flows properly designed
- Multi-tender checkout scenario well-documented

**Performance Tests**:
- Load test targets specified (100k balance lookups, 10k redemptions)
- Concurrency tests (1,000 concurrent connections)

#### ⚠️ **Issues & Recommendations**

**MEDIUM: Chaos Engineering for Saga Resilience**

**Issue**:
No mention of chaos testing for distributed transaction failures.

**Recommendation**:
```typescript
// Chaos testing scenarios
describe('Wallet Redemption Saga - Chaos Tests', () => {
  it('should handle digital reward service timeout during redemption', async () => {
    // Simulate timeout
    jest.spyOn(digitalRewardService, 'redeem')
      .mockImplementation(() => sleep(11000));  // > 10s timeout

    // Attempt redemption
    await expect(
      walletService.redeem({...})
    ).rejects.toThrow('Timeout');

    // Verify compensations executed
    expect(storeCreditService.reverseRedemption).not.toHaveBeenCalled();
    expect(pointsService.reverseRedemption).not.toHaveBeenCalled();
  });

  it('should handle compensation failure and dead-letter queue', async () => {
    // Simulate successful forward steps
    jest.spyOn(digitalRewardService, 'redeem').mockResolvedValue({...});
    jest.spyOn(storeCreditService, 'redeem').mockResolvedValue({...});

    // Simulate points service failure AFTER other services succeeded
    jest.spyOn(pointsService, 'redeem').mockRejectedValue(new Error('Service unavailable'));

    // Simulate compensation failure for digital rewards
    jest.spyOn(digitalRewardService, 'reverseRedemption')
      .mockRejectedValue(new Error('Compensation failed'));

    // Attempt redemption
    await expect(
      walletService.redeem({...})
    ).rejects.toThrow();

    // Verify dead-letter queue received failed compensation
    expect(deadLetterQueue.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'compensation_failed',
        step: 'digital_reward_reversal'
      })
    );
  });

  it('should recover from partial network partition', async () => {
    // Simulate network partition during Saga execution
    // Instance A: Processing redemption
    // Instance B: Receives event but can't reach Instance A
    // ...
  });
});
```

**Impact**: Medium. Critical for production confidence in distributed transactions.

---

### 9. Risk Assessment

| Risk | Likelihood | Impact | Severity | Mitigation Priority |
|------|-----------|--------|----------|-------------------|
| **Double-spend due to race condition** | HIGH | CRITICAL | 🔴 **HIGH** | **P0** (Implement distributed locks) |
| **Saga compensation failure** | MEDIUM | HIGH | 🔴 **HIGH** | **P0** (Add timeout + dead-letter queue) |
| **WebSocket broadcast failure in multi-instance** | HIGH | MEDIUM | 🟡 **MEDIUM** | **P1** (Redis Pub/Sub) |
| **Cache invalidation race condition** | MEDIUM | MEDIUM | 🟡 **MEDIUM** | **P1** (Cache versioning) |
| **Breakage timing audit gap** | LOW | MEDIUM | 🟡 **MEDIUM** | **P1** (Add audit fields) |
| **Database index performance** | MEDIUM | MEDIUM | 🟡 **MEDIUM** | **P1** (Optimize indexes) |
| **Rate limiting bypass** | LOW | LOW | 🟢 **LOW** | **P2** (Tiered rate limits) |
| **Minimum redemption UX** | LOW | LOW | 🟢 **LOW** | **P2** (User-friendly errors) |

---

### 10. Prioritized Recommendations

#### **Phase 1: Before Implementation** (Must-Do)

1. **✅ Implement Distributed Locking for Concurrent Redemption**
   - Tool: Redlock (Redis) or PostgreSQL row locks
   - Timeline: 2-3 days
   - Owner: Backend team

2. **✅ Add Saga Timeout and Retry Handling**
   - Implement compensation timeout (5s per step)
   - Add exponential backoff retry (max 3 attempts)
   - Dead-letter queue for failed compensations
   - Timeline: 3-4 days
   - Owner: Backend team

3. **✅ Optimize Database Indexes**
   - Add composite indexes for FIFO queries
   - Add covering indexes for accounting reconciliation
   - Timeline: 1 day
   - Owner: Database team

4. **✅ Implement Circuit Breakers for Service Resilience**
   - Prevent cascading failures if Points/StoreCredit/DigitalReward service fails
   - Timeline: 2 days
   - Owner: Backend team

---

#### **Phase 2: Before Scale** (Should-Do)

1. **✅ WebSocket Horizontal Scaling with Redis Pub/Sub**
   - Required for > 1 instance deployment
   - Timeline: 3 days
   - Owner: Backend team

2. **✅ Cache Versioning for Race Condition Prevention**
   - Implement timestamp-based cache versioning
   - Timeline: 2 days
   - Owner: Backend team

3. **✅ Breakage Recognition Audit Trail Enhancement**
   - Add `breakage_recognized_at`, `breakage_journal_entry_id` fields
   - Timeline: 1 day
   - Owner: Backend + Accounting teams

4. **✅ Consistency Monitoring and Reconciliation**
   - Automated consistency checks (every 10 minutes)
   - Reconciliation service for variance resolution
   - Timeline: 3 days
   - Owner: Backend + DevOps teams

5. **✅ Chaos Engineering Test Suite**
   - Saga failure scenarios
   - Network partition simulation
   - Service timeout testing
   - Timeline: 4 days
   - Owner: QA team

---

#### **Phase 3: Continuous Improvement** (Nice-to-Have)

1. **✅ Advanced Fraud Detection**
   - Machine learning for suspicious patterns
   - Anomaly detection for redemption velocity
   - Timeline: 2 weeks
   - Owner: Data Science team

2. **✅ Multi-Region Data Replication**
   - Required for ASEAN expansion beyond Singapore
   - Timeline: 4 weeks
   - Owner: DevOps team

3. **✅ Exchange Rate Snapshot for Financial Reporting**
   - Required for accurate multi-currency liability reporting
   - Timeline: 1 week
   - Owner: Backend + Finance teams

4. **✅ API Versioning and Deprecation Strategy**
   - Prepare for v2 API evolution
   - Timeline: 1 week
   - Owner: Backend team

---

### 11. Implementation Checklist

#### **High Priority (Before Production)**

- [ ] Implement Redlock or PostgreSQL row locks for concurrent redemption
- [ ] Add Saga timeout handling (5s per step, 3 retries max)
- [ ] Create dead-letter queue for failed compensations
- [ ] Optimize database indexes (composite + covering)
- [ ] Implement circuit breakers (Hystrix or similar)
- [ ] Add breakage recognition audit fields
- [ ] Create consistency monitoring service
- [ ] Write chaos engineering test suite

#### **Medium Priority (Before Scale)**

- [ ] Implement Redis Pub/Sub for WebSocket broadcasting
- [ ] Add cache versioning with timestamps
- [ ] Create reconciliation service
- [ ] Implement tiered rate limiting
- [ ] Add approval workflow for high-value operations
- [ ] Configure database connection pooling

#### **Low Priority (Nice-to-Have)**

- [ ] Implement fraud detection service
- [ ] Add exchange rate snapshot for reporting
- [ ] Design API versioning strategy
- [ ] Plan multi-region replication

---

## Conclusion

### Overall Verdict: **APPROVED WITH CONDITIONS** ✅

The three wallet feature specifications are **well-architected and production-ready** with the following **critical conditions**:

1. ✅ Implement distributed locking (Redlock or PostgreSQL row locks)
2. ✅ Add Saga timeout and retry handling
3. ✅ Optimize database indexes for performance-critical queries

**After addressing these P0 items**, the architecture is sound for:
- ✅ Phase 1 Cambodia launch
- ✅ Phase 2 Singapore expansion
- ✅ Multi-tenant SaaS at scale

### Strengths Summary

- **ASEAN Compliance**: Excellent loyalty program structure, clear exemption strategy
- **Audit Trails**: Comprehensive transaction logging for regulatory compliance
- **Event-Driven Architecture**: Clean service boundaries, scalable integration
- **Security**: Strong authentication, authorization, and fraud prevention
- **UX Design**: Thoughtful multi-tender redemption flow

### Areas for Improvement

- **Distributed Transaction Resilience**: Needs timeout + retry handling
- **Concurrency Control**: Requires distributed locking for production
- **WebSocket Scalability**: Needs Redis Pub/Sub for horizontal scaling
- **Performance**: Database index optimization recommended

### Recommended Next Steps

1. **Immediate** (This Week):
   - Implement distributed locking
   - Add Saga timeout handling
   - Create implementation plan for P0 items

2. **Short-Term** (Next 2 Weeks):
   - Optimize database indexes
   - Implement circuit breakers
   - Build chaos engineering tests

3. **Medium-Term** (Next Month):
   - Redis Pub/Sub for WebSocket
   - Consistency monitoring
   - Reconciliation service

---

**Reviewed By**: Architecture Review Agent
**Review Date**: 2025-11-09
**Next Review**: Before Phase 1 implementation or after P0 fixes
**Approval Status**: **APPROVED WITH P0 CONDITIONS** ✅
