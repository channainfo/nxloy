# Content Domain - Business Rules

**Last Updated**: 2025-11-09

## BR-C-001: Quality Score Range
- 0 <= qualityScore <= 100

## BR-C-002: Auto-Approval Threshold
- qualityScore > 70 → Auto-approve

## BR-C-003: Auto-Rejection Threshold
- qualityScore < 30 → Auto-reject

## BR-C-004: Daily Submission Limit
- Max 5 UGC per customer per day

## BR-C-005: Content Rights
- Customers grant perpetual license for approved UGC

## BR-C-006: NSFW Detection
- All UGC must pass AWS Rekognition before approval

## BR-C-007: BGC Generation Criteria
- Only generate BGC from UGC with quality >85

## BR-C-008: Points Reward
- 10-100 points based on quality score

---
**Status**: ✅ Complete
