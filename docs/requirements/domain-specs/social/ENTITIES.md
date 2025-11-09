# Social Domain - Entities

**Last Updated**: 2025-11-09

## Entity 1: Influencer
- id, customerId, businessId, username, platform (INSTAGRAM/TIKTOK)
- followersCount, engagementRate, matchScore, botScore
- status (DISCOVERED, CONTACTED, ACCEPTED, ACTIVE, SUSPENDED)
- commissionRate, totalEarnings, totalSignups

## Entity 2: InfluencerCampaign
- id, influencerId, campaignType (REFERRAL/CHALLENGE)
- startDate, endDate, targetSignups, actualSignups
- roi, status

## Entity 3: Challenge
- id, businessId, name, hashtag, trendSource (MANUAL/TIKTOK/INSTAGRAM)
- goalType (INDIVIDUAL/TEAM), rewards, status
- startDate, endDate, participantCount

## Entity 4: ChallengeParticipation
- id, challengeId, customerId, teamId, progress, completedAt

## Entity 5: CustomerSocialGraph
- id, customerId, businessId, networkSize, influenceScore
- isSuperReferrer, referralPotential

---
**Status**: ✅ Complete
