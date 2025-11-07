# Subscription Domain Specification

**Domain**: Subscription
**Status**: 📝 Reference Implementation (See Loyalty Domain)
**Last Updated**: 2025-11-07
**Owner**: Backend Team (Subscription Squad)

## Overview

The Subscription domain manages business subscription tiers (Free, Pro, Enterprise), billing cycles, and feature access control.

## Core Responsibilities

1. **Subscription Management**: Create, upgrade, downgrade, cancel subscriptions
2. **Billing Integration**: Stripe payment processing
3. **Usage Tracking**: Monitor feature usage and limits
4. **Access Control**: Enforce tier-based feature gates
5. **Trial Management**: Free trial workflows

## Key Entities

- **Subscription**: Business subscription to platform
- **SubscriptionTier**: Tier definition (Free/Pro/Enterprise)
- **UsageRecord**: Feature usage tracking
- **Invoice**: Billing record
- **PaymentMethod**: Stored payment details

## Bounded Context Relationships

**Depends On**:
- **Business Management**: Business association
- **Auth**: User authorization

**Provides To**:
- **Loyalty**: Feature availability checks
- **Analytics**: Usage metrics
- **Notifications**: Billing reminders

## Domain Events Published

- `subscription.created`
- `subscription.upgraded`
- `subscription.downgraded`
- `subscription.cancelled`
- `subscription.renewed`
- `usage.limit.exceeded`
- `invoice.paid`

## Documentation Files

| File | Status | Reference |
|------|--------|-----------|
| All 9 files | 📝 To be created | See [loyalty domain](../loyalty/) for structure |

## Implementation Guidance

Follow Loyalty domain patterns. Key additions:
- Stripe webhook handlers
- Usage quota enforcement
- Prorated billing logic

## Related Documentation

- [Subscription Management Feature Spec](../../features/subscription-management/FEATURE-SPEC.md)
- [Loyalty Domain (Master Reference)](../loyalty/)

---

**Team**: Subscription Squad | **Slack**: #subscription-squad
