# Blockchain Domain - Business Rules

**Domain**: Blockchain
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

Business rules define the constraints and logic governing the Blockchain domain. These rules ensure data integrity, security, and compliance.

## NFT Reward Rules

### R1: Unique Token IDs
**Rule**: Each NFT must have a unique token ID within its contract.

**Rationale**: NFTs are non-fungible; duplicate token IDs would violate uniqueness.

**Validation**:
```typescript
if (await nftRepo.existsByTokenId(contractAddress, tokenId, chain)) {
  throw new Error(`Token ID ${tokenId} already exists in contract`);
}
```

---

### R2: Verified Wallet Required
**Rule**: Customer must have a verified wallet on the correct chain to receive NFTs.

**Rationale**: Cannot send NFT without valid destination address.

**Validation**:
```typescript
const wallet = await walletRepo.findPrimaryByCustomerAndChain(customerId, chain);
if (!wallet || !wallet.isVerified) {
  throw new Error('Customer must verify wallet before receiving NFT');
}
```

---

### R3: Only Owner Can Transfer
**Rule**: Only the current NFT owner can initiate a transfer.

**Rationale**: Prevents unauthorized transfers and theft.

**Validation**:
```typescript
if (nft.getOwner() !== fromCustomerId) {
  throw new Error('Only NFT owner can transfer');
}
```

---

### R4: Cannot Transfer Non-Minted NFTs
**Rule**: NFT status must be MINTED or TRANSFERRED to allow transfers.

**Rationale**: Pending or failed NFTs don't exist on-chain yet.

**Validation**:
```typescript
if (!nft.isMinted()) {
  throw new Error('Cannot transfer pending or failed NFT');
}
```

---

### R5: Cannot Transfer Burned NFTs
**Rule**: Burned NFTs cannot be transferred.

**Rationale**: Burned NFTs are permanently destroyed.

**Validation**:
```typescript
if (nft.isBurned()) {
  throw new Error('Cannot transfer burned NFT');
}
```

---

### R6: Metadata Immutability
**Rule**: NFT metadata cannot be changed after minting.

**Rationale**: Ensures NFT remains authentic and valuable.

**Exception**: Upgradeable contracts may allow metadata updates for bug fixes.

---

### R7: IPFS Storage Required
**Rule**: NFT metadata must be stored on IPFS (not centralized server).

**Rationale**: Decentralization ensures metadata permanence.

**Validation**:
```typescript
if (!metadata.image.startsWith('ipfs://')) {
  throw new Error('NFT image must be stored on IPFS');
}
```

---

## Token Program Rules

### R8: Unique Symbol Per Business
**Rule**: Token symbol must be unique within a business.

**Rationale**: Prevents confusion between different token programs.

**Validation**:
```typescript
if (await tokenRepo.existsBySymbol(symbol, businessId)) {
  throw new Error(`Symbol ${symbol} already used by this business`);
}
```

---

### R9: Symbol Format
**Rule**: Token symbol must be 2-5 uppercase letters.

**Rationale**: Standard ERC-20 convention; improves readability.

**Validation**:
```typescript
if (!/^[A-Z]{2,5}$/.test(symbol)) {
  throw new Error('Symbol must be 2-5 uppercase letters');
}
```

---

### R10: Decimals Range
**Rule**: Token decimals must be between 0 and 18.

**Rationale**: Ethereum standard; most tokens use 18 decimals (like ETH).

**Validation**:
```typescript
if (decimals < 0 || decimals > 18) {
  throw new Error('Decimals must be 0-18');
}
```

---

### R11: Max Supply Cap
**Rule**: Total supply cannot exceed max supply.

**Rationale**: Prevents inflation and maintains token value.

**Validation**:
```typescript
if (newSupply.isGreaterThan(maxSupply)) {
  throw new Error('Minting would exceed max supply');
}
```

---

### R12: Only Business Can Mint
**Rule**: Only business owner can mint new tokens (if mintable).

**Rationale**: Prevents unauthorized token creation.

**Implementation**: Smart contract requires `onlyOwner` modifier on mint function.

---

### R13: Active Program Required
**Rule**: Token program must be ACTIVE to mint/transfer tokens.

**Rationale**: Paused or ended programs should not issue new tokens.

**Validation**:
```typescript
if (tokenProgram.status !== TokenProgramStatus.ACTIVE) {
  throw new Error('Token program must be active');
}
```

---

## Smart Contract Rules

### R14: One Contract Per Program Per Type
**Rule**: Each loyalty program can have at most one contract of each type (NFT, Token).

**Rationale**: Simplifies management and prevents confusion.

**Validation**:
```typescript
const existing = await contractRepo.findByProgramAndType(programId, contractType);
if (existing) {
  throw new Error('Contract already deployed for this program');
}
```

