# Reward Catalog - Blockchain Integration

**Feature**: Reward Catalog
**Version**: 1.0.0
**Status**: 🟡 Phase 4 Feature
**Last Updated**: 2025-11-07

## Overview

Blockchain integration enables the Reward Catalog to offer NFT-based rewards and token-redeemable items, creating unique digital collectibles and crypto-native redemption experiences.

**Phase**: Phase 4 (Months 10-12)
**Priority**: P2 (High)
**Dependencies**: Reward Catalog (Phase 2), Blockchain Domain (Phase 4)

## Blockchain Features for Reward Catalog

### 1. NFT Rewards

**Purpose**: Offer digital collectibles, exclusive content, and proof of redemption as NFT rewards

**Benefits**:
- **True Ownership**: Customers own NFTs in their wallets
- **Tradeable**: Can be sold/traded on NFT marketplaces
- **Proof of Redemption**: Immutable record of reward claim
- **Exclusive Access**: NFT grants access to exclusive content/events

**Reward Types as NFTs**:
1. **Digital Collectibles**: Artwork, badges, trading cards
2. **Membership NFTs**: VIP access, exclusive club membership
3. **Event Tickets**: Concert tickets, meet-and-greets
4. **Digital Content**: Music, videos, eBooks
5. **Physical Item Proof**: NFT as receipt for physical reward

---

### 2. Token-Redeemable Rewards

**Purpose**: Allow customers to redeem blockchain tokens for rewards

**Benefits**:
- **Transparent Pricing**: Reward costs visible on-chain
- **Automated Redemption**: Smart contract handles redemption logic
- **Cross-Platform**: Tokens work across multiple businesses
- **Instant Settlement**: No manual approval needed

**Example Rewards**:
```json
{
  "rewardId": "reward-123",
  "name": "Free Coffee",
  "description": "Redeem for any coffee size",
  "costTraditional": 500, // 500 points
  "costBlockchain": {
    "enabled": true,
    "tokenAmount": "10000000000000000000", // 10 COFFEE tokens
    "tokenSymbol": "COFFEE",
    "chain": "POLYGON"
  },
  "rewardType": "VOUCHER",
  "stockQuantity": 1000
}
```

---

### 3. Limited Edition NFT Rewards

**Purpose**: Create scarcity and collectibility with limited edition NFTs

**Benefits**:
- **Scarcity**: Only N NFTs minted (e.g., 1/100)
- **Increased Value**: Rarity drives secondary market prices
- **Gamification**: Customers rush to claim rare NFTs
- **Brand Prestige**: Limited editions create exclusivity

**Configuration**:
```typescript
{
  "rewardName": "Diamond Member Badge",
  "rewardType": "NFT",
  "nftConfig": {
    "contractAddress": "0x123abc...",
    "chain": "POLYGON",
    "maxSupply": 100, // Only 100 will ever exist
    "currentSupply": 42, // 42 minted so far
    "metadata": {
      "name": "Diamond Member Badge #{tokenId}",
      "description": "Ultra-rare membership badge (1/100)",
      "image": "ipfs://QmDiamond.../badge.png",
      "attributes": [
        { "trait_type": "Rarity", "value": "Legendary" },
        { "trait_type": "Max Supply", "value": 100 }
      ]
    }
  }
}
```

---

### 4. Redeemable NFT Vouchers

**Purpose**: NFTs that act as vouchers for physical items

**Benefits**:
- **Transferable Vouchers**: Gift/sell vouchers as NFTs
- **No Expiration**: Vouchers never expire (unless programmed)
- **Fraud-Proof**: Can't duplicate NFT vouchers
- **Trackable**: See all voucher redemptions on-chain

**Redemption Flow**:
1. Customer redeems 500 COFFEE tokens
2. Receives NFT voucher in wallet
3. Shows NFT to barista (QR code)
4. Barista scans QR, burns NFT
5. Customer receives free coffee
6. NFT marked as "redeemed" (burned)

**Smart Contract**:
```solidity
contract RedeemableVoucher is ERC721 {
  mapping(uint256 => bool) public redeemed;

  function redeemVoucher(uint256 tokenId) external {
    require(ownerOf(tokenId) == msg.sender, "Not voucher owner");
    require(!redeemed[tokenId], "Already redeemed");

    redeemed[tokenId] = true;
    _burn(tokenId);

    emit VoucherRedeemed(tokenId, msg.sender);
  }
}
```

---

## Reward Types with Blockchain Integration

### 1. DISCOUNT (Traditional + Token)

**Traditional**: "20% off next purchase" (500 points)
**Blockchain**: "20% off next purchase" (10 COFFEE tokens)

**Implementation**:
```typescript
if (customer.blockchainEnabled && customer.hasTokens(requiredTokens)) {
  await burnTokens(customer, requiredTokens);
} else {
  await deductPoints(customer, requiredPoints);
}
```

