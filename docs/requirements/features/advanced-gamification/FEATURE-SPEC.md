# Advanced Gamification - Feature Specification

**Feature**: Advanced Gamification (Battle Passes, Seasons, Loot Boxes)
**Version**: 1.0.0
**Status**: 🟡 Phase 5 Feature (Months 13-18)
**Priority**: P1 (Critical for engagement and Gen Z retention)
**Last Updated**: 2025-11-07

---

## Problem Statement

**Current Challenge**: Basic points-and-badges systems are boring and transactional:
- Predictable rewards (no surprise/delight)
- No time-limited urgency (FOMO)
- No progression systems beyond tiers
- Younger demographics expect gaming mechanics
- Low emotional engagement

**Business Impact**:
- Lower engagement rates vs. gaming-inspired competitors
- Difficulty attracting/retaining Gen Z (digital natives)
- Missed revenue from premium features (battle passes)
- No recurring engagement loops (daily quests, seasons)

**Why This Matters**:
- **Fortnite** makes $5B+/year from battle passes
- **Duolingo** increased DAU by 40% with streak mechanics
- **Nike Run Club** retains users 3x longer with achievement systems
- **McDonald's Monopoly** drives 25% sales increase during game periods

---

## Solution Summary

Build gaming-inspired mechanics:

1. **Battle Passes**: Seasonal progression tracks (free + premium tiers)
2. **Daily/Weekly Quests**: Rotating challenges for bonus rewards
3. **Achievement System**: 100+ unlockable achievements
4. **Loot Boxes**: Random reward drops (ethical, no gambling)
5. **Leaderboards**: Competitive rankings with seasons
6. **Prestige System**: Reset progress for exclusive rewards
7. **Limited-Time Events**: Seasonal campaigns (Summer Festival, Holiday Rush)

**Technology Stack**:
- Game Engine: Custom progression engine
- Real-Time: Socket.io (live leaderboards)
- Analytics: Mixpanel, Amplitude (engagement tracking)
- A/B Testing: Optimizely (optimize reward curves)

---

## Success Criteria

| Metric | Current Baseline | Target (6 months) | Measurement |
|--------|------------------|-------------------|-------------|
| Daily Active Users (DAU) | 20% | 45%+ | DAU/MAU ratio |
| Session Frequency | 2x/week | 5x/week | Avg sessions per user |
| Battle Pass Purchases | $0 | $500K+/month | Premium battle pass revenue |
| Quest Completion Rate | N/A | 60%+ | % of daily quests completed |
| Achievement Unlocks | 0 | 1M+ total | Total achievements earned |
| 7-Day Retention | 35% | 60%+ | % users active after 7 days |
| Session Duration | 2 mins | 6+ mins | Avg time in app per session |

---

## User Stories

### Customer (Gamer)

**Story 1: Complete Daily Quests**
```
As a daily coffee drinker,
I want to complete daily quests for bonus rewards,
So that I'm motivated to visit every day and unlock rare items.

Acceptance Criteria:
- 3 daily quests refresh at midnight
- Quest examples: "Buy 2 coffees," "Try a new item," "Visit at breakfast time"
- Bonus: Complete all 3 → extra reward ("Daily Triple Bonus")
- Progress tracking: Real-time quest progress bar
- FOMO: Quests expire in 24 hours
```

**Story 2: Progress Through Battle Pass**
```
As a engaged customer,
I want to level up my battle pass by earning XP,
So that I can unlock exclusive rewards (skins, emotes, legendary items).

Acceptance Criteria:
- 100-level battle pass (free + premium tracks)
- Earn XP: Purchases, quests, challenges
- Unlock rewards every 5 levels
- Premium track ($9.99): 2x rewards, exclusive items
- Season length: 90 days (creates urgency)
- Visual progression: Level-up animations, unlocked items gallery
```

### Business Owner

**Story 3: Launch Limited-Time Event**
```
As a business owner,
I want to create a "Summer Festival" event with exclusive rewards,
So that I can drive traffic during slow season and create urgency.

Acceptance Criteria:
- Event dashboard: Set dates, rewards, challenges
- Custom event theme (branding, colors, images)
- Event-exclusive rewards (tropical drinks, beach badges)
- Leaderboard: Top 100 customers get exclusive "Festival Champion" badge
- Auto-end event after duration
- Post-event analytics: Participation, revenue impact
```

