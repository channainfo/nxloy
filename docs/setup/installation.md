# Installation

**Last Updated**: 2025-11-08

[← Back to main README](../../README.md) | [← Prerequisites](prerequisites.md)

This guide walks through installing and setting up the NxLoy platform on your local machine.

## Prerequisites

Before starting, ensure you have completed the [Prerequisites Guide](prerequisites.md).

## For Internal Developers (Direct Clone)

### 1. Clone the Repository

```bash
git clone https://github.com/channainfo/nxloy.git
cd nxloy
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for all apps and packages in the monorepo.

### 3. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your local configuration
# At minimum, set DATABASE_URL and JWT_SECRET
```

**Required Variables**:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nxloy_dev"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1h"

# Optional (for full functionality)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

### 4. Initialize Database

**🚧 Status**: Partial - only 2 of 8 schemas implemented (auth + base)

```bash
cd packages/database
pnpm prisma migrate dev
pnpm prisma generate
# Prisma Client is now exported from @nxloy/database
cd ../..
```

## For External Contributors (Fork-Based)

If you're contributing from outside the core team:

### 1. Fork the Repository

Click "Fork" on GitHub to create your copy of the repository.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/nxloy.git
cd nxloy
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/channainfo/nxloy.git
```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 6. Initialize Database

```bash
cd packages/database
pnpm prisma migrate dev
pnpm prisma generate
cd ../..
```

### 7. Verify Setup

```bash
# Run tests for affected projects
nx affected:test

# Lint affected projects
nx affected:lint

# Type check all projects
nx run-many --target=typecheck --all
```

## Keeping Your Fork Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Merge upstream changes into your main branch
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

## Common Installation Issues

If you encounter issues during installation:

1. **"Module not found" errors**: Run `pnpm install` again and `nx reset`
2. **Prisma Client errors**: Run `cd packages/database && pnpm prisma generate`
3. **Port conflicts**: Check [Troubleshooting Guide](troubleshooting.md)
4. **Database connection**: Ensure PostgreSQL is running and DATABASE_URL is correct

See the [Troubleshooting Guide](troubleshooting.md) for more help.

---

## Next Steps

After successful installation:

1. [Quick Start Guide](quick-start.md) - Run applications and verify everything works
2. [Development Guides](../development/) - Learn how to develop for backend, web, mobile
3. [Contributing Guide](../contributing/) - Learn the development workflow

---

**Navigation**:
- [← Back to main README](../../README.md)
- [← Previous: Prerequisites](prerequisites.md)
- [Next: Quick Start →](quick-start.md)
