# Blockchain Domain - Overview

**Domain**: Blockchain
**Bounded Context**: NFT Rewards, Token Programs, Smart Contracts, Wallet Integration
**Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07

## Purpose

The Blockchain domain manages all aspects of decentralized loyalty including NFT-based rewards, token-based programs, smart contract deployment, wallet connections, and on-chain transaction tracking.

## Core Responsibilities

1. **NFT Rewards**: Mint, transfer, burn NFT rewards (ERC-721)
2. **Token Programs**: Issue, transfer, burn fungible tokens (ERC-20)
3. **Smart Contract Management**: Deploy, upgrade, manage loyalty contracts
4. **Wallet Integration**: Connect customer wallets (custodial and non-custodial)
5. **Transaction Tracking**: Monitor on-chain transactions and confirmations
6. **Gas Management**: Optimize gas fees and handle meta-transactions
7. **Multi-Chain Support**: Support Ethereum, Polygon, Base, Solana

## Key Entities

- **NFTReward**: Individual NFT instance (ERC-721)
- **TokenProgram**: Fungible token configuration (ERC-20)
- **SmartContract**: Deployed contract instance
- **WalletConnection**: Customer wallet linkage
- **BlockchainTransaction**: On-chain transaction record
- **NFTMetadata**: Token metadata stored on IPFS

## Bounded Context Relationships

**Depends On**:
- **Loyalty**: Program configuration and rules
- **Rewards**: Reward definitions and eligibility
- **Customer Management**: Customer profiles and wallet ownership
- **Business Management**: Business/tenant information

**Provides To**:
- **Loyalty**: Token balance data for redemption
- **Rewards**: NFT ownership proof
- **Analytics**: On-chain metrics and trading volume
- **Notifications**: Transaction confirmation events

## Domain Events Published

- `blockchain.nft.minted`
- `blockchain.nft.transferred`
- `blockchain.nft.burned`
- `blockchain.token.earned`
- `blockchain.token.redeemed`
- `blockchain.token.transferred`
- `blockchain.smart_contract.deployed`
- `blockchain.wallet.connected`
- `blockchain.wallet.disconnected`
- `blockchain.transaction.confirmed`
- `blockchain.transaction.failed`

## Business Rules (Summary)

1. NFTs must have unique token IDs
2. Only business owner can mint NFTs
3. Token transfers require sufficient gas
4. Wallet connections require signature verification
5. Smart contracts must be audited before production
6. Gas fees can be subsidized by business (meta-transactions)
7. NFT metadata must be stored on IPFS (decentralized)
8. Token supply must not exceed maximum cap

## Technical Constraints

- Multi-tenancy: All contracts scoped to businessId
- Gas Optimization: Minimize on-chain operations
- Performance: Transaction confirmation within 30 seconds (Polygon)
- Scalability: Support 100K+ NFT mints
- Security: All contracts must pass audit
- Compliance: AML/KYC for high-value tokens

## Supported Blockchains

### Phase 4.1 (MVP)
- **Ethereum** (mainnet for high-value NFTs)
- **Polygon** (low fees, fast confirmation)
- **Base** (Coinbase L2, user-friendly)

### Phase 4.2 (Future)
- **Solana** (high throughput)
- **Arbitrum** (L2 scaling)
- **Optimism** (L2 scaling)

## Integration Points

### Web3 Providers
- **ethers.js**: Ethereum interaction
- **web3.js**: Alternative provider
- **@solana/web3.js**: Solana interaction

### Wallet Connectors
- **WalletConnect**: Universal wallet connection
- **RainbowKit**: Web3 wallet UI
- **MetaMask**: Browser extension wallet
- **Coinbase Wallet**: Coinbase wallet SDK

### Storage
- **IPFS**: Decentralized metadata storage
- **Arweave**: Permanent storage (optional)

### Marketplaces
- **OpenSea**: NFT marketplace integration
- **Rarible**: Alternative marketplace
- **Uniswap**: Token trading (DEX)

## References

- [Feature Spec: Loyalty Templates - Blockchain](../../features/loyalty-templates/BLOCKCHAIN.md)
- [ADR-0004: Domain-Driven Organization](../../adr/0004-domain-driven-organization.md)
- [AsyncAPI: Blockchain Events](../../contracts/events.asyncapi.yaml)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
