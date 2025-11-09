# ADR 0003: Nx Dependency Boundaries and Tag Strategy

**Date**: 2025-11-06
**Status**: Accepted

## Context

NxLoy requires **parallel development** across 7 teams/agents working simultaneously:
- Backend (NestJS)
- Web (Next.js)
- Mobile (React Native)
- AI/MCP (Node.js)
- Infrastructure (Terraform/K8s)
- Blockchain/NFT (Solidity)
- Documentation

**Problem**: Without enforced boundaries, parallel development causes:
- ❌ Circular dependencies between modules
- ❌ Web importing backend code directly (breaks client/server boundary)
- ❌ Mobile importing web-specific packages (breaks platform boundary)
- ❌ Shared packages importing app-specific code (breaks abstraction)
- ❌ Domain modules reaching into other domains (breaks bounded contexts)
- ❌ "Big ball of mud" where everything imports everything
- ❌ Integration conflicts discovered late in development

**Example Failure Scenario**:
```typescript
// ❌ BAD: Web app imports backend service directly
// apps/web/src/components/Dashboard.tsx
import { LoyaltyService } from '@nxloy/backend'; // CIRCULAR DEPENDENCY!

// ❌ BAD: Mobile imports web-specific components
// apps/mobile/src/screens/Home.tsx
import { Button } from '@nxloy/web'; // PLATFORM COUPLING!

// ❌ BAD: Shared package imports app code
// packages/shared-utils/src/formatters.ts
import { config } from '@nxloy/backend'; // LEAKY ABSTRACTION!

// ❌ BAD: Loyalty module imports customer domain internals
// apps/backend/src/loyalty/services/points.service.ts
import { CustomerRepository } from '../../customer/repositories'; // DOMAIN LEAK!
```

**Result**: Teams block each other, tests fail unpredictably, builds break, deployment order becomes critical.

## Decision

We will enforce **strict module boundaries** using Nx tags and dependency constraints.

### Tag Strategy

**3-Dimensional Tagging System**:
1. **Scope Tags**: Which application/team owns this code
2. **Type Tags**: What kind of module this is (app vs library vs util)
3. **Domain Tags**: Which business domain this belongs to

```typescript
// Example project.json tags
{
  "tags": [
    "scope:backend",           // Owned by backend team
    "type:feature",            // Feature library (business logic)
    "domain:loyalty"           // Loyalty bounded context
  ]
}
```

### Scope Tags (Team Ownership)

| Tag | Description | Examples |
|-----|-------------|----------|
| `scope:backend` | Backend API code | NestJS services, controllers, repositories |
| `scope:web` | Web frontend code | Next.js pages, React components |
| `scope:mobile` | Mobile app code | React Native screens, navigation |
| `scope:ai-mcp` | AI/MCP server code | Model integrations, MCP tools |
| `scope:blockchain` | Blockchain code | Smart contracts, Web3 integrations |
| `scope:infrastructure` | DevOps code | Terraform, K8s manifests, CI/CD |
| `scope:shared` | Shared across all | Types, validation, utilities |

### Type Tags (Module Classification)

| Tag | Description | Can Import From |
|-----|-------------|-----------------|
| `type:app` | Deployable application | Everything in its scope + shared |
| `type:feature` | Business logic library | data-access, util, shared |
| `type:data-access` | Data layer (Prisma, API) | util, shared |
| `type:ui` | UI components | util, shared |
| `type:util` | Pure utilities | shared only |

### Domain Tags (Bounded Contexts)

| Tag | Description | Owns |
|-----|-------------|------|
| `domain:auth` | Authentication & Authorization | Users, sessions, permissions |
| `domain:loyalty` | Loyalty programs & rules | Templates, rules, tiers |
| `domain:rewards` | Reward catalog & redemption | Catalog, redemptions, inventory |
| `domain:customer-mgmt` | Customer profiles & transactions | Customers, transactions, visits |
| `domain:partner-network` | Partner integrations | Partners, partner programs |
| `domain:subscription` | Subscription management | Plans, billing, invoices |
| `domain:referrals` | Referral programs | Referral codes, rewards |
| `domain:blockchain` | NFT & Web3 features | Tokens, wallets, smart contracts |

