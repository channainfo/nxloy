# Git Sync Workflows with Agents

**Purpose**: Complete guide to git operations (fetch, pull, rebase, merge) while working with Claude Code agents, with or without worktrees.

**Quick Links**:
- [Multi-Agent Workflow](./multi-agent-workflow.md) - Parallel development patterns
- [Worktree Workflow](./worktree-workflow.md) - Worktree setup and management
- [Custom Agents](./../contributing/custom-agents.md) - Agent usage guide

---

## Do I Need a Worktree?

**Short Answer**: Only if you're working on **2+ features simultaneously** with **multiple agents**.

### Decision Tree

```
Starting new work?
    |
    +--> Single feature? ──> Use REGULAR BRANCH (no worktree)
    |
    +--> Multiple features?
            |
            +--> Sequential (one after another)? ──> Use REGULAR BRANCH
            |
            +--> Parallel (at same time)? ──> Use WORKTREES
```

### Use Regular Branch (No Worktree) When:

✅ **Single agent, single feature**
- Example: "Add email validation to login form"
- Workflow: `git checkout -b feature/123` → work → commit → push → PR

✅ **Sequential development** (one feature after another)
- Example: Build auth first, then loyalty (not simultaneously)
- Workflow: Feature 1 → merge → Feature 2 → merge

✅ **Quick bug fixes or small changes**
- Example: "Fix typo in error message"
- Workflow: `git checkout -b fix/456` → fix → push → PR

✅ **Single domain work**
- Example: Only editing `auth.prisma` and `apps/backend/src/auth/`
- No risk of conflicts with other work

### Use Worktrees When:

✅ **Multiple agents working simultaneously**
- Example: Agent 1 builds OAuth while Agent 2 builds tier system
- Why: Preserve agent context, avoid branch switching

✅ **Different domains in parallel**
- Example: Agent 1 in `auth.prisma`, Agent 2 in `loyalty.prisma`
- Why: No schema conflicts, independent testing

✅ **Need to preserve agent state while switching contexts**
- Example: Agent working on Feature A, urgent bug in Feature B needs fix
- Why: Don't lose agent's work-in-progress

✅ **Long-running features with interruptions**
- Example: Complex feature takes 3 days, need to context-switch daily
- Why: Each worktree maintains its own state

---

## Complete Lifecycle Examples

### Example A: Single Agent, Regular Branch (Simple - No Worktree)

**Scenario**: Add points accumulation feature with one agent.

**When to use**: Most common case - single feature, one agent, no parallel work.

```bash
# 1. Create feature branch from current location
git checkout -b feature/123-add-points

# 2. Work with agent
# Edit: apps/backend/src/loyalty/points.service.ts
# Edit: packages/database/prisma/schema/loyalty.prisma

# 3. Agent reviews code
/task @backend-code-reviewer Review apps/backend/src/loyalty/points.service.ts

# 4. Fix issues, run tests
nx affected:test && nx affected:lint

# 5. Commit (you do this, not agent)
git add .
git commit -m "feat(loyalty): add points accumulation service

Implements tier-based point multipliers.

🤖 Generated with Claude Code"

# 6. Push and create PR
git push -u origin feature/123-add-points
gh pr create --title "Loyalty: Add points accumulation" --body "Implements #123"

# 7. After PR merged
git checkout main
git pull origin main

# DONE - No worktree needed, no cleanup required
```

**Duration**: 2-4 hours
**Complexity**: Low
**Worktrees**: None

---

### Example B: Two Agents, Worktrees, Sequential Merge (Real-World)

**Scenario**: Two features developed in parallel, but merged sequentially.

**When to use**: Multiple agents, different domains, can merge one at a time.

