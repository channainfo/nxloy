# Loyalty Templates - API Contracts

**Feature**: Loyalty Templates
**Version**: 1.0.0
**Status**:  Approved
**Last Updated**: 2025-11-06

## Overview

This document defines the API contracts (OpenAPI and AsyncAPI) for the Loyalty Templates feature. These contracts serve as the **source of truth** for:
- Backend implementation (NestJS)
- Frontend implementation (Next.js, React Native)
- API documentation
- Type generation (TypeScript)
- Mock servers (Prism)
- Testing

## OpenAPI Specification

### Base URL

- **Production**: `https://api.nxloy.com/v1`
- **Staging**: `https://staging-api.nxloy.com/v1`
- **Local**: `http://localhost:8000/api/v1`

### Authentication

All endpoints require Bearer token authentication unless marked as "Public".

```
Authorization: Bearer <JWT_TOKEN>
```

---

## REST API Endpoints

### 1. List Loyalty Templates

**Endpoint**: `GET /api/v1/loyalty/templates`

**Description**: Retrieve all available loyalty program templates, optionally filtered by industry.

**Authentication**: Public (no auth required - templates are discoverable)

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `industry` | string | No | Filter by business industry | `COFFEE` |
| `ruleType` | string | No | Filter by rule type | `PUNCH_CARD` |
| `sortBy` | string | No | Sort field | `popularity` |
| `sortOrder` | string | No | Sort direction (`asc` or `desc`) | `desc` |
| `limit` | number | No | Number of results (default: 50) | `20` |
| `offset` | number | No | Pagination offset (default: 0) | `0` |

**Request Example**:

```http
GET /api/v1/loyalty/templates?industry=COFFEE&sortBy=popularity&sortOrder=desc
```

**Response** (`200 OK`):

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Coffee Punch Card",
      "industry": "COFFEE",
      "ruleType": "PUNCH_CARD",
      "description": "Buy 10 coffees, get 1 free",
      "estimatedROI": "15-25% increase in repeat visits",
      "popularity": 847,
      "config": {
        "requiredPunches": 10,
        "reward": {
          "type": "FREE_ITEM",
          "value": "Free coffee"
        },
        "terminology": {
          "cardName": "Coffee Punch Card",
          "earnAction": "Get a punch",
          "progressLabel": "punches earned",
          "rewardLabel": "Free coffee"
        }
      },
      "createdAt": "2025-10-01T00:00:00Z",
      "updatedAt": "2025-10-01T00:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Espresso Points Program",
      "industry": "COFFEE",
      "ruleType": "POINTS_BASED",
      "description": "Earn 10 points per dollar spent, redeem at 100 points",
      "estimatedROI": "20-30% increase in repeat visits",
      "popularity": 623,
      "config": {
        "pointsPerDollar": 10,
        "minimumPurchase": 5.00,
        "rewardThreshold": 100,
        "terminology": {
          "programName": "Espresso Rewards",
          "earnAction": "Earn points",
          "progressLabel": "points earned",
          "rewardLabel": "Rewards"
        }
      },
      "createdAt": "2025-10-01T00:00:00Z",
      "updatedAt": "2025-10-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 21,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

**Response** (`400 Bad Request`):

```json
{
  "error": "BAD_REQUEST",
  "message": "Invalid industry value. Must be one of: COFFEE, RETAIL, RESTAURANT, ...",
  "statusCode": 400
}
```

**TypeScript Types**:

```typescript
interface ListTemplatesRequest {
  industry?: BusinessIndustry;
  ruleType?: LoyaltyRuleType;
  sortBy?: 'popularity' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface ListTemplatesResponse {
  data: LoyaltyRuleTemplate[];
  meta: PaginationMeta;
}

interface LoyaltyRuleTemplate {
  id: string;
  name: string;
  industry: BusinessIndustry;
  ruleType: LoyaltyRuleType;
  description: string;
  estimatedROI: string;
  popularity: number;
  config: TemplateConfig;
  createdAt: string;
  updatedAt: string;
}

enum BusinessIndustry {
  COFFEE = 'COFFEE',
  RETAIL = 'RETAIL',
  RESTAURANT = 'RESTAURANT',
  SALON = 'SALON',
  FITNESS = 'FITNESS',
  AUTOMOTIVE = 'AUTOMOTIVE',
  HOTEL = 'HOTEL',
  HEALTHCARE = 'HEALTHCARE',
  ENTERTAINMENT = 'ENTERTAINMENT',
  EDUCATION = 'EDUCATION',
  PROFESSIONAL_SERVICES = 'PROFESSIONAL_SERVICES',
  ECOMMERCE = 'ECOMMERCE',
  OTHER = 'OTHER'
}

enum LoyaltyRuleType {
  POINTS_BASED = 'POINTS_BASED',
  PUNCH_CARD = 'PUNCH_CARD',
  AMOUNT_SPENT = 'AMOUNT_SPENT',
  TIER_BASED = 'TIER_BASED',
  VISIT_FREQUENCY = 'VISIT_FREQUENCY',
  STAMP_CARD = 'STAMP_CARD'
}
```

