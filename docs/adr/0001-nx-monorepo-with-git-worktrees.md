# ADR 0001: Nx Monorepo with Git Worktrees for Multi-Agent Development

**Date**: 2025-11-05
**Status**: Accepted


## Context

NxLoy (formerly "Ploy") is a comprehensive loyalty platform supporting:
- 21 predefined industries (COFFEE, CAR_WASH, RETAIL, ECOMMERCE, etc.)
- 6 loyalty rule types (POINTS_BASED, PUNCH_CARD, AMOUNT_SPENT, etc.)
- Multi-tenancy and white-label capabilities
- Custom workflow system

The development team consists of a solo human developer working with 4-5 AI agents simultaneously across different components (backend, web, mobile, AI/MCP, infrastructure, blockchain/NFT).

**Problem**: Traditional monorepo prevents parallel work due to git conflicts when multiple agents work on the same repository simultaneously.

## Decision

We will use **Nx Monorepo with Git Worktrees** for the NxLoy platform.

### Architecture Components:

1. **Nx Monorepo** (v22.0.2)
   - Single repository with all applications and packages
   - Distributed build caching
   - Dependency graph awareness
   - Parallel task execution

2. **pnpm Workspaces** (v10.14.0)
   - Efficient dependency management
   - Workspace protocol support
   - Fast installs with content-addressable storage

3. **Git Worktrees**
   - Multiple working directories from single repository
   - Isolated file systems per agent
   - Shared git history and branches
   - Zero merge conflicts during parallel development

4. **Changesets**
   - Independent package versioning
   - Changelog generation
   - Coordinated releases

### Repository Structure:

```
nxloy/
├── apps/
│   ├── backend/          # NestJS API
│   ├── web/              # Next.js 15 web app
│   ├── mobile/           # React Native app
│   └── ai-mcp/           # AI/MCP server
├── packages/
│   ├── shared-types/           # Common TypeScript types
│   ├── shared-validation/      # Zod schemas
│   ├── shared-utils/           # Utilities
│   ├── shared-config/          # ESLint, Prettier, tsconfig
│   ├── infrastructure/         # Terraform, K8s configs
│   └── blockchain-contracts/   # Smart contracts
├── docs/
│   ├── adr/              # Architecture Decision Records
│   ├── requirements/     # Business requirements
│   └── architecture/     # System architecture docs
└── tools/
    └── scripts/          # Worktree management scripts
```

## Alternatives Considered

### 1. Multi-Repo with Submodules
**Pros**: True isolation, independent versioning
**Cons**:
- Complex dependency management
- Difficult to coordinate changes across repos
- Poor context sharing between AI agents
- Submodule management overhead
**Rejected**: Too complex for 4-5 AI agents to coordinate

### 2. Monorepo without Worktrees
**Pros**: Simple, shared context
**Cons**:
- Git conflicts when multiple agents work simultaneously
- Cannot checkout different branches per agent
- Blocking workflow
**Rejected**: Primary problem we're solving

### 3. Event-Driven Microservices
**Pros**: Complete service isolation
**Cons**:
- Eventual consistency complexity
- Message queue infrastructure
- Distributed debugging challenges
- Overkill for current scale
**Rejected**: Unnecessary complexity

### 4. Modular Monolith with Feature Branches
**Pros**: Simple deployment, clear boundaries
**Cons**:
- Still has git conflict issues
- Cannot parallelize agent work
**Rejected**: Doesn't solve parallel development problem

## Consequences

### Positive:

1. **Parallel Development**: Each AI agent works in isolated worktree, zero conflicts
2. **Shared Context**: All agents see full codebase structure, types, and dependencies
3. **Fast Builds**: Nx caching reduces CI/CD time
4. **Type Safety**: Shared packages ensure consistent types across apps
5. **Easy Navigation**: Single repository, easy to find code
6. **Flexible Versioning**: Changesets allow independent package releases

### Negative:

1. **Learning Curve**: Team must learn worktree management
2. **Disk Space**: Each worktree duplicates working directory (mitigated by hardlinks)
3. **Script Dependencies**: Need custom scripts for worktree creation/cleanup
4. **Agent Coordination**: Must document worktree workflow in CLAUDE.md

### Neutral:

1. **Single Deployment**: All apps deploy as one unit (can be changed later)
2. **Monorepo Size**: Will grow with features (Nx handles large repos well)

## Implementation Plan

1. ✅ Initialize Nx workspace with pnpm
2. ✅ Generate applications (backend, web, mobile, ai-mcp)
3. ✅ Generate shared packages
4. ✅ Install Changesets
5. ✅ Create worktree management scripts
6. ✅ Document workflow in CLAUDE.md
7. ⏳ Create VS Code workspace configuration
8. ⏳ Test parallel agent workflow

## Success Metrics

- 4-5 AI agents can work simultaneously without conflicts
- Build time < 5 minutes with cache hits
- CI/CD pipeline passes on all branches
- All agents can navigate and understand full codebase

## References

- [Nx Documentation](https://nx.dev)
- [Git Worktrees](https://git-scm.com/docs/git-worktree)
- [Changesets](https://github.com/changesets/changesets)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## Appendix: Worktree Workflow

```bash
# Create worktree for agent
./tools/scripts/create-worktree.sh agent-1 backend-feature

# Agent works in isolation
cd ../nxloy-agent-1
nx serve backend

# Cleanup after merge
./tools/scripts/cleanup-worktree.sh agent-1
```
