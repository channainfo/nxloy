# Social Domain - Value Objects

**Last Updated**: 2025-11-09

## Value Object 1: MatchScore
```typescript
class MatchScore {
  constructor(
    public readonly value: number, // 0-100
    public readonly breakdown: {
      audienceOverlap: number;   // 35%
      engagementRate: number;    // 25%
      contentAlignment: number;  // 20%
      botScore: number;          // 15%
      followerTier: number;      // 5%
    }
  ) {}

  isHighQuality(): boolean {
    return this.value >= 70;
  }
}
```

## Value Object 2: CommissionStructure
- type (PER_SIGNUP/PERCENTAGE), rate (USD or %), platformFee (20%)

## Value Object 3: ChallengeReward
- points, tier bonus, leaderboard prizes

---
**Status**: ✅ Complete