```bash
# SETUP: Create two worktrees for two agents
# ==========================================

# Agent 1: OAuth integration (auth domain)
cd /Users/channaly/nxloy
./tools/scripts/create-worktree.sh agent-1 feature/123-oauth

# Agent 2: Tier system (loyalty domain)
./tools/scripts/create-worktree.sh agent-2 feature/124-tiers


# AGENT 1 WORK (Day 1-2)
# ======================
cd ../nxloy-agent-1

# Edit files
# packages/database/prisma/schema/auth.prisma
# apps/backend/src/auth/oauth.service.ts
# apps/backend/src/auth/oauth.controller.ts

# Agent reviews
/task @backend-code-reviewer Review apps/backend/src/auth/oauth.service.ts
/task @compliance-standards-enforcer Review auth implementation for security

# Run tests
nx affected:test && nx affected:lint

# Commit
git add .
git commit -m "feat(auth): add OAuth 2.0 provider integration

Supports Google, GitHub, Facebook providers.

🤖 Generated with Claude Code"

# Push
git push -u origin feature/123-oauth

# Create PR
gh pr create --title "Auth: OAuth 2.0 Integration" --body "Implements #123

- Google OAuth
- GitHub OAuth
- Facebook OAuth
- Token refresh logic"

# PR #123 MERGED TO MAIN (Day 2)


# AGENT 2 WORK (Day 1-3) - Parallel to Agent 1
# =============================================
cd ../nxloy-agent-2

# Edit files
# packages/database/prisma/schema/loyalty.prisma
# apps/backend/src/loyalty/tiers.service.ts
# apps/backend/src/loyalty/tiers.controller.ts

# Agent reviews
/task @backend-code-reviewer Review apps/backend/src/loyalty/tiers.service.ts

# Run tests
nx affected:test && nx affected:lint

# Commit
git add .
git commit -m "feat(loyalty): implement customer tier system

Bronze, Silver, Gold, Platinum tiers with multipliers.

🤖 Generated with Claude Code"


# CRITICAL: Agent 2 needs Agent 1's merged OAuth work (Day 3)
# ============================================================
# Agent 1's PR was merged to main, Agent 2 needs those changes

git fetch origin
git log HEAD..origin/main --oneline  # See Agent 1's merged commits

# Merge Agent 1's work into Agent 2's branch
git merge origin/main

# Test integration (tiers might use OAuth for customer lookup)
nx affected:test

# If tests pass, push
git push -u origin feature/124-tiers

# Create PR
gh pr create --title "Loyalty: Customer Tier System" --body "Implements #124

- 4 tier levels
- Point multipliers
- Tier upgrade logic
- Integrates with OAuth (from #123)"

# PR #124 MERGED TO MAIN (Day 3)


# CLEANUP (Day 3)
# ===============
cd /Users/channaly/nxloy

# Pull latest (has both features now)
git pull origin main

# Remove worktrees
./tools/scripts/cleanup-worktree.sh agent-1
./tools/scripts/cleanup-worktree.sh agent-2

# Verify cleanup
git worktree list

# DONE - Both features merged, worktrees cleaned
```

**Duration**: 3 days
**Complexity**: Medium
**Worktrees**: 2 (one per agent)
**Key Point**: Agent 2 syncs with main to get Agent 1's merged work before finishing

---

### Example C: Two Agents, Worktrees, Mid-Work Sync (Complex)

**Scenario**: Two agents working in parallel, both need to sync mid-work because `develop` moved ahead.

**When to use**: Long-running features (2+ days), active develop branch with other merges.

