# NxLoy Documentation

Welcome to the NxLoy platform documentation. This directory contains comprehensive documentation for developers, architects, and stakeholders.

## Documentation Structure

```
docs/
├── README.md                    # This file - Documentation index
├── adr/                         # Architecture Decision Records
│   ├── README.md
│   └── 0001-nx-monorepo-with-git-worktrees.md
├── architecture/                # System architecture
│   └── README.md
└── requirements/                # Business requirements
    └── README.md
```

## Quick Links

### For Developers
- [Getting Started](../README.md) - Setup guide
- [Architecture Overview](./architecture/README.md) - System design
- [ADR Index](./adr/README.md) - Architecture decisions
- [CLAUDE.md](../CLAUDE.md) - AI agent instructions
- [Setup Completion Guide](../SETUP_COMPLETION.md) - Remaining setup tasks

### For Product/Business
- [Business Requirements](./requirements/README.md) - Features and specifications
- [21 Industry Templates](./requirements/README.md#1-industry-templates) - Supported industries
- [6 Loyalty Rule Types](./requirements/README.md#2-loyalty-rule-types) - Reward mechanisms
- [Feature Roadmap](./requirements/README.md#feature-roadmap) - Development timeline

### For Architects
- [Architecture Patterns](./architecture/README.md#architecture-patterns) - Design decisions
- [Technology Stack](./architecture/README.md#technology-stack) - Tech choices
- [Deployment Architecture](./architecture/README.md#deployment-architecture) - Infrastructure
- [ADR-0001: Monorepo with Git Worktrees](./adr/0001-nx-monorepo-with-git-worktrees.md) - Core architecture decision

## Documentation Categories

### 1. Architecture Decision Records (ADRs)

Location: [`./adr/`](./adr/)

ADRs document important architectural decisions with context, alternatives, and consequences.

**Current ADRs:**
- [ADR-0001](./adr/0001-nx-monorepo-with-git-worktrees.md) - Nx Monorepo with Git Worktrees for Multi-Agent Development

**When to Create an ADR:**
- Choosing a framework or library
- Selecting a design pattern
- Making infrastructure decisions
- Changing existing architecture
- Any decision with long-term impact

### 2. Architecture Documentation

Location: [`./architecture/`](./architecture/)

Comprehensive system architecture documentation covering:
- System overview
- Architecture patterns (Modular Monolith)
- Core components (Backend, Web, Mobile, AI/MCP)
- Technology stack
- Deployment architecture
- Future scalability plans

### 3. Requirements Documentation

Location: [`./requirements/`](./requirements/)

Business requirements and specifications:
- Vision and target users
- 21 industry templates
- 6 loyalty rule types
- Multi-tenancy requirements
- White-label support
- Custom workflows
- Security & compliance
- Feature roadmap
- Success metrics

## Key Concepts

### Nx Monorepo

NxLoy uses **Nx** to manage multiple applications and packages in a single repository:

```
nxloy/
├── apps/           # Deployable applications
│   ├── backend/    # NestJS API
│   ├── web/        # Next.js 15 web app
│   ├── mobile/     # React Native app
│   └── ai-mcp/     # AI/MCP server
└── packages/       # Shared libraries
    ├── shared-types/
    ├── shared-validation/
    ├── shared-utils/
    ├── shared-config/
    ├── infrastructure/
    └── blockchain-contracts/
```

**Benefits:**
- Shared code and types
- Distributed build caching
- Dependency graph awareness
- Atomic commits across apps

### Git Worktrees for Multi-Agent Development

**Problem**: Multiple AI agents can't work on the same git repo simultaneously without conflicts.

**Solution**: Git worktrees create separate working directories that share git history:

```bash
# Main workspace
cd nxloy/

# Create worktree for Agent 1
./tools/scripts/create-worktree.sh agent-1 backend-feature

# Agent 1 works in isolation
cd ../nxloy-agent-1/
nx serve backend

# No conflicts with other agents!
```

**Benefits:**
- Zero git conflicts
- Parallel development
- Shared git history
- Easy cleanup after merge

See [ADR-0001](./adr/0001-nx-monorepo-with-git-worktrees.md) for full rationale.

### Industry Templates

NxLoy supports **21 predefined industries**, each with:
- Default loyalty rule types
- Industry-specific terminology
- Pre-configured reward tiers
- Template campaigns
- Recommended configurations

Example industries: COFFEE, RETAIL, RESTAURANTS, FITNESS, ECOMMERCE, SAAS, etc.

See [full list](./requirements/README.md#industries).

### Loyalty Rule Types

**6 flexible reward mechanisms** that can be combined:

1. **POINTS_BASED** - Earn points per dollar
2. **PUNCH_CARD** - Digital stamp cards
3. **AMOUNT_SPENT** - Spend-based milestones
4. **TIER_BASED** - Bronze/Silver/Gold tiers
5. **VISIT_FREQUENCY** - Visit-based rewards
6. **STAMP_CARD** - Item-specific collections

See [detailed specifications](./requirements/README.md#2-loyalty-rule-types).

## Development Workflow

### Standard Development

```bash
# Install dependencies
pnpm install

# Serve backend
nx serve backend

# Serve web
nx serve web

# Run tests
nx affected:test

# Build all
nx run-many --target=build --all

# View dependency graph
nx graph
```

### Multi-Agent Development

```bash
# Developer works in main workspace
cd nxloy/
nx serve backend

# Agent 1 works on frontend
./tools/scripts/create-worktree.sh agent-1 web-feature
cd ../nxloy-agent-1/
nx serve web

# Agent 2 works on mobile
cd ../nxloy/
./tools/scripts/create-worktree.sh agent-2 mobile-feature
cd ../nxloy-agent-2/
nx serve mobile

# All agents work in parallel without conflicts!
```

See [CLAUDE.md](../CLAUDE.md) for full AI agent instructions.

## Project Status

### Completed ✅
- Nx monorepo setup
- pnpm workspace configuration
- Backend (NestJS) application
- Web (Next.js 15) application
- AI/MCP (Node.js) application
- 6 shared packages (types, validation, utils, config, infrastructure, blockchain)
- Changesets for versioning
- Git worktree scripts
- Core documentation (ADRs, architecture, requirements)
- VS Code workspace configuration

### In Progress 🚧
- Mobile app (React Native) - CocoaPods issue, moved to backup
- Initial testing and validation

### TODO 📋
- Fix mobile app CocoaPods/visionOS issue
- Create initial git commit
- Set up CI/CD pipeline
- Deploy to staging environment
- Begin Phase 1 feature development

## Contributing

### Creating New Documentation

1. **ADRs**: Copy template from [adr/README.md](./adr/README.md)
2. **Architecture**: Add to [architecture/](./architecture/)
3. **Requirements**: Add to [requirements/](./requirements/)

### Documentation Standards

- Use **Markdown** format
- Include **diagrams** where helpful (Mermaid, ASCII, or images)
- Link to **related docs**
- Keep **concise** and **scannable**
- Update **index files** (READMEs)
- Date all documents

## External Resources

### Nx Documentation
- [Nx Official Docs](https://nx.dev)
- [Nx Monorepo Tutorial](https://nx.dev/getting-started/intro)
- [Nx Console (VS Code)](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console)

### Git Worktrees
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [Git Worktree Tutorial](https://spin.atomicobject.com/2021/10/25/git-worktree/)

### Technology Stack
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [pnpm Documentation](https://pnpm.io)

## Support

For questions or issues:
- Check existing [ADRs](./adr/) for architecture decisions
- Review [architecture docs](./architecture/) for system design
- Consult [requirements](./requirements/) for feature specs
- See [main README](../README.md) for setup help

---

**Last Updated**: 2025-11-05

