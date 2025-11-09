# NxLoy Business Requirements

**Version**: 2.0.0
**Date**: 2025-11-09
**Status**: Active

**v2.0.0 Updates**:
- Added Unified Wallet capabilities (store credit, digital rewards, multi-tender)
- Added Content Management system requirements
- Added Viral Growth mechanics requirements
- Added Social & Community features (Phase 5)
- Enhanced ASEAN market focus (Cambodia, Singapore)

## Executive Summary

NxLoy is a next-generation, multi-tenant loyalty platform designed to provide businesses across 21 industries with flexible, AI-powered customer retention solutions. The platform combines traditional loyalty mechanisms (points, punch cards, tiers) with modern technologies (unified wallet, viral growth, AI recommendations, social community, blockchain rewards) to maximize customer engagement and business ROI.

### Key Differentiators

1. **Industry-Specific Templates**: Pre-configured loyalty programs for 21 industries
2. **Flexible Rule Engine**: 6 loyalty rule types that can be combined
3. **Unified Wallet**: Multi-tender redemption (points + store credit + digital rewards + cash)
4. **ASEAN-First**: Multi-currency support (8 currencies), Cambodia/Singapore focus
5. **Viral Growth Engine**: Built-in referral mechanics, social sharing, viral loops
6. **Content Management**: Dynamic personalization, multi-language support
7. **AI-Powered**: Intelligent recommendations, churn prediction, personalization
8. **Social-First** (Phase 5): Community features, group challenges, influencer programs
9. **Blockchain-Ready**: NFT rewards and token-based incentives (Phase 4)
10. **Partner Network**: Cross-business reward earning and redemption
11. **White-Label**: Complete branding customization per tenant
12. **Developer-Friendly**: Comprehensive APIs, webhooks, and SDKs

## Vision Statement

**"Empower every business to build world-class loyalty programs without enterprise budgets or technical complexity."**

## Target Market

### Primary Markets

1. **Small to Medium Businesses (SMBs)**
   - 1-50 locations
   - $100K-$10M annual revenue
   - Limited technical resources
   - Need turnkey solutions

2. **Mid-Market Enterprises**
   - 50-500 locations
   - $10M-$500M annual revenue
   - Some technical capability
   - Need customization + support

3. **Enterprise** (Phase 2+)
   - 500+ locations
   - $500M+ annual revenue
   - Dedicated IT teams
   - Need full white-label + API access

### Target Industries (21 Total)

**Tier 1 (MVP - Phase 1)**: 5 industries
- ☕ COFFEE: Coffee shops, cafes, bakeries
- 🏪 RETAIL: General retail stores, boutiques
- 🍽️ RESTAURANTS: Dining establishments, quick service
- 💪 FITNESS: Gyms, yoga studios, fitness centers
- 🛒 ECOMMERCE: Online shopping platforms

**Tier 2 (Phase 2)**: 8 industries
- 🚗 CAR_WASH: Auto detailing, car wash services
- 💇 SALON_BEAUTY: Hair salons, spas, beauty services
- 🏨 HOTEL_HOSPITALITY: Hotels, resorts, B&Bs
- 🏢 COWORKING: Shared workspace providers
- 🐾 PET_SERVICES: Pet grooming, veterinary, pet stores
- 🎓 EDUCATION: Schools, courses, training programs
- 🎭 ENTERTAINMENT: Theaters, events, venues
- 🎮 GAMING: Game stores, gaming platforms

**Tier 3 (Phase 3+)**: 8 industries
- 🏦 BANKING_FINANCE: Banks, credit unions, fintech
- 🏥 HEALTHCARE: Medical practices, clinics, dentists
- 📦 SUBSCRIPTION_BOX: Recurring subscription services
- 👔 PROFESSIONAL_SERVICES: Consulting, legal, accounting
- ✈️ AIRLINES_TRAVEL: Travel agencies, airlines
- 💻 SAAS: Software as a Service platforms
- 📺 STREAMING: Media streaming services
- ⚙️ OTHER: Custom industry configurations

