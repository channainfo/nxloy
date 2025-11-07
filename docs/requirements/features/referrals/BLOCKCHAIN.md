# Referrals - Blockchain Integration

**Feature**: Referrals
**Version**: 1.0.0
**Status**: 🟡 Phase 4 Feature
**Last Updated**: 2025-11-07

## Overview

Blockchain integration enables transparent referral tracking, on-chain reward distribution, and NFT-based referral badges for top referrers.

**Phase**: Phase 4 (Months 10-12)
**Priority**: P2 (Medium)
**Dependencies**: Referrals (Phase 2), Blockchain Domain (Phase 4)

## Blockchain Features

### 1. On-Chain Referral Tracking

**Purpose**: Store referral relationships on blockchain for transparency

**Benefits**:
- **Immutable Records**: Referrals can't be disputed
- **Transparent Attribution**: Anyone can verify referral chains
- **Cross-Platform**: Referral credits work across businesses
- **Fraud-Proof**: Can't fake on-chain referrals

**Smart Contract**:
```solidity
contract ReferralProgram {
  mapping(address => address) public referredBy;
  mapping(address => uint256) public referralCount;
  mapping(address => uint256) public earnedRewards;

  function recordReferral(address referee, address referrer) external {
    require(referredBy[referee] == address(0), "Already referred");
    require(referee != referrer, "Cannot self-refer");

    referredBy[referee] = referrer;
    referralCount[referrer]++;

    emit ReferralRecorded(referee, referrer, block.timestamp);
  }

  function getReferrer(address customer) external view returns (address) {
    return referredBy[customer];
  }
}
```

---

### 2. Token-Based Referral Rewards

**Purpose**: Distribute referral rewards as blockchain tokens

**Benefits**:
- **Instant Distribution**: No manual approval
- **Transferable**: Referrers can send tokens to others
- **Tradeable**: Can sell tokens on DEX
- **Transparent**: All rewards visible on-chain

**Reward Structure**:
```typescript
{
  "referralProgram": "Coffee Rewards Referral",
  "rewardType": "TWO_SIDED",
  "referrerReward": {
    "type": "TOKEN",
    "tokenAmount": "50000000000000000000", // 50 COFFEE tokens
    "tokenSymbol": "COFFEE",
    "chain": "POLYGON"
  },
  "refereeReward": {
    "type": "TOKEN",
    "tokenAmount": "25000000000000000000", // 25 COFFEE tokens
    "tokenSymbol": "COFFEE",
    "chain": "POLYGON"
  }
}
```

**Reward Flow**:
1. Alice shares referral code with Bob
2. Bob signs up and makes first purchase
3. System mints 50 COFFEE tokens to Alice's wallet
4. System mints 25 COFFEE tokens to Bob's wallet
5. Both receive instant notification

---

### 3. NFT Referral Badges

**Purpose**: Award NFT badges to top referrers for achievements

**Benefits**:
- **Status Symbol**: Show off referral success
- **Gamification**: Collect badges for milestones
- **Tradeable**: Sell rare badges on OpenSea
- **Exclusive Perks**: Badge holders get special benefits

**Badge Tiers**:
- **Bronze**: 10 referrals → Bronze Badge NFT
- **Silver**: 50 referrals → Silver Badge NFT
- **Gold**: 100 referrals → Gold Badge NFT
- **Diamond**: 500 referrals → Diamond Badge NFT (1/100 limited edition)

**NFT Metadata**:
```json
{
  "name": "Referral Champion Gold Badge",
  "description": "Awarded for 100 successful referrals",
  "image": "ipfs://QmGold.../badge.png",
  "attributes": [
    { "trait_type": "Tier", "value": "Gold" },
    { "trait_type": "Referrals", "value": 100 },
    { "trait_type": "Rarity", "value": "Epic" }
  ]
}
```

---

### 4. Referral NFT Leaderboard

**Purpose**: Display top referrers with NFT proof

**Benefits**:
- **Public Recognition**: Leaderboard shows wallet addresses
- **Verifiable**: Can't fake NFT-based leaderboard rankings
- **Competitive**: Encourages more referrals
- **Rewards**: Top 10 get exclusive NFTs

**Leaderboard UI**:
```
🏆 Top Referrers (All-Time)

1. 0x742d...f0bEb - 1,247 referrals - 💎 Diamond Badge
2. 0x8a3e...2c1d - 892 referrals - 🥇 Gold Badge
3. 0x5f9a...7e4b - 674 referrals - 🥇 Gold Badge
...

[View on PolygonScan]
```

---

## Technical Architecture

### Referral Code with Wallet Address

```typescript
interface ReferralCode {
  id: UUID;
  code: string; // e.g., "ALICE123"
  programId: UUID;
  customerId: UUID;
  walletAddress?: string; // Optional wallet for on-chain tracking
  type: 'AUTO_GENERATED' | 'CUSTOM';
  timesClicked: number;
  conversions: number;
}
```

### On-Chain Referral Recording

