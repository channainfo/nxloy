# Loyalty Domain - Ubiquitous Language

**Domain**: Loyalty
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

The Ubiquitous Language is a shared vocabulary between domain experts, developers, and stakeholders. It ensures consistent communication and prevents misunderstandings.

## Core Terms

### A

**Aggregate**
- A cluster of domain objects treated as a single unit
- Example: LoyaltyProgram aggregate includes program, rules, and tiers

**Activation**
- The process of making a program available for customer enrollment
- Status transition: DRAFT → ACTIVE

**Auto-Enrollment**
- Automatic enrollment of customers without explicit consent
- Configured per program via enrollment settings

---

### B

**Balance**
- The total number of points a customer has in a program
- Calculated as: earned points - redeemed points - expired points

**Benefit**
- A privilege granted to tier members
- Types: point multiplier, discount, free shipping, priority support

**Business**
- An organization that creates and manages loyalty programs
- Also called: Merchant, Tenant, Organization

---

### C

**Configuration**
- The set of parameters that define how a rule operates
- Example: PointsBasedConfig includes pointsPerDollar, minPurchaseAmount

**Customer**
- An individual who participates in loyalty programs
- May be enrolled in multiple programs

---

### D

**Domain Event**
- A record of something significant that happened in the domain
- Example: PointsEarnedEvent, TierUpgradedEvent

**Downgrade**
- Moving a customer to a lower tier (typically not allowed)
- Default behavior: tier upgrades are permanent

---

### E

**Earning**
- The process of accumulating points through qualifying actions
- Actions: purchases, visits, referrals, manual adjustments

**Eligibility**
- Criteria that determine if a customer can enroll in a program
- Criteria: min age, min lifetime spend, required tags

**Enrollment**
- The act of a customer joining a loyalty program
- Methods: manual, auto, self-service

**Expiration**
- The process of points becoming invalid after a period
- Typically: 12 months from earning date

---

### I

**Industry**
- A business category used to filter templates
- Examples: COFFEE, RETAIL, RESTAURANT, FITNESS, BEAUTY

**Invariant**
- A condition that must always be true for an aggregate
- Example: Point balance cannot be negative

---

### L

**Loyalty Program**
- A marketing strategy to encourage repeat business
- Consists of: rules, tiers, rewards, enrollment settings

**Loyalty Rule**
- Defines how customers earn points or progress
- 6 types: POINTS_BASED, PUNCH_CARD, AMOUNT_SPENT, TIER_BASED, VISIT_FREQUENCY, STAMP_CARD

---

### M

**Milestone**
- A significant achievement in a loyalty program
- Example: Reaching 1000 points, completing 10 visits

**Multiplier**
- A factor that increases point earning for tier members
- Example: Silver tier = 1.5x points

---

### P

**Pause**
- Temporarily suspending a program or enrollment
- Paused enrollments cannot earn or redeem points

**Points**
- A unit of value in a loyalty program
- Can be earned, redeemed, expired, or transferred

**Progress**
- The customer's current status toward earning a reward
- Measured as: current value / target value

**Punch**
- A single unit in a punch card program
- Example: Buy 10 coffees, get 1 free (10 punches required)

---

### Q

**Qualifying Transaction**
- A purchase or action that contributes to loyalty progress
- Depends on rule configuration (min amount, excluded categories)

---

### R

**Redemption**
- The act of exchanging points for rewards
- Reduces customer's point balance

**Repository**
- An abstraction over data persistence
- Example: LoyaltyProgramRepository, CustomerEnrollmentRepository

**Reward**
- A benefit customers receive for loyalty
- Types: free item, discount, points, tier upgrade

**Rule Engine**
- Component that calculates points based on rule configuration
- Inputs: transaction, rule config | Output: points earned

---

### S

**Stamp**
- Similar to punch, but may award multiple per visit
- Example: Visit 5 times, collect 10 stamps (2 stamps per visit)

**Status**
- The current state of a program or enrollment
- Program statuses: DRAFT, ACTIVE, PAUSED, ENDED
- Enrollment statuses: ACTIVE, PAUSED, CANCELLED, COMPLETED

---

### T

**Template**
- A pre-configured loyalty program ready for use
- 21 templates across 7 industries

**Tier**
- A membership level with associated benefits
- Example: Bronze (0-500 points), Silver (501-1000 points), Gold (1001+ points)

**Transaction**
- A record of points earned, redeemed, or expired
- Immutable once created (audit trail)

---

### U

**Upgrade**
- Moving a customer to a higher tier
- Triggered when customer reaches tier's minimum points

