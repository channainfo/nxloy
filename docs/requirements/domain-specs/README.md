# Domain Specifications

**Last Updated**: 2025-11-07
 (NxLoy Platform)

## Overview

This directory contains Domain-Driven Design (DDD) specifications for all bounded contexts in the NxLoy platform. Each domain follows a standardized 9-file structure.

## Domain Structure

Each domain includes:

1. **DOMAIN-OVERVIEW.md** - Purpose, responsibilities, relationships
2. **ENTITIES.md** - All entities with attributes and lifecycles
3. **VALUE-OBJECTS.md** - Immutable value objects with validation
4. **AGGREGATES.md** - Aggregate roots, boundaries, invariants
5. **DOMAIN-SERVICES.md** - Cross-aggregate orchestration
6. **REPOSITORIES.md** - Data persistence abstractions
7. **DOMAIN-EVENTS.md** - Event schemas and publishing
8. **UBIQUITOUS-LANGUAGE.md** - Shared vocabulary
9. **BUSINESS-RULES.md** - Constraints and policies

## Domains

### 1. Loyalty Domain ✅ **COMPLETE** (Master Reference)

**Purpose**: Manage loyalty programs, customer enrollments, points, tiers

**Status**: ✅ Complete (3,200+ lines)

**Documentation**:
- [loyalty/](./loyalty/) - Full DDD specification
- All 9 files completed with examples
- **Use this as the reference template for all other domains**

**Key Concepts**:
- 6 rule types (POINTS_BASED, PUNCH_CARD, etc.)
- 2 aggregates (LoyaltyProgram, CustomerEnrollment)
- 9 domain events
- Point earning/redemption lifecycle

---

### 2. Rewards Domain 📝

**Purpose**: Manage reward catalog, redemption, fulfillment

**Status**: 📝 Reference Implementation

**Documentation**: [rewards/README.md](./rewards/README.md)

**To Do**: Create 9 DDD files using Loyalty domain as template

---

### 3. Customer Management Domain 📝

**Purpose**: Customer profiles, segmentation, preferences

**Status**: 📝 Reference Implementation

**Documentation**: [customer-management/README.md](./customer-management/README.md)

**To Do**: Create 9 DDD files using Loyalty domain as template

---

### 4. Partner Network Domain 📝

**Purpose**: Coalition loyalty, cross-business earning/redemption

**Status**: 📝 Reference Implementation

**Documentation**: [partner-network/README.md](./partner-network/README.md)

**To Do**: Create 9 DDD files using Loyalty domain as template

---

### 5. Subscription Domain 📝

**Purpose**: Business subscriptions, billing, usage tracking

**Status**: 📝 Reference Implementation

**Documentation**: [subscription/README.md](./subscription/README.md)

**To Do**: Create 9 DDD files using Loyalty domain as template

---

### 6. Referrals Domain 📝

**Purpose**: Customer referral programs, tracking, rewards

**Status**: 📝 Reference Implementation

**Documentation**: [referrals/README.md](./referrals/README.md)

**To Do**: Create 9 DDD files using Loyalty domain as template

---

### 7. Blockchain Domain 📝

**Purpose**: NFT rewards, token-based loyalty, smart contracts

**Status**: 📝 Reference Implementation

**Documentation**: [blockchain/README.md](./blockchain/README.md)

**To Do**: Create 9 DDD files using Loyalty domain as template

---

### 8. Auth Domain 📝

**Purpose**: Authentication, authorization, RBAC, sessions

**Status**: 📝 Reference Implementation

**Documentation**: [auth/README.md](./auth/README.md)

**To Do**: Create 9 DDD files using Loyalty domain as template

---

### 9. Viral Growth Domain ✅ **COMPLETE**

**Purpose**: K-factor tracking, viral loop optimization, super referrer management

**Status**: ✅ Complete (2,700+ lines)

**Documentation**: [viral-growth/](./viral-growth/)

**Key Concepts**:
- K-factor calculation (viral coefficient)
- Super referrer identification (top 20%)
- Viral loop tracking (multi-level referrals)
- AI-powered growth recommendations

---

### 10. Content Domain ✅ **COMPLETE**

**Purpose**: UGC/BGC management, AI quality scoring, content moderation

**Status**: ✅ Complete (9-file DDD specification)

**Documentation**: [content/](./content/)

**Key Concepts**:
- UGC collection with AI quality scoring (GPT-4 Vision)
- BGC generation (GPT-4o, DALL-E, HeyGen)
- Automated moderation (AWS Rekognition)
- GDPR-compliant content rights

---

### 11. Social Domain ✅ **COMPLETE**

**Purpose**: Influencer network, viral challenges, social graph analysis

**Status**: ✅ Complete (9-file DDD specification)

**Documentation**: [social/](./social/)

**Key Concepts**:
- AI influencer discovery (10K-50K followers)
- Viral challenges with team competitions
- Match score algorithm (audience overlap)
- Automated partnership outreach (GPT-4o DMs)

---

## Domain Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                       BOUNDED CONTEXTS                      │
└─────────────────────────────────────────────────────────────┘

         ┌─────────────┐
         │    Auth     │ (Foundational)
         └──────┬──────┘
                │
     ┌──────────┼──────────┐
     │                     │
┌────▼────┐         ┌─-────▼─────┐
│Business │         │  Customer  │
│  Mgmt   │         │    Mgmt    │
└────┬────┘         └─────┬──────┘
     │                    │
     │    ┌───────────────┼───────────────┐
     │    │               │               │
