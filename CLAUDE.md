# Claude Code Configuration - NxLoy Platform

## 🔧 **VERSION REQUIREMENTS**

### **Node.js**
- **Required**: 22.12.0 or higher
- **Recommended**: Node.js 22.x (Active LTS)
- **EOL**: April 2027
- **Fallback**: Node.js 20.19.0+ (use only if compatibility issues)
- **Not Supported**: Node.js 18.x (reached EOL)

### **Prisma** (When Database is Added)
- **Minimum**: 6.7.0 (for multi-file schema GA support)
- **Recommended**: Latest 6.x
- **Feature**: Multi-file schemas by domain (no preview flags needed)

### **Version Verification**
Before starting work, verify versions:
```bash
node --version    # Must show v22.x.x
pnpm --version    # Must show 10.14.0+
```

If Node.js version is incorrect:
```bash
nvm use 22        # Or nvm use (reads .nvmrc)
```

---

## ⛔ **CRITICAL GIT WORKFLOW OVERRIDE** ⛔
- **NEVER** checkout to develop/main before creating feature branches
- **ALWAYS** create new branches from CURRENT branch: `git checkout -b {issue_number}-{slug}`
- **NEVER** execute `git commit` or `git push` commands automatically
- **ALWAYS** let the user manually commit and push changes
- **Exception**: You may use `git status`, `git diff`, `git log`, `git add` for information gathering only

## 🚨 **CORE STANDARDS**

### **Environment Variables - CRITICAL**
**NEVER use fallback defaults like `|| 'defaultValue'` - This hides missing config in production!**

❌ **BAD** (causes production bugs):
```typescript
const port = process.env.PORT || 8080;  // WRONG - fails silently
const apiKey = process.env.API_KEY || 'default';  // DANGEROUS
```

✅ **GOOD** (fails fast):
```typescript
const port = process.env.PORT;
if (!port) throw new Error('PORT env var required');

// Or use validation library
const config = {
  port: requireEnv('PORT'),
  apiKey: requireEnv('API_KEY')
};
```

**Why?** Fallback defaults let broken config reach production. Code must crash early if env vars missing.

### **Nx Commands**
```bash
# After every code change:
nx affected:test && nx affected:lint && nx run-many --target=typecheck --all

# Run specific app
nx serve backend
nx serve web
nx run mobile:start

# Build specific app
nx build backend

# Test affected projects only
nx affected:test

# Visualize dependency graph
nx graph
```

### **Code Standards**
- **Max 40 lines per method** (excluding comments)
- **Max 3 parameters per method**
- **Single responsibility** (no method names with "and")
- **80% test coverage minimum**, 100% for business logic
- **No environment-specific code** (same behavior in dev/prod)
- **No default values for env vars** - Throw error if undefined, no fallbacks

### **Testing Standards**
- **NEVER use mocks** - Mocking causes false positives and hides real integration issues
- **Use factories for test data** - Create actual database records using factory patterns
- **Use Faker for realistic data** - Generate realistic test data (names, emails, dates, etc.)
- **Test against real dependencies** - Use test databases, not mocked repositories
- **Clean up after tests** - Each test should create and destroy its own data
- **Isolated test data** - Each test creates its own records to avoid conflicts

**Why No Mocks?**
When you mock a database call, API response, or service method, your test passes even if:
- The actual database schema changed
- The API contract broke
- The service method signature changed
- Business logic has bugs

**Instead, use this pattern:**
1. Create a factory function that builds real test objects
2. Use Faker to generate realistic random data
3. Save actual records to test database
4. Run your test against real data
5. Clean up records after test completes

**Example approach (pseudo-code):**
```
Factory creates Customer with:
  - name from Faker (realistic random name)
  - email from Faker (realistic random email)
  - phone from Faker (realistic random phone)
  - Save to test database (actual INSERT)
  - Return real Customer object with real ID

Test uses Factory to:
  - Create customer (real database record)
  - Call service method (hits real database)
  - Assert results (verified against real data)
  - Cleanup (delete test records)
```

**Benefits:**
- Tests catch real breaking changes
- Tests verify actual database constraints
- Tests validate real business logic
- No false positives from outdated mocks
- Confidence that code actually works

### **Monorepo Standards**
- **Import from packages**: Use `@nxloy/shared-types`, not relative paths across apps
- **Update shared packages**: Changes to `packages/*` affect all apps - test accordingly
- **Nx project boundaries**: Don't import from `apps/` in `packages/`
- **Use Nx generators**: `nx g` for creating new code (maintains consistency)

## 📝 **DOCUMENTATION**

### **Change Files**
Write to `changes/{git-branch-name}.md` with:
```markdown
**Issue**: #{number}
**Date**: {YYYY-MM-DD}
 (NxLoy Platform)
## Summary
[description]
```

### **Architecture Decision Records**
For significant decisions, create ADR in `docs/adr/`:
```bash
cp docs/adr/template.md docs/adr/XXXX-decision-title.md
# Fill in template
```

### **Cross-Scope TODOs**
After implementing features, update relevant files:
- `/docs/requirements/loyalty/` - Business requirements
- `/docs/adr/` - Architecture decisions

## 🚨 **CRITICAL RULES - NEVER BREAK**