---

### R15: Audit Required for Production
**Rule**: Smart contracts must pass security audit before production deployment.

**Rationale**: Prevents exploits, hacks, and financial loss.

**Enforcement**:
```typescript
if (env === 'production' && contract.auditStatus !== AuditStatus.PASSED) {
  throw new Error('Contract must be audited before production deployment');
}
```

---

### R16: Cannot Deploy to Zero Address
**Rule**: Contract address cannot be 0x0000000000000000000000000000000000000000.

**Rationale**: Zero address is reserved for minting/burning operations.

**Validation**:
```typescript
if (contractAddress.isZeroAddress()) {
  throw new Error('Cannot deploy contract to zero address');
}
```

---

### R17: Upgradeable Contracts Use Proxy
**Rule**: Upgradeable contracts must use proxy pattern (e.g., OpenZeppelin TransparentProxy).

**Rationale**: Allows bug fixes without losing contract address and state.

---

## Wallet Connection Rules

### R18: Unique Wallet Per Chain
**Rule**: Wallet address must be unique per blockchain network.

**Rationale**: Same address on different chains = different accounts.

**Validation**:
```typescript
const existing = await walletRepo.findByAddressAndChain(address, chain);
if (existing && existing.customerId !== customerId) {
  throw new Error('Wallet already connected to another account');
}
```

---

### R19: Signature Verification Required
**Rule**: Wallet connections must be verified via cryptographic signature.

**Rationale**: Proves customer controls the private key.

**Validation**:
```typescript
if (!proof.verify(expectedAddress, chain)) {
  throw new Error('Invalid signature');
}
```

---

### R20: Nonce Expiration
**Rule**: Signature nonces expire after 5 minutes.

**Rationale**: Prevents replay attacks.

**Validation**:
```typescript
if (proof.isExpired(5)) {
  throw new Error('Signature expired, please reconnect wallet');
}
```

---

### R21: One Primary Wallet Per Chain
**Rule**: Customer can have only one primary wallet per blockchain network.

**Rationale**: Simplifies reward delivery (know where to send).

**Enforcement**:
```typescript
if (newWallet.isPrimary) {
  await walletRepo.unmarkAllAsPrimary(customerId, chain);
}
```

---

### R22: Primary Wallet Must Be Verified
**Rule**: Only verified wallets can be marked as primary.

**Rationale**: Ensures rewards go to controlled wallet.

**Validation**:
```typescript
if (isPrimary && !isVerified) {
  throw new Error('Primary wallet must be verified');
}
```

---

## Transaction Rules

### R23: Transaction Hash Uniqueness
**Rule**: Transaction hash must be unique per blockchain network.

**Rationale**: Each transaction has a unique hash.

**Validation**:
```typescript
const existing = await txRepo.findByHash(txHash, chain);
if (existing) {
  throw new Error('Transaction already recorded');
}
```

---

### R24: Retry Limit
**Rule**: Failed transactions can be retried up to 3 times.

**Rationale**: Prevents infinite retry loops; some failures are permanent.

**Validation**:
```typescript
if (transaction.retryCount >= transaction.maxRetries) {
  throw new Error('Max retries exceeded');
}
```

---

### R25: Minimum Confirmations
**Rule**: Transactions require minimum confirmations to be considered final:
- Ethereum: 12 confirmations
- Polygon: 30 confirmations
- Base: 12 confirmations
- Solana: 32 confirmations

**Rationale**: Prevents finality issues from blockchain reorganizations.

**Validation**:
```typescript
const minConfirmations = getMinConfirmations(chain);
if (transaction.confirmations < minConfirmations) {
  transaction.status = TransactionStatus.CONFIRMING;
} else {
  transaction.status = TransactionStatus.CONFIRMED;
}
```

---

### R26: Gas Fee Tracking
**Rule**: All transactions must record gas fees in USD.

**Rationale**: Required for billing and cost analysis.

**Enforcement**:
```typescript
const gasFee = GasFee.calculate(gasUsed, gasPrice, ethToUSD, chain);
transaction.gasFeeUSD = gasFee.gasFeeUSD;
```

---

## Gas Management Rules

### R27: Gas Limit Safety
**Rule**: Set gas limit 20% above estimated gas to prevent out-of-gas errors.

**Rationale**: Prevents transaction failures due to estimation errors.

**Implementation**:
```typescript
const estimatedGas = await contract.estimateGas.mintNFT(...args);
const gasLimit = Math.ceil(estimatedGas * 1.2);
```

---

### R28: Gas Price Optimization
**Rule**: Use current gas price + 10% for faster confirmation.

**Rationale**: Ensures transaction is picked up quickly by miners.

**Implementation**:
```typescript
const currentGasPrice = await provider.getGasPrice();
const gasPrice = currentGasPrice.mul(110).div(100); // +10%
```