## Core Business Objectives

### 1. Customer Acquisition

**Goal**: Acquire 1,000 paying businesses in Year 1

**Strategy**:
- Industry-specific landing pages and templates
- Free trial (30 days, up to 100 customers)
- Self-service onboarding (< 10 minutes)
- Template marketplace
- Partner referral program

**Success Metrics**:
- Sign-up conversion rate: >5%
- Trial-to-paid conversion: >25%
- Time to first program launch: <24 hours
- Customer acquisition cost (CAC): <$500

### 2. Customer Retention

**Goal**: 90% annual retention rate

**Strategy**:
- Onboarding success program (first 30 days)
- Proactive customer success outreach
- Usage analytics and insights
- ROI reporting (demonstrate value)
- Community and best practices sharing

**Success Metrics**:
- Monthly churn rate: <1%
- Annual retention: >90%
- Net Promoter Score (NPS): >50
- Customer lifetime value (LTV): >$5,000

### 3. Revenue Growth

**Goal**: $10M ARR (Annual Recurring Revenue) in Year 2

**Revenue Streams**:
1. **Subscription Tiers** (SaaS model)
   - Starter: $49/month (up to 500 customers)
   - Growth: $149/month (up to 2,500 customers)
   - Pro: $299/month (up to 10,000 customers)
   - Enterprise: Custom pricing (unlimited)

2. **Usage-Based Pricing** (optional add-ons)
   - SMS notifications: $0.01 per message
   - Email campaigns: $0.001 per email
   - AI recommendations: $0.05 per customer/month
   - Blockchain rewards: $0.10 per NFT minted

3. **Partner Revenue Share**
   - Partner network transactions: 2% commission
   - Marketplace integrations: 15% revenue share

**Success Metrics**:
- Average Revenue Per Account (ARPA): >$150/month
- Month-over-month growth: >10%
- Expansion revenue: >30% of total revenue
- Gross margin: >75%

### 4. Platform Scalability

**Goal**: Support 10,000 businesses and 10M end customers by Year 2

**Requirements**:
- Multi-tenant architecture with complete data isolation
- Horizontal scaling for all services
- Database read replicas and caching (Redis)
- CDN for static assets and images
- Auto-scaling based on traffic patterns

**Success Metrics**:
- API response time: <200ms (p95)
- Page load time: <2 seconds
- Uptime SLA: 99.9%
- Support 10K concurrent users per tenant

## Functional Requirements

### 1. Industry Templates

**Requirement**: Provide 21 pre-configured industry templates

**Business Value**:
- Reduces time to value (business launches program same day)
- Lowers support burden (best practices built-in)
- Increases conversion (businesses see relevant examples)

**Features per Template**:
- Default loyalty rule types recommended
- Industry-specific terminology
- Pre-configured reward tiers
- Template campaigns
- Estimated ROI benchmarks
- Success stories from similar businesses

**Implementation Priority**:
- Phase 1: 5 templates (Coffee, Retail, Restaurants, Fitness, Ecommerce)
- Phase 2: 8 templates (Car Wash, Salon/Beauty, etc.)
- Phase 3: 8 templates (Banking, Healthcare, SaaS, etc.)

### 2. Loyalty Rule Types

**Requirement**: Support 6 flexible loyalty rule types

**Rule Types**:

1. **POINTS_BASED** (Most Common)
   - Earn points per dollar spent
   - Configurable point-to-dollar ratio (default: 10 points per $1)
   - Point expiration rules (optional)
   - Bonus multipliers (2x points events)
   - Minimum purchase thresholds
   - **Use Cases**: Retail, Ecommerce, most industries

2. **PUNCH_CARD** (Simplest)
   - Digital stamp cards (buy X, get Y free)
   - Configurable punches required (default: 10)
   - Single or multiple reward tiers
   - Time-based expiration (optional)
   - **Use Cases**: Coffee shops, car washes, quick service

