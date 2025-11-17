# Configuration Security Best Practices

Security guidelines for managing environment variables, secrets, and configuration in the NxLoy platform.

## Table of Contents

- [Overview](#overview)
- [Secret Management](#secret-management)
- [Environment Isolation](#environment-isolation)
- [Test Database Security](#test-database-security)
- [Password & Hashing Security](#password--hashing-security)
- [Configuration Validation](#configuration-validation)
- [Common Vulnerabilities](#common-vulnerabilities)
- [Incident Response](#incident-response)

## Overview

**Security Principle**: Configuration errors are security vulnerabilities.

The NxLoy platform enforces **secure-by-default** configuration:
- No fallback defaults (prevents misconfigurations)
- Fail-fast on missing variables (catches issues in deployment)
- Clear error messages (aids debugging without exposing secrets)
- Test database isolation (prevents data loss)
- Type validation (prevents injection attacks)

## Secret Management

### 1. Never Commit Secrets to Git

**Critical Files** (already in `.gitignore`):
```
.env
.env.local
.env.production
.env.staging
*.key
*.pem
*.p12
```

**Verify before committing**:
```bash
# Check for secrets in staged files
git diff --cached | grep -iE "(password|secret|key|token)"

# Use git-secrets to prevent commits
brew install git-secrets
git secrets --install
git secrets --register-aws
```

### 2. Generate Strong Secrets

**For JWT Secrets**:
```bash
# Generate 256-bit secret (32 bytes base64)
openssl rand -base64 32

# Example output
# qX3+9FvK2jL8nM4pQ7rS1tU6vW0xY2zA3B+C5D/E8F=
```

**For Database Passwords**:
```bash
# Generate 20-character alphanumeric password
openssl rand -base64 15 | tr -dc 'a-zA-Z0-9'

# Example output
# Kx9mP2qR7sT4vW8y
```

**For API Keys**:
```bash
# Generate UUID (good for API keys)
uuidgen | tr '[:upper:]' '[:lower:]'

# Example output
# 3fa85f64-5717-4562-b3fc-2c963f66afa6
```

### 3. Rotate Secrets Regularly

**Rotation Schedule**:
- **JWT Secrets**: Every 90 days
- **Database Passwords**: Every 180 days
- **API Keys**: Every 90 days
- **Emergency**: Immediately if compromised

**Rotation Process**:

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# 2. Update in secret manager (example: AWS Secrets Manager)
aws secretsmanager update-secret \
  --secret-id nxloy/prod/jwt-secret \
  --secret-string "$NEW_SECRET"

# 3. Rolling restart (allows old tokens to expire gradually)
kubectl rollout restart deployment/nxloy-backend

# 4. Verify new secret is loaded
kubectl exec -it nxloy-backend-xxx -- env | grep JWT_SECRET
```

### 4. Use Secret Management Tools

**Development**: Use `.env` files (never commit)

**Production**: Use dedicated secret managers

**AWS Secrets Manager**:
```bash
# Store secret
aws secretsmanager create-secret \
  --name nxloy/prod/jwt-secret \
  --secret-string "$(openssl rand -base64 32)"

# Retrieve in deployment
JWT_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id nxloy/prod/jwt-secret \
  --query SecretString \
  --output text)
```

**HashiCorp Vault**:
```bash
# Store secret
vault kv put secret/nxloy/prod/jwt-secret value="$(openssl rand -base64 32)"

# Retrieve in deployment
JWT_SECRET=$(vault kv get -field=value secret/nxloy/prod/jwt-secret)
```

**Kubernetes Secrets**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nxloy-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded-secret>
```

```bash
# Create from literal
kubectl create secret generic nxloy-secrets \
  --from-literal=jwt-secret="$(openssl rand -base64 32)"

# Use in pod
env:
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: nxloy-secrets
        key: jwt-secret
```

## Environment Isolation

### 1. Separate Secrets Per Environment

**Never share secrets between environments**:

```bash
# ❌ WRONG - Same secret everywhere
Dev:     JWT_SECRET="shared-secret-123"
Staging: JWT_SECRET="shared-secret-123"
Prod:    JWT_SECRET="shared-secret-123"

# ✅ CORRECT - Unique secrets per environment
Dev:     JWT_SECRET="dev-secret-abc123..."
Staging: JWT_SECRET="staging-secret-def456..."
Prod:    JWT_SECRET="prod-secret-ghi789..."
```

**Why?**
- If dev secret is compromised, production is still secure
- Tokens can't be replayed across environments
- Easier to rotate individual environments

### 2. Separate Databases Per Environment

**Database Isolation**:
```bash
# ❌ WRONG - Shared database
Dev:  DATABASE_URL="postgresql://prod.db:5432/nxloy"
Test: DATABASE_URL="postgresql://prod.db:5432/nxloy"  # DANGEROUS!

# ✅ CORRECT - Isolated databases
Dev:  DATABASE_URL="postgresql://dev.db:5432/nxloy_dev"
Test: DATABASE_URL="postgresql://test.db:5432/nxloy_test"
Prod: DATABASE_URL="postgresql://prod.db:5432/nxloy"
```

### 3. Least Privilege Access

**Database User Permissions**:

```sql
-- ❌ WRONG - App user has full access
GRANT ALL PRIVILEGES ON DATABASE nxloy TO app_user;

-- ✅ CORRECT - App user has minimal permissions
-- Create dedicated app user
CREATE USER nxloy_app WITH PASSWORD 'secure-password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE nxloy TO nxloy_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO nxloy_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO nxloy_app;

-- Migrations user (separate from app user)
CREATE USER nxloy_migrations WITH PASSWORD 'different-password';
GRANT ALL PRIVILEGES ON DATABASE nxloy TO nxloy_migrations;
```

## Test Database Security

### Critical: Test Database Isolation

**The code enforces this**:

```typescript
// apps/backend/src/test/helpers/database.helper.ts
const testDatabaseUrl = process.env.DATABASE_URL_TEST;

if (!testDatabaseUrl) {
  throw new Error(
    'DATABASE_URL_TEST environment variable is required for tests. ' +
    'Never use production database for testing!'
  );
}

// ✅ Will crash if DATABASE_URL_TEST is missing
// ✅ Prevents accidental use of production database
```

**Why This Matters**:

Real incident (industry): Company ran tests against production:
- Tests dropped and recreated tables
- Lost 2TB of customer data
- 6-hour outage
- $2M in damages
- Regulatory fines

**Our Protection**:
1. Code-level enforcement (throws error if `DATABASE_URL_TEST` missing)
2. Separate connection strings required
3. Tests never have access to production credentials

### Test Database Setup

```bash
# 1. Create dedicated test database
createdb nxloy_test

# 2. Set in .env (NEVER use production URL)
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5432/nxloy_test"

# 3. Run migrations on test DB
DATABASE_URL=$DATABASE_URL_TEST pnpm prisma migrate deploy

# 4. Tests now safely use isolated database
nx test backend
```

## Password & Hashing Security

### 1. Use Bcrypt for Password Hashing

**Our implementation** (`apps/backend/src/auth/utils/password.util.ts`):

```typescript
// ✅ Centralized, secure password hashing
export class PasswordUtil {
  private static readonly SALT_ROUNDS = 10;

  static async hash(plaintext: string): Promise<string> {
    if (!plaintext) {
      throw new Error('Password cannot be empty');
    }
    return bcrypt.hash(plaintext, this.SALT_ROUNDS);
  }

  static async verify(plaintext: string, hash: string): Promise<boolean> {
    if (!plaintext || !hash) {
      return false;
    }
    return bcrypt.compare(plaintext, hash);
  }
}
```

**Why bcrypt?**
- Adaptive: Can increase cost factor as hardware improves
- Salted automatically: Different hash for same password
- Slow by design: Prevents brute-force attacks
- Industry standard: Battle-tested for decades

**Why 10 rounds?**
- ~150ms per hash (good UX, still secure)
- 2^10 = 1,024 iterations
- Scales with CPU power (Moore's law protection)

### 2. Never Store Plaintext Passwords

```typescript
// ❌ WRONG - Storing plaintext
await prisma.user.create({
  data: {
    email,
    password: plainPassword,  // SECURITY VULNERABILITY!
  },
});

// ✅ CORRECT - Always hash before storing
const passwordHash = await PasswordUtil.hash(plainPassword);
await prisma.user.create({
  data: {
    email,
    passwordHash,  // Hashed, salted, secure
  },
});
```

### 3. Password Validation (Server-Side)

```typescript
// ✅ Server-side validation
export class SignupDto {
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;
}
```

**Never trust client-side validation**: Always validate on server.

## Configuration Validation

### 1. Type Validation

**Our validation** (`apps/backend/src/common/utils/env.util.ts`):

```typescript
// ✅ Validates type at runtime
export function requireEnvInt(key: string): number {
  const value = requireEnv(key);
  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    throw new Error(`${key} must be a valid integer, got: "${value}"`);
  }

  return parsed;
}
```

**Why?**
```typescript
// Without validation
const port = process.env.PORT;  // Type: string | undefined
app.listen(port);  // Runtime error: NaN or wrong type

// With validation
const port = requireEnvInt('PORT');  // Type: number, validated
app.listen(port);  // ✅ Safe
```

### 2. Range Validation

**For security-critical values**:

```typescript
// Example: Rate limiting
const rateLimitMax = requireEnvInt('RATE_LIMIT_MAX');

if (rateLimitMax < 1 || rateLimitMax > 10000) {
  throw new Error('RATE_LIMIT_MAX must be between 1 and 10000');
}

// Example: Account lockout
const lockoutThreshold = requireEnvInt('ACCOUNT_LOCKOUT_THRESHOLD');

if (lockoutThreshold < 3 || lockoutThreshold > 20) {
  throw new Error('ACCOUNT_LOCKOUT_THRESHOLD must be between 3 and 20');
}
```

## Common Vulnerabilities

### 1. Default Credentials

**❌ NEVER use default credentials in production**:

```bash
# Default PostgreSQL password (bad)
DATABASE_URL="postgresql://postgres:postgres@db:5432/nxloy"

# Default Redis password (bad)
REDIS_PASSWORD=""

# Default JWT secret (bad)
JWT_SECRET="secret"
```

**Attackers know these defaults!**

### 2. Hardcoded Secrets

**❌ NEVER hardcode secrets**:

```typescript
// ❌ WRONG - Hardcoded secret
const jwtSecret = 'my-secret-key';

// ❌ WRONG - Hardcoded in code
const apiKey = 'sk-1234567890abcdef';

// ✅ CORRECT - Always from environment
const jwtSecret = requireEnv('JWT_SECRET');
const apiKey = requireEnv('API_KEY');
```

### 3. Logging Secrets

**❌ NEVER log secrets**:

```typescript
// ❌ WRONG - Logs secret
logger.info(`JWT Secret: ${process.env.JWT_SECRET}`);
logger.info(`Database URL: ${process.env.DATABASE_URL}`);

// ✅ CORRECT - Log without secrets
logger.info('JWT authentication configured');
logger.info(`Database connected to ${dbUrl.split('@')[1]}`);  // Only host/db name
```

**Sanitize logs**:

```typescript
// Helper to redact secrets from logs
function sanitizeForLog(obj: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['password', 'secret', 'token', 'key'];

  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      acc[key] = '[REDACTED]';
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}

// Usage
logger.info('Config loaded', sanitizeForLog(config));
// Output: { jwtSecret: '[REDACTED]', port: 8080, ... }
```

### 4. Timing Attacks

**Password verification must be constant-time**:

```typescript
// ✅ Bcrypt is constant-time by design
const isValid = await PasswordUtil.verify(plaintext, hash);

// ❌ WRONG - String comparison leaks timing
const isValid = plaintext === storedPassword;  // Vulnerable!
```

## Incident Response

### If Secrets Are Compromised

**Immediate Actions** (within 1 hour):

1. **Rotate affected secrets**:
```bash
# Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# Update in secret manager
aws secretsmanager update-secret \
  --secret-id nxloy/prod/jwt-secret \
  --secret-string "$NEW_SECRET"

# Restart services to pick up new secret
kubectl rollout restart deployment/nxloy-backend
```

2. **Revoke all active sessions**:
```sql
-- Revoke all refresh tokens
UPDATE refresh_tokens SET revoked_at = NOW() WHERE revoked_at IS NULL;

-- Users will need to re-authenticate
```

3. **Audit access logs**:
```bash
# Check for suspicious activity
kubectl logs -l app=nxloy-backend --since=24h | grep -i "unauthorized"

# Check database access logs
psql -c "SELECT * FROM audit_logs WHERE action = 'LOGIN' AND created_at > NOW() - INTERVAL '24 hours';"
```

4. **Notify stakeholders**:
   - Security team
   - Engineering lead
   - Product owner
   - Users (if user data affected)

**Follow-Up Actions** (within 24 hours):

1. **Root cause analysis**: How was secret exposed?
2. **Update processes**: Prevent recurrence
3. **Review all secrets**: Are others at risk?
4. **Update runbooks**: Document the incident

## Security Checklist

### Development

- [ ] All secrets in `.env`, never committed to git
- [ ] `.env.example` has no real secrets
- [ ] Test database separate from dev database
- [ ] Git hooks prevent secret commits (`git-secrets`)

### Code Review

- [ ] No `process.env.VAR || 'default'` patterns
- [ ] All `requireEnv` / `requireEnvInt` used correctly
- [ ] No hardcoded secrets, API keys, passwords
- [ ] No secrets logged to console/files
- [ ] Password hashing uses `PasswordUtil`

### Deployment

- [ ] Secrets stored in secret manager (not env files)
- [ ] Each environment has unique secrets
- [ ] Least privilege database permissions
- [ ] TLS/SSL enabled for all connections
- [ ] Secrets rotation schedule documented

### Monitoring

- [ ] Alert on failed login attempts (brute force)
- [ ] Alert on secret access errors (wrong credentials)
- [ ] Monitor unauthorized API access
- [ ] Track secret rotation dates

## Additional Resources

- [Environment Configuration Guide](../guides/ENVIRONMENT-CONFIGURATION.md)
- [Code Standards - Environment Variables](../contributing/code-standards.md#5-environment-variables---never-use-fallback-defaults)
- [OWASP Secure Configuration Guide](https://cheatsheetseries.owasp.org/cheatsheets/Configuration_Cheat_Sheet.html)
- [CWE-798: Use of Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
- [NIST SP 800-63B: Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

**Remember**: A configuration error is a security vulnerability. Fail fast, fail secure.
