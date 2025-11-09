# UGC & AI Content Automation - Feature Specification

**Feature**: User-Generated Content (UGC) & Business-Generated Content (BGC) with AI Automation
**Version**: 1.0.0
**Status**: 🟢 Ready for Implementation
**Priority**: P1 (Critical for Viral Growth - Phase 1)
**Phase**: Phase 1 (Months 1-3)
**Teams**: Backend, Web, Mobile, AI/ML, Infrastructure
**Estimated Effort**: 4 weeks
**Target Release**: 2026-Q1
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
10. [Security & Compliance](#security--compliance)
11. [Analytics & Metrics](#analytics--metrics)
12. [Implementation Phases](#implementation-phases)
13. [Dependencies](#dependencies)
14. [Risk Mitigation](#risk-mitigation)

---

## Problem Statement

### Current Challenge

**For SMBs**:
- Creating engaging marketing content is time-consuming (6+ hours per campaign)
- Hiring copywriters ($50-150/hour) and designers ($100-200/hour) is expensive
- Lack in-house expertise for personalization and A/B testing
- Manual content creation doesn't scale beyond 1-2 campaigns/month
- No systematic way to leverage customer content for marketing

**For Customers**:
- No incentive to create and share content about brands
- Reviews/photos rarely earn meaningful rewards
- Unclear how/where to share content for brand visibility
- Manual review submission is tedious (fill forms, upload separately)

### Business Impact

**Market Evidence**:
- 90% of consumers trust UGC more than traditional advertising
- Products with UGC on product pages see **270% conversion increase**
- Loyalty members submit **188% more photo reviews** than non-members
- 50% higher conversion rates when UGC included on website
- SMBs spend **£200-400/month on AI tools** with positive ROI in 3-6 months

**Revenue Opportunity**:
- **$552K/year revenue lift** per customer from UGC conversion improvements
- **$46K/year time savings** (76.5 hours/month × $50/hour)
- **97-99% cost reduction** for content generation vs traditional methods
- **$3.142M total ARR** potential from AI/viral features combined (Year 2)

**Competitive Gap**:
- **Yotpo**: Has UGC collection but NO AI content generation
- **LoyaltyLion**: NO UGC features, NO AI capabilities
- **Smile.io**: NO UGC features, NO AI capabilities
- **NxLoy Opportunity**: Only platform with AI-native UGC + BGC automation

### Why This Matters

**Customer Behavior Shifts**:
- **68% of Gen Z** discovered new products on social media in 2024 (up from 60% in 2023)
- **97% of Gen Z** use social for shopping research (default to TikTok/Instagram, not Google)
- **UGC market**: $7.6B in 2025 (69% YoY growth)
- **Social commerce**: $71.62B in 2024 (26% growth)

**Proven ROI**:
- **Sephora**: 20 points per review = 32% increase in submissions + 15% conversion rise
- **Tarte**: $105.88M TikTok Shop revenue from UGC-driven creator strategy
- **Headway App**: 3.3B impressions in 6 months from AI-generated video content
- **Grammarly**: 20% conversion uplift from AI-powered personalized emails

---

## Solution Summary

Build an AI-powered content automation system that:

### For User-Generated Content (UGC)

1. **Multi-Platform Collection**
   - Direct uploads via web/mobile app (photos, videos, text reviews)
   - Auto-ingest from Instagram tagged posts
   - Auto-ingest from TikTok branded hashtags
   - Facebook/Twitter mentions scraping

2. **AI Quality Scoring** (0-100 scale)
   - Image analysis: Resolution, lighting, product focus, composition
   - Video analysis: Engagement hooks, pacing, music, faces detected
   - Text analysis: Sentiment, helpfulness, length, grammar quality
   - Virality prediction: Trend alignment, shareability factors, emotional resonance

3. **Automated Reward Distribution**
   - **Quality Tiers**:
     - Basic (0-40): 100 points
     - Good (41-70): 200 points
     - Excellent (71-90): 500 points
     - Viral Potential (91-100): 1,000 points
   - **Bonus Points**: +300 for sharing to social media
   - **Viral Bonus**: +1,000 for achieving >10K views

4. **AI Content Moderation**
   - Automated spam/profanity/inappropriate content filtering
   - Fake review detection (verified purchase validation)
   - Brand safety screening (competitor mentions, negative sentiment)
   - Human review escalation for flagged content

### For Business-Generated Content (BGC)

1. **AI Copywriting Service** (GPT-4o)
   - Email subject line generation (A/B test variants)
   - Personalized email body copy (name, purchase history, tier)
   - SMS character optimization (160-char perfection)
   - Push notification hooks (urgency, curiosity, value prop)
   - Multilingual translation (50+ languages)

2. **AI Image Generation** (DALL-E 3 / Midjourney)
   - Campaign visuals (seasonal promos, product launches)
   - Social media graphics (Instagram posts, Stories, TikTok covers)
   - Email headers and banners
   - Reward tier badges (Bronze, Silver, Gold designs)

3. **AI Video Generation** (HeyGen / D-ID)
   - Product demo videos (AI avatars explaining rewards)
   - Customer testimonial synthesis (text review → video avatar)
   - Multilingual spokesperson videos (global reach)
   - Animated explainer videos (how loyalty program works)

4. **Dynamic Content Personalization**
   - Behavioral trigger emails (abandoned cart, points expiration)
   - Product recommendations based on browsing/purchase history
   - Dynamic reward descriptions ("You're 50 points from Gold!")
   - Lifecycle stage messaging (new member vs. VIP)

### Key Technologies

**AI/ML Stack**:
- OpenAI GPT-4o API (copywriting, translations)
- OpenAI DALL-E 3 API (image generation)
- OpenAI Vision API (image quality analysis, moderation)
- HeyGen / D-ID (AI avatar video generation)
- Custom ML models (virality prediction, sentiment analysis)

**Backend Stack** (NestJS):
- AI Content Service (GPT-4o integration, caching, RAG)
- UGC Management Service (upload, ingestion, moderation)
- Quality Scoring Service (Vision API, custom scoring)
- Reward Distribution Service (points calculation, auto-award)

**Storage & CDN**:
- AWS S3 (content storage)
- CloudFront (CDN for fast delivery)
- PostgreSQL (metadata, quality scores, moderation logs)

**External Platform APIs**:
- Instagram Graph API (tagged post ingestion)
- TikTok Creator Marketplace API (hashtag tracking)
- Stripe (payment for premium AI features)

---

## Success Criteria

| Metric | Current Baseline | Target (Phase 1 - Month 3) | Target (Month 6) | Measurement Method |
|--------|------------------|----------------------------|------------------|--------------------|
| **UGC Submission Rate** | 5% (industry avg) | 20%+ | 30%+ | (Submissions / Active Loyalty Members) × 100 |
| **AI Quality Score Accuracy** | N/A | 80%+ agreement with human | 90%+ | Compare AI score to human moderator score |
| **Automated Reward Distribution** | 0% | 95%+ auto-approved | 98%+ | (Auto-approved / Total submissions) × 100 |
| **UGC Social Sharing Rate** | 30% (baseline) | 50%+ | 70%+ | (Shares to social / Total submissions) × 100 |
| **BGC Email Open Rate Lift** | 18% (baseline) | 26% lift (22.7%) | 30% lift (23.4%) | Personalized AI vs generic |
| **BGC Email CTR Lift** | 1.5% (baseline) | 41% lift (2.1%) | 50% lift (2.25%) | Personalized AI vs generic |
| **Time Savings (BGC)** | 0 hours | 60+ hours/month | 76.5 hours/month | Manual time - AI time |
| **Cost Savings (BGC)** | $0 | 95%+ vs designers | 97%+ vs designers | (Manual cost - AI cost) / Manual cost |
| **UGC Conversion Lift** | 2% (baseline) | 50% lift (3%) | 166% lift (5.32%) | Conversion with UGC vs without |
| **Content Moderation SLA** | N/A | <5 min for AI approval | <2 min for AI approval | Time from upload to decision |
| **False Positive Rate** | N/A | <5% | <2% | Incorrectly flagged content / Total |
| **False Negative Rate** | N/A | <1% | <0.5% | Missed inappropriate content / Total |
| **GDPR Consent Rate** | N/A | 70%+ opt-in | 80%+ opt-in | Customers consenting to UGC usage |
| **API Uptime (AI Services)** | N/A | 99.5% | 99.9% | Uptime / Total time |

**Revenue Impact Targets**:
- **Month 3**: $50K additional revenue from UGC conversion lift (per 100 businesses)
- **Month 6**: $150K additional revenue + $50K time savings value
- **Year 1**: $552K average revenue lift per customer business

---

## User Stories

### Primary User Story: Business Owner Creates AI Campaign

**As a** coffee shop owner
**I want** to generate a personalized email campaign for my loyalty members using AI
**So that** I can save time and increase engagement without hiring a copywriter

**Acceptance Criteria**:
- [ ] Given I'm on the campaign creation page, when I click "Generate with AI", then I see a form to describe my campaign goal
- [ ] Given I enter "Promote new fall menu to Gold tier members", when AI generates copy, then I see 3 subject line variants and personalized body copy within 30 seconds
- [ ] Given AI-generated copy, when I review it, then I can edit any section before sending
- [ ] Given I approve the campaign, when I click "Send", then emails are sent to all Gold members with personalized names and recommendations
- [ ] Given the campaign is sent, when I check analytics, then I see open rate, CTR, and conversion tracking

### User Story: Customer Uploads Photo for Points

**As a** loyal customer
**I want** to upload a photo of my purchase and earn points automatically
**So that** I can get rewarded quickly without filling out long forms

**Acceptance Criteria**:
- [ ] Given I purchased a product, when I open the app and tap "Earn Points for Photo", then I see a camera interface
- [ ] Given I take a photo, when I submit it, then AI analyzes quality within 5 seconds
- [ ] Given AI scores my photo as "Excellent" (80/100), when analysis completes, then I instantly see "+500 points" and updated balance
- [ ] Given I earned points, when I tap "Share to Instagram", then I see a pre-populated post with hashtags and my referral code
- [ ] Given I share to Instagram, when the post goes live, then I earn +300 bonus points

### User Story: Customer Shares UGC on Social Media

**As a** Instagram-savvy customer
**I want** my Instagram post to automatically count toward my loyalty rewards
**So that** I don't have to manually upload the same content twice

**Acceptance Criteria**:
- [ ] Given I post a photo on Instagram, when I tag @BrandName and use #BrandNameLoyalty, then NxLoy auto-detects the post within 1 hour
- [ ] Given NxLoy detected my post, when AI analyzes it, then I receive a push notification: "We saw your post! You earned 200 points"
- [ ] Given my post gets 10K+ views, when the threshold is reached, then I earn +1,000 viral bonus points
- [ ] Given I earned rewards, when I check my app, then I see the Instagram post linked to my point transaction

### User Story: Business Moderates UGC Queue

**As a** marketing manager
**I want** to review UGC that AI flagged for moderation
**So that** I can ensure brand-safe content appears on my website

**Acceptance Criteria**:
- [ ] Given customers uploaded 100 photos today, when I check the moderation dashboard, then I see 95 auto-approved and 5 flagged for review
- [ ] Given a flagged photo, when I view it, then I see AI's reasoning ("Low quality score: 35/100, blurry image")
- [ ] Given I review the photo, when I decide to approve it, then the customer gets their 100 points retroactively
- [ ] Given I reject a photo, when I select a reason (spam, inappropriate, off-topic), then the customer receives a notification explaining why
- [ ] Given a customer's content is repeatedly rejected, when fraud patterns emerge, then their account is flagged for investigation

### User Story: Business Generates AI Video

**As a** boutique owner
**I want** to create a product demo video using AI
**So that** I can post to TikTok without hiring a videographer

**Acceptance Criteria**:
- [ ] Given I'm creating a video, when I select "AI Video Generator", then I see templates (Product Demo, How-To, Customer Testimonial)
- [ ] Given I choose "Product Demo", when I upload product images and enter a description, then AI generates a script within 1 minute
- [ ] Given AI script, when I select an avatar (gender, age, ethnicity), then I see a preview of the AI spokesperson
- [ ] Given I approve, when AI renders the video, then I receive a 30-second MP4 within 5 minutes
- [ ] Given the video is ready, when I download it, then I can post directly to TikTok, Instagram Reels, or YouTube Shorts

---

## Functional Requirements

### FR-1: UGC Upload & Ingestion

**FR-1.1 Direct Upload (Web/Mobile)**
- Support photo uploads (JPEG, PNG, HEIC, max 10MB)
- Support video uploads (MP4, MOV, WebM, max 100MB, max 60 seconds)
- Support text reviews (max 2,000 characters)
- Combined photo + text reviews
- Combined video + text reviews
- Mobile camera capture with real-time filters
- Drag-and-drop upload on web
- Progress indicator for large files (>5MB)
- Automatic EXIF data removal (privacy)
- Thumbnail generation for videos (first frame + mid-point)

**FR-1.2 Instagram Integration**
- OAuth authentication for Instagram account linking
- Webhook listener for tagged posts (@BrandName)
- Hashtag monitoring (#BrandNameLoyalty, custom hashtags)
- Auto-ingest posts within 1 hour of posting
- Store Instagram post ID, permalink, like/comment counts
- Periodic sync for engagement metrics (daily)

**FR-1.3 TikTok Integration**
- OAuth authentication for TikTok account linking
- Hashtag monitoring via TikTok API
- Auto-ingest videos with brand hashtags
- Store TikTok video ID, view count, engagement metrics
- Periodic sync for virality tracking (hourly)

**FR-1.4 Content Metadata**
- Caption/review text
- Product association (optional: link to SKU)
- Location (GPS coordinates, city)
- Timestamp (upload time, original capture time)
- Platform source (app, web, instagram, tiktok)
- Device info (for fraud detection)

### FR-2: AI Quality Scoring

**FR-2.1 Image Quality Analysis**
- **Resolution Score** (0-25 points):
  - <720p: 0-10 points
  - 720p-1080p: 11-20 points
  - >1080p (4K): 21-25 points
- **Composition Score** (0-25 points):
  - Rule of thirds alignment
  - Subject in focus
  - Proper framing (not cropped/cut-off)
  - Background clarity (not too busy)
- **Lighting Score** (0-25 points):
  - Proper exposure (not too dark/bright)
  - Natural vs artificial lighting preference
  - Shadow/highlight balance
- **Product Focus Score** (0-25 points):
  - Product clearly visible (object detection)
  - Product is primary subject (bounding box size)
  - Brand logo/packaging visible

**FR-2.2 Video Quality Analysis**
- **Technical Quality** (0-30 points):
  - Resolution (720p minimum for points)
  - Frame rate (30fps minimum)
  - Audio quality (if present)
  - Stabilization (shaky video penalized)
- **Engagement Factors** (0-40 points):
  - Hook within first 3 seconds (face detection, text overlay)
  - Music/trending sound usage
  - Face presence (human connection)
  - Pacing (scene changes every 2-3 seconds)
- **Content Quality** (0-30 points):
  - Product demonstration (in-use vs static)
  - Clear value proposition
  - Call-to-action present
  - Duration (15-30 seconds ideal for social)

**FR-2.3 Text Review Quality**
- **Sentiment Score** (-1 to +1, normalized to 0-30 points):
  - Positive: +0.5 to +1.0 → 20-30 points
  - Neutral: -0.5 to +0.5 → 10-20 points
  - Negative: -1.0 to -0.5 → 0-10 points (still awarded, transparency)
- **Helpfulness Score** (0-30 points):
  - Length (50-300 words ideal)
  - Specific details (mentions features, uses)
  - Comparison to alternatives
  - Context (occasion, use case)
- **Grammar & Readability** (0-20 points):
  - Proper spelling/grammar
  - Sentence structure
  - Readability (Flesch-Kincaid score)
- **Authenticity Score** (0-20 points):
  - Not copy-pasted from other reviews
  - Unique phrasing (plagiarism check)
  - Verified purchase badge (+10 bonus)

**FR-2.4 Virality Prediction**
- **Trend Alignment** (0-30 points):
  - Uses trending sounds/music (TikTok)
  - Follows trending formats (POV, Day-in-life)
  - Includes viral hashtags
- **Shareability Factors** (0-30 points):
  - Emotional resonance (joy, surprise, inspiration)
  - Novelty (unique angle)
  - Relatability (common experience)
  - Humor or entertainment value
- **Social Proof Potential** (0-20 points):
  - Likely to generate comments (questions, debates)
  - Likely to be tagged (tagging friends)
  - Likely to be shared (reaction-worthy)
- **Network Effect Signals** (0-20 points):
  - Creator's network size (if known via social graph)
  - Cross-platform potential (works on multiple platforms)
  - Meme-ability (easy to recreate/remix)

**FR-2.5 Quality Score Calculation**
```
Total Quality Score =
  (Image/Video/Text Quality) × 0.60 +
  (Virality Prediction) × 0.40

Result: 0-100 scale
```

### FR-3: Automated Reward Distribution

**FR-3.1 Point Awarding Logic**
```
Base Points (by quality tier):
- Basic (0-40): 100 points
- Good (41-70): 200 points
- Excellent (71-90): 500 points
- Viral Potential (91-100): 1,000 points

Bonus Multipliers:
- Verified Purchase: +50 points
- First Submission: +100 points (encourages adoption)
- Social Share to Instagram/TikTok: +300 points
- Viral Achievement (>10K views): +1,000 points
- Featured Content (business showcases it): +500 points

Penalty Modifiers:
- Duplicate content (same photo uploaded twice): -50%
- Low effort (blurry, dark, cropped): Already reflected in quality score
```

**FR-3.2 Automatic Distribution**
- Points credited immediately upon AI approval (<5 min from upload)
- Push notification sent to customer: "You earned 200 points for your photo!"
- Transaction logged in loyalty points ledger
- Email confirmation with breakdown: "Quality: 75/100 (Excellent) = 500 points"

**FR-3.3 Retroactive Rewards**
- If AI auto-rejects but human approves, award points retroactively
- If viral bonus threshold reached later, award +1,000 points automatically
- Transaction history shows both initial and bonus awards

### FR-4: Content Moderation

**FR-4.1 AI Automated Moderation (Tier 1)**
- **Auto-Approve** if:
  - Quality score ≥ 60
  - Sentiment score ≥ 0.3 (neutral to positive)
  - No profanity detected (Perspective API)
  - No inappropriate imagery (AWS Rekognition)
  - No competitor brand mentions
  - Verified purchase (if product-linked)
- **Auto-Reject** if:
  - Quality score < 20 (too low to be useful)
  - Profanity score > 80 (Perspective API)
  - Inappropriate content detected (nudity, violence)
  - Spam patterns (duplicate text, promotional links)
  - Fake review signals (verified via device fingerprint)
- **Flag for Human Review** if:
  - Quality score 20-59 (borderline)
  - Mixed sentiment (negative but detailed)
  - Competitor mention (context matters)
  - First-time user (fraud risk)
  - High engagement but low quality (investigate why)

**FR-4.2 Human Moderation Queue (Tier 2)**
- Dashboard shows flagged items sorted by priority:
  1. High priority: Potential fake reviews, fraud flags
  2. Medium priority: Quality borderline, negative sentiment
  3. Low priority: First-time user, manual review requested
- Moderator sees:
  - Content preview (image/video/text)
  - AI analysis breakdown (quality score, sentiment, flags)
  - Customer history (past submissions, approval rate)
  - Recommendation: "Approve" or "Reject" with confidence %
- Moderator actions:
  - Approve (override AI rejection)
  - Reject (confirm AI flag, select reason)
  - Request changes (ask customer to resubmit)
  - Escalate (send to senior moderator / legal)
- SLA: Human review completed within 24 hours

**FR-4.3 Brand Safety Filters**
- **Competitor Blacklist**:
  - Configurable list of competitor brand names
  - Auto-flag if mentioned (but allow context: "Better than [Competitor]" may be positive)
- **Profanity Detection**:
  - Google Perspective API (toxicity, profanity, threat scores)
  - Threshold: >70 = auto-reject, 40-70 = flag, <40 = approve
- **Inappropriate Imagery**:
  - AWS Rekognition (nudity, violence, suggestive content)
  - Threshold: "Explicit" = auto-reject, "Suggestive" = flag
- **Spam Patterns**:
  - Duplicate text across multiple submissions
  - Promotional links (bit.ly, discount codes)
  - Generic template language ("Great product! 5 stars!")

### FR-5: AI Copywriting Service (BGC)

**FR-5.1 Email Campaign Generation**
- **Input**:
  - Campaign goal (promote fall menu, re-engage inactive customers, new product launch)
  - Target audience (all members, Gold tier, churned customers)
  - Key message points (3-5 bullet points)
  - Brand voice (friendly, professional, playful)
  - Product details (pulled from database via RAG)
- **Output**:
  - 3 subject line variants (short, question, urgency)
  - Personalized body copy with:
    - Greeting: "Hi {{firstName}},"
    - Personalized recommendation: "Based on your love for lattes, try our new Pumpkin Spice"
    - Loyalty context: "You're only 50 points from Gold!"
    - Call-to-action: "Redeem your 500 points today"
  - Preview text (mobile inbox snippet)
  - Plain-text version (accessibility)
- **Personalization Variables**:
  - {{firstName}}, {{lastName}}, {{tierName}}, {{pointsBalance}}
  - {{daysSincePurchase}}, {{favoriteProduct}}, {{avgOrderValue}}
  - {{pointsToNextTier}}, {{expiringPoints}}, {{birthdayMonth}}

**FR-5.2 SMS Campaign Generation**
- **Input**: Same as email, plus character limit (160 standard, 306 concatenated)
- **Output**:
  - Optimized SMS text (every character counts)
  - Example: "Sarah, your 500 pts expire in 3 days! Use code SAVE10 for $10 off. Tap: bit.ly/abc123"
  - Shortened URLs auto-generated
  - Emoji usage (if brand voice allows): "🎉"

**FR-5.3 Push Notification Generation**
- **Input**: Notification type (points earned, tier upgrade, reward available, cart abandonment)
- **Output**:
  - Title (max 65 chars): "Congrats! You're now Gold 🏆"
  - Body (max 240 chars): "Enjoy 2x points on all purchases + free shipping. Shop now!"
  - Action buttons: "Shop Now", "View Rewards"
  - Deep link URL: `nxloy://rewards/catalog`

**FR-5.4 Multilingual Translation**
- Translate any generated content to 50+ languages
- Maintain tone and personalization in translation
- Cultural adaptation (idioms, currency, local holidays)
- Example: "Black Friday" → "Singles Day" for China

**FR-5.5 A/B Test Variant Generation**
- Generate 5-10 variants for testing:
  - Subject line styles: Question, Statement, Urgency, Curiosity, Benefit
  - CTA button text: "Claim Reward", "Get My Points", "Shop Now", "Redeem"
  - Email layout: Text-heavy, Image-heavy, Minimalist
  - Tone: Friendly, Professional, Playful

### FR-6: AI Image Generation (BGC)

**FR-6.1 Campaign Visual Creation**
- **Input**:
  - Campaign theme (seasonal, product launch, loyalty milestone)
  - Style (modern, vintage, minimalist, bold)
  - Color palette (brand colors auto-pulled)
  - Text overlay (headline, subheadline, CTA)
  - Format (Instagram Post 1:1, Story 9:16, Email Header 600x200)
- **Output**:
  - High-resolution image (1080x1080 for Instagram, 1920x1080 for email header)
  - Brand logo placement (customizable position)
  - Text overlay with readable typography
  - Download formats: PNG (transparency), JPEG (web-optimized)

**FR-6.2 Social Media Graphics**
- Pre-built templates:
  - Instagram Post (1080x1080): Product announcement, customer spotlight, points reminder
  - Instagram Story (1080x1920): Flash sale, daily deal, tier upgrade announcement
  - TikTok Cover (1080x1920): Video thumbnail, challenge cover
  - Facebook Post (1200x630): Link preview, event announcement

**FR-6.3 Reward Tier Badges**
- Auto-generate badge designs for Bronze, Silver, Gold, Platinum tiers
- Customizable:
  - Shape (circle, shield, star, hexagon)
  - Color scheme (brand colors)
  - Icon (crown, trophy, gem, ribbon)
  - Text (tier name)
- Output: SVG (scalable) + PNG (1024x1024 for high-res)

**FR-6.4 Dynamic Product Images**
- Generate lifestyle images of products:
  - Input: Product photo (isolated on white background)
  - Output: Product in lifestyle setting (coffee cup on desk, clothing on model)
  - Use cases: Email campaigns, social posts, website banners

### FR-7: AI Video Generation (BGC)

**FR-7.1 AI Avatar Video**
- **Avatar Selection**:
  - 20+ pre-built avatars (diverse genders, ages, ethnicities)
  - Custom avatar (upload photo, train model - premium feature)
- **Script Input**:
  - Manually write script OR
  - AI-generate script from bullet points
  - Max length: 300 words (approx. 90 seconds of speech)
- **Voice Customization**:
  - Accent/language (50+ languages, 200+ voices)
  - Tone (friendly, professional, enthusiastic, calm)
  - Speech speed (0.5x to 2x)
- **Output**:
  - MP4 video (1080p, 30fps)
  - Multiple formats: Square (1:1), Vertical (9:16), Horizontal (16:9)
  - Subtitles auto-generated (SRT file + burned-in)

**FR-7.2 Product Demo Video**
- **Input**:
  - Product images (3-5 photos from different angles)
  - Product description (AI summarizes into talking points)
  - Background music (royalty-free library OR upload own)
- **Output**:
  - 15-30 second video showcasing product
  - Transitions between images (fade, slide, zoom)
  - Text overlays highlighting key features
  - CTA at end ("Scan QR code to earn points")

**FR-7.3 Customer Testimonial Video**
- **Input**:
  - Text review from customer (pull from UGC database)
  - Customer's photo (optional, with consent) OR stock avatar
- **Output**:
  - AI avatar reads the review as a testimonial
  - Background: Customer's photo OR branded background
  - Text overlay shows customer name, rating (5 stars)
  - 30-60 seconds

### FR-8: Dynamic Content Personalization

**FR-8.1 Behavioral Triggers**
- **Abandoned Cart**:
  - Trigger: Customer adds items but doesn't complete purchase within 1 hour
  - Content: "You left {{productName}} in your cart. Complete your purchase and earn {{pointsEstimate}} points!"
  - Personalization: Show cart items, points they'd earn, discount if VIP tier
- **Points Expiration**:
  - Trigger: Customer has points expiring within 7 days
  - Content: "Don't lose your {{expiringPoints}} points! They expire on {{expirationDate}}. Redeem now for {{rewardSuggestion}}."
  - Personalization: Suggest rewards they can afford with expiring points
- **Tier Upgrade Proximity**:
  - Trigger: Customer within 100 points of next tier
  - Content: "You're so close! Just {{pointsToUpgrade}} more points to reach {{nextTier}}. Enjoy {{tierBenefits}}."
- **Inactivity Re-engagement**:
  - Trigger: No purchase in 30+ days
  - Content: "We miss you, {{firstName}}! Here's 100 bonus points to welcome you back. Your favorite {{favoriteProduct}} is back in stock."

**FR-8.2 Product Recommendations**
- **Collaborative Filtering**:
  - "Customers like you also redeemed: {{products}}"
  - Based on similar purchase history, tier, demographics
- **Content-Based**:
  - "Since you loved {{pastProduct}}, try {{similarProduct}}"
  - Attribute matching (category, price range, brand)
- **Trending**:
  - "Top rewards this week: {{trendingRewards}}"

**FR-8.3 Dynamic Reward Descriptions**
- **Standard Description**: "Free Medium Coffee - Redeem 500 points"
- **Personalized Version**:
  - For frequent coffee buyer: "Your favorite Medium Latte - Redeem 500 points (you have {{pointsBalance}})"
  - For rare visitor: "Try our best-selling Medium Latte - Redeem 500 points (earn points with every purchase!)"
  - For VIP: "Exclusive: Any Medium Drink Free - Redeem 500 points (VIP perk: free size upgrade!)"

---

## Non-Functional Requirements

### NFR-1: Performance

- **AI Response Times**:
  - Image quality analysis: <3 seconds (p95)
  - Video quality analysis: <10 seconds (p95)
  - Text quality analysis: <1 second (p95)
  - Copywriting generation: <30 seconds (p95)
  - Image generation: <45 seconds (p95)
  - Video generation: <5 minutes (p95)
- **API Latency**:
  - UGC upload endpoint: <500ms (excluding file upload time)
  - Quality score retrieval: <100ms
  - Moderation dashboard load: <1 second
- **Throughput**:
  - Handle 1,000 concurrent UGC uploads
  - Process 10,000 quality scores per hour
  - Generate 5,000 emails per hour

### NFR-2: Scalability

- **Horizontal Scaling**:
  - AI services: Auto-scale based on queue depth
  - UGC storage: S3 unlimited capacity
  - Database: Read replicas for analytics queries
- **Cost Optimization**:
  - Cache common prompts (FAQ emails, standard campaigns)
  - Use GPT-4o Mini for simple tasks (15x cheaper)
  - Batch API for non-urgent requests (50% discount)
  - CDN caching for generated images (reduce regeneration)

### NFR-3: Reliability

- **Uptime**: 99.9% for UGC upload, 99.5% for AI services
- **Data Durability**: 99.999999999% (S3 standard)
- **Backup**: Daily snapshots of UGC metadata
- **Disaster Recovery**: Cross-region replication (S3)

### NFR-4: Security

- **Authentication**: OAuth 2.0 for social platform integrations
- **Authorization**: RBAC for moderation dashboard access
- **Data Encryption**:
  - At rest: AES-256 (S3 server-side encryption)
  - In transit: TLS 1.3
- **API Keys**: OpenAI API keys stored in AWS Secrets Manager
- **Content Scanning**: Malware scanning for uploaded files (ClamAV)

### NFR-5: Compliance

- **GDPR**:
  - Explicit consent for UGC usage (checkbox on upload)
  - Right to be forgotten (delete content within 24 hours)
  - Data retention: Auto-delete UGC after 2 years (unless renewed consent)
  - Export: Provide all UGC data in machine-readable format
- **CCPA**: Same as GDPR (California residents)
- **Copyright**: DMCA takedown process (email dmca@nxloy.com)
- **Age Restrictions**: Users must be 13+ to submit UGC (COPPA)

### NFR-6: Usability

- **Mobile Upload**: <3 taps from app home to upload photo
- **Error Messages**: Clear, actionable (not "Error 500", but "Image too large. Please upload a file under 10MB.")
- **Accessibility**:
  - WCAG 2.1 AA compliance
  - Screen reader support
  - Alt text for all generated images
- **Multilingual**: Support 10 languages initially (EN, ES, FR, ZH, JA, KO, TH, VI, ID, MS)

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Web    │  │  Mobile  │  │  Admin   │     │
│  │ (Next.js)│  │ (RN/Expo)│  │Dashboard │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└───────────────────┬─────────────────────────────┘
                    │ REST API
┌───────────────────┴─────────────────────────────┐
│         NestJS Backend (Application Layer)      │
│  ┌────────────────────────────────────────┐    │
│  │  UGC & AI Content Services             │    │
│  │  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │ UGC Upload   │  │ AI Content   │   │    │
│  │  │ Service      │  │ Generation   │   │    │
│  │  └──────────────┘  └──────────────┘   │    │
│  │  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │ Quality      │  │ Moderation   │   │    │
│  │  │ Scoring      │  │ Service      │   │    │
│  │  └──────────────┘  └──────────────┘   │    │
│  └────────────────────────────────────────┘    │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────┴─────────────────────────────┐
│       Infrastructure & Data Layer               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │PostgreSQL│  │   S3     │  │ OpenAI   │     │
│  │(Metadata)│  │(Content) │  │   API    │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Instagram │  │  TikTok  │  │CloudFront│     │
│  │   API    │  │   API    │  │   (CDN)  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
```

### Service Architecture

#### 1. UGC Upload Service

**Responsibilities**:
- Handle file uploads (multipart/form-data)
- Validate file types and sizes
- Generate S3 pre-signed URLs (client-side upload)
- Store metadata in PostgreSQL
- Trigger quality scoring job

**Endpoints**:
- `POST /api/ugc/upload` - Initiate upload
- `POST /api/ugc/submit` - Finalize and submit for scoring
- `GET /api/ugc/:id` - Retrieve UGC details
- `DELETE /api/ugc/:id` - Delete UGC (GDPR)

**Technology**:
- NestJS controller + service
- Multer (file upload handling)
- AWS SDK (S3 pre-signed URLs)
- Prisma (database ORM)

#### 2. AI Quality Scoring Service

**Responsibilities**:
- Analyze images via OpenAI Vision API
- Analyze videos (extract frames, analyze key moments)
- Analyze text via sentiment analysis
- Calculate viral prediction score
- Store quality scores in database
- Trigger reward distribution

**Implementation**:
```typescript
// Pseudo-code structure
class QualityScoringService {
  async scoreImage(imageUrl: string): Promise<ImageQualityScore> {
    // Call OpenAI Vision API
    const analysis = await this.openai.vision.analyze(imageUrl, {
      prompt: "Analyze this image for: resolution, composition, lighting, product focus. Return JSON scores."
    });

    // Parse response
    const scores = {
      resolution: analysis.resolution_score,
      composition: analysis.composition_score,
      lighting: analysis.lighting_score,
      productFocus: analysis.product_focus_score
    };

    // Calculate total (weighted average)
    const totalScore =
      scores.resolution * 0.25 +
      scores.composition * 0.25 +
      scores.lighting * 0.25 +
      scores.productFocus * 0.25;

    return { totalScore, breakdown: scores };
  }

  async scoreVideo(videoUrl: string): Promise<VideoQualityScore> {
    // Extract keyframes (0%, 25%, 50%, 75%, 100%)
    const frames = await this.extractFrames(videoUrl, [0, 0.25, 0.5, 0.75, 1.0]);

    // Analyze each frame
    const frameScores = await Promise.all(
      frames.map(frame => this.scoreImage(frame))
    );

    // Calculate engagement factors
    const engagementScore = await this.analyzeEngagement(videoUrl);

    // Combine scores
    const avgFrameScore = frameScores.reduce((sum, s) => sum + s.totalScore, 0) / frames.length;
    const totalScore = avgFrameScore * 0.5 + engagementScore * 0.5;

    return { totalScore, frameScores, engagementScore };
  }

  async predictVirality(content: UGCSubmission): Promise<number> {
    // Custom ML model (future implementation)
    // For now, use heuristics:

    const factors = {
      trendAlignment: this.checkTrendAlignment(content.hashtags),
      shareability: this.calculateShareability(content.sentiment),
      socialProof: this.estimateSocialProof(content.platform),
      networkEffect: content.customerId ? await this.getNetworkSize(content.customerId) : 0
    };

    const viralityScore =
      factors.trendAlignment * 0.30 +
      factors.shareability * 0.30 +
      factors.socialProof * 0.20 +
      factors.networkEffect * 0.20;

    return viralityScore;
  }
}
```

#### 3. AI Content Generation Service

**Responsibilities**:
- Generate email copy via GPT-4o
- Generate images via DALL-E 3
- Generate videos via HeyGen API
- Cache common prompts (reduce API costs)
- Track usage per business (quota enforcement)

**RAG Implementation** (for grounding AI in facts):
```typescript
class AIContentService {
  async generateEmailCopy(campaign: CampaignInput): Promise<EmailCopy> {
    // 1. Retrieve product facts from database (RAG)
    const productData = await this.prisma.product.findMany({
      where: { businessId: campaign.businessId }
    });

    // 2. Build context prompt
    const context = `
      Business: ${campaign.businessName}
      Products: ${productData.map(p => p.name).join(', ')}
      Campaign Goal: ${campaign.goal}
      Target Audience: ${campaign.audience}
      Brand Voice: ${campaign.brandVoice}
    `;

    // 3. Generate email copy
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert email copywriter for loyalty programs. Generate compelling, personalized email copy based on the provided context. Do not hallucinate product details.' },
        { role: 'user', content: context }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // 4. Parse and return
    return this.parseEmailCopy(response.choices[0].message.content);
  }

  async generateImage(prompt: string, style: string): Promise<string> {
    // Check cache first
    const cacheKey = `img:${hash(prompt)}:${style}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    // Generate via DALL-E 3
    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt: `${style} style: ${prompt}`,
      n: 1,
      size: '1024x1024',
      quality: 'hd'
    });

    const imageUrl = response.data[0].url;

    // Upload to S3 (DALL-E URLs expire)
    const s3Url = await this.uploadToS3(imageUrl, `ai-generated/images/${uuid()}.png`);

    // Cache for 24 hours
    await this.redis.set(cacheKey, s3Url, 'EX', 86400);

    return s3Url;
  }
}
```

#### 4. Content Moderation Service

**Responsibilities**:
- Apply AI moderation rules (auto-approve/reject/flag)
- Manage human moderation queue
- Track moderation decisions (audit log)
- Send notifications to customers (approved/rejected)

**Moderation Workflow**:
```typescript
class ModerationService {
  async moderateContent(submissionId: string): Promise<ModerationDecision> {
    const submission = await this.prisma.uGCSubmission.findUnique({
      where: { id: submissionId }
    });

    // Step 1: AI Automated Checks
    const aiDecision = await this.runAIModeration(submission);

    if (aiDecision.decision === 'APPROVE') {
      // Auto-approve
      await this.approveSubmission(submissionId);
      return aiDecision;
    } else if (aiDecision.decision === 'REJECT') {
      // Auto-reject
      await this.rejectSubmission(submissionId, aiDecision.reason);
      return aiDecision;
    } else {
      // Flag for human review
      await this.flagForReview(submissionId, aiDecision.flags);
      return aiDecision;
    }
  }

  private async runAIModeration(submission: UGCSubmission): Promise<AIDecision> {
    const checks = {
      qualityScore: submission.qualityScore,
      sentimentScore: submission.sentimentScore,
      profanity: await this.checkProfanity(submission.caption),
      inappropriate: await this.checkInappropriate(submission.contentUrl),
      spam: await this.checkSpam(submission),
      competitorMention: await this.checkCompetitors(submission.caption)
    };

    // Decision logic
    if (checks.qualityScore >= 60 &&
        checks.sentimentScore >= 0.3 &&
        checks.profanity < 40 &&
        !checks.inappropriate &&
        !checks.spam &&
        !checks.competitorMention) {
      return { decision: 'APPROVE', confidence: 0.95 };
    }

    if (checks.qualityScore < 20 ||
        checks.profanity > 80 ||
        checks.inappropriate ||
        checks.spam) {
      return { decision: 'REJECT', reason: 'Quality/safety violation', confidence: 0.90 };
    }

    // Flag for human review
    return { decision: 'FLAG_FOR_REVIEW', flags: this.buildFlags(checks), confidence: 0.70 };
  }
}
```

---

## Database Schema

See: `/Users/channaly/nxloy/packages/database/prisma/schema/ugc.prisma`

**Key Models**:
- `UGCSubmission` - Main UGC table (photos, videos, reviews)
- `UGCModeration` - Moderation decisions log
- `UGCReport` - User-reported content

**Indexes** (for performance):
- `businessId, status` - Moderation dashboard queries
- `customerId` - Customer UGC history
- `qualityScore` - Reward tier filtering
- `viralityScore` - Viral content discovery
- `platform, externalId` - De-duplicate social platform posts

---

## API Specifications

### Endpoint: Upload UGC

**POST /api/ugc/upload**

**Request**:
```json
{
  "contentType": "PHOTO",
  "caption": "Loving my new latte from @CoffeeShop! #BestCoffee",
  "productSku": "LATTE-MED",
  "platform": "DIRECT_UPLOAD",
  "consentGiven": true,
  "consentTypes": ["website", "social", "email"]
}
```

**Response** (200 OK):
```json
{
  "id": "ugc_1234567890",
  "uploadUrl": "https://s3.amazonaws.com/nxloy-ugc/upload/abc123?signature=...",
  "status": "PENDING",
  "estimatedPoints": "200-500 (based on quality)",
  "message": "Upload your photo to the provided URL. We'll analyze it and award points within 5 minutes!"
}
```

### Endpoint: Submit UGC for Scoring

**POST /api/ugc/:id/submit**

**Request**: (No body, just trigger)

**Response** (200 OK):
```json
{
  "id": "ugc_1234567890",
  "status": "SUBMITTED",
  "qualityScore": 78,
  "viralityScore": 65,
  "pointsAwarded": 500,
  "tierAwarded": "EXCELLENT",
  "moderationStatus": "APPROVED",
  "message": "Great photo! You earned 500 points. Share it on social for +300 bonus points!"
}
```

### Endpoint: Generate AI Email Copy

**POST /api/ai/generate/email**

**Request**:
```json
{
  "campaignGoal": "Promote fall menu to Gold tier members",
  "targetAudience": "GOLD_TIER",
  "keyPoints": [
    "New pumpkin spice latte",
    "2x points on fall menu items",
    "Available October 1-31"
  ],
  "brandVoice": "FRIENDLY",
  "language": "EN"
}
```

**Response** (200 OK):
```json
{
  "subjectLines": [
    "Fall flavors are here, {{firstName}}! 🍂",
    "Your favorite Pumpkin Spice Latte is back",
    "Earn 2x points on our new fall menu"
  ],
  "bodyCopy": "Hi {{firstName}},\n\nAs a Gold member, you get first access to our new fall menu! Try our famous Pumpkin Spice Latte and earn 2x points on every fall drink from October 1-31.\n\nYou're only {{pointsToNextTier}} points away from Platinum status. This is your chance to get there faster!\n\nRedeem your {{pointsBalance}} points today or earn more with every sip.\n\nCheers,\nThe Coffee Shop Team",
  "previewText": "First access to fall menu + 2x points for Gold members",
  "plainText": "[Plain text version...]",
  "estimatedOpenRate": "22-24% (26% lift vs baseline)",
  "generationTime": "1.2 seconds"
}
```

---

## Security & Compliance

### GDPR Compliance

**Consent Management**:
- Explicit opt-in checkbox on UGC upload: "I consent to [Business] using my content for marketing purposes"
- Granular consent types:
  - ☑ Display on website
  - ☑ Share on social media
  - ☑ Include in email campaigns
  - ☐ Use in paid advertisements (optional, higher points reward)
- Consent stored in `UGCSubmission.consentGiven` and `consentTypes` fields

**Right to be Forgotten**:
- Customer can delete UGC anytime from app/web
- API: `DELETE /api/ugc/:id`
- Soft delete (set `deletedAt`) for audit trail
- Hard delete after 90 days (GDPR allows reasonable retention)
- Cascade delete: Remove from CDN, S3, database

**Data Retention**:
- Auto-delete UGC after 2 years if consent not renewed
- Monthly cron job checks `createdAt` + 2 years
- Send notification 30 days before deletion: "Renew consent to keep earning points from your content"

**Data Portability**:
- API: `GET /api/ugc/export?customerId=...`
- Returns JSON with all UGC data (metadata + download links)
- Format: Machine-readable (JSON) and human-readable (PDF)

### Content Moderation Safety

**Multi-Layered Approach**:
1. **AI Filtering** (Tier 1): Auto-approve/reject 95%+ of submissions
2. **Human Review** (Tier 2): Handle flagged content within 24 hours
3. **User Reporting** (Tier 3): Customers can report inappropriate content

**Brand Safety**:
- Blacklist competitor brands (configurable)
- Profanity detection (Google Perspective API)
- Inappropriate imagery (AWS Rekognition)
- Spam pattern detection (duplicate text, promotional links)

**Fake Review Prevention**:
- Verified purchase badge (only buyers can review products)
- Device fingerprinting (detect multiple accounts from same device)
- IP analysis (flag if 10+ submissions from same IP)
- Velocity checks (max 5 reviews per day per customer)

---

## Analytics & Metrics

### Business Dashboard Metrics

**UGC Performance**:
- Total submissions (daily/weekly/monthly)
- Submission rate (% of active customers submitting UGC)
- Average quality score
- Auto-approval rate (AI efficiency)
- Top-performing content (by virality score)
- Platform breakdown (direct upload vs Instagram vs TikTok)

**Conversion Impact**:
- Conversion rate with UGC vs without (product pages)
- Revenue attributed to UGC (customers who viewed UGC before purchase)
- Email engagement with UGC vs without (open rate, CTR)

**BGC Cost Savings**:
- Time saved (manual hours - AI hours)
- Cost saved (manual cost - AI cost)
- ROI (revenue lift / AI costs)

**Sample Dashboard**:
```
┌─────────────────────────────────────────────┐
│  UGC Performance (Last 30 Days)             │
├─────────────────────────────────────────────┤
│  Total Submissions: 1,247                   │
│  Submission Rate: 24.3% ↑ 12%              │
│  Avg Quality Score: 72/100                  │
│  Auto-Approval Rate: 96.8%                  │
│  Platform Breakdown:                        │
│    - Direct Upload: 58%                     │
│    - Instagram: 32%                         │
│    - TikTok: 10%                            │
├─────────────────────────────────────────────┤
│  Conversion Impact                          │
├─────────────────────────────────────────────┤
│  Product Pages with UGC:                    │
│    - Conversion Rate: 5.2% (↑ 156%)        │
│    - Revenue: $47,300 (↑ 180%)             │
│  Emails with UGC:                           │
│    - Open Rate: 26.4% (↑ 28%)              │
│    - CTR: 3.1% (↑ 52%)                     │
└─────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1A: UGC Upload & Basic Scoring (Week 1-2)

**Deliverables**:
- UGC upload endpoints (photo, video, text)
- S3 pre-signed URL generation
- Basic quality scoring (image resolution, text length)
- Manual moderation dashboard (approve/reject)
- Point awarding (fixed tiers: 100, 200, 500 points)

**Success Criteria**:
- Customers can upload photos and receive points
- Moderation dashboard shows pending submissions
- 90% uptime for upload endpoints

### Phase 1B: AI Quality Scoring (Week 2-3)

**Deliverables**:
- OpenAI Vision API integration
- Detailed quality scoring (composition, lighting, product focus)
- Virality prediction (basic heuristics)
- Automated approval/rejection (95% auto-moderation rate)

**Success Criteria**:
- AI quality scores match human ratings 80%+ of the time
- 95% of submissions auto-moderated (no human review needed)
- <5 second scoring time (p95)

### Phase 1C: Social Platform Integration (Week 3-4)

**Deliverables**:
- Instagram Graph API integration
- TikTok API integration
- Auto-ingest tagged posts
- Engagement metrics sync (likes, comments, views)

**Success Criteria**:
- Instagram posts auto-detected within 1 hour
- TikTok videos auto-detected within 1 hour
- Engagement metrics updated daily

### Phase 2A: AI Copywriting (Week 4-6)

**Deliverables**:
- GPT-4o email generation
- Personalization variables (firstName, pointsBalance, etc.)
- A/B test variant generation
- SMS and push notification generation

**Success Criteria**:
- Email copy generated in <30 seconds
- 26% lift in open rates vs generic emails
- 5 A/B variants generated per campaign

### Phase 2B: AI Image Generation (Week 6-8)

**Deliverables**:
- DALL-E 3 integration
- Campaign visual templates
- Social media graphics generator
- Reward tier badge generator

**Success Criteria**:
- Images generated in <45 seconds
- 95% cost savings vs designers
- 10 templates available at launch

### Phase 2C: AI Video Generation (Week 8-10)

**Deliverables**:
- HeyGen API integration
- AI avatar video generator
- Product demo video templates
- Testimonial video synthesis

**Success Criteria**:
- Videos generated in <5 minutes
- 20+ avatars available
- 99% cost savings vs videographers

### Phase 3: Advanced Features (Week 10-12)

**Deliverables**:
- Dynamic content personalization (behavioral triggers)
- Advanced fraud detection (device fingerprinting)
- GDPR compliance tools (consent management, export)
- Analytics dashboard (UGC performance, BGC ROI)

**Success Criteria**:
- 70% GDPR consent rate
- <1% fraud rate
- 90% customer satisfaction (NPS)

---

## Dependencies

### External Services

**Required**:
- OpenAI API (GPT-4o, DALL-E 3, Vision API) - $500-2,000/month (estimated)
- AWS S3 + CloudFront - $200-500/month (estimated)
- HeyGen API - $200-500/month (estimated)
- Instagram Graph API - Free (rate limits apply)
- TikTok API - Free (rate limits apply)

**Optional**:
- Google Perspective API (profanity detection) - Free up to 1M requests/day
- AWS Rekognition (image moderation) - $1-5/1,000 images
- Midjourney (alternative to DALL-E) - $30-60/month

### Internal Dependencies

**Backend Services**:
- Loyalty Points Service (award points for UGC)
- Customer Service (customer profiles, tier info)
- Notification Service (send push/email about points earned)

**Database**:
- Prisma schema: `ugc.prisma` (already created)
- Migration: Generate and apply

**Frontend**:
- Web: UGC upload UI, moderation dashboard
- Mobile: Camera capture, social sharing

---

## Risk Mitigation

### Risk 1: AI API Costs Spiral

**Risk**: OpenAI API costs exceed budget as user base grows

**Mitigation**:
- Usage caps per business tier (Free: 10 images/month, Pro: Unlimited)
- Caching common prompts (reduce redundant API calls)
- Use GPT-4o Mini for simple tasks (15x cheaper)
- Batch API for non-urgent requests (50% discount)
- Monitor costs daily, set alerts at 80% of budget

**Cost Projection**:
- 1,000 businesses × $50/month AI budget = $50,000/month max
- Revenue: 1,000 businesses × $199/month = $199,000/month
- AI cost as % of revenue: 25% (acceptable for SaaS)

### Risk 2: AI Hallucination (False Product Claims)

**Risk**: GPT-4o generates false claims about products ("Cures cancer!")

**Mitigation**:
- RAG (Retrieval-Augmented Generation): Ground AI in product database facts
- Human-in-the-loop: Show generated copy for approval before sending
- Blacklist medical/legal claims ("cures", "guaranteed", "FDA-approved")
- Confidence scoring: Label low-confidence outputs for review
- Disclaimers: "AI-generated, reviewed by [Business Name]"

**Monitoring**:
- Track hallucination rate (human reviewers flag false claims)
- Target: <1% hallucination rate with RAG + human review

### Risk 3: GDPR Violations (Missing Consent)

**Risk**: Using customer content without proper consent → €20M fine

**Mitigation**:
- Explicit consent checkbox on upload (no pre-checked boxes)
- Granular consent types (website, social, email, ads)
- Easy consent withdrawal (one-click delete)
- Audit log of all consent changes
- Annual GDPR compliance audit

**Legal Review**:
- Terms of Service reviewed by legal counsel
- Privacy Policy updated with UGC usage
- GDPR compliance certification (optional but recommended)

### Risk 4: Fake Reviews / Spam

**Risk**: Bots submit fake reviews to farm points

**Mitigation**:
- Verified purchase badge (only buyers can review products)
- Device fingerprinting (detect multiple accounts)
- IP velocity checks (max 5 submissions per IP per day)
- AI spam detection (duplicate text, generic templates)
- Human review for suspicious accounts

**Fraud Rate Target**: <1% (industry standard)

### Risk 5: Content Moderation Failures

**Risk**: Inappropriate content slips through AI moderation → brand damage

**Mitigation**:
- Multi-layered moderation (AI + human review)
- Human review for all first-time users
- User reporting system (crowdsourced moderation)
- 24-hour SLA for human review
- Insurance (cyber liability coverage)

**False Negative Target**: <0.5% (industry best practice)

---

## Conclusion

This feature positions NxLoy as the **only AI-native viral loyalty platform** with comprehensive UGC and BGC automation. With proven ROI ($552K revenue lift per customer) and massive cost savings (97-99% vs traditional methods), this is a **Category-Defining Feature** that creates a defensible competitive moat.

**Next Steps**:
1. Approve feature specification
2. Generate Prisma migrations
3. Begin Phase 1A implementation (UGC upload + basic scoring)
4. Recruit beta customers (50 businesses for 3-month pilot)
5. Iterate based on feedback
6. Scale to 1,000+ businesses by Month 6

**Estimated Timeline**: 12 weeks (3 months) to full production release.

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-09
**Author**: Claude Code + Product Team
**Approved By**: [Pending]