3. **AMOUNT_SPENT** (Milestone-Based)
   - Spend $X, get $Y reward
   - Cumulative or rolling windows
   - Progressive tiers (spend more, earn more)
   - **Use Cases**: Retail, salons, professional services

4. **TIER_BASED** (Gamification)
   - Bronze → Silver → Gold → Platinum
   - Automatic tier progression
   - Tier-specific benefits (discounts, perks, priority)
   - Tier maintenance rules (annual spend thresholds)
   - **Use Cases**: Airlines, hotels, subscription services

5. **VISIT_FREQUENCY** (Engagement-Focused)
   - Reward based on visit count
   - Time-window based (weekly, monthly, quarterly)
   - Consecutive visit bonuses
   - **Use Cases**: Fitness, restaurants, entertainment

6. **STAMP_CARD** (Item-Specific)
   - Similar to punch card but tracks specific items
   - Mix-and-match capabilities
   - Collection mechanics (collect all 5 menu categories)
   - **Use Cases**: Restaurants, entertainment, education

**Business Value**:
- Flexibility: Businesses choose what fits their model
- Combinable: Can use multiple rule types simultaneously
- Proven patterns: Based on successful real-world programs

### 3. Reward Catalog

**Requirement**: Flexible reward catalog and redemption system

**Features**:
- Reward types: Discount, free item, cashback, partner rewards, NFTs
- Point pricing: Business sets point cost per reward
- Inventory management: Track stock levels
- Redemption limits: Per customer, per time period
- Partial redemption: Use points + cash
- Expiration rules: Time-limited offers
- Dynamic rewards: AI-suggested rewards based on behavior

**Business Value**:
- Drives repeat purchases (customers return to redeem)
- Flexible redemption options increase satisfaction
- Inventory management prevents overselling
- Dynamic rewards maximize redemption rates

### 3a. Unified Wallet (NEW v2.0.0)

**Requirement**: Multi-balance wallet supporting points, store credit, and digital rewards

**Features**:
- **Store Credit**: Monetary value issued as loyalty rewards, refunds, or promotions
  - FIFO redemption (earliest expiration first)
  - Multi-currency support (USD, KHR, SGD, THB, VND, MYR, PHP, IDR)
  - 12-month expiration + 30-day grace period
  - Breakage revenue tracking (IFRS 15 compliance)
  - Methods: promotional, refund, cashback_reward, automated

- **Digital Rewards**: Digital vouchers issued as loyalty benefits
  - Merchant-specific or generic rewards
  - Partner network redemption
  - Same expiration policy as store credit
  - NOT purchased gift cards (Phase 1) - loyalty benefits only

- **Multi-Tender Redemption**: Combine multiple balance types
  - Depletion order: digital rewards → store credit → points → cash
  - Expiration override (use expiring balances first)
  - Saga pattern for transaction atomicity
  - Distributed locking to prevent double-spend

- **Wallet API**: Unified balance view
  - Real-time balance aggregation
  - Expiration warnings (30, 7, 1 days before)
  - Affordability checks (can customer redeem this reward?)
  - Payment recommendations (optimal balance mix)

**Business Value**:
- **Increased Redemption**: More payment options = higher redemption rates
- **Customer Flexibility**: Use rewards how they want (not just points)
- **Breakage Revenue**: Recognize revenue from expired credits (15% average breakage rate)
- **ASEAN Expansion**: Multi-currency support enables regional growth
- **Regulatory Compliance**: Loyalty program structure avoids gift card regulations (Philippines Gift Check Act)

**Target Markets**:
- **Cambodia** (home base): KHR primary currency
- **Singapore** (primary expansion): SGD, regulatory-friendly
- **ASEAN expansion**: Thailand, Vietnam, Malaysia, Philippines, Indonesia

### 4. Customer Management

**Requirement**: Comprehensive customer profile and segmentation