## Dependency Rules

### Rule 1: Scope Isolation

```json
{
  "sourceTag": "scope:backend",
  "onlyDependOnLibsWithTags": ["scope:backend", "scope:shared"]
}
```

**Enforcement**:
- ✅ Backend can import backend code
- ✅ Backend can import shared code
- ❌ Backend CANNOT import web/mobile/ai-mcp code
- ❌ Web CANNOT import backend code (must use API)

### Rule 2: Type Hierarchy

```json
{
  "sourceTag": "type:feature",
  "onlyDependOnLibsWithTags": ["type:data-access", "type:util", "scope:shared"]
}
```

**Enforcement**:
- ✅ Feature libraries can import data-access and utils
- ❌ Feature libraries CANNOT import other features (use domain events)
- ❌ Util libraries CANNOT import features or data-access

### Rule 3: Domain Boundaries

```json
{
  "sourceTag": "domain:loyalty",
  "onlyDependOnLibsWithTags": [
    "domain:loyalty",
    "domain:customer-mgmt",  // Explicitly allowed
    "scope:shared"
  ],
  "bannedExternalImports": [
    "@nxloy/domain-rewards",      // Must use API/events
    "@nxloy/domain-partner-network"
  ]
}
```

**Enforcement**:
- ✅ Domains can import from themselves
- ✅ Domains can import explicitly allowed dependencies
- ❌ Domains CANNOT import other domains directly
- ✅ Domains communicate via domain events (AsyncAPI)

### Rule 4: Shared Libraries Purity

```json
{
  "sourceTag": "scope:shared",
  "onlyDependOnLibsWithTags": ["scope:shared"],
  "bannedExternalImports": [
    "@nxloy/backend",
    "@nxloy/web",
    "@nxloy/mobile"
  ]
}
```

**Enforcement**:
- ✅ Shared packages can only import other shared packages
- ❌ Shared packages CANNOT import application code
- ✅ Keeps shared code truly reusable

## Implementation

### Step 1: Configure Nx Constraint Rules

