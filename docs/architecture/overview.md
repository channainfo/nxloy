# Architecture Overview

**Related**: [Principles](./principles.md) | [Domains](./domains.md) | [Tech Stack](./tech-stack.md) | [Data Architecture](./data-architecture.md)

---

## Overview

NxLoy is a **modular monolith** loyalty platform built with Nx monorepo tooling. The architecture is designed to support:

- Multi-tenancy (multiple businesses on one platform)
- White-label capabilities (customizable branding per business)
- 21 industry verticals (restaurants, retail, beauty, fitness, etc.)
- Horizontal and vertical scaling
- Future microservices extraction

## Design Philosophy

- **Domain-Driven Design** (DDD) - Clear bounded contexts
- **Contract-First Development** - APIs defined before implementation
- **Modular Monolith** - Start simple, evolve to microservices
- **Test-Driven** - No mocks, real dependencies, factories
- **Multi-Agent Ready** - Git worktrees for parallel AI development

## Tech Stack Summary

**Backend**:
- Framework: NestJS (Node.js)
- Database: PostgreSQL with Prisma ORM
- API: REST (OpenAPI/Swagger)
- Events: AsyncAPI for event-driven communication

**Frontend**:
- Web: Next.js 15 (React, App Router)
- Mobile: React Native (iOS/Android)
- Styling: Tailwind CSS

**Infrastructure**:
- Monorepo: Nx 22
- Package Manager: pnpm with workspaces
- Build: Nx distributed caching
- Deployment: Kubernetes (planned)
- Blockchain: Ethereum/Polygon (planned)

## Domain Structure Overview

NxLoy is organized into 8 bounded contexts (Domain-Driven Design). **Current status**: Only 2 of 8 domain schemas exist.

| Domain | Backend Module | Database Schema | Status |
|--------|---------------|----------------|--------|
| 1. **Authentication** | 📋 To be built | 🚧 auth.prisma exists | 🚧 Partial |
| 2. **Loyalty** | 📋 To be built | 📋 Planned | 📋 Planned |
| 3. **Rewards** | 📋 To be built | 📋 Planned | 📋 Planned |
| 4. **Customer Management** | 📋 To be built | 📋 Planned | 📋 Planned |
| 5. **Partner Network** | 📋 To be built | 📋 Planned | 📋 Planned |
| 6. **Subscription** | 📋 To be built | 📋 Planned | 📋 Planned |
| 7. **Referrals** | 📋 To be built | 📋 Planned | 📋 Planned |
| 8. **Blockchain/NFT** | 📋 To be built | 📋 Planned | 📋 Planned |

**Note**: Backend has NestJS framework configured but no domain modules implemented. Database has only `base.prisma` and `auth.prisma` schemas (2 of 8).

## High-Level Architecture

### System Context Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         External Systems                     │
│                                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │Payment │  │  OAuth │  │  SMS   │  │ Email  │           │
│  │Gateway │  │Provider│  │Gateway │  │Service │           │
│  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘           │
└──────┼──────────┼───────────┼───────────┼──────────────────┘
       │          │           │           │
       │          │           │           │
┌──────▼──────────▼───────────▼───────────▼──────────────────┐
│                      NxLoy Platform                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   Web    │  │  Mobile  │  │ Partner  │                 │
│  │   App    │  │   App    │  │   API    │                 │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘                 │
│        │             │              │                       │
│        └─────────────┼──────────────┘                       │
│                      │                                       │
│              ┌───────▼────────┐                             │
│              │   API Gateway  │                             │
│              │    (NestJS)    │                             │
│              └───────┬────────┘                             │
│                      │                                       │
│        ┌─────────────┼─────────────┐                       │
│        │             │             │                        │
│   ┌────▼────┐  ┌────▼────┐  ┌────▼────┐                  │
│   │  Auth   │  │ Loyalty │  │ Rewards │                   │
│   │ Domain  │  │ Domain  │  │ Domain  │  ... (8 domains) │
│   └────┬────┘  └────┬────┘  └────┬────┘                  │
│        │             │             │                        │
│        └─────────────┼─────────────┘                       │
│                      │                                       │
│              ┌───────▼────────┐                             │
│              │   PostgreSQL   │                             │
│              │   (Prisma)     │                             │
│              └────────────────┘                             │
└───────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
NxLoy Monorepo
│
├── Applications Layer (Deployable)
│   ├── backend (NestJS API)
│   ├── web (Next.js)
│   ├── mobile (React Native)
│   └── ai-mcp (AI/MCP server)
│
├── Domain Layer (Business Logic)
│   ├── Auth Domain
│   ├── Loyalty Domain
│   ├── Rewards Domain
│   ├── Customer Domain
│   ├── Partner Domain
│   ├── Subscription Domain
│   ├── Referral Domain
│   └── Blockchain Domain
│
├── Shared Layer (Cross-Cutting)
│   ├── @nxloy/database (Prisma)
│   ├── @nxloy/shared-types
│   ├── @nxloy/shared-validation
│   └── @nxloy/shared-utils
│
└── Infrastructure Layer
    ├── @nxloy/infrastructure (Terraform, K8s)
    └── @nxloy/blockchain-contracts (Smart contracts)
```

---

**Last Updated**: 2025-11-08
**Source**: ARCHITECTURE.md (Lines 27-43, 109-191), README.md (Lines 1-12, 962-1004)
