# Content Domain - Aggregates

**Last Updated**: 2025-11-09

## Aggregate 1: UGCSubmission (ROOT)

**Purpose**: Customer photo/video submission with AI quality scoring

**Members**:
- UGCSubmission (root entity)
- QualityScore (value object)
- ViralityScore (value object)
- UGCModeration (child entity)

**Business Invariants**:
1. Quality score: 0 <= score <= 100
2. Status flow: PENDING → APPROVED/REJECTED
3. Auto-approval: score >70 → APPROVED
4. Auto-rejection: score <30 → REJECTED
5. Daily limit: max 5 submissions per customer

**Operations**:
```typescript
class UGCSubmissionAggregate {
  async scoreQuality(): Promise<void> {
    const score = await openai.vision.analyze(this.mediaUrl);
    this.qualityScore = score.value; // 0-100

    if (score > 70) this.status = 'APPROVED';
    else if (score < 30) this.status = 'REJECTED';
    else this.status = 'PENDING_REVIEW';
  }

  approve(moderatorId: UUID): void {
    this.status = 'APPROVED';
    this.publishEvent(new UGCApprovedEvent(this));
  }
}
```

---

## Aggregate 2: BGCAsset (ROOT)

**Purpose**: AI-generated business content

**Members**:
- BGCAsset (root entity)
- GenerationMetadata (value object)

**Operations**:
```typescript
class BGCAssetAggregate {
  static async generateFromUGC(ugc: UGCSubmission): Promise<BGCAssetAggregate> {
    const caption = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: `Write marketing caption for: ${ugc.description}` }]
    });

    const asset = new BGCAsset(
      UUID.create(),
      ugc.businessId,
      'CAPTION',
      caption,
      { sourceUGCId: ugc.id }
    );

    return new BGCAssetAggregate(asset);
  }
}
```

---

**Document Owner**: Backend Team (Content Squad)
