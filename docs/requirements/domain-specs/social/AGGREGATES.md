# Social Domain - Aggregates

**Last Updated**: 2025-11-09

## Aggregate 1: Influencer (ROOT)

**Members**: Influencer, InfluencerCampaign[], InfluencerPerformance

**Operations**:
```typescript
class InfluencerAggregate {
  static async discover(businessProfile): Promise<Influencer[]> {
    const influencers = await instagram.searchHashtag('#coffee', limit=1000);
    return influencers.filter(i => i.followers >= 10000 && i.followers <= 50000);
  }

  async sendPartnershipInvitation(): Promise<void> {
    const dm = await gpt4o.generateDM(this.username, this.businessName);
    await instagram.sendDM(this.username, dm);
    this.status = 'CONTACTED';
  }
}
```

## Aggregate 2: Challenge (ROOT)

**Members**: Challenge, ChallengeParticipation[], ChallengeLeaderboard

**Operations**:
```typescript
class ChallengeAggregate {
  recordParticipation(customerId, teamId): void {
    this.participantCount++;
    this.publishEvent(new ChallengeJoinedEvent(this.id, customerId));
  }

  updateLeaderboard(): void {
    const teams = this.sortByProgress();
    this.leaderboard = teams.map((t, i) => ({ rank: i + 1, team: t }));
  }
}
```

---
**Status**: ✅ Complete
