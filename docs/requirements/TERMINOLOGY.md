# NxLoy Terminology Reference

**Version**: 2.0.0
**Date**: 2025-11-09
**Purpose**: Standardized terminology for the NxLoy loyalty platform

## Table of Contents

1. [Core Platform Terms](#core-platform-terms)
2. [Loyalty System Terms](#loyalty-system-terms)
3. [Reward System Terms](#reward-system-terms)
4. **[Wallet System Terms](#wallet-system-terms)** ← NEW (v2.0.0)
5. [Customer Management Terms](#customer-management-terms)
6. [Business Management Terms](#business-management-terms)
7. [Partner Network Terms](#partner-network-terms)
8. [Subscription Terms](#subscription-terms)
9. [Referral Terms](#referral-terms)
10. **[Viral Growth Terms](#viral-growth-terms)** ← NEW (v2.0.0)
11. **[Content Management Terms](#content-management-terms)** ← NEW (v2.0.0)
12. **[Social & Community Terms](#social--community-terms)** ← NEW (v2.0.0)
13. [Blockchain/NFT Terms](#blockchainnft-terms)
14. [Technical Terms](#technical-terms)
15. [Analytics Terms](#analytics-terms)
16. [Industry Variations](#industry-variations)

---

## Core Platform Terms

### Platform Description

- **Primary**: "NxLoy - Multi-tenant loyalty platform"
- **Marketing**: "Flexible loyalty programs for every industry"
- **Technical**: "Nx monorepo-based loyalty rule engine with multi-tenancy"
- **Positioning**: "Industry templates + flexible rules + AI recommendations"

### System Components

- **Loyalty Engine**: Core rule processing for points, tiers, rewards
- **Reward Catalog**: Inventory and management of redeemable rewards
- **Customer Profile System**: Unified customer data and segmentation
- **Partner Network**: Cross-business reward earning and redemption
- **AI/MCP System**: Intelligent recommendations and automation
- **Blockchain Module**: NFT rewards and token-based incentives (Phase 4)
- **Rule Engine**: Processing system for all loyalty logic
- **Multi-Tenancy Framework**: Complete business isolation and data security

---

## Loyalty System Terms

### Core Concepts

- **Loyalty Program**: A configured set of rules for earning and redeeming rewards
- **Loyalty Rule**: Specific logic determining how customers earn rewards
- **Loyalty Template**: Pre-configured program for specific industry
- **Rule Type**: Category of loyalty mechanism (6 types supported)
- **Program Status**: DRAFT, ACTIVE, PAUSED, ENDED

### Loyalty Rule Types

**1. POINTS_BASED**
- **Definition**: Earn points per dollar spent
- **Terms**: Points, point balance, point-to-dollar ratio, points multiplier
- **Customer Facing**: "Earn 10 points for every $1 spent"
- **Common In**: Retail, ecommerce, most industries

**2. PUNCH_CARD**
- **Definition**: Digital stamp/punch cards (buy X, get Y free)
- **Terms**: Punch, stamp, progress, completion, required punches
- **Customer Facing**: "Buy 10 coffees, get 1 free"
- **Common In**: Coffee shops, car washes, quick service
- **Variations**: "punch" (coffee), "stamp" (salons), "visit" (restaurants)

**3. AMOUNT_SPENT**
- **Definition**: Spend-based milestones for rewards
- **Terms**: Milestone, threshold, cumulative spending, reward tier
- **Customer Facing**: "Spend $100, get $10 off your next purchase"
- **Common In**: Retail, salons, professional services

**4. TIER_BASED**
- **Definition**: Bronze/Silver/Gold/Platinum membership tiers
- **Terms**: Tier, tier status, tier upgrade, tier benefits, tier threshold
- **Customer Facing**: "Reach Gold status for 20% off all purchases"
- **Common In**: Airlines, hotels, subscription services

**5. VISIT_FREQUENCY**
- **Definition**: Reward based on visit count in time period
- **Terms**: Visit, check-in, visit count, time window, consecutive visits
- **Customer Facing**: "Visit 5 times this month for a bonus reward"
- **Common In**: Fitness centers, restaurants, entertainment

**6. STAMP_CARD**
- **Definition**: Item-specific collection tracking
- **Terms**: Stamp, collection, item tracking, mix-and-match
- **Customer Facing**: "Try all 5 menu categories to complete your collection"
- **Common In**: Restaurants, entertainment, education

### Loyalty Actions

- **Earn**: Action of receiving credit toward a reward
- **Progress**: Current advancement toward completion
- **Completion**: Fulfillment of all requirements
- **Redemption**: Using earned rewards for benefits
- **Expiration**: Time limit on earned rewards or points

### Industry-Customizable Terms

```typescript
// Example: Coffee shop terminology
interface IndustryTerms {
  cardName: "Coffee Punch Card";       // vs "Loyalty Program"
  earnAction: "Get a punch";           // vs "Earn points"
  progressLabel: "8 punches earned";   // vs "8 points earned"
  rewardLabel: "Free coffee";          // vs "Reward unlocked"
  notification: "One more punch for your free coffee!";
}
```

---

## Reward System Terms

### Core Concepts

- **Reward Catalog**: Collection of available rewards
- **Reward Item**: Specific benefit customers can redeem
- **Redemption**: Act of using points/progress for reward
- **Point Cost**: Points required to redeem a reward
- **Inventory**: Available stock of redeemable rewards
- **Reward Category**: Grouping of similar rewards

### Reward Types

- **Discount Reward**: Percentage or dollar-amount discount
- **Free Item**: Complimentary product or service
- **Cashback**: Money credited back to customer
- **Partner Reward**: Redeemable at partner business
- **NFT Reward**: Digital collectible or token (Phase 4)
- **Tier Benefit**: Exclusive perk for tier members

### Redemption Terms

- **Redemption Limit**: Maximum redemptions per customer/period
- **Partial Redemption**: Use points + cash for higher-value items
- **Redemption History**: Record of all redeemed rewards
- **Redemption Code**: Unique code for reward validation
- **Expiration**: Time limit for using redeemed reward

---

## Wallet System Terms

**NEW (v2.0.0)**: Unified wallet supporting multiple balance types for earning and redemption.

### Core Wallet Concepts

- **Unified Wallet**: Single interface aggregating all customer balance types (points, store credit, digital rewards)
- **Wallet Balance**: Computed total value across all balance types
- **Multi-Currency Balance**: Balance amounts grouped by currency (USD, KHR, SGD, etc.)
- **Balance Type**: Category of redeemable value (points, store_credit, digital_rewards, cash)
- **Wallet View**: Read-only aggregate of all customer balances (no persistence)

### Store Credit Terms

**Definition**: Monetary value issued to customers as loyalty rewards, refunds, or promotional credits

**Customer Facing**:
- "You have $10.00 in store credit"
- "Earn store credit as a loyalty reward"
- "Use your store credit on your next purchase"

**Technical Terms**:
- **Store Credit**: Monetary value credited to customer wallet
- **Credit Balance**: Remaining usable amount
- **Credit Method**: How credit was issued (promotional, refund, cashback_reward, automated)
- **FIFO Redemption**: First-In-First-Out redemption order (earliest expiration first)
- **Credit Status**: ACTIVE, EXPIRED, GRACE_PERIOD, FULLY_EXPIRED
- **Grace Period**: 30-day window after expiration where credit can still be used
- **Breakage**: Unredeemed credit that expires (recognized as revenue)
- **Breakage Rate**: Percentage of issued credit that expires unused

**Issuance Methods**:
- **Promotional**: Marketing campaign credit
- **Refund**: Credit issued for returned purchases
- **Cashback Reward**: Points converted to store credit
- **Automated**: System-generated credit (e.g., signup bonus)

**Customer Facing Messages**:
- "Your store credit expires in 30 days"
- "You're in the grace period - use your credit before [date]"
- "$5.00 in store credit is expiring soon!"

### Digital Gift Cards / Digital Rewards Terms

**Definition**: Digital vouchers issued as loyalty rewards (NOT purchased gift cards in Phase 1)

**Important**: Phase 1 digital rewards are **loyalty program benefits only**, not purchased gift cards. This positioning avoids Philippines Gift Check Act restrictions.

**Customer Facing**:
- "You earned a $20 Starbucks reward"
- "Redeem your digital reward at any participating location"
- "Your digital reward expires in 12 months"

**Technical Terms**:
- **Digital Reward**: Digital voucher issued as loyalty benefit
- **Reward Balance**: Remaining usable amount
- **Reward Method**: How reward was issued (promotional, referral, milestone, compensation)
- **Merchant-Specific Reward**: Redeemable only at designated merchant
- **Generic Reward**: Redeemable at any participating merchant
- **Partner Reward**: Redeemable at partner merchant network
- **Reward Status**: ACTIVE, EXPIRED, GRACE_PERIOD, FULLY_EXPIRED

**Merchant Restriction Terms**:
- **Merchant ID**: Specific merchant where reward can be redeemed
- **Partner ID**: Partner network where reward is valid
- **Generic Reward**: No merchant restriction (merchant_id = null)
- **Merchant Priority**: Merchant-specific rewards deplete before generic rewards (FIFO with priority)

**Customer Facing Messages**:
- "This reward is valid at [Merchant Name] only"
- "Redeem at any of our partner locations"
- "Use this reward anywhere in our network"

### Multi-Tender Redemption Terms

**Definition**: Combining multiple balance types in a single transaction

**Customer Facing**:
- "Pay with points + store credit + cash"
- "Use your loyalty rewards together"
- "Combine balances to save more"

**Technical Terms**:
- **Multi-Tender**: Payment using multiple balance types
- **Depletion Order**: Priority order for redeeming balance types (default: digital rewards → store credit → points → cash)
- **Balance Type Priority**: Ranking determining which balance depletes first
- **Expiration Override**: FIFO takes precedence over depletion order (expiring balances used first)
- **Saga Pattern**: Distributed transaction ensuring atomicity across balance types
- **Compensating Transaction**: Rollback action if multi-tender fails
- **Redemption Breakdown**: Itemized list showing amount from each balance type

**Depletion Order Rules**:
- **Default Order**: Digital rewards (1) → Store credit (2) → Points (3) → Cash (4)
- **Expiration Priority**: Earliest expiring balance used first (overrides default order)
- **Merchant Priority**: Merchant-specific digital rewards before generic rewards

**Customer Facing Messages**:
- "Your payment breakdown: $5 store credit + $3 digital reward + $2 cash"
- "We applied your expiring store credit first"
- "Merchant reward applied before generic reward"

### Expiration and Grace Period Terms

**Expiration Policy**:
- **Expiration Date**: 12 months from issuance (default)
- **Grace Period**: 30 days after expiration
- **Grace Period End Date**: Final date before breakage
- **Expiration Warning**: Notification sent at 30, 7, and 1 days before expiration

**Status Transitions**:
- **ACTIVE**: Before expiration date (fully usable)
- **EXPIRED**: After expiration date, during grace period (still usable)
- **GRACE_PERIOD**: Same as EXPIRED (alternative term)
- **FULLY_EXPIRED**: After grace period ends (becomes breakage, no longer usable)

**Customer Facing Messages**:
- "Your credit expires on [date]"
- "You have $10 expiring in 7 days"
- "Grace period: Use by [date] or lose it"
- "This credit has expired and cannot be used"

### Multi-Currency Support Terms

**Supported Currencies**:
- **USD**: US Dollar (primary currency, 2 decimals)
- **KHR**: Cambodian Riel (home base, 0 decimals)
- **SGD**: Singapore Dollar (primary expansion, 2 decimals)
- **THB**: Thai Baht (ASEAN expansion, 2 decimals)
- **VND**: Vietnamese Dong (ASEAN expansion, 0 decimals)
- **MYR**: Malaysian Ringgit (ASEAN expansion, 2 decimals)
- **PHP**: Philippine Peso (ASEAN expansion, 2 decimals)
- **IDR**: Indonesian Rupiah (ASEAN expansion, 0 decimals)

**Currency Rules**:
- **Currency Locking**: Exchange rate locked at issuance (no post-issuance conversion)
- **Separate Balances**: Each currency maintained separately
- **Decimal Precision**: 0 decimals for KHR/VND/IDR, 2 decimals for all others
- **Currency Display**: Native symbol (៛ for KHR, S$ for SGD, etc.)

**Customer Facing Messages**:
- "You have ៛40,000 in store credit" (KHR, 0 decimals)
- "You have S$10.50 in store credit" (SGD, 2 decimals)
- "Balances: $15 USD + ៛60,000 KHR"

### Compliance and Regulatory Terms

**ASEAN Compliance**:
- **Loyalty Program Benefit**: Structure that maximizes regulatory exemptions
- **Non-Purchased Credit**: Credit earned (not bought) to avoid gift card regulations
- **Philippines Gift Check Act**: Regulation requiring no expiration on purchased gift cards (avoided by loyalty structure)
- **IFRS 15 / SFRS(I) 15**: Revenue recognition accounting standards
- **Breakage Revenue**: Revenue recognized when credit expires
- **Deferred Revenue Liability**: Credit recorded as liability until redeemed or expired

**Accounting Treatment**:
- **On Issuance**: Debit Cash (or Points Expense), Credit Deferred Revenue Liability
- **On Redemption**: Debit Deferred Revenue, Credit Revenue
- **On Breakage**: Debit Deferred Revenue, Credit Breakage Revenue
- **Remote Method**: Breakage recognition approach (recognize at expiration)

**Customer Facing** (Compliance):
- "This store credit is a loyalty program benefit"
- "Earned as part of our rewards program"
- "Subject to program terms and expiration policy"

### Wallet Integration Terms (Technical)

**Architecture**:
- **Virtual Aggregate**: Wallet represented as computed view (no persistence)
- **Composite Repository**: Repository aggregating multiple underlying services
- **Distributed Locking**: Redis Redlock preventing concurrent redemption conflicts
- **FIFO Query**: Database query sorting by expiration date ASC
- **Saga Coordinator**: Service orchestrating multi-tender transactions

**Performance**:
- **Cache TTL**: 5-minute time-to-live for wallet balance cache
- **Event-Driven Invalidation**: Cache cleared on balance change events
- **Indexed Queries**: Database indexes optimized for FIFO redemption

---

## Customer Management Terms

### Customer Lifecycle

- **Customer**: End user enrolled in loyalty program
- **Registration**: Initial sign-up process
- **Profile**: Customer's personal information and preferences
- **Status**: ACTIVE, INACTIVE, SUSPENDED
- **Segment**: Group of customers with shared characteristics
- **Customer ID**: Unique identifier for customer

### Customer Data

- **Contact Information**: Email, phone, address
- **Demographics**: Age, gender, location
- **Preferences**: Communication preferences, interests
- **Transaction History**: All purchases and interactions
- **Point Balance**: Current available points
- **Tier Status**: Current membership tier
- **Lifetime Value (LTV)**: Total customer worth

### Customer Engagement

- **Active Customer**: Engaged within last 30-90 days
- **Inactive Customer**: No activity for 90+ days
- **At-Risk Customer**: Showing churn signals (AI-identified)
- **VIP Customer**: High-value tier or spending threshold
- **Retention**: Keeping customers engaged over time
- **Churn**: Customer stops engaging with business

---

## Business Management Terms

### Business Entities

- **Business**: Tenant on the platform (single or multi-location)
- **Tenant**: Isolated business account with own data
- **Business Owner**: Primary admin for business account
- **Staff**: Employee with limited access permissions
- **Location**: Physical or virtual business site
- **Multi-Location**: Business with multiple sites

### Business Operations

- **Dashboard**: Central management interface
- **Rule Configuration**: Setting up loyalty program parameters
- **Analytics**: Performance metrics and insights
- **Campaign**: Marketing initiative with loyalty component
- **Integration**: Connection to external systems (POS, CRM, etc.)

### Business Status

- **Trial**: Free trial period (30 days)
- **Active**: Paying subscriber
- **Suspended**: Account temporarily disabled
- **Canceled**: Subscription ended

---

## Partner Network Terms

### Partner Relationships

- **Partner**: Another business in the network
- **Partner Program**: Shared loyalty arrangement
- **Partner Directory**: List of available partners
- **Partner Link**: Connection between two businesses
- **Cross-Business Reward**: Earn at one business, redeem at another

### Partner Operations

- **Partner Invitation**: Request to join network
- **Revenue Share**: Commission on cross-business transactions
- **Partner Analytics**: Performance of partner relationships
- **Partner Transaction**: Purchase at partner location
- **Partner Integration**: Technical connection between systems

---

## Subscription Terms

### Subscription Tiers

- **Starter**: $49/month, up to 500 customers
- **Growth**: $149/month, up to 2,500 customers
- **Pro**: $299/month, up to 10,000 customers
- **Enterprise**: Custom pricing, unlimited customers

### Billing Terms

- **Monthly Recurring Revenue (MRR)**: Monthly subscription income
- **Annual Recurring Revenue (ARR)**: Yearly subscription income
- **Usage-Based Pricing**: Charges based on consumption (SMS, emails)
- **Invoice**: Billing statement
- **Payment Method**: Credit card, ACH, etc.
- **Billing Cycle**: Subscription renewal period

### Subscription Actions

- **Upgrade**: Move to higher-tier plan
- **Downgrade**: Move to lower-tier plan
- **Cancel**: End subscription
- **Reactivate**: Resume canceled subscription
- **Trial**: Free evaluation period

---

## Referral Terms

### Referral Mechanics

- **Referrer**: Customer who refers others
- **Referred Customer**: New customer from referral
- **Referral Code**: Unique code for tracking referrals
- **Referral Link**: Shareable URL with embedded code
- **Referral Reward**: Benefit for successful referral
- **Dual-Sided Reward**: Both referrer and referred earn rewards

### Referral Tracking

- **Referral Completion**: When referred customer meets criteria
- **Completion Criteria**: Requirements for reward (signup, first purchase, spend $X)
- **Referral Leaderboard**: Top referrers ranking
- **Referral Analytics**: Performance of referral program
- **Fraud Detection**: Prevention of self-referrals and gaming

---

## Viral Growth Terms

**NEW (v2.0.0)**: Viral growth mechanics for exponential customer acquisition.

### Core Viral Growth Concepts

- **Viral Growth**: Customer acquisition through existing customers inviting new customers
- **Viral Loop**: Self-reinforcing cycle where users invite more users who invite more users
- **K-Factor (Viral Coefficient)**: Number of new users each existing user brings in (K>1 = exponential growth)
- **Viral Mechanics**: Built-in features that incentivize sharing and referrals
- **Organic Growth**: Customer acquisition without paid advertising

### Referral Program Terms

**Definition**: System for tracking and rewarding customer referrals

**Customer Facing**:
- "Refer a friend and you both earn rewards"
- "Share your referral code to earn bonus points"
- "Invite friends to unlock exclusive rewards"

**Technical Terms**:
- **Referral Code**: Unique code assigned to each customer for tracking
- **Referral Link**: Shareable URL with embedded tracking code
- **Referrer**: Customer who invites others
- **Referee**: New customer from referral
- **Dual-Sided Reward**: Both referrer and referee earn rewards
- **Referral Completion**: When referee meets criteria (signup, first purchase, spend threshold)
- **Completion Criteria**: Requirements for reward issuance
- **Referral Attribution**: Tracking which referrer brought which customer
- **Fraud Detection**: Prevention of self-referrals, bot referrals, abuse

**Reward Structures**:
- **Fixed Reward**: "$10 credit for each referral"
- **Tiered Reward**: "1st referral = $5, 5th referral = $25"
- **Milestone Reward**: "Refer 10 friends, unlock VIP status"
- **Percentage Reward**: "10% of referee's first purchase"

### Viral Sharing Terms

**Definition**: Social sharing features that amplify reach

**Customer Facing**:
- "Share your achievement on social media"
- "Post your free coffee to Instagram"
- "Tell your friends about this reward"

**Technical Terms**:
- **Share Button**: UI element for social media sharing
- **Share Rate**: Percentage of transactions shared socially
- **Social Proof**: Displaying user activity to build trust
- **Viral Content**: User-generated posts that drive signups
- **Share Template**: Pre-formatted text/image for social posts
- **Deep Link**: Link that opens app directly to specific screen

**Social Platforms**:
- **Instagram Stories**: Share to Instagram Stories
- **Facebook**: Share to Facebook feed
- **Twitter/X**: Share to Twitter/X feed
- **WhatsApp**: Share via WhatsApp message
- **Native Share**: OS-native share sheet

### Viral Loop Analytics Terms

**Definition**: Metrics for measuring viral growth effectiveness

**Technical Terms**:
- **Viral Coefficient (K)**: K = (invites sent per user) × (conversion rate)
- **Cycle Time**: Average time for one viral loop iteration
- **Viral Lift**: Increase in signups attributed to viral features
- **Share-to-Signup Rate**: Percentage of shares resulting in signups
- **Referral Conversion Rate**: Percentage of referred users who complete criteria
- **Viral Funnel**: Stages from share → click → signup → completion
- **Drop-off Rate**: Percentage lost at each funnel stage

**Customer Facing Messages**:
- "You've referred 5 friends this month!"
- "Your referrals have earned you $50 in rewards"
- "Top referrer: [Name] with 23 referrals"

### Gamification & Viral Mechanics Terms

**Definition**: Game-like features that drive engagement and sharing

**Technical Terms**:
- **Leaderboard**: Ranking of top referrers
- **Challenge**: Time-bound goal with rewards
- **Achievement Badge**: Digital badge for milestones
- **Streak**: Consecutive days/weeks of activity
- **Milestone**: Significant threshold (10 referrals, 50 purchases, etc.)
- **Progress Bar**: Visual representation of progress toward goal
- **Social Proof Counter**: "1,247 customers joined this week"

**Customer Facing**:
- "You're #3 on the referral leaderboard!"
- "Challenge: Refer 3 friends this week for bonus reward"
- "Achievement unlocked: Referral Champion"

### Fraud Prevention Terms

**Definition**: Systems to detect and prevent referral abuse

**Technical Terms**:
- **Self-Referral Detection**: Identifying customers referring themselves
- **Duplicate Account Detection**: Same user creating multiple accounts
- **Bot Detection**: Identifying automated referral generation
- **IP Address Tracking**: Detecting referrals from same location
- **Device Fingerprinting**: Identifying devices for duplicate detection
- **Referral Velocity Check**: Flagging abnormally high referral rates
- **Manual Review Queue**: Suspicious referrals pending human review

**System Actions**:
- **Flagged Referral**: Suspicious activity requiring review
- **Blocked Referral**: Invalid referral that won't earn rewards
- **Account Suspension**: Temporary lock for abuse
- **Reward Clawback**: Removing fraudulently earned rewards

---

## Content Management Terms

**NEW (v2.0.0)**: Content library and personalization system.

### Core Content Concepts

- **Content Management System (CMS)**: Platform for creating, managing, and publishing marketing content
- **Content Library**: Repository of templates, assets, and campaigns
- **Dynamic Content**: Personalized content based on customer data
- **Content Personalization**: Tailoring messages to individual customers
- **Content Template**: Pre-designed format for campaigns

### Template Management Terms

**Definition**: Library of pre-built campaign templates

**Customer Facing**:
- "Get notified about exclusive offers"
- "Personalized recommendations just for you"
- "Special birthday reward inside!"

**Technical Terms**:
- **Email Template**: Pre-designed email layout
- **SMS Template**: Pre-written SMS message format
- **Push Notification Template**: Pre-configured push message
- **In-App Message Template**: Pop-up or banner message design
- **Template Variable**: Placeholder for dynamic content ({{firstName}}, {{points}})
- **Template Category**: Grouping (welcome, birthday, win-back, promotional)
- **Template Version**: Iteration of template design
- **Template Library**: Collection of all available templates

**Template Types**:
- **Welcome Campaign**: Onboarding new customers
- **Birthday Campaign**: Birthday month rewards
- **Win-Back Campaign**: Re-engaging inactive customers
- **Milestone Campaign**: Celebrating achievements
- **Promotional Campaign**: Limited-time offers
- **Tier Upgrade Campaign**: Celebrating tier progression

### A/B Testing Terms

**Definition**: Comparing two content variations to optimize performance

**Technical Terms**:
- **A/B Test**: Experiment comparing two variants
- **Control Group**: Baseline version (A)
- **Variant**: Alternative version (B, C, etc.)
- **Test Population**: Customers included in test
- **Split Ratio**: Distribution of traffic (50/50, 80/20, etc.)
- **Statistical Significance**: Confidence level in results
- **Winning Variant**: Best-performing version
- **Conversion Rate**: Percentage completing desired action
- **Test Duration**: Time period for experiment

**Measurable Outcomes**:
- **Open Rate**: Percentage opening email/push notification
- **Click-Through Rate (CTR)**: Percentage clicking link
- **Conversion Rate**: Percentage completing goal (redemption, purchase)
- **Engagement Rate**: Percentage interacting with content

**Customer Facing Messages**:
- "We're testing new features - your feedback helps us improve!"

### Personalization Terms

**Definition**: Tailoring content to individual customer preferences and behavior

**Technical Terms**:
- **Personalization Engine**: System generating custom content
- **Customer Segment**: Group with shared characteristics
- **Behavioral Trigger**: Action that initiates personalized message
- **Dynamic Field**: Content that changes per customer
- **Recommendation Algorithm**: Logic for suggesting products/rewards
- **Personalization Lift**: Performance improvement from personalization
- **Fallback Content**: Default content when personalization unavailable

**Personalization Factors**:
- **Purchase History**: Products previously bought
- **Browsing Behavior**: Items viewed but not purchased
- **Tier Status**: Current membership level
- **Location**: Customer's physical location
- **Time of Day**: When customer typically engages
- **Engagement Pattern**: Frequency and recency of activity

**Customer Facing**:
- "Based on your recent purchases, we recommend..."
- "Your favorite items are on sale"
- "You might also like these rewards"

### Multi-Language Support Terms

**Definition**: Content delivery in multiple languages

**Technical Terms**:
- **Localization (L10n)**: Adapting content to local language/culture
- **Translation**: Converting text to another language
- **Language Code**: ISO standard (en-US, zh-CN, km-KH, etc.)
- **Default Language**: Fallback when preferred language unavailable
- **Language Preference**: Customer's selected language
- **Translation Key**: Reference for translated strings
- **Translation Management**: System for maintaining translations

**Supported Languages (ASEAN Focus)**:
- **English (en)**: Global default
- **Khmer (km)**: Cambodia (home base)
- **Chinese (zh)**: Singapore, regional
- **Malay (ms)**: Singapore, Malaysia
- **Thai (th)**: Thailand
- **Vietnamese (vi)**: Vietnam
- **Tagalog (tl)**: Philippines
- **Indonesian (id)**: Indonesia

**Customer Facing**:
- "Language: [English ▼]"
- "ភាសាខ្មែរ" (Khmer option)
- "切换语言" (Chinese option)

---

## Social & Community Terms

**NEW (v2.0.0)**: Social features for community building and engagement (Phase 5).

### Core Social Concepts

- **Social Feed**: Instagram-style stream of user activity
- **User-Generated Content (UGC)**: Photos, reviews, posts created by customers
- **Community**: Group of engaged customers interacting with each other
- **Social Engagement**: Likes, comments, shares, reactions
- **Social Graph**: Network of connections between customers

### Social Feed Terms

**Definition**: Activity stream showing customer posts and achievements

**Customer Facing**:
- "See what others are earning"
- "Share your latest reward"
- "Check out the community feed"

**Technical Terms**:
- **Post**: Single item in social feed
- **Feed Algorithm**: Logic determining post order and visibility
- **Engagement**: Likes, comments, reactions on posts
- **Feed Item**: Individual entry (purchase, reward, achievement)
- **Timestamp**: When post was created
- **Visibility**: Who can see post (public, friends, private)
- **Post Type**: Category (purchase, reward redemption, milestone, review)

**Post Elements**:
- **Caption**: Text description
- **Image/Photo**: Visual content
- **Hashtag**: Categorization tag (#FreeCoffee, #LoyaltyReward)
- **Mention**: Tagging another user (@username)
- **Location Tag**: Business location tagged
- **Reaction**: Like, love, celebrate, etc.

### User-Generated Content (UGC) Terms

**Definition**: Customer-created content showcasing products and rewards

**Technical Terms**:
- **Photo Submission**: Customer-uploaded image
- **Review**: Written feedback on product/service
- **Rating**: Star rating (1-5 stars)
- **Content Moderation**: Reviewing UGC for appropriateness
- **Moderation Queue**: Pending content awaiting approval
- **Auto-Moderation**: AI-based content filtering
- **Manual Review**: Human approval process
- **Flagged Content**: User-reported inappropriate content

**Content Types**:
- **Product Photo**: Image of purchased item
- **Reward Photo**: Image of redeemed reward
- **Check-in Photo**: Location-based selfie
- **Unboxing**: First-time product reveal
- **Testimonial**: Customer success story

**Customer Facing**:
- "Share a photo of your reward for bonus points"
- "Post a review to earn 50 points"
- "Your photo was featured!"

### Group Challenges & Gamification Terms

**Definition**: Team-based competitions and collaborative goals

**Technical Terms**:
- **Group Challenge**: Time-bound team competition
- **Team**: Group of customers working toward shared goal
- **Challenge Goal**: Target to achieve (50 coffees, $1,000 spent)
- **Progress Tracker**: Real-time view of team progress
- **Leaderboard**: Ranking of teams or individuals
- **Challenge Reward**: Prize for completing challenge
- **Shared Reward**: Benefit distributed to all team members
- **Challenge Duration**: Time limit for completion

**Challenge Types**:
- **Team Challenge**: "Buy 50 coffees as a team this month"
- **Individual Competition**: "Top 10 customers win VIP status"
- **Global Challenge**: "Community goal: 1,000 purchases"
- **Streak Challenge**: "Visit 7 days in a row"

**Customer Facing**:
- "Join the Coffee Crew Challenge"
- "Your team is 70% to the goal!"
- "Congratulations! Challenge completed!"

### Influencer Program Terms

**Definition**: Partnerships with micro-influencers and brand ambassadors

**Technical Terms**:
- **Micro-Influencer**: Social media user with 1K-100K followers
- **Brand Ambassador**: Customer representing brand
- **Influencer Code**: Unique referral code for influencer
- **Commission**: Percentage earned on referred sales
- **Influencer Dashboard**: Analytics for influencer performance
- **Partnership Agreement**: Terms of influencer relationship
- **Content Requirement**: Posts/stories required from influencer
- **Exclusive Perk**: Special benefit for influencers

**Influencer Metrics**:
- **Reach**: Number of followers/impressions
- **Engagement Rate**: Percentage of followers engaging with posts
- **Conversion Rate**: Percentage of followers becoming customers
- **Attribution**: Tracking customers from influencer

**Customer Facing**:
- "Become a brand ambassador"
- "Apply for our influencer program"
- "Exclusive perks for top community members"

### Gifting & Social Commerce Terms

**Definition**: Sending rewards and points to friends

**Technical Terms**:
- **Gift Reward**: Transferring reward to another customer
- **Point Transfer**: Sending points to friend
- **Social Wish List**: Saved items friends can see
- **Group Purchase**: Pooling money for shared reward
- **Bill Splitting**: Dividing reward redemption among group
- **Gift Status**: Sent, pending, accepted, declined
- **Gift Notification**: Alert when gift received

**Customer Facing**:
- "Send a free coffee to a friend"
- "Gift your extra points"
- "Split this reward with your group"

**Gifting Rules**:
- **Transfer Limit**: Maximum points/rewards transferable
- **Cooldown Period**: Time between gift transactions
- **Eligible Recipients**: Who can receive gifts (friends, any customer)
- **Gift Expiration**: Time limit to accept gift

---

## Blockchain/NFT Terms

### Web3 Concepts (Phase 4)

- **NFT (Non-Fungible Token)**: Unique digital asset representing reward
- **Wallet**: Digital storage for NFTs and tokens
- **Smart Contract**: Self-executing blockchain agreement
- **Token**: Digital currency or point representation
- **Minting**: Creating new NFT
- **Blockchain**: Distributed ledger technology

### NFT Rewards

- **NFT Reward**: Digital collectible earned through loyalty
- **NFT Metadata**: Information about NFT (image, attributes)
- **NFT Transfer**: Moving NFT between wallets
- **NFT Marketplace**: Platform for trading NFTs
- **On-Chain**: Recorded on blockchain
- **Off-Chain**: Stored outside blockchain

### Wallet Types

- **Custodial Wallet**: Platform manages private keys
- **Non-Custodial Wallet**: User controls private keys
- **MetaMask**: Popular browser extension wallet
- **WalletConnect**: Mobile wallet connection protocol

### Blockchain Networks

- **Ethereum**: Primary blockchain network
- **Polygon**: Low-cost Layer 2 network
- **Base**: Coinbase Layer 2 network
- **Multi-Chain**: Support for multiple networks
- **Gas Fee**: Transaction cost on blockchain

---

## Technical Terms

### Architecture

- **Monorepo**: Single repository for all applications
- **Nx**: Monorepo build system
- **Multi-Tenant**: Single platform serving multiple businesses
- **API-First**: Built for integration and extensibility
- **Event-Driven**: Real-time processing architecture
- **Microservices**: Modular architecture (future, not current)
- **Modular Monolith**: Current architecture pattern

### Integration

- **REST API**: Request/response web service
- **GraphQL**: Query language for APIs (Phase 3)
- **Webhook**: Real-time event notifications
- **SDK**: Software Development Kit for partners
- **White-Label**: Customizable branding
- **API Rate Limiting**: Request throttling
- **OAuth 2.0**: Authorization framework
- **JWT**: JSON Web Token for authentication

### Domain-Driven Design

- **Bounded Context**: Domain boundary with own model
- **Domain Event**: Something that happened in the domain
- **Aggregate**: Cluster of domain objects treated as unit
- **Repository**: Data access abstraction
- **Value Object**: Immutable object defined by attributes
- **Entity**: Object with unique identity

### Development

- **Contract-First**: Design API contracts before coding
- **OpenAPI**: REST API specification format
- **AsyncAPI**: Event/message specification format
- **Prism**: Mock server for OpenAPI contracts
- **Pact**: Consumer-driven contract testing
- **Nx Tags**: Dependency boundary enforcement

---

## Analytics Terms

### Metrics

- **Customer Lifetime Value (CLV)**: Total customer worth
- **Customer Acquisition Cost (CAC)**: Cost to acquire customer
- **Churn Rate**: Percentage of customers leaving
- **Retention Rate**: Percentage of customers staying
- **Engagement Rate**: Percentage of active customers
- **Redemption Rate**: Percentage redeeming rewards

### Analysis Types

- **Cohort Analysis**: Grouping customers by shared characteristics
- **RFM Analysis**: Recency, Frequency, Monetary segmentation
- **Behavioral Segmentation**: Groups based on actions
- **Predictive Analytics**: AI-forecasted outcomes
- **A/B Testing**: Comparing two variants
- **Conversion Rate**: Percentage completing desired action

### Reporting

- **Dashboard**: Visual metrics display
- **Report**: Structured data presentation
- **Export**: Download data (CSV, PDF)
- **Scheduled Report**: Automated periodic delivery
- **Real-Time Metrics**: Live updating data
- **Historical Analysis**: Past performance review

---

## Industry Variations

### Coffee Shops

```typescript
const coffeeTerms = {
  program: "Coffee Punch Card",
  action: "Get a punch",
  progress: "8 punches earned",
  reward: "Free coffee of any size",
  notification: "One more punch for your free coffee!",
  tierName: "Coffee Connoisseur" // instead of "Gold Member"
};
```

### Beauty Salons

```typescript
const salonTerms = {
  program: "Beauty Stamp Card",
  action: "Earn a stamp",
  progress: "5 stamps collected",
  reward: "Free treatment or 20% off",
  notification: "You've earned another stamp!",
  tierName: "VIP Beauty Member"
};
```

### Restaurants

```typescript
const restaurantTerms = {
  program: "Dining Rewards",
  action: "Log a visit",
  progress: "7 visits recorded",
  reward: "Free appetizer or dessert",
  notification: "Thanks for dining with us!",
  tierName: "Frequent Diner"
};
```

### Fitness Centers

```typescript
const fitnessTerms = {
  program: "Workout Tracker",
  action: "Check in",
  progress: "15 workouts completed",
  reward: "Free personal training session",
  notification: "Great workout! 5 more for your reward!",
  tierName: "Fitness Elite"
};
```

### E-commerce

```typescript
const ecommerceTerms = {
  program: "Rewards Program",
  action: "Earn points",
  progress: "1,250 points earned",
  reward: "$10 off your next order",
  notification: "You've earned 100 points!",
  tierName: "Gold Shopper"
};
```

### Hotels

```typescript
const hotelTerms = {
  program: "Guest Rewards",
  action: "Stay night",
  progress: "12 nights stayed",
  reward: "Free night or room upgrade",
  notification: "Thank you for your stay!",
  tierName: "Elite Guest"
};
```

---

## Implementation Guidelines

### For Documentation

- Use **"loyalty program"** as primary term
- Use **"digital loyalty card"** when emphasizing digital nature
- Use **"reward catalog"** for collection of redeemable items
- Use **"customer"** (not "user") in loyalty context
- Use **"business"** (not "merchant" or "client") for platform customers

### For Code

```typescript
// Generic terms in core logic
interface LoyaltyProgram {
  type: LoyaltyRuleType;
  earnAction: string;        // Customizable per industry
  progress: number;
  required: number;
  reward: RewardDefinition;
}

// Industry customization
const industryConfig = {
  COFFEE: {
    cardName: "Punch Card",
    earnAction: "punch",
    earnVerb: "Get a punch"
  },
  FITNESS: {
    cardName: "Workout Tracker",
    earnAction: "check-in",
    earnVerb: "Check in"
  }
};
```

### For Marketing

- **Lead with familiar concepts**: "Like Starbucks Rewards, but for your business"
- **Emphasize flexibility**: "6 loyalty rule types that work for any industry"
- **Highlight templates**: "21 pre-configured industry templates"
- **Mention AI**: "AI-powered recommendations increase redemption rates"
- **Be specific**: "Increase repeat visits by 15-25%" (not vague claims)
- **Avoid jargon**: Customer-facing materials should be simple

### For User Interface

- **Consistency**: Use same terms throughout app
- **Context**: Adjust language based on industry
- **Clarity**: Prefer simple words over technical terms
- **Action-Oriented**: Use verbs for buttons ("Redeem Reward" not "Redemption")
- **Progressive Disclosure**: Show simple terms first, advanced terms in settings

### Regional Considerations

- **US Market**: "Punch card" more common
- **UK/Europe**: "Stamp card" more familiar
- **Asia**: "Point card" often preferred
- **Global**: Allow regional customization while maintaining core terminology
- **Localization**: Support multiple languages (Phase 2+)

---

## Ubiquitous Language

### What is Ubiquitous Language?

In Domain-Driven Design, **Ubiquitous Language** is the common vocabulary shared by developers, domain experts, and business stakeholders. Using consistent terminology reduces miscommunication.

### NxLoy Ubiquitous Language Rules

1. **One Term per Concept**: Don't use "customer", "user", "member" interchangeably
2. **Same Terms in Code and Docs**: Variable names should match documentation
3. **Domain-Specific**: Each bounded context has its own vocabulary
4. **Avoid Technical Jargon**: Business terms in domain layer, tech terms in infrastructure layer

### Example: Good vs Bad

```typescript
// ❌ BAD: Inconsistent terminology
class UserService {
  createMember(data: CustomerDto) {
    // Mixing "user", "member", "customer"
  }
}

// ✅ GOOD: Consistent ubiquitous language
class CustomerService {
  registerCustomer(data: RegisterCustomerDto) {
    // Clear, consistent terminology
  }
}
```

---

## Glossary Quick Reference

| Term | Definition | Used By |
|------|------------|---------|
| Loyalty Program | Configured set of earning/redemption rules | All teams |
| Rule Type | Category of loyalty mechanism (points, punch card, etc.) | Backend, Web, Mobile |
| Template | Pre-configured program for specific industry | Product, Backend |
| Reward Catalog | Collection of redeemable rewards | Backend, Web, Mobile |
| Redemption | Using earned rewards for benefits | All teams |
| Tier | Membership level (Bronze, Silver, Gold, Platinum) | Backend, Web, Mobile |
| Partner Network | Cross-business reward system | Backend, Web, Infrastructure |
| Multi-Tenancy | Multiple isolated businesses on single platform | Backend, Infrastructure |
| Bounded Context | Domain boundary with own model | Backend (DDD) |
| Domain Event | Something that happened in the domain | Backend, AI/MCP |
| NFT Reward | Blockchain-based digital collectible | Blockchain, Backend |
| Customer Segment | Group of customers with shared characteristics | Backend, Web, AI/MCP |
| Churn Prediction | AI forecast of at-risk customers | AI/MCP, Analytics |

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-09 | 2.0.0 | Added Viral Growth, Content Management, Social & Community terms | Product Team |
| 2025-11-06 | 1.0.0 | Initial NxLoy terminology (extracted from Ploy) | Ploy Lab |

---

**Document Owner**: Product Team + Engineering Team
**Review Cycle**: Quarterly
**Last Review**: 2025-11-09
**Next Review**: 2026-02-09

**Note**: This terminology reference should be consulted when:
- Writing user-facing text
- Naming code variables and functions
- Creating API endpoints and DTOs
- Designing database schemas
- Writing documentation