**Features**:
- Customer profiles: Contact info, preferences, visit history
- Transaction history: All purchases and point earnings
- Reward balance: Current points and tier status
- Segmentation: Demographics, behavior, RFM analysis
- Communication preferences: Email, SMS, push notifications
- Opt-in/opt-out management
- GDPR compliance: Data export, deletion, portability

**Business Value**:
- 360° customer view enables personalization
- Segmentation enables targeted campaigns
- Compliance reduces legal risk

### 5. Partner Network

**Requirement**: Cross-business reward earning and redemption

**Features**:
- Partner directory: Discover complementary businesses
- Partner programs: Earn rewards at partner locations
- Cross-redemption: Redeem rewards at partner businesses
- Revenue sharing: Automatic commission distribution
- API integration: Seamless partner data sync
- Partner analytics: Track cross-business engagement

**Use Case Example**:
- Coffee shop customer earns points
- Redeems discount at partner bakery
- Bakery gets new customer
- Coffee shop earns 2% commission
- Customer discovers both businesses

**Business Value**:
- Increases program value (more places to earn/redeem)
- Drives customer acquisition (partner referrals)
- Creates network effects (more partners = more valuable)

### 6. Subscription Management

**Requirement**: Subscription plans and billing management

**Features**:
- 3-tier subscription model (Starter, Growth, Pro)
- Self-service plan upgrades/downgrades
- Usage-based billing (SMS, emails, AI features)
- Invoice generation and payment processing
- Payment method management
- Automatic billing and receipts
- Subscription analytics (churn, MRR, expansion)

**Business Value**:
- Predictable recurring revenue
- Self-service reduces support burden
- Usage-based pricing scales with customer success

### 7. Referral Programs

**Requirement**: Built-in referral mechanics for customer acquisition

**Features**:
- Referral code generation (unique per customer)
- Referral tracking (attribute sign-ups to referrers)
- Dual-sided rewards (referrer + referred both earn)
- Configurable completion criteria (signup, first purchase, spend $X)
- Referral leaderboards and gamification
- Fraud detection (prevent self-referrals)

**Business Value**:
- Reduces customer acquisition cost
- Leverages word-of-mouth marketing
- Increases customer engagement (advocacy)

### 7a. Viral Growth Engine (NEW v2.0.0)

**Requirement**: Systematic viral mechanics to drive organic growth

**Phase 2 Features** (Basic):
- **Referral Campaigns**: Milestone-based referrals (invite 3 friends, get bonus)
- **Share Buttons**: One-click sharing to social media
- **Viral Loops**: "Invite friends to unlock group reward"
- **Viral Coefficient Tracking**: Measure K-factor (invites per user × conversion rate)
- **Fraud Detection**: Prevent duplicate accounts, self-referrals

**Phase 3 Features** (Advanced):
- **Social Sharing Incentives**: "Share achievement for 50 bonus points"
- **Influencer Partnerships**: Micro-influencer referral programs
- **Network Effects Analytics**: Track viral growth patterns
- **A/B Testing**: Test different viral mechanics
- **Viral Campaign Builder**: Businesses create custom viral campaigns

**Business Value**:
- **Lower CAC**: Viral growth reduces paid acquisition costs (target: 40% organic growth)
- **Faster Growth**: Exponential vs. linear customer acquisition
- **Higher Quality Leads**: Referred customers have 37% higher retention
- **Social Proof**: Visible social activity builds trust
- **Competitive Moat**: Network effects create defensibility

**Success Metrics**:
- Viral coefficient (K-factor): >0.5 (each user brings 0.5+ new users)
- Referral conversion rate: >15%
- Referral customer LTV: 1.5x vs. organic
- Share rate: >10% of transactions shared socially

### 7b. Content Management (NEW v2.0.0)

**Requirement**: Centralized content system for personalized marketing

**Phase 2 Features**:
- **Content Library**: Repository for all marketing assets
  - Email templates (welcome, reward earned, expiration reminder)
  - SMS templates (short, actionable messages)
  - Push notification templates
  - In-app message templates

