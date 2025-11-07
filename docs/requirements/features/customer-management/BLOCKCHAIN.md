# Customer Management - Blockchain Integration

**Feature**: Customer Management
**Version**: 1.0.0
**Status**: 🟡 Phase 4 Feature
**Last Updated**: 2025-11-07

## Overview

Blockchain integration enables customers to connect blockchain wallets, manage digital identities, and receive crypto-native rewards.

**Phase**: Phase 4 (Months 10-12)
**Priority**: P1 (Critical for all blockchain features)
**Dependencies**: Customer Management (Phase 1), Blockchain Domain (Phase 4)

## Blockchain Features

### 1. Wallet Connection

**Purpose**: Link blockchain wallets to customer accounts

**Benefits**:
- **True Ownership**: Customers control assets in their wallets
- **Multi-Wallet Support**: Connect multiple wallets (MetaMask, Coinbase Wallet)
- **Cross-Platform**: Same wallet works across all businesses
- **Decentralized Identity**: Wallet as universal login

**Supported Wallets**:
- MetaMask (browser extension)
- Coinbase Wallet (mobile + browser)
- WalletConnect (all mobile wallets)
- Custodial wallet (NxLoy-managed, for beginners)

---

### 2. Wallet Verification

**Purpose**: Cryptographically prove wallet ownership

**Benefits**:
- **Security**: Only wallet owner can connect
- **No Password**: Sign message instead of password
- **Anti-Fraud**: Prevents fake wallet connections

**Verification Flow**:
1. Customer clicks "Connect Wallet"
2. Platform generates nonce (random string)
3. Customer signs message with nonce
4. Platform verifies signature
5. Wallet marked as verified

**Message to Sign**:
```
Sign this message to verify your wallet ownership.

Nonce: abc123def456
Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

This request will not trigger a blockchain transaction or cost any gas fees.
```

---

### 3. Multi-Chain Support

**Purpose**: Connect wallets on multiple blockchain networks

**Benefits**:
- **Flexibility**: Use different chains for different rewards
- **Cost Optimization**: Use cheaper chains (Polygon vs Ethereum)
- **Network-Specific**: Some businesses prefer specific chains

**Example Customer Profile**:
```typescript
{
  "customerId": "cust-123",
  "email": "alice@example.com",
  "walletConnections": [
    {
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "chain": "POLYGON",
      "walletType": "METAMASK",
      "isPrimary": true,
      "isVerified": true,
      "verifiedAt": "2025-11-07T12:00:00Z"
    },
    {
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "chain": "ETHEREUM",
      "walletType": "METAMASK",
      "isPrimary": false,
      "isVerified": true,
      "verifiedAt": "2025-11-07T12:05:00Z"
    }
  ]
}
```

---

### 4. Custodial Wallet Option

**Purpose**: Provide platform-managed wallets for non-crypto users

**Benefits**:
- **Beginner-Friendly**: No seed phrase to manage
- **Instant Onboarding**: Auto-create wallet on signup
- **Zero Friction**: No wallet installation needed
- **Gradual Adoption**: Can export to non-custodial later

**Custodial Wallet Flow**:
1. Customer signs up (email + password)
2. Platform auto-creates wallet on Polygon
3. Customer receives rewards to custodial wallet
4. Customer can:
   - Keep using custodial wallet (easiest)
   - Export to MetaMask (for advanced users)

---

## Technical Architecture

### Customer Entity Extension

```typescript
interface Customer {
  id: UUID;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;

  // Blockchain extensions
  walletConnections: WalletConnection[];
  custodialWallet?: CustodialWallet;
  blockchainPreferences: BlockchainPreferences;
}

interface WalletConnection {
  id: UUID;
  customerId: UUID;
  walletAddress: string;
  chain: BlockchainNetwork;
  walletType: WalletType;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  verificationSignature?: string;
  nonce: string;
  lastUsedAt: Date;
}

interface CustodialWallet {
  id: UUID;
  customerId: UUID;
  walletAddress: string;
  chain: BlockchainNetwork;
  encryptedPrivateKey: string; // Encrypted with platform key
  createdAt: Date;
}

interface BlockchainPreferences {
  enableBlockchainRewards: boolean;
  preferredChain: BlockchainNetwork;
  gasSubsidy: boolean; // Let platform pay gas fees
  emailNotifications: {
    nftMinted: boolean;
    tokenReceived: boolean;
    transactionFailed: boolean;
  };
}
```

---

## User Experience

### Onboarding Flow

