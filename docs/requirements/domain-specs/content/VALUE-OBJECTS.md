# Content Domain - Value Objects

**Last Updated**: 2025-11-09

## Value Object 1: QualityScore
```typescript
class QualityScore {
  constructor(
    public readonly value: number, // 0-100
    public readonly breakdown: {
      resolution: number;      // 25%
      composition: number;     // 25%
      lighting: number;        // 25%
      productFocus: number;    // 25%
    }
  ) {}

  static async fromAIAnalysis(imageUrl: string): Promise<QualityScore> {
    const analysis = await openai.vision.analyze(imageUrl);
    const value = (analysis.resolution + analysis.composition + analysis.lighting + analysis.productFocus) / 4;
    return new QualityScore(value, analysis);
  }

  shouldAutoApprove(): boolean {
    return this.value > 70;
  }

  shouldAutoReject(): boolean {
    return this.value < 30;
  }
}
```

## Value Object 2: ContentRights
- grantedByCustomerId, grantedAt, licenseType (PERPETUAL), territory (WORLDWIDE)

## Value Object 3: GenerationCost
- model (GPT-4o/DALL-E/HeyGen), cost (USD), generatedAt

---
**Status**: ✅ Complete