```bash
# SETUP (Day 1 Morning)
# =====================
cd /Users/channaly/nxloy
git checkout develop
git pull origin develop  # Start from latest

./tools/scripts/create-worktree.sh agent-1 feature/123-oauth
./tools/scripts/create-worktree.sh agent-2 feature/124-tiers


# AGENT 1 WORK (Day 1)
# ====================
cd ../nxloy-agent-1

# Edit: auth.prisma, oauth.service.ts
# Agent reviews...
# Tests pass...

git commit -m "feat(auth): OAuth integration (WIP)"


# AGENT 2 WORK (Day 1)
# ====================
cd ../nxloy-agent-2

# Edit: loyalty.prisma, tiers.service.ts
# Agent reviews...
# Tests pass...

git commit -m "feat(loyalty): tier system (WIP)"


# MID-WORK SYNC (Day 2 Morning)
# ==============================
# Overnight, someone merged PR #999 to develop
# Both agents need to sync before continuing

cd /Users/channaly/nxloy
git fetch origin  # Fetch once, benefits ALL worktrees


# Check how far behind Agent 1 is
cd ../nxloy-agent-1
git log HEAD..origin/develop --oneline
# Shows: 3 new commits from PR #999

# Merge develop into Agent 1's branch
git merge origin/develop

# Resolve conflicts if any (hopefully none - different domains)
# If conflicts: fix manually or ask agent
# /task Help resolve merge conflicts in auth.service.ts

# Test after merge
nx affected:test

# If tests pass, continue work
# Continue OAuth implementation...


# Check how far behind Agent 2 is
cd ../nxloy-agent-2
git log HEAD..origin/develop --oneline
# Shows: 3 new commits from PR #999

# Merge develop into Agent 2's branch
git merge origin/develop

# Test after merge
nx affected:test

# If tests pass, continue work
# Continue tier system implementation...


# AGENT 1 FINISHES (Day 2 Afternoon)
# ===================================
cd ../nxloy-agent-1

# Final commits
git add .
git commit -m "feat(auth): complete OAuth integration"

# Push
git push -u origin feature/123-oauth

# Create PR
gh pr create --title "Auth: OAuth Integration" --body "..."

# PR #123 MERGED TO MAIN (Day 2 Evening)


# AGENT 2 NEEDS AGENT 1'S WORK (Day 3 Morning)
# =============================================
cd ../nxloy-agent-2

# Fetch latest (includes Agent 1's merged OAuth)
git fetch origin

# Merge main into Agent 2's branch
git merge origin/main

# Test integration
nx affected:test

# Continue and finish tier system
git add .
git commit -m "feat(loyalty): complete tier system"

# Push
git push -u origin feature/124-tiers

# Create PR
gh pr create --title "Loyalty: Tier System" --body "..."

# PR #124 MERGED TO MAIN (Day 3 Afternoon)


# CLEANUP (Day 3)
# ===============
cd /Users/channaly/nxloy
git checkout develop
git pull origin develop  # Now has both features

./tools/scripts/cleanup-worktree.sh agent-1
./tools/scripts/cleanup-worktree.sh agent-2

# DONE
```

**Duration**: 3 days
**Complexity**: High
**Worktrees**: 2
**Key Points**:
- Mid-work sync when develop moves ahead
- Agent 2 syncs twice (once with develop, once with main after Agent 1 merges)
- Testing after every sync

---

### Example D: Three Agents, Complex Dependencies (Advanced)

**Scenario**: Three features with dependencies - OAuth (foundation), Rewards (uses OAuth), Tiers (uses Rewards).

**When to use**: Complex project with feature dependencies, need parallel work with coordination.

```bash
# SETUP (Day 1 Morning)
# =====================
cd /Users/channaly/nxloy

./tools/scripts/create-worktree.sh agent-1 feature/123-oauth      # Foundation
./tools/scripts/create-worktree.sh agent-2 feature/124-rewards    # Depends on OAuth
./tools/scripts/create-worktree.sh agent-3 feature/125-tiers      # Depends on Rewards


# ALL AGENTS START (Day 1)
# ========================

# Agent 1: OAuth (no dependencies, starts clean)
cd ../nxloy-agent-1
# Work on OAuth...
# Commit WIP...

# Agent 2: Rewards (will need OAuth later)
cd ../nxloy-agent-2
# Start basic rewards structure (no OAuth yet)...
# Commit WIP...

# Agent 3: Tiers (will need Rewards + OAuth later)
cd ../nxloy-agent-3
# Start basic tier structure (no dependencies yet)...
# Commit WIP...


# AGENT 1 FINISHES FIRST (Day 2 Morning)
# =======================================
cd ../nxloy-agent-1

# Complete OAuth implementation
git add .
git commit -m "feat(auth): OAuth 2.0 integration complete"

# Agent reviews
/task @backend-code-reviewer Review
/task @compliance-standards-enforcer Review for security

# Tests pass
nx affected:test && nx affected:lint

# Push and PR
git push -u origin feature/123-oauth
gh pr create --title "Auth: OAuth Integration" --body "Foundation for Rewards (#124) and Tiers (#125)"

# PR #123 MERGED TO MAIN (Day 2 Afternoon)


# AGENTS 2 & 3 NEED OAUTH (Day 2 Evening)
# ========================================

# Agent 2 syncs to get OAuth
cd ../nxloy-agent-2
git fetch origin
git merge origin/main  # Gets OAuth from Agent 1

# Now Agent 2 can use OAuth in rewards
# Add OAuth-based customer lookup in rewards.service.ts
# Commit integration...

nx affected:test  # Verify OAuth integration works

# Continue rewards implementation...


# Agent 3 syncs to get OAuth
cd ../nxloy-agent-3
git fetch origin
git merge origin/main  # Gets OAuth from Agent 1

# Agent 3 can use OAuth but still needs Rewards
# Continue tier implementation without Rewards dependency yet...


# AGENT 2 FINISHES SECOND (Day 3 Morning)
# ========================================
cd ../nxloy-agent-2

# Complete rewards implementation
git add .
git commit -m "feat(rewards): reward catalog with OAuth integration"

# Tests pass
nx affected:test && nx affected:lint

# Push and PR
git push -u origin feature/124-rewards
gh pr create --title "Rewards: Catalog System" --body "Uses OAuth from #123, required for Tiers (#125)"

# PR #124 MERGED TO MAIN (Day 3 Afternoon)


# AGENT 3 NEEDS REWARDS (Day 3 Evening)
# ======================================
cd ../nxloy-agent-3

# Sync to get Rewards (and OAuth if missed earlier)
git fetch origin
git merge origin/main  # Gets Rewards from Agent 2

# Now Agent 3 has everything: OAuth + Rewards
# Complete tier system with reward redemption logic
# Edit tiers.service.ts to use rewards catalog

nx affected:test  # Verify full integration

# Commit final implementation
git add .
git commit -m "feat(loyalty): tier system with reward redemption

Uses OAuth (#123) and Rewards (#124) for full integration."

# Push and PR
git push -u origin feature/125-tiers
gh pr create --title "Loyalty: Tier System" --body "Integrates OAuth (#123) and Rewards (#124)"

# PR #125 MERGED TO MAIN (Day 4)


# CLEANUP (Day 4)
# ===============
cd /Users/channaly/nxloy
git checkout main
git pull origin main  # Now has all 3 features

./tools/scripts/cleanup-worktree.sh agent-1
./tools/scripts/cleanup-worktree.sh agent-2
./tools/scripts/cleanup-worktree.sh agent-3

git worktree list  # Verify all removed

# DONE - All 3 features integrated
```

