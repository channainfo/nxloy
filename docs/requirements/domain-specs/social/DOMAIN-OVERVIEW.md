# Social Domain - Overview

**Domain**: Social
**Bounded Context**: Influencers, Challenges, Social Graph
**Owner**: Backend Team (Social Squad)
**Last Updated**: 2025-11-09

## Purpose

Manage influencer partnerships, viral challenges, and social network analysis.

## Core Responsibilities

1. **Influencer Discovery**: AI finds 500+ micro-influencers via Instagram/TikTok APIs
2. **Match Scoring**: Audience overlap analysis (0-100 score)
3. **Automated Outreach**: GPT-4o generates personalized DMs
4. **Challenge Management**: Create viral challenges with team competitions
5. **Social Graph Analysis**: Network size estimation, influence scoring

## Key Entities

- Influencer, InfluencerCampaign, InfluencerPerformance
- Challenge, ChallengeParticipation, ChallengeLeaderboard
- CustomerSocialGraph

## Bounded Context Relationships

**Depends On**:
- Customer Management, Referrals, Content (UGC)

**Provides To**:
- Viral Growth (K-factor from influencers/challenges)
- Analytics (campaign ROI)

## Domain Events

- `social.influencer.discovered`
- `social.influencer.accepted`
- `social.challenge.launched`
- `social.challenge.completed`

## Business Rules

1. Influencers: 10K-50K followers (micro-influencer range)
2. Match score >70 for partnership consideration
3. Challenges: Min 10 participants, max 30 days duration
4. Commission: 15-20% standard (Tarte model)

---
**Document Owner**: Backend Team (Social Squad)
