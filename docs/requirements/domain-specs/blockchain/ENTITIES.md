# Blockchain Domain - Entities

**Domain**: Blockchain
**Last Updated**: 2025-11-07
 (NxLoy Platform)

## Overview

This document defines all entities within the Blockchain domain, their attributes, relationships, and lifecycle management.

## Core Entities

### 1. NFTReward

**Purpose**: Represents an individual NFT (Non-Fungible Token) minted as a loyalty reward

**Attributes**:
```typescript
interface NFTReward {
  id: UUID
  businessId: UUID
  programId: UUID
  customerId: UUID
  tokenId: number // On-chain token ID
  contractAddress: string // 0x...
  chain: BlockchainNetwork
  status: NFTStatus
  metadata: NFTMetadata
  mintedAt: Date
  mintedBy: UUID
  transactionHash: string
  transferHistory: NFTTransfer[]
  createdAt: Date
  updatedAt: Date
}

enum NFTStatus {
  PENDING = 'PENDING', // Mint transaction submitted
  MINTED = 'MINTED', // Successfully minted
  TRANSFERRED = 'TRANSFERRED', // Transferred to another wallet
  BURNED = 'BURNED', // Permanently destroyed
  FAILED = 'FAILED' // Mint transaction failed
}

enum BlockchainNetwork {
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  BASE = 'BASE',
  SOLANA = 'SOLANA',
  ARBITRUM = 'ARBITRUM'
}
```

**Business Rules**:
- Token ID must be unique per contract
- Cannot transfer burned NFTs
- Only owner can transfer NFT
- Metadata must be stored on IPFS
- Business owner can burn NFTs

**Lifecycle**:
1. Created in PENDING status
2. Minted on-chain (publishes `blockchain.nft.minted`)
3. Optionally transferred (publishes `blockchain.nft.transferred`)
4. Eventually burned or remains in circulation

---

### 2. NFTMetadata

**Purpose**: Off-chain metadata for NFTs stored on IPFS

**Attributes**:
```typescript
interface NFTMetadata {
  id: UUID
  nftId: UUID
  name: string
  description: string
  image: string // IPFS URL: ipfs://Qm...
  externalUrl?: string
  animationUrl?: string // Video/audio
  attributes: NFTAttribute[]
  ipfsHash: string
  createdAt: Date
}

interface NFTAttribute {
  traitType: string // "Rarity", "Tier", "Issue Number"
  value: string | number
  displayType?: string // "number", "date", "percentage"
}
```

**Business Rules**:
- Image must be hosted on IPFS
- Name limited to 100 characters
- Attributes are immutable after minting
- Must follow OpenSea metadata standard

**Example**:
```json
{
  "name": "Coffee Lover Gold #42",
  "description": "Exclusive NFT for loyal coffee customers",
  "image": "ipfs://QmX123.../gold-badge.png",
  "attributes": [
    { "trait_type": "Rarity", "value": "Gold" },
    { "trait_type": "Punches Completed", "value": 10 },
    { "trait_type": "Issue Number", "value": 42 }
  ]
}
```

---

### 3. TokenProgram

**Purpose**: Configuration for fungible token-based loyalty (ERC-20)

**Attributes**:
```typescript
interface TokenProgram {
  id: UUID
  businessId: UUID
  programId: UUID
  name: string // "COFFEE Token"
  symbol: string // "COFFEE"
  decimals: number // 18 (standard)
  totalSupply: number
  maxSupply: number
  contractAddress: string
  chain: BlockchainNetwork
  transferable: boolean
  burnableByHolder: boolean
  mintableByBusiness: boolean
  status: TokenProgramStatus
  createdAt: Date
  updatedAt: Date
}

enum TokenProgramStatus {
  DRAFT = 'DRAFT',
  DEPLOYING = 'DEPLOYING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED'
}
```

**Business Rules**:
- Symbol must be 2-5 characters (uppercase)
- Total supply cannot exceed max supply
- Cannot mint more tokens than max supply
- Decimals typically 18 (ETH standard)
- Must be unique per business

**Lifecycle**:
1. Created in DRAFT status
2. Deploy contract (DEPLOYING → ACTIVE)
3. Issue tokens on customer activity
4. Eventually paused or ended

