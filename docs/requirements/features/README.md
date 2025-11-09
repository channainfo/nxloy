# Feature Documentation Guide

**Version**: 2.0.0
**Last Updated**: 2025-11-09

**v2.0.0 Updates**:
- Added Unified Wallet features (store credit, digital rewards, multi-tender redemption)
- Added Viral Growth Suite (UGC, Challenges, Influencer Network, Analytics)
- Added Social & Community features (Phase 5)
- Reorganized viral growth documentation into dedicated meta-directory


## Overview

This directory contains comprehensive documentation for all NxLoy platform features. Each feature follows a **9-file documentation structure** to ensure complete coverage for all teams.

## Documentation Structure

Each feature directory contains:

1. **FEATURE-SPEC.md** ✅ Complete for all 6 features
   - Problem statement, solution summary, success criteria
   - User stories with acceptance criteria
   - Functional and non-functional requirements
   - UX flows, wireframes, technical design
   - Dependencies, testing strategy, rollout plan
   - Monitoring, risks, stakeholders, timeline

2. **CONTRACTS.md** ✅ Template in `loyalty-templates/`
   - OpenAPI REST API specifications
   - AsyncAPI event specifications
   - Request/response examples
   - Validation rules, error handling
   - Rate limiting, caching, CORS

3. **BACKEND.md** ✅ Template in `loyalty-templates/`
   - NestJS module structure
   - Prisma schema and migrations
   - Service, controller, repository layers
   - DTOs with validation
   - Seeding scripts
   - Unit and E2E tests
   - Performance optimization

4. **WEB.md** ✅ Template in `loyalty-templates/`
   - Next.js page structure
   - React components
   - API integration with React Query
   - State management
   - UI/UX implementation
   - Testing (Jest, Playwright)

5. **MOBILE.md** ✅ Template in `loyalty-templates/`
   - React Native screens
   - Navigation setup
   - API integration
   - Offline support
   - Platform-specific considerations
   - Testing (Jest, Detox)

6. **AI-MCP.md** ✅ Template in `loyalty-templates/`
   - AI-powered features
   - MCP server implementation
   - ML models and training
   - Prediction APIs
   - Privacy and compliance

7. **BLOCKCHAIN.md** ✅ Template in `loyalty-templates/`
   - NFT rewards implementation
   - Token-based programs
   - Smart contracts
   - Wallet integration
   - Gas optimization
   - Security and compliance

8. **INFRASTRUCTURE.md** ✅ Template in `loyalty-templates/`
   - Architecture diagram
   - Kubernetes deployment
   - Database configuration
   - Cache setup
   - CDN and monitoring
   - CI/CD pipeline
   - Disaster recovery

9. **ACCEPTANCE.feature** ✅ Template in `loyalty-templates/`
   - Gherkin scenarios
   - Happy path tests
   - Edge cases
   - Security tests
   - Performance tests
   - Integration tests

## Reference Implementation

**✅ COMPLETE: Loyalty Templates**

The `loyalty-templates/` directory contains the **master reference implementation** with all 9 files fully documented. Use this as the template for implementing other features.

## Feature Status Matrix

### Core Features (Phase 1-2)

| Feature | FEATURE-SPEC | CONTRACTS | BACKEND | WEB | MOBILE | AI-MCP | BLOCKCHAIN | INFRASTRUCTURE | ACCEPTANCE |
|---------|--------------|-----------|---------|-----|--------|--------|------------|----------------|------------|
| **Loyalty Templates** | ✅ 611 lines | ✅ 446 lines | ✅ 754 lines | ✅ 192 lines | ✅ 177 lines | ✅ 123 lines | ✅ 157 lines | ✅ 242 lines | ✅ 213 lines |
| **Loyalty Programs** | ✅ 1,065 lines | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template |
| **Reward Catalog** | ✅ 1,037 lines | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template |
| **Customer Management** | ✅ 957 lines | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template |
| **Partner Network** | ✅ 858 lines | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template |
| **Subscription Management** | ✅ 987 lines | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template |
| **Referrals** | ✅ Complete | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template | 📝 See template |

### NEW v2.0.0: Unified Wallet (Phase 1)

