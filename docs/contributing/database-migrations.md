# Database Migration Guidelines

**Related**: [Development Workflow](./development-workflow.md) | [Code Standards](./code-standards.md)

---

NxLoy uses **Prisma Migrate** for database schema management. All schema changes must go through migrations.

## Migration Workflow

**1. Make Schema Change**:

Edit the appropriate schema file in `packages/database/prisma/schema/`:
```prisma
// packages/database/prisma/schema/auth.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String   // ← Add new field
  lastName  String   // ← Add new field
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**2. Create Migration**:
```bash
cd packages/database
pnpm prisma migrate dev --name add_user_names
```

**3. Review Generated SQL**:
```bash
# Check the last migration
cat prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql
```

**4. Test Migration**:
```bash
# Reset database and reapply all migrations
pnpm prisma migrate reset

# Regenerate Prisma Client
pnpm prisma generate

# Run tests
cd ../..
nx affected:test
```

**5. Commit Schema + Migration**:
```bash
git add packages/database/prisma/
git commit -m "feat(database): add user name fields"
```

## Migration Naming Conventions

Use descriptive names following this pattern: `{action}_{entity}_{detail}`

**Good Examples**:
- `add_user_email_verification`
- `add_index_customers_email`
- `rename_customer_name_fields`
- `add_businessid_to_loyalty_tiers`
- `add_deletedat_for_soft_delete`

**Bad Examples** (too vague):
- `update`
- `changes`
- `fix`
- `migration`

## Multi-File Schema Organization

Schemas are organized by domain:
```
prisma/schema/
├── base.prisma           # Config, shared enums
├── auth.prisma           # Authentication domain
├── loyalty.prisma        # Loyalty domain
├── rewards.prisma        # Rewards domain
├── customer.prisma       # Customer domain
├── partner.prisma        # Partner domain
├── subscription.prisma   # Subscription domain
├── referral.prisma       # Referral domain
└── blockchain.prisma     # Blockchain domain
```

**When working on features**:
- Edit only the schema file for your domain
- Example: Auth features → edit `auth.prisma`
- This reduces merge conflicts when multiple contributors work in parallel

## Migration Rules

### 1. Schema-First Approach
- ✅ Edit Prisma schema files
- ❌ Write SQL migrations manually (let Prisma generate)
- Always review generated SQL before committing

### 2. Required Fields with Defaults
```prisma
// ✅ Good: Adding required field with default
model Customer {
  status Status @default(ACTIVE)
}

// ❌ Bad: Adding required field without default (fails for existing rows)
model Customer {
  status Status
}
```

### 3. Multi-Tenant Pattern
- All tenant-scoped tables must have `businessId`
- Always index `businessId` for performance
- Include `businessId` in unique constraints
```prisma
model Customer {
  email      String
  businessId String

  @@unique([email, businessId])  // ← Email unique per business
  @@index([businessId])
}
```

### 4. Soft Delete Pattern
- Add `deletedAt DateTime?` to all tables
- Index `deletedAt` for filtering performance
```prisma
model Customer {
  deletedAt DateTime?

  @@index([deletedAt])
}
```

### 5. Zero-Downtime Migrations (Production)
- Use expand-contract pattern
- Phase 1: Add new column (optional)
- Phase 2: Deploy code to write to both old and new
- Phase 3: Migrate data
- Phase 4: Remove old column

## Never Do This

- ❌ **Don't use `prisma db push`** - Bypasses migrations, only for prototyping
- ❌ **Don't edit committed migrations** - Breaks migration history
- ❌ **Don't delete migrations** - Other developers/environments need them
- ❌ **Don't make breaking changes** without expand-contract pattern
- ❌ **Don't skip testing** - Always test migrations before committing

## Migration Checklist

Before committing a migration:

- [ ] Reviewed generated SQL for correctness
- [ ] Tested migration with `prisma migrate reset`
- [ ] Added appropriate indexes for foreign keys
- [ ] Used `businessId` for multi-tenant tables
- [ ] Added `deletedAt` for soft delete tables
- [ ] Ran `nx affected:test` successfully
- [ ] Ran `nx affected:lint` successfully
- [ ] Committed both schema files and migration files

## Resources

- **Full Migration Guide**: `/docs/database/MIGRATIONS.md`
- **Migration Examples**: `/docs/database/MIGRATION-EXAMPLES.md`
- **Prisma Documentation**: https://www.prisma.io/docs/concepts/components/prisma-migrate
- **CLAUDE.md**: Migration workflow for AI agents

---

**Last Updated**: 2025-11-08
**Source**: CONTRIBUTING.md (Lines 1063-1232)
