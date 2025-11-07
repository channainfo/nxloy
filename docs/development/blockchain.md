# Blockchain & Smart Contracts Development Guide

**Last Updated**: 2025-11-08

[← Back to README](../../README.md) | [Development Guides](../development/)

---

## Overview

NxLoy will use blockchain technology for **NFT-based rewards**, **tokenized loyalty points**, and **decentralized partner networks** across multiple blockchains.

**Current Status**: 📋 Stub package only - no smart contracts, no Hardhat config, implementation pending

**Planned Features**:
- Smart Contracts: Solidity/Move contracts for NFT rewards, token management, staking
- Multi-Chain Support: Base L2 (primary), Ethereum, Solana, Sui
- Web3 Integration: Frontend wallet connections, transaction signing
- IPFS: Decentralized storage for NFT metadata and images

---

## Target Blockchains

| Chain | Type | Language | Primary Use | Status |
|-------|------|----------|-------------|--------|
| **Base** | Ethereum L2 | Solidity | Primary NFT rewards, low gas fees | 📋 Planned |
| **Ethereum** | L1 | Solidity | High-value NFTs, token contracts | 📋 Planned |
| **Solana** | L1 | Rust (Anchor) | Fast transactions, gaming rewards | 📋 Planned |
| **Sui** | L1 | Move | Next-gen smart contracts, innovation | 📋 Future |

---

## Prerequisites (When Implemented)

### For EVM Chains (Base, Ethereum)

