# Technology Stack

**Related**: [Overview](./overview.md) | [Principles](./principles.md) | [Data Architecture](./data-architecture.md)

---

## Backend

**Framework**: NestJS 10.x
- Modular architecture
- Dependency injection
- Built-in OpenAPI (Swagger)
- Microservices-ready

**Database**: PostgreSQL 14+
- Relational data model
- ACID transactions
- Full-text search
- JSON support for flexible fields

**ORM**: Prisma 6.7+
- Type-safe database access
- Multi-file schema support
- Migration management
- Query optimization

**API**: REST + OpenAPI
- OpenAPI 3.1 specification
- Auto-generated documentation
- Request validation (class-validator)

**Events**: AsyncAPI
- Event-driven architecture
- Message queues (planned: RabbitMQ/Kafka)
- Domain events

**Authentication**: Passport.js
- OAuth 2.0 strategies
- JWT tokens
- Session management

## Frontend (Web)

**Framework**: Next.js 15.x
- App Router (React Server Components)
- Server-side rendering (SSR)
- Static site generation (SSG)
- API routes

**UI Library**: React 19.x
- Component-based architecture
- Hooks
- Context API

**Styling**: Tailwind CSS 3.x
- Utility-first CSS
- Responsive design
- Dark mode support

**State Management**:
- React Context (simple state)
- TanStack Query (server state)
- Zustand (complex client state, if needed)

**Forms**: React Hook Form + Zod
- Type-safe validation
- Performance optimized

## Mobile

**Framework**: React Native 0.76.x
- iOS and Android from single codebase
- Native performance
- Platform-specific code when needed

**Navigation**: React Navigation
- Stack, tab, drawer navigation
- Deep linking

**State Management**: Same as web (React Context + TanStack Query)

**UI Components**: React Native Paper or Custom
- Material Design guidelines
- iOS Human Interface Guidelines

## Infrastructure

**Monorepo**: Nx 22.x
- Dependency graph
- Affected commands (test/build only what changed)
- Distributed caching

**Package Manager**: pnpm 10.x
- Fast, efficient
- Workspace support
- Content-addressable storage

**CI/CD**: GitHub Actions (planned)
- Automated testing
- Build and deploy
- Changesets for versioning

**Deployment**: Kubernetes (planned)
- Container orchestration
- Auto-scaling
- Rolling updates

**Monitoring**: (planned)
- Logging: Winston + ELK stack
- Metrics: Prometheus + Grafana
- APM: DataDog or New Relic

## Shared Packages

| Package | Description | Usage | Status |
|---------|-------------|-------|--------|
| **@nxloy/shared-types** | TypeScript type definitions | Import shared types across all apps | ✅ Complete |
| **@nxloy/shared-validation** | Zod validation schemas | Validate data consistently | ✅ Complete |
| **@nxloy/shared-utils** | Common utility functions | Reusable helper functions | ✅ Complete |
| **@nxloy/shared-config** | ESLint, Prettier, TS configs | Consistent code standards | ✅ Complete |
| **@nxloy/infrastructure** | Terraform, K8s definitions | Infrastructure as code | 📋 Stub only |
| **@nxloy/blockchain-contracts** | Smart contracts | NFT and token contracts | 📋 Stub only |
| **@nxloy/database** | Prisma schema & client | Centralized database access | 🚧 2 of 8 schemas |

---

**Last Updated**: 2025-11-08
**Source**: ARCHITECTURE.md (Lines 368-475), README.md (Lines 47-68)
