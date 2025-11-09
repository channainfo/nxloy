# Viral Challenges Builder - Feature Specification

**Feature**: AI-Powered Viral Challenge Builder with Trend Analysis
**Version**: 1.0.0
**Status**: 🟢 Ready for Implementation
**Priority**: P1 (Critical for Viral Growth - Phase 2)
**Phase**: Phase 2 (Months 4-6)
**Teams**: Backend, Web, Mobile, AI/ML, Growth, Infrastructure
**Estimated Effort**: 6 weeks
**Target Release**: 2026-Q2
**Last Updated**: 2025-11-09

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Summary](#solution-summary)
3. [Success Criteria](#success-criteria)
4. [User Stories](#user-stories)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Technical Architecture](#technical-architecture)
8. [Database Schema](#database-schema)
9. [API Specifications](#api-specifications)
10. [Viral Mechanics](#viral-mechanics)
11. [Analytics & Metrics](#analytics--metrics)
12. [Implementation Phases](#implementation-phases)
13. [Dependencies](#dependencies)
14. [Risk Mitigation](#risk-mitigation)

---

## Problem Statement

### Current Challenge

**For Businesses**:
- Creating engaging challenges is time-consuming (4+ hours of brainstorming, design, setup)
- Most challenges feel "forced" and don't align with current trends
- Miss viral moments because they respond too slowly to trending topics
- No way to predict which challenges will drive engagement vs. flop
- Manual tracking of participation is error-prone and doesn't scale
- Lack expertise to create TikTok/Instagram-native challenge formats

**For Customers**:
- Generic challenges are boring ("Buy 3 coffees this week" - yawn)
- No social component (complete challenges alone, no sharing incentive)
- Rewards feel disconnected from effort (100 points for complex multi-step challenge)
- Miss out on trending challenges (by the time businesses react, trend is over)
- No visibility into progress or competition (no leaderboards, no FOMO)

### Business Impact

**Market Evidence**:
- **Sephora Beauty Insider Challenges**: 30% increase in loyalty members after launch
- **Elf #EyesLipsFace**: 8 BILLION views (one of top TikTok campaigns ever)
- **Gamification Impact**: 47% increase in engagement, 22% increase in brand loyalty
- **Challenge Participation**: 50-60% when trend-aligned (vs 20-30% for generic)
- **Viral Coefficient**: K = 0.10-0.15 per challenge (10-15% growth per challenge)

**Revenue Opportunity**:
- **$400K/year from gamification** (battle passes, premium challenges)
- **30% member increase** from viral challenges (Sephora case study)
- **2-3x engagement boost** vs. non-gamified programs
- **K-factor 0.5-0.7** when combined with referrals + challenges

**Competitive Gap**:
- **Yotpo**: NO challenge builder, NO trend analysis
- **LoyaltyLion**: Basic challenges (manual setup, no AI)
- **Smile.io**: NO challenge features
- **NxLoy Opportunity**: ONLY platform with AI-powered viral challenge builder

### Why This Matters

**Consumer Behavior Shifts**:
- **97% of Gen Z** use social for shopping (default to TikTok/Instagram)
- **68% of Gen Z** discovered products via social media in 2024
- **Trending content** gets 10-100x more engagement than static posts
- **Challenge formats** are native to TikTok (POV, Day-in-life, Transformation)

**Proven Viral Mechanics**:
- **Hashtag Challenges**: Most effective TikTok marketing format
- **Early Trend Adoption**: Brands that join trends in first 48 hours see 5-10x reach
- **User Participation**: Customers create content → Free UGC + viral amplification
- **Social Proof**: Public leaderboards create FOMO and competition

---

## Solution Summary

Build an AI-powered viral challenge creation system that:

### Core Features

1. **AI Trend Scraping & Analysis**
   - Real-time monitoring of TikTok/Instagram trending sounds, hashtags, formats
   - Trend lifecycle detection (emerging, peak, declining phases)
   - Brand-fit scoring (will this trend align with our brand values?)
   - Viral prediction (estimated reach, engagement, K-factor)

2. **Automated Challenge Generation**
   - Business inputs goal: "Drive fall menu purchases"
   - AI suggests 5 trending challenge formats:
     - "POV: You're ordering your first Pumpkin Spice Latte" (trending format)
     - "Day in the life of a coffee addict" (evergreen format)
     - "Latte art transformation" (before/after format)
     - Dance challenge with trending sound
   - Pre-filled templates: Tasks, rewards, hashtags, example videos

3. **Gamification Mechanics**
   - **Tasks**: Purchase, photo upload, social share, check-in, referral
   - **Rewards**: Points, badges, prizes (1st place, 2nd place, 3rd place)
   - **Leaderboards**: Real-time public rankings
   - **Progress Tracking**: Visual progress bars, milestones
   - **Social Unlocks**: "Get 3 friends to join for bonus reward"

4. **Viral Amplification**
   - **Hashtag Optimization**: AI recommends viral hashtag combos
   - **Example Content**: Generate AI video showing how to participate
   - **Share Incentives**: Bonus points for sharing challenge to social
   - **Friend Tagging**: "Tag 3 friends for 50 bonus points"
   - **Cross-Platform**: Works on TikTok, Instagram, Facebook, Twitter

5. **Real-Time Analytics**
   - **Viral Coefficient (K-factor)**: Live tracking of referrals per participant
   - **Engagement Metrics**: Participation rate, completion rate, share rate
   - **Social Metrics**: Hashtag impressions, mentions, user-generated posts
   - **Leaderboard**: Top 10 performers (updated every 5 minutes)

### Key Technologies

**AI/ML Stack**:
- TikTok Creator Marketplace API (trend data)
- Instagram Graph API (trending hashtags)
- Custom ML model (viral prediction, trend lifecycle)
- GPT-4o (challenge description generation)

**Backend Stack** (NestJS):
- Challenge Management Service (CRUD, lifecycle)
- Trend Scraping Service (TikTok/Instagram APIs)
- Participation Tracking Service (progress, leaderboards)
- Viral Analytics Service (K-factor calculations)

**Frontend Stack**:
- Web Dashboard: Create challenges, view analytics
- Mobile App: Participate, track progress, share
- Admin Dashboard: Moderate, approve, feature top performers

---

## Success Criteria

| Metric | Current Baseline | Target (Phase 2 - Month 6) | Target (Month 12) | Measurement Method |
|--------|------------------|----------------------------|-------------------|-------------------|
| **Challenge Participation Rate** | 20-30% (manual) | 50-60% | 70%+ | (Participants / Active Members) × 100 |
| **Trend Alignment Success** | 0% (no trend feature) | 80%+ | 90%+ | (Trend-aligned challenges / Total) × 100 |
| **AI Prediction Accuracy** | N/A | 70%+ | 85%+ | Predicted vs. actual engagement |
| **Viral Coefficient per Challenge** | 0.02 (organic) | 0.10-0.15 | 0.20+ | New members / Participants |
| **Challenge Completion Rate** | 40% (manual) | 60%+ | 75%+ | (Completed / Joined) × 100 |
| **Social Sharing Rate** | 30% (baseline) | 70%+ | 85%+ | (Shares / Participants) × 100 |
| **Hashtag Impressions** | 0 | 100K+ per challenge | 500K+ per challenge | TikTok/IG analytics |
| **UGC Generated** | 0 | 1,000+ posts | 5,000+ posts | Per challenge |
| **Time to Create Challenge** | 4 hours (manual) | 15 minutes (AI) | 5 minutes (AI) | Business feedback |
| **Leaderboard Engagement** | N/A | 40%+ check daily | 60%+ check daily | Daily active viewers |
| **Challenge Creation Rate** | 1/month (manual) | 4/month (AI-assisted) | 8/month (AI-assisted) | Per business |
| **Member Growth from Challenges** | 0% | 10-15% | 20-30% | New signups attributed |

**Revenue Impact Targets**:
- **Month 6**: 30% member increase (Sephora benchmark)
- **Year 1**: $400K/year from gamification revenue (battle passes, premium)
- **K-factor**: 0.10-0.15 per challenge = 10-15% compounding growth

---

## User Stories

### Primary User Story: Business Creates AI-Generated Challenge

**As a** coffee shop owner
**I want** to create a viral TikTok challenge to promote my fall menu
**So that** I can attract new customers and increase engagement without hiring an agency

**Acceptance Criteria**:
- [ ] Given I'm on the challenge creation page, when I click "AI Challenge Builder", then I see a form asking "What's your goal?"
- [ ] Given I enter "Promote fall menu", when AI analyzes trends, then I see 5 trending challenge formats within 30 seconds
- [ ] Given AI suggests "Pumpkin Spice Transformation Challenge", when I select it, then I see pre-filled tasks, rewards, and hashtags
- [ ] Given the challenge template, when I customize rewards (500 points for participation, $50 gift card for 1st place), then I can preview how it looks
- [ ] Given I approve the challenge, when I click "Launch", then it goes live immediately and all members receive a push notification

### User Story: Customer Joins Trending Challenge

**As a** Gen Z customer
**I want** to join the viral Pumpkin Spice Transformation challenge
**So that** I can win prizes and share my content on TikTok

**Acceptance Criteria**:
- [ ] Given a new challenge launched, when I open the app, then I see a featured banner: "NEW: Pumpkin Spice Challenge! Win $50"
- [ ] Given I tap the banner, when I view the challenge, then I see: Tasks, rewards, leaderboard, example video
- [ ] Given I tap "Join Challenge", when I confirm, then I see my progress tracker (0/3 tasks completed)
- [ ] Given I complete Task 1 (purchase pumpkin spice latte), when the transaction syncs, then my progress updates to 1/3 automatically
- [ ] Given I complete Task 2 (upload photo), when AI approves it, then I instantly see +200 points and 2/3 progress
- [ ] Given I tap "Share to TikTok", when I post with #PumpkinSpiceChallenge, then I earn +300 bonus points and see my rank on the leaderboard

### User Story: Customer Competes on Leaderboard

**As a** competitive customer
**I want** to see where I rank on the challenge leaderboard
**So that** I can compete for the top prize

**Acceptance Criteria**:
- [ ] Given I'm participating in a challenge, when I open the leaderboard, then I see: Rank, Username, Score, Points Earned
- [ ] Given I'm rank #15, when someone below me scores higher, then I receive a push notification: "You've been overtaken! You're now #16"
- [ ] Given I complete another task, when my score updates, then I see my rank climb in real-time
- [ ] Given the challenge ends, when final results are calculated, then I see: Final rank, prize won (if top 10), total points earned
- [ ] Given I won 1st place, when prizes are distributed, then I receive $50 gift card code via email + 2,000 bonus points

### User Story: Business Monitors Challenge Performance

**As a** marketing manager
**I want** to track how my viral challenge is performing
**So that** I can optimize future challenges

**Acceptance Criteria**:
- [ ] Given my challenge is live, when I view the analytics dashboard, then I see: Participants, completion rate, social shares, viral coefficient
- [ ] Given 48 hours have passed, when I check viral metrics, then I see: Hashtag impressions, UGC posts created, estimated reach
- [ ] Given I see low participation (20%), when AI suggests optimizations, then I receive recommendations: "Increase reward to 1,000 points" or "Share example video"
- [ ] Given the challenge ends, when I view the final report, then I see: Total participants, new members acquired, revenue attributed, ROI
- [ ] Given I want to repeat success, when I click "Clone Challenge", then AI creates a new challenge with similar mechanics but fresh trend alignment

---

## Functional Requirements

### FR-1: AI Trend Scraping & Analysis

**FR-1.1 TikTok Trend Detection**
- Monitor TikTok Creator Marketplace API for trending:
  - **Sounds**: Top 100 trending audio tracks (updated hourly)
  - **Hashtags**: Fastest-growing hashtags (last 24 hours)
  - **Formats**: Trending video formats (POV, Day-in-life, Transformation, Duet, Stitch)
  - **Effects**: Viral AR filters and effects
- Store trend metadata:
  - Trend ID, name, category
  - Current view count, growth rate (% increase per hour)
  - Creator count (how many videos use this trend)
  - Peak prediction (when will this trend peak?)
  - Decline prediction (when will engagement drop?)

**FR-1.2 Instagram Trend Detection**
- Monitor Instagram Graph API for:
  - Trending hashtags (#ThrowbackThursday, #MotivationMonday)
  - Trending Reels formats (Transitions, Before/After, Tutorials)
  - Trending audio (Reels music library)
- Cross-reference with TikTok trends (many trends start on TikTok, migrate to IG)

**FR-1.3 Trend Lifecycle Modeling**
```
Trend Lifecycle Stages:
1. Emerging (0-24 hours): <10K posts, 100%+ hourly growth
2. Rising (1-3 days): 10K-100K posts, 50-100% daily growth
3. Peak (3-7 days): 100K-1M posts, 10-50% daily growth
4. Plateau (7-14 days): 1M+ posts, <10% growth
5. Declining (14+ days): Negative growth, trend is "over"

AI Recommendation:
- Join in "Rising" stage (Days 1-3) for maximum viral potential
- Avoid "Declining" stage (looks out-of-touch)
```

**FR-1.4 Brand-Fit Scoring**
- Analyze trend content to determine if it aligns with brand:
  - **Content Type**: Dance, comedy, educational, inspirational, transformation
  - **Tone**: Playful, professional, edgy, wholesome
  - **Audience**: Gen Z, Millennials, Gen X, All ages
  - **Values Alignment**: Does trend align with brand values? (e.g., sustainability brand should avoid trends promoting fast fashion)
  - **Safety**: Any brand risk? (controversial topics, offensive content)

- **Scoring** (0-100):
  - 90-100: Perfect fit (recommend immediately)
  - 70-89: Good fit (recommend with minor tweaks)
  - 50-69: Moderate fit (proceed with caution)
  - 0-49: Poor fit (do not recommend)

**FR-1.5 Viral Prediction Model**
- Estimate potential reach for a challenge based on:
  - **Trend virality**: Current growth rate of underlying trend
  - **Business reach**: Follower count, past engagement rates
  - **Incentive size**: Higher rewards = more participation
  - **Shareability**: How easy/fun is it to create content?
  - **Network effect**: Will participants tag friends?

- **Output**: Predicted metrics
  - Participants: 100-500 (range)
  - Hashtag impressions: 50K-200K
  - UGC posts created: 80-400
  - Viral coefficient (K-factor): 0.08-0.15
  - New members: 8-75

### FR-2: Automated Challenge Generation

**FR-2.1 Challenge Template Library**
- Pre-built templates for common challenge types:
  1. **Purchase Challenge**: "Buy 3 items in 7 days"
  2. **Photo Upload Challenge**: "Share your best product photo"
  3. **Video Challenge**: "Show us how you use our product"
  4. **Social Share Challenge**: "Post with #BrandHashtag"
  5. **Referral Challenge**: "Invite 5 friends"
  6. **Check-In Challenge**: "Visit our store 3 times this month"
  7. **Combo Challenge**: Mix of purchase + photo + share

**FR-2.2 AI Challenge Creation Workflow**
```
Step 1: Business Input
- Goal: "Promote fall menu", "Increase app downloads", "Drive in-store visits"
- Target audience: All members, Gold tier, New members, Inactive members
- Budget: Reward budget ($500-5,000)
- Duration: 7 days, 14 days, 30 days

Step 2: AI Trend Matching
- Query trending sounds/hashtags relevant to goal
- Filter by brand-fit score (>70)
- Rank by viral prediction (highest potential reach first)
- Return top 5 recommendations

Step 3: Challenge Template Generation
For each recommended trend, generate:
- Challenge name: "Pumpkin Spice Transformation Challenge"
- Description: "Show us your before/after reaction to your first PSL of the season!"
- Tasks: [
    {type: "purchase", product: "Pumpkin Spice Latte"},
    {type: "video", duration: "15-30 sec", requirements: "Before/after reaction"},
    {type: "social_share", platforms: ["tiktok", "instagram"], hashtag: "#PSLChallenge"}
  ]
- Rewards: {
    participation: 500 points,
    completion: 1,000 points,
    top_3: [2,000 points + $50 gift card, 1,500 points, 1,000 points]
  }
- Hashtags: ["#PSLChallenge", "#PumpkinSpiceLatte", "#FallVibes", "#BrandName"]
- Example video: AI-generated demo video or link to trending example

Step 4: Business Customization
- Edit any field (name, tasks, rewards, hashtags)
- Preview how challenge looks on mobile
- Set start/end dates
- Select notification settings (push, email, SMS)

Step 5: Launch
- Challenge goes live immediately OR scheduled for future date
- All eligible members receive notification
- Challenge appears on app home screen, website, email
```

**FR-2.3 Multi-Step Task Configuration**
- Each challenge can have 1-10 tasks
- Tasks can be:
  - **Sequential**: Must complete Task 1 before Task 2 unlocks
  - **Parallel**: Complete in any order
  - **Conditional**: "If Gold tier, complete 5 tasks; if Bronze, complete 3"
- Task types:
  - **Purchase**: Buy specific product(s), spend $X, make Y purchases
  - **Photo/Video Upload**: Submit UGC with min quality score
  - **Social Share**: Post to Instagram/TikTok with hashtag
  - **Referral**: Invite X friends who complete action
  - **Check-In**: Visit store X times (GPS verification)
  - **Quiz/Survey**: Answer questions
  - **Custom**: Business defines custom verification

**FR-2.4 Reward Structure**
```
Reward Tiers:
1. Participation Reward (join challenge): 100-500 points
2. Task Completion Rewards (per task): 50-300 points
3. Challenge Completion (all tasks): 500-2,000 points
4. Leaderboard Prizes (top performers):
   - 1st place: $100 gift card + 5,000 points + VIP badge
   - 2nd place: $50 gift card + 3,000 points
   - 3rd place: $25 gift card + 2,000 points
   - 4th-10th place: 1,000 points + featured badge
5. Social Bonus (share to social): +300 points
6. Viral Bonus (>10K views on post): +1,000 points
7. Friend Referral Bonus (tag friend who joins): +200 points per friend

Total Potential: Up to 10,000+ points for top performers
```

### FR-3: Gamification Mechanics

**FR-3.1 Progress Tracking**
- **Visual Progress Bar**:
  - Shows tasks completed vs. total (3/5 tasks)
  - Percentage complete (60%)
  - Points earned so far (1,200/3,000 possible)
- **Task Checklist**:
  - ✅ Purchase Pumpkin Spice Latte (Completed)
  - ✅ Upload transformation video (Completed)
  - ✅ Share to TikTok (Completed)
  - ⏸️ Tag 3 friends (In Progress: 1/3 tagged)
  - 🔒 Get 10K views (Locked: Complete other tasks first)
- **Milestone Notifications**:
  - Push notification when task completed: "🎉 Task complete! You earned 500 points"
  - Progress milestone: "Halfway there! 3 more tasks to go"
  - Near completion: "You're so close! Just 1 task left"

**FR-3.2 Real-Time Leaderboard**
- **Public Leaderboard** (visible to all participants):
  - Rank, Username (first name + initial), Avatar, Score, Points Earned
  - Updated every 5 minutes during challenge
  - Top 10 highlighted with badges (🥇🥈🥉)
- **Personal Stats**:
  - Your rank: #47 out of 1,234 participants
  - Your score: 2,850 points
  - Distance to top 10: "780 points away from 10th place!"
  - Tasks completed: 5/5 (100%)
- **Competitive Notifications**:
  - "You moved up 5 ranks! Now #42"
  - "You've been overtaken! Now #48"
  - "Only 50 points from top 10!"
- **Leaderboard Calculation**:
```
Score = (Tasks Completed × 100) + (Points Earned × 1) + (Social Shares × 50) + (Referrals × 200)

Example:
- Tasks: 5/5 = 500 points
- Points Earned: 2,500 points
- Social Shares: 2 = 100 points
- Referrals: 3 friends joined = 600 points
Total Score: 3,700 points → Rank #23
```

**FR-3.3 Badges & Achievements**
- **Challenge-Specific Badges**:
  - "Early Bird" (joined within first hour)
  - "Perfectionist" (100% task completion)
  - "Social Butterfly" (shared to 3+ platforms)
  - "Trendsetter" (first to upload UGC)
  - "Viral Star" (post reached >10K views)
- **Leaderboard Badges**:
  - 🥇 1st Place Champion
  - 🥈 2nd Place Runner-Up
  - 🥉 3rd Place Bronze
  - 🏆 Top 10 Finisher
- **Badge Display**:
  - Shows on profile
  - Can be shared to social media
  - Counts toward overall gamification achievements

**FR-3.4 Social Unlocks & Friend Mechanics**
- **Team Challenges** (optional):
  - Create team of 2-10 members
  - Team progress = sum of individual progress
  - Team leaderboard (compete vs other teams)
  - Team rewards (bonus if entire team completes)
- **Friend Tagging Rewards**:
  - Tag friends in challenge post: +50 points per tag
  - If tagged friend joins: +200 points
  - If tagged friend completes: +500 points
- **Social Proof Sharing**:
  - "1,234 members joined this challenge"
  - "847 members completed it"
  - "Your friend Sarah is rank #3!"

### FR-4: Viral Amplification

**FR-4.1 Hashtag Optimization**
- **AI Hashtag Recommendations**:
  - Brand hashtag (always required): #BrandNameChallenge
  - Trend hashtag (if applicable): #PumpkinSpice, #FallVibes
  - Platform-specific hashtags:
    - TikTok: #TikTokMadeMeBuyIt, #ForYou, #Trending
    - Instagram: #InstaGood, #PhotoOfTheDay
  - Niche hashtags (category-specific): #CoffeeLover, #CafeAesthetic
- **Hashtag Performance Tracking**:
  - Total impressions per hashtag
  - Engagement rate per hashtag
  - User-generated posts using hashtag
  - Cross-platform reach

**FR-4.2 Example Content Generation**
- **AI-Generated Demo Video**:
  - Shows "how to participate" in 15-30 seconds
  - AI avatar explains challenge steps
  - Overlay text with hashtags, reward amounts
  - CTA at end: "Tap to join now!"
- **Customer Example Showcase**:
  - Feature best UGC submissions as examples
  - "Featured Participant" spotlight
  - Link to their profile (with permission)

**FR-4.3 Share Incentives**
- **Bonus Points for Sharing**:
  - Share challenge invite to Instagram Story: +100 points
  - Share your progress to TikTok: +300 points
  - Share completion post: +500 points
- **Pre-Populated Share Text**:
  - "I just joined the #PSLChallenge at @BrandName! Complete 3 tasks and win $50. Use my code SARAH123 to join: [link]"
  - Includes referral code automatically
- **One-Tap Sharing**:
  - iOS/Android native share sheet
  - Direct to Instagram, TikTok, Facebook, Twitter
  - Share as Story (ephemeral) or Feed post (permanent)

**FR-4.4 Viral Loop Mechanics**
```
Viral Loop:
1. Customer A joins challenge → Receives unique invite link
2. Customer A shares link to Instagram Story (reaches 500 followers)
3. 10 followers click link (2% CTR)
4. 3 followers join challenge (30% conversion)
5. Customer A earns 3 × 200 = 600 bonus points
6. Those 3 new customers repeat cycle → Secondary referrals

Viral Coefficient Calculation:
K = (New participants from shares) / (Total participants)
K = 3 / 1 = 3.0 (if every participant brings 3 more)

Realistic K for challenges: 0.10-0.15 (10-15% viral growth per challenge)
```

### FR-5: Real-Time Analytics

**FR-5.1 Live Challenge Dashboard**
- **Participation Metrics** (real-time):
  - Total participants (updates every 5 minutes)
  - Hourly join rate (chart showing spikes)
  - Completion rate (% who finished all tasks)
  - Dropout rate (% who joined but didn't complete)
- **Social Metrics** (hourly updates):
  - Hashtag impressions (TikTok + Instagram)
  - UGC posts created (count of posts with hashtag)
  - Social shares (clicks on share button)
  - Reach (estimated unique viewers)
- **Viral Metrics** (daily):
  - Viral coefficient (K-factor): New members / Participants
  - Referral rate (% of participants who invited friends)
  - Secondary referrals (referrals from referred customers)
  - Viral cycle time (avg days from join to refer)

**FR-5.2 Leaderboard Analytics**
- **Top Performers**:
  - Top 10 list with scores, completion time
  - Identify "super participants" (high score, high social shares)
  - Predict final winners based on current trajectory
- **Engagement Patterns**:
  - Peak activity hours (when do most people participate?)
  - Task completion order (which tasks done first?)
  - Bottleneck detection (which task has lowest completion rate?)

**FR-5.3 Predictive Analytics**
- **Mid-Challenge Projections**:
  - "Based on current pace, expect 450-550 participants by end"
  - "Viral coefficient trending toward 0.12 (good!)"
  - "Completion rate at 58%, slightly below target of 60%"
- **Optimization Recommendations**:
  - "Increase reward to boost participation"
  - "Simplify Task 3 (only 40% complete it)"
  - "Extend challenge by 3 days to hit participation goal"

**FR-5.4 Post-Challenge Report**
```
Final Challenge Report:
==========================================
Challenge: Pumpkin Spice Transformation
Duration: Oct 1-14, 2025 (14 days)
Status: Completed

Participation:
- Total Participants: 1,247
- Completion Rate: 64.3% (802 completed)
- Dropout Rate: 35.7% (445 dropped)
- Avg Completion Time: 8.2 days

Social Impact:
- UGC Posts Created: 1,189
- Hashtag Impressions: 287,400
- Total Reach: 143,200 unique users
- Social Shares: 2,134

Viral Metrics:
- New Members Acquired: 187 (15% growth)
- Viral Coefficient (K): 0.15
- Referral Rate: 42% (524 participants referred friends)
- Secondary Referrals: 34

Revenue Impact:
- Revenue Attributed: $12,450 (purchases during challenge)
- Avg Order Value: $15.53
- ROI: 8.3x (revenue / reward costs)

Top Performers:
1. Sarah J. - 9,870 points (5 tasks, 12 referrals, 23K views on TikTok)
2. Mike T. - 8,450 points (5 tasks, 9 referrals, 15K views)
3. Emma L. - 7,920 points (5 tasks, 8 referrals, 11K views)

Insights & Recommendations:
- Task 3 (Tag 3 friends) had lowest completion (45%). Consider reducing to 2 friends next time.
- Peak activity was 6-9pm weekdays. Schedule future challenges to launch at 6pm.
- Instagram generated 2x more shares than TikTok. Focus Instagram strategy.
- Viral coefficient beat target (0.15 vs 0.10). Repeat this format!

Next Steps:
- Send "Thank You" email to all participants
- Distribute prizes to top 10 winners
- Feature top UGC on website and social media
- Clone challenge for winter season with fresh trend
```

---

## Non-Functional Requirements

### NFR-1: Performance

- **Challenge Load Time**: <2 seconds (app/web)
- **Leaderboard Refresh**: Every 5 minutes (batch update)
- **Task Verification**: <3 seconds (purchase sync, UGC approval)
- **API Response Time**: <500ms (p95)
- **Concurrent Participants**: Support 10,000 per challenge
- **Database Queries**: Optimized for leaderboard (denormalized table)

### NFR-2: Scalability

- **Horizontal Scaling**: Auto-scale challenge tracking service based on active participants
- **Database**: Read replicas for leaderboard queries
- **Caching**: Redis cache for leaderboard (5-minute TTL)
- **CDN**: Challenge images, videos cached globally

### NFR-3: Reliability

- **Uptime**: 99.9% for challenge participation
- **Data Integrity**: No lost task completions (event sourcing)
- **Leaderboard Consistency**: Eventual consistency (5-min delay acceptable)
- **Backup**: Daily snapshots of challenge data

### NFR-4: Usability

- **Mobile-First**: 90% of participation happens on mobile
- **3-Tap Rule**: Join challenge within 3 taps from app home
- **Progress Visibility**: Always show progress (not buried in menus)
- **Notifications**: Push for task completion, rank changes, challenge end

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Web    │  │  Mobile  │  │  Admin   │     │
│  │Dashboard │  │   App    │  │Dashboard │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└───────────────────┬─────────────────────────────┘
                    │ REST API
┌───────────────────┴─────────────────────────────┐
│      NestJS Backend (Challenge Services)        │
│  ┌────────────────────────────────────────┐    │
│  │  Challenge Lifecycle Services          │    │
│  │  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │ Trend        │  │ Challenge    │   │    │
│  │  │ Scraping     │  │ Builder      │   │    │
│  │  └──────────────┘  └──────────────┘   │    │
│  │  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │ Participation│  │ Leaderboard  │   │    │
│  │  │ Tracking     │  │ Engine       │   │    │
│  │  └──────────────┘  └──────────────┘   │    │
│  └────────────────────────────────────────┘    │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────┴─────────────────────────────┐
│       Infrastructure & Data Layer               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │PostgreSQL│  │  Redis   │  │ TikTok   │     │
│  │(Metadata)│  │(Cache)   │  │   API    │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Instagram │  │  GPT-4o  │  │Background│     │
│  │   API    │  │   API    │  │  Jobs    │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
```

### Key Services

**1. Trend Scraping Service**
- Cron job runs hourly
- Fetches trending data from TikTok/Instagram APIs
- Stores in PostgreSQL `trends` table
- ML model predicts lifecycle stage

**2. Challenge Builder Service**
- CRUD operations for challenges
- AI integration for template generation
- Validation (rewards budget, task feasibility)

**3. Participation Tracking Service**
- Records customer joins
- Tracks task completions
- Calculates scores
- Updates leaderboard cache

**4. Leaderboard Engine**
- Denormalized table: `challenge_leaderboards`
- Background job updates every 5 minutes
- Redis cache for ultra-fast reads
- Push notifications for rank changes

---

## Database Schema

See: `/Users/channaly/nxloy/packages/database/prisma/schema/challenges.prisma`

**Key Models**:
- `Challenge` - Challenge metadata, tasks, rewards
- `ChallengeParticipation` - Customer progress, task completions
- `ChallengeLeaderboard` - Denormalized leaderboard view

---

## API Specifications

### Endpoint: Create Challenge (AI-Powered)

**POST /api/challenges/create-ai**

**Request**:
```json
{
  "goal": "Promote fall menu",
  "targetAudience": "ALL_MEMBERS",
  "budget": 5000,
  "duration": 14,
  "preferredPlatforms": ["tiktok", "instagram"]
}
```

**Response** (200 OK):
```json
{
  "recommendations": [
    {
      "id": "rec_1",
      "name": "Pumpkin Spice Transformation Challenge",
      "trendSource": "TIKTOK",
      "trendData": {
        "hashtag": "#PSLChallenge",
        "growth": "+450% in 24h",
        "posts": 12400,
        "stage": "RISING"
      },
      "viralScore": 85,
      "predictedParticipants": "400-600",
      "predictedKFactor": 0.12,
      "template": {
        "tasks": [...],
        "rewards": {...},
        "hashtags": [...]
      }
    },
    // ... 4 more recommendations
  ]
}
```

### Endpoint: Join Challenge

**POST /api/challenges/:id/join**

**Response** (200 OK):
```json
{
  "participationId": "part_123",
  "challengeId": "chal_456",
  "status": "JOINED",
  "tasks": [
    {"id": "task_1", "type": "PURCHASE", "completed": false},
    {"id": "task_2", "type": "VIDEO_UPLOAD", "completed": false},
    {"id": "task_3", "type": "SOCIAL_SHARE", "completed": false}
  ],
  "progress": "0/3 tasks (0%)",
  "pointsEarned": 100,
  "rank": null,
  "message": "Welcome to the challenge! Complete tasks to climb the leaderboard."
}
```

---

## Viral Mechanics

### Viral Coefficient (K-Factor) Formula

```
K = (New Members from Challenge) / (Total Challenge Participants)

Example:
- 1,000 customers participate in challenge
- 120 new customers join via challenge referrals
- K = 120 / 1,000 = 0.12

Interpretation:
- K < 1.0: Sub-viral (still reduces CAC, drives growth)
- K = 1.0: Self-sustaining (each participant brings 1 more)
- K > 1.0: Viral (exponential growth)

NxLoy Target: K = 0.10-0.15 per challenge
- Run 4 challenges/month → 40-60% monthly growth
- Compounds over time → 10x growth in 6 months
```

### Optimization Levers

**Increase K-Factor**:
1. **Higher Rewards**: 2x reward = 1.5x participation
2. **Easier Tasks**: Reduce friction (3 tasks vs 5)
3. **Social Incentives**: Bonus for friend referrals
4. **Trend Alignment**: Ride viral trends (5-10x reach)
5. **Public Leaderboards**: FOMO drives competition

---

## Implementation Phases

### Phase 2A: Trend Scraping & Basic Challenges (Week 4-6)

**Deliverables**:
- TikTok/Instagram API integration
- Trend data scraping (sounds, hashtags)
- Manual challenge creation (templates)
- Basic participation tracking
- Simple leaderboard (no real-time)

**Success Criteria**:
- 10+ trending topics detected daily
- Businesses can create challenges in <15 minutes
- 80%+ challenge completion rate

### Phase 2B: AI Challenge Builder (Week 6-8)

**Deliverables**:
- GPT-4o integration for challenge generation
- Viral prediction model (basic heuristics)
- 5 AI-recommended challenge formats
- Hashtag optimization

**Success Criteria**:
- AI recommendations in <30 seconds
- 70%+ prediction accuracy (participation)
- 50%+ adoption of AI suggestions

### Phase 2C: Real-Time Leaderboards & Analytics (Week 8-10)

**Deliverables**:
- Denormalized leaderboard table
- Redis caching (5-min refresh)
- Push notifications for rank changes
- Viral analytics dashboard (K-factor tracking)

**Success Criteria**:
- Leaderboard loads in <1 second
- 40%+ daily leaderboard engagement
- K-factor > 0.10 per challenge

---

## Dependencies

**External APIs**:
- TikTok Creator Marketplace API (trend data)
- Instagram Graph API (hashtag tracking)
- GPT-4o API (challenge generation)

**Internal Services**:
- UGC Service (task verification via photo/video uploads)
- Loyalty Points Service (award points for tasks)
- Notification Service (push for rank changes, completions)

---

## Risk Mitigation

### Risk 1: Trend Data Stale

**Mitigation**: Hourly scraping + ML prediction of trend peak

### Risk 2: Low Participation

**Mitigation**: A/B test rewards, optimize tasks, send reminders

### Risk 3: Fake Participation

**Mitigation**: Verified task completion, device fingerprinting

---

## Conclusion

Viral Challenges Builder is the **highest-ROI feature** for driving exponential growth (K = 0.10-0.15 per challenge). Combined with referrals and UGC, NxLoy achieves K = 0.5-0.7 overall.

**Timeline**: 6 weeks to production release.

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-09
**Author**: Claude Code + Product Team
