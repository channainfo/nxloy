# NxLoy Custom Agents - Quick Reference

**Quick Navigation**:
- [Full Agent Guide](../../docs/contributing/custom-agents.md) - Comprehensive agent documentation
- [Multi-Agent Workflow](../../docs/guides/multi-agent-workflow.md) - Parallel development with worktrees
- [Worktree Workflow](../../docs/guides/worktree-workflow.md) - Detailed worktree setup
- [Development Workflow](../../docs/contributing/development-workflow.md) - General development practices

---

## Available Agents (7)

| Agent | Purpose | When to Use | Invoke Command |
|-------|---------|-------------|----------------|
| **backend-code-reviewer** | NestJS backend code review | After implementing backend features | `/task @backend-code-reviewer Review [file-path]` |
| **frontend-implementation-specialist** | Cross-platform UI (Next.js + React Native) | Building web/mobile features | `/task @frontend-implementation-specialist Create [feature-name]` |
| **architecture-reviewer** | Architecture & security analysis | Complex features, new patterns, security concerns | `/task @architecture-reviewer Review [scope]` |
| **blockchain-nft-code-reviewer** | Smart contracts & Web3 review | Blockchain integrations, NFT features | `/task @blockchain-nft-code-reviewer Review [contract-path]` |
| **ai-mcp-genai-reviewer** | AI/MCP code review | AI features, MCP servers, GenAI integrations | `/task @ai-mcp-genai-reviewer Review [ai-code-path]` |
| **compliance-standards-enforcer** | Financial compliance & regulatory standards | Loyalty points, transactions, audit trails, customer data | `/task @compliance-standards-enforcer Review [financial-code]` |
| **product-market-researcher** | Market analysis & validation | Feature planning, competitive research | `/task @product-market-researcher Research [feature-concept]` |

---

## Quick Start Examples

### 1. Single Agent Review (Daily Workflow)

**Scenario**: You've implemented a loyalty points feature and need code review before committing.

```bash
# 1. Implement your feature
# Edit: apps/backend/src/loyalty/points.service.ts

# 2. Run tests and linting
nx affected:test && nx affected:lint && nx run-many --target=typecheck --all

# 3. Review with agent
/task @backend-code-reviewer Review apps/backend/src/loyalty/points.service.ts for code quality, standards compliance, and NxLoy best practices

# 4. Fix issues identified by agent
# Make edits based on feedback

# 5. Re-review if needed (for significant changes)
/task @backend-code-reviewer Re-review after fixes

# 6. Commit (YOU do this, not the agent)
git add apps/backend/src/loyalty/points.service.ts
git commit -m "feat(loyalty): add points accumulation service

Implements points calculation with tier multipliers.

🤖 Generated with Claude Code"
```

**Agent Output**: Code quality issues, standards violations, security concerns, optimization suggestions

---

### 2. Multi-Agent Quality Pipeline (Sequential Reviews)

**Scenario**: Building a transaction ledger feature that requires multiple review angles.

```bash
# 1. Implement transaction ledger
# apps/backend/src/transactions/ledger.service.ts
# packages/database/prisma/schema/transactions.prisma

# 2. Backend code review
/task @backend-code-reviewer Review apps/backend/src/transactions/ for NestJS best practices

# 3. Architecture review
/task @architecture-reviewer Review transaction ledger architecture for scalability, security, and data integrity

# 4. Compliance review (CRITICAL for financial transactions)
/task @compliance-standards-enforcer Review transaction ledger for IFRS 15 compliance, audit trail requirements, and regulatory standards

# 5. Fix all issues from all agents
# Make comprehensive edits

# 6. Commit after all reviews pass
git add .
git commit -m "feat(transactions): implement audit-compliant transaction ledger

- IFRS 15 revenue recognition
- Immutable audit trail
- Multi-tenant isolation

🤖 Generated with Claude Code"
```

**Why Sequential?**: Each agent provides different perspectives - code quality → architecture → compliance

---

### 3. Parallel Development with Worktrees (Multiple Agents)

**Scenario**: Two features developed simultaneously by two agents in isolated worktrees.

