# Git Worktree Workflow (Multi-Agent)

**Related**: [Multi-Agent Workflow](./multi-agent-workflow.md) | [CLAUDE.md](../../CLAUDE.md) | [ADR-0001](../adr/0001-nx-monorepo-with-git-worktrees.md)

---

This guide provides detailed instructions for using git worktrees to enable parallel AI agent development in NxLoy.

## What is a Git Worktree?

A git worktree allows you to have **multiple working directories** attached to the same repository. Each worktree can be on a different branch, allowing multiple agents to work simultaneously without conflicts.

## Quick Reference

### Create Worktree

```bash
./tools/scripts/create-worktree.sh <agent-name> <branch-name>

# Example
./tools/scripts/create-worktree.sh agent-1 feature/123-oauth-login
```

**What this does**:
1. Creates a new git worktree in `../nxloy-<agent-name>/`
2. Creates and checks out branch `<branch-name>`
3. Isolated from main repository - zero conflicts!

### Work in Worktree

```bash
cd ../nxloy-<agent-name>
pnpm install  # Install dependencies
nx serve backend  # Run development server
# ... make changes, commit, push
```

**Each worktree**:
- Has its own `.git` directory
- Can be on different branch
- Has independent node_modules
- Completely isolated workspace

### Cleanup Worktree

After feature is merged, cleanup the worktree:

```bash
./tools/scripts/cleanup-worktree.sh <agent-name>

# Example
./tools/scripts/cleanup-worktree.sh agent-1
```

**What this does**:
1. Removes worktree directory
2. Deletes branch (if merged)
3. Cleans up git metadata

## Detailed Workflow

### Step 1: Create Worktree for Agent

From main repository:

```bash
cd /Users/channaly/nxloy

# Create worktree for agent working on OAuth feature
./tools/scripts/create-worktree.sh auth-agent feature/123-oauth-login

# This creates:
# - Directory: /Users/channaly/nxloy-auth-agent/
# - Branch: feature/123-oauth-login
```

**Verify creation**:
```bash
git worktree list

# Output:
# /Users/channaly/nxloy         (main)
# /Users/channaly/nxloy-auth-agent  (feature/123-oauth-login)
```

### Step 2: Agent Works in Isolated Worktree

```bash
cd ../nxloy-auth-agent

# Install dependencies (fresh node_modules for this worktree)
pnpm install

# Start development
nx serve backend

# Make changes
# Edit apps/backend/src/auth/auth.service.ts

# Commit changes
git add .
git commit -m "feat(auth): implement OAuth login"

# Push to remote
git push -u origin feature/123-oauth-login
```

**Key Points**:
- Changes only affect this worktree
- Main repository (`/Users/channaly/nxloy`) is untouched
- Other agents in other worktrees are unaffected

### Step 3: Create Pull Request

```bash
# From worktree directory
gh pr create --title "feat(auth): implement OAuth login" --body "..."

# Or use GitHub web interface
```

### Step 4: After PR is Merged, Cleanup

Once PR is merged to main:

```bash
# Return to main repository
cd /Users/channaly/nxloy

# Cleanup agent worktree
./tools/scripts/cleanup-worktree.sh auth-agent

# Pull latest changes to main repo
git pull origin main
```

## Multiple Agents Working in Parallel

### Scenario: 3 Agents Working on Different Domains

**Agent 1: Authentication**
```bash
./tools/scripts/create-worktree.sh agent-1 feature/123-oauth-login
cd ../nxloy-agent-1
# Edit auth.prisma, apps/backend/src/auth/
```

**Agent 2: Loyalty**
```bash
./tools/scripts/create-worktree.sh agent-2 feature/124-loyalty-points
cd ../nxloy-agent-2
# Edit loyalty.prisma, apps/backend/src/loyalty/
```

**Agent 3: Rewards**
```bash
./tools/scripts/create-worktree.sh agent-3 feature/125-reward-catalog
cd ../nxloy-agent-3
# Edit rewards.prisma, apps/backend/src/rewards/
```

**Result**: All 3 agents work simultaneously with **zero conflicts** because:
- Different branches (feature/123, feature/124, feature/125)
- Different schema files (auth.prisma, loyalty.prisma, rewards.prisma)
- Different backend modules (src/auth/, src/loyalty/, src/rewards/)

## Advanced Usage

### Listing All Worktrees

```bash
git worktree list

# Output shows all worktrees and their branches
```

### Switching Between Worktrees