---

### 2. Get Template by ID

**Endpoint**: `GET /api/v1/loyalty/templates/{id}`

**Description**: Retrieve detailed information for a specific loyalty template.

**Authentication**: Public

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Template ID |

**Request Example**:

```http
GET /api/v1/loyalty/templates/550e8400-e29b-41d4-a716-446655440001
```

**Response** (`200 OK`):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Coffee Punch Card",
  "industry": "COFFEE",
  "ruleType": "PUNCH_CARD",
  "description": "Buy 10 coffees, get 1 free",
  "estimatedROI": "15-25% increase in repeat visits",
  "popularity": 847,
  "config": {
    "requiredPunches": 10,
    "reward": {
      "type": "FREE_ITEM",
      "value": "Free coffee"
    },
    "terminology": {
      "cardName": "Coffee Punch Card",
      "earnAction": "Get a punch",
      "progressLabel": "punches earned",
      "rewardLabel": "Free coffee"
    }
  },
  "usageStats": {
    "totalProgramsCreated": 847,
    "averageSatisfactionScore": 4.7,
    "averageRedemptionRate": 0.23
  },
  "createdAt": "2025-10-01T00:00:00Z",
  "updatedAt": "2025-10-01T00:00:00Z"
}
```

**Response** (`404 Not Found`):

```json
{
  "error": "NOT_FOUND",
  "message": "Template not found",
  "statusCode": 404
}
```

---

### 3. Create Program from Template

**Endpoint**: `POST /api/v1/loyalty/programs`

**Description**: Create a new loyalty program using a template as the starting point. Allows customization of template configuration.

**Authentication**: Required (Business Owner or Admin)

**Request Body**:

```json
{
  "templateId": "550e8400-e29b-41d4-a716-446655440001",
  "name": "My Coffee Rewards",
  "description": "Buy 12 coffees, get 1 free",
  "locationIds": [],
  "customizations": {
    "requiredPunches": 12,
    "reward": {
      "type": "FREE_ITEM",
      "value": "Free large coffee"
    }
  },
  "enrollmentSettings": {
    "autoEnroll": true,
    "requireConsent": false,
    "selfEnrollEnabled": true
  },
  "activateImmediately": true
}
```

**Response** (`201 Created`):

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440003",
  "businessId": "770e8400-e29b-41d4-a716-446655440004",
  "name": "My Coffee Rewards",
  "description": "Buy 12 coffees, get 1 free",
  "ruleType": "PUNCH_CARD",
  "status": "ACTIVE",
  "templateId": "550e8400-e29b-41d4-a716-446655440001",
  "locationIds": [],
  "config": {
    "requiredPunches": 12,
    "reward": {
      "type": "FREE_ITEM",
      "value": "Free large coffee"
    },
    "terminology": {
      "cardName": "Coffee Punch Card",
      "earnAction": "Get a punch",
      "progressLabel": "punches earned",
      "rewardLabel": "Free large coffee"
    }
  },
  "enrollmentSettings": {
    "autoEnroll": true,
    "requireConsent": false,
    "selfEnrollEnabled": true
  },
  "createdBy": "880e8400-e29b-41d4-a716-446655440005",
  "createdAt": "2025-11-06T10:30:00Z",
  "updatedAt": "2025-11-06T10:30:00Z",
  "activatedAt": "2025-11-06T10:30:00Z"
}
```

**Response** (`400 Bad Request`):

```json
{
  "error": "VALIDATION_ERROR",
  "message": "requiredPunches must be between 2 and 50",
  "statusCode": 400,
  "details": {
    "field": "customizations.requiredPunches",
    "value": 1,
    "constraint": "min:2, max:50"
  }
}
```

**Response** (`403 Forbidden`):

```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to create programs",
  "statusCode": 403
}
```

**TypeScript Types**:

```typescript
interface CreateProgramFromTemplateDto {
  templateId: string;
  name: string;
  description?: string;
  locationIds?: string[];
  customizations?: Partial<TemplateConfig>;
  enrollmentSettings?: EnrollmentConfig;
  activateImmediately?: boolean;
}

interface LoyaltyProgram {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  ruleType: LoyaltyRuleType;
  status: ProgramStatus;
  templateId?: string;
  locationIds: string[];
  config: ProgramConfig;
  enrollmentSettings: EnrollmentConfig;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  pausedAt?: string;
  endedAt?: string;
}

enum ProgramStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED'
}
```

---

## AsyncAPI Specification

### Event Bus Configuration