```bash
# AGENT 1: Auth Domain
# -------------------
# From main repo
cd /Users/channaly/nxloy

# Create worktree for Agent 1
./tools/scripts/create-worktree.sh agent-1 feature/123-oauth-integration

# Work in Agent 1's worktree
cd ../nxloy-agent-1

# Implement OAuth feature
# Edit: packages/database/prisma/schema/auth.prisma
# Edit: apps/backend/src/auth/oauth.service.ts

# Review with agent
/task @backend-code-reviewer Review apps/backend/src/auth/oauth.service.ts

# Commit
git add .
git commit -m "feat(auth): add OAuth 2.0 provider integration"

# Push
git push -u origin feature/123-oauth-integration


# AGENT 2: Loyalty Domain (SIMULTANEOUSLY)
# ------------------------------------------
# From main repo (while Agent 1 is working!)
cd /Users/channaly/nxloy

# Create worktree for Agent 2
./tools/scripts/create-worktree.sh agent-2 feature/124-tier-system

# Work in Agent 2's worktree
cd ../nxloy-agent-2

# Implement tier system
# Edit: packages/database/prisma/schema/loyalty.prisma
# Edit: apps/backend/src/loyalty/tiers.service.ts

# Review with agent
/task @backend-code-reviewer Review apps/backend/src/loyalty/tiers.service.ts

# Commit
git add .
git commit -m "feat(loyalty): implement customer tier system"

# Push
git push -u origin feature/124-tier-system


# CLEANUP (After PRs merged)
# ---------------------------
cd /Users/channaly/nxloy
./tools/scripts/cleanup-worktree.sh agent-1
./tools/scripts/cleanup-worktree.sh agent-2
```

**Key Benefits**:
- ✅ No schema conflicts (auth.prisma vs loyalty.prisma)
- ✅ No code conflicts (different domains)
- ✅ Parallel velocity (2x faster)
- ✅ Isolated testing (each worktree has own node_modules)

---

### 4. When Do You Need Worktrees? (Decision Guide)

**Short Answer**: Only for **multiple features simultaneously** with **multiple agents**.

**Use Regular Branch (No Worktree) When**:
- ✅ Single agent, single feature (most common)
- ✅ Sequential development (one feature after another)
- ✅ Quick bug fixes

**Use Worktrees When**:
- ✅ 2+ agents working in parallel
- ✅ Different domains (auth.prisma + loyalty.prisma)
- ✅ Need to preserve agent state while switching contexts

**Complete Lifecycle Examples**: See [Git Sync Workflow Guide](../../docs/guides/git-sync-workflow.md) for:
- Example A: Single agent, regular branch (no worktree)
- Example B: Two agents, sequential merge
- Example C: Two agents, mid-work sync
- Example D: Three agents, complex dependencies

**Key Insight**: **Don't use worktrees if you don't need them**. Regular branches work fine for single-agent development.

---

## Git Sync & Branch Operations

### Syncing Feature Branch with Develop

```bash
# Check if sync needed
git fetch origin
git log HEAD..origin/develop --oneline

# Sync using merge (recommended)
git merge origin/develop
nx affected:test

# Continue work
```

### Getting Another Agent's Merged Work

```bash
# Agent 1's PR merged, Agent 2 needs it
cd ../nxloy-agent-2
git fetch origin
git merge origin/main  # Get Agent 1's merged work
nx affected:test
```

### Multi-Worktree Sync

```bash
# Fetch once from main repo (benefits all worktrees)
cd /Users/channaly/nxloy
git fetch origin

# Sync each worktree
cd ../nxloy-agent-1 && git merge origin/develop && nx affected:test
cd ../nxloy-agent-2 && git merge origin/develop && nx affected:test
```

**Full sync guide**: [Git Sync Workflow](../../docs/guides/git-sync-workflow.md)

---

## Daily Workflow Cheat Sheet

### Before Committing Checklist

```bash
# 1. Run Nx tests and linting
nx affected:test && nx affected:lint && nx run-many --target=typecheck --all

# 2. Get agent review (choose appropriate agent)
/task @backend-code-reviewer Review [file-path]
# OR
/task @compliance-standards-enforcer Review [file-path]  # If financial/regulatory code

# 3. Fix all issues identified

# 4. Re-run tests after fixes
nx affected:test

# 5. Commit (YOU do this manually, agents never commit)
git add .
git commit -m "feat: description

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### For Financial/Compliance Code (CRITICAL)

**Always invoke compliance agent for**:
- Loyalty points (financial instrument under IFRS 15)
- Transactions, payments, refunds
- Customer data deletion (GDPR/CCPA)
- Audit trails and logging
- Multi-tenant data isolation

```bash
# Example: Store credit implementation
/task @compliance-standards-enforcer Review apps/backend/src/wallet/store-credit.service.ts for IFRS 15 compliance, breakage revenue, and audit trail requirements