---

### V

**Value Object**
- An immutable object defined by its attributes
- Example: PointBalance, RewardDefinition, DateRange

**Visit**
- A customer interaction with a business
- Tracked for VISIT_FREQUENCY rules

---

## Phrases and Expressions

### "Earn X points per dollar"
- Points-based rule configuration
- Example: "Earn 1.5 points per dollar spent"

### "Buy X, get Y free"
- Punch card or stamp card reward
- Example: "Buy 10 coffees, get 1 free"

### "Spend X in Y days"
- Amount-spent rule with time constraint
- Example: "Spend $100 in 30 days, get $10 off"

### "Visit X times in Y days"
- Visit frequency rule
- Example: "Visit 5 times in 7 days, get free dessert"

### "Reach X points to unlock Y tier"
- Tier-based progression
- Example: "Reach 500 points to unlock Silver tier"

### "Points expire in X days"
- Expiration policy
- Example: "Points expire in 365 days"

### "Redeem X points for Y"
- Redemption action
- Example: "Redeem 500 points for $10 off"

---

## Anti-Patterns (What NOT to Say)

❌ **"Loyalty points balance"** → ✅ "Point balance"
- Avoid redundancy ("loyalty" is implied in the domain)

❌ **"Customer loyalty program enrollment"** → ✅ "Customer enrollment"
- Domain context makes "loyalty program" implicit

❌ **"Deduct points"** → ✅ "Redeem points"
- Use domain language, not technical language

❌ **"Rule execution"** → ✅ "Point calculation"
- Describe the outcome, not the mechanism

❌ **"User"** → ✅ "Customer" or "Business Owner"
- Be specific about the role

---

## Domain Boundaries

### Inside Loyalty Domain
- Loyalty programs, rules, enrollments, transactions
- Point earning/redemption logic
- Tier management
- Template system

### Outside Loyalty Domain (Dependencies)
- **Customer**: Customer profiles, contact info
- **Business**: Business details, subscription status
- **Transaction**: Purchase history, order details
- **Reward**: Reward catalog, redemption fulfillment
- **Notification**: Email, SMS, push notifications

---

## Context-Specific Terms

### For Business Owners
- "Create a loyalty program"
- "Activate your program"
- "View enrolled customers"
- "Track redemptions"

### For Customers
- "Join the rewards program"
- "Earn points"
- "Check your balance"
- "Redeem rewards"

### For Developers
- "LoyaltyProgramAggregate"
- "EarnPointsService"
- "PointsEarnedEvent"
- "CustomerEnrollmentRepository"

---

## Example Conversations

### Business Owner and Product Manager

**PM**: "How many customers have enrolled in your program?"
**Owner**: "We have 1,247 active enrollments."

**PM**: "What's your most popular tier?"
**Owner**: "Silver tier has 65% of our members."

**PM**: "How often do customers redeem?"
**Owner**: "Average redemption rate is 12% monthly."

### Developer and Domain Expert

**Dev**: "When should we publish PointsEarnedEvent?"
**Expert**: "Right after the enrollment's balance is updated."

**Dev**: "Can customers redeem while enrollment is paused?"
**Expert**: "No, paused enrollments cannot earn or redeem."

**Dev**: "How do we handle point expiration?"
**Expert**: "Run nightly job to expire points, publish PointsExpiredEvent."

---

## Glossary Quick Reference

| Term | Definition | Example |
|------|------------|---------|
| **Aggregate** | Cluster of domain objects | LoyaltyProgram with rules and tiers |
| **Balance** | Total points available | 500 points |
| **Earning** | Accumulating points | Earn 50 points from $25 purchase |
| **Enrollment** | Customer joining program | John enrolled in Coffee Rewards |
| **Redemption** | Exchanging points | Redeem 100 points for free coffee |
| **Rule** | Logic for earning points | $1 = 1 point |
| **Template** | Pre-configured program | Coffee Punch Card |
| **Tier** | Membership level | Bronze, Silver, Gold |
| **Transaction** | Record of points activity | Earned 50 points on 2025-11-07 |

---

## References

- [DOMAIN-OVERVIEW.md](./DOMAIN-OVERVIEW.md)
- [ENTITIES.md](./ENTITIES.md)
- [BUSINESS-RULES.md](./BUSINESS-RULES.md)
- [Eric Evans: Domain-Driven Design](https://www.domainlanguage.com/)

---

**Document Owner**: Backend Team (Loyalty Squad)
**Last Updated**: 2025-11-07