- **Protocol**: Redis Pub/Sub
- **Development**: `localhost:6379`
- **Staging**: `redis-staging.nxloy.com:6379`
- **Production**: `redis.nxloy.com:6379`

---

### Domain Events

#### 1. Template Used Event

**Channel**: `loyalty.template.used`

**Description**: Published when a business creates a program from a template. Used to track template popularity.

**Publishers**: Loyalty service

**Subscribers**: Analytics service (update template popularity count)

**Payload**:

```json
{
  "eventId": "990e8400-e29b-41d4-a716-446655440006",
  "eventType": "loyalty.template.used",
  "timestamp": "2025-11-06T10:30:00Z",
  "data": {
    "templateId": "550e8400-e29b-41d4-a716-446655440001",
    "templateName": "Coffee Punch Card",
    "programId": "660e8400-e29b-41d4-a716-446655440003",
    "businessId": "770e8400-e29b-41d4-a716-446655440004",
    "customized": true,
    "customizations": {
      "requiredPunches": 12
    }
  },
  "metadata": {
    "source": "loyalty-service",
    "version": "1.0.0"
  }
}
```

**TypeScript Type**:

```typescript
interface TemplateUsedEvent {
  eventId: string;
  eventType: 'loyalty.template.used';
  timestamp: string;
  data: {
    templateId: string;
    templateName: string;
    programId: string;
    businessId: string;
    customized: boolean;
    customizations?: Partial<TemplateConfig>;
  };
  metadata: {
    source: string;
    version: string;
  };
}
```

---

#### 2. Program Created Event

**Channel**: `loyalty.program.created`

**Description**: Published when a loyalty program is created (from template or from scratch).

**Publishers**: Loyalty service

**Subscribers**:
- Analytics service (track program creation)
- Customer service (auto-enroll existing customers if configured)
- Notification service (notify business owner)

**Payload**:

```json
{
  "eventId": "aa0e8400-e29b-41d4-a716-446655440007",
  "eventType": "loyalty.program.created",
  "timestamp": "2025-11-06T10:30:00Z",
  "data": {
    "programId": "660e8400-e29b-41d4-a716-446655440003",
    "businessId": "770e8400-e29b-41d4-a716-446655440004",
    "name": "My Coffee Rewards",
    "ruleType": "PUNCH_CARD",
    "status": "ACTIVE",
    "templateId": "550e8400-e29b-41d4-a716-446655440001",
    "createdBy": "880e8400-e29b-41d4-a716-446655440005",
    "activatedAt": "2025-11-06T10:30:00Z"
  },
  "metadata": {
    "source": "loyalty-service",
    "version": "1.0.0"
  }
}
```

**TypeScript Type**:

```typescript
interface ProgramCreatedEvent {
  eventId: string;
  eventType: 'loyalty.program.created';
  timestamp: string;
  data: {
    programId: string;
    businessId: string;
    name: string;
    ruleType: LoyaltyRuleType;
    status: ProgramStatus;
    templateId?: string;
    createdBy: string;
    activatedAt?: string;
  };
  metadata: {
    source: string;
    version: string;
  };
}
```

---

## Validation Rules

### Template Configuration Validation

**PUNCH_CARD**:
- `requiredPunches`: Integer, min: 2, max: 50
- `punchesPerPurchase`: Integer, min: 1, max: 5 (default: 1)
- `minimumPurchaseForPunch`: Number, min: 0, max: 1000

**POINTS_BASED**:
- `pointsPerDollar`: Number, min: 0.1, max: 100
- `minimumPurchase`: Number, min: 0, max: 1000
- `rewardThreshold`: Integer, min: 10, max: 100000
- `pointsMultiplier`: Number, min: 1.0, max: 5.0

**AMOUNT_SPENT**:
- `spendThresholds`: Array, min length: 1, max length: 10
- Each threshold: `amount` (Number, min: 1, max: 100000)

**TIER_BASED**:
- `tiers`: Array, min length: 2, max length: 6
- Each tier: `threshold` (Number, min: 0)
- Tiers must be in ascending order

**VISIT_FREQUENCY**:
- `requiredVisits`: Integer, min: 2, max: 100
- `timeWindow.value`: Integer, min: 1, max: 365

**STAMP_CARD**:
- `requiredStamps`: Integer, min: 2, max: 20
- `stampCategories`: Array, min length: 2, max length: 10

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "statusCode": 400,
  "details": {
    "field": "config.requiredPunches",
    "value": 100,
    "constraint": "max:50"
  }
}
```

**Common Error Codes**:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | Invalid request parameters or body |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User does not have permission |
| `NOT_FOUND` | 404 | Template or resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Rate Limiting

**Public Endpoints** (template listing):
- 100 requests per minute per IP address
- Header: `X-RateLimit-Limit: 100`
- Header: `X-RateLimit-Remaining: 87`
- Header: `X-RateLimit-Reset: 1699290000`

**Authenticated Endpoints** (program creation):
- 100 requests per minute per business
- Same headers as above

**Response** when rate limit exceeded (`429 Too Many Requests`):

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again in 30 seconds.",
  "statusCode": 429,
  "retryAfter": 30
}
```

