# NxLoy Business Requirements

This directory contains business requirements and specifications for the NxLoy loyalty platform.

## Vision

NxLoy aims to be the **most flexible and developer-friendly loyalty platform** that supports:
- Custom workflows per industry
- Multi-tenancy and white-label capabilities
- **Unified wallet with multi-tender redemption** (NEW v2.0.0)
- **Viral growth mechanics and social features** (NEW v2.0.0)
- AI-powered recommendations
- Blockchain-based digital rewards
- Seamless omnichannel experiences

## Target Users

### 1. Business Owners
- Small to enterprise businesses
- Need loyalty programs to retain customers
- Want industry-specific templates
- Require white-label branding
- Need analytics and insights

### 2. Customers (End Users)
- Earn rewards through purchases
- Redeem rewards for benefits
- Track loyalty status across channels
- Receive personalized offers
- Seamless mobile and web experience

### 3. Developers
- Platform integrators
- Custom workflow builders
- API consumers
- Third-party app developers

## Core Requirements

### 1. Industry Templates

**Requirement**: Support **21 predefined industries** with customized loyalty programs.

**Industries**:
1. COFFEE - Coffee shops, cafes
2. CAR_WASH - Auto detailing, car wash services
3. RETAIL - General retail stores
4. ECOMMERCE - Online shopping platforms
5. RESTAURANTS - Dining establishments
6. FITNESS - Gyms, fitness studios
7. SALON_BEAUTY - Hair salons, beauty services
8. HOTEL_HOSPITALITY - Hotels, resorts
9. COWORKING - Shared workspace providers
10. BANKING_FINANCE - Financial services
11. HEALTHCARE - Medical practices, clinics
12. SUBSCRIPTION_BOX - Recurring subscription services
13. PROFESSIONAL_SERVICES - Consulting, legal, accounting
14. PET_SERVICES - Pet grooming, veterinary
15. EDUCATION - Schools, courses, training
16. AIRLINES_TRAVEL - Travel agencies, airlines
17. SAAS - Software as a Service
18. ENTERTAINMENT - Theaters, events, venues
19. GAMING - Game stores, gaming platforms
20. STREAMING - Media streaming services
21. OTHER - Custom industry configurations

**Per-Industry Features**:
- Default loyalty rule types
- Pre-configured reward tiers
- Industry-specific terminology
- Recommended reward values
- Template campaigns

### 2. Loyalty Rule Types

**Requirement**: Support **6 flexible loyalty rule types** that can be combined.

**Rule Types**:

1. **POINTS_BASED**
   - Earn points per dollar spent
   - Configurable point-to-dollar ratio
   - Point expiration rules
   - Bonus point multipliers
   - Example: Earn 1 point per $1 spent

2. **PUNCH_CARD**
   - Traditional stamp/punch card digitized
   - Configurable punches to reward
   - Single or multiple rewards
   - Example: Buy 10 coffees, get 1 free

3. **AMOUNT_SPENT**
   - Spend-based milestones
   - Cumulative or rolling windows
   - Progressive rewards
   - Example: Spend $100, get $10 off

4. **TIER_BASED**
   - Bronze, Silver, Gold, Platinum tiers
   - Automatic tier progression
   - Tier-specific benefits
   - Tier maintenance rules
   - Example: Gold members get 20% off

5. **VISIT_FREQUENCY**
   - Reward based on visit count
   - Time-window based (weekly, monthly)
   - Consecutive visit bonuses
   - Example: Visit 5 times this month, get reward

6. **STAMP_CARD**
   - Similar to punch card but for specific items
   - Item-specific tracking
   - Mix-and-match capabilities
   - Example: Collect 5 different menu items

### 3. Multi-Tenancy

**Requirements**:
- Single platform, multiple businesses (tenants)
- Complete data isolation per tenant
- Tenant-specific configurations
- Shared infrastructure, isolated data
- Tenant onboarding workflow
- Tenant admin interfaces

**Tenant Capabilities**:
- Custom branding (logo, colors, fonts)
- Industry selection
- Loyalty rule configuration
- Staff management
- Customer database
- Analytics dashboard
- API access

### 4. White-Label Support

**Requirements**:
- Custom domain per tenant
- Branded mobile apps
- Customizable email templates
- Custom SMS sender names
- Tenant-specific assets (images, videos)
- Configurable feature flags per tenant

### 5. Custom Workflows

**Requirements**:
- Visual workflow builder (future)
- Conditional logic (if/then/else)
- Trigger-based automation
- Multi-step workflows
- Industry-specific workflow templates

**Workflow Examples**:
- Customer signs up → Send welcome email → Award bonus points
- Customer birthday → Send birthday offer → Track redemption
- Tier upgrade → Send congratulations → Unlock benefits
- Inactive customer (30 days) → Send re-engagement offer

### 6. Customer Management

**Requirements**:
- Customer profile management
- Transaction history tracking
- Reward balance tracking
- Customer segmentation
- Communication preferences
- Opt-in/opt-out management
- GDPR compliance (data export, deletion)

### 7. Rewards & Redemption