**`.eslintrc.json` (root)**:
```json
{
  "extends": ["@nx/eslint-plugin"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "enforceBuildableLibDependency": true,
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "scope:backend",
                "onlyDependOnLibsWithTags": ["scope:backend", "scope:shared"]
              },
              {
                "sourceTag": "scope:web",
                "onlyDependOnLibsWithTags": ["scope:web", "scope:shared"]
              },
              {
                "sourceTag": "scope:mobile",
                "onlyDependOnLibsWithTags": ["scope:mobile", "scope:shared"]
              },
              {
                "sourceTag": "scope:ai-mcp",
                "onlyDependOnLibsWithTags": ["scope:ai-mcp", "scope:shared"]
              },
              {
                "sourceTag": "scope:blockchain",
                "onlyDependOnLibsWithTags": ["scope:blockchain", "scope:shared"]
              },
              {
                "sourceTag": "scope:shared",
                "onlyDependOnLibsWithTags": ["scope:shared"],
                "bannedExternalImports": [
                  "@nxloy/backend",
                  "@nxloy/web",
                  "@nxloy/mobile",
                  "@nxloy/ai-mcp"
                ]
              },
              {
                "sourceTag": "type:feature",
                "onlyDependOnLibsWithTags": [
                  "type:data-access",
                  "type:util",
                  "scope:shared"
                ]
              },
              {
                "sourceTag": "type:data-access",
                "onlyDependOnLibsWithTags": ["type:util", "scope:shared"]
              },
              {
                "sourceTag": "type:ui",
                "onlyDependOnLibsWithTags": ["type:util", "scope:shared"]
              },
              {
                "sourceTag": "type:util",
                "onlyDependOnLibsWithTags": ["scope:shared"]
              },
              {
                "sourceTag": "domain:loyalty",
                "onlyDependOnLibsWithTags": [
                  "domain:loyalty",
                  "domain:customer-mgmt",
                  "scope:shared"
                ]
              },
              {
                "sourceTag": "domain:rewards",
                "onlyDependOnLibsWithTags": [
                  "domain:rewards",
                  "domain:customer-mgmt",
                  "scope:shared"
                ]
              },
              {
                "sourceTag": "domain:customer-mgmt",
                "onlyDependOnLibsWithTags": [
                  "domain:customer-mgmt",
                  "scope:shared"
                ]
              },
              {
                "sourceTag": "domain:partner-network",
                "onlyDependOnLibsWithTags": [
                  "domain:partner-network",
                  "domain:rewards",
                  "scope:shared"
                ]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

### Step 2: Tag All Projects

**Backend Application** (`apps/backend/project.json`):
```json
{
  "name": "backend",
  "tags": ["scope:backend", "type:app"]
}
```

**Loyalty Feature Library** (`apps/backend/src/loyalty/project.json`):
```json
{
  "name": "backend-loyalty",
  "tags": ["scope:backend", "type:feature", "domain:loyalty"]
}
```

**Shared Types Package** (`packages/shared-types/project.json`):
```json
{
  "name": "shared-types",
  "tags": ["scope:shared", "type:util"]
}
```

**Web Application** (`apps/web/project.json`):
```json
{
  "name": "web",
  "tags": ["scope:web", "type:app"]
}
```

**Mobile Application** (`apps/mobile/project.json`):
```json
{
  "name": "mobile",
  "tags": ["scope:mobile", "type:app"]
}
```

### Step 3: Verify Constraints

```bash
# Lint all projects (includes boundary checks)
nx run-many --target=lint --all

# Check specific project
nx lint backend

# View dependency graph with constraints
nx graph

# CI/CD enforcement
nx affected:lint --base=origin/main
```

### Step 4: Document Violations in Pull Requests

**CI/CD Pipeline** (`.github/workflows/ci.yml`):
```yaml
name: CI

on: [pull_request]

jobs:
  enforce-boundaries:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Need full history for affected

      - name: Install dependencies
        run: pnpm install

      - name: Lint affected projects (includes boundary checks)
        run: nx affected:lint --base=origin/main --head=HEAD

      - name: Fail if violations found
        run: |
          if [ $? -ne 0 ]; then
            echo "❌ Module boundary violations detected!"
            echo "Review the errors above and fix import statements."
            exit 1
          fi