**Duration**: 4 days
**Complexity**: Very High
**Worktrees**: 3
**Key Points**:
- Staggered completion (Agent 1 → Agent 2 → Agent 3)
- Agents 2 & 3 sync multiple times to get dependencies
- Clear dependency chain: OAuth → Rewards → Tiers
- Testing after every sync ensures integration works

---

## Syncing Strategies

### When to Sync

**Daily Sync** (Recommended for active projects):
```bash
# Morning routine: Get latest changes
git fetch origin
git merge origin/develop
nx affected:test
```

**Before Major Work**:
```bash
# Starting new feature? Sync first
git fetch origin
git log HEAD..origin/develop --oneline  # See what you're missing
git merge origin/develop
```

**After Another Agent Merges**:
```bash
# Agent 1's PR merged, Agent 2 needs it
git fetch origin
git merge origin/main  # Get merged work
nx affected:test  # Verify integration
```

**Before Creating PR**:
```bash
# Ensure you're up-to-date before PR
git fetch origin
git merge origin/develop  # or origin/main
nx affected:test
git push
```

---

## Sync Operations Reference

### Checking Sync Status

```bash
# Fetch latest refs (doesn't change your code)
git fetch origin

# See commits you're missing from develop
git log HEAD..origin/develop --oneline

# See your commits not in develop
git log origin/develop..HEAD --oneline

# See divergence (both directions)
git log --oneline --graph --all HEAD origin/develop

# Count commits behind/ahead
git rev-list --left-right --count HEAD...origin/develop
# Output: 5  3  (5 behind, 3 ahead)
```

### Merge Strategy (Recommended for Shared Branches)

**When to use**: Feature branch, team collaboration, preserving history

```bash
# Merge develop into your feature branch
git merge origin/develop

# Why merge?
# - Preserves complete history
# - Shows when sync happened
# - Safer (doesn't rewrite commits)
# - Works well with multiple collaborators
```

**Pros**:
- ✅ Safe - doesn't rewrite history
- ✅ Clear sync points in history
- ✅ Works with pushed commits

**Cons**:
- ❌ Creates merge commits (messier history)
- ❌ More commits in git log

### Rebase Strategy (Clean History)

**When to use**: Local-only work, not yet pushed, want clean history

```bash
# Rebase your commits onto latest develop
git rebase origin/develop

# Why rebase?
# - Clean, linear history
# - Looks like work was done on latest develop
# - Easier to review

# If conflicts occur
git rebase --continue  # After fixing conflicts
git rebase --abort     # To cancel rebase
```