---

### 4. SmartContract

**Purpose**: Deployed smart contract instance

**Attributes**:
```typescript
interface SmartContract {
  id: UUID
  businessId: UUID
  type: ContractType
  address: string // 0x...
  chain: BlockchainNetwork
  deployedBy: UUID
  deployedAt: Date
  transactionHash: string
  abi: string // JSON ABI
  bytecode: string
  isUpgradeable: boolean
  proxyAddress?: string // For upgradeable contracts
  implementationAddress?: string
  status: ContractStatus
  gasUsed: number
  auditStatus: AuditStatus
  auditReport?: string
  createdAt: Date
  updatedAt: Date
}

enum ContractType {
  NFT_REWARD = 'NFT_REWARD', // ERC-721
  TOKEN_LOYALTY = 'TOKEN_LOYALTY', // ERC-20
  MARKETPLACE = 'MARKETPLACE',
  STAKING = 'STAKING',
  GOVERNANCE = 'GOVERNANCE'
}

enum ContractStatus {
  DEPLOYING = 'DEPLOYING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DEPRECATED = 'DEPRECATED'
}

enum AuditStatus {
  NOT_AUDITED = 'NOT_AUDITED',
  IN_PROGRESS = 'IN_PROGRESS',
  PASSED = 'PASSED',
  FAILED = 'FAILED'
}
```

**Business Rules**:
- Production contracts must be audited
- Cannot deploy duplicate contracts
- Upgradeable contracts require proxy pattern
- Deprecated contracts cannot mint new tokens
- ABI must match deployed bytecode

**Domain Events Published**:
- `blockchain.smart_contract.deployed`
- `blockchain.smart_contract.upgraded`
- `blockchain.smart_contract.paused`

---

### 5. WalletConnection

**Purpose**: Links customer account to blockchain wallet

**Attributes**:
```typescript
interface WalletConnection {
  id: UUID
  customerId: UUID
  walletAddress: string // 0x... or Solana address
  chain: BlockchainNetwork
  walletType: WalletType
  isVerified: boolean
  verifiedAt?: Date
  verificationSignature?: string
  isPrimary: boolean
  lastUsedAt: Date
  nonce: string // For signature verification
  createdAt: Date
  updatedAt: Date
}

enum WalletType {
  CUSTODIAL = 'CUSTODIAL', // Platform-managed
  METAMASK = 'METAMASK',
  COINBASE_WALLET = 'COINBASE_WALLET',
  WALLETCONNECT = 'WALLETCONNECT',
  PHANTOM = 'PHANTOM', // Solana
  OTHER = 'OTHER'
}
```

**Business Rules**:
- Wallet address must be unique per chain
- Verification requires signature
- One primary wallet per customer per chain
- Nonce prevents replay attacks
- Address must be valid checksum address

**Lifecycle**:
1. Customer connects wallet
2. Platform generates nonce
3. Customer signs message with nonce
4. Platform verifies signature
5. Connection stored as verified

**Domain Events Published**:
- `blockchain.wallet.connected`
- `blockchain.wallet.verified`
- `blockchain.wallet.disconnected`

---

### 6. BlockchainTransaction

**Purpose**: Records on-chain transaction details

**Attributes**:
```typescript
interface BlockchainTransaction {
  id: UUID
  businessId: UUID
  entityType: string // 'NFT', 'TOKEN', 'CONTRACT'
  entityId: UUID
  transactionHash: string
  chain: BlockchainNetwork
  fromAddress: string
  toAddress: string
  type: TransactionType
  status: TransactionStatus
  blockNumber?: number
  confirmations: number
  gasUsed?: number
  gasFeeWei?: string // bigint as string
  gasFeeUSD?: number
  submittedAt: Date
  confirmedAt?: Date
  failedAt?: Date
  errorMessage?: string
  retryCount: number
  maxRetries: number
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

enum TransactionType {
  MINT_NFT = 'MINT_NFT',
  TRANSFER_NFT = 'TRANSFER_NFT',
  BURN_NFT = 'BURN_NFT',
  MINT_TOKEN = 'MINT_TOKEN',
  TRANSFER_TOKEN = 'TRANSFER_TOKEN',
  DEPLOY_CONTRACT = 'DEPLOY_CONTRACT',
  APPROVE = 'APPROVE'
}

enum TransactionStatus {
  PENDING = 'PENDING', // Submitted to mempool
  CONFIRMING = 'CONFIRMING', // In block but < 12 confirmations
  CONFIRMED = 'CONFIRMED', // >= 12 confirmations
  FAILED = 'FAILED', // Transaction reverted
  DROPPED = 'DROPPED' // Dropped from mempool
}
```