---

### 2. FREE_ITEM (NFT Voucher)

**Traditional**: "Free coffee" (manually verified)
**Blockchain**: "Free coffee NFT voucher" (on-chain verification)

**Benefits**:
- Can't forge NFT vouchers
- Automatic verification via QR scan
- Transferable (gift to friend)

---

### 3. CASHBACK (Token Airdrop)

**Traditional**: "$5 cashback" (added to account)
**Blockchain**: "5 USDC" (sent to wallet)

**Benefits**:
- Instant settlement
- Can use anywhere USDC accepted
- Transparent on-chain record

---

### 4. EXPERIENCE (NFT Ticket)

**Traditional**: "VIP event ticket" (email confirmation)
**Blockchain**: "VIP event NFT ticket" (minted to wallet)

**Benefits**:
- Verifiable authenticity (can't fake NFTs)
- Sellable on secondary market
- Collectible after event
- Can include dynamic metadata (e.g., seat number)

**Example**:
```json
{
  "name": "Coffee Fest VIP Ticket 2026",
  "description": "Access to VIP lounge and exclusive merchandise",
  "image": "ipfs://QmTicket.../vip.png",
  "attributes": [
    { "trait_type": "Event Date", "value": "2026-06-15", "display_type": "date" },
    { "trait_type": "Seat", "value": "VIP-A12" },
    { "trait_type": "Access Level", "value": "VIP" }
  ]
}
```

---

### 5. DONATION (Token Donation)

**Traditional**: "Donate 500 points to charity" (platform handles)
**Blockchain**: "Donate 10 COFFEE tokens to charity wallet" (direct on-chain)

**Benefits**:
- Transparent donations (view on blockchain)
- Direct to charity (no intermediary)
- Tax deductible (on-chain proof)

---

## Technical Architecture

### Reward Definition with Blockchain

```typescript
interface RewardDefinition {
  id: UUID;
  businessId: UUID;
  name: string;
  description: string;
  rewardType: RewardType;

  // Traditional cost
  pointCost: number;

  // Blockchain cost (optional)
  blockchainCost?: {
    enabled: boolean;
    costType: 'TOKEN' | 'NFT_BURN';
    tokenAmount?: string; // For TOKEN type
    tokenSymbol?: string;
    nftContractAddress?: string; // For NFT_BURN type
    chain: BlockchainNetwork;
  };

  // NFT reward (optional)
  nftReward?: {
    enabled: boolean;
    contractAddress: string;
    chain: BlockchainNetwork;
    metadataTemplate: NFTMetadata;
    maxSupply?: number; // Limited edition
    isPermanent: boolean; // Or redeemable (burnable)
  };

  stockQuantity: number;
  isActive: boolean;
}
```

### Redemption Flow

#### Scenario 1: Redeem Tokens for NFT Reward

1. **Customer Requests Redemption**:
   ```typescript
   POST /api/v1/rewards/redeem
   {
     "rewardId": "reward-123",
     "customerId": "cust-456",
     "paymentMethod": "BLOCKCHAIN_TOKEN"
   }
   ```

2. **Validate Token Balance**:
   ```typescript
   const balance = await getTokenBalance(customer.walletAddress, tokenProgram);
   if (balance < reward.blockchainCost.tokenAmount) {
     throw new InsufficientTokensError();
   }
   ```

3. **Burn Tokens**:
   ```typescript
   await burnTokens(
     tokenProgram.contractAddress,
     customer.walletAddress,
     reward.blockchainCost.tokenAmount
   );
   ```

4. **Mint NFT Reward**:
   ```typescript
   await mintNFTReward(
     reward.nftReward.contractAddress,
     customer.walletAddress,
     reward.nftReward.metadataTemplate
   );
   ```

5. **Record Redemption**:
   ```typescript
   await redemptionRepo.save({
     rewardId,
     customerId,
     paymentMethod: 'BLOCKCHAIN_TOKEN',
     tokensBurned: reward.blockchainCost.tokenAmount,
     nftMinted: nftId,
     transactionHash: '0x8f3e...',
   });
   ```

#### Scenario 2: Burn NFT Voucher for Physical Item

1. **Customer Shows NFT at Store**:
   - Barista scans QR code containing NFT token ID

2. **Verify NFT Ownership**:
   ```typescript
   const owner = await nftContract.ownerOf(tokenId);
   if (owner !== customer.walletAddress) {
     throw new NotOwnerError();
   }
   ```

3. **Burn NFT Voucher**:
   ```typescript
   await nftContract.burn(tokenId);
   ```

4. **Deliver Physical Item**:
   - Barista prepares coffee
   - System records redemption

---

## Supported Reward Types

| Reward Type | Blockchain Support | Implementation |
|-------------|-------------------|----------------|
| DISCOUNT | ✅ Token payment | Burn tokens, apply discount |
| FREE_ITEM | ✅ NFT voucher | Mint NFT voucher, burn on redemption |
| CASHBACK | ✅ Token airdrop | Send tokens/stablecoins to wallet |
| GIFT_CARD | ✅ NFT gift card | Mint NFT with stored value |
| EXPERIENCE | ✅ NFT ticket | Mint NFT ticket (event access) |
| DONATION | ✅ Token donation | Transfer tokens to charity wallet |
| PHYSICAL_ITEM | ✅ NFT receipt | Mint NFT as proof of redemption |
| TIER_UPGRADE | ✅ NFT membership | Mint tier NFT with benefits |

---

## User Experience

### Browsing Rewards

**Traditional UI**:
```
Free Coffee
Cost: 500 points
Stock: 100 remaining
[Redeem Now]
```

**Blockchain UI**:
```
Free Coffee NFT Voucher
Cost: 10 COFFEE tokens OR 500 points
Stock: 100 remaining
Reward: NFT voucher (transferable)

[Redeem with Tokens] [Redeem with Points]
```

### Redemption Confirmation

**After Redeeming with Tokens**:
```
✅ Redemption Successful!

Your reward:
- NFT Voucher minted to your wallet
- View in MetaMask: Assets → NFTs → Free Coffee Voucher
- Show this QR code at any store:
  [QR Code: Token ID 42]

Transaction: 0x8f3e... (12 confirmations)

Note: This NFT will be burned when you redeem your free coffee.
```

---

## Limited Edition NFT Rewards

### Scarcity Mechanics

**Example**: Diamond Member Badge (1/100)

```typescript
{
  "rewardName": "Diamond Member Badge",
  "nftConfig": {
    "maxSupply": 100,
    "currentSupply": 42,
    "tierDistribution": {
      "Common": 0, // No common (all legendary)
      "Rare": 0,
      "Epic": 0,
      "Legendary": 100
    }
  },
  "costBlockchain": {
    "tokenAmount": "1000000000000000000000", // 1,000 COFFEE tokens
    "tokenSymbol": "COFFEE"
  }
}
```

**Scarcity UI**:
```
🏆 Diamond Member Badge
Limited Edition: 42/100 minted

⚡ Only 58 remaining!

This NFT grants:
- 10x points multiplier
- Priority support
- Exclusive events access
- Tradeable on OpenSea

Cost: 1,000 COFFEE tokens
[Claim Now Before They're Gone!]
```

---

## Gas Optimization

### Batch Redemptions

**Problem**: 100 customers redeem simultaneously → 100 separate transactions

**Solution**: Batch mint NFT rewards in single transaction

```typescript
// Bad: 100 transactions
for (const customer of customers) {
  await mintNFT(customer.walletAddress);
}

// Good: 1 batch transaction
await mintNFTBatch(customers.map(c => c.walletAddress));
```

**Savings**: 40-60% gas reduction

---

## Cost Analysis

**Polygon (Recommended)**:
| Operation | Gas Cost | USD Cost (MATIC @ $0.50) |
|-----------|----------|--------------------------|
| Mint NFT Voucher | 100,000 gas | ~$0.02 |
| Burn NFT Voucher | 50,000 gas | ~$0.01 |
| Burn Tokens | 50,000 gas | ~$0.01 |
| Batch Mint (10 NFTs) | 400,000 gas | ~$0.08 ($0.008 per NFT) |

**Break-Even**: With 1,000 NFT reward redemptions/month @ $0.02 each = $20/month gas cost

---

## Implementation Phases

### Phase 4.1: Token-Redeemable Rewards (Months 10-11)
- Support token payment for existing rewards
- Token burn on redemption
- Dual pricing (points OR tokens)

### Phase 4.2: NFT Voucher Rewards (Month 12)
- Mint NFT vouchers on redemption
- QR code redemption at stores
- Burn NFT on physical item claim

### Phase 4.3: Limited Edition NFTs (Month 13-14)
- Collectible NFT rewards
- Scarcity mechanics
- OpenSea integration
- Secondary market tracking

---

## Success Metrics

**Phase 4 Targets**:
- Token redemptions: 50,000+
- NFT vouchers minted: 10,000+
- NFT vouchers burned: 8,000+ (80% redemption rate)
- Limited edition NFTs sold out: 10+ collections
- Secondary market sales: $50,000+ GMV

---

## References

- [Blockchain Domain Specification](../../domain-specs/blockchain/)
- [Feature Spec: Reward Catalog](./FEATURE-SPEC.md)
- [Loyalty Programs Blockchain Integration](../loyalty-programs/BLOCKCHAIN.md)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
