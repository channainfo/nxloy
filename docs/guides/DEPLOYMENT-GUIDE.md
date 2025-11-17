# Authentication Module - Deployment Guide

## Prerequisites

### Required Infrastructure

1. **PostgreSQL Database** (v14+)
   - For user data, sessions, audit logs
   - Recommended: AWS RDS, Google Cloud SQL, or Supabase

2. **Redis** (v6+)
   - For rate limiting, queues, session storage
   - Recommended: AWS ElastiCache, Redis Cloud, or Upstash

3. **SMTP Server**
   - For sending emails (verification, password reset, etc.)
   - Options: SendGrid, AWS SES, Mailgun, or Gmail

4. **Node.js** (v22.12.0+)
   - Required for running the NestJS backend

---

## Step 1: Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure required environment variables:

### Database
```env
DATABASE_URL="postgresql://user:password@host:5432/nxloy_prod"
```

### JWT Secrets (IMPORTANT: Generate strong secrets!)
```bash
# Generate secrets (run these commands):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```env
JWT_SECRET="<generated-secret-1>"
JWT_REFRESH_SECRET="<generated-secret-2>"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
```

### SMTP Email
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="<your-sendgrid-api-key>"
SMTP_FROM_EMAIL="noreply@yourdomain.com"
SMTP_FROM_NAME="YourApp"
```

### Redis
```env
REDIS_HOST="your-redis-host.com"
REDIS_PORT="6379"
REDIS_PASSWORD="<your-redis-password>"
```

### URLs
```env
FRONTEND_URL="https://yourdomain.com"
APP_URL="https://api.yourdomain.com"
```

### Security
```env
ACCOUNT_LOCKOUT_THRESHOLD="5"
ACCOUNT_LOCKOUT_DURATION="1800"  # 30 minutes in seconds
RATE_LIMIT_TTL="60"
RATE_LIMIT_MAX="100"
```

---

## Step 2: Database Setup

### Run Prisma Migrations

```bash
cd packages/database

# Generate Prisma Client
pnpm prisma generate

# Run migrations (production)
pnpm prisma migrate deploy

# Verify database connection
pnpm prisma db push --accept-data-loss=false
```

### Initialize System Roles

System roles are automatically initialized when the RbacModule starts:
- SUPER_ADMIN
- BUSINESS_OWNER
- BUSINESS_MANAGER
- CUSTOMER
- SUPPORT_AGENT

---

## Step 3: OAuth Configuration (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://api.yourdomain.com/auth/google/callback`
4. Configure:

```env
GOOGLE_CLIENT_ID="<your-client-id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<your-client-secret>"
GOOGLE_CALLBACK_URL="https://api.yourdomain.com/auth/google/callback"
```

### Apple Sign In