```

## Alternatives Considered

### 1. No Enforced Boundaries

**Approach**: Let developers import freely, trust code reviews

**Pros**:
- ✅ Maximum flexibility
- ✅ No configuration overhead

**Cons**:
- ❌ Circular dependencies inevitable
- ❌ "Big ball of mud" architecture
- ❌ Parallel development blocked by conflicts
- ❌ Code reviews catch issues too late

**Decision**: Rejected. Without enforcement, boundaries erode over time.

### 2. Separate Git Repositories

**Approach**: Each app/domain in separate repo

**Pros**:
- ✅ Maximum isolation
- ✅ Clear ownership

**Cons**:
- ❌ No shared types or validation
- ❌ Painful to keep in sync
- ❌ Integration testing difficult
- ❌ Version management nightmare

**Decision**: Rejected. ADR-0001 already chose monorepo for type sharing.

### 3. Nx Generators for Scaffolding Only

**Approach**: Use generators to create projects with correct tags, but don't enforce

**Pros**:
- ✅ Easy initial setup
- ✅ Flexibility after generation

**Cons**:
- ❌ No ongoing enforcement
- ❌ Boundaries decay over time
- ❌ Violations only caught in code review

**Decision**: Rejected. We need continuous enforcement.

### 4. Lerna Workspace Constraints

**Approach**: Use Lerna instead of Nx

**Pros**:
- ✅ Simpler configuration
- ✅ Well-established tool

**Cons**:
- ❌ No intelligent caching (slower builds)
- ❌ No dependency graph visualization
- ❌ Less sophisticated constraint rules
- ❌ Doesn't integrate with ESLint

**Decision**: Rejected. Nx provides better DX and enforcement.

## Consequences

### Positive

1. **Circular Dependencies Impossible**
   ```bash
   # Before: Silent failure at runtime
   nx serve backend  # Works until circular dependency triggered

   # After: Immediate failure at lint
   nx lint backend
   # Error: Cannot import '@nxloy/web' from scope:backend
   # Fix: Use API contract or shared package
   ```

2. **Clear Team Boundaries**
   - Backend team owns `scope:backend`
   - Web team owns `scope:web`
   - Mobile team owns `scope:mobile`
   - Zero conflicts, maximum parallelism

3. **Domain Isolation Enforced**
   ```typescript
   // ❌ Caught by linter
   // apps/backend/src/loyalty/points.service.ts
   import { RewardRepository } from '../../rewards/repositories';
   // Error: domain:loyalty cannot import domain:rewards

   // ✅ Correct approach
   // Use domain event or shared API
   this.eventBus.publish(new PointsEarnedEvent({ customerId, points }));
   ```

4. **Refactoring Safety**
   - Move code between projects
   - Nx updates import paths
   - Constraint violations caught immediately
   - No silent breakage

5. **CI/CD Gate**
   - Pull requests automatically checked
   - Violations block merge
   - Documentation in lint errors
   - Self-documenting architecture

6. **Dependency Graph Clarity**
   ```bash
   nx graph --affected
   # Visual representation shows:
   # - Which teams depend on shared packages
   # - No circular arrows (enforced)
   # - Clear layers (app → feature → data-access → util)
   ```

### Negative

1. **Initial Configuration Overhead**
   - Must tag all projects correctly
   - Write comprehensive constraint rules
   - Learning curve for team
   - Mitigation: Templates, documentation, examples

2. **Less Flexibility**
   - Can't "quickly hack" cross-boundary imports
   - Must use proper abstractions (API, events, shared packages)
   - Mitigation: This is actually a positive (forces good design)

3. **Generator Complexity**
   - Nx generators must apply correct tags
   - Must update generators when adding new domains
   - Mitigation: Document tag strategy, provide examples

4. **False Positives Possible**
   - Some valid cross-domain dependencies exist
   - Must explicitly allow in rules
   - Mitigation: Use `allow` list in specific cases

### Neutral

1. **Requires Discipline**
   - Team must understand tag strategy
   - Code reviews must verify correct tagging
   - New projects must be tagged immediately

2. **Tooling Dependency**
   - Relies on Nx ESLint plugin
   - Must keep Nx updated
   - Lock-in to Nx ecosystem (acceptable per ADR-0001)

## Migration Path

### Phase 1 (Week 1): Initial Setup

1. **Add Scope Tags to All Existing Projects**
   ```bash
   # Backend
   nx g @nx/workspace:project-configuration backend --tags="scope:backend,type:app"

   # Web
   nx g @nx/workspace:project-configuration web --tags="scope:web,type:app"

   # Shared packages
   nx g @nx/workspace:project-configuration shared-types --tags="scope:shared,type:util"
   ```

2. **Configure Basic Scope Rules**
   - Start with only scope isolation
   - Don't enforce type/domain yet
   - Fix any existing violations

3. **Run Lint and Fix Violations**
   ```bash
   nx run-many --target=lint --all
   # Fix any violations before proceeding
   ```

### Phase 2 (Week 2): Type Tags

1. **Add Type Tags**
   - `type:app` for applications
   - `type:util` for shared packages
   - `type:feature` for future feature libraries

2. **Enforce Type Hierarchy**
   - Add type constraint rules
   - Fix violations (should be minimal)

### Phase 3 (Month 2): Domain Tags

1. **Identify Bounded Contexts**
   - Review Prisma schema
   - Map to domains (loyalty, rewards, customer-mgmt, etc.)

2. **Add Domain Tags**
   - Tag existing modules by domain
   - Create domain constraint rules

3. **Enforce Domain Boundaries**
   - Refactor cross-domain imports to use events
   - Document domain dependencies

## Success Metrics

### Immediate (Week 1-2)
- [ ] All projects have scope tags
- [ ] Scope constraint rules configured
- [ ] Zero lint violations
- [ ] CI/CD enforces boundaries

### Short-Term (Month 1-3)
- [ ] Type tags applied to all projects
- [ ] Type constraint rules enforced
- [ ] Nx graph shows clean layers (no cycles)
- [ ] Team understands tag strategy

### Long-Term (Month 3-6)
- [ ] Domain tags applied
- [ ] Domain boundaries enforced via events
- [ ] Zero circular dependencies
- [ ] Pull requests automatically reject violations
- [ ] Team writes generators with correct tags

## Examples

### Example 1: Backend Loyalty Module Imports

**Valid Imports**:
```typescript
// apps/backend/src/loyalty/services/points.service.ts
import { Injectable } from '@nestjs/common';                    // ✅ External package
import { PrismaService } from '../data-access/prisma.service'; // ✅ Same domain
import { LoyaltyRuleDto } from '@nxloy/shared-types';          // ✅ Shared package
import { CustomerService } from '../../customer/customer.service'; // ✅ Explicitly allowed
```

**Invalid Imports**:
```typescript
// apps/backend/src/loyalty/services/points.service.ts
import { Button } from '@nxloy/web';                           // ❌ Wrong scope
import { RewardService } from '../../rewards/reward.service';  // ❌ Domain boundary
// Error: domain:loyalty cannot import domain:rewards
// Solution: Use domain event or API call
```

### Example 2: Web Component Imports

**Valid Imports**:
```typescript
// apps/web/src/components/Dashboard.tsx
import { useState } from 'react';                              // ✅ External
import { Button } from '../ui/Button';                         // ✅ Same scope
import { LoyaltyRuleDto } from '@nxloy/shared-types';         // ✅ Shared
import { formatCurrency } from '@nxloy/shared-utils';         // ✅ Shared
```

**Invalid Imports**:
```typescript
// apps/web/src/components/Dashboard.tsx
import { LoyaltyService } from '@nxloy/backend';               // ❌ Wrong scope
// Error: scope:web cannot import scope:backend
// Solution: Use API client generated from OpenAPI contract
```

### Example 3: Shared Package Imports

**Valid Imports**:
```typescript
// packages/shared-validation/src/loyalty.schema.ts
import { z } from 'zod';                                       // ✅ External
import { BusinessIndustry } from '@nxloy/shared-types';       // ✅ Shared
```

**Invalid Imports**:
```typescript
// packages/shared-validation/src/loyalty.schema.ts
import { PrismaClient } from '@nxloy/backend';                 // ❌ Leaky abstraction
// Error: scope:shared cannot import scope:backend
// Solution: Define types in shared-types, implement in backend
```

## References

- [Nx Module Boundaries](https://nx.dev/core-features/enforce-module-boundaries)
- [Nx Tagging Strategy](https://nx.dev/core-features/enforce-module-boundaries#tags)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design Bounded Contexts](https://martinfowler.com/bliki/BoundedContext.html)

## Decision Owners

- **Tag Strategy**: Architecture Team (requires consensus)
- **Scope Tags**: Team Leads (backend, web, mobile, AI)
- **Domain Tags**: Backend Team + Domain Experts
- **Constraint Rules**: Architecture Team (breaking changes require approval)

---

**Rationale**: Enforced module boundaries are CRITICAL for parallel multi-agent development. Without automation, boundaries erode over time. Nx provides the tooling to make this effortless and self-documenting.