**Option 1: Connect Existing Wallet**
```
Welcome to Coffee Rewards!

How would you like to receive rewards?

[Connect Crypto Wallet] (Recommended for crypto users)
  - Keep rewards in your wallet
  - Use any wallet (MetaMask, Coinbase Wallet)
  - Full control of your assets

[Create Custodial Wallet] (Recommended for beginners)
  - We manage your wallet
  - No seed phrase needed
  - Easiest option

[Skip Blockchain Features] (Use traditional points)
```

**Option 2: Auto-Create Custodial Wallet**
```
🎉 Welcome! Your wallet is ready!

We've created a secure wallet for you:
Wallet: 0x5f9a...7e4b
Network: Polygon

You can now:
✅ Earn crypto rewards (COFFEE tokens)
✅ Collect NFT badges
✅ No setup required!

Advanced: [Export to MetaMask]
```

### Wallet Connection UI

**Connected Wallet Card**:
```
🟢 Wallet Connected

Primary Wallet:
Address: 0x742d...f0bEb
Network: Polygon
Type: MetaMask
Verified: ✅ Nov 7, 2025

[View on PolygonScan]
[Set as Primary]
[Disconnect]

Secondary Wallets:
+ Connect another wallet
```

### Wallet Switching

**Multi-Chain Selection**:
```
Select Network for Rewards:

⚡ Polygon (Recommended)
   - Fast (2 second confirmation)
   - Cheap ($0.01 per transaction)
   - NFT rewards supported

🔷 Ethereum
   - Most secure
   - Higher fees ($2-10 per transaction)
   - Best for high-value NFTs

🔵 Base
   - Coinbase L2
   - Great for Coinbase Wallet users
   - Low fees ($0.02 per transaction)

[Save Preference]
```

---

## Wallet Management

### API Endpoints

```typescript
// Connect wallet (initiate)
POST /api/v1/customers/me/wallets/connect
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "POLYGON",
  "walletType": "METAMASK"
}
Response: { "nonce": "abc123def456", "message": "Sign this..." }

// Verify wallet (complete)
POST /api/v1/customers/me/wallets/verify
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "POLYGON",
  "signature": "0x8f3e2a1b...",
  "nonce": "abc123def456"
}
Response: { "verified": true, "walletConnectionId": "wc-123" }

// List wallets
GET /api/v1/customers/me/wallets
Response: [{ "walletAddress": "0x742d...", "chain": "POLYGON", ... }]

// Set primary wallet
PUT /api/v1/customers/me/wallets/{id}/primary
Response: { "isPrimary": true }

// Disconnect wallet
DELETE /api/v1/customers/me/wallets/{id}
Response: { "disconnected": true }

// Create custodial wallet
POST /api/v1/customers/me/wallets/custodial
{
  "chain": "POLYGON"
}
Response: { "walletAddress": "0x5f9a...", "custodial": true }
```

---

## Security

### Private Key Management

**Non-Custodial Wallets**:
- Customer holds private key (in MetaMask, etc.)
- Platform never sees private key
- Sign transactions in customer's wallet

**Custodial Wallets**:
- Platform holds encrypted private key
- Encrypted with AES-256
- Key stored in AWS Secrets Manager
- Decrypted only for transactions

### Signature Verification

```typescript
async function verifyWalletSignature(
  address: string,
  signature: string,
  message: string
): Promise<boolean> {
  // Verify signature using ethers.js
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  return recoveredAddress.toLowerCase() === address.toLowerCase();
}
```

### Nonce Expiration

- Nonces expire after 5 minutes
- Prevents replay attacks
- New nonce for each connection attempt

---

## Cost Analysis

**Custodial Wallet Management** (Polygon):
| Operation | Gas Cost | USD Cost (MATIC @ $0.50) |
|-----------|----------|--------------------------|
| Create Wallet | 0 gas (off-chain) | $0 |
| Send Tokens | 50,000 gas | ~$0.01 |
| Send NFT | 80,000 gas | ~$0.02 |

**Monthly Cost** (10,000 active users):
- 10,000 users × $0.01 avg = $100/month gas fees

---

## Implementation Phases

### Phase 4.1: Wallet Connection (Months 10-11)
- Connect MetaMask, Coinbase Wallet
- Signature verification
- Primary wallet selection

### Phase 4.2: Custodial Wallets (Month 12)
- Auto-create custodial wallets
- Encrypted private key storage
- Export to non-custodial

### Phase 4.3: Multi-Chain Support (Month 13-14)
- Connect same address on multiple chains
- Chain preference per customer
- Automatic chain selection

---

## Success Metrics

**Phase 4 Targets**:
- Wallet connections: 100,000+
- Verified wallets: 80,000+
- Custodial wallets created: 50,000+
- Multi-chain users: 10,000+

---

## References

- [Blockchain Domain Specification](../../domain-specs/blockchain/)
- [Feature Spec: Customer Management](./FEATURE-SPEC.md)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