1. Go to [Apple Developer](https://developer.apple.com/)
2. Create Sign in with Apple identifier
3. Generate private key (.p8 file)
4. Configure:

```env
APPLE_CLIENT_ID="com.yourdomain.signin"
APPLE_TEAM_ID="<your-team-id>"
APPLE_KEY_ID="<your-key-id>"
APPLE_PRIVATE_KEY_PATH="/path/to/AuthKey_XXXXXX.p8"
APPLE_CALLBACK_URL="https://api.yourdomain.com/auth/apple/callback"
```

### Facebook Login

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create Facebook App
3. Configure:

```env
FACEBOOK_APP_ID="<your-app-id>"
FACEBOOK_APP_SECRET="<your-app-secret>"
FACEBOOK_CALLBACK_URL="https://api.yourdomain.com/auth/facebook/callback"
```

---

## Step 4: Build & Deploy

### Production Build

```bash
# Build backend
nx build backend --configuration=production

# Build output location: dist/apps/backend
```

### Docker Deployment (Recommended)

Create `Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages/database ./packages/database

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY dist/apps/backend ./dist/apps/backend

# Generate Prisma Client
WORKDIR /app/packages/database
RUN pnpm prisma generate

WORKDIR /app

# Expose port
EXPOSE 8080

# Start application
CMD ["node", "dist/apps/backend/main.js"]
```

Build and run:
```bash
docker build -t nxloy-backend .
docker run -p 8080:8080 --env-file .env nxloy-backend
```

### Docker Compose (with Redis & PostgreSQL)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: nxloy_prod
      POSTGRES_USER: nxloy
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: .
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://nxloy:${DB_PASSWORD}@postgres:5432/nxloy_prod
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    env_file:
      - .env
    ports:
      - "8080:8080"

volumes:
  postgres_data:
  redis_data:
```

---

## Step 5: Health Checks & Monitoring

### Health Check Endpoint

Add to `app.controller.ts`:
```typescript
@Get('health')
healthCheck() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

### Database Connection Check
```bash
curl https://api.yourdomain.com/api/health
```

### Redis Connection Check
Monitor queue stats:
```bash
curl -H "Authorization: Bearer <admin-token>" \
  https://api.yourdomain.com/api/queue/stats
```

---

## Step 6: Security Checklist

- [ ] Strong JWT secrets (32+ random bytes)
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured (whitelisted origins)
- [ ] Rate limiting enabled
- [ ] Account lockout enabled
- [ ] Helmet security headers active
- [ ] Database backups scheduled
- [ ] Redis persistence enabled
- [ ] Audit logs monitored
- [ ] Error logging configured (Sentry, DataDog, etc.)

---

## Step 7: Post-Deployment Verification

### 1. Test Authentication Flow
```bash
# Signup
curl -X POST https://api.yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 2. Test OAuth Redirects
- Visit `https://api.yourdomain.com/api/auth/google`
- Verify Google consent screen appears
- Check callback redirect to frontend

### 3. Test Email Delivery
- Trigger password reset
- Verify email received
- Check email template rendering

### 4. Test Rate Limiting
```bash
# Send 10 rapid requests
for i in {1..10}; do
  curl -X POST https://api.yourdomain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
# Should see 429 Too Many Requests
```

### 5. Test MFA Setup
```bash
# Get TOTP setup (requires auth token)
curl -X GET https://api.yourdomain.com/api/mfa/setup-totp \
  -H "Authorization: Bearer <access-token>"
```

---

## Scaling Considerations

### Horizontal Scaling

Backend is stateless and can scale horizontally:

```yaml
# Kubernetes example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nxloy-backend
spec:
  replicas: 3  # Scale to 3 instances
  selector:
    matchLabels:
      app: nxloy-backend
  template:
    metadata:
      labels:
        app: nxloy-backend
    spec:
      containers:
      - name: backend
        image: nxloy-backend:latest
        ports:
        - containerPort: 8080
```

### Database Connection Pooling

Configure Prisma connection pool:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

### Redis Cluster (High Availability)

For production, use Redis Cluster or Sentinel:
```env
REDIS_CLUSTER_NODES="redis-1:6379,redis-2:6379,redis-3:6379"
```

---

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** Check DATABASE_URL format and network access

### Issue: "Email not sending"
**Solution:** Verify SMTP credentials, check firewall rules

### Issue: "Redis connection failed"
**Solution:** Ensure Redis is running and accessible

### Issue: "OAuth callback error"
**Solution:** Verify callback URLs match OAuth provider settings

### Issue: "Rate limit not working"
**Solution:** Check Redis connection (rate limiter uses Redis)

---

## Monitoring & Logging

### Recommended Tools

1. **Error Tracking:** Sentry, Rollbar
2. **Performance:** DataDog, New Relic
3. **Logs:** CloudWatch, LogDNA, Papertrail
4. **Uptime:** Pingdom, UptimeRobot

### Audit Log Queries

```sql
-- Recent security events
SELECT * FROM audit_logs
WHERE action IN ('LOGIN_FAILURE', 'ACCOUNT_LOCKED')
ORDER BY created_at DESC
LIMIT 100;

-- Failed login attempts by user
SELECT user_id, COUNT(*) as failed_attempts
FROM audit_logs
WHERE action = 'LOGIN_FAILURE'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
HAVING COUNT(*) > 3;
```

---

## Backup & Recovery

### Database Backups

```bash
# Automated daily backups
pg_dump -Fc $DATABASE_URL > backup_$(date +%Y%m%d).dump

# Restore
pg_restore -d $DATABASE_URL backup_20251111.dump
```

### Redis Persistence

Enable RDB snapshots in `redis.conf`:
```
save 900 1
save 300 10
save 60 10000
```

---

## Support

For issues or questions:
- Check API documentation: `/docs/api/AUTH-API.md`
- Review architecture decisions: `/docs/adr/`
- Consult CLAUDE.md for coding standards

**Deployment complete!** 🎉