- **Dynamic Personalization**: Variable insertion (name, points, tier, etc.)
- **A/B Testing**: Test subject lines, copy, CTAs
- **Multi-Language Support**: Localized content per region (EN, KH, TH, VN, etc.)
- **Content Scheduling**: Schedule campaigns in advance
- **Template Marketplace**: Pre-built templates per industry

**Phase 3 Features**:
- **AI Content Generation**: Auto-generate personalized copy
- **Content Performance Analytics**: Track open rates, click rates, conversions
- **Visual Content Builder**: Drag-and-drop email builder
- **Content Governance**: Approval workflows for brand compliance
- **User-Generated Content (UGC)**: Customer reviews, photos, testimonials

**Business Value**:
- **Consistency**: Unified brand voice across all channels
- **Efficiency**: Reusable templates save time (80% faster campaign creation)
- **Personalization**: Higher engagement (2-3x open rates with personalization)
- **Localization**: Reach non-English speakers (60% of ASEAN population)
- **Compliance**: Approved templates reduce legal risk

### 7c. Social & Community Features (Phase 5) (NEW v2.0.0)

**Requirement**: Social-first loyalty experiences for Gen Z/Alpha demographics

**Features**:
- **Social Feed**: Instagram-style feed for customer achievements
  - Share purchases, rewards, badges
  - Like, comment, react on posts
  - User-generated content (photos, reviews)
  - Content moderation (AI + manual review)

- **Group Challenges**: Team-based competitions
  - "Coffee Crew Challenge: Buy 50 coffees as a team this month"
  - Real-time progress tracking
  - Team leaderboards
  - Shared rewards distribution

- **Gifting & Social Commerce**:
  - Send rewards/points to friends
  - Gift digital rewards to others
  - Social wish lists (save favorite rewards)
  - Group purchases (split bills for rewards)

- **Influencer Programs**:
  - Micro-influencer partnerships
  - Brand ambassador programs
  - Exclusive community perks
  - Influencer analytics dashboard

- **Community Events**: Virtual and in-person meetups for loyalty members

**Business Value**:
- **Gen Z Engagement**: 66% of Gen Z prefer brands with community features
- **Viral Amplification**: Social features drive 3x more word-of-mouth
- **Emotional Connection**: Community builds loyalty beyond transactions
- **Content Creation**: UGC reduces marketing content costs by 50%
- **Retention**: Social users have 2-3x higher retention rates

**Success Metrics**:
- Social engagement rate: >25% of active users
- UGC submissions: >10 per week per 100 customers
- Challenge participation: >30% of customers
- Influencer partnerships: 10+ micro-influencers per vertical

### 8. Analytics & Reporting

**Requirement**: Actionable insights for business decision-making

**Metrics**:
- Customer Lifetime Value (CLV)
- Program performance (enrollment, engagement, redemption rates)
- Retention rates (cohort analysis)
- Revenue attribution (loyalty program impact)
- Churn prediction (at-risk customers)
- ROI calculator (program cost vs. revenue)
- **Wallet Analytics** (NEW v2.0.0): Breakage revenue, multi-tender usage, FIFO efficiency
- **Viral Growth Analytics** (NEW v2.0.0): K-factor, referral conversion, viral loops
- **Content Performance** (NEW v2.0.0): Template usage, A/B test results, personalization lift
- **Social Engagement** (NEW v2.0.0): UGC volume, challenge participation, influencer ROI

**Reports**:
- Executive dashboard (high-level KPIs)
- Customer segments (who are your best customers?)
- Campaign performance (which offers work best?)
- Trend analysis (growth over time)
- Benchmark reports (compare to industry averages)
- **Wallet Breakage Report** (NEW v2.0.0): Expired credits, revenue recognition timeline
- **Viral Growth Dashboard** (NEW v2.0.0): Referral funnels, share rates, viral coefficient
- **Social Engagement Report** (NEW v2.0.0): Community health, UGC analytics, influencer performance

