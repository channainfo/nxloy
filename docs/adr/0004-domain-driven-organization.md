# ADR 0004: Domain-Driven Design and Bounded Contexts

**Date**: 2025-11-06
**Status**: Accepted

## Context

NxLoy is a **multi-domain platform** spanning:
- Loyalty programs (rules, tiers, templates)
- Reward catalog (items, redemptions, inventory)
- Customer management (profiles, transactions, visits)
- Partner network (integrations, partner programs)
- Subscription billing (plans, invoices, payments)
- Referral programs (codes, rewards, tracking)
- Blockchain/NFT (tokens, wallets, smart contracts)
- Authentication (users, sessions, permissions)

**Problem**: Without clear domain boundaries:
- ❌ "God classes" emerge (Customer, Business, Transaction)
- ❌ Changes in one domain break unrelated features
- ❌ Teams step on each other's toes
- ❌ Database schema becomes tangled web
- ❌ Tests are slow (can't test domains in isolation)
- ❌ Unclear ownership (who owns "points"?)

**Example Failure Scenario**:
```typescript
// ❌ BAD: Single "Customer" class with 50+ methods
class Customer {
  // Auth domain concerns
  login() {}
  changePassword() {}

  // Loyalty domain concerns
  earnPoints() {}
  checkTierStatus() {}

  // Rewards domain concerns
  redeemReward() {}
  getRewardHistory() {}

  // Partner domain concerns
  linkPartnerAccount() {}

  // Subscription domain concerns
  upgradePlan() {}
  processPayment() {}

  // Referral domain concerns
  generateReferralCode() {}
  trackReferrals() {}
}
// Result: 2000+ line class, impossible to test, every domain touches it
```

## Decision

We will organize code using **Domain-Driven Design (DDD)** with **Bounded Contexts**.

### Core Concepts

**Bounded Context**: A boundary within which a domain model is defined and applicable. Each context has its own:
- Language (ubiquitous language)
- Models (entities, value objects, aggregates)
- Services (domain logic)
- Events (integration points)

**Aggregate**: A cluster of domain objects that can be treated as a single unit. One entity is the **aggregate root**, all access goes through it.

**Domain Event**: Something that happened in the domain that other domains care about. Used for decoupled communication between contexts.

### NxLoy Bounded Contexts

```
┌─────────────────────────────────────────────────────────────┐
│                        NxLoy Platform                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌─────────▼──────┐  ┌─────────▼─────────┐
│ Loyalty Domain │  │ Rewards Domain │  │Customer Mgmt Domain│
│                │  │                │  │                    │
│ - Templates    │  │ - Catalog      │  │ - Profiles         │
│ - Rules        │  │ - Redemptions  │  │ - Transactions     │
│ - Tiers        │  │ - Inventory    │  │ - Visits           │
│ - Points       │  │                │  │ - Segments         │
└────────────────┘  └────────────────┘  └────────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌─────────▼──────┐  ┌─────────▼─────────┐
│Partner Network │  │  Subscription  │  │   Referrals       │
│                │  │                │  │                   │
│ - Partners     │  │ - Plans        │  │ - Codes           │
│ - Programs     │  │ - Billing      │  │ - Tracking        │
│ - Integrations │  │ - Invoices     │  │ - Rewards         │
└────────────────┘  └────────────────┘  └───────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌─────────▼──────┐  ┌─────────▼─────────┐
│  Auth Domain   │  │ Blockchain     │  │   Shared Kernel   │
│                │  │                │  │                   │
│ - Users        │  │ - NFTs         │  │ - BusinessId      │
│ - Sessions     │  │ - Wallets      │  │ - CustomerId      │
│ - Permissions  │  │ - Contracts    │  │ - Money VO        │
└────────────────┘  └────────────────┘  └───────────────────┘
```

### Domain Ownership and Responsibilities

| Domain | Owns | Aggregate Roots | Events Published |
|--------|------|-----------------|------------------|
| **Loyalty** | Loyalty programs, rules, tiers, points | `LoyaltyProgram`, `LoyaltyRule` | `PointsEarnedEvent`, `TierUpgradedEvent` |
| **Rewards** | Reward catalog, redemptions, inventory | `RewardCatalog`, `Redemption` | `RewardRedeemedEvent`, `InventoryDepletedEvent` |
| **Customer Mgmt** | Customer profiles, transactions, visits | `CustomerProfile`, `Transaction` | `CustomerRegisteredEvent`, `TransactionCompletedEvent` |
| **Partner Network** | Partner integrations, programs | `Partner`, `PartnerProgram` | `PartnerLinkedEvent`, `PartnerRewardEarnedEvent` |
| **Subscription** | Plans, billing, invoices | `Subscription`, `Invoice` | `SubscriptionCreatedEvent`, `PaymentProcessedEvent` |
| **Referrals** | Referral codes, tracking, rewards | `ReferralCode`, `Referral` | `ReferralCompletedEvent`, `ReferralRewardGrantedEvent` |
| **Blockchain** | NFTs, wallets, smart contracts | `DigitalAsset`, `Wallet` | `NFTMintedEvent`, `TokenTransferredEvent` |
| **Auth** | Users, sessions, permissions, roles | `User`, `Session` | `UserAuthenticatedEvent`, `PermissionGrantedEvent` |

## Domain Relationships

### Context Map

**Shared Kernel** (Minimal shared concepts):
- `BusinessId` - Business identifier
- `CustomerId` - Customer identifier
- `Money` - Value object for currency
- `DateRange` - Value object for time periods

**Customer/Supplier Relationships**:
- **Loyalty** (upstream) → **Customer Mgmt** (downstream)
  - Loyalty needs customer info, customer doesn't need loyalty
  - Integration: Customer Mgmt publishes `CustomerRegisteredEvent`
  - Loyalty subscribes and creates loyalty account

- **Rewards** (upstream) → **Loyalty** (downstream)
  - Rewards available to loyalty members
  - Integration: Loyalty publishes `PointsEarnedEvent`
  - Rewards subscribes and may auto-apply rewards

**Conformist Relationships**:
- **All Domains** → **Auth** (conformist)
  - All domains must conform to Auth's user model
  - No negotiation, Auth defines identity

**Anti-Corruption Layer (ACL)**:
- **Blockchain** ↔ **All Domains** (ACL)
  - Web3 concepts (wallets, tokens) don't leak into core domains
  - Adapter layer translates domain concepts to blockchain

### Integration Patterns

**1. Domain Events (Preferred)**
```typescript
// Loyalty domain publishes event
class LoyaltyService {
  async earnPoints(customerId: string, amount: number) {
    // ... business logic

    await this.eventBus.publish(
      new PointsEarnedEvent({
        customerId,
        points: amount,
        programId: program.id,
        timestamp: new Date()
      })
    );
  }
}

// Rewards domain subscribes
@EventsHandler(PointsEarnedEvent)
class PointsEarnedHandler {
  async handle(event: PointsEarnedEvent) {
    // Check if customer reached reward threshold
    const eligibleRewards = await this.checkEligibility(
      event.customerId,
      event.points
    );

    if (eligibleRewards.length > 0) {
      await this.notifyCustomer(event.customerId, eligibleRewards);
    }
  }
}
```

**2. API Calls (For Queries)**
```typescript
// Loyalty domain needs customer info
class LoyaltyService {
  constructor(
    private readonly customerApiClient: CustomerApiClient // Generated from OpenAPI
  ) {}

  async earnPoints(customerId: string, amount: number) {
    // Query customer profile (read-only)
    const customer = await this.customerApiClient.getCustomer(customerId);

    if (customer.status === 'ACTIVE') {
      // ... earn points logic
    }
  }
}
```

**3. Shared Kernel (Minimal)**
```typescript
// packages/shared-types/src/value-objects/money.ts
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}

// Used by ALL domains (Loyalty, Rewards, Subscription, etc.)
```

## File Structure Per Domain

**Layered Architecture Within Each Bounded Context**:

```
apps/backend/src/loyalty/           # Loyalty Bounded Context
├── domain/                         # Domain layer (pure business logic)
│   ├── entities/
│   │   ├── loyalty-program.entity.ts
│   │   ├── loyalty-rule.entity.ts
│   │   └── tier.entity.ts
│   ├── value-objects/
│   │   ├── points.vo.ts
│   │   └── tier-threshold.vo.ts
│   ├── aggregates/
│   │   └── loyalty-program.aggregate.ts
│   ├── repositories/               # Interfaces only
│   │   └── loyalty-program.repository.interface.ts
│   ├── services/                   # Domain services
│   │   ├── points-calculation.service.ts
│   │   └── tier-evaluation.service.ts
│   └── events/
│       ├── points-earned.event.ts
│       └── tier-upgraded.event.ts
├── application/                    # Application layer (use cases)
│   ├── commands/
│   │   ├── create-loyalty-program.command.ts
│   │   └── earn-points.command.ts
│   ├── queries/
│   │   ├── get-loyalty-program.query.ts
│   │   └── get-customer-points.query.ts
│   └── handlers/
│       ├── create-loyalty-program.handler.ts
│       └── earn-points.handler.ts
├── infrastructure/                 # Infrastructure layer
│   ├── repositories/               # Implementations
│   │   └── loyalty-program.repository.ts
│   ├── event-handlers/
│   │   └── customer-registered.handler.ts  # External event
│   └── persistence/
│       └── loyalty.prisma.ts       # Prisma queries
└── api/                            # API layer (controllers, DTOs)
    ├── controllers/
    │   └── loyalty.controller.ts
    ├── dtos/
    │   ├── create-loyalty-program.dto.ts
    │   └── earn-points.dto.ts
    └── mappers/
        └── loyalty-program.mapper.ts

apps/backend/src/rewards/           # Rewards Bounded Context
├── domain/
│   ├── entities/
│   │   ├── reward.entity.ts
│   │   └── redemption.entity.ts
│   ├── aggregates/
│   │   └── reward-catalog.aggregate.ts
│   └── events/
│       └── reward-redeemed.event.ts
├── application/
│   └── handlers/
│       └── points-earned.handler.ts  # Subscribes to Loyalty events
├── infrastructure/
└── api/

apps/backend/src/customer-mgmt/     # Customer Management Bounded Context
├── domain/
│   ├── entities/
│   │   ├── customer-profile.entity.ts
│   │   └── transaction.entity.ts
│   └── events/
│       └── customer-registered.event.ts
├── application/
├── infrastructure/
└── api/
```

## Alternatives Considered

### 1. Layered Architecture (No Domains)

**Approach**: Organize by technical layer (controllers, services, repositories)

```
src/
├── controllers/
│   ├── loyalty.controller.ts
│   ├── rewards.controller.ts
│   └── customers.controller.ts
├── services/
│   ├── loyalty.service.ts
│   ├── rewards.service.ts
│   └── customers.service.ts
└── repositories/
    ├── loyalty.repository.ts
    ├── rewards.repository.ts
    └── customers.repository.ts
```

**Pros**:
- ✅ Simple to understand
- ✅ Familiar to most developers

**Cons**:
- ❌ No domain boundaries
- ❌ Services become God classes
- ❌ Cross-cutting changes affect everything
- ❌ Impossible to work in parallel

**Decision**: Rejected. Doesn't scale to 7 parallel teams.

### 2. Feature Folders (Vertical Slice)

**Approach**: One folder per feature, all layers together

```
src/features/
├── create-loyalty-program/
│   ├── controller.ts
│   ├── service.ts
│   ├── repository.ts
│   └── dto.ts
├── earn-points/
│   └── ...
└── redeem-reward/
    └── ...
```

**Pros**:
- ✅ Co-locate related code
- ✅ Easy to find feature code
- ✅ Delete feature = delete folder

**Cons**:
- ❌ No shared domain model
- ❌ Duplication across features
- ❌ Difficult to enforce domain boundaries

**Decision**: Partially adopted. We use vertical slices WITHIN each domain (application layer), but still have domain layer for shared concepts.

### 3. Microservices

**Approach**: Separate service per domain

**Pros**:
- ✅ Maximum isolation
- ✅ Independent deployment
- ✅ Clear boundaries

**Cons**:
- ❌ Operational complexity (8 services)
- ❌ Distributed transaction challenges
- ❌ Network latency between domains
- ❌ More expensive infrastructure

**Decision**: Rejected for now. Start with modular monolith (ADR-0001), extract to microservices later if needed.

### 4. CQRS with Separate Read/Write Models

**Approach**: Separate command (write) and query (read) models per domain

**Pros**:
- ✅ Optimized read models
- ✅ Scalability (scale reads independently)
- ✅ Event sourcing integration

**Cons**:
- ❌ Complexity (2x models)
- ❌ Eventual consistency challenges
- ❌ Learning curve

**Decision**: Deferred to Phase 3. Start with simpler shared model, introduce CQRS only if performance requires it.

## Consequences

### Positive

1. **Clear Ownership**
   - Backend team lead assigns domains to developers
   - "You own Loyalty domain" → clear responsibility
   - No stepping on toes

2. **Parallel Development**
   ```bash
   # Agent 1: Loyalty domain
   cd apps/backend/src/loyalty
   nx test backend-loyalty

   # Agent 2: Rewards domain
   cd apps/backend/src/rewards
   nx test backend-rewards

   # No conflicts! Each domain is isolated.
   ```

3. **Testability**
   ```typescript
   // Test Loyalty domain in isolation
   describe('LoyaltyProgram', () => {
     it('should earn points', () => {
       const program = new LoyaltyProgram({ /* ... */ });
       program.earnPoints(100);
       expect(program.totalPoints).toBe(100);
     });
   });

   // No database, no external dependencies, pure domain logic
   ```

4. **Refactoring Safety**
   - Change Loyalty domain internals
   - As long as events don't change, other domains unaffected
   - Integration tests validate contracts

5. **Scalability Path**
   - Start: Modular monolith
   - Later: Extract high-traffic domains to microservices
   - Domain boundaries = natural service boundaries

6. **Onboarding**
   - New developer: "You'll work on Rewards domain"
   - Clear scope, manageable codebase (~2000 lines vs 50,000)

### Negative

1. **Upfront Design Required**
   - Must identify bounded contexts early
   - Wrong boundaries = costly refactor
   - Mitigation: Start with obvious domains, refine over time

2. **Event Complexity**
   - Domain events require event bus infrastructure
   - Eventual consistency (not always immediate)
   - Mitigation: Use events for cross-domain, direct calls within domain

3. **Learning Curve**
   - DDD concepts (aggregates, value objects, domain events)
   - Not all developers familiar
   - Mitigation: Training, documentation, examples

4. **Duplication Possible**
   - Each domain may have similar entities (e.g., "Customer")
   - Temptation to share code
   - Mitigation: Shared kernel for truly shared concepts only

### Neutral

1. **Code Navigation**
   - More folders, deeper nesting
   - Need good IDE support (VS Code, search)

2. **Testing Strategy**
   - Unit tests: Domain layer (pure logic)
   - Integration tests: Application layer (commands/queries)
   - E2E tests: API layer (controllers)

## Implementation Plan

### Week 1: Identify Bounded Contexts

1. **Review Ploy Prisma Schema**
   - 180 models → group into domains
   - Identify aggregates
   - Map relationships

2. **Document Domain Responsibilities**
   - What does each domain own?
   - What events does it publish?
   - What events does it consume?

3. **Create Context Map**
   - Upstream/downstream relationships
   - Shared kernel concepts
   - Anti-corruption layers

### Week 2: Create Domain Structure

1. **Generate Domain Folders**
   ```bash
   # For each domain
   mkdir -p apps/backend/src/{domain}/domain/{entities,value-objects,aggregates,repositories,services,events}
   mkdir -p apps/backend/src/{domain}/application/{commands,queries,handlers}
   mkdir -p apps/backend/src/{domain}/infrastructure/{repositories,event-handlers,persistence}
   mkdir -p apps/backend/src/{domain}/api/{controllers,dtos,mappers}
   ```

2. **Add Nx Tags**
   ```json
   // apps/backend/src/loyalty/project.json
   {
     "tags": ["scope:backend", "type:feature", "domain:loyalty"]
   }
   ```

3. **Configure Dependency Constraints** (per ADR-0003)

### Week 3-4: Implement First Domain (Loyalty)

1. **Domain Layer**
   - Define entities (LoyaltyProgram, LoyaltyRule, Tier)
   - Define value objects (Points, TierThreshold)
   - Define aggregates (LoyaltyProgram as root)
   - Define domain events

2. **Application Layer**
   - Implement commands (CreateLoyaltyProgram, EarnPoints)
   - Implement queries (GetLoyaltyProgram, GetCustomerPoints)
   - Implement handlers (CQRS pattern)

3. **Infrastructure Layer**
   - Implement repositories (Prisma)
   - Wire up event bus

4. **API Layer**
   - Create controllers
   - Define DTOs (from OpenAPI contract)
   - Create mappers (Entity ↔ DTO)

### Month 2-3: Remaining Domains

- Rewards (Week 5-6)
- Customer Mgmt (Week 7-8)
- Partner Network (Week 9-10)
- Subscription (Week 11-12)

### Month 4+: Advanced Patterns

- CQRS for read-heavy domains
- Event sourcing for audit trail
- Saga pattern for distributed transactions

## Success Metrics

### Immediate (Week 1-4)
- [ ] 8 bounded contexts identified and documented
- [ ] Domain folder structure created
- [ ] First domain (Loyalty) implemented with layers
- [ ] Domain events flowing between contexts

### Short-Term (Month 1-3)
- [ ] All 8 domains implemented
- [ ] <5% code duplication across domains
- [ ] Integration tests validate domain contracts
- [ ] Team understands DDD patterns

### Long-Term (Month 6-12)
- [ ] <10 dependencies between domains (events only)
- [ ] Can extract domain to microservice in <1 week
- [ ] New developers productive in domain within 3 days
- [ ] Domain tests run in <10 seconds (isolated)

## References

- [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design (Vaughn Vernon)](https://vaughnvernon.com/books/)
- [Bounded Context (Martin Fowler)](https://martinfowler.com/bliki/BoundedContext.html)
- [Context Mapping](https://github.com/ddd-crew/context-mapping)
- [DDD and Nx Monorepo](https://nx.dev/recipes/domain-driven-design)

## Decision Owners

- **Bounded Context Identification**: Backend Team + Product (consensus)
- **Domain Model Design**: Domain Experts + Backend Developers
- **Integration Patterns**: Architecture Team
- **Context Map Changes**: All affected domain owners must approve

---

**Rationale**: Domain-Driven Design provides the conceptual boundaries that Nx tags enforce technically (ADR-0003). Together, they enable true parallel development across 7 teams/agents working on a single codebase.