---

## Functional Requirements

### Must Have (Phase 5.1: Months 13-15)

#### FR1: Battle Pass System

**Description**: Fortnite-style seasonal progression with free and premium tracks

**Structure**:
```typescript
interface BattlePass {
  id: UUID;
  businessId: UUID;
  season: number; // Season 1, Season 2, etc.
  name: string; // "Summer Vibes," "Winter Wonderland"
  startDate: Date;
  endDate: Date; // 90 days duration
  maxLevel: number; // 100 levels

  // Tracks
  freeTier: BattlePassReward[]; // Free for all customers
  premiumTier: BattlePassReward[]; // $9.99 to unlock

  // Pricing
  premiumCost: number; // USD
  premiumCurrency: 'USD' | 'POINTS';

  // XP requirements
  xpPerLevel: number[]; // [100, 150, 200, ...] increasing per level
}

interface BattlePassReward {
  level: number; // Unlock at level X
  tier: 'FREE' | 'PREMIUM';
  rewardType: 'POINTS' | 'REWARD' | 'BADGE' | 'COSMETIC';
  rewardValue: any; // Points amount, reward ID, badge, etc.
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}
```

**Example Season 1: "Summer Vibes"**:
```typescript
const season1: BattlePass = {
  season: 1,
  name: 'Summer Vibes',
  startDate: new Date('2025-06-01'),
  endDate: new Date('2025-08-31'), // 90 days
  maxLevel: 100,

  freeTier: [
    { level: 1, tier: 'FREE', rewardType: 'POINTS', rewardValue: 50, rarity: 'COMMON' },
    { level: 5, tier: 'FREE', rewardType: 'BADGE', rewardValue: 'Summer Starter', rarity: 'COMMON' },
    { level: 10, tier: 'FREE', rewardType: 'REWARD', rewardValue: 'free-pastry', rarity: 'RARE' },
    { level: 25, tier: 'FREE', rewardType: 'COSMETIC', rewardValue: 'tropical-avatar', rarity: 'EPIC' },
    // ... more free rewards every 5-10 levels
  ],

  premiumTier: [
    { level: 1, tier: 'PREMIUM', rewardType: 'POINTS', rewardValue: 200, rarity: 'RARE' },
    { level: 3, tier: 'PREMIUM', rewardType: 'COSMETIC', rewardValue: 'summer-theme', rarity: 'RARE' },
    { level: 7, tier: 'PREMIUM', rewardType: 'REWARD', rewardValue: 'free-latte', rarity: 'RARE' },
    { level: 15, tier: 'PREMIUM', rewardType: 'BADGE', rewardValue: 'Summer Elite', rarity: 'EPIC' },
    { level: 50, tier: 'PREMIUM', rewardType: 'REWARD', rewardValue: '$20-gift-card', rarity: 'LEGENDARY' },
    { level: 100, tier: 'PREMIUM', rewardType: 'COSMETIC', rewardValue: 'legendary-summer-skin', rarity: 'LEGENDARY' },
    // ... premium rewards every 2-5 levels (more frequent)
  ],

  premiumCost: 9.99,
  premiumCurrency: 'USD',

  xpPerLevel: [
    100, 150, 200, 250, 300, // Levels 1-5
    350, 400, 450, 500, 550, // Levels 6-10
    // ... gradually increasing to level 100
  ]
};
```

**XP Earning**:
```typescript
interface XPSource {
  action: string;
  xpAmount: number;
}

const xpSources: XPSource[] = [
  { action: 'PURCHASE', xpAmount: 10 }, // 10 XP per $1 spent
  { action: 'DAILY_QUEST_COMPLETE', xpAmount: 50 },
  { action: 'WEEKLY_QUEST_COMPLETE', xpAmount: 200 },
  { action: 'CHALLENGE_WIN', xpAmount: 100 },
  { action: 'FRIEND_REFERRAL', xpAmount: 500 },
  { action: 'SOCIAL_POST', xpAmount: 25 }
];
```

