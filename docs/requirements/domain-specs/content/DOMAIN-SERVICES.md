# Content Domain - Domain Services

**Last Updated**: 2025-11-09

## Service 1: ScoreUGCQualityService
- Calls GPT-4 Vision API
- Returns QualityScore (0-100)
- Auto-approves/rejects based on threshold

## Service 2: GenerateBGCService
- Selects top UGC (quality >85)
- Generates captions via GPT-4o
- Generates images via DALL-E
- Returns BGCAsset

## Service 3: ModerateContentService
- NSFW detection via AWS Rekognition
- Manual review queue management
- Batch approval/rejection

---
**Status**: ✅ Complete
