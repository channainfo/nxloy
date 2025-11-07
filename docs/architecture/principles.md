# Architectural Principles

**Related**: [Overview](./overview.md) | [Domains](./domains.md) | [Tech Stack](./tech-stack.md)

---

## 1. Separation of Concerns

Each domain (Auth, Loyalty, Rewards, etc.) is independently:
- **Developed** - Separate teams/agents can work in parallel
- **Tested** - Domain-specific test suites
- **Deployed** - Can be extracted to microservice later
- **Scaled** - Horizontal scaling per domain

## 2. Dependency Rules

**Nx Dependency Boundaries**:
```
apps/* → packages/* (✅ Allowed)
packages/* → apps/* (❌ Not allowed)
packages/* → packages/* (✅ Allowed with tags)
```

**Domain Dependencies**:
- Domains depend on shared packages (`@nxloy/shared-*`)
- Domains can communicate via events (AsyncAPI)
- Domains DON'T directly import from each other
- Cross-domain queries go through API layer

## 3. Contract-First Development

**Flow**:
1. Define OpenAPI (REST) and AsyncAPI (Events) contracts
2. Generate mock servers for frontend development
3. Freeze contracts after team review
4. Implement backend, web, mobile in parallel
5. Integration tests validate against contracts

**Benefits**:
- Frontend and backend teams work independently
- API changes are visible and reviewed
- Breaking changes detected early
- Documentation auto-generated

## 4. Single Source of Truth

| Concern | Source of Truth |
|---------|-----------------|
| **Data Models** | Prisma schema (`packages/database`) |
| **API Contracts** | OpenAPI spec (`docs/contracts/openapi.yaml`) |
| **Events** | AsyncAPI spec (`docs/contracts/events.asyncapi.yaml`) |
| **Types** | Generated from Prisma + OpenAPI |
| **Business Rules** | Feature specs (`docs/requirements/features/`) |
| **Architecture Decisions** | ADRs (`docs/adr/`) |

## 5. Quality Standards

From CLAUDE.md:
- **Max 40 lines per method** (excluding comments)
- **Max 3 parameters per method**
- **Single responsibility** (no method names with "and")
- **80% test coverage minimum**, 100% for business logic
- **No mocks** - Use factories and Faker for test data

---

**Last Updated**: 2025-11-08
**Source**: ARCHITECTURE.md (Lines 47-106)
