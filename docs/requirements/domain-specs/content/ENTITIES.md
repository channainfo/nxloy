# Content Domain - Entities

**Last Updated**: 2025-11-09

## Entity 1: UGCSubmission
- id, businessId, customerId, mediaUrl, contentType (PHOTO/VIDEO)
- qualityScore (0-100), viralityScore (0-100)
- status (PENDING, APPROVED, REJECTED)
- pointsAwarded, submittedAt, approvedAt

## Entity 2: UGCModeration
- id, submissionId, moderatorId, decision (APPROVE/REJECT)
- reason, moderatedAt

## Entity 3: BGCAsset
- id, businessId, assetType (CAPTION, IMAGE, VIDEO)
- content, sourceUGCId, generatedBy (GPT-4o/DALL-E/HeyGen)
- cost, generatedAt

## Entity 4: ContentReport
- id, submissionId, reporterId, reason, status, resolvedAt

---
**Status**: ✅ Complete