**UI - Battle Pass Screen**:
```
┌─────────────────────────────────────────────────────────────┐
│  ⚔️  Battle Pass - Season 1: Summer Vibes                   │
│  Level 23 / 100                         🔥 12 days left     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Progress: ████████████████░░░░░░░░░░░░░░░░░░ 23%          │
│  XP: 5,240 / 6,000 (760 XP to level 24)                    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Rewards Track:                                    │    │
│  │                                                    │    │
│  │  Level 20  21  22  [23] 24  25  26  27  28  29  30│    │
│  │                                                    │    │
│  │  FREE:  50pts ✅ -- ✅ [🎁] 75pts -- -- 🏅 -- -- │    │
│  │                                                    │    │
│  │  PREMIUM:💎 200pts🎨 ✅ [🎁] ☕ 🎁 -- 🏆 -- -- │    │
│  │          ✅      ✅      ⬜  Current reward        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  Next Reward (Level 24):                                    │
│  🆓 FREE: 75 Bonus Points                                   │
│  💎 PREMIUM: Free Latte (any size) ⭐ RARE                  │
│                                                             │
│  ❌ Premium Locked - Unlock for $9.99                       │
│  • 2x more rewards                                          │
│  • Exclusive legendary items                                │
│  • Instant unlock of levels 1-23 rewards                    │
│                                                             │
│  [Unlock Premium - $9.99] [View All Rewards]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### FR2: Daily & Weekly Quests

**Description**: Rotating challenges that refresh daily/weekly

**Quest Types**:
```typescript
interface Quest {
  id: UUID;
  type: 'DAILY' | 'WEEKLY';
  name: string;
  description: string;
  objective: QuestObjective;
  reward: QuestReward;
  expiresAt: Date;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface QuestObjective {
  type: 'PURCHASE_COUNT' | 'SPEND_AMOUNT' | 'VISIT_LOCATION' | 'TRY_PRODUCT' | 'SOCIAL_SHARE';
  target: number; // e.g., 2 purchases, $20 spend
  current: number; // Progress (0 to target)
}

const dailyQuests: Quest[] = [
  {
    type: 'DAILY',
    name: 'Morning Routine',
    description: 'Buy a coffee before 10am',
    objective: { type: 'PURCHASE_COUNT', target: 1, current: 0 },
    reward: { type: 'XP', amount: 50 },
    difficulty: 'EASY'
  },
  {
    type: 'DAILY',
    name: 'Try Something New',
    description: 'Order an item you haven\'t tried this month',
    objective: { type: 'TRY_PRODUCT', target: 1, current: 0 },
    reward: { type: 'XP', amount: 75 },
    difficulty: 'MEDIUM'
  },
  {
    type: 'DAILY',
    name: 'Social Butterfly',
    description: 'Share your order on social media',
    objective: { type: 'SOCIAL_SHARE', target: 1, current: 0 },
    reward: { type: 'POINTS', amount: 100 },
    difficulty: 'EASY'
  }
];

const weeklyQuests: Quest[] = [
  {
    type: 'WEEKLY',
    name: 'Coffee Connoisseur',
    description: 'Purchase 10 coffees this week',
    objective: { type: 'PURCHASE_COUNT', target: 10, current: 0 },
    reward: { type: 'XP', amount: 500 },
    difficulty: 'HARD'
  },
  {
    type: 'WEEKLY',
    name: 'Big Spender',
    description: 'Spend $50 this week',
    objective: { type: 'SPEND_AMOUNT', target: 50, current: 0 },
    reward: { type: 'REWARD', rewardId: 'free-drink' },
    difficulty: 'HARD'
  }
];
```

**Daily Quest UI**:
```
┌─────────────────────────────────────────────────────────┐
│  📋 Daily Quests                     🔄 Resets in 8h    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ☕ Morning Routine                         EASY    │ │
│  │ Buy a coffee before 10am                           │ │
│  │ Progress: ██████████████████████ 1/1 ✅            │ │
│  │ Reward: +50 XP                    [Claim]          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🆕 Try Something New                    MEDIUM    │ │
│  │ Order an item you haven't tried this month         │ │
│  │ Progress: ░░░░░░░░░░░░░░░░░░░░ 0/1               │ │
│  │ Reward: +75 XP                                     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 📱 Social Butterfly                      EASY     │ │
│  │ Share your order on social media                   │ │
│  │ Progress: ░░░░░░░░░░░░░░░░░░░░ 0/1               │ │
│  │ Reward: +100 Points                                │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  💎 Daily Triple Bonus:                                 │
│  Complete all 3 quests → +200 Bonus XP! 🎉             │
│                                                         │
│  [View Weekly Quests]                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

#### FR3: Achievement System

**Description**: 100+ unlockable achievements (Xbox/PlayStation-style)

**Achievement Categories**:
```typescript
interface Achievement {
  id: UUID;
  category: AchievementCategory;
  name: string;
  description: string;
  requirement: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  icon: string;
  reward: AchievementReward;
  secret: boolean; // Hidden until unlocked
}

const achievements: Achievement[] = [
  // Rookie achievements (COMMON)
  {
    category: 'MILESTONE',
    name: 'First Sip',
    description: 'Make your first purchase',
    requirement: '1 purchase',
    rarity: 'COMMON',
    reward: { type: 'BADGE', value: 'first-sip' },
    secret: false
  },
  {
    category: 'MILESTONE',
    name: 'Coffee Enthusiast',
    description: 'Reach 1,000 lifetime points',
    requirement: '1,000 points earned',
    rarity: 'COMMON',
    reward: { type: 'POINTS', value: 100 },
    secret: false
  },

  // Rare achievements
  {
    category: 'STREAK',
    name: '7-Day Streak',
    description: 'Visit 7 days in a row',
    requirement: '7 consecutive days',
    rarity: 'RARE',
    reward: { type: 'REWARD', value: 'free-pastry' },
    secret: false
  },
  {
    category: 'SOCIAL',
    name: 'Influencer',
    description: 'Refer 10 friends',
    requirement: '10 referrals',
    rarity: 'RARE',
    reward: { type: 'BADGE', value: 'influencer' },
    secret: false
  },

  // Epic achievements
  {
    category: 'COLLECTOR',
    name: 'Gotta Catch Em All',
    description: 'Redeem all reward types',
    requirement: 'Redeem 10+ different rewards',
    rarity: 'EPIC',
    reward: { type: 'POINTS', value: 1000 },
    secret: false
  },
  {
    category: 'CHALLENGE',
    name: 'Challenge Champion',
    description: 'Win 10 challenges',
    requirement: '10 challenge completions',
    rarity: 'EPIC',
    reward: { type: 'COSMETIC', value: 'champion-badge' },
    secret: false
  },

  // Legendary achievements
  {
    category: 'MILESTONE',
    name: 'Coffee Legend',
    description: 'Reach 100,000 lifetime points',
    requirement: '100,000 points earned',
    rarity: 'LEGENDARY',
    reward: { type: 'REWARD', value: '$100-gift-card' },
    secret: true // Hidden achievement
  },
  {
    category: 'PRESTIGE',
    name: 'Prestige Master',
    description: 'Reach prestige level 10',
    requirement: 'Prestige 10 times',
    rarity: 'LEGENDARY',
    reward: { type: 'COSMETIC', value: 'legendary-avatar' },
    secret: true
  }
];
```

**Achievement Unlock UI**:
```
┌─────────────────────────────────────────────────────────┐
│  🏆 Achievement Unlocked!                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Animated Trophy Icon]                                 │
│                                                         │
│  ⭐ RARE ACHIEVEMENT                                    │
│                                                         │
│  7-Day Streak                                           │
│  "Visit 7 days in a row"                                │
│                                                         │
│  Reward: Free Pastry 🥐                                 │
│                                                         │
│  [Share Achievement] [View All Achievements]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

#### FR4: Loot Boxes (Ethical)

**Description**: Random rewards with transparent odds (no gambling mechanics)

**Loot Box Types**:
```typescript
interface LootBox {
  id: UUID;
  name: string;
  cost: number; // Points (NOT real money - ethical)
  costType: 'POINTS' | 'FREE'; // Never use USD
  rarity: 'COMMON' | 'RARE' | 'EPIC';
  guaranteedRewards: number; // Min rewards per box
  possibleRewards: LootBoxReward[];
  dropRates: DropRates; // Transparent odds
}

interface DropRates {
  COMMON: number; // 70%
  RARE: number; // 25%
  EPIC: number; // 4.5%
  LEGENDARY: number; // 0.5%
}

const lootBoxes: LootBox[] = [
  {
    name: 'Daily Free Box',
    cost: 0,
    costType: 'FREE', // Free daily box
    rarity: 'COMMON',
    guaranteedRewards: 1,
    possibleRewards: [
      { type: 'POINTS', amount: 50, rarity: 'COMMON' },
      { type: 'POINTS', amount: 100, rarity: 'RARE' },
      { type: 'DISCOUNT', value: '10% off', rarity: 'RARE' }
    ],
    dropRates: { COMMON: 0.8, RARE: 0.19, EPIC: 0.01, LEGENDARY: 0 }
  },
  {
    name: 'Bronze Box',
    cost: 500, // 500 points
    costType: 'POINTS',
    rarity: 'RARE',
    guaranteedRewards: 3,
    possibleRewards: [
      { type: 'POINTS', amount: 100, rarity: 'COMMON' },
      { type: 'REWARD', rewardId: 'free-pastry', rarity: 'RARE' },
      { type: 'COSMETIC', value: 'avatar-frame', rarity: 'EPIC' },
      { type: 'REWARD', rewardId: 'free-latte', rarity: 'LEGENDARY' }
    ],
    dropRates: { COMMON: 0.7, RARE: 0.25, EPIC: 0.045, LEGENDARY: 0.005 }
  }
];
```

**Ethical Design**:
- ✅ NO real money purchases (points only)
- ✅ Transparent drop rates (display odds)
- ✅ Guaranteed rewards (no empty boxes)
- ✅ No "pay to win" (cosmetic items only)
- ✅ Daily free box (everyone can participate)

**Loot Box UI**:
```
┌─────────────────────────────────────────────────────────┐
│  🎁 Loot Box - Opening Bronze Box...                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Animated box opening]                                 │
│                                                         │
│  You received:                                          │
│                                                         │
│  1. ⭐ 100 Points (COMMON)                              │
│  2. ⭐⭐ Free Pastry (RARE)                             │
│  3. ⭐⭐⭐ Avatar Frame - "Gold Border" (EPIC) 🎉       │
│                                                         │
│  [Open Another] [View Inventory]                        │
│                                                         │
│  Drop Rates (Bronze Box):                               │
│  Common: 70%, Rare: 25%, Epic: 4.5%, Legendary: 0.5%   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

