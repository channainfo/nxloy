# Referrals Domain Specification

**Domain**: Referrals
**Status**: 📝 Reference Implementation (See Loyalty Domain)
**Last Updated**: 2025-11-07
**Owner**: Backend Team (Growth Squad)

## Overview

The Referrals domain manages customer referral programs, tracking referral links, conversions, and rewards for both referrer and referee.

## Core Responsibilities

1. **Referral Program Management**: Configure referral campaigns
2. **Link Generation**: Create unique referral codes/links
3. **Conversion Tracking**: Monitor referral success
4. **Reward Distribution**: Award bonuses to referrers
5. **Fraud Detection**: Prevent abuse

## Key Entities

- **ReferralProgram**: Campaign configuration
- **ReferralCode**: Unique tracking code
- **Referral**: Referral instance
- **ReferralConversion**: Successful signup/purchase
- **ReferralReward**: Bonus awarded

## Bounded Context Relationships

**Depends On**:
- **Customer Management**: Customer identification
- **Loyalty**: Point awarding
- **Business Management**: Business configuration

**Provides To**:
- **Loyalty**: Referral bonus points
- **Analytics**: Referral metrics
- **Notifications**: Referral success messages

## Domain Events Published

- `referral.sent`
- `referral.accepted`
- `referral.converted`
- `referral.reward.awarded`
- `referral.fraud.detected`

## Documentation Files

| File | Status | Reference |
|------|--------|-----------|
| All 9 files | 📝 To be created | See [loyalty domain](../loyalty/) for structure |

## Implementation Guidance

Follow Loyalty domain patterns. Key features:
- URL shortening and tracking
- Attribution window logic
- Fraud detection rules

## Related Documentation

- Referral programs are part of growth strategy
- [Loyalty Domain (Master Reference)](../loyalty/)

---

**Team**: Growth Squad | **Slack**: #growth-squad
