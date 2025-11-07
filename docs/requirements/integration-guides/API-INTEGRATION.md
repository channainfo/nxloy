# API Integration Guide

**Version**: 1.0
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

This guide explains how to integrate with NxLoy APIs across all domains. It covers authentication, rate limiting, error handling, and best practices.

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Request/Response Format](#requestresponse-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Pagination](#pagination)
7. [Filtering and Sorting](#filtering-and-sorting)
8. [Webhooks](#webhooks)
9. [SDKs and Client Libraries](#sdks-and-client-libraries)
10. [Best Practices](#best-practices)

---

## Authentication

### JWT Bearer Tokens

All API requests require a valid JWT token in the Authorization header:

```http
GET /api/v1/loyalty/programs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtaining Tokens

**Login Endpoint**:
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "owner@business.com",
  "password": "securepassword"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

### Refreshing Tokens

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

### API Keys (Programmatic Access)

For server-to-server integrations:

```http
GET /api/v1/loyalty/programs
X-API-Key: nxloy_sk_live_abc123...
```

Generate API keys in the dashboard under Settings > API Keys.

---

## API Endpoints

### Base URL

- **Production**: `https://api.nxloy.com`
- **Staging**: `https://api.staging.nxloy.com`
- **Development**: `http://localhost:8000`

### Versioning

All endpoints are versioned: `/api/v1/...`

### Core Domains

| Domain | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/v1/auth` | Authentication and authorization |
| Loyalty | `/api/v1/loyalty` | Loyalty programs, enrollments, points |
| Rewards | `/api/v1/rewards` | Reward catalog and redemptions |
| Customers | `/api/v1/customers` | Customer profiles and segments |
| Partners | `/api/v1/partners` | Partner network management |
| Subscriptions | `/api/v1/subscriptions` | Business subscriptions |

### OpenAPI Specification

Full API documentation available at:
- Interactive docs: `https://api.nxloy.com/docs`
- OpenAPI spec: [/docs/contracts/openapi.yaml](../../contracts/openapi.yaml)

---

## Request/Response Format

### Content Type

All requests and responses use JSON:

```http
Content-Type: application/json
Accept: application/json
```

### Standard Request

```http
POST /api/v1/loyalty/programs
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Coffee Rewards",
  "description": "Earn points on every purchase",
  "ruleType": "POINTS_BASED",
  "config": {
    "pointsPerDollar": 1.5,
    "minPurchaseAmount": 5
  }
}
```

### Standard Response

**Success (2xx)**:
```json
{
  "data": {
    "id": "prog-123",
    "name": "Coffee Rewards",
    "status": "DRAFT",
    "createdAt": "2025-11-07T10:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-07T10:00:01Z",
    "requestId": "req-abc123"
  }
}
```

**Error (4xx/5xx)**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "config.pointsPerDollar",
        "message": "Must be a positive number"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-11-07T10:00:01Z",
    "requestId": "req-abc123"
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request succeeded, no response body |
| 400 | Bad Request | Invalid request payload |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Codes

Common error codes:

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

### Retry Logic

Implement exponential backoff for 5xx errors:

```typescript
async function apiCallWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status < 500) throw new Error('Client error');
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
```

---

## Rate Limiting

### Limits

| Tier | Requests per minute | Burst |
|------|---------------------|-------|
| Free | 60 | 10 |
| Pro | 600 | 100 |
| Enterprise | 6000 | 1000 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 595
X-RateLimit-Reset: 1699372800
```

### Handling Rate Limits

When rate limited (429 response):

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 30 seconds.",
    "retryAfter": 30
  }
}
```

Respect the `Retry-After` header.

---

## Pagination

### Cursor-Based Pagination

```http
GET /api/v1/loyalty/programs?limit=20&cursor=eyJpZCI6InByb2ctMTIzIn0=
```

**Response**:
```json
{
  "data": [...],
  "meta": {
    "hasNext": true,
    "nextCursor": "eyJpZCI6InByb2ctMTQ0In0=",
    "total": 157
  }
}
```

### Parameters

- `limit`: Number of items per page (default: 20, max: 100)
- `cursor`: Opaque cursor for next page

---

## Filtering and Sorting

### Filtering

```http
GET /api/v1/loyalty/programs?status=ACTIVE&industry=COFFEE
```

### Sorting

```http
GET /api/v1/loyalty/programs?sort=-createdAt,name
```

- Prefix with `-` for descending order
- Default: ascending

---

## Webhooks

### Subscribing to Events

Configure webhooks in dashboard: Settings > Webhooks

### Webhook Payload

```http
POST https://your-server.com/webhooks/nxloy
Content-Type: application/json
X-NxLoy-Signature: sha256=abc123...

{
  "eventId": "evt-123",
  "eventType": "loyalty.points.earned",
  "timestamp": "2025-11-07T10:00:00Z",
  "data": {
    "customerId": "cust-456",
    "programId": "prog-789",
    "pointsEarned": 50
  }
}
```

### Verifying Signatures

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## SDKs and Client Libraries

### Official SDKs

- **JavaScript/TypeScript**: `npm install @nxloy/sdk`
- **Python**: `pip install nxloy`
- **Ruby**: `gem install nxloy`
- **PHP**: `composer require nxloy/sdk`

### Example (TypeScript SDK)

```typescript
import { NxLoyClient } from '@nxloy/sdk';

const client = new NxLoyClient({
  apiKey: process.env.NXLOY_API_KEY,
});

// Create loyalty program
const program = await client.loyalty.programs.create({
  name: 'Coffee Rewards',
  ruleType: 'POINTS_BASED',
  config: {
    pointsPerDollar: 1.5,
  },
});

// Earn points
await client.loyalty.enrollments.earnPoints({
  customerId: 'cust-123',
  programId: program.id,
  points: 50,
});
```

---

## Best Practices

### 1. Always Use HTTPS

Never make API calls over HTTP in production.

### 2. Store API Keys Securely

- Use environment variables
- Never commit keys to version control
- Rotate keys regularly

### 3. Implement Idempotency

Use `Idempotency-Key` header for safe retries:

```http
POST /api/v1/loyalty/programs
Idempotency-Key: unique-request-id-123
```

### 4. Handle Errors Gracefully

Always check response status and handle errors:

```typescript
try {
  const response = await fetch('/api/v1/loyalty/programs', options);
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

### 5. Use Webhooks for Real-Time Updates

Don't poll APIs. Subscribe to webhooks for event-driven updates.

### 6. Cache Responses Where Appropriate

Cache stable data (templates, tier definitions) to reduce API calls.

### 7. Respect Rate Limits

Implement backoff strategies and batch requests when possible.

### 8. Keep SDKs Updated

Regularly update official SDKs to get bug fixes and new features.

---

## Support

- **Documentation**: https://docs.nxloy.com
- **API Status**: https://status.nxloy.com
- **Support Email**: api-support@nxloy.com
- **Slack Community**: #api-help

---

**Document Owner**: API Team
**Last Updated**: 2025-11-07
