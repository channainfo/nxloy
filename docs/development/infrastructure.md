# Infrastructure & DevOps Guide

**Last Updated**: 2025-11-08

[← Back to README](../../README.md) | [Development Guides](../development/)

---

## Overview

NxLoy will use **Infrastructure as Code (IaC)** for reproducible deployments across development, staging, and production environments.

**Current Status**: 📋 Stub package only - no Docker files, no K8s configs, no Terraform modules

**Planned Features**:
- Docker: Containerized applications
- Kubernetes (K8s): Container orchestration
- Terraform: Cloud infrastructure provisioning
- CI/CD: GitHub Actions pipelines
- Monitoring: Prometheus, Grafana

---

## Prerequisites

### Required Tools

**Docker Desktop**: 4.20+ ([Download](https://www.docker.com/products/docker-desktop/))
```bash
docker --version  # Verify installation
```

**kubectl**: Kubernetes CLI ([Install](https://kubernetes.io/docs/tasks/tools/))
```bash
kubectl version --client
```

**Terraform**: 1.5+ ([Download](https://www.terraform.io/downloads))
```bash
terraform --version
```

**Helm**: Kubernetes package manager ([Install](https://helm.sh/docs/intro/install/))
```bash
helm version
```

### Optional Tools

**Minikube/Kind**: Local Kubernetes cluster ([Minikube](https://minikube.sigs.k8s.io/))

**k9s**: Kubernetes TUI ([k9s](https://k9scli.io/))
```bash
brew install k9s  # macOS
```

---

## Docker Setup (📋 Planned - Files Don't Exist)

### Planned Docker Structure

```bash
# When implemented, these files will be created:
packages/infrastructure/
├── docker/
│   ├── backend.Dockerfile      # NestJS backend container
│   ├── worker.Dockerfile       # Queue worker container (future)
│   ├── web.Dockerfile          # Next.js web container
│   ├── mobile-web.Dockerfile   # React Native web build
│   └── ai-mcp.Dockerfile       # AI-MCP server container
├── docker-compose.yml          # Local development orchestration
└── docker-compose.prod.yml     # Production-like local testing
```

### Queue Worker Architecture (Future Enhancement)

**Current State** (Phase 1-2):
- Queue workers run **in-process** with the NestJS backend
- Single command starts both API and workers: `pnpm dev:backend`
- Sufficient for email jobs and low-moderate volumes (<1,000 jobs/minute)

**Future State** (Post-Phase 2):
When job volumes increase or CPU-intensive tasks are added, implement separate worker processes:

```typescript
// apps/backend/src/worker.ts (to be created)
/**
 * Standalone Queue Worker Process
 *
 * Runs Bull queue processors independently from API server.
 * Enables horizontal scaling of workers.
 *
 * Usage:
 *   pnpm queue:work    # Start worker process
 *
 * Environment Variables:
 *   REDIS_HOST, REDIS_PORT - Redis connection
 *   WORKER_CONCURRENCY - Jobs to process concurrently (default: 5)
 *   QUEUE_NAMES - Comma-separated queue names (default: "email,notifications")
 */
```

**Implementation Checklist** (when needed):
- [ ] Create `apps/backend/src/worker.ts` entrypoint
- [ ] Add `queue:work` npm script: `"queue:work": "nx serve backend --target=worker"`
- [ ] Create Nx target in `apps/backend/project.json` for worker
- [ ] Create `docker/worker.Dockerfile` for containerization
- [ ] Update `docker-compose.yml` to include worker service
- [ ] Add Kubernetes deployment for workers (`k8s/worker/deployment.yaml`)
- [ ] Implement worker health checks and monitoring
- [ ] Configure worker auto-scaling based on queue depth

**Triggers for Implementation**:
- ✓ Job volumes exceed 1,000/minute
- ✓ Adding CPU-intensive tasks (image processing, video encoding, data analysis)
- ✓ Need to scale workers independently from API servers
- ✓ Production deployment requires resource isolation
- ✓ Worker memory usage impacts API performance

### Planned Docker Commands (when files exist)

**Build backend image**:
```bash
docker build -t nxloy-backend:latest -f packages/infrastructure/docker/backend.Dockerfile .
```

**Build web image**:
```bash
docker build -t nxloy-web:latest -f packages/infrastructure/docker/web.Dockerfile .
```

**Run with Docker Compose**:
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## Kubernetes Local Development (📋 Planned - Configs Don't Exist)

### Planned K8s Structure

```bash
# When implemented, these files will be created:
packages/infrastructure/k8s/
├── namespace.yaml              # nxloy namespace
├── backend/
│   ├── deployment.yaml         # Backend deployment
│   ├── service.yaml            # Backend service
│   ├── configmap.yaml          # Backend configuration
│   └── secrets.yaml.example    # Secrets template
├── web/
│   ├── deployment.yaml         # Web deployment
│   ├── service.yaml            # Web service
│   └── ingress.yaml            # Web ingress
├── database/
│   ├── statefulset.yaml        # PostgreSQL statefulset
│   ├── service.yaml            # Database service
│   └── pvc.yaml                # Persistent volume claim
└── monitoring/
    ├── prometheus.yaml         # Prometheus deployment
    └── grafana.yaml            # Grafana deployment
```

### Planned Kubernetes Workflow (when configs exist)

**Start Minikube cluster**:
```bash
minikube start --cpus=4 --memory=8192
```

**Deploy to Kubernetes**:
```bash
cd packages/infrastructure/k8s

# Create namespace
kubectl apply -f namespace.yaml

# Deploy database
kubectl apply -f database/

# Deploy backend
kubectl apply -f backend/

# Deploy web
kubectl apply -f web/
```

**Check deployments**:
```bash
kubectl get pods -n nxloy
kubectl get services -n nxloy
kubectl get ingress -n nxloy
```

**View logs**:
```bash
# View backend logs
kubectl logs -n nxloy -l app=backend --tail=100 -f

# View web logs
kubectl logs -n nxloy -l app=web --tail=100 -f
```

**Access services locally**:
```bash
# Port forward backend
kubectl port-forward -n nxloy svc/backend 8080:8080

# Port forward web
kubectl port-forward -n nxloy svc/web 8081:8081
```

---

## Terraform Infrastructure (📋 Planned - Modules Don't Exist)

### Planned Terraform Structure

```bash
# When implemented, these will be created:
packages/infrastructure/terraform/
├── main.tf                     # Main Terraform config
├── variables.tf                # Variable definitions
├── outputs.tf                  # Output definitions
├── environments/
│   ├── dev.tfvars             # Development variables
│   ├── staging.tfvars         # Staging variables
│   └── prod.tfvars            # Production variables
├── modules/
│   ├── vpc/                   # VPC module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── rds/                   # RDS PostgreSQL module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── eks/                   # EKS Kubernetes cluster module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── monitoring/            # Monitoring stack module
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── backend.tf                 # Terraform state backend config
```

### Planned Terraform Workflow (when modules exist)

**Initialize Terraform**:
```bash
cd packages/infrastructure/terraform
terraform init
```

**Plan infrastructure changes**:
```bash
# Development environment
terraform plan -var-file=environments/dev.tfvars

# Staging environment
terraform plan -var-file=environments/staging.tfvars

# Production environment
terraform plan -var-file=environments/prod.tfvars
```

**Apply infrastructure changes**:
```bash
terraform apply -var-file=environments/dev.tfvars
```

**Destroy infrastructure** (DEV ONLY):
```bash
terraform destroy -var-file=environments/dev.tfvars
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

**Existing workflows** (`.github/workflows/`):
- `ci.yml` - Run tests and linting on every PR
- `deploy-staging.yml` - Auto-deploy to staging on merge to `develop`
- `deploy-production.yml` - Deploy to production on merge to `main`

### Trigger Manual Deployment

```bash
# Via GitHub CLI
gh workflow run deploy-staging.yml

# Or use GitHub UI: Actions > Deploy Staging > Run workflow
```

### CI/CD Best Practices

- **Test before deploy**: All tests must pass before deployment
- **Automated rollbacks**: Detect failures and rollback automatically
- **Deployment notifications**: Slack/email notifications for deployments
- **Environment parity**: Staging mirrors production configuration
- **Database migrations**: Run migrations before app deployment

---

## Environment Configuration

### Manage Secrets

**GitHub Secrets** (for CI/CD):
```bash
# Add secrets to GitHub
gh secret set DATABASE_URL --body "postgresql://..."
gh secret set JWT_SECRET --body "super-secret-key"
gh secret set OPENAI_API_KEY --body "sk-..."
```

**Kubernetes Secrets**:
```bash
# Create database secret
kubectl create secret generic db-secret \
  --from-literal=database-url=postgresql://... \
  -n nxloy

# Create API keys secret
kubectl create secret generic api-keys \
  --from-literal=openai-api-key=sk-... \
  --from-literal=anthropic-api-key=sk-ant-... \
  -n nxloy
```

### ConfigMaps for Non-Sensitive Config

```bash
# Create config from file
kubectl create configmap app-config \
  --from-file=config/app.json \
  -n nxloy

# Create config from literals
kubectl create configmap backend-config \
  --from-literal=NODE_ENV=production \
  --from-literal=LOG_LEVEL=info \
  -n nxloy
```

---

## Monitoring & Logging

### View Application Metrics (📋 Planned)

**Prometheus**: http://localhost:9090
- Query metrics and create alerts
- Monitor system and application metrics

**Grafana**: http://localhost:3000
- Visualize metrics with dashboards
- Create custom dashboards for business metrics

### Centralized Logging

**View aggregated logs**:
```bash
# View all backend logs
kubectl logs -n nxloy --all-containers=true -l app=backend

# View logs from last hour
kubectl logs -n nxloy -l app=backend --since=1h

# Stream logs in real-time
kubectl logs -n nxloy -l app=backend -f
```

### Alerting (📋 Planned)

**Planned alert types**:
- High error rate (>5% of requests)
- Slow response time (>500ms p95)
- Database connection failures
- High memory/CPU usage (>80%)
- Pod restarts or crashes

---

## Common Infrastructure Issues

### Docker build fails with "no space left on device"

**Cause**: Docker disk space full

**Solution**:
```bash
# Clean up Docker resources
docker system prune -a
docker volume prune

# Increase Docker disk limit in Docker Desktop settings
```

### Kubernetes pods stuck in "Pending" state

**Cause**: Insufficient cluster resources

**Solution**:
```bash
# Check resource requests
kubectl describe pod <pod-name> -n nxloy

# Increase Minikube resources
minikube delete
minikube start --cpus=4 --memory=8192
```

### Terraform apply fails with "provider not found"

**Cause**: Terraform plugins not initialized

**Solution**:
```bash
cd packages/infrastructure/terraform
terraform init -upgrade
terraform apply
```

### "ImagePullBackOff" error in Kubernetes

**Cause**: Docker image not available in registry

**Solution**:
```bash
# Build and load image to Minikube
eval $(minikube docker-env)
docker build -t nxloy-backend:latest -f packages/infrastructure/docker/backend.Dockerfile .
```

### Docker Compose services can't communicate

**Cause**: Services on different networks

**Solution**:
```bash
# Check docker-compose.yml has all services in same network
docker-compose down
docker network prune
docker-compose up -d
```

---

## Deployment Architecture (📋 Planned)

### Development Environment

- **Infrastructure**: Local Docker/Minikube
- **Database**: Local PostgreSQL container
- **Storage**: Local filesystem
- **Monitoring**: Optional (docker-compose)

### Staging Environment

- **Infrastructure**: AWS EKS / GCP GKE
- **Database**: RDS PostgreSQL (smaller instance)
- **Storage**: S3 / GCS
- **Monitoring**: Prometheus + Grafana
- **Auto-deploy**: On merge to `develop` branch

### Production Environment

- **Infrastructure**: AWS EKS / GCP GKE (multi-AZ)
- **Database**: RDS PostgreSQL (HA, read replicas)
- **Storage**: S3 / GCS (with CDN)
- **Monitoring**: Full observability stack
- **Auto-scaling**: HPA for pods, cluster autoscaler
- **Manual deploy**: On merge to `main` (after approval)

---

## Best Practices

### Container Best Practices

- **Use multi-stage builds** to reduce image size
- **Pin versions** for reproducible builds
- **Run as non-root user** for security
- **Use .dockerignore** to exclude unnecessary files
- **Scan images** for vulnerabilities (Trivy, Snyk)

### Kubernetes Best Practices

- **Set resource limits** (CPU/memory) for all pods
- **Use health checks** (liveness, readiness, startup)
- **Implement pod disruption budgets** for HA
- **Use namespaces** to isolate environments
- **Apply security contexts** (non-root, read-only filesystem)

### Terraform Best Practices

- **Use remote state** (S3 + DynamoDB for locking)
- **Version lock providers** for consistency
- **Use modules** for reusable infrastructure
- **Separate environments** with tfvars files
- **Plan before apply** to review changes

---

## Related Documentation

- [Backend Development](./backend.md) - Backend deployment requirements
- [Web Development](./web.md) - Web deployment requirements
- [Blockchain Development](./blockchain.md) - Blockchain node infrastructure
- [Deployment Guide](../../docs/requirements/integration-guides/DEPLOYMENT.md) - Deployment procedures
- [Monitoring Guide](../../docs/requirements/integration-guides/MONITORING.md) - Monitoring setup

---

**Implementation Status**: The infrastructure package is currently a stub. Implementation will include Docker configurations, Kubernetes manifests, Terraform modules for cloud infrastructure, and CI/CD pipeline enhancements.