#### FR5: Limited-Time Events

**Description**: Seasonal campaigns with exclusive rewards

**Event Types**:
```typescript
interface Event {
  id: UUID;
  name: string;
  description: string;
  theme: EventTheme; // SUMMER, HALLOWEEN, HOLIDAY, SPRING
  startDate: Date;
  endDate: Date;
  rewards: EventReward[];
  leaderboard: boolean; // Top 100 get special rewards
  specialMechanics?: EventMechanic;
}

const events: Event[] = [
  {
    name: 'Summer Festival',
    description: 'Cool down with tropical drinks and exclusive rewards!',
    theme: 'SUMMER',
    startDate: new Date('2025-07-01'),
    endDate: new Date('2025-08-31'),
    rewards: [
      { name: 'Tropical Avatar', rarity: 'RARE', requirement: 'Buy 5 iced drinks' },
      { name: 'Festival Champion Badge', rarity: 'LEGENDARY', requirement: 'Top 100 on leaderboard' }
    ],
    leaderboard: true,
    specialMechanics: {
      type: 'DOUBLE_XP',
      description: 'Earn 2x XP on all purchases during event'
    }
  },
  {
    name: 'Holiday Rush',
    description: 'Spread cheer and unlock festive rewards!',
    theme: 'HOLIDAY',
    startDate: new Date('2025-12-01'),
    endDate: new Date('2025-12-31'),
    rewards: [
      { name: 'Snowflake Avatar', rarity: 'EPIC', requirement: 'Complete 20 daily quests' },
      { name: 'Holiday Gift Box', rarity: 'LEGENDARY', requirement: 'Spend $100 during event' }
    ],
    leaderboard: false
  }
];
```

