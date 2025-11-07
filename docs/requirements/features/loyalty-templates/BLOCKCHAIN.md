# Loyalty Templates - Blockchain Integration

**Feature**: Loyalty Templates
**Version**: 1.0.0
**Status**: =á Phase 4 Feature
**Last Updated**: 2025-11-06

## Overview

Blockchain integration for **NFT-based rewards** and **token-based loyalty programs**.

**Phase**: Phase 4 (Future Enhancement)
**Priority**: P3

## Blockchain Features

### 1. NFT Reward Templates

**Purpose**: Templates that include NFT rewards instead of traditional rewards

**Example Template**: "NFT Collectible Punch Card"
- Buy 10 items ’ Mint exclusive NFT
- NFT can be traded, sold, or redeemed
- Limited edition NFTs (e.g., 1/100)

**Benefits**:
- Unique, tradeable rewards
- Community building (collectors)
- Secondary market value
- Proof of loyalty on-chain

### 2. Token-Based Programs

**Purpose**: Use blockchain tokens instead of traditional points

**Example Template**: "Crypto Points Program"
- Earn $LOYALTY tokens per dollar spent
- Tokens can be:
  - Redeemed for rewards
  - Transferred to other customers
  - Traded on DEX (decentralized exchange)
  - Staked for benefits

**Benefits**:
- Interoperability across businesses
- Real monetary value
- Transparency (on-chain)
- Community governance (DAO)

### 3. On-Chain Verification

**Purpose**: Store loyalty program rules on blockchain for transparency

**Smart Contract**: Immutable program configuration
```solidity
contract LoyaltyProgram {
  string public programName;
  uint256 public requiredPunches;
  address public businessOwner;
  mapping(address => uint256) public customerProgress;
}
```

## Supported Blockchains

### Phase 4.1: EVM Chains
- **Ethereum** (mainnet for high-value NFTs)
- **Polygon** (low fees, fast confirmation)
- **Base** (Coinbase L2, user-friendly)

### Phase 4.2: Additional Chains
- **Solana** (high throughput for mass adoption)
- **Arbitrum** (L2 scaling solution)

## Technical Architecture

### Smart Contract Templates

**File**: `packages/blockchain-contracts/src/LoyaltyProgramNFT.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract LoyaltyProgramNFT is ERC721 {
  uint256 public nextTokenId;
  address public businessOwner;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {
    businessOwner = msg.sender;
  }

  function mintReward(address customer) external {
    require(msg.sender == businessOwner, "Only business can mint");
    _safeMint(customer, nextTokenId);
    nextTokenId++;
  }
}
```

### Wallet Integration

**Libraries**:
- **WalletConnect**: Mobile wallet connection
- **RainbowKit**: Web3 wallet UI
- **ethers.js**: Blockchain interaction

**User Flow**:
1. Customer connects wallet (MetaMask, Coinbase Wallet)
2. Completes loyalty program (10 purchases)
3. Business triggers NFT mint
4. NFT appears in customer wallet
5. Customer can view/trade on OpenSea

## Template Types with Blockchain

### 1. NFT Punch Card Template

**Config**:
```json
{
  "ruleType": "PUNCH_CARD",
  "requiredPunches": 10,
  "reward": {
    "type": "NFT",
    "contractAddress": "0x123...",
    "tokenURI": "ipfs://Qm...",
    "metadata": {
      "name": "Coffee Lover NFT",
      "description": "Exclusive NFT for loyal customers",
      "image": "ipfs://Qm.../image.png",
      "attributes": [
        { "trait_type": "Rarity", "value": "Gold" }
      ]
    }
  }
}
```

### 2. Token-Based Points Template

**Config**:
```json
{
  "ruleType": "POINTS_BASED",
  "pointsPerDollar": 10,
  "tokenConfig": {
    "tokenAddress": "0x456...",
    "tokenSymbol": "LOYALTY",
    "decimals": 18,
    "transferable": true
  }
}
```

## Gas Optimization

**Problem**: High gas fees on Ethereum

**Solutions**:
1. **Batch Minting**: Mint multiple NFTs in one transaction
2. **Layer 2**: Use Polygon or Arbitrum (< $0.01 per tx)
3. **Lazy Minting**: Mint only when customer claims
4. **Gasless Transactions**: Business pays gas via meta-transactions

## Security Considerations

- **Smart Contract Audits**: Require audits before production
- **Upgradeable Contracts**: Use proxy pattern for bug fixes
- **Rate Limiting**: Prevent spam minting
- **Access Control**: Only authorized addresses can mint
- **Reentrancy Protection**: Use OpenZeppelin ReentrancyGuard

## Compliance

- **Securities Laws**: Tokens may be classified as securities
- **AML/KYC**: May be required for token transfers
- **Tax Implications**: NFTs/tokens have tax obligations
- **Terms of Service**: Clear legal terms for blockchain rewards

## Implementation Phases

### Phase 4.1: NFT Rewards (Month 10-11)
- Deploy NFT smart contracts
- Wallet connection integration
- NFT minting on reward redemption
- OpenSea integration for trading

### Phase 4.2: Token-Based Programs (Month 12)
- Deploy ERC-20 token contracts
- DEX integration (Uniswap)
- Token transfer functionality
- Staking rewards

### Phase 4.3: DAO Governance (Month 13-14)
- Community voting on program changes
- Token holder benefits
- Proposal creation and voting

## User Education

**Challenge**: Many users unfamiliar with Web3

**Solutions**:
- **Onboarding Guide**: "What is an NFT?"
- **Embedded Wallets**: Coinbase Smart Wallet (no seed phrases)
- **Video Tutorials**: How to connect wallet, claim NFT
- **Support Team**: Dedicated Web3 support

## Analytics

**Metrics to Track**:
- NFT mint rate (% of eligible customers who claim)
- NFT trading volume (secondary market activity)
- Token circulation supply
- Gas costs per transaction
- Wallet connection success rate

## Cost Analysis

**Per-NFT Costs** (Polygon):
- Smart contract deployment: $50 (one-time)
- NFT minting: $0.01 per NFT
- Metadata storage (IPFS): $0.001 per NFT

**Break-Even**: 100 NFTs to recover deployment cost

## References

- [FEATURE-SPEC.md](./FEATURE-SPEC.md)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)

---

**Document Owner**: Blockchain Team
**Last Updated**: 2025-11-06