---

### R29: Batch Operations
**Rule**: Batch multiple operations (e.g., mint 10 NFTs) when possible.

**Rationale**: Saves gas costs (40-60% savings).

**Example**:
```typescript
// Bad: 10 separate transactions
for (const customer of customers) {
  await mintNFT(customer); // 10 × gas cost
}

// Good: 1 batch transaction
await mintNFTBatch(customers); // 1 × reduced gas cost
```

---

### R30: Layer 2 for High Volume
**Rule**: Use Layer 2 networks (Polygon, Base, Arbitrum) for high-volume operations.

**Rationale**: 100x cheaper gas than Ethereum mainnet.

**Recommendation**:
- **< 100 NFTs/month**: Ethereum mainnet OK
- **> 100 NFTs/month**: Use Polygon/Base

---

## Security Rules

### R31: Reentrancy Protection
**Rule**: All state-changing functions must use reentrancy guards.

**Rationale**: Prevents reentrancy attacks (e.g., DAO hack).

**Implementation**:
```solidity
function mintNFT(address recipient) external nonReentrant {
  // Safe from reentrancy
}
```

---

### R32: Access Control
**Rule**: Privileged functions (mint, burn, pause) require role-based access control.

**Rationale**: Prevents unauthorized actions.

**Implementation**:
```solidity
function mintNFT(address recipient) external onlyRole(MINTER_ROLE) {
  // Only accounts with MINTER_ROLE can call
}
```

---

### R33: Rate Limiting
**Rule**: Limit minting to 100 NFTs per business per hour.

**Rationale**: Prevents spam and abuse.

**Validation**:
```typescript
const recentMints = await nftRepo.countSince(businessId, oneHourAgo);
if (recentMints >= 100) {
  throw new Error('Mint rate limit exceeded');
}
```

---

### R34: Private Key Security
**Rule**: Never log, store, or transmit private keys.

**Rationale**: Compromised private keys = stolen funds/NFTs.

**Enforcement**: Use environment variables or secret management (AWS Secrets Manager).

---

## Compliance Rules

### R35: AML/KYC for High-Value Tokens
**Rule**: Token programs with > $10,000 USD value require AML/KYC.

**Rationale**: Regulatory compliance (securities laws).

**Enforcement**: Flag high-value programs for manual review.

---

### R36: Terms of Service Acceptance
**Rule**: Customers must accept blockchain terms before connecting wallet.

**Rationale**: Legal protection; educates users about risks.

**Enforcement**: Show terms modal on first wallet connection.

---

### R37: Tax Implications Disclosure
**Rule**: Inform customers that NFT/token rewards may have tax implications.

**Rationale**: Regulatory compliance; customer education.

**Enforcement**: Display tax disclaimer on reward pages.

---

## Business Constraint Rules

### R38: NFT Minting Budget
**Rule**: Businesses on basic plan limited to 100 NFTs/month.

**Rationale**: Tier-based pricing model.

**Enforcement**:
```typescript
const plan = await billingService.getPlan(businessId);
const limit = plan.nftMintLimit;
const usage = await nftRepo.countThisMonth(businessId);
if (usage >= limit) {
  throw new Error('NFT mint limit exceeded for plan');
}
```

---

### R39: Supported Chains
**Rule**: Phase 4.1 supports Ethereum, Polygon, Base only.

**Rationale**: Incremental rollout; validate before expanding.

**Validation**:
```typescript
const supportedChains = [
  BlockchainNetwork.ETHEREUM,
  BlockchainNetwork.POLYGON,
  BlockchainNetwork.BASE,
];
if (!supportedChains.includes(chain)) {
  throw new Error(`Chain ${chain} not supported yet`);
}
```

---

### R40: Test Mode for Sandbox
**Rule**: Businesses can test blockchain features on testnet (Sepolia, Mumbai) for free.

**Rationale**: Encourages experimentation without cost.

**Implementation**: Provide testnet faucets and test NFT contracts.

---

## Rule Priority

**Critical (Must Never Violate)**:
- R2: Verified wallet required
- R3: Only owner can transfer
- R14: One contract per program per type
- R15: Audit required for production
- R31: Reentrancy protection
- R34: Private key security

**Important (Should Enforce)**:
- R1: Unique token IDs
- R11: Max supply cap
- R19: Signature verification required
- R25: Minimum confirmations

**Recommended (Best Practice)**:
- R29: Batch operations
- R30: Layer 2 for high volume
- R33: Rate limiting

---

## References

- [ENTITIES.md](./ENTITIES.md)
- [AGGREGATES.md](./AGGREGATES.md)
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md)
- [OpenZeppelin Security Best Practices](https://docs.openzeppelin.com/contracts/4.x/security)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
