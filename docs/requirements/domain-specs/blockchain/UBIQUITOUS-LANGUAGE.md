# Blockchain Domain - Ubiquitous Language

**Domain**: Blockchain
**Last Updated**: 2025-11-07
 (NxLoy Platform)

## Overview

The ubiquitous language defines terms used consistently across the Blockchain domain by developers, business stakeholders, and documentation.

## Core Concepts

### NFT (Non-Fungible Token)
A unique digital asset stored on blockchain. Each NFT has a distinct token ID and cannot be replicated. Used as loyalty rewards that customers can own, trade, or sell.

**Example**: "Customer earned an NFT badge after 10 purchases."

---

### Token
A fungible digital asset on blockchain (ERC-20). Tokens are interchangeable and used as loyalty points that can be transferred or traded.

**Example**: "Customer earned 100 COFFEE tokens for their purchase."

---

### Smart Contract
Self-executing code deployed on blockchain. Manages loyalty program rules, NFT minting, and token distribution without intermediaries.

**Example**: "The loyalty smart contract automatically mints an NFT when a customer completes their punch card."

---

### Wallet
Digital account for storing cryptocurrencies, NFTs, and tokens. Identified by a unique address (e.g., 0x742d35...).

**Example**: "Customer connected their MetaMask wallet to receive NFT rewards."

---

### Wallet Address
Unique identifier for a blockchain wallet. Format varies by chain:
- **Ethereum/Polygon/Base**: 0x + 40 hex characters (e.g., 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb)
- **Solana**: Base58 encoded (e.g., DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK)

**Example**: "Customer's wallet address 0x742d... received the NFT."

---

### Minting
The process of creating a new NFT or token on blockchain. Once minted, the asset is permanently recorded on-chain.

**Example**: "Business minted 1,000 NFT badges for top customers."

---

### Gas Fee
Transaction cost paid to blockchain network to execute operations (in native token like ETH, MATIC). Varies based on network congestion.

**Example**: "NFT mint cost $0.01 in gas fees on Polygon."

---

### Transaction Hash (TX Hash)
Unique identifier for blockchain transaction. Used to track status and view details on block explorer.

**Example**: "Check transaction 0x8f3e... on Etherscan for mint confirmation."

---

### Block Number
Sequential number of block containing transaction. Used to measure confirmations.

**Example**: "NFT was minted in block 18,234,567."

---

### Confirmations
Number of blocks mined after transaction block. More confirmations = more final.
- **Ethereum**: 12 confirmations (≈3 minutes)
- **Polygon**: 30 confirmations (≈1 minute)

**Example**: "Transaction has 15 confirmations and is considered final."

---

