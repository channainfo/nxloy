# Content Domain - Ubiquitous Language

**Last Updated**: 2025-11-09

## Core Terms

**UGC (User-Generated Content)**: Customer photos/videos submitted to earn loyalty points

**BGC (Business-Generated Content)**: AI-created marketing assets (captions, images, videos)

**Quality Score**: 0-100 AI rating of UGC (resolution: 25%, composition: 25%, lighting: 25%, product focus: 25%)

**Auto-Approval Threshold**: Quality score >70 → instant approval

**Auto-Rejection Threshold**: Quality score <30 → instant rejection

**Manual Review Queue**: Submissions scored 30-70 require human moderation

**Content Rights**: Perpetual license granted by customer for approved UGC

**Virality Score**: AI prediction of social sharing potential (0-100)

**NSFW Detection**: AWS Rekognition check for inappropriate content

**Content Moderation**: AI + human review workflow (AWS Rekognition → GPT-4 Vision → Manual review)

**BGC Pipeline**: Top UGC (>85 quality) → GPT-4o caption → DALL-E enhancement → Marketing asset

**Daily Submission Limit**: Max 5 UGC per customer to prevent spam

**Points Reward**: 10-100 points based on quality score

---

## AI Models

- **GPT-4 Vision API**: Quality scoring ($0.01/image)
- **GPT-4o**: Caption generation ($0.01/1K tokens)
- **DALL-E 3**: Image generation ($0.04/image)
- **HeyGen API**: Video generation ($0.50/video)
- **AWS Rekognition**: NSFW detection

---

**Document Owner**: Backend Team (Content Squad)
