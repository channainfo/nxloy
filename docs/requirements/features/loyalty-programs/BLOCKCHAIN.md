# Loyalty Programs - Blockchain Integration

**Feature**: Loyalty Programs
**Version**: 1.0.0
**Status**: 🟡 Phase 4 Feature
**Last Updated**: 2025-11-07

## Overview

Blockchain integration allows loyalty programs to offer NFT rewards and token-based points systems, providing customers with true ownership, transferability, and secondary market opportunities.

**Phase**: Phase 4 (Months 10-12)
**Priority**: P2 (High)
**Dependencies**: Loyalty Programs (Phase 1), Blockchain Domain (Phase 4)

## Blockchain Features for Loyalty Programs

### 1. Token-Based Point Systems

**Purpose**: Replace traditional points with blockchain tokens (ERC-20)

**Benefits**:
- **Transferable**: Customers can send points to friends
- **Tradeable**: Points can be exchanged on DEX (Uniswap)
- **Transparent**: All transactions visible on-chain
- **Inter-operable**: Points work across multiple businesses (partner network)

**Example**:
```json
{
  "programName": "Coffee Rewards",
  "ruleType": "POINTS_BASED",
  "pointsPerDollar": 10,
  "blockchainConfig": {
    "enabled": true,
    "tokenName": "Coffee Points",
    "tokenSymbol": "COFFEE",
    "tokenDecimals": 18,
    "chain": "POLYGON",
    "transferable": true,
    "maxSupply": "1000000000000000000000000" // 1 million tokens
  }
}
```

**User Flow**:
1. Customer spends $10 at coffee shop
2. Earns 100 COFFEE tokens (minted on Polygon)
3. Tokens appear in customer's wallet (MetaMask)
4. Customer can:
   - Redeem for free coffee (10,000 COFFEE = 1 free coffee)
   - Send to friend (transfer on-chain)
   - Trade on Uniswap (if liquidity pool exists)

---

### 2. NFT Milestone Rewards

**Purpose**: Award NFT badges when customers reach milestones

**Benefits**:
- **Collectible**: Customers can collect NFT badges
- **Status Symbol**: Show off achievements (Twitter, Discord)
- **Sellable**: Rare NFTs can be sold on OpenSea
- **Gamification**: Increases engagement through collection mechanics

**Example Milestones**:
- 10 purchases → Bronze NFT Badge
- 50 purchases → Silver NFT Badge
- 100 purchases → Gold NFT Badge
- 500 purchases → Diamond NFT Badge (1/100 limited edition)

**NFT Metadata**:
```json
{
  "name": "Coffee Lover Gold Badge #42",
  "description": "Awarded for 100 purchases at Coffee Rewards",
  "image": "ipfs://QmX7Y9.../gold-badge.png",
  "attributes": [
    { "trait_type": "Tier", "value": "Gold" },
    { "trait_type": "Purchases", "value": 100 },
    { "trait_type": "Issue Number", "value": 42 },
    { "trait_type": "Rarity", "value": "Rare" }
  ]
}
```

---

### 3. On-Chain Program Verification

**Purpose**: Store loyalty program rules on blockchain for transparency

**Benefits**:
- **Immutable**: Program rules can't be changed arbitrarily
- **Trustless**: Customers can verify rules without trusting business
- **Auditable**: All program changes recorded on-chain