┌────▼────▼────┐    ┌─-───▼────┐   ┌──--──▼──────┐
│   Loyalty    │◄───┤ Rewards  │   │ Referrals   │
└──────┬───────┘    └──────────┘   └──────┬──────┘
       │                                  │
       │    ┌─────────────────────────────┘
       │    │
┌──────▼────▼───────┐    ┌──────────────┐
│ Partner Network   │    │ Subscription │
└───────────────────┘    └──────────────┘
       │
       │         ┌─────────────────────────────────────┐
       │         │         VIRAL GROWTH SUITE          │
┌──────▼───────┐ │  ┌──────────────┐  ┌─────────────┐  │
│ Blockchain   │ │  │ Viral Growth │  │   Content   │  │
└──────────────┘ │  │  (K-Factor)  │  │  (UGC/BGC)  │  │
                 │  └───────┬──────┘  └──────┬──────┘  │
                 │          │                │         │
                 │          └────────┬───────┘         │
                 │                   │                 │
                 │          ┌────────▼──────┐          │
                 │          │    Social     │          │
                 │          │ (Influencers, │          │
                 │          │  Challenges)  │          │
                 │          └───────────────┘          │
                 └─────────────────────────────────────┘
```

### Key Dependencies

- **Auth** → All domains (authentication/authorization)
- **Customer Mgmt** → Loyalty, Rewards, Referrals, Viral Growth, Content, Social (customer data)
- **Business Mgmt** → Loyalty, Subscription (business configuration)
- **Loyalty** → Rewards (point balances), Partner Network (cross-business)
- **Blockchain** → Loyalty (token-based programs)
- **Viral Growth** → Referrals, Social, Content (viral metrics from all channels)
- **Content** → Social (UGC for challenges), Viral Growth (UGC sharing metrics)
- **Social** → Viral Growth (influencer/challenge signups), Content (challenge UGC)

---

## How to Use This Documentation

### For Product Managers
1. Read domain OVERVIEW to understand scope
2. Review BUSINESS-RULES for constraints
3. Check UBIQUITOUS-LANGUAGE for terminology

### For Backend Developers
1. Start with AGGREGATES for architecture
2. Implement DOMAIN-SERVICES for orchestration
3. Use REPOSITORIES for persistence
4. Publish DOMAIN-EVENTS for integration

### For Frontend Developers
1. Understand ENTITIES for data structures
2. Review BUSINESS-RULES for validation
3. Use UBIQUITOUS-LANGUAGE for UI copy

### For QA Engineers
1. Review BUSINESS-RULES for test cases
2. Check DOMAIN-EVENTS for integration tests
3. Verify AGGREGATES invariants hold

---

## Implementation Status

| Domain | README | Full Spec (9 files) | Status |
|--------|--------|---------------------|--------|
| **Loyalty** | ✅ | ✅ Complete (3,200+ lines) | Master Reference |
| **Viral Growth** | ✅ | ✅ Complete (2,700+ lines) | P0 (Critical) |
| **Content** | ✅ | ✅ Complete (9 files) | P1 (High Priority) |
| **Social** | ✅ | ✅ Complete (9 files) | P1-P3 (Varies) |
| **Rewards** | ✅ | 📝 Use Loyalty as template | Reference Implementation |
| **Customer Mgmt** | ✅ | 📝 Use Loyalty as template | Reference Implementation |
| **Partner Network** | ✅ | 📝 Use Loyalty as template | Reference Implementation |
| **Subscription** | ✅ | 📝 Use Loyalty as template | Reference Implementation |
| **Referrals** | ✅ | 📝 Use Loyalty as template | Reference Implementation |
| **Blockchain** | ✅ | 📝 Use Loyalty as template | Reference Implementation |
| **Auth** | ✅ | 📝 Use Loyalty as template | Reference Implementation |

**Total**: 11 READMEs + 4 complete specifications (Loyalty: 3,200+ lines, Viral Growth: 2,700+ lines, Content: 9 files, Social: 9 files)

**Viral Growth Suite Domains** (27 files total): ✅ **COMPLETE**

---

## DDD Principles

### 1. Ubiquitous Language
Use shared vocabulary between domain experts and developers

### 2. Bounded Contexts
Each domain has clear boundaries and responsibilities

### 3. Aggregates
Group entities that change together into consistency boundaries

### 4. Domain Events
Communicate significant occurrences between domains

### 5. Repositories
Abstract persistence layer from domain logic

### 6. Domain Services
Encapsulate business logic spanning multiple aggregates

---

## References

### Domain-Driven Design
- [Eric Evans: DDD Book](https://www.domainlanguage.com/)
- [Vaughn Vernon: Implementing DDD](https://vaughnvernon.com/)
- [Martin Fowler: DDD](https://martinfowler.com/bliki/DomainDrivenDesign.html)

### Platform Documentation
- [Business Requirements](../BUSINESS-REQUIREMENTS.md)
- [Use Cases](../USE-CASES.md)
- [Feature Specifications](../features/)
- [Architecture Decision Records](../../adr/)
- [API Contracts](../../contracts/)

---

## Team Contacts

- **DDD Lead**: Architecture Team
- **Domain Owners**: See individual domain READMEs
- **Slack**: #architecture
- **Email**: architecture@nxloy.com

---

**Status**: ✅ Phase 5 foundation complete. Loyalty domain is the master reference for all 8 domains.