**Requirements**:
- Flexible reward definitions
- Multiple reward types (discount, free item, cashback)
- Reward expiration rules
- Redemption tracking
- Redemption limits (per customer, per time period)
- Partial redemption support
- **Multi-tender redemption** (NEW v2.0.0): Combine points + store credit + digital rewards + cash
- **FIFO redemption logic** (NEW v2.0.0): Earliest expiring balance used first

### 8. Analytics & Reporting

**Requirements**:
- Customer lifetime value (CLV)
- Program performance metrics
- Redemption rates
- Customer retention rates
- Engagement analytics
- Revenue attribution
- Export capabilities (CSV, PDF)
- **Wallet analytics** (NEW v2.0.0): Breakage revenue, multi-tender usage, FIFO efficiency
- **Viral growth analytics** (NEW v2.0.0): K-factor, referral conversion, viral loops
- **Content performance** (NEW v2.0.0): Template usage, A/B test results
- **Social engagement metrics** (NEW v2.0.0): UGC volume, challenge participation, influencer ROI

### 9. Integrations

**Requirements**:
- RESTful API
- Webhooks for events
- Point-of-Sale (POS) integrations
- Payment gateway integrations
- Email service providers (SendGrid, Mailgun)
- SMS providers (Twilio)
- CRM integrations (Salesforce, HubSpot)

### 10. Security & Compliance

**Requirements**:
- Role-based access control (RBAC)
- JWT authentication
- OAuth 2.0 support
- Data encryption at rest and in transit
- PCI DSS compliance for payment data
- GDPR compliance
- SOC 2 Type II (future)
- Regular security audits

### 11. AI/MCP Features

**Requirements**:
- AI-powered customer segmentation
- Personalized offer recommendations
- Churn prediction
- Optimal reward value calculation
- Natural language query support
- Model Context Protocol integration

### 12. Blockchain/NFT Features

**Requirements**:
- Digital reward tokens (NFTs)
- Blockchain-based ownership verification
- Transferable rewards (optional)
- Immutable transaction ledger
- Smart contract-based reward rules
- Multi-chain support (Ethereum, Polygon)

## Non-Functional Requirements

### Performance
- API response time < 200ms (p95)
- Page load time < 2 seconds
- Support 10,000 concurrent users
- Handle 1M+ transactions per day

### Scalability
- Horizontal scaling for all services
- Auto-scaling based on load
- Database read replicas
- CDN for static assets

### Availability
- 99.9% uptime SLA
- Multi-region deployment
- Automated failover
- Regular backups (hourly incremental, daily full)

### Monitoring
- Real-time metrics (Prometheus)
- Distributed tracing (OpenTelemetry)
- Error tracking (Sentry)
- Log aggregation (ELK Stack)
- Uptime monitoring (Pingdom)

## Feature Roadmap

### Phase 1: Foundation (Months 1-3)
- [ ] Core backend API (auth, customers, loyalty)
- [ ] Basic web dashboard
- [ ] 5 industry templates
- [ ] 3 loyalty rule types (points, punch card, amount spent)
- [ ] PostgreSQL + Redis setup
- [ ] **Unified Wallet** (NEW v2.0.0): Store credit, digital rewards, multi-tender redemption

### Phase 2: Enhanced Features (Months 4-6)
- [ ] Remaining 16 industry templates
- [ ] Remaining 3 loyalty rule types
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Email/SMS notifications
- [ ] **Content Management** (NEW v2.0.0): Template library, A/B testing, personalization
- [ ] **Viral Growth - Phase 1** (NEW v2.0.0): Referral tracking, dual-sided rewards, share buttons

### Phase 3: AI & Automation (Months 7-9)
- [ ] AI/MCP server
- [ ] Personalized recommendations
- [ ] Churn prediction
- [ ] Workflow automation engine
- [ ] Visual workflow builder
- [ ] **Viral Growth - Phase 2** (NEW v2.0.0): Advanced viral mechanics, gamification, challenges

### Phase 4: Blockchain (Months 10-12)
- [ ] NFT reward system
- [ ] Smart contracts
- [ ] Wallet integration
- [ ] Multi-chain support

### Phase 5: Social & Community + Enterprise (Year 2) **(UPDATED v2.0.0)**
- [ ] **Social Feed & Sharing** (NEW v2.0.0): Instagram-style feed, UGC, reactions
- [ ] **Group Challenges** (NEW v2.0.0): Team competitions, leaderboards, shared rewards
- [ ] **Influencer Programs** (NEW v2.0.0): Micro-influencer partnerships, brand ambassadors
- [ ] SOC 2 Type II certification
- [ ] Advanced RBAC
- [ ] Audit logs
- [ ] Custom integrations platform
- [ ] Marketplace for third-party apps

## Success Metrics

### Business Metrics
- Number of active tenants
- Monthly recurring revenue (MRR)
- Customer retention rate per tenant
- Average program engagement rate
- API usage growth

### Technical Metrics
- API uptime
- Response time (p50, p95, p99)
- Error rate
- Build success rate
- Test coverage (>80%)

## Related Documentation

- [Architecture](../architecture/) - System architecture
- [ADRs](../adr/) - Architecture decisions
- [API Documentation](../../apps/backend/docs/) - API specs