```bash
# Work in main repo
cd /Users/channaly/nxloy

# Switch to agent-1 worktree
cd ../nxloy-agent-1

# Switch to agent-2 worktree
cd ../nxloy-agent-2

# Each has independent git state, node_modules, etc.
```

### Syncing Worktrees with Main

To get latest changes from main branch:

```bash
cd ../nxloy-agent-1

# Fetch latest from origin
git fetch origin

# Merge or rebase with main
git merge origin/main
# or
git rebase origin/main
```

### Manual Worktree Management

If scripts are unavailable, use git commands directly:

**Create worktree manually**:
```bash
git worktree add -b feature/new-branch ../nxloy-agent-1
cd ../nxloy-agent-1
pnpm install
```

**Remove worktree manually**:
```bash
git worktree remove ../nxloy-agent-1
git branch -d feature/new-branch  # Delete branch if merged
```

## Troubleshooting

### Problem: Worktree Already Exists

**Error**: `fatal: '/Users/channaly/nxloy-agent-1' already exists`

**Solution 1**: Cleanup and recreate
```bash
./tools/scripts/cleanup-worktree.sh agent-1
./tools/scripts/create-worktree.sh agent-1 feature/new-branch
```

**Solution 2**: Force remove
```bash
git worktree remove ../nxloy-agent-1 --force
rm -rf ../nxloy-agent-1  # If directory still exists
```

### Problem: Branch Already Checked Out

**Error**: `fatal: 'feature/123' is already checked out at '/Users/channaly/nxloy-agent-1'`

**Solution**: Use different branch name or remove existing worktree
```bash
# Option 1: Different branch
./tools/scripts/create-worktree.sh agent-2 feature/124-different

# Option 2: Remove existing worktree
./tools/scripts/cleanup-worktree.sh agent-1
```

### Problem: Dependencies Out of Sync

**Symptom**: Different package versions in main vs worktree

**Solution**: Reinstall in each worktree
```bash
cd ../nxloy-agent-1
rm -rf node_modules
pnpm install
```

### Problem: Stale Worktree After System Crash

**Symptom**: Worktree directory exists but git doesn't recognize it

**Solution**:
```bash
# Prune stale worktrees
git worktree prune

# List remaining worktrees
git worktree list

# Manually clean up directory if needed
rm -rf ../nxloy-agent-1
```

## Best Practices

### 1. Naming Conventions

**Agent Names**: Descriptive and unique
```bash
# ✅ Good
./tools/scripts/create-worktree.sh auth-agent feature/oauth
./tools/scripts/create-worktree.sh loyalty-agent feature/points
./tools/scripts/create-worktree.sh mobile-dev feature/profile-screen

# ❌ Bad
./tools/scripts/create-worktree.sh agent1 feature
./tools/scripts/create-worktree.sh temp feature/new
```

**Branch Names**: Follow NxLoy conventions
```bash
# ✅ Good
feature/123-oauth-login
fix/456-points-calculation
docs/789-update-readme

# ❌ Bad
new-feature
temp
fix
```

### 2. Coordination Strategy

**For independent domains**: Work in parallel
```bash
# Agent 1: Auth (no coordination needed)
# Agent 2: Loyalty (no coordination needed)
```

**For shared files**: Coordinate timing
```bash
# Agent 1: Edit base.prisma first
# Agent 2: Wait for PR merge, then edit base.prisma
```

**For related features**: Sequential development
```bash
# Agent 1: Implement customer service (merge first)
# Agent 2: Implement loyalty using customer service (after merge)
```

### 3. Cleanup Discipline

Always cleanup after merge:
```bash
# After PR merged
./tools/scripts/cleanup-worktree.sh agent-name
```

Regular cleanup prevents:
- Disk space issues (multiple node_modules)
- Confusion (too many worktrees)
- Stale branches (outdated worktrees)

### 4. Testing in Worktrees

Run tests in each worktree independently:
```bash
cd ../nxloy-agent-1
nx affected:test
nx affected:lint
nx run-many --target=typecheck --all
```

## Resources

- **ADR-0001**: [Nx Monorepo with Git Worktrees](../adr/0001-nx-monorepo-with-git-worktrees.md)
- **Multi-Agent Workflow**: [multi-agent-workflow.md](./multi-agent-workflow.md)
- **Git Worktree Documentation**: https://git-scm.com/docs/git-worktree
- **Worktree Scripts**: [tools/scripts/](../../tools/scripts/)

---

**Last Updated**: 2025-11-08
**Source**: CONTRIBUTING.md (Lines 1315-1337), README.md (Lines 906-959)