| Feature | FEATURE-SPEC | CONTRACTS | BACKEND | WEB | MOBILE | AI-MCP | BLOCKCHAIN | INFRASTRUCTURE | ACCEPTANCE |
|---------|--------------|-----------|---------|-----|--------|--------|------------|----------------|------------|
| **Unified Wallet** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending |
| **Store Credit** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | N/A | N/A | 📝 Pending | 📝 Pending |
| **Gift Cards** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | N/A | N/A | 📝 Pending | 📝 Pending |

### NEW v2.0.0: Viral Growth Suite (Phase 2-3)

| Feature | FEATURE-SPEC | CONTRACTS | BACKEND | WEB | MOBILE | AI-MCP | BLOCKCHAIN | INFRASTRUCTURE | ACCEPTANCE |
|---------|--------------|-----------|---------|-----|--------|--------|------------|----------------|------------|
| **UGC & AI Content** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | ✅ Complete | N/A | 📝 Pending | 📝 Pending |
| **Viral Challenges** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | ✅ Complete | N/A | 📝 Pending | 📝 Pending |
| **Influencer Network** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | ✅ Complete | N/A | 📝 Pending | 📝 Pending |
| **Viral Analytics** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | ✅ Complete | N/A | 📝 Pending | 📝 Pending |

**Viral Growth Meta-Documentation**:
- 📚 [Suite Overview](./viral-growth/SUITE-OVERVIEW.md) - Integrated viral growth architecture
- 🗺️ [Implementation Roadmap](./viral-growth/IMPLEMENTATION-ROADMAP.md) - 9-month rollout plan

### NEW v2.0.0: Social & Community (Phase 5)

| Feature | FEATURE-SPEC | CONTRACTS | BACKEND | WEB | MOBILE | AI-MCP | BLOCKCHAIN | INFRASTRUCTURE | ACCEPTANCE |
|---------|--------------|-----------|---------|-----|--------|--------|------------|----------------|------------|
| **Social Community** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending |

### Advanced Features (Phase 4-5)

| Feature | FEATURE-SPEC | CONTRACTS | BACKEND | WEB | MOBILE | AI-MCP | BLOCKCHAIN | INFRASTRUCTURE | ACCEPTANCE |
|---------|--------------|-----------|---------|-----|--------|--------|------------|----------------|------------|
| **Blockchain/NFTs** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | N/A | ✅ Complete | 📝 Pending | 📝 Pending |
| **AI Personalization** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | ✅ Complete | N/A | 📝 Pending | 📝 Pending |
| **Advanced Gamification** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | ✅ Complete | N/A | 📝 Pending | 📝 Pending |
| **Sustainability/ESG** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | ✅ Complete | ✅ Complete | 📝 Pending | 📝 Pending |
| **Voice Assistant** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | ✅ Complete | N/A | 📝 Pending | 📝 Pending |
| **Embedded Finance** | ✅ Complete | 📝 Pending | 📝 Pending | 📝 Pending | 📝 Pending | ✅ Complete | N/A | 📝 Pending | 📝 Pending |

**Legend**:
- ✅ Complete with full content
- 📝 Stub file created (use Loyalty Templates as reference)

## How to Use This Documentation

### For Backend Developers

1. Read `FEATURE-SPEC.md` to understand the feature
2. Review `CONTRACTS.md` for API specifications
3. Implement following `BACKEND.md` guidance
4. Use `loyalty-templates/BACKEND.md` as reference
5. Write tests based on `ACCEPTANCE.feature`

### For Frontend Developers (Web)

1. Read `FEATURE-SPEC.md` for UX requirements
2. Review `CONTRACTS.md` for API integration
3. Implement following `WEB.md` guidance
4. Use `loyalty-templates/WEB.md` as reference
5. Write E2E tests based on `ACCEPTANCE.feature`

### For Mobile Developers

1. Read `FEATURE-SPEC.md` for mobile-specific UX
2. Review `CONTRACTS.md` for API integration
3. Implement following `MOBILE.md` guidance
4. Use `loyalty-templates/MOBILE.md` as reference
5. Write tests based on `ACCEPTANCE.feature`

### For DevOps Engineers

1. Review `INFRASTRUCTURE.md` for deployment requirements
2. Set up Kubernetes manifests, databases, caches
3. Configure monitoring and alerts
4. Use `loyalty-templates/INFRASTRUCTURE.md` as reference

### For QA Engineers