**Export Formats**: CSV, PDF, scheduled email delivery

**Business Value**:
- Data-driven decisions (test and optimize programs)
- Demonstrates ROI (justifies program investment)
- Identifies opportunities (underperforming segments, trending products)
- **Breakage Revenue Visibility**: Track expired credits and revenue recognition (IFRS 15)
- **Viral Growth Insights**: Optimize referral programs for exponential growth
- **Content Effectiveness**: Measure personalization lift and template performance

## Non-Functional Requirements

### 1. Performance

| Metric | Requirement | Rationale |
|--------|-------------|-----------|
| API Response Time | <200ms (p95) | Fast API = good UX for mobile apps |
| Page Load Time | <2 seconds | Retention: users abandon slow sites |
| Database Query Time | <50ms (p95) | Efficient queries prevent bottlenecks |
| Concurrent Users | 10K per tenant | Support large businesses |
| Daily Transactions | 1M+ | High-volume retail/ecommerce |

### 2. Scalability

- **Horizontal Scaling**: All services scale independently
- **Database**: Read replicas, connection pooling, sharding (future)
- **Caching**: Redis for sessions, API responses, frequently accessed data
- **CDN**: CloudFlare for static assets, images, fonts
- **Auto-Scaling**: CPU/memory thresholds trigger new instances

### 3. Availability

- **Uptime SLA**: 99.9% (8.76 hours downtime/year max)
- **Multi-Region**: Primary + DR region (Phase 2)
- **Automated Failover**: <5 minutes recovery time
- **Backups**: Hourly incremental, daily full, 30-day retention
- **Disaster Recovery**: RPO <1 hour, RTO <4 hours

### 4. Security

- **Authentication**: JWT tokens, OAuth 2.0, 2FA (optional)
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Data Isolation**: Complete tenant separation
- **Compliance**: GDPR, PCI DSS (for payment data), SOC 2 (Phase 3)
- **Penetration Testing**: Quarterly security audits
- **Vulnerability Scanning**: Automated (Snyk, Dependabot)

### 5. Monitoring & Observability

- **Metrics**: Prometheus + Grafana
- **Logs**: Centralized logging (ELK stack or CloudWatch)
- **Tracing**: Distributed tracing (OpenTelemetry)
- **Alerts**: PagerDuty for critical issues
- **Uptime Monitoring**: Pingdom, StatusPage.io
- **Error Tracking**: Sentry for application errors

## User Personas

### 1. Business Owner (Primary User)

**Profile**:
- Age: 30-55
- Role: Owner, General Manager
- Technical Skill: Low to medium
- Goals: Increase revenue, retain customers, compete with chains

**Pain Points**:
- Losing customers to competitors with loyalty programs
- No visibility into customer behavior
- Manual punch cards are inefficient
- Can't afford enterprise solutions ($10K+/month)

**Needs**:
- Easy setup (< 30 minutes)
- Mobile app for customers
- Automated campaigns
- Clear ROI reporting

**Success Criteria**:
- 15-25% increase in repeat visits
- 10-20% increase in average transaction value
- Positive ROI within 3 months

### 2. Marketing Manager (Secondary User)

**Profile**:
- Age: 25-40
- Role: Marketing, Customer Success
- Technical Skill: Medium to high
- Goals: Drive engagement, optimize campaigns, reduce churn

**Pain Points**:
- Generic campaigns don't work
- No customer segmentation tools
- Can't track campaign ROI
- Disconnected systems (CRM, email, POS)

**Needs**:
- Customer segmentation
- Campaign builder (email, SMS, push)
- A/B testing
- Integration with existing tools (Mailchimp, Klaviyo)

**Success Criteria**:
- >20% email open rates
- >5% conversion rates on campaigns
- Reduce churn by 10%

### 3. End Customer (Loyalty Member)

**Profile**:
- Age: 18-65
- Tech-savvy: Varies (mobile app must be simple)
- Goals: Save money, get rewards, feel valued