### IPFS (InterPlanetary File System)
Decentralized storage for NFT metadata (images, attributes). Content addressed by hash (e.g., ipfs://Qm...).

**Example**: "NFT image stored on IPFS at QmX7Y9..."

---

### Metadata
Descriptive information about an NFT:
- **Name**: "Coffee Lover Gold Badge"
- **Description**: "Exclusive NFT for loyal customers"
- **Image**: IPFS URL to visual
- **Attributes**: Traits like rarity, tier, issue number

**Example**: "NFT metadata includes rarity: Gold, punches: 10."

---

### Token ID
Unique number identifying specific NFT within a contract. Starts from 0 or 1.

**Example**: "Customer owns NFT #42 from the Coffee Rewards collection."

---

### Contract Address
Blockchain address where smart contract is deployed.

**Example**: "NFT contract deployed at 0x123abc..."

---

### Chain / Blockchain Network
The specific blockchain where assets are stored:
- **Ethereum**: Mainnet (high security, high fees)
- **Polygon**: L2 (low fees, fast)
- **Base**: Coinbase L2 (user-friendly)
- **Solana**: High throughput

**Example**: "Deploy NFT contract on Polygon to minimize gas costs."

---

### ERC-721
Ethereum standard for NFTs. Defines interface for unique tokens.

**Example**: "Our NFT rewards follow the ERC-721 standard."

---

### ERC-20
Ethereum standard for fungible tokens. Defines interface for transferable tokens.

**Example**: "COFFEE token implements ERC-20 standard."

---

### Custodial Wallet
Wallet managed by the platform (NxLoy). Customer doesn't hold private keys. Simpler but less decentralized.

**Example**: "Customer has a custodial wallet managed by NxLoy."

---

### Non-Custodial Wallet
Wallet controlled by customer (MetaMask, Coinbase Wallet). Customer holds private keys. More decentralized but requires user education.

**Example**: "Customer connected their MetaMask non-custodial wallet."

---

### Wallet Connection
Linking a customer's blockchain wallet to their NxLoy account. Verified via signature.

**Example**: "Customer connected wallet 0x742d... to their account."

---

### Signature Verification
Cryptographic proof that customer controls wallet address. Customer signs message with private key; platform verifies with public key.

**Example**: "Customer signed nonce abc123 to verify wallet ownership."

---

### Nonce
Random one-time value used in signature verification to prevent replay attacks. Expires after 5 minutes.

**Example**: "Generated nonce def456 for wallet verification."

---

### Transfer
Moving NFT or tokens from one wallet to another. Recorded on blockchain.

**Example**: "Customer transferred NFT to friend's wallet."

---

### Burn
Permanently destroying NFT or tokens by sending to zero address (0x0...0). Reduces total supply.

**Example**: "Customer burned NFT to redeem physical reward."

---

### Token Supply
- **Total Supply**: All tokens currently in existence
- **Max Supply**: Maximum tokens that can ever exist
- **Circulating Supply**: Tokens available for trading

**Example**: "10,000 COFFEE tokens in circulation, max supply 100,000."

---

### Marketplace
Platform for buying/selling NFTs (OpenSea, Rarible). Enables secondary market.

**Example**: "Customer listed NFT on OpenSea for $50."

---

### DEX (Decentralized Exchange)
Platform for trading tokens without intermediaries (Uniswap, PancakeSwap).

**Example**: "COFFEE tokens tradeable on Uniswap."

---

### Audit
Security review of smart contract code by third-party experts. Required before production deployment.

**Example**: "Contract passed CertiK audit before launch."

---

### Upgradeable Contract
Smart contract that can be modified after deployment using proxy pattern. Allows bug fixes.

**Example**: "Used OpenZeppelin proxy for upgradeable NFT contract."

---

### Gas Optimization
Techniques to reduce transaction costs (batch operations, efficient code).

**Example**: "Batch minting 100 NFTs saves 40% gas compared to individual mints."

---

### Meta-Transaction
Transaction where business pays gas fees on customer's behalf. Improves UX.

**Example**: "Customer received NFT without paying gas (gasless transaction)."

---

### Layer 2 (L2)
Scaling solution built on top of Ethereum mainnet (Polygon, Arbitrum, Base). Lower fees, faster transactions.

**Example**: "Deploy on Polygon L2 for 100x cheaper gas than Ethereum mainnet."

---

### Zero Address
Special address 0x0000000000000000000000000000000000000000 used to represent minting (from zero) and burning (to zero).

**Example**: "NFT minted from zero address to customer's wallet."

---

### Block Explorer
Website for viewing blockchain data (Etherscan, Polygonscan). Shows transactions, contracts, wallets.

**Example**: "View transaction details on Polygonscan."

---

## Business Terms

### NFT Reward
Loyalty reward delivered as NFT instead of traditional discount/points.

**Example**: "Earn exclusive NFT after 10 visits."

---

### Token-Based Program
Loyalty program using blockchain tokens instead of traditional points.

**Example**: "Earn COFFEE tokens per dollar spent."

---

### On-Chain Loyalty
Loyalty program rules and transactions recorded on blockchain for transparency.

**Example**: "Our loyalty program is fully on-chain for verifiable fairness."

---

### Mint Request
Customer's eligibility to receive an NFT. Status: PENDING → MINTED or FAILED.

**Example**: "Customer has pending mint request for completing punch card."

---

### Wallet Verification
Process of proving customer controls a wallet address via signature.

**Example**: "Customer must verify wallet ownership before receiving NFTs."

---

### Primary Wallet
Main wallet associated with customer account. Receives rewards by default.

**Example**: "Set MetaMask wallet as primary for NFT rewards."

---

### Gas Subsidy
Business paying gas fees on customer's behalf.

**Example**: "All NFT mints include gas subsidy (gasless for customers)."

---

## Technical Terms

### ABI (Application Binary Interface)
JSON format describing smart contract functions. Required to interact with contract.

**Example**: "Use contract ABI to call mintNFT function."

---

### Bytecode
Compiled smart contract code deployed to blockchain.

**Example**: "Deploy contract bytecode to Polygon mainnet."

---

### Solidity
Programming language for Ethereum smart contracts.

**Example**: "NFT contract written in Solidity 0.8.20."

---

### ethers.js / web3.js
JavaScript libraries for interacting with Ethereum blockchain.

**Example**: "Use ethers.js to mint NFT via web app."

---

### Provider
Connection to blockchain network (Infura, Alchemy, RPC endpoint).

**Example**: "Configure Polygon provider for contract interaction."

---

### Checksum Address
Ethereum address with mixed case for error detection (EIP-55).

**Example**: "0x742d35Cc... (checksum) vs 0x742d35cc... (non-checksum)."

---

### Wei
Smallest unit of Ether (1 ETH = 10^18 Wei). Used for gas calculations.

**Example**: "Gas fee: 21000000000000000 Wei (0.021 ETH)."

---

### Gwei
Gas price unit (1 Gwei = 10^9 Wei). Easier to read than Wei.

**Example**: "Current gas price: 30 Gwei."

---

## Status Terminology

### NFT Status
- **PENDING**: Mint transaction submitted
- **MINTED**: Successfully minted on-chain
- **TRANSFERRED**: Ownership transferred
- **BURNED**: Permanently destroyed
- **FAILED**: Mint transaction failed

---

### Transaction Status
- **PENDING**: Submitted to mempool
- **CONFIRMING**: In block but < required confirmations
- **CONFIRMED**: >= required confirmations (final)
- **FAILED**: Transaction reverted
- **DROPPED**: Dropped from mempool

---

### Contract Status
- **DEPLOYING**: Deployment transaction pending
- **ACTIVE**: Deployed and operational
- **PAUSED**: Temporarily disabled
- **DEPRECATED**: Replaced by newer version

---

### Token Program Status
- **DRAFT**: Being configured
- **DEPLOYING**: Contract deployment in progress
- **ACTIVE**: Live and issuing tokens
- **PAUSED**: Temporarily stopped
- **ENDED**: Permanently closed

---

## Anti-Patterns (Avoid These Terms)

❌ **"Crypto"** → Use "tokens" or "digital assets"
❌ **"Coin"** → Use "token" (coins are native like ETH; tokens are smart contracts)
❌ **"Blockchain address"** → Use "wallet address"
❌ **"Send crypto"** → Use "transfer NFT/tokens"
❌ **"Mine"** → Use "mint" (mining is for block production, not NFT creation)

---

## References

- [Ethereum Glossary](https://ethereum.org/en/glossary/)
- [OpenZeppelin Documentation](https://docs.openzeppelin.com/)
- [EIP-721: NFT Standard](https://eips.ethereum.org/EIPS/eip-721)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
