**Date**: 2025-11-13
**Branch**: auth
**Type**: Feature + Documentation

## Summary
Added npm scripts for running backend server and Redis queue system, plus comprehensive documentation in CLAUDE.md and README.md.

## Changes

### 1. Added Scripts to package.json
Added convenience scripts for development workflow:

**Backend & App Scripts:**
- `dev:backend` - Start backend development server
- `dev:web` - Start web app development server
- `dev:mobile` - Start mobile app development server
- `start:backend` - Start backend in production mode
- `build:backend` - Build backend for production
- `build:web` - Build web app for production
- `build:mobile` - Build mobile app for production

**Redis & Queue Scripts:**
- `redis:start` - Start Redis server
- `redis:stop` - Stop Redis server
- `redis:monitor` - Monitor Redis commands in real-time
- `queue:stats` - Show Bull queue statistics

**Database & Prisma Scripts:**
- `db:generate` - Generate Prisma Client
- `db:migrate` - Create and apply migration in development
- `db:migrate:deploy` - Apply pending migrations in production
- `db:studio` - Open Prisma Studio (database GUI)
- `db:format` - Format Prisma schema files
- `db:validate` - Validate Prisma schema
- `db:seed` - Seed database with test data
- `db:reset` - Reset database (deletes all data!)

### 2. Updated CLAUDE.md
- Added **Backend & Queue Setup** section with detailed instructions
- Documented Redis prerequisites (brew install, docker options)
- Listed all required environment variables for backend, database, Redis, JWT, email, and OAuth
- Added commands for running backend server with pnpm scripts (recommended)
- Included queue monitoring commands and Bull Board reference
- Documented queue details (retry logic, processors, module locations)
- Updated **Database Migrations** section with pnpm scripts workflow
- Added database management commands (seed, reset, studio)

### 3. Updated README.md
- Added Redis to prerequisites list (7.0+ required)
- Updated installation instructions to use pnpm database scripts
- Enhanced "Run Applications" section with step-by-step startup sequence using pnpm scripts
- Provided alternative Nx commands for developers who prefer direct Nx usage
- Added explanatory comments about queue workers running automatically

### 4. Verified Existing Configuration
- Confirmed `.env.example` already has Redis configuration (lines 159-165)
- Verified queue module uses Bull with Redis (`apps/backend/src/queue/queue.module.ts`)
- Confirmed email processor exists (`apps/backend/src/queue/processors/email.processor.ts`)

## Backend & Queue Architecture

### Queue System
- **Technology**: Bull (Redis-based queue library)
- **Queues**: Email queue for async email sending
- **Retry Logic**: 3 attempts with exponential backoff (2s, 4s, 8s)
- **Features**: Job prioritization, delayed jobs, progress tracking

### Required Services
1. **PostgreSQL**: Database for persistent data
2. **Redis**: Queue backend for Bull
3. **NestJS Backend**: API server + queue workers

### Environment Variables
Backend requires these critical env vars (no fallbacks per CLAUDE.md):
- `PORT` - API server port
- `FRONTEND_URL` - CORS origin
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `JWT_SECRET`, `JWT_EXPIRATION` - Authentication
- `SMTP_*` - Email service configuration

## Running the Backend

**Using pnpm scripts (recommended):**
```bash
# Terminal 1: Start Redis
pnpm redis:start

# Terminal 2: Start Backend (with queue workers)
pnpm dev:backend
# Backend runs on http://localhost:8080/api
# Queue workers process jobs automatically

# Terminal 3: Start Web app
pnpm dev:web
```

**Using Nx directly:**
```bash
redis-server            # Terminal 1
nx serve backend        # Terminal 2
nx serve web            # Terminal 3
```

## Database Management

**Common workflows:**
```bash
# After editing Prisma schema
pnpm db:migrate --name add_new_feature
pnpm db:generate

# View database in GUI
pnpm db:studio

# Seed test data
pnpm db:seed

# Reset database (WARNING: deletes all data!)
pnpm db:reset
```

## Queue Monitoring

**Using npm scripts:**
```bash
# Check queue stats
pnpm queue:stats

# Monitor queue in real-time
pnpm redis:monitor
```

**Using redis-cli directly:**
```bash
redis-cli KEYS "bull:email:*"
redis-cli MONITOR
```

## Roadmap: Separate Queue Worker Process (Future Enhancement)

Added to product roadmap and infrastructure documentation as a **future enhancement** for post-Phase 2:

**What**: Separate queue worker process (Sidekiq-style pattern)
**When**: Post-Phase 2 (when job volumes exceed 1,000/minute or CPU-intensive tasks added)
**Why**: Enable independent scaling of workers from API servers

**Implementation Plan** (future):
- Create `apps/backend/src/worker.ts` entrypoint
- Add `pnpm queue:work` command
- Worker Dockerfile and K8s deployment config
- Auto-scaling based on queue depth
- Worker health monitoring

**Current State**: In-process workers sufficient for Phase 1-2 (email jobs, low-moderate volumes)

**Documented in**:
- `/docs/requirements/PRODUCT-ROADMAP.md` - Added to Infrastructure section (Weeks 7-8)
- `/docs/development/infrastructure.md` - Detailed architecture and implementation checklist

## Related Files
- `/package.json` - Added npm scripts for backend and queue
- `/CLAUDE.md` - Project configuration and standards
- `/README.md` - Quick start guide
- `/.env.example` - Environment variable template
- `/apps/backend/src/queue/queue.module.ts` - Queue configuration
- `/apps/backend/src/queue/queue.service.ts` - Queue service
- `/apps/backend/src/queue/processors/email.processor.ts` - Email job processor
- `/docs/requirements/PRODUCT-ROADMAP.md` - Added queue worker to roadmap
- `/docs/development/infrastructure.md` - Added queue worker architecture section

## Impact
- **Developers**: Clear instructions for running backend and queues
- **Onboarding**: Simplified setup process with explicit steps
- **Troubleshooting**: Better understanding of service dependencies
- **Architecture**: Documented queue system for future enhancements

## Notes
- Redis is REQUIRED for backend to start (queue module initialization fails without it)
- Queue workers run in same process as API server (no separate worker process needed for development)
- Production deployments may want separate worker processes for scalability
- Optional Bull Board can be added for queue UI monitoring
