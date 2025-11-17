# Environment Configuration Guide

Complete guide to configuring environment variables for the NxLoy platform, following production-safe best practices.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration Philosophy](#configuration-philosophy)
- [Required Variables](#required-variables)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Validation & Error Handling](#validation--error-handling)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

NxLoy follows a **fail-fast** configuration philosophy: if required environment variables are missing, the application crashes immediately on startup rather than running with incorrect defaults. This prevents production bugs and ensures configuration issues are caught during deployment, not in production.

### Key Principles

1. **No Fallback Defaults**: Never use `process.env.VAR || 'default'`
2. **Fail Fast**: Crash on startup if config is missing
3. **Clear Error Messages**: Tell developers exactly what's wrong
4. **Type Safety**: Validate types (string, integer, boolean)
5. **Environment Isolation**: Separate configs for dev/test/prod

## Quick Start

### 1. Copy Environment Template

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env  # or your preferred editor
```

### 2. Minimum Required Variables

For local development, you must set:

```bash
# Database
DATABASE_URL="postgresql://postgres:@localhost:5432/nxloy_dev"
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5432/nxloy_test"

# Server
PORT="8080"

# JWT
JWT_SECRET="your-dev-secret-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-change-in-production"
JWT_EXPIRES_IN="7d"

# Frontend URLs
FRONTEND_URL="http://localhost:8081"
APP_URL="http://localhost:8080"

# SMTP (use Mailpit for local dev)
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM_NAME="NxLoy"
SMTP_FROM_EMAIL="noreply@nxloy.local"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_TTL="86400"

# Rate Limiting
RATE_LIMIT_TTL="60"
RATE_LIMIT_MAX="100"

# Account Security
ACCOUNT_LOCKOUT_THRESHOLD="5"
ACCOUNT_LOCKOUT_DURATION="30"
```

### 3. Verify Configuration

```bash
# Try starting the backend - it will fail fast if config is wrong
nx serve backend

# Expected: Server starts on http://localhost:8080
# If it crashes: Read the error message - it tells you which env var is missing
```

## Configuration Philosophy

### Why No Fallback Defaults?

**Bad Pattern** (DON'T DO THIS):
```typescript
// ❌ WRONG - Hides missing config
const port = process.env.PORT || 8080;
const apiKey = process.env.API_KEY || 'default-key';
```

**Problems**:
- Tests pass locally with defaults, fail in production
- Production runs with wrong settings (e.g., port 8080 instead of 80)
- Silent failures are hard to debug
- Security issues (default API keys)

**Good Pattern** (DO THIS):
```typescript
// ✅ CORRECT - Fails fast if missing
import { requireEnv, requireEnvInt } from './common/utils/env.util';

const port = requireEnvInt('PORT');  // Throws if missing or invalid
const apiKey = requireEnv('API_KEY'); // Throws if missing or empty
```

**Benefits**:
- Deployment fails if config is wrong (not in production)
- Clear error messages: "PORT environment variable is required but not defined"
- No surprises in production
- Forces proper configuration management

## Required Variables

### Database

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `DATABASE_URL` | string | PostgreSQL connection string for development | `postgresql://user:pass@host:5432/db` |
| `DATABASE_URL_TEST` | string | **CRITICAL**: Separate test database (never use production!) | `postgresql://user:pass@host:5432/test_db` |

**Why separate test DB?** Tests create/destroy data. Using production DB would cause data loss.

### Server

| Variable | Type | Description | Default (Dev) |
|----------|------|-------------|---------------|
| `PORT` | integer | Backend server port | `8080` |
| `NODE_ENV` | string | Environment mode | `development` |

### Authentication & Security

| Variable | Type | Description | Production Value |
|----------|------|-------------|------------------|
| `JWT_SECRET` | string | Secret key for access tokens | **Generate with `openssl rand -base64 32`** |
| `JWT_REFRESH_SECRET` | string | Secret key for refresh tokens | **Different from JWT_SECRET** |
| `JWT_EXPIRES_IN` | string | Access token lifetime | `15m` (production), `7d` (dev) |
| `ACCOUNT_LOCKOUT_THRESHOLD` | integer | Failed login attempts before lockout | `5` |
| `ACCOUNT_LOCKOUT_DURATION` | integer | Lockout duration in minutes | `30` |

**Security Note**: Never commit secrets to git. Use secret management tools in production (AWS Secrets Manager, HashiCorp Vault, etc.).

### Frontend URLs

| Variable | Type | Description | Dev Value |
|----------|------|-------------|-----------|
| `FRONTEND_URL` | string | Web app URL (for OAuth redirects, CORS) | `http://localhost:8081` |
| `APP_URL` | string | Backend API URL (for email links) | `http://localhost:8080` |

**Important**: These must match actual ports from README.md:
- Backend: 8080
- Web: 8081
- Mobile: 8082
- AI-MCP: 8083

### Email (SMTP)

| Variable | Type | Description | Dev Tool |
|----------|------|-------------|----------|
| `SMTP_HOST` | string | SMTP server hostname | Use [Mailpit](https://mailpit.axllent.org/) for local dev |
| `SMTP_PORT` | integer | SMTP server port | `1025` (Mailpit) |
| `SMTP_SECURE` | boolean | Use TLS/SSL | `false` (dev), `true` (prod) |
| `SMTP_USER` | string | SMTP username | Empty for Mailpit |
| `SMTP_PASSWORD` | string | SMTP password | Empty for Mailpit |
| `SMTP_FROM_NAME` | string | Email sender name | `NxLoy` |
| `SMTP_FROM_EMAIL` | string | Email sender address | `noreply@nxloy.local` |

**Dev Setup**: Install Mailpit for local email testing:
```bash
# macOS
brew install mailpit
mailpit

# View emails at http://localhost:8025
```

### Redis (Queue System)

| Variable | Type | Description | Dev Value |
|----------|------|-------------|-----------|
| `REDIS_URL` | string | Full Redis connection string | `redis://localhost:6379` |
| `REDIS_HOST` | string | Redis server hostname | `localhost` |
| `REDIS_PORT` | integer | Redis server port | `6379` |
| `REDIS_PASSWORD` | string | Redis password (optional for dev) | Empty string |
| `REDIS_TTL` | integer | Default TTL in seconds | `86400` (24 hours) |

**Dev Setup**: Install Redis:
```bash
# macOS
brew install redis
brew services start redis

# Verify
redis-cli ping  # Should return "PONG"
```

### Rate Limiting

| Variable | Type | Description | Dev Value |
|----------|------|-------------|-----------|
| `RATE_LIMIT_TTL` | integer | Time window in seconds | `60` |
| `RATE_LIMIT_MAX` | integer | Max requests per window | `100` |

**Production Values**: Adjust based on your needs (e.g., `RATE_LIMIT_MAX=1000` for high-traffic APIs).

## Environment-Specific Configuration

### Development (.env.local)

```bash
NODE_ENV="development"
PORT="8080"

# Relaxed security for faster development
JWT_EXPIRES_IN="7d"
RATE_LIMIT_MAX="1000"

# Local services
DATABASE_URL="postgresql://postgres:@localhost:5432/nxloy_dev"
REDIS_HOST="localhost"
SMTP_HOST="localhost"  # Mailpit
```

### Testing (.env.test)

```bash
NODE_ENV="test"
PORT="8081"  # Different port to avoid conflicts

# Fast token expiry for testing
JWT_EXPIRES_IN="1h"

# CRITICAL: Separate test database
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5432/nxloy_test"

# Use same local services
REDIS_HOST="localhost"
SMTP_HOST="localhost"
```

### Staging (.env.staging)

```bash
NODE_ENV="production"  # Use production mode
PORT="8080"

# Production-like security
JWT_EXPIRES_IN="15m"
RATE_LIMIT_MAX="100"

# Staging database (separate from production!)
DATABASE_URL="${DATABASE_URL_STAGING}"  # Injected by CI/CD

# Use real Redis, SMTP
REDIS_URL="${REDIS_URL_STAGING}"
SMTP_HOST="${SMTP_HOST_STAGING}"
```

### Production (.env.production)

```bash
NODE_ENV="production"
PORT="8080"

# Strict security
JWT_EXPIRES_IN="15m"
RATE_LIMIT_MAX="100"
ACCOUNT_LOCKOUT_THRESHOLD="3"  # Stricter than dev

# All values injected by secret manager
DATABASE_URL="${DATABASE_URL}"
JWT_SECRET="${JWT_SECRET}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET}"
REDIS_URL="${REDIS_URL}"
SMTP_HOST="${SMTP_HOST}"
SMTP_PASSWORD="${SMTP_PASSWORD}"
```

**Production Deployment**: Use secret management tools:
```bash
# AWS Secrets Manager example
aws secretsmanager get-secret-value --secret-id nxloy/prod/jwt-secret

# HashiCorp Vault example
vault kv get secret/nxloy/prod/jwt-secret

# Kubernetes Secrets example
kubectl create secret generic nxloy-secrets \
  --from-literal=jwt-secret="${JWT_SECRET}"
```

## Validation & Error Handling

### Using the env.util Helper

```typescript
import { requireEnv, requireEnvInt, optionalEnv } from './common/utils/env.util';

// Required string variable
const apiUrl = requireEnv('API_URL');
// Throws: "API_URL environment variable is required but not defined"

// Required integer variable
const port = requireEnvInt('PORT');
// Throws: "PORT must be a valid integer, got: 'not-a-number'"

// Optional variable (truly optional features)
const debugMode = optionalEnv('DEBUG_MODE');
// Returns: undefined if not set, doesn't throw
```

### Available Functions

```typescript
/**
 * Require string environment variable
 * @throws Error if undefined, empty, or whitespace-only
 */
requireEnv(key: string): string

/**
 * Require integer environment variable
 * @throws Error if undefined, empty, or not a valid integer
 */
requireEnvInt(key: string): number

/**
 * Optional string environment variable
 * @returns undefined if not set, doesn't validate
 */
optionalEnv(key: string): string | undefined

/**
 * Optional integer environment variable
 * @returns undefined if not set
 * @throws Error if set but not a valid integer
 */
optionalEnvInt(key: string): number | undefined
```

### Error Messages

When a required variable is missing, you get clear errors:

```
Error: PORT environment variable is required but not defined. Please set it in your .env file or environment.

Error: REDIS_PORT must be a valid integer, got: "not-a-number"

Error: DATABASE_URL_TEST environment variable is required for tests. Never use production database for testing!
```

## Security Best Practices

### 1. Never Commit Secrets

```bash
# .gitignore (already configured)
.env
.env.local
.env.production
.env.staging

# Only commit the template
.env.example  # Safe to commit (no real secrets)
```

### 2. Rotate Secrets Regularly

```bash
# Generate new JWT secret
openssl rand -base64 32

# Update in secret manager
aws secretsmanager update-secret \
  --secret-id nxloy/prod/jwt-secret \
  --secret-string "${NEW_SECRET}"

# Rolling restart to pick up new secret
kubectl rollout restart deployment/nxloy-backend
```

### 3. Use Different Secrets Per Environment

```
Dev:     JWT_SECRET="dev-secret-123"
Staging: JWT_SECRET="staging-secret-456"
Prod:    JWT_SECRET="prod-secret-789"
```

Never share secrets between environments.

### 4. Principle of Least Privilege

```bash
# Development: Full access
DATABASE_URL="postgresql://admin:pass@localhost:5432/nxloy_dev"

# Production: Limited permissions
DATABASE_URL="postgresql://app_user:pass@db.prod:5432/nxloy_prod"
# app_user has SELECT, INSERT, UPDATE only (no DROP, no ALTER)
```

### 5. Test Database Isolation

The code enforces test database separation:

```typescript
// ✅ ENFORCED: Tests MUST use separate database
const testDb = process.env.DATABASE_URL_TEST;
if (!testDb) {
  throw new Error('DATABASE_URL_TEST required - never use production DB!');
}
```

This prevents catastrophic scenarios like:
- Running tests against production (data loss!)
- Test data polluting production
- Accidental schema changes in production

## Troubleshooting

### "Environment variable is required but not defined"

**Solution**: Add the variable to your `.env` file

```bash
# Check which variable is missing (error message tells you)
Error: REDIS_HOST environment variable is required but not defined

# Add to .env
echo 'REDIS_HOST="localhost"' >> .env

# Restart the app
nx serve backend
```

### "Must be a valid integer"

**Solution**: Remove quotes from integer values

```bash
# ❌ Wrong
PORT="8080"

# ✅ Correct
PORT=8080

# Or keep quotes (both work with our validator)
PORT="8080"  # Also valid, parseInt handles this
```

### Application Crashes on Startup

1. **Check all required variables are set**:
```bash
# Use our verification script
./scripts/verify-env.sh

# Or manually check
cat .env | grep -E "^[A-Z_]+="
```

2. **Verify syntax**:
```bash
# Common errors:
- Spaces around = (wrong: PORT = 8080)
- Unquoted values with spaces (wrong: SMTP_FROM=No Reply)
- Missing closing quote

# Validate syntax
source .env && echo "Syntax OK"
```

3. **Check service dependencies**:
```bash
# Is PostgreSQL running?
psql -U postgres -c "SELECT 1"

# Is Redis running?
redis-cli ping

# Is Mailpit running?
curl http://localhost:8025
```

### "Connection refused" Errors

**Database**:
```bash
# Start PostgreSQL
brew services start postgresql@14

# Create databases
createdb nxloy_dev
createdb nxloy_test
```

**Redis**:
```bash
# Start Redis
brew services start redis

# Test connection
redis-cli ping
```

**SMTP (Mailpit)**:
```bash
# Start Mailpit
mailpit

# Check it's running
curl http://localhost:8025
```

### Tests Failing with "Cannot connect to database"

**Solution**: Ensure `DATABASE_URL_TEST` is set and database exists

```bash
# 1. Check env var
echo $DATABASE_URL_TEST
# Should be: postgresql://postgres:postgres@localhost:5432/nxloy_test

# 2. Create test database if needed
createdb nxloy_test

# 3. Run migrations on test DB
DATABASE_URL=$DATABASE_URL_TEST pnpm prisma migrate deploy

# 4. Run tests
nx test backend
```

## Additional Resources

- **CLAUDE.md**: Core configuration standards
- **.env.example**: Complete variable reference
- **changes/auth/2025-11-13-env-config-no-fallbacks.md**: Detailed change log
- **docs/contributing/code-standards.md**: Development standards
- **docs/guides/DEPLOYMENT-GUIDE.md**: Production deployment guide

## Quick Reference Card

```bash
# Essential commands
cp .env.example .env           # Setup
nx serve backend               # Test config
source .env && echo "OK"       # Verify syntax

# Generate secrets
openssl rand -base64 32        # JWT secrets
openssl rand -hex 16           # Shorter secrets

# Check services
psql -U postgres -c "SELECT 1" # PostgreSQL
redis-cli ping                 # Redis
curl localhost:8025            # Mailpit

# Debugging
echo $PORT                     # Check variable
printenv | grep REDIS          # List Redis vars
node -e 'console.log(process.env.PORT)' # Test in Node
```

---

**Remember**: Configuration errors should crash the app during deployment, not in production. This is a feature, not a bug!
