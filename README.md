# NxLoy - Loyalty Platform Monorepo

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22.12.0-brightgreen.svg)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.14.0-orange.svg)](package.json)
[![Prisma](https://img.shields.io/badge/prisma-%3E%3D6.7.0-blue.svg)](packages/database)
[![Documentation](https://img.shields.io/badge/docs-v2.0.0-blue.svg)](docs/requirements/)

Modern multi-tenant loyalty platform with **unified wallet**, **viral growth mechanics**, and **social community features** supporting 21 industries.

## 🚧 Status

**Active Development** | Version 0.1.0 | Documentation v2.0.0 | Not production-ready

**Latest Documentation Updates (v2.0.0)**:
- ✅ Unified Wallet features (store credit, digital rewards, multi-tender redemption)
- ✅ Viral Growth Suite (UGC, challenges, influencer network, analytics)
- ✅ Social & Community features (social feed, group challenges, influencer programs)
- ✅ Content Management (A/B testing, personalization, multi-language)
- ✅ 21 comprehensive feature specifications (100% coverage)

### Implementation Status Legend

- ✅ **Complete**: Working, tested, ready to use
- 🚧 **In Progress**: Partial implementation, functional but incomplete
- 📋 **Planned**: Documented and designed, not yet implemented

## ⚡ What Works Now?

### ✅ **Ready to Use**
- **Nx Monorepo**: Fully configured with caching, task orchestration, dependency graph
- **pnpm Workspaces**: Fast dependency management across all packages
- **Shared Packages**: TypeScript types, Zod validation, utilities, configs (all working)
- **Web App**: Next.js 15 with App Router, fully configured and runnable
- **Mobile Development**: React Native with Expo - development mode works (iOS/Android)
- **Testing Infrastructure**: Jest, Playwright E2E testing configured
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

### 🚧 **Partially Working**
- **Database**: Prisma configured with 2 of 8 domain schemas (auth + base)
- **Backend**: NestJS framework set up, no domain modules yet
- **Mobile Builds**: Development works, production builds need eas.json

### 📋 **Not Implemented Yet**
- **AI-MCP Server**: Placeholder only
- **Blockchain**: No smart contracts, no Hardhat config
- **Infrastructure**: No Docker/K8s/Terraform files
- **Backend Domains**: 0 of 8 business logic modules
- **6 Database Schemas**: Loyalty, Rewards, Customer, Partner, Subscription, Referrals

**Bottom Line**: This is a well-architected pre-alpha with strong foundation, but core business logic is pending implementation.

## 📦 What's Inside?

### Applications

| Application | Port | Status | Documentation |
|------------|------|--------|---------------|
| **backend** | 8080 | 🚧 Framework only | [Backend Guide](docs/development/backend.md) |
| **web** | 8081 | ✅ Complete | [Web Guide](docs/development/web.md) |
| **mobile** | 8082 | 🚧 Dev mode works | [Mobile Guide](docs/development/mobile.md) |
| **ai-mcp** | 8083 | 📋 Placeholder only | [AI-MCP Guide](docs/development/ai-mcp.md) |

### Shared Packages

| Package | Status | Purpose |
|---------|--------|---------|
| **@nxloy/shared-types** | ✅ Complete | TypeScript type definitions |
| **@nxloy/shared-validation** | ✅ Complete | Zod validation schemas |
| **@nxloy/shared-utils** | ✅ Complete | Common utility functions |
| **@nxloy/shared-config** | ✅ Complete | ESLint, Prettier, TS configs |
| **@nxloy/infrastructure** | 📋 Stub only | [Terraform, K8s definitions](docs/development/infrastructure.md) |
| **@nxloy/blockchain-contracts** | 📋 Stub only | [Smart contracts](docs/development/blockchain.md) |
| **@nxloy/database** | 🚧 2 of 8 schemas | Prisma schema & client |

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: 22.12.0+ ([Download](https://nodejs.org/))
- **pnpm**: 10.14.0+ ([Install](https://pnpm.io/))
- **PostgreSQL**: 16 or 17 ([Download](https://www.postgresql.org/))

**📖 Full Prerequisites**: [docs/setup/prerequisites.md](docs/setup/prerequisites.md)

### 2. Installation

```bash
# Clone repository
git clone https://github.com/channainfo/nxloy.git
cd nxloy

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
cd packages/database
pnpm prisma migrate dev
pnpm prisma generate
```

**📖 Detailed Installation**: [docs/setup/installation.md](docs/setup/installation.md)

### 3. Run Applications

```bash
# Backend API (http://localhost:8080)
nx serve backend

# Web Frontend (http://localhost:8081)
nx serve web

# Mobile (iOS/Android/Web)
nx run mobile:start
```

**📖 Quick Start Guide**: [docs/setup/quick-start.md](docs/setup/quick-start.md)

### 4. Verify Installation

```bash
nx affected:test && nx affected:lint && nx run-many --target=typecheck --all
```

If all commands succeed, you're ready to develop! 🎉

## 📚 Documentation

### 📖 Setup & Getting Started
- [Prerequisites](docs/setup/prerequisites.md) - System requirements and tools
- [Installation](docs/setup/installation.md) - Step-by-step setup guide
- [Quick Start](docs/setup/quick-start.md) - Get running in 5 minutes
- [Troubleshooting](docs/setup/troubleshooting.md) - Common issues and solutions

### 💻 Development Guides
- [Backend (NestJS)](docs/development/backend.md) - API development guide
- [Web (Next.js)](docs/development/web.md) - Frontend development guide
- [Mobile (React Native)](docs/development/mobile.md) - iOS/Android development
- [AI-MCP Integration](docs/development/ai-mcp.md) - AI features (📋 planned)
- [Blockchain & Smart Contracts](docs/development/blockchain.md) - Web3 integration (📋 planned)
- [Infrastructure & DevOps](docs/development/infrastructure.md) - Docker/K8s/Terraform (📋 planned)

### 🤝 Contributing
- [Code of Conduct](docs/contributing/code-of-conduct.md) - Community standards
- [Getting Started](docs/contributing/getting-started.md) - First contribution
- [Development Workflow](docs/contributing/development-workflow.md) - Day-to-day workflow
- [Code Standards](docs/contributing/code-standards.md) - Code quality rules
- [Testing Standards](docs/contributing/testing-standards.md) - Testing philosophy
- [Custom Claude Agents](docs/contributing/custom-agents.md) - AI-assisted development
- [Pull Request Process](docs/contributing/pull-request-process.md) - PR guidelines
- [Database Migrations](docs/contributing/database-migrations.md) - Prisma migrations
- [Documentation Requirements](docs/contributing/documentation-requirements.md) - Writing docs

**👉 Start Here**: [CONTRIBUTING.md](CONTRIBUTING.md)

### 🏗️ Architecture & Design
- [Overview](docs/architecture/overview.md) - High-level architecture
- [Principles](docs/architecture/principles.md) - Core architectural principles
- [Domain Structure](docs/architecture/domains.md) - 8 bounded contexts
- [Tech Stack](docs/architecture/tech-stack.md) - Technology choices
- [Data Architecture](docs/architecture/data-architecture.md) - Database design

**Key Features (v2.0.0)**:
- **Unified Wallet**: Multi-tender redemption (points + store credit + digital rewards + cash)
- **Viral Growth**: K-factor tracking, UGC automation, influencer matching, viral challenges
- **Social Community**: Social feed, group challenges, UGC rewards, influencer programs
- **Multi-Currency**: 8 ASEAN currencies (USD, KHR, SGD, THB, VND, MYR, PHP, IDR)
- **FIFO Redemption**: Earliest expiration first, automatic balance optimization

**👉 Start Here**: [ARCHITECTURE.md](ARCHITECTURE.md)

### 🔧 Workflow Guides
- [Multi-Agent Development](docs/guides/multi-agent-workflow.md) - Parallel AI development
- [Git Worktree Workflow](docs/guides/worktree-workflow.md) - Worktree best practices

### 📋 Project Management & Requirements (v2.0.0)

**Business Requirements**:
- [Business Requirements](docs/requirements/BUSINESS-REQUIREMENTS.md) - Complete business requirements (v2.0.0)
- [Product Roadmap](docs/requirements/PRODUCT-ROADMAP.md) - 18-month phased roadmap (v2.0.0)
- [Use Cases & Success Stories](docs/requirements/USE-CASES.md) - Real-world applications (v2.0.0)
- [Terminology Reference](docs/requirements/TERMINOLOGY.md) - Ubiquitous language (v2.0.0)

**Feature Specifications** (21 Features - 100% Coverage):
- [Feature Documentation Guide](docs/requirements/features/) - All feature specs organized by phase
- **Phase 1**: Unified Wallet (store credit, digital rewards, multi-tender)
- **Phase 2-3**: Viral Growth Suite ([overview](docs/requirements/features/viral-growth/SUITE-OVERVIEW.md), [roadmap](docs/requirements/features/viral-growth/IMPLEMENTATION-ROADMAP.md))
  - UGC & AI Content Automation
  - Viral Challenges Builder
  - Influencer Network & Matching
  - Viral Analytics & Growth
- **Phase 5**: Social & Community Features
- **Phase 4-5**: Advanced Features (AI, Blockchain, Gamification, Sustainability, Voice, Finance)

**Domain Specifications**:
- [Domain Specifications](docs/requirements/domain-specs/) - Domain-driven design (8 bounded contexts)

**Integration & Deployment**:
- [Integration Guides](docs/requirements/integration-guides/) - API, deployment, testing, monitoring

**Architecture Decisions**:
- [ADRs](docs/adr/) - Architecture Decision Records

## 🛠️ Technology Stack

**Backend**: NestJS, Prisma, PostgreSQL
**Frontend**: Next.js 15, React 19, Tailwind CSS
**Mobile**: React Native 0.76.x, Expo
**Infrastructure**: Nx 22, pnpm, Docker (planned), Kubernetes (planned)
**Blockchain**: Solidity (Base/Ethereum), Rust/Anchor (Solana), Move (Sui) - all planned

**📖 Full Tech Stack Details**: [docs/architecture/tech-stack.md](docs/architecture/tech-stack.md)

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines:

1. Read the [Code of Conduct](docs/contributing/code-of-conduct.md)
2. Follow the [Development Workflow](docs/contributing/development-workflow.md)
3. Adhere to [Code Standards](docs/contributing/code-standards.md)
4. Write tests following [Testing Standards](docs/contributing/testing-standards.md)
5. Create PRs using [Pull Request Process](docs/contributing/pull-request-process.md)

**📖 Full Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

Proprietary - © 2025 NxPloy. All rights reserved.

## 🙏 Acknowledgments

Built with [Nx](https://nx.dev/), [NestJS](https://nestjs.com/), [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/), and [React Native](https://reactnative.dev/).

---

## 📊 Documentation Coverage (v2.0.0)

- ✅ **Business Requirements**: Complete with wallet, viral growth, social, content features
- ✅ **Product Roadmap**: 5 phases, 18 months, fully updated
- ✅ **Feature Specifications**: 21/21 features (100% FEATURE-SPEC coverage)
- ✅ **Use Cases**: 8 comprehensive use cases with ROI calculations
- ✅ **Terminology**: 800+ terms covering wallet, viral, social, content domains
- ✅ **Domain Specifications**: 8 bounded contexts fully documented
- ✅ **Integration Guides**: API, deployment, testing, monitoring complete

**Next Milestones**:
- 🚧 Backend implementation (CONTRACTS, BACKEND docs)
- 🚧 Frontend implementation (WEB, MOBILE docs)
- 📋 Infrastructure deployment (INFRASTRUCTURE docs)

---

**Version**: 0.1.0 (Code) | v2.0.0 (Documentation)
**Last Updated**: 2025-11-09
**Maintained By**: NxPloy
**Project Status**: Active Development (Pre-Alpha)

**📖 For detailed documentation, see [docs/](docs/) directory.**