**Business Rules**:
- Transaction hash must be unique per chain
- Retry failed transactions up to max retries
- Confirmed after 12 blocks (Ethereum), 30 blocks (Polygon)
- Store gas fees for cost tracking
- Immutable after confirmation

**Domain Events Published**:
- `blockchain.transaction.confirmed`
- `blockchain.transaction.failed`

---

### 7. NFTTransfer

**Purpose**: Records NFT ownership transfers

**Attributes**:
```typescript
interface NFTTransfer {
  id: UUID
  nftId: UUID
  fromAddress: string
  toAddress: string
  transactionHash: string
  transferType: TransferType
  transferredAt: Date
  blockNumber: number
  gasFeeWei: string
  initiatedBy?: UUID // Customer who initiated
  createdAt: Date
}

enum TransferType {
  MINT = 'MINT', // From 0x0 to customer
  TRANSFER = 'TRANSFER', // Customer to customer
  BURN = 'BURN', // To 0x0
  SALE = 'SALE' // Via marketplace
}
```

**Business Rules**:
- All transfers must be on-chain
- MINT: fromAddress = 0x0
- BURN: toAddress = 0x0
- Transfer history is immutable
- Track all ownership changes

---

## Entity Relationships

```
SmartContract (1) ←→ (N) NFTReward
SmartContract (1) ←→ (1) TokenProgram
NFTReward (1) ←→ (1) NFTMetadata
NFTReward (1) ←→ (N) NFTTransfer
Customer (external) (1) ←→ (N) WalletConnection
Customer (external) (1) ←→ (N) NFTReward
LoyaltyProgram (external) (1) ←→ (N) NFTReward
LoyaltyProgram (external) (1) ←→ (1) TokenProgram
BlockchainTransaction (N) ←→ (1) NFTReward [or TokenProgram or SmartContract]
```

## Database Schema References

See `/packages/database/prisma/schema.prisma` for full schema definitions.

Key tables:
- `nft_rewards`
- `nft_metadata`
- `nft_transfers`
- `token_programs`
- `smart_contracts`
- `wallet_connections`
- `blockchain_transactions`

## Indexes

Required indexes for performance:
```sql
CREATE INDEX idx_nft_rewards_business ON nft_rewards(business_id);
CREATE INDEX idx_nft_rewards_customer ON nft_rewards(customer_id);
CREATE INDEX idx_nft_rewards_contract ON nft_rewards(contract_address, chain);
CREATE INDEX idx_nft_rewards_token_id ON nft_rewards(contract_address, token_id);

CREATE INDEX idx_wallet_connections_customer ON wallet_connections(customer_id);
CREATE INDEX idx_wallet_connections_address ON wallet_connections(wallet_address, chain);

CREATE INDEX idx_blockchain_tx_hash ON blockchain_transactions(transaction_hash, chain);
CREATE INDEX idx_blockchain_tx_entity ON blockchain_transactions(entity_type, entity_id);
CREATE INDEX idx_blockchain_tx_status ON blockchain_transactions(status, submitted_at DESC);

CREATE INDEX idx_smart_contracts_business ON smart_contracts(business_id);
CREATE INDEX idx_smart_contracts_address ON smart_contracts(address, chain);

CREATE INDEX idx_token_programs_business ON token_programs(business_id);
CREATE INDEX idx_token_programs_contract ON token_programs(contract_address, chain);
```

## References

- [DOMAIN-OVERVIEW.md](./DOMAIN-OVERVIEW.md)
- [AGGREGATES.md](./AGGREGATES.md)
- [VALUE-OBJECTS.md](./VALUE-OBJECTS.md)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