---

### Should Have (Phase 5.2: Months 16-17)

#### FR6: Prestige System

**Description**: Reset progress for exclusive rewards (Call of Duty-style)

**How It Works**:
1. Reach max level (e.g., Level 100)
2. Option to "Prestige" (reset to Level 1)
3. Keep: All purchased items, premium battle passes
4. Lose: Current level, some achievements
5. Gain: Prestige badge, exclusive cosmetics, bonus XP multiplier

```typescript
interface Prestige {
  level: number; // Prestige 1, 2, 3...
  requirement: string; // "Reach level 100"
  rewards: PrestigeReward[];
  xpMultiplier: number; // 1.1x, 1.2x, etc. (faster leveling)
}
```

---

#### FR7: Cosmetics Shop

**Description**: Avatar frames, themes, emotes (monetization opportunity)

**Cosmetic Types**:
- Avatar Frames: Borders around profile picture
- App Themes: Dark mode, neon, retro
- Emotes: Animated reactions
- Profile Badges: Display on profile

**Pricing**:
- Common: 100 points
- Rare: 500 points
- Epic: 2,000 points
- Legendary: $4.99 USD (optional monetization)

---

### Could Have (Phase 5.3: Month 18+)

#### FR8: Clan/Guild System
- Create clans with friends (5-20 members)
- Clan leaderboards
- Clan wars (team competitions)