**Smart Contract Example**:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LoyaltyProgram {
  string public programName;
  uint256 public pointsPerDollar;
  address public businessOwner;

  mapping(address => uint256) public customerPoints;

  constructor(string memory _name, uint256 _pointsPerDollar) {
    programName = _name;
    pointsPerDollar = _pointsPerDollar;
    businessOwner = msg.sender;
  }

  function awardPoints(address customer, uint256 purchaseAmount) external {
    require(msg.sender == businessOwner, "Only business can award points");
    uint256 points = purchaseAmount * pointsPerDollar;
    customerPoints[customer] += points;
  }

  function getPoints(address customer) external view returns (uint256) {
    return customerPoints[customer];
  }
}
```

---

### 4. Tier-Based NFT Memberships

**Purpose**: Use NFTs to represent tier membership

**Benefits**:
- **Portable**: Tier status visible across wallets/platforms
- **Tradeable**: Customers can sell tier memberships
- **Exclusive**: Access to holder-only benefits
- **Flexible**: NFT attributes determine tier benefits

**Example**:
- **Bronze Tier NFT**: 2x points multiplier
- **Silver Tier NFT**: 3x points + free shipping
- **Gold Tier NFT**: 5x points + priority support + exclusive events

**Implementation**:
```typescript
// Check if customer holds tier NFT
const tierNFT = await getTierNFT(customerAddress);
if (tierNFT) {
  const multiplier = tierNFT.attributes.find(a => a.trait_type === 'Multiplier').value;
  earnedPoints *= multiplier;
}
```

---

## Supported Blockchains

### Phase 4.1 (MVP)
- **Polygon** (Primary): Low fees ($0.01 per transaction), fast confirmation (2 seconds)
- **Base**: Coinbase L2, excellent for Coinbase Wallet users
- **Ethereum**: For high-value programs (higher fees, more prestige)

### Phase 4.2 (Future)
- **Solana**: High throughput for mass adoption
- **Arbitrum**: Additional L2 option

## Technical Architecture

### Token Program Deployment

1. **Business Owner Creates Program**:
   ```typescript
   POST /api/v1/loyalty/programs
   {
     "name": "Coffee Rewards",
     "ruleType": "POINTS_BASED",
     "blockchainEnabled": true,
     "tokenSymbol": "COFFEE",
     "chain": "POLYGON"
   }
   ```

2. **Backend Deploys ERC-20 Contract**:
   ```typescript
   const tokenProgram = TokenProgramAggregate.create(
     businessId,
     programId,
     "Coffee Points",
     "COFFEE",
     18,
     new TokenAmount("1000000000000000000000000", 18, "COFFEE"),
     BlockchainNetwork.POLYGON,
     { transferable: true, burnableByHolder: false, mintableByBusiness: true }
   );

   await smartContractService.deployTokenContract(tokenProgram);
   ```

3. **Customer Earns Tokens**:
   ```typescript
   // When customer makes purchase
   await issueTokenService.execute(
     programId,
     customerId,
     100, // 100 tokens
     "PURCHASE_REWARD"
   );

   // Mints 100 tokens to customer's wallet on Polygon
   ```

### NFT Reward Minting

1. **Customer Reaches Milestone** (100 purchases):
   ```typescript
   if (enrollment.totalPurchases === 100) {
     await mintNFTRewardService.execute(
       businessId,
       programId,
       customerId,
       {
         name: "Coffee Lover Gold Badge",
         description: "100 purchases milestone",
         imageURL: "ipfs://QmX7Y9.../gold-badge.png",
         attributes: [
           { traitType: "Tier", value: "Gold" },
           { traitType: "Purchases", value: 100 }
         ]
       },
       currentUserId
     );
   }
   ```

2. **NFT Minted on Polygon**:
   - Transaction hash: `0x8f3e2a1b...`
   - NFT appears in customer's MetaMask wallet
   - Viewable on OpenSea: https://opensea.io/assets/matic/0x123.../42

## User Experience

### Wallet Connection Flow

1. **Customer Opens Loyalty Program**:
   - "Earn crypto rewards! Connect your wallet"
   - Button: "Connect Wallet"

2. **Select Wallet Type**:
   - MetaMask
   - Coinbase Wallet
   - WalletConnect (mobile wallets)
   - "Create Custodial Wallet" (for beginners)

3. **Sign Verification Message**:
   ```
   Sign this message to verify your wallet ownership.

   Nonce: abc123def456
   Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

   This will not trigger a transaction or cost gas fees.
   ```

4. **Wallet Connected**:
   - "Wallet connected: 0x742d...f0bEb"
   - "You'll receive rewards as COFFEE tokens on Polygon"

### Earning Tokens

**Traditional Points UI**:
```
Balance: 1,250 points
```

**Blockchain Tokens UI**:
```
Balance: 1,250 COFFEE tokens
Network: Polygon
Wallet: 0x742d...f0bEb

[View on PolygonScan] [View in Wallet]
```

### Claiming NFT Rewards

**Notification**:
```
🎉 Congratulations! You've reached 100 purchases!

Claim your exclusive Gold Badge NFT:
- Limited edition (42/100)
- Tradeable on OpenSea
- Stored in your wallet forever