1. **Bob Uses Alice's Referral Code**:
   ```typescript
   // Off-chain tracking (traditional)
   await referralRepo.save({
     referrerId: alice.id,
     refereeId: bob.id,
     programId,
     status: 'SIGNED_UP'
   });

   // On-chain tracking (if wallets connected)
   if (alice.walletAddress && bob.walletAddress) {
     await referralContract.recordReferral(
       bob.walletAddress,
       alice.walletAddress
     );
   }
   ```

2. **Bob Makes First Purchase** (conversion event):
   ```typescript
   // Update off-chain status
   referral.status = 'CONVERTED';
   await referralRepo.save(referral);

   // Mint tokens to referrer (Alice)
   await mintTokens(
     tokenProgram,
     alice.walletAddress,
     referrerReward.tokenAmount
   );

   // Mint tokens to referee (Bob)
   await mintTokens(
     tokenProgram,
     bob.walletAddress,
     refereeReward.tokenAmount
   );

   // Check for badge milestones
   if (alice.totalReferrals === 100) {
     await mintReferralBadge(
       alice.walletAddress,
       'GOLD',
       alice.totalReferrals
     );
   }
   ```

---

## User Experience

### Referrer (Alice) Flow

1. **Connect Wallet**:
   ```
   🎁 Earn Crypto for Referrals!

   Connect your wallet to receive token rewards:
   - 50 COFFEE tokens per successful referral
   - NFT badges for milestones (10, 50, 100 referrals)
   - Instant rewards (no waiting)

   [Connect Wallet]
   ```

2. **Share Referral Code**:
   ```
   Your Referral Code: ALICE123

   Wallet: 0x742d...f0bEb
   Network: Polygon

   Share with friends to earn:
   ✅ 50 COFFEE tokens per referral
   ✅ NFT badges for milestones
   ✅ Leaderboard ranking

   [Copy Code] [Share on Twitter]
   ```

3. **Receive Referral Rewards**:
   ```
   🎉 Referral Successful!

   Your friend Bob signed up and made a purchase!

   Rewards:
   ✅ 50 COFFEE tokens sent to your wallet
   ✅ View transaction: 0x8f3e... (12 confirmations)

   Total Referrals: 99
   🏆 Next milestone: 100 referrals → Gold Badge NFT!
   ```

4. **Earn Badge**:
   ```
   🏆 Congratulations! Milestone Achieved!

   You've reached 100 successful referrals!

   Reward: Gold Badge NFT
   - Minted to your wallet
   - View on OpenSea: https://opensea.io/assets/...
   - Grants 5x points multiplier

   [View NFT in Wallet]
   ```

### Referee (Bob) Flow

1. **Sign Up with Referral Code**:
   ```
   🎁 Welcome Bonus!

   Your friend Alice invited you!

   Earn 25 COFFEE tokens when you:
   1. Connect your wallet
   2. Make your first purchase

   [Connect Wallet] [Skip (Don't Get Bonus)]
   ```

2. **Receive Bonus**:
   ```
   ✅ Welcome Bonus Received!

   You earned 25 COFFEE tokens!
   - Sent to your wallet: 0x5f9a...7e4b
   - Transaction: 0x2a1c... (12 confirmations)

   Use tokens to:
   - Redeem rewards
   - Transfer to friends
   - Trade on Uniswap

   [View in Wallet]
   ```

---

## Fraud Prevention

### On-Chain Verification

**Challenge**: Prevent fake referrals

**Solution**: Require wallet signature for conversion

```typescript
// Referee must sign message to confirm referral
const message = `I confirm that ${referrerAddress} referred me.`;
const signature = await wallet.signMessage(message);

// Verify signature on-chain
const isValid = await referralContract.verifyReferral(
  refereeAddress,
  referrerAddress,
  signature
);

if (!isValid) {
  throw new FraudDetectedError('Invalid referral signature');
}
```

---

## Cost Analysis

**Polygon**:
| Operation | Gas Cost | USD Cost (MATIC @ $0.50) |
|-----------|----------|--------------------------|
| Record Referral | 50,000 gas | ~$0.01 |
| Mint Tokens (Referrer) | 50,000 gas | ~$0.01 |
| Mint Tokens (Referee) | 50,000 gas | ~$0.01 |
| Mint Badge NFT | 100,000 gas | ~$0.02 |

**Total per Conversion**: ~$0.03 (if business subsidizes gas)

**Break-Even**: 1,000 conversions = $30 gas cost

---

## Implementation Phases

### Phase 4.1: Token Rewards (Months 10-11)
- Mint tokens on referral conversion
- Two-sided rewards (referrer + referee)

### Phase 4.2: NFT Badges (Month 12)
- Milestone badges (10, 50, 100, 500 referrals)
- Limited edition Diamond badges

### Phase 4.3: On-Chain Tracking (Month 13-14)
- Record all referrals on-chain
- Public leaderboard
- Fraud prevention with signatures

---

## Success Metrics

**Phase 4 Targets**:
- Referrals recorded on-chain: 100,000+
- Token rewards distributed: 5,000,000+ tokens
- Badge NFTs minted: 5,000+
- Secondary market sales: $10,000+ GMV

---

## References

- [Blockchain Domain Specification](../../domain-specs/blockchain/)
- [Feature Spec: Referrals](./FEATURE-SPEC.md)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