---

## Pagination

List endpoints support offset-based pagination:

**Request**:
```
GET /api/v1/loyalty/templates?limit=20&offset=40
```

**Response Meta**:
```json
{
  "meta": {
    "total": 21,
    "limit": 20,
    "offset": 40,
    "hasMore": false
  }
}
```

---

## Caching

**Template List**:
- Cache-Control: `public, max-age=300` (5 minutes)
- ETag: `W/"550e8400-e29b-41d4-a716-446655440001-v2"`
- Last-Modified: `Mon, 01 Oct 2025 00:00:00 GMT`

**Template Detail**:
- Cache-Control: `public, max-age=600` (10 minutes)
- ETag: `"550e8400-e29b-41d4-a716-446655440001-v2"`
- Last-Modified: `Mon, 01 Oct 2025 00:00:00 GMT`

**Conditional Requests**:
```http
GET /api/v1/loyalty/templates/550e8400-e29b-41d4-a716-446655440001
If-None-Match: "550e8400-e29b-41d4-a716-446655440001-v2"
```

**Response** (`304 Not Modified`) if content unchanged.

---

## CORS Configuration

**Allowed Origins**:
- `https://app.nxloy.com` (Production web app)
- `https://staging.nxloy.com` (Staging)
- `http://localhost:8000` (Local backend), `http://localhost:4200` (Local frontend)

**Allowed Methods**: `GET, POST, PUT, PATCH, DELETE, OPTIONS`

**Allowed Headers**: `Content-Type, Authorization, X-Requested-With`

**Exposed Headers**: `X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset`

---

## Contract Testing

### Consumer-Driven Contract Testing

**Provider**: Backend API (NestJS)
**Consumers**:
- Web app (Next.js)
- Mobile app (React Native)

**Test Framework**: Pact

**Example Pact Test** (Consumer - Web):

```typescript
describe('Loyalty Templates API', () => {
  it('should return list of templates', async () => {
    await provider.addInteraction({
      state: 'templates exist',
      uponReceiving: 'a request for coffee templates',
      withRequest: {
        method: 'GET',
        path: '/api/v1/loyalty/templates',
        query: 'industry=COFFEE'
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          data: eachLike({
            id: uuid(),
            name: string('Coffee Punch Card'),
            industry: string('COFFEE'),
            ruleType: string('PUNCH_CARD'),
            popularity: integer(847)
          }),
          meta: {
            total: integer(2),
            limit: integer(50),
            offset: integer(0),
            hasMore: boolean(false)
          }
        }
      }
    });

    const response = await templatesApi.list({ industry: 'COFFEE' });
    expect(response.data).toHaveLength(2);
  });
});
```

---

## Mock Server

**Prism** mock server for local development:

```bash
# Install Prism
npm install -g @stoplight/prism-cli

# Start mock server
prism mock docs/contracts/openapi.yaml -p 3001

# Test endpoint
curl http://localhost:3001/api/v1/loyalty/templates
```

---

## Type Generation

**Generate TypeScript types from OpenAPI**:

```bash
# Install openapi-typescript
npm install -D openapi-typescript

# Generate types
npx openapi-typescript docs/contracts/openapi.yaml -o packages/shared-types/src/generated/api.ts
```

**Usage in Code**:

```typescript
import { components } from '@nxloy/shared-types/generated/api';

type LoyaltyRuleTemplate = components['schemas']['LoyaltyRuleTemplate'];
type CreateProgramDto = components['schemas']['CreateProgramFromTemplateDto'];
```

---

## Contract Change Process

1. **Update Contract**: Modify `openapi.yaml` or `events.asyncapi.yaml`
2. **Version Bump**: Increment version if breaking change
3. **Generate Types**: Run type generation scripts
4. **Update Mock**: Restart Prism mock server
5. **Update Tests**: Update contract tests
6. **Review**: Get approval from all consumers (Web, Mobile)
7. **Deploy**: Backend implements contract, consumers update

**Breaking Changes**: Require major version bump (e.g., v1 � v2)

**Non-Breaking Changes**: Allow minor version bump (e.g., v1.0 � v1.1)

---

## References

- [OpenAPI Specification](../../contracts/openapi.yaml)
- [AsyncAPI Specification](../../contracts/events.asyncapi.yaml)
- [ADR-0002: Contract-First Development](../../adr/0002-contract-first-development.md)
- [Feature Spec](./FEATURE-SPEC.md)

---

**Document Owner**: Backend Team
**Last Updated**: 2025-11-06
**Next Review**: 2025-12-06
