# NxLoy Architecture

This document provides a high-level overview of the NxLoy platform architecture. For detailed information, see the [docs/architecture/](docs/architecture/) directory.

## 📖 Quick Navigation

### Core Architecture Documents
1. **[Overview](docs/architecture/overview.md)** - High-level system architecture
2. **[Principles](docs/architecture/principles.md)** - Core architectural principles
3. **[Domain Structure](docs/architecture/domains.md)** - 8 bounded contexts (DDD)
4. **[Tech Stack](docs/architecture/tech-stack.md)** - Technology choices and rationale
5. **[Data Architecture](docs/architecture/data-architecture.md)** - Database design and patterns

## 🎯 Design Philosophy

NxLoy follows a **modular monolith** architecture with clear domain boundaries, enabling future microservices extraction if needed.

**Core Principles**:
- **Separation of Concerns** - Clear boundaries between layers
- **Dependency Rules** - Dependencies flow inward (domain is independent)
- **Contract-First Development** - API specs before implementation
- **Single Source of Truth** - Shared packages for consistency
- **Quality Standards** - Max 40 lines/method, 80% test coverage

**Full principles**: [Architecture Principles](docs/architecture/principles.md)

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│               Presentation Layer                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Web    │  │  Mobile  │  │ AI-MCP   │     │
│  │ (Next.js)│  │ (RN/Expo)│  │ (NestJS) │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└───────────────────┬─────────────────────────────┘
                    │ REST/GraphQL APIs
┌───────────────────┴─────────────────────────────┐
│              Application Layer                  │
│          (NestJS Backend - Port 8080)           │
│  ┌────────────────────────────────────────┐    │
│  │  8 Domain Modules (Bounded Contexts)   │    │
│  │  Auth │ Loyalty │ Rewards │ Customer   │    │
│  │  Partner │ Subscription │ Referral │   │    │
│  │  Blockchain/NFT                        │    │
│  └────────────────────────────────────────┘    │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────┴─────────────────────────────┐
│              Infrastructure Layer               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │PostgreSQL│  │   Redis  │  │  IPFS    │     │
│  │ (Prisma) │  │  (Cache) │  │  (NFTs)  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────────────────────────────────┐     │
│  │  Blockchain (Base/ETH/Solana/Sui)    │     │
│  └──────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

**Detailed diagrams**: [Architecture Overview](docs/architecture/overview.md)

## 🎯 Domain Structure (Bounded Contexts)

NxLoy is organized into 8 domain-driven bounded contexts:

| Domain | Purpose | Status |
|--------|---------|--------|
| **1. Authentication** | User identity, OAuth, sessions | 🚧 Partial (schema only) |
| **2. Loyalty** | Programs, rules, tiers, points | 📋 Planned |
| **3. Rewards** | Catalog, redemptions, inventory | 📋 Planned |
| **4. Customer Management** | Profiles, segments, transactions | 📋 Planned |
| **5. Partner Network** | Partners, integrations, revenue sharing | 📋 Planned |
| **6. Subscription** | Plans, billing, invoicing | 📋 Planned |
| **7. Referral** | Codes, tracking, rewards | 📋 Planned |
| **8. Blockchain/NFT** | Tokens, wallets, smart contracts | 📋 Planned |

**Detailed domain specs**: [Domain Structure](docs/architecture/domains.md)

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS (Node.js TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **API**: REST (OpenAPI/Swagger)
- **Events**: AsyncAPI for event-driven communication

### Frontend
- **Web**: Next.js 15 (React 19, App Router)
- **Mobile**: React Native 0.76.x with Expo
- **Styling**: Tailwind CSS

### Infrastructure
- **Monorepo**: Nx 22 with distributed caching
- **Package Manager**: pnpm with workspaces
- **Deployment**: Docker, Kubernetes (planned)

### Blockchain (📋 Planned)
- **EVM Chains**: Solidity for Base L2 and Ethereum
- **Solana**: Rust with Anchor Framework
- **Sui**: Move language
- **Storage**: IPFS for NFT metadata

**Full tech stack details**: [Tech Stack](docs/architecture/tech-stack.md)

## 💾 Data Architecture

### Database Design
- **Multi-Tenant**: All tables scoped by `businessId`
- **Multi-File Schema**: 8 Prisma schema files by domain
- **Soft Delete**: `deletedAt` column pattern
- **Audit Trail**: Created/updated timestamps

### Prisma Schema Organization
```
packages/database/prisma/schema/
├── base.prisma         # Common models (User, Business)
├── auth.prisma         # Authentication (Session, OAuth)
├── loyalty.prisma      # Loyalty programs
├── rewards.prisma      # Reward catalog
├── customer.prisma     # Customer profiles
├── partner.prisma      # Partner network
├── subscription.prisma # Billing & plans
└── blockchain.prisma   # NFT & tokens
```

**Status**: Only `base.prisma` and `auth.prisma` exist (2 of 8)

**Detailed data architecture**: [Data Architecture](docs/architecture/data-architecture.md)

## 🔐 Security & Quality

### Security
- Multi-tenant data isolation via `businessId`
- Row-level security in Prisma middleware
- No default env var values (fail fast)
- JWT authentication with refresh tokens

### Quality Standards
- **Code**: Max 40 lines/method, max 3 parameters
- **Testing**: 80% coverage minimum, no mocks, use factories
- **Documentation**: ADRs for all major decisions
- **CI/CD**: Automated testing and linting

## 🚀 Deployment Architecture (📋 Planned)

### Environments
- **Development**: Local with Docker Compose
- **Staging**: Kubernetes cluster (GKE/EKS)
- **Production**: Multi-region Kubernetes with CDN

### Monitoring
- Prometheus for metrics
- Grafana for dashboards
- Sentry for error tracking
- DataDog for APM

**Full deployment guide**: [Architecture Overview - Deployment](docs/architecture/overview.md#deployment)

## 📚 Additional Resources

### Development Guides
- [Backend Development](docs/development/backend.md)
- [Web Development](docs/development/web.md)
- [Mobile Development](docs/development/mobile.md)
- [Blockchain Development](docs/development/blockchain.md)
- [Infrastructure & DevOps](docs/development/infrastructure.md)

### Contributing
- [Architecture Principles](docs/architecture/principles.md)
- [Code Standards](docs/contributing/code-standards.md)
- [Testing Standards](docs/contributing/testing-standards.md)

### Decision Records
- [ADR-0001: Nx Monorepo with Git Worktrees](docs/adr/0001-nx-monorepo-with-git-worktrees.md)
- [All ADRs](docs/adr/)

---

**For detailed architecture information, navigate to the specific guides in [docs/architecture/](docs/architecture/).**

**Last Updated**: 2025-11-08