# Agent will check:
# - Revenue recognition timing
# - Audit trail completeness
# - GDPR data retention
# - Multi-tenant isolation
```

### Creating Branches (CRITICAL RULE)

**✅ Correct: Create from current branch**
```bash
# Wherever you are, create a new branch
git checkout -b feature/123-feature-name
```

**❌ Wrong: NEVER checkout develop/main first**
```bash
# ❌ NEVER DO THIS
git checkout develop          # ← FORBIDDEN
git checkout -b feature/123-feature-name
```

**Why?**: CLAUDE.md strictly forbids checking out develop/main to prevent accidental changes to protected branches.

### Nx Commands (Common)

```bash
# Run affected tests only
nx affected:test

# Run affected linting only
nx affected:lint

# Typecheck all projects
nx run-many --target=typecheck --all

# Run specific app
nx serve backend
nx serve web
nx run mobile:start

# Build specific app
nx build backend

# Visualize dependency graph
nx graph
```

---

## Agent Selection Guide

### When to Use Each Agent

**backend-code-reviewer**:
- ✅ NestJS controllers, services, repositories
- ✅ DTOs, entities, middleware, guards, pipes
- ✅ Any server-side TypeScript code

**frontend-implementation-specialist**:
- ✅ Web + Mobile features (cross-platform)
- ✅ Next.js pages, React Native screens
- ✅ API integration with backend
- ✅ Offline-first functionality

**architecture-reviewer**:
- ✅ New architectural patterns
- ✅ Security-critical features
- ✅ Scalability concerns
- ✅ Complex multi-service integrations

**compliance-standards-enforcer**:
- ✅ Financial transactions (loyalty points, payments)
- ✅ Customer data handling (GDPR/CCPA)
- ✅ Audit trails and logging
- ✅ Regulatory compliance (IFRS 15, SOC 2)

**blockchain-nft-code-reviewer**:
- ✅ Smart contracts (Solidity, Rust, Move)
- ✅ Web3 integrations (ethers.js, web3.js)
- ✅ NFT minting, transfers, metadata

**ai-mcp-genai-reviewer**:
- ✅ MCP server implementations
- ✅ AI prompt engineering
- ✅ LLM client integrations
- ✅ GenAI features

**product-market-researcher**:
- ✅ Feature validation before implementation
- ✅ Competitive analysis
- ✅ Market demand research
- ✅ Business requirement clarification

---

## Common Workflows

### Workflow 1: Fix a Bug

```bash
# 1. Create branch
git checkout -b fix/456-bug-description

# 2. Fix the bug
# Edit relevant files

# 3. Test fix
nx affected:test

# 4. Get review
/task @backend-code-reviewer Review [file-path] for bug fix correctness

# 5. Commit
git add .
git commit -m "fix: description"
git push -u origin fix/456-bug-description

# 6. Create PR
gh pr create --title "Fix: Bug description" --body "Fixes #456"
```

### Workflow 2: Add New Feature

```bash
# 1. Create branch
git checkout -b feature/789-feature-name

# 2. Implement feature across multiple files
# Edit backend, database, frontend

# 3. Test
nx affected:test && nx affected:lint

# 4. Multi-agent review
/task @backend-code-reviewer Review backend implementation
/task @architecture-reviewer Review architecture for feature/789
/task @compliance-standards-enforcer Review if financial/regulatory

# 5. Fix all issues

# 6. Commit
git add .
git commit -m "feat: feature description"
git push -u origin feature/789-feature-name

# 7. Create PR
gh pr create --title "Feature: Name" --body "Description"
```

### Workflow 3: Database Migration

```bash
# 1. Edit schema
# packages/database/prisma/schema/loyalty.prisma

# 2. Create migration
cd packages/database
pnpm prisma migrate dev --name add_tier_multiplier

# 3. Review migration SQL
cat prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql

# 4. Test migration
pnpm prisma migrate reset
pnpm prisma generate