**Pros**:
- ✅ Clean, linear history
- ✅ Easier PR reviews
- ✅ No merge commits

**Cons**:
- ❌ Rewrites commits (dangerous if already pushed)
- ❌ Harder to undo
- ❌ Not for shared branches

**⚠️ NEVER REBASE AFTER PUSHING** (unless you're the only person on the branch)

### Pull Strategy (Fetch + Merge in One)

```bash
# Pull = fetch + merge
git pull origin develop

# Equivalent to:
git fetch origin
git merge origin/develop
```

**When to use**: Quick sync, main/develop branch, no special needs

---

## Worktree-Specific Behavior

### Shared .git Directory

**Key Concept**: All worktrees share the same `.git` directory from main repo.

```bash
# Fetch in MAIN repo...
cd /Users/channaly/nxloy
git fetch origin

# ...benefits ALL worktrees automatically
cd ../nxloy-agent-1
git log origin/develop  # Sees fetched refs

cd ../nxloy-agent-2
git log origin/develop  # Sees same fetched refs
```

**Implication**: Fetch once in main repo, sync all worktrees individually.

### Syncing All Worktrees

```bash
# Option 1: Manual (clear, explicit)
cd /Users/channaly/nxloy
git fetch origin

cd ../nxloy-agent-1
git merge origin/develop && nx affected:test

cd ../nxloy-agent-2
git merge origin/develop && nx affected:test

cd ../nxloy-agent-3
git merge origin/develop && nx affected:test


# Option 2: Script (faster for many worktrees)
# See: tools/scripts/sync-all-worktrees.sh
./tools/scripts/sync-all-worktrees.sh develop
```

### Worktree Independence

Each worktree has:
- ✅ Independent working directory
- ✅ Independent branch checkout
- ✅ Independent `node_modules` (after `pnpm install`)
- ✅ Independent test state

Worktrees share:
- ✅ .git directory (refs, objects, config)
- ✅ Fetched remote branches
- ✅ Git hooks

---

## Conflict Resolution

### Understanding Conflicts

**When conflicts occur**:
- You changed `points.service.ts` line 45
- Someone else changed `points.service.ts` line 45
- Git can't auto-merge

**Conflict markers**:
```typescript
<<<<<<< HEAD (your changes)
calculatePoints(amount: number): number {
  return amount * 2;  // Your implementation
}
=======
calculatePoints(amount: number, tier: string): number {
  return amount * getTierMultiplier(tier);  // Their implementation
}
>>>>>>> origin/develop (their changes)
```

### Manual Resolution

```bash
# 1. Open conflicted file
# apps/backend/src/loyalty/points.service.ts

# 2. Edit file, choose correct version or combine
calculatePoints(amount: number, tier: string): number {
  return amount * getTierMultiplier(tier);  // Keep their signature + implementation
}

# 3. Remove conflict markers (<<<<<<< ======= >>>>>>>)

# 4. Test the resolution
nx affected:test

# 5. Mark as resolved
git add apps/backend/src/loyalty/points.service.ts

# 6. Complete merge
git merge --continue
# or for rebase:
git rebase --continue
```

### Agent-Assisted Resolution

```bash
# If conflict is complex, ask agent for help
/task @backend-code-reviewer Help resolve merge conflicts in apps/backend/src/loyalty/points.service.ts

# Agent will:
# 1. Analyze both versions
# 2. Understand intent of each change
# 3. Suggest resolution that preserves both intents
# 4. Explain trade-offs

# After agent suggests resolution:
# - Apply the suggested changes
# - Test thoroughly
# - Complete merge
```

### Preventing Conflicts

**Strategy 1: Domain Separation (Best)**
```bash
# Agent 1: Only edit auth.prisma + apps/backend/src/auth/
# Agent 2: Only edit loyalty.prisma + apps/backend/src/loyalty/
# Result: Zero conflicts (different files)
```

**Strategy 2: Frequent Syncing**
```bash
# Sync daily or before major work
git fetch origin
git merge origin/develop
# Smaller, more frequent merges = easier conflicts
```

**Strategy 3: Communication**
```bash
# In team chat: "I'm editing points.service.ts lines 40-60"
# Others avoid that region
```

---

## Branch Operations

### Comparing Branches

```bash
# See all commits in feature branch not in develop
git log origin/develop..feature/123 --oneline

# See all commits in develop not in feature branch
git log feature/123..origin/develop --oneline

# Visual comparison
git log --oneline --graph --all feature/123 origin/develop

# File-level diff
git diff origin/develop...feature/123  # Three dots = common ancestor
```

### Checking Divergence

```bash
# How many commits behind/ahead?
git rev-list --left-right --count feature/123...origin/develop
# Output: 3  5  means 3 behind, 5 ahead

# Detailed view
git log --oneline --left-right feature/123...origin/develop
```

### Branch Switching (Without Worktrees)

**⚠️ Not recommended with agents - use worktrees instead**

```bash
# If you MUST switch (agent not running):

# 1. Ensure clean state
git status  # No uncommitted changes

# 2. Commit or stash
git add .
git commit -m "WIP: save progress"
# or
git stash

# 3. Switch branch
git checkout other-branch

# 4. Do work on other branch
# ...

# 5. Switch back
git checkout feature/123

# 6. Restore if stashed
git stash pop
```

**Better approach with worktrees**:
```bash
# No switching needed - each worktree has its own branch
cd ../nxloy-agent-1  # feature/123
cd ../nxloy-agent-2  # feature/124
# Both active simultaneously
```

---

## Troubleshooting

### "Merge conflict in schema.prisma"

**Problem**: Both agents edited same Prisma schema file

**Solution 1: Domain separation** (prevention)
```bash
# Agent 1: auth.prisma only
# Agent 2: loyalty.prisma only
# Result: No conflicts
```

**Solution 2: Manual resolution**
```bash
# Open packages/database/prisma/schema/loyalty.prisma
# Find conflict markers
# Keep both changes if compatible, or choose one
# Test migration after resolution
pnpm prisma migrate dev --name resolve_conflict
```

**Solution 3: Agent help**
```bash
/task @backend-code-reviewer Help resolve Prisma schema conflict in loyalty.prisma

# Agent analyzes both schemas and suggests resolution
```

### "Your branch has diverged from 'origin/develop'"

**Problem**: You committed while develop also got commits

**Solution**: Sync with develop
```bash
git fetch origin
git log HEAD..origin/develop --oneline  # See their commits
git log origin/develop..HEAD --oneline  # See your commits

# Choose strategy:
git merge origin/develop  # Preserve both histories
# or
git rebase origin/develop  # Linear history (only if not pushed)
```

### "Cannot rebase - uncommitted changes"

**Problem**: Tried to rebase with dirty working directory

**Solution 1: Commit first**
```bash
git add .
git commit -m "WIP: save before rebase"
git rebase origin/develop
```

**Solution 2: Stash**
```bash
git stash
git rebase origin/develop
git stash pop
```

### "Agent broke after sync"

**Problem**: After syncing, agent's code doesn't work

**Causes**:
1. Dependencies changed (someone updated package.json)
2. API contracts changed (someone modified DTOs)
3. Database schema changed (someone ran migration)

**Solution**:
```bash
# 1. Reinstall dependencies
pnpm install

# 2. Regenerate Prisma client
cd packages/database
pnpm prisma generate

# 3. Run migrations
pnpm prisma migrate dev

# 4. Re-test
cd ../..
nx affected:test

# 5. If still broken, ask agent
/task @backend-code-reviewer After syncing with develop, my code broke. Help diagnose and fix the integration issues.
```

---

## Best Practices

### 1. Sync Regularly

```bash
# Daily morning routine
git fetch origin
git log HEAD..origin/develop --oneline  # Check what's new
git merge origin/develop                # Bring in changes
nx affected:test                        # Verify everything works
```

**Why**: Small, frequent syncs are easier than large, infrequent ones.

### 2. Test After Every Sync

```bash
git merge origin/develop
nx affected:test && nx affected:lint  # ALWAYS test after sync
```

**Why**: Catch integration issues immediately, before more work.

### 3. Coordinate Multi-Agent Syncs

```bash
# In team chat before syncing:
# "Syncing agent-1 and agent-2 worktrees with latest develop"

# Sync all, test all
cd ../nxloy-agent-1 && git merge origin/develop && nx affected:test
cd ../nxloy-agent-2 && git merge origin/develop && nx affected:test

# Report results
# "Both agents synced successfully, all tests pass"
```

**Why**: Avoid confusion, ensure team awareness.

### 4. Use Merge for Shared Branches

```bash
# ✅ Good: Merge preserves history
git merge origin/develop

# ❌ Bad: Rebase rewrites commits
git rebase origin/develop  # Only if not pushed!
```

**Why**: Rebase rewrites history - problematic for shared branches.

### 5. Never Force Push After Rebase on Shared Branch

```bash
# ❌ NEVER DO THIS if others are using your branch
git rebase origin/develop
git push --force

# ✅ Better: Merge instead
git merge origin/develop
git push
```

**Why**: Force push overwrites remote history - breaks others' work.

### 6. Use Worktrees for Parallel Work

```bash
# ✅ Good: Parallel work with worktrees
./tools/scripts/create-worktree.sh agent-1 feature/123
./tools/scripts/create-worktree.sh agent-2 feature/124

# ❌ Bad: Branch switching in same directory
git checkout feature/123  # work...
git checkout feature/124  # work...
# Loses context, confuses agents
```

**Why**: Worktrees preserve agent state and allow true parallel work.

### 7. Fetch Once for All Worktrees

```bash
# ✅ Efficient: Fetch once in main repo
cd /Users/channaly/nxloy
git fetch origin  # Benefits all worktrees

# ❌ Wasteful: Fetch in each worktree
cd ../nxloy-agent-1 && git fetch origin
cd ../nxloy-agent-2 && git fetch origin
cd ../nxloy-agent-3 && git fetch origin
```

**Why**: Shared .git means one fetch benefits all worktrees.

---

## Quick Reference Cheat Sheet

### Checking Status

```bash
git status                                      # Local changes
git fetch origin                                # Update remote refs
git log HEAD..origin/develop --oneline         # Commits you're missing
git log origin/develop..HEAD --oneline         # Your commits
git rev-list --left-right --count HEAD...origin/develop  # Behind/ahead count
```

### Syncing Operations

```bash
git merge origin/develop                       # Merge (safe, preserves history)
git rebase origin/develop                      # Rebase (clean history, local only)
git pull origin develop                        # Fetch + merge in one
```

### Conflict Resolution

```bash
git merge --abort                              # Cancel merge
git rebase --abort                             # Cancel rebase
git add <file>                                 # Mark conflict resolved
git merge --continue                           # Complete merge
git rebase --continue                          # Complete rebase
```

### Worktree Operations

```bash
./tools/scripts/create-worktree.sh agent-1 feature/123    # Create worktree
cd ../nxloy-agent-1                                        # Enter worktree
git merge origin/develop                                   # Sync worktree
./tools/scripts/cleanup-worktree.sh agent-1                # Remove worktree
git worktree list                                          # List all worktrees
```

### Testing After Sync

```bash
nx affected:test                               # Run affected tests
nx affected:lint                               # Run affected linting
nx run-many --target=typecheck --all          # Typecheck all projects
```

---

## Visual Decision Flowcharts

### Sync Strategy Decision

```
Need to sync with develop?
    |
    +--> Work not pushed yet? ──> Can use REBASE (clean history)
    |                                  └─> git rebase origin/develop
    |
    +--> Work already pushed? ──> Use MERGE (safe)
                                      └─> git merge origin/develop
```

### Worktree Decision

```
Starting work?
    |
    +--> Single feature? ──> Regular branch
    |                           └─> git checkout -b feature/123
    |
    +--> Multiple features?
            |
            +--> Sequential? ──> Regular branch (switch after each)
            |
            +--> Parallel? ──> Worktrees
                                  └─> ./tools/scripts/create-worktree.sh agent-1 feature/123
```

### Conflict Resolution

```
Got merge conflict?
    |
    +--> Simple conflict? ──> Manual resolution
    |                            └─> Edit file, git add, git merge --continue
    |
    +--> Complex conflict? ──> Ask agent for help
                                  └─> /task @backend-code-reviewer Help resolve conflict
```

---

## Related Documentation

- [Multi-Agent Workflow](./multi-agent-workflow.md) - Parallel development patterns
- [Worktree Workflow](./worktree-workflow.md) - Worktree creation and cleanup
- [Custom Agents](../contributing/custom-agents.md) - Agent usage guide
- [Development Workflow](../contributing/development-workflow.md) - General git workflow
- [Database Migrations](../contributing/database-migrations.md) - Prisma migration sync

---

**Last Updated**: 2025-11-09
**Maintained By**: NxPloy Platform Team
**Questions?**: See [CONTRIBUTING.md](../../CONTRIBUTING.md)
