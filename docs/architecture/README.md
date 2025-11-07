# NxLoy Architecture Documentation

This directory contains comprehensive architecture documentation for the NxLoy platform.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Core Components](#core-components)
4. [Technology Stack](#technology-stack)
5. [Deployment Architecture](#deployment-architecture)

## System Overview

NxLoy is a comprehensive loyalty platform built as an **Nx Monorepo** with Git Worktrees for multi-agent parallel development.

### Key Capabilities

- **21 Industry Templates**: Pre-configured loyalty programs for various industries
- **6 Loyalty Rule Types**: Flexible reward mechanisms
- **Multi-Tenancy**: Support for multiple businesses on single platform
- **White-Label**: Customizable branding per tenant
- **Custom Workflows**: Configurable business logic per industry
- **AI/MCP Integration**: Intelligent automation and Model Context Protocol support
- **Blockchain/NFT**: Digital rewards and ownership verification

## Architecture Patterns

### 1. Modular Monolith

NxLoy follows a **Modular Monolith** pattern with strict module boundaries:

```
┌─────────────────────────────────────────────────┐
│                  API Gateway                    │
│            (NestJS Backend)                     │
└──────────┬──────────┬─────────-─┬────────-───────┘
           │          │           │
    ┌──────▼───┐ ┌──-─▼─────┐  ┌-─▼────────┐
    │  Auth    │ │ Loyalty  │  │Customer   │
    │  Module  │ │ Module   │  │ Module    │
    └──────────┘ └──────────┘  └────────-──┘
           │          │          │
    ┌──────▼──────────▼──────────▼───-────┐
    │      Shared Services Layer          │
    │  (Types, Validation, Utils)         │
    └─────────────────────────────────────┘
           │
    ┌──────▼──────────┐
    │   PostgreSQL    │
    │   (Prisma ORM)  │
    └─────────────────┘
```

**Benefits:**
- Single deployment unit
- Strong consistency
- Simple debugging
- Fast inter-module communication
- Easy to refactor boundaries

### 2. Nx Monorepo + Git Worktrees

```
nxloy (main repo)
├── apps/
│   ├── backend/          # NestJS API
│   ├── web/              # Next.js 15
│   ├── mobile/           # React Native
│   └── ai-mcp/           # AI/MCP Server
└── packages/
    ├── shared-types/           # Common types
    ├── shared-validation/      # Zod schemas
    ├── shared-utils/           # Utilities
    ├── shared-config/          # Configs
    ├── infrastructure/         # IaC
    └── blockchain-contracts/   # Smart contracts

Git Worktrees (for parallel AI agents):
├── nxloy-agent-1/        # Agent 1 workspace
├── nxloy-agent-2/        # Agent 2 workspace
└── nxloy-agent-3/        # Agent 3 workspace
```

**Benefits:**
- Zero git conflicts between agents
- Shared context and types
- Independent deployments possible
- Fast builds with Nx caching

## Core Components

### 1. Backend (NestJS)

**Location**: `apps/backend/`

**Responsibilities:**
- REST API endpoints
- Business logic orchestration
- Authentication & Authorization
- Database access via Prisma
- Event handling
- Background jobs

**Key Modules:**
- `auth` - Authentication, JWT, OAuth
- `loyalty` - Loyalty programs, rules, rewards
- `customer` - Customer management
- `business` - Business/tenant management
- `transaction` - Transaction processing
- `industry` - Industry-specific configurations
- `workflow` - Custom workflow engine

### 2. Web Frontend (Next.js 15)

**Location**: `apps/web/`

**Responsibilities:**
- Business dashboard
- Customer-facing web portal
- Admin interface
- Analytics & reporting

**Key Features:**
- Server-side rendering
- App Router architecture
- React Server Components
- TailwindCSS styling

### 3. Mobile App (React Native)

**Location**: `apps/mobile-backup/` (currently in backup due to CocoaPods issue)

**Responsibilities:**
- Customer mobile experience
- QR code scanning
- Push notifications
- Offline support

### 4. AI/MCP Server

**Location**: `apps/ai-mcp/`

**Responsibilities:**
- AI-powered recommendations
- Model Context Protocol integration
- Natural language processing
- Predictive analytics

### 5. Shared Packages

All shared packages are publishable with `@nxloy/*` namespace:

- **shared-types** - TypeScript interfaces, DTOs, enums
- **shared-validation** - Zod schemas for runtime validation
- **shared-utils** - Common utilities (date, string, number formatters)
- **shared-config** - ESLint, Prettier, tsconfig presets
- **infrastructure** - Terraform, Kubernetes manifests
- **blockchain-contracts** - Solidity smart contracts

## Technology Stack

### Backend
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Queue**: Bull/BullMQ
- **Testing**: Jest, Supertest

### Frontend (Web)
- **Framework**: Next.js 15.x
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS 4.x
- **State**: React Query, Zustand
- **Testing**: Jest, Playwright

### Frontend (Mobile)
- **Framework**: React Native 0.75+
- **Language**: TypeScript 5.x
- **Navigation**: React Navigation
- **State**: React Query, Zustand
- **Testing**: Jest, Detox

### AI/MCP
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.x
- **AI SDKs**: OpenAI, Anthropic
- **MCP**: Model Context Protocol

### Infrastructure
- **Monorepo**: Nx 22.x
- **Package Manager**: pnpm 10.x
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **IaC**: Terraform
- **Monitoring**: Grafana, Prometheus

### Blockchain
- **Smart Contracts**: Solidity
- **Network**: Ethereum, Polygon
- **Tools**: Hardhat, Ethers.js

## Deployment Architecture

### Development Environment

```
Developer Machine
├── nxloy/ (main workspace)
├── nxloy-agent-1/ (agent workspace)
├── nxloy-agent-2/ (agent workspace)
└── Local Services
    ├── PostgreSQL (Docker)
    ├── Redis (Docker)
    └── MinIO (Docker)
```

### Production Environment

```
┌─────────────────────────────────────────┐
│          Load Balancer (AWS ALB)        │
└──────────┬──────────────────────────────┘
           │
    ┌──────▼──────┐
    │   API GW    │
    │  (Backend)  │
    └──────┬──────┘
           │
    ┌──────▼──────────────────────────┐
    │     Kubernetes Cluster          │
    │  ┌─────────┐  ┌──────────┐     │
    │  │Backend  │  │Web       │     │
    │  │Pods     │  │Pods      │     │
    │  └─────────┘  └──────────┘     │
    │  ┌─────────┐  ┌──────────┐     │
    │  │AI/MCP   │  │Workers   │     │
    │  │Pods     │  │Pods      │     │
    │  └─────────┘  └──────────┘     │
    └─────────────────────────────────┘
           │           │
    ┌──────▼──────┐  ┌▼────────┐
    │ PostgreSQL  │  │ Redis   │
    │   (RDS)     │  │(Elasticache)│
    └─────────────┘  └─────────┘
```

## Next Steps

1. **Module Boundaries**: Define strict import rules via Nx tags
2. **API Documentation**: OpenAPI/Swagger specs
3. **Database Schema**: Entity-relationship diagrams
4. **Sequence Diagrams**: Key user flows
5. **Security Architecture**: Authentication, authorization flows
6. **Scalability Plan**: Horizontal scaling, caching strategies

## Related Documentation

- [ADRs](../adr/) - Architecture decisions
- [Requirements](../requirements/) - Business requirements
- [Setup Guide](../../README.md) - Getting started
