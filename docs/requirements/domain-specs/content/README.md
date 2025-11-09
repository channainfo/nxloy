# Content Domain

**Status**: 🟢 Complete (9-file DDD specification)
**Priority**: P1 (High - Core viral feature)
**Owner**: Backend Team (Content Squad)
**Last Updated**: 2025-11-09

## Domain Purpose

Manage User-Generated Content (UGC) and Business-Generated Content (BGC) with AI quality scoring, content moderation, and automated content generation.

## Core Concepts

**UGC (User-Generated Content)**:
- Customer photos/videos shared to earn points
- AI quality scoring (0-100) using GPT-4 Vision API
- GDPR-compliant rights management

**BGC (Business-Generated Content)**:
- AI-generated marketing content (GPT-4o captions, DALL-E images, HeyGen videos)
- Automated content pipeline: UGC → AI enhancement → Marketing assets
- Cost savings: $120K/year vs. hiring designer

## Aggregates

1. **UGCSubmission** - Customer-submitted content with AI scoring
2. **BGCAsset** - AI-generated business content
3. **ContentModerationQueue** - Manual review workflow

## Key Entities

- UGCSubmission, UGCModeration, BGCAsset, ContentReport

## Domain Events

- `content.ugc.submitted`
- `content.ugc.approved`
- `content.ugc.rejected`
- `content.bgc.generated`

## References

- [Feature Spec: UGC & AI Content](/docs/requirements/features/ugc-ai-content/FEATURE-SPEC.md)
- [Prisma Schema: ugc.prisma](/packages/database/prisma/schema/ugc.prisma)

---

**Status**: ✅ Complete