**Pain Points**:
- Forgetting physical punch cards
- Complicated point systems
- Rewards expire before redemption
- Too many apps (one per business)

**Needs**:
- Simple mobile app
- Clear point balance
- Easy redemption
- Personalized offers

**Success Criteria**:
- Uses loyalty program >50% of visits
- Redeems rewards regularly
- Refers friends

## Success Metrics

### Business Metrics (Year 1)

| Metric | Target | Rationale |
|--------|--------|-----------|
| Total Businesses | 1,000 | Market validation |
| Paying Customers | 750 (75%) | Trial-to-paid conversion |
| Annual Recurring Revenue | $1.35M | 750 × $150/mo × 12 |
| Customer Churn Rate | <10%/year | Sticky product |
| Net Promoter Score (NPS) | >50 | Customer satisfaction |
| Customer Acquisition Cost | <$500 | Sustainable growth |
| Lifetime Value / CAC | >5x | Unit economics |

### Technical Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| API Uptime | >99.9% | Reliability |
| API Response Time (p95) | <200ms | Performance |
| Error Rate | <0.1% | Quality |
| Test Coverage | >80% | Maintainability |
| Build Success Rate | >95% | CI/CD health |

### Product Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Time to First Program | <24 hours | Ease of use |
| Active Programs per Business | >1.5 | Engagement |
| End Customers per Business | >200 | Scale |
| Monthly Active Customers | >70% | Engagement |
| Reward Redemption Rate | >40% | Program effectiveness |
| **Wallet Adoption Rate** (NEW v2.0.0) | >60% | Multi-tender usage |
| **Multi-Tender Transactions** (NEW v2.0.0) | >25% | Advanced wallet features |
| **Viral Coefficient (K-Factor)** (NEW v2.0.0) | >0.5 | Viral growth momentum |
| **Referral Conversion Rate** (NEW v2.0.0) | >15% | Referral quality |
| **Social Engagement Rate** (NEW v2.0.0) | >25% | Community health |
| **Content Personalization Lift** (NEW v2.0.0) | >30% | Content effectiveness |

## Competitive Landscape

### Direct Competitors

1. **Belly** (Acquired by Mobivity)
   - Focus: SMB loyalty for restaurants, retail
   - Pricing: ~$100-300/month
   - Weakness: Limited customization, outdated tech

2. **Punchcard** (by SpotOn)
   - Focus: Point-of-sale integration
   - Pricing: Bundled with POS ($50-200/month)
   - Weakness: Requires POS hardware

3. **Loyverse**
   - Focus: Free POS + loyalty
   - Pricing: Free (with limitations), $25/mo advanced
   - Weakness: Basic features, limited scale

4. **Yotpo** (Enterprise)
   - Focus: Ecommerce loyalty + reviews
   - Pricing: $200-$500+/month
   - Weakness: Expensive, ecommerce only

### NxLoy Competitive Advantages

1. **Industry Templates**: Pre-configured for 21 industries (competitors: 3-5)
2. **Flexible Rules**: 6 rule types combinable (competitors: 1-2)
3. **AI-Powered**: Intelligent recommendations (competitors: none)
4. **Unified Wallet** (NEW v2.0.0): Multi-tender redemption with points, store credit, digital rewards (competitors: single tender only)
5. **ASEAN-First** (NEW v2.0.0): 8-currency support (USD, KHR, SGD, THB, VND, MYR, PHP, IDR) with Cambodia/Singapore regulatory focus (competitors: USD/EUR only)
6. **Viral Growth Engine** (NEW v2.0.0): Built-in referral mechanics, social sharing, viral loops (competitors: basic referrals only)
7. **Content Management** (NEW v2.0.0): Dynamic personalization, A/B testing, multi-language support (competitors: static templates)
8. **Partner Network**: Cross-business rewards (competitors: limited)
9. **Blockchain-Ready**: NFT rewards (competitors: none)
10. **Social-First** (NEW v2.0.0): Community features, group challenges, influencer programs (competitors: none)
11. **Developer-Friendly**: Comprehensive APIs (competitors: limited/no API)
12. **Pricing**: Mid-market sweet spot ($49-299) with enterprise features

