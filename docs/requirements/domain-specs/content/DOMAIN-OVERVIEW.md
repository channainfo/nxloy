# Content Domain - Overview

**Domain**: Content
**Bounded Context**: UGC/BGC, AI Quality Scoring, Content Moderation
**Owner**: Backend Team (Content Squad)
**Last Updated**: 2025-11-09

## Purpose

Manage customer-generated content (UGC) with AI quality scoring and business-generated content (BGC) creation using GPT-4o/DALL-E/HeyGen.

## Core Responsibilities

1. **UGC Collection**: Instagram/TikTok hashtag tracking, in-app uploads
2. **AI Quality Scoring**: GPT-4 Vision API (0-100 score: resolution, composition, lighting, product focus)
3. **Content Moderation**: Auto-approve >70, auto-reject <30, manual review 30-70
4. **BGC Generation**: GPT-4o captions, DALL-E images, HeyGen videos
5. **Rights Management**: GDPR-compliant content licensing
6. **Rewards Distribution**: Award points for approved UGC

## Key Entities

- **UGCSubmission**: Customer photo/video submission
- **UGCModeration**: AI + manual review workflow
- **BGCAsset**: Generated marketing content
- **ContentReport**: User-flagged inappropriate content

## Bounded Context Relationships

**Depends On**:
- **Customer Management**: Customer profiles
- **Rewards**: Points awarding for UGC

**Provides To**:
- **Social**: Content for challenges
- **Viral Growth**: UGC sharing metrics
- **Marketing**: BGC assets for campaigns

## Domain Events

- `content.ugc.submitted`
- `content.ugc.scored` (AI quality score ready)
- `content.ugc.approved`
- `content.ugc.rejected`
- `content.bgc.generated`
- `content.moderation.flagged`

## Business Rules

1. UGC must pass NSFW detection before approval
2. Quality score >70 auto-approves, <30 auto-rejects
3. Customers grant perpetual license for approved UGC
4. Max 5 UGC submissions per customer per day
5. BGC generation limited to top 10% UGC (quality >85)

## Technical Constraints

- Multi-tenancy: businessId scoping
- Performance: Sub-2s AI quality scoring
- Scalability: 100K+ UGC submissions per month
- Storage: S3 + CloudFront CDN
- AI Cost: $0.01 per image (OpenAI Vision API)

---

**Document Owner**: Backend Team (Content Squad)
**Last Updated**: 2025-11-09