[Claim NFT] (Free, we cover gas)
```

**After Claiming**:
```
✅ NFT Minted Successfully!

View your NFT:
- In MetaMask: Assets → NFTs → Coffee Lover Gold Badge
- On OpenSea: https://opensea.io/assets/matic/0x123.../42

Transaction: 0x8f3e2a1b... (12 confirmations)
```

## Configuration

### Program Settings

**Enable Blockchain**:
```typescript
{
  "blockchainEnabled": true,
  "blockchainConfig": {
    "mode": "TOKEN" | "NFT" | "HYBRID",
    "chain": "POLYGON" | "BASE" | "ETHEREUM",

    // Token settings (if mode = TOKEN or HYBRID)
    "tokenSymbol": "COFFEE",
    "tokenTransferable": true,
    "tokenMaxSupply": "1000000",

    // NFT settings (if mode = NFT or HYBRID)
    "nftRewards": [
      {
        "milestone": 100,
        "nftName": "Gold Badge",
        "nftImage": "ipfs://QmX7Y9.../gold.png",
        "maxSupply": 100
      }
    ]
  }
}
```

## Gas Optimization

### Subsidized Gas (Recommended)

Business pays gas fees on customer's behalf:
- **Cost per token mint**: $0.01 (Polygon)
- **Cost per NFT mint**: $0.02 (Polygon)
- **Monthly budget**: $100 = 10,000 token mints or 5,000 NFT mints

**Implementation**: Meta-transactions (Biconomy, OpenZeppelin Defender)

### Customer-Paid Gas (Advanced)

Customers pay own gas fees:
- **Pros**: No cost to business
- **Cons**: Poor UX, customers need native tokens (MATIC, ETH)

## Security & Compliance

### Smart Contract Audits

**Required before production**:
- CertiK audit: $10,000-$50,000
- OpenZeppelin audit: $15,000-$75,000
- Alternative: Use OpenZeppelin pre-audited contracts

### Token Classification

**Potential Securities Concerns**:
- Tokens with profit expectations may be securities
- Consult legal counsel before launch
- Implement KYC/AML if required

### Tax Implications

**Inform Customers**:
- Earning tokens/NFTs may be taxable income
- Trading tokens may incur capital gains tax
- Provide disclaimer and consult with tax advisor

## Cost Analysis

**Polygon (Recommended)**:
| Operation | Gas Cost | USD Cost (MATIC @ $0.50) |
|-----------|----------|--------------------------|
| Deploy Token Contract | 2,000,000 gas | ~$50 |
| Mint Tokens | 50,000 gas | ~$0.01 |
| Deploy NFT Contract | 2,500,000 gas | ~$60 |
| Mint NFT | 100,000 gas | ~$0.02 |
| Transfer Tokens | 50,000 gas | ~$0.01 |
| Transfer NFT | 80,000 gas | ~$0.02 |

**Break-Even** (Polygon):
- Token program: $50 deployment + $0.01 per customer = 5,000 customers to reach $100 cost
- NFT rewards: $60 deployment + $0.02 per customer = 2,000 customers to reach $100 cost

## Implementation Phases

### Phase 4.1: Token-Based Programs (Months 10-11)
- Deploy ERC-20 token contracts
- Wallet connection integration
- Token minting on point earn
- Token redemption on rewards
- Transfer functionality

### Phase 4.2: NFT Milestone Rewards (Month 12)
- Deploy ERC-721 NFT contracts
- NFT minting on milestones
- IPFS metadata storage
- OpenSea integration
- NFT transfer functionality

### Phase 4.3: Advanced Features (Month 13-14)
- On-chain program verification
- Tier-based NFT memberships
- Cross-program token interoperability
- DAO governance for program changes

## Success Metrics

**Phase 4 Targets**:
- Wallet connections: 10,000+
- Tokens minted: 1,000,000+
- NFTs minted: 10,000+
- Token transfers: 50,000+
- Secondary market sales: 1,000+ NFTs

## References

- [Blockchain Domain Specification](../../domain-specs/blockchain/)
- [Loyalty Templates Blockchain Integration](../loyalty-templates/BLOCKCHAIN.md)
- [Feature Spec: Loyalty Programs](./FEATURE-SPEC.md)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