1. Read `FEATURE-SPEC.md` for acceptance criteria
2. Use `ACCEPTANCE.feature` as test plan
3. Write automated tests (Gherkin → executable tests)
4. Verify all scenarios pass before release

## Documentation Standards

### File Format
- Markdown (.md) for prose documentation
- Gherkin (.feature) for acceptance tests
- Code blocks with syntax highlighting
- Clear section headers and TOC

### Naming Conventions
- Feature directories: `kebab-case` (e.g., `loyalty-templates`)
- Files: `UPPER-CASE.md` or `lowercase.feature`
- Consistent across all features

### Content Requirements
- **Author**: Always "Ploy Lab" (or "Ploy Lab (NxLoy Platform)")
- **Date Format**: YYYY-MM-DD
- **Status**: Draft 🟡, Approved 🟢, Deprecated 🔴
- **Priority**: P0 (MVP), P1 (Phase 2), P2 (Phase 3), P3 (Future)

### Cross-References
- Link to related documents (ADRs, contracts, other features)
- Use relative paths: `[ADR-0002](../../adr/0002-contract-first-development.md)`
- Keep references up-to-date

## Creating New Feature Documentation

### Step 1: Create Directory
```bash
mkdir -p docs/requirements/features/new-feature
```

### Step 2: Copy Template
```bash
cp docs/requirements/features/_TEMPLATE/* docs/requirements/features/new-feature/
```

### Step 3: Fill in FEATURE-SPEC.md
- Use `loyalty-templates/FEATURE-SPEC.md` as reference
- Adapt to your specific feature
- Get approval from Product and Engineering leads

### Step 4: Define Contracts
- Create OpenAPI spec in `CONTRACTS.md`
- Define domain events (AsyncAPI)
- Get approval from all consumers (Backend, Web, Mobile)

### Step 5: Implementation Guides
- Fill in `BACKEND.md`, `WEB.md`, `MOBILE.md`
- Reference `loyalty-templates/` for structure
- Include code examples for complex logic

### Step 6: Acceptance Criteria
- Write Gherkin scenarios in `ACCEPTANCE.feature`
- Cover happy paths, edge cases, security, performance
- Use `loyalty-templates/ACCEPTANCE.feature` as guide

### Step 7: Infrastructure & AI
- Document deployment in `INFRASTRUCTURE.md`
- Define AI features in `AI-MCP.md` (if applicable)
- Define blockchain features in `BLOCKCHAIN.md` (if applicable)

### Step 8: Review & Approval
- Get sign-off from all teams
- Update DOCUMENTATION-STATUS.md
- Mark as ✅ Complete

## Maintenance

### Keeping Documentation Current

- **Update on Feature Changes**: When implementation changes, update docs
- **Version Control**: Use Git to track documentation changes
- **Review Cycle**: Quarterly review of all documentation
- **Deprecation**: Mark deprecated features with 🔴 status

### Documentation Debt

If documentation falls behind code:
1. Create GitHub issue: "Update [Feature] Documentation"
2. Assign to feature owner
3. Set deadline: Within 1 sprint
4. Review in next retrospective

## Metrics

### Documentation Coverage (v2.0.0)

**Core Features (Phase 1-2)**:
- **FEATURE-SPEC**: 7/7 (100%) ✅
- **Implementation Docs**: 1/7 (14%) - Use Loyalty Templates as reference

**NEW v2.0.0 Features**:
- **Unified Wallet**: FEATURE-SPEC complete (3/3)
- **Viral Growth Suite**: FEATURE-SPEC + AI-MCP complete (4/4)
- **Social & Community**: FEATURE-SPEC + AI-MCP complete (1/1)
- **Advanced Features**: FEATURE-SPEC complete (6/6)

**Total FEATURE-SPEC Coverage**: 21/21 (100%) ✅

**Overall Status**: ✅ All critical documentation (FEATURE-SPEC + reference templates) complete. Teams can proceed with implementation using Loyalty Templates as the master reference.

## Quick Links

