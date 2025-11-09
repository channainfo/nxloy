# Deployment Guide

**Version**: 1.0
**Last Updated**: 2025-11-07
 (NxLoy Platform)

## Overview

This guide covers deployment strategies, CI/CD pipelines, and infrastructure management for the NxLoy platform.

## Infrastructure Stack

- **Container Orchestration**: Kubernetes (GKE/EKS/AKS)
- **Container Registry**: Docker Hub / GCR
- **CI/CD**: GitHub Actions
- **IaC**: Terraform (optional)
- **Load Balancer**: NGINX Ingress
- **CDN**: CloudFlare

## Environments

| Environment | URL | Purpose | Database |
|-------------|-----|---------|----------|
| Development | http://localhost:8000 | Local development | Local PostgreSQL |
| Staging | https://staging.nxloy.com | Pre-production testing | RDS (staging) |
| Production | https://app.nxloy.com | Live production | RDS (production) |

## Deployment Strategy

### Blue-Green Deployment

Minimize downtime with zero-downtime deployments:

1. Deploy new version (Green) alongside current (Blue)
2. Run health checks on Green
3. Switch traffic from Blue to Green
4. Monitor for errors
5. Keep Blue ready for rollback

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nxloy-backend-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nxloy-backend
      version: green
  template:
    metadata:
      labels:
        app: nxloy-backend
        version: green
    spec:
      containers:
      - name: backend
        image: nxloy/backend:v2.0.0
        ports:
        - containerPort: 8000
```

### Canary Deployment

Gradually roll out to subset of users:

```yaml
# Canary service (10% traffic)
apiVersion: v1
kind: Service
metadata:
  name: nxloy-backend-canary
spec:
  selector:
    app: nxloy-backend
    version: canary
  ports:
  - port: 80
    targetPort: 8000

# NGINX Ingress with traffic split
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: nx affected:test
      - run: nx affected:lint
      - run: nx affected:build

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - uses: docker/build-push-action@v4
        with:
          context: .
          file: apps/backend/Dockerfile
          push: true
          tags: nxloy/backend:${{ github.sha }},nxloy/backend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
      - run: |
          gcloud container clusters get-credentials nxloy-cluster --region us-central1
          kubectl set image deployment/nxloy-backend \
            backend=nxloy/backend:${{ github.sha }}
          kubectl rollout status deployment/nxloy-backend
          kubectl rollout history deployment/nxloy-backend

  smoke-test:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl --fail https://api.nxloy.com/health || exit 1
```

## Kubernetes Configuration

### Deployment

```yaml
# kubernetes/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nxloy-backend
  namespace: production
spec:
  replicas: 3
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
        image: nxloy/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: url
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nxloy-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nxloy-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nxloy-backend
spec:
  selector:
    app: nxloy-backend
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nxloy-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.nxloy.com
    secretName: nxloy-tls
  rules:
  - host: api.nxloy.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nxloy-backend
            port:
              number: 80
```

## Database Migrations

### Pre-Deployment

Run migrations before deploying new code:

```yaml
# Migration job
apiVersion: batch/v1
kind: Job
metadata:
  name: prisma-migrate-${{ github.sha }}
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: nxloy/backend:${{ github.sha }}
        command: ["npx", "prisma", "migrate", "deploy"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
      restartPolicy: Never
```

## Secrets Management

### Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  url: <base64-encoded-database-url>
```

### External Secrets Operator

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: db-credentials
  data:
  - secretKey: url
    remoteRef:
      key: nxloy/prod/database-url
```

## Rollback Procedure

### Automated Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/nxloy-backend

# Rollback to specific revision
kubectl rollout undo deployment/nxloy-backend --to-revision=2

# Check status
kubectl rollout status deployment/nxloy-backend
```

### Manual Rollback

```bash
# Re-deploy previous version
kubectl set image deployment/nxloy-backend \
  backend=nxloy/backend:v1.9.0

# Verify
kubectl get pods
```

## Disaster Recovery

### Backup Strategy

```bash
# Daily database backups
0 2 * * * pg_dump -U postgres nxloy_prod | gzip > /backups/nxloy_$(date +\%Y\%m\%d).sql.gz

# Upload to S3
aws s3 cp /backups/nxloy_$(date +\%Y\%m\%d).sql.gz s3://nxloy-backups/
```

### Restore Procedure

```bash
# Download backup
aws s3 cp s3://nxloy-backups/nxloy_20251107.sql.gz .

# Restore database
gunzip nxloy_20251107.sql.gz
psql -U postgres -d nxloy_prod < nxloy_20251107.sql
```

## Performance Optimization

### CDN Configuration (CloudFlare)

```
Cache Rules:
- GET /api/v1/loyalty/templates → Cache for 5 minutes
- GET /api/v1/loyalty/templates/{id} → Cache for 10 minutes
- Static assets (/assets/*) → Cache for 1 year
```

### Redis Caching

```typescript
// Cache template list
const templates = await cache.wrap('templates:all', async () => {
  return await prisma.loyaltyRuleTemplate.findMany();
}, { ttl: 300 }); // 5 minutes
```

## References

- [Kubernetes Documentation](https://kubernetes.io/docs)
- [GitHub Actions](https://docs.github.com/actions)
- [Infrastructure Guide](../features/loyalty-templates/INFRASTRUCTURE.md)

---

**Document Owner**: DevOps Team
**Last Updated**: 2025-11-07