## Risks & Mitigation

### Risk 1: Customer Acquisition Cost Too High

**Probability**: Medium
**Impact**: High (affects unit economics)

**Mitigation**:
- Content marketing (SEO, industry guides)
- Template marketplace (viral growth)
- Partner referral program (incentivized growth)
- Free trial with low friction (self-service onboarding)
- **Viral Growth Engine** (NEW v2.0.0): Built-in referral mechanics reduce paid CAC by 40%
- **Content Library** (NEW v2.0.0): Pre-built templates accelerate time-to-value, improving conversion

### Risk 2: Low Trial-to-Paid Conversion

**Probability**: Medium
**Impact**: High (growth stalls)

**Mitigation**:
- Onboarding success program (hand-holding first 30 days)
- Quick wins (pre-configured templates, launch in <24 hours)
- ROI reporting (demonstrate value early)
- Usage nudges (email reminders, best practices)

### Risk 3: High Churn Rate

**Probability**: Medium
**Impact**: High (poor retention = poor LTV)

**Mitigation**:
- Proactive customer success (quarterly business reviews)
- Community building (best practices, case studies)
- Feature adoption (ensure customers use advanced features)
- Lock-in via integrations (more integrations = harder to leave)
- **Unified Wallet Lock-In** (NEW v2.0.0): Multi-tender balances create switching costs
- **Social Community** (NEW v2.0.0): Community features drive 2-3x higher retention rates

### Risk 4: Technical Scalability Issues

**Probability**: Low
**Impact**: High (outages damage reputation)

**Mitigation**:
- Architecture review before launch (load testing)
- Horizontal scaling from Day 1
- Monitoring and alerting (catch issues early)
- Gradual rollout (beta customers first)

## Appendix

### Glossary

- **ARR**: Annual Recurring Revenue
- **ARPA**: Average Revenue Per Account
- **ASEAN**: Association of Southeast Asian Nations (10 member states including Cambodia, Singapore, Thailand, Vietnam, etc.)
- **Breakage**: Expired loyalty credits that become revenue (IFRS 15 compliant)
- **CAC**: Customer Acquisition Cost
- **FIFO**: First-In-First-Out (redemption order: earliest expiration first)
- **IFRS 15**: International Financial Reporting Standard 15 (revenue recognition)
- **K-Factor**: Viral coefficient (number of new users each user brings in)
- **LTV**: Lifetime Value
- **MRR**: Monthly Recurring Revenue
- **Multi-Tender**: Combining multiple payment methods (points + store credit + digital rewards + cash)
- **NPS**: Net Promoter Score
- **RPO**: Recovery Point Objective (max data loss)
- **RTO**: Recovery Time Objective (max downtime)
- **SLA**: Service Level Agreement
- **UGC**: User-Generated Content (photos, reviews, social posts)
- **Viral Loop**: Self-reinforcing growth cycle where users invite more users

### References

- [Product Roadmap](./PRODUCT-ROADMAP.md)
- [Technical Architecture](../architecture/README.md)
- [API Contracts](../contracts/openapi.yaml)
- [Feature Specifications](./features/)
- **[Unified Wallet Feature Spec](./features/unified-wallet/FEATURE-SPEC.md)** (NEW v2.0.0)
- **[Social Community Feature Spec](./features/social-community/FEATURE-SPEC.md)** (NEW v2.0.0)
- **[Viral Growth Feature Spec](./features/viral-growth/FEATURE-SPEC.md)** (NEW v2.0.0)
- **[Content Management Feature Spec](./features/content-management/FEATURE-SPEC.md)** (NEW v2.0.0)

---

**Document Owner**: Product Team
**Review Cycle**: Quarterly
**Last Review**: 2025-11-09
**Next Review**: 2026-02-09