### Master Reference Template
- [Loyalty Templates (COMPLETE)](./loyalty-templates/) - Master reference for all other features
  - [FEATURE-SPEC.md](./loyalty-templates/FEATURE-SPEC.md)
  - [CONTRACTS.md](./loyalty-templates/CONTRACTS.md)
  - [BACKEND.md](./loyalty-templates/BACKEND.md)
  - [WEB.md](./loyalty-templates/WEB.md)
  - [MOBILE.md](./loyalty-templates/MOBILE.md)
  - [AI-MCP.md](./loyalty-templates/AI-MCP.md)
  - [BLOCKCHAIN.md](./loyalty-templates/BLOCKCHAIN.md)
  - [INFRASTRUCTURE.md](./loyalty-templates/INFRASTRUCTURE.md)
  - [ACCEPTANCE.feature](./loyalty-templates/ACCEPTANCE.feature)

### Core Feature Specifications
- [Loyalty Programs](./loyalty-programs/FEATURE-SPEC.md)
- [Reward Catalog](./reward-catalog/FEATURE-SPEC.md)
- [Customer Management](./customer-management/FEATURE-SPEC.md)
- [Partner Network](./partner-network/FEATURE-SPEC.md)
- [Subscription Management](./subscription-management/FEATURE-SPEC.md)
- [Referrals](./referrals/FEATURE-SPEC.md)

### NEW v2.0.0: Unified Wallet (Phase 1)
- [Unified Wallet Overview](./unified-wallet/FEATURE-SPEC.md) - Multi-tender redemption architecture
- [Store Credit](./store-credit/FEATURE-SPEC.md) - Monetary loyalty credits with FIFO redemption
- [Gift Cards](./gift-cards/FEATURE-SPEC.md) - Digital rewards as loyalty benefits

### NEW v2.0.0: Viral Growth Suite (Phase 2-3)
- 📚 **[Suite Overview](./viral-growth/SUITE-OVERVIEW.md)** - Integrated viral growth architecture & revenue model
- 🗺️ **[Implementation Roadmap](./viral-growth/IMPLEMENTATION-ROADMAP.md)** - 9-month priority & sequencing plan
- [UGC & AI Content Automation](./ugc-ai-content/FEATURE-SPEC.md) - Customer content with AI quality scoring
- [Viral Challenges Builder](./viral-challenges/FEATURE-SPEC.md) - TikTok/Instagram challenges with AI trends
- [Influencer Network & Matching](./influencer-network/FEATURE-SPEC.md) - AI-powered micro-influencer discovery
- [Viral Analytics & Growth](./viral-analytics/FEATURE-SPEC.md) - K-factor tracking & super referrer identification

### NEW v2.0.0: Social & Community (Phase 5)
- [Social Community](./social-community/FEATURE-SPEC.md) - Social feed, group challenges, UGC, influencer programs

### Advanced Features (Phase 4-5)
- [Blockchain/NFTs](./blockchain/FEATURE-SPEC.md) - NFT rewards and token-based programs
- [AI Personalization](./ai-personalization/FEATURE-SPEC.md) - ML-based recommendations and churn prediction
- [Advanced Gamification](./advanced-gamification/FEATURE-SPEC.md) - Battle passes, quests, loot boxes
- [Sustainability/ESG](./sustainability/FEATURE-SPEC.md) - Carbon tracking and eco-rewards
- [Voice Assistant](./voice-assistant/FEATURE-SPEC.md) - Alexa, Google Assistant, Siri integration
- [Embedded Finance](./embedded-finance/FEATURE-SPEC.md) - Hybrid payments, BNPL, P2P transfers

### Related Documentation
- [Documentation Status](../DOCUMENTATION-STATUS.md)
- [Business Requirements](../BUSINESS-REQUIREMENTS.md)
- [Product Roadmap](../PRODUCT-ROADMAP.md)
- [Terminology](../TERMINOLOGY.md)
- [Use Cases](../USE-CASES.md)
- [Architecture Decision Records](../../adr/)
- [OpenAPI Contract](../../contracts/openapi.yaml)
- [AsyncAPI Contract](../../contracts/events.asyncapi.yaml)

## Support

For questions or issues with documentation:
- **Owner**: Documentation Team
- **Slack**: #nxloy-docs
- **Email**: docs@nxloy.com
- **GitHub Issues**: Tag with `documentation` label

---

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-09 | 2.0.0 | Added Unified Wallet (3 features), Viral Growth Suite (4 features + meta-docs), Social & Community, reorganized viral growth docs |
| 2025-11-06 | 1.0.0 | Initial feature documentation structure with 6 core features |

---

**Document Owner**: Documentation Team
**Last Updated**: 2025-11-09
**Next Review**: 2025-12-09