#### FR9: PvP Challenges
- Challenge friends to duels
- Winner gets bonus rewards

#### FR10: Seasonal Rankings
- Bronze → Silver → Gold → Platinum → Diamond tiers
- Rank decay (must maintain activity)

---

## API Endpoints

```typescript
// Battle pass
GET /api/v1/gamification/battle-pass/current
POST /api/v1/gamification/battle-pass/unlock-premium
POST /api/v1/gamification/battle-pass/claim-reward

// Quests
GET /api/v1/gamification/quests/daily
GET /api/v1/gamification/quests/weekly
POST /api/v1/gamification/quests/{id}/claim

// Achievements
GET /api/v1/gamification/achievements
POST /api/v1/gamification/achievements/{id}/unlock

// Loot boxes
POST /api/v1/gamification/loot-boxes/{id}/open
GET /api/v1/gamification/loot-boxes/inventory

// Events
GET /api/v1/gamification/events/active
GET /api/v1/gamification/events/{id}/leaderboard
```

---

## Rollout Plan

### Phase 5.1: Core Features (Months 13-15)
- Month 13: Battle passes, daily quests
- Month 14: Achievement system, weekly quests
- Month 15: Loot boxes, limited-time events

### Phase 5.2: Advanced Features (Months 16-17)
- Month 16: Prestige system, cosmetics shop
- Month 17: Clan system

### Phase 5.3: PvP & Seasons (Month 18+)
- PvP challenges
- Seasonal rankings

---

## Success Metrics

**After 6 Months**:
- 45%+ DAU/MAU ratio
- 5x/week session frequency
- $500K+/month battle pass revenue
- 60%+ quest completion rate
- 60%+ 7-day retention

---

## Risks & Mitigation

1. **Over-Gamification**: Balance fun vs. transactional (don't make it feel like work)
2. **Pay-to-Win Concerns**: Keep premium rewards cosmetic-only
3. **Complexity**: Onboarding flow explains battle pass, quests
4. **Ethical Loot Boxes**: Transparent odds, no real money, guaranteed rewards
5. **Player Burnout**: Rotate quests, limit daily requirements

---

**Document Owner**: Backend Team (Gamification Squad)
**Last Updated**: 2025-11-07
**Status**: Ready for Review
