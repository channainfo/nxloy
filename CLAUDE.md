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
nx serve backend          # Start backend API server (requires env vars)
nx serve web             # Start Next.js web app
nx run mobile:start      # Start React Native mobile app

# Build specific app
nx build backend

# Test affected projects only
nx affected:test

# Visualize dependency graph
nx graph
```

### **Backend & Queue Setup**

The backend uses **Bull** (Redis-based queue) for background job processing.

**Prerequisites**:
```bash
# Install Redis (macOS)
brew install redis

# Start Redis server
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:7-alpine
```

**Required Environment Variables**:
```bash
# Backend API
PORT=3000
FRONTEND_URL=http://localhost:4200
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nxloy_dev

# Redis (for queues)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=              # Optional: leave empty if no password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email (for queue jobs) - See docs/setup/smtp-setup.md
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false                # true for 465 (SSL), false for 587 (TLS)
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=noreply@nxloy.com
SMTP_FROM_NAME=NxLoy Platform

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback

APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=
APPLE_CALLBACK_URL=http://localhost:3000/api/auth/apple/callback
```

**Running Backend**:
```bash
# Using pnpm scripts (recommended):
# 1. Start Redis (required for queues)
pnpm redis:start

# 2. Start backend server (in separate terminal)
pnpm dev:backend

# 3. Start web app (in separate terminal)
pnpm dev:web

# Or using Nx directly:
nx serve backend

# Backend runs on http://localhost:3000/api
# Queue jobs (emails, etc.) process automatically via Bull workers
```

**Queue Monitoring**:
```bash
# Using pnpm scripts:
pnpm queue:stats        # Check queue statistics
pnpm redis:monitor      # Monitor queue in real-time
pnpm redis:stop         # Stop Redis server

# Or using redis-cli directly:
redis-cli KEYS "bull:email:*"
redis-cli MONITOR

# Optional: Install Bull Board for UI monitoring
# https://github.com/felixmosh/bull-board
```

**Queue Details**:
- **Email Queue**: Handles async email sending (verification, password reset)
- **Retry Logic**: 3 attempts with exponential backoff (2s, 4s, 8s)
- **Processors**: Located in `apps/backend/src/queue/processors/`
- **Module**: `apps/backend/src/queue/queue.module.ts`

### **SMTP Server Setup**

**📖 Full SMTP Setup Guide**: [docs/setup/smtp-setup.md](docs/setup/smtp-setup.md)

The backend requires an SMTP server for sending emails (verification, password reset, etc.).

**Quick Start - Local Development (MailHog)**:
```bash
# Install MailHog (macOS)
brew install mailhog

# Start MailHog
mailhog

# View sent emails at http://localhost:8025
```

**Local Development `.env`**:
```bash
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=dev@nxloy.local
SMTP_FROM_NAME=NxLoy Dev
```

**Production Options**:
- **SendGrid** (recommended): Free tier 100 emails/day, production-ready
- **AWS SES**: $0.10 per 1,000 emails, best for high volume
- **Gmail**: Quick testing only, 500 emails/day limit
- **Mailgun**: 5,000 emails/month free for 3 months
- **Postmark**: $15/month for 10,000 emails, excellent deliverability

**Common Production `.env` (SendGrid)**:
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=NxLoy Platform
```

**Verification**:
```bash
# Backend logs should show on startup:
# [EmailService] SMTP connection verified
```

**Troubleshooting**:
- Connection refused → Check SMTP_HOST and SMTP_PORT
- Auth failed → Verify SMTP_USER and SMTP_PASSWORD
- TLS errors → Ensure SMTP_PORT matches SMTP_SECURE (587=false, 465=true)
- Emails not arriving → Check spam folder, verify sender domain

**📖 Detailed Setup**: See [docs/setup/smtp-setup.md](docs/setup/smtp-setup.md) for:
- MailHog, MailCatcher, smtp4dev installation
- Gmail App Password setup
- SendGrid API key configuration
- AWS SES, Mailgun, Postmark setup
- Complete troubleshooting guide

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

**Daily Development** (using root pnpm scripts):
```bash
# 1. Edit schema file (e.g., packages/database/prisma/schema/auth.prisma)

# 2. Create migration
pnpm db:migrate --name descriptive_name

# 3. Generate Prisma Client
pnpm db:generate

# 4. Validate schema
pnpm db:validate

# 5. Format schema files
pnpm db:format

# 6. Run tests
nx affected:test

# Optional: Open Prisma Studio (database GUI)
pnpm db:studio
```

**Daily Development** (alternative - from database package):
```bash
cd packages/database
pnpm prisma:migrate --name descriptive_name
pnpm prisma:generate
pnpm prisma:validate
pnpm prisma:format
cd ../..
nx affected:test
```

**Production Deployment**:
```bash
# Using root script (recommended)
pnpm db:migrate:deploy

# Or from database package
cd packages/database
pnpm prisma:migrate:deploy
```

**Database Management**:
```bash
# Seed database with test data
pnpm db:seed

# Reset database (WARNING: deletes all data!)
pnpm db:reset
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
2. **frontend-design-implementation-specialist** - Designs UX/UI and implements cross-platform features (Next.js + React Native)
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

# Design and implement cross-platform feature
/task @frontend-design-implementation-specialist Design and build a waitlist landing page for early access

# Create customer profile screen (design + implementation)
/task @frontend-design-implementation-specialist Create customer profile screen for web and mobile

# Design a color system
/task @frontend-design-implementation-specialist Create design tokens and color system for the app

# Validate architecture
/task @architecture-reviewer Review multi-tenant notification system design

# Validate product features
/task @product-market-researcher Research competitor referral reward systems
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