# 5. Backend code using new schema
cd ../..
# Edit apps/backend/src/loyalty/tiers.service.ts

# 6. Agent reviews
/task @backend-code-reviewer Review apps/backend/src/loyalty/tiers.service.ts
/task @compliance-standards-enforcer Review database migration for audit trail and multi-tenant safety

# 7. Run tests
nx affected:test

# 8. Commit
git add .
git commit -m "feat(db): add tier multiplier to loyalty schema"
```

---

## Troubleshooting

### Agent Not Finding Files

**Problem**: Agent says "file not found"

**Solution**: Use absolute paths or paths relative to repo root
```bash
# ✅ Good
/task @backend-code-reviewer Review apps/backend/src/loyalty/points.service.ts

# ❌ Bad (if you're in a subdirectory)
/task @backend-code-reviewer Review points.service.ts
```

### Agent Review Taking Too Long

**Problem**: Agent is slow or non-responsive

**Solution**: Be more specific about what to review
```bash
# ✅ Good (specific)
/task @backend-code-reviewer Review apps/backend/src/loyalty/points.service.ts for NxLoy standards compliance (40-line methods, 3 parameters, no mocks)

# ❌ Bad (too broad)
/task @backend-code-reviewer Review everything in apps/backend/
```

### Conflicting Agent Recommendations

**Problem**: Two agents give conflicting advice

**Solution**: Prioritize by domain expertise
1. **compliance-standards-enforcer** wins for regulatory/financial concerns
2. **architecture-reviewer** wins for architectural decisions
3. **backend-code-reviewer** wins for code quality/standards

---

## Full Documentation

For comprehensive guides, see:

### Agent Usage
- **[Custom Agents Guide](../../docs/contributing/custom-agents.md)** (566 lines) - Complete agent documentation
  - All agent descriptions
  - Detailed workflow examples
  - Creating custom agents
  - Multi-agent patterns
  - Troubleshooting

### Worktree Workflows
- **[Multi-Agent Workflow](../../docs/guides/multi-agent-workflow.md)** - Parallel development guide
- **[Worktree Workflow](../../docs/guides/worktree-workflow.md)** - Detailed worktree setup and management

### Development Standards
- **[Development Workflow](../../docs/contributing/development-workflow.md)** - General dev practices
- **[Code Standards](../../docs/contributing/code-standards.md)** - NxLoy code quality rules
- **[Testing Standards](../../docs/contributing/testing-standards.md)** - Testing philosophy (no mocks!)
- **[Database Migrations](../../docs/contributing/database-migrations.md)** - Prisma migration workflow

### Project Configuration
- **[CLAUDE.md](../../CLAUDE.md)** - Claude Code configuration and critical rules
- **[CONTRIBUTING.md](../../CONTRIBUTING.md)** - Full contributing guide

---

## NxLoy-Specific Rules

### Code Standards (Enforced by Agents)
- **40 lines max per method** (excluding comments)
- **3 parameters max per method**
- **Single responsibility** (no method names with "and")
- **80% test coverage minimum**, 100% for business logic
- **No mocks in tests** - Use factories and real data

### Git Workflow Rules
- ❌ **NEVER** execute `git commit` or `git push` automatically (agents don't commit)
- ❌ **NEVER** checkout develop/main before creating branches
- ✅ **ALWAYS** create branches from current branch: `git checkout -b feature/123-name`
- ✅ **ALWAYS** let user manually commit and push changes

### Environment Variables
- ❌ **NEVER use fallback defaults** like `|| 'defaultValue'`
- ✅ **ALWAYS throw error if undefined**: `if (!port) throw new Error('PORT env var required')`
- Why: Fallback defaults hide missing config in production

### Database Migrations
- ✅ **Schema-first approach**: Edit Prisma schema, generate SQL automatically
- ✅ **One domain per agent**: Avoid conflicts (Agent 1: auth.prisma, Agent 2: loyalty.prisma)
- ✅ **Descriptive names**: `add_user_email_verification` not `update`
- ❌ **Don't run `prisma db push`** in production (bypasses migrations)

---

**Last Updated**: 2025-11-09
**Maintained By**: NxPloy Platform Team
**Questions?**: See [docs/contributing/custom-agents.md](../../docs/contributing/custom-agents.md) for full details
