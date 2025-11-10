# Multi-Agent Development Workflow

**Related**: [Worktree Workflow](./worktree-workflow.md) | [Git Sync Workflow](./git-sync-workflow.md) | [CLAUDE.md](../../CLAUDE.md) | [ADR-0001](../adr/0001-nx-monorepo-with-git-worktrees.md)

---

**Problem**: Multiple AI agents can't work on the same repository simultaneously without conflicts.

**Solution**: Git worktrees create isolated working directories for parallel development.

**When to Use**: Only for **2+ features simultaneously** with **multiple agents**. For single-agent development, use regular branches.

## Do You Need Multi-Agent Worktrees?

### Use Regular Branch (No Worktree) When:
- ✅ Single agent, single feature (most common)
- ✅ Sequential development (one feature after another)
- ✅ Quick bug fixes or small changes

**Example**: Building one feature at a time with one agent.

### Use Multi-Agent Worktrees When:
- ✅ 2+ agents working simultaneously on different features
- ✅ Different domains (auth.prisma + loyalty.prisma avoid conflicts)
- ✅ Need to preserve agent state while switching contexts
- ✅ Long-running features with interruptions

**Example**: Agent 1 builds OAuth while Agent 2 builds tier system (parallel).

**Complete decision guide and lifecycle examples**: See [Git Sync Workflow](./git-sync-workflow.md)

## How It Works

```
Main Repository                 Agent Worktrees
┌─────────────────┐            ┌──────────────────┐
│   nxloy/        │            │ nxloy-agent-1/   │
│   (main)        │───────────>│ (feature-auth)   │
│                 │            └──────────────────┘
│                 │            ┌──────────────────┐
│                 │───────────>│ nxloy-agent-2/   │
│                 │            │ (feature-loyalty)│
└─────────────────┘            └──────────────────┘

Each agent works independently, zero git conflicts!
```

## Quick Commands

**Create worktree for an agent**:
```bash
./tools/scripts/create-worktree.sh agent-1 feature-auth
```

**Agent works in isolated directory**:
```bash
cd ../nxloy-agent-1
pnpm install  # Install dependencies
nx serve backend  # Work independently
```

**After feature is merged, cleanup**:
```bash
./tools/scripts/cleanup-worktree.sh agent-1
```

## Benefits

- ✅ **Zero git conflicts** - Each agent has isolated workspace
- ✅ **True parallel development** - 7 agents can work simultaneously
- ✅ **Safe experimentation** - Changes don't affect main workspace
- ✅ **Fast context switching** - Navigate between worktrees instantly

## Use Cases

### 1. Parallel Feature Development

```bash
# Agent 1: Implements OAuth authentication
./tools/scripts/create-worktree.sh agent-1 feature/123-oauth-login
cd ../nxloy-agent-1
# ... implement OAuth feature

# Agent 2: Implements loyalty points calculation (simultaneously)
./tools/scripts/create-worktree.sh agent-2 feature/124-loyalty-points
cd ../nxloy-agent-2
# ... implement loyalty feature

# Both agents work independently, no conflicts!
```

### 2. Code Review Workflow

```bash
# Agent 1: Review backend code
cd nxloy-agent-1
/task @backend-code-reviewer Review apps/backend/src/auth/

# Agent 2: Review frontend code (simultaneously)
cd nxloy-agent-2
/task @frontend-implementation-specialist Review apps/web/src/components/

# Parallel reviews, faster feedback
```

### 3. Multi-Domain Development

```bash
# Agent 1: Auth domain
./tools/scripts/create-worktree.sh agent-1 feature/auth-domain
# Edit packages/database/prisma/schema/auth.prisma

# Agent 2: Loyalty domain (no conflicts - different schema file!)
./tools/scripts/create-worktree.sh agent-2 feature/loyalty-domain
# Edit packages/database/prisma/schema/loyalty.prisma

# Multi-file Prisma schema prevents conflicts
```

## Best Practices

### 1. One Domain Per Agent

Assign agents to different domains to minimize conflicts:

- **Agent 1**: Authentication domain (`auth.prisma`, `apps/backend/src/auth/`)
- **Agent 2**: Loyalty domain (`loyalty.prisma`, `apps/backend/src/loyalty/`)
- **Agent 3**: Rewards domain (`rewards.prisma`, `apps/backend/src/rewards/`)

### 2. Name Worktrees Clearly

```bash
# ✅ Good: Clear agent identifier
./tools/scripts/create-worktree.sh auth-agent feature/oauth
./tools/scripts/create-worktree.sh loyalty-agent feature/points

# ❌ Bad: Generic names
./tools/scripts/create-worktree.sh agent1 feature
```

### 3. Cleanup After Merge

Always cleanup worktrees after PR is merged:

```bash
# After feature/oauth-login is merged to main
./tools/scripts/cleanup-worktree.sh auth-agent
```

### 4. Coordinate Shared Files

If multiple agents need to edit shared files (like `base.prisma`):
- Coordinate timing to avoid conflicts
- Use sequential development for shared files
- Or merge one PR before starting the other

## Troubleshooting

### Worktree Already Exists

**Error**: `fatal: 'nxloy-agent-1' already exists`

**Solution**:
```bash
# Remove existing worktree
./tools/scripts/cleanup-worktree.sh agent-1

# Or force remove
git worktree remove ../nxloy-agent-1 --force
```

### Dependencies Out of Sync

**Problem**: Different dependency versions in worktrees

**Solution**:
```bash
# In each worktree, reinstall dependencies
cd ../nxloy-agent-1
pnpm install
```

### Branch Conflicts

**Problem**: Multiple worktrees trying to use same branch

**Solution**: Use unique branch names per worktree
```bash
# ✅ Good
./tools/scripts/create-worktree.sh agent-1 feature/123-auth
./tools/scripts/create-worktree.sh agent-2 feature/124-loyalty

# ❌ Bad
./tools/scripts/create-worktree.sh agent-1 feature/new
./tools/scripts/create-worktree.sh agent-2 feature/new  # Conflict!
```

## Documentation

- **ADR-0001**: [Nx Monorepo with Git Worktrees](../adr/0001-nx-monorepo-with-git-worktrees.md) - Full rationale
- **CLAUDE.md**: [AI Agent Instructions](../../CLAUDE.md) - Agent-specific workflow
- **Worktree Scripts**: [tools/scripts/](../../tools/scripts/) - Script source code
- **Worktree Workflow**: [worktree-workflow.md](./worktree-workflow.md) - Detailed workflow guide

---

**Last Updated**: 2025-11-08
**Source**: README.md (Lines 906-959)