**Hardhat**: Ethereum development environment ([Docs](https://hardhat.org/))

**Solidity**: 0.8.20+ (bundled with Hardhat)

**MetaMask**: Browser wallet ([Download](https://metamask.io/))

**Alchemy**: RPC provider ([Alchemy](https://www.alchemy.com/))

```bash
# Installation (when implemented)
cd packages/blockchain-contracts
pnpm install
```

### For Solana

**Anchor Framework**: Solana development framework ([Docs](https://www.anchor-lang.com/))

**Rust**: 1.70+ ([Install](https://www.rust-lang.org/tools/install))

**Solana CLI**: Command-line tools ([Install](https://docs.solana.com/cli/install-solana-cli-tools))

**Phantom**: Solana wallet ([Download](https://phantom.app/))

```bash
# Install Solana
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### For Sui

**Sui CLI**: Sui development tools ([Docs](https://docs.sui.io/))

**Move**: Sui smart contract language

**Sui Wallet**: Browser extension ([Download](https://sui.io/wallet))

### Shared Tools

**Node.js**: 22.12.0+ (same as main project)

**IPFS Desktop**: Local IPFS node ([Download](https://docs.ipfs.tech/install/ipfs-desktop/))

**Pinata**: IPFS pinning service ([Sign up](https://www.pinata.cloud/))

---

## Setup (📋 Planned - Not Yet Implemented)

The following instructions describe the planned setup. Implementation is pending.

### For EVM Chains (Base, Ethereum)

**1. Navigate to blockchain package**:
```bash
cd packages/blockchain-contracts
```

**2. Configure environment** (file will be created):
```bash
# Create .env with:
ALCHEMY_API_KEY=...
DEPLOYER_PRIVATE_KEY=...
BASESCAN_API_KEY=...
ETHERSCAN_API_KEY=...
```

**3. Install dependencies**:
```bash
pnpm install
```

### For Solana

**1. Install Solana CLI and Anchor** (see prerequisites above)

**2. Initialize Anchor project** (when implemented):
```bash
cd packages/solana-programs
anchor init loyalty-program
```

---

## Local Development (📋 Planned)

### EVM Chains (Hardhat)

```bash
cd packages/blockchain-contracts
npx hardhat node  # 📋 hardhat.config.ts needs to be created

# Local blockchain running at: http://127.0.0.1:8545
# 20 test accounts with 10,000 ETH each
```

### Solana (Local Validator)

```bash
solana-test-validator  # 📋 When Solana support is added

# Local Solana cluster running at: http://127.0.0.1:8899
```

---

## Smart Contract Workflow

### 1. Write Contracts

Create contracts in `packages/blockchain-contracts/contracts/`:

```solidity
// Example: LoyaltyNFT.sol
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract LoyaltyNFT is ERC721 {
    // Your NFT reward logic
}
```

### 2. Compile Contracts

```bash
cd packages/blockchain-contracts
npx hardhat compile
```

### 3. Test Contracts

```bash
# Run all tests
npx hardhat test

# Run specific test
npx hardhat test test/LoyaltyNFT.test.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

### 4. Deploy to Testnet (📋 Planned - Base Sepolia)

```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### 5. Verify on Block Explorer (📋 Planned)

```bash
npx hardhat verify --network baseSepolia <contract-address> <constructor-args>
```

---

## Multi-Chain Configuration (📋 Planned)

### Target Networks

**EVM Chains (Base, Ethereum)**:

| Network | Chain ID | RPC Provider | Explorer | Status |
|---------|----------|--------------|----------|--------|
| **Base Mainnet** | 8453 | Alchemy | basescan.org | 📋 Primary L2 |
| **Base Sepolia** (testnet) | 84532 | Alchemy | sepolia.basescan.org | 📋 Testing |
| **Ethereum Mainnet** | 1 | Alchemy | etherscan.io | 📋 High-value NFTs |
| **Ethereum Sepolia** (testnet) | 11155111 | Alchemy | sepolia.etherscan.io | 📋 Testing |
| **Hardhat Local** | 31337 | localhost:8545 | N/A | 📋 Development |

**Non-EVM Chains**:

| Network | Type | RPC | Explorer | Status |
|---------|------|-----|----------|--------|
| **Solana Mainnet** | L1 | mainnet-beta.solana.com | solscan.io | 📋 Planned |
| **Solana Devnet** | Testnet | devnet.solana.com | solscan.io | 📋 Testing |
| **Sui Mainnet** | L1 | fullnode.mainnet.sui.io | suiscan.xyz | 📋 Future |
| **Sui Testnet** | Testnet | fullnode.testnet.sui.io | suiscan.xyz | 📋 Future |

### Planned Hardhat Configuration (hardhat.config.ts to be created)

```typescript
networks: {
  baseSepolia: {
    url: process.env.BASE_SEPOLIA_RPC,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    chainId: 84532
  },
  base: {
    url: process.env.BASE_MAINNET_RPC,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    chainId: 8453
  },
  ethereumSepolia: {
    url: process.env.ETH_SEPOLIA_RPC,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    chainId: 11155111
  }
}
```

### Planned Anchor Configuration (Anchor.toml for Solana)

```toml
[provider]
cluster = "devnet"  # or "mainnet-beta"
wallet = "~/.config/solana/id.json"
```

---

## Web3 Frontend Integration

### Connect Wallet in Frontend

```typescript
// Example: apps/web or apps/mobile
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(address, abi, signer);
```

### Sign Transactions

```typescript
const tx = await contract.mintRewardNFT(customerId, tokenURI);
await tx.wait(); // Wait for confirmation
```

---

## IPFS for NFT Metadata

### Upload Metadata to IPFS

```bash
# Using Pinata or IPFS Desktop
ipfs add nft-metadata.json

# Returns: QmX... (IPFS hash)
# Access via: ipfs://QmX... or https://ipfs.io/ipfs/QmX...
```

### NFT Metadata Structure

```json
{
  "name": "Gold Tier Loyalty NFT",
  "description": "Exclusive rewards for gold tier members",
  "image": "ipfs://QmImageHash...",
  "attributes": [
    {"trait_type": "Tier", "value": "Gold"},
    {"trait_type": "Points", "value": 10000}
  ]
}
```

---

## Gas Optimization Tips (📋 Planned)

- **Use Base L2** for low-cost transactions (~$0.01 per tx vs. $1-50 on Ethereum)
- **Batch operations** to reduce transaction count across all chains
- **ERC-1155** for multi-token management (cheaper than ERC-721 on EVM chains)
- **Optimize storage layout** to minimize SSTORE operations
- **Solana advantages**: Sub-cent transactions, parallel processing
- **Choose chain by use case**:
  - High-frequency rewards → Solana (fastest, cheapest)
  - NFT collectibles → Base (Ethereum ecosystem, low fees)
  - Premium NFTs → Ethereum (highest security, brand recognition)
  - Innovation/experimental → Sui (modern architecture)

---

## Common Blockchain Issues

### Hardhat node fails to start

**Cause**: Port 8545 already in use

**Solution**:
```bash
lsof -ti:8545 | xargs kill
cd packages/blockchain-contracts
npx hardhat node
```

### "Transaction reverted" during contract testing

**Cause**: Smart contract logic error or insufficient gas

**Solution**:
```bash
# Run tests with stack traces
cd packages/blockchain-contracts
npx hardhat test --verbose

# Check gas limits in hardhat.config.ts
```

### MetaMask shows "ChainId mismatch"

**Cause**: MetaMask connected to wrong network

**Solution**:
- Open MetaMask settings
- Select "Hardhat" network (localhost:8545, Chain ID: 31337)
- Or add Polygon Mumbai (Chain ID: 80001)

### Contract deployment fails with "Insufficient funds"

**Cause**: Deployer account has no ETH

**Solution**:
```bash
# For testnet, use faucet:
# Base Sepolia: https://www.alchemy.com/faucets/base-sepolia
# Ethereum Sepolia: https://sepoliafaucet.com/

# For local node, use pre-funded accounts from Hardhat output
```

### IPFS upload fails

**Cause**: IPFS daemon not running or API credentials missing

**Solution**:
```bash
# Start IPFS Desktop app, or:
ipfs daemon

# Or use Pinata API keys in .env:
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
```

### "Nonce too high" error

**Cause**: Transaction nonce out of sync with network

**Solution**:
- Reset MetaMask account: Settings > Advanced > Reset Account
- Or manually set nonce in transaction

---

## Testing Smart Contracts

### Unit Tests

Write comprehensive tests for all contract functions:

```typescript
// test/LoyaltyNFT.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("LoyaltyNFT", function () {
  it("Should mint NFT to customer", async function () {
    const [owner, customer] = await ethers.getSigners();
    const LoyaltyNFT = await ethers.getContractFactory("LoyaltyNFT");
    const nft = await LoyaltyNFT.deploy();

    await nft.mint(customer.address, "ipfs://tokenURI");
    expect(await nft.ownerOf(1)).to.equal(customer.address);
  });
});
```

### Gas Reporting

```bash
REPORT_GAS=true npx hardhat test
```

### Test Coverage

```bash
npx hardhat coverage
```

---

## Security Best Practices

### Smart Contract Security

- **Audit all contracts** before mainnet deployment
- **Use OpenZeppelin** libraries for standard functionality
- **Implement access control** (Ownable, AccessControl)
- **Check for reentrancy** vulnerabilities
- **Validate all inputs** and handle edge cases
- **Use SafeMath** (or Solidity 0.8+ built-in overflow checks)

### Key Management

- **Never commit private keys** to version control
- **Use hardware wallets** for mainnet deployments
- **Store keys in secure vaults** (1Password, AWS Secrets Manager)
- **Use multi-sig wallets** for contract ownership

---

## Related Documentation

- [Backend Development](./backend.md) - NestJS backend integration
- [Web Development](./web.md) - Web3 frontend integration
- [Infrastructure](./infrastructure.md) - Blockchain node deployment
- [Blockchain Features](../../docs/requirements/features/blockchain/) - Feature specs
- [Hardhat Docs](https://hardhat.org/) - Hardhat documentation
- [OpenZeppelin](https://docs.openzeppelin.com/) - Smart contract libraries

---

**Implementation Status**: The blockchain package is currently a stub. Implementation will include Hardhat configuration, smart contracts for NFT rewards, multi-chain deployment scripts, and Web3 frontend integration.
