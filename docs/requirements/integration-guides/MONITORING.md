# Monitoring and Observability Guide

**Version**: 1.0
**Last Updated**: 2025-11-07
 (NxLoy Platform)

## Overview

Comprehensive monitoring, logging, and alerting strategy for the NxLoy platform to ensure reliability, performance, and rapid incident response.

## Observability Stack

- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **APM**: Datadog / New Relic
- **Uptime Monitoring**: Pingdom / UptimeRobot
- **Error Tracking**: Sentry
- **Distributed Tracing**: Jaeger / OpenTelemetry

## Metrics Collection

### Prometheus Metrics

```typescript
// metrics.ts
import { Counter, Histogram, Gauge } from 'prom-client';

// HTTP request metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5],
});

// Business metrics
export const pointsEarnedTotal = new Counter({
  name: 'loyalty_points_earned_total',
  help: 'Total loyalty points earned',
  labelNames: ['businessId', 'programId'],
});

export const activeEnrollments = new Gauge({
  name: 'loyalty_active_enrollments',
  help: 'Number of active enrollments',
  labelNames: ['businessId'],
});

// Database metrics
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query latency',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1],
});
```

### Instrumenting Code

```typescript
import { httpRequestsTotal, httpRequestDuration } from './metrics';

@Controller('loyalty/programs')
export class LoyaltyProgramController {
  @Get()
  async list(@Req() req: Request): Promise<LoyaltyProgram[]> {
    const start = Date.now();

    try {
      const programs = await this.programService.list();

      // Record metrics
      httpRequestsTotal.inc({ method: 'GET', route: '/loyalty/programs', status: 200 });
      httpRequestDuration.observe(
        { method: 'GET', route: '/loyalty/programs' },
        (Date.now() - start) / 1000
      );

      return programs;
    } catch (error) {
      httpRequestsTotal.inc({ method: 'GET', route: '/loyalty/programs', status: 500 });
      throw error;
    }
  }
}
```

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'nxloy-backend'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: nxloy-backend
      - source_labels: [__address__]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?
        replacement: $1:8000
```

## Logging

### Structured Logging

```typescript
import { Logger } from '@nestjs/common';

export class EarnPointsService {
  private readonly logger = new Logger(EarnPointsService.name);