1. **NEVER execute `git commit` or `git push`** - User manages all commits manually
2. **Use Nx commands** instead of npm scripts where applicable
3. **Import from @nxloy/* packages**, not relative paths across apps
4. **Update cross-scope docs** for every feature
5. **Methods max 40 lines**, max 3 parameters
6. **Run `nx affected:test`** after changes
7. **Never disable features** to fix errors
8. **NEVER use fallback defaults for env vars** - Code must fail if env vars missing
10. **ALWAYS fail fast** when required env vars are undefined or empty

## 📊 **PROJECT CONTEXT**

- **Architecture**: Nx monorepo
- **Package Manager**: pnpm
- **Build System**: Nx with caching
- **Stack**: NestJS, Next.js, React Native, Prisma, PostgreSQL
- **Domains**: Customer management, loyalty, transactions, auth
- **Shared Packages**: `@nxloy/shared-types`, `@nxloy/shared-validation`, `@nxloy/shared-utils`

## 🔀 **GIT WORKTREE WORKFLOW**

When working with AI agents in parallel:

```bash
# Create worktree for agent
./tools/scripts/create-worktree.sh agent-1 feature-branch-name

# Agent works in isolated directory
cd ../nxloy-agent-1
nx serve backend

# Cleanup after merge
./tools/scripts/cleanup-worktree.sh agent-1
```

## 🗄️ **DATABASE MIGRATIONS**

### **Migration Tool**
- **Tool**: Prisma Migrate (schema-first, declarative)
- **Location**: `packages/database/prisma/`
- **Schema Organization**: Multi-file by domain (auth.prisma, loyalty.prisma, etc.)

### **Migration Workflow**

**Daily Development**:
```bash
# 1. Edit schema file (e.g., auth.prisma)
# 2. Create migration
cd packages/database
pnpm prisma migrate dev --name descriptive_name

# 3. Verify generated SQL
cat prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql

# 4. Test migration
pnpm prisma migrate reset  # Reset + reapply all
pnpm prisma generate        # Regenerate Prisma Client

# 5. Run tests
cd ../..
nx affected:test
```

**Production Deployment**:
```bash
cd packages/database
pnpm prisma migrate deploy  # Apply pending migrations
```

### **Migration Rules**

1. **Schema-First Approach**:
   - Edit Prisma schema files, not SQL directly
   - Prisma generates SQL migrations automatically
   - Review generated SQL before committing

2. **Naming Conventions**:
   - Use descriptive names: `add_user_email_verification`
   - Pattern: `{action}_{entity}_{detail}`
   - Bad: `update`, `changes`, `fix`

3. **Multi-Agent Coordination**:
   - One domain per agent (reduces conflicts)
   - Agent 1: Edit `auth.prisma` only
   - Agent 2: Edit `loyalty.prisma` only
   - Coordinate changes to shared `base.prisma`

4. **Zero-Downtime Strategy**:
   - Use expand-contract pattern for production
   - Add columns as optional first
   - Deploy code changes separately from schema changes
   - Remove old columns after code deployed

5. **Multi-Tenant Safety**:
   - All tenant-scoped tables have `businessId`
   - Index `businessId` for performance
   - Unique constraints include `businessId`
   - Example: `@@unique([email, businessId])`

6. **Soft Delete Pattern**:
   - Add `deletedAt DateTime?` to all tables
   - Index `deletedAt` for filtering
   - Use middleware to auto-filter deleted records

### **Never Do This**

- ❌ **Don't run `prisma db push`** in production (bypasses migrations)
- ❌ **Don't edit migration files** after they're committed
- ❌ **Don't delete migrations** (breaks migration history)
- ❌ **Don't make breaking changes** without expand-contract
- ❌ **Don't skip testing** migrations on staging first

### **Rollback Strategy**

Prisma has **no automatic rollback**. Options:

1. **Revert and Recreate**:
   ```bash
   git revert HEAD
   pnpm prisma migrate resolve --rolled-back {migration-id}
   pnpm prisma migrate dev --name revert_changes
   ```

2. **Manual SQL Rollback**:
   ```bash
   # Write reverse SQL manually
   psql $DATABASE_URL -c "ALTER TABLE customers DROP COLUMN newField;"
   pnpm prisma migrate resolve --rolled-back {migration-id}
   ```

3. **Database Restore** (last resort)

### **Resources**

- **Full Guide**: `/docs/database/MIGRATIONS.md`
- **Examples**: `/docs/database/MIGRATION-EXAMPLES.md`
- **Prisma Docs**: https://www.prisma.io/docs/concepts/components/prisma-migrate

## 🤖 **CUSTOM AGENTS**

NxLoy has **7 specialized custom agents** in `.claude/agents/` for domain-specific tasks:

1. **backend-code-reviewer** - Reviews NestJS backend code quality and standards
2. **frontend-implementation-specialist** - Implements cross-platform features (Next.js + React Native)
3. **architecture-reviewer** - Elite architectural review and security analysis
4. **blockchain-nft-code-reviewer** - Reviews smart contracts and Web3 integrations
5. **ai-mcp-genai-reviewer** - Reviews AI/MCP/GenAI code and integrations
6. **compliance-standards-enforcer** - Financial compliance, regulatory requirements, audit trails
7. **product-market-researcher** - Market analysis and product validation

### **Using Custom Agents**

Invoke agents for specialized tasks:

```bash
# Code review before PR
/task @backend-code-reviewer Review apps/backend/src/loyalty/points.service.ts

# Implement cross-platform feature
/task @frontend-implementation-specialist Create customer profile screen for web and mobile

# Validate architecture
/task @architecture-reviewer Review multi-tenant notification system design
```

### **Agent Rules**

- **All agents follow CLAUDE.md rules** - 40-line methods, 3 parameters, no mocks
- **Enforce NxLoy standards** - Agents reject code violating project standards
- **Provide context** - Give agents file paths and specific concerns
- **Iterate on feedback** - Use agents multiple times to refine implementation

### **Resources**

- **Full Agent Guide**: `/CONTRIBUTING.md#custom-claude-agents`
- **Agent Files**: `.claude/agents/*.md`

---

**Core Principle**: Quality over speed. Small, testable methods with comprehensive testing.