  async execute(customerId: string, programId: string, points: number): Promise<void> {
    this.logger.log({
      message: 'Earning points',
      customerId,
      programId,
      points,
      timestamp: new Date().toISOString(),
    });

    try {
      await this.performEarn(customerId, programId, points);

      this.logger.log({
        message: 'Points earned successfully',
        customerId,
        programId,
        points,
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to earn points',
        customerId,
        programId,
        points,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
```

### Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| ERROR | Errors requiring immediate attention | Failed to save enrollment |
| WARN | Potential issues | Rate limit approaching |
| INFO | Significant events | Customer enrolled |
| DEBUG | Detailed diagnostics | Rule evaluation steps |
| TRACE | Extreme detail | Database queries |

### ELK Stack Setup

```yaml
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  json {
    source => "message"
  }

  if [level] == "ERROR" {
    mutate {
      add_tag => ["error"]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "nxloy-logs-%{+YYYY.MM.dd}"
  }
}
```

## Application Performance Monitoring (APM)

### Datadog Integration

```typescript
// main.ts
import tracer from 'dd-trace';

tracer.init({
  service: 'nxloy-backend',
  env: process.env.NODE_ENV,
  version: process.env.APP_VERSION,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
```

### Custom Traces

```typescript
import tracer from 'dd-trace';

async function processEnrollment(enrollment: CustomerEnrollment): Promise<void> {
  const span = tracer.startSpan('enrollment.process', {
    tags: {
      'enrollment.id': enrollment.id,
      'customer.id': enrollment.customerId,
      'program.id': enrollment.programId,
    },
  });

  try {
    await this.validateEnrollment(enrollment);
    await this.saveEnrollment(enrollment);
    await this.publishEvents(enrollment);

    span.setTag('status', 'success');
  } catch (error) {
    span.setTag('error', true);
    span.setTag('error.message', error.message);
    throw error;
  } finally {
    span.finish();
  }
}
```

## Error Tracking

### Sentry Integration

```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Error filter
app.use(Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Only send 5xx errors to Sentry
    return error.status >= 500;
  },
}));
```

### Custom Error Context

```typescript
Sentry.captureException(error, {
  tags: {
    domain: 'loyalty',
    operation: 'earn-points',
  },
  extra: {
    customerId,
    programId,
    points,
  },
  user: {
    id: userId,
    email: userEmail,
  },
});
```

## Alerting

### Alert Rules (Prometheus)

```yaml
# alerts.yml
groups:
  - name: nxloy-alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}% (threshold: 5%)"

      # Slow response time
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P95 response time exceeded"
          description: "P95 response time is {{ $value }}s (threshold: 200ms)"

      # High memory usage
      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}% (threshold: 90%)"

      # Database connection pool exhausted
      - alert: DatabasePoolExhausted
        expr: db_pool_available_connections < 5
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "Only {{ $value }} connections available"
```

### Alert Channels

- **PagerDuty**: Critical production issues
- **Slack**: #alerts channel for all alerts
- **Email**: Engineering team for warnings

## Dashboards

### Grafana Dashboard (Loyalty Domain)

```json
{
  "dashboard": {
    "title": "Loyalty Domain Metrics",
    "panels": [
      {
        "title": "Points Earned (Rate)",
        "targets": [
          {
            "expr": "rate(loyalty_points_earned_total[5m])"
          }
        ]
      },
      {
        "title": "Active Enrollments",
        "targets": [
          {
            "expr": "loyalty_active_enrollments"
          }
        ]
      },
      {
        "title": "API Response Time (P95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds{route=~\"/loyalty/.*\"})"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\",route=~\"/loyalty/.*\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

## Health Checks

### Kubernetes Probes

```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  async check(): Promise<{ status: string }> {
    // Liveness probe: Is the app running?
    return { status: 'ok' };
  }

  @Get('ready')
  async ready(): Promise<{ status: string; checks: any }> {
    // Readiness probe: Is the app ready to serve traffic?
    const dbHealth = await this.checkDatabase();
    const redisHealth = await this.checkRedis();

    if (!dbHealth.ok || !redisHealth.ok) {
      throw new ServiceUnavailableException();
    }

    return {
      status: 'ok',
      checks: {
        database: dbHealth,
        redis: redisHealth,
      },
    };
  }

  private async checkDatabase(): Promise<{ ok: boolean }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch (error) {
      return { ok: false };
    }
  }
}
```

## Uptime Monitoring

### Pingdom Checks

- **API Endpoint**: https://api.nxloy.com/health (every 1 min)
- **Web App**: https://app.nxloy.com (every 1 min)
- **Dashboard**: https://dashboard.nxloy.com (every 5 min)

### Status Page

Public status page: https://status.nxloy.com

Shows:
- API uptime (99.9% SLA)
- Database status
- Recent incidents
- Scheduled maintenance

## Incident Response

### On-Call Rotation

- Primary: 24/7 PagerDuty rotation
- Secondary: Backup engineer
- Escalation: Engineering manager

### Runbook

1. **Acknowledge Alert**: Respond within 5 minutes
2. **Assess Severity**: P0 (critical), P1 (high), P2 (medium), P3 (low)
3. **Investigate**: Check logs, metrics, traces
4. **Mitigate**: Apply fix or rollback
5. **Communicate**: Update status page
6. **Post-Mortem**: Document incident (for P0/P1)

## Key Metrics

### Golden Signals

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| **Latency** (P95) | < 200ms | > 500ms |
| **Error Rate** | < 0.1% | > 1% |
| **Throughput** | 1000 req/s | N/A |
| **Saturation** (CPU) | < 70% | > 90% |

### Business Metrics

- Points earned per day
- Customer enrollments per day
- Redemption rate
- Active programs
- Template usage

## References

- [Prometheus Documentation](https://prometheus.io/docs)
- [Grafana Documentation](https://grafana.com/docs)
- [Datadog APM](https://docs.datadoghq.com/tracing/)

---

**Document Owner**: SRE Team
**Last Updated**: 2025-11-07
