# Blockchain Domain - Value Objects

**Domain**: Blockchain
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

Value Objects in the Blockchain domain are immutable objects defined by their attributes rather than identity. They encapsulate domain concepts and validation logic.

## Core Value Objects

### 1. WalletAddress

**Purpose**: Represents a validated blockchain wallet address

```typescript
class WalletAddress {
  constructor(
    public readonly address: string,
    public readonly chain: BlockchainNetwork
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.address) {
      throw new Error('Wallet address is required');
    }

    switch (this.chain) {
      case BlockchainNetwork.ETHEREUM:
      case BlockchainNetwork.POLYGON:
      case BlockchainNetwork.BASE:
      case BlockchainNetwork.ARBITRUM:
        if (!this.isValidEthereumAddress(this.address)) {
          throw new Error('Invalid Ethereum address');
        }
        break;
      case BlockchainNetwork.SOLANA:
        if (!this.isValidSolanaAddress(this.address)) {
          throw new Error('Invalid Solana address');
        }
        break;
      default:
        throw new Error(`Unsupported chain: ${this.chain}`);
    }
  }

  private isValidEthereumAddress(address: string): boolean {
    // Must start with 0x and be 42 characters
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return false;
    }
    // Validate checksum if mixed case
    return this.validateChecksum(address);
  }

  private isValidSolanaAddress(address: string): boolean {
    // Solana addresses are base58 encoded, 32-44 characters
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }

  private validateChecksum(address: string): boolean {
    // Simplified: Use ethers.js utils.getAddress() in actual implementation
    return true;
  }

  public toChecksumAddress(): string {
    if (this.isEVMChain()) {
      // Return checksum version (mixed case)
      // Use ethers.js utils.getAddress()
      return this.address;
    }
    return this.address;
  }

  public isEVMChain(): boolean {
    return [
      BlockchainNetwork.ETHEREUM,
      BlockchainNetwork.POLYGON,
      BlockchainNetwork.BASE,
      BlockchainNetwork.ARBITRUM,
    ].includes(this.chain);
  }

  public equals(other: WalletAddress): boolean {
    return (
      this.address.toLowerCase() === other.address.toLowerCase() &&
      this.chain === other.chain
    );
  }
}
```

**Invariants**:
- Address must match chain format
- Ethereum addresses must have valid checksum
- Solana addresses must be valid base58

---

### 2. GasFee

**Purpose**: Represents gas costs in both native token and USD

```typescript
class GasFee {
  constructor(
    public readonly gasUsed: number,
    public readonly gasPrice: string, // Wei as string (bigint)
    public readonly gasFeeWei: string, // gasUsed * gasPrice
    public readonly gasFeeNative: number, // ETH, MATIC, etc.
    public readonly gasFeeUSD: number,
    public readonly chain: BlockchainNetwork
  ) {
    if (gasUsed < 0) throw new Error('Gas used cannot be negative');
    if (gasFeeUSD < 0) throw new Error('Gas fee USD cannot be negative');
  }

  public static calculate(
    gasUsed: number,
    gasPrice: string,
    nativeToUSD: number,
    chain: BlockchainNetwork
  ): GasFee {
    const gasPriceBigInt = BigInt(gasPrice);
    const gasUsedBigInt = BigInt(gasUsed);
    const gasFeeWeiBigInt = gasUsedBigInt * gasPriceBigInt;
    const gasFeeWei = gasFeeWeiBigInt.toString();

    // Convert to native token (18 decimals for most chains)
    const gasFeeNative = Number(gasFeeWeiBigInt) / 1e18;
    const gasFeeUSD = gasFeeNative * nativeToUSD;

    return new GasFee(
      gasUsed,
      gasPrice,
      gasFeeWei,
      gasFeeNative,
      gasFeeUSD,
      chain
    );
  }

  public isExpensive(thresholdUSD: number = 1.0): boolean {
    return this.gasFeeUSD > thresholdUSD;
  }

  public toString(): string {
    return `${this.gasFeeNative.toFixed(6)} ${this.getNativeSymbol()} ($${this.gasFeeUSD.toFixed(2)})`;
  }

  private getNativeSymbol(): string {
    switch (this.chain) {
      case BlockchainNetwork.ETHEREUM:
        return 'ETH';
      case BlockchainNetwork.POLYGON:
        return 'MATIC';
      case BlockchainNetwork.BASE:
        return 'ETH';
      case BlockchainNetwork.SOLANA:
        return 'SOL';
      case BlockchainNetwork.ARBITRUM:
        return 'ETH';
      default:
        return 'TOKEN';
    }
  }
}
```

**Invariants**:
- Gas used ≥ 0
- Gas fee USD ≥ 0
- Gas fee calculation must be accurate

---

### 3. ContractAddress

**Purpose**: Represents a deployed smart contract address

```typescript
class ContractAddress {
  constructor(
    public readonly address: string,
    public readonly chain: BlockchainNetwork
  ) {
    this.validate();
  }

  private validate(): void {
    // Contracts must have valid address format
    const walletAddress = new WalletAddress(this.address, this.chain);

    // Additional validation: Cannot be zero address
    if (this.isZeroAddress()) {
      throw new Error('Contract address cannot be zero address');
    }
  }

  private isZeroAddress(): boolean {
    if (this.address.startsWith('0x')) {
      return this.address === '0x0000000000000000000000000000000000000000';
    }
    return false;
  }

  public toURL(): string {
    switch (this.chain) {
      case BlockchainNetwork.ETHEREUM:
        return `https://etherscan.io/address/${this.address}`;
      case BlockchainNetwork.POLYGON:
        return `https://polygonscan.com/address/${this.address}`;
      case BlockchainNetwork.BASE:
        return `https://basescan.org/address/${this.address}`;
      case BlockchainNetwork.SOLANA:
        return `https://solscan.io/account/${this.address}`;
      case BlockchainNetwork.ARBITRUM:
        return `https://arbiscan.io/address/${this.address}`;
      default:
        return this.address;
    }
  }

  public equals(other: ContractAddress): boolean {
    return (
      this.address.toLowerCase() === other.address.toLowerCase() &&
      this.chain === other.chain
    );
  }
}
```

**Invariants**:
- Must be valid address format
- Cannot be zero address (0x0)
- Must be checksummed (EVM chains)

---

### 4. TransactionHash

**Purpose**: Represents a blockchain transaction hash

```typescript
class TransactionHash {
  constructor(
    public readonly hash: string,
    public readonly chain: BlockchainNetwork
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.hash) {
      throw new Error('Transaction hash is required');
    }

    if (this.isEVMChain()) {
      // EVM chains: 0x + 64 hex characters
      if (!/^0x[a-fA-F0-9]{64}$/.test(this.hash)) {
        throw new Error('Invalid EVM transaction hash');
      }
    } else if (this.chain === BlockchainNetwork.SOLANA) {
      // Solana: base58 encoded
      if (!/^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(this.hash)) {
        throw new Error('Invalid Solana transaction hash');
      }
    }
  }

  private isEVMChain(): boolean {
    return [
      BlockchainNetwork.ETHEREUM,
      BlockchainNetwork.POLYGON,
      BlockchainNetwork.BASE,
      BlockchainNetwork.ARBITRUM,
    ].includes(this.chain);
  }

  public toURL(): string {
    switch (this.chain) {
      case BlockchainNetwork.ETHEREUM:
        return `https://etherscan.io/tx/${this.hash}`;
      case BlockchainNetwork.POLYGON:
        return `https://polygonscan.com/tx/${this.hash}`;
      case BlockchainNetwork.BASE:
        return `https://basescan.org/tx/${this.hash}`;
      case BlockchainNetwork.SOLANA:
        return `https://solscan.io/tx/${this.hash}`;
      case BlockchainNetwork.ARBITRUM:
        return `https://arbiscan.io/tx/${this.hash}`;
      default:
        return this.hash;
    }
  }

  public equals(other: TransactionHash): boolean {
    return (
      this.hash.toLowerCase() === other.hash.toLowerCase() &&
      this.chain === other.chain
    );
  }
}
```

**Invariants**:
- Hash must match chain format
- EVM chains: 66 characters (0x + 64 hex)
- Solana: 87-88 characters (base58)

---

### 5. IPFSHash

**Purpose**: Represents an IPFS content identifier (CID)

```typescript
class IPFSHash {
  constructor(public readonly hash: string) {
    this.validate();
  }

  private validate(): void {
    // IPFS CIDv0: Qm... (46 characters)
    // IPFS CIDv1: bafy... (variable length)
    if (!this.hash) {
      throw new Error('IPFS hash is required');
    }

    if (!this.isValidCID()) {
      throw new Error('Invalid IPFS hash');
    }
  }

  private isValidCID(): boolean {
    // CIDv0: Starts with Qm, 46 characters
    if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(this.hash)) {
      return true;
    }
    // CIDv1: Starts with bafy (base32)
    if (/^bafy[a-z2-7]+$/.test(this.hash)) {
      return true;
    }
    return false;
  }

  public toURL(): string {
    return `ipfs://${this.hash}`;
  }

  public toHTTPGatewayURL(gateway: string = 'https://ipfs.io'): string {
    return `${gateway}/ipfs/${this.hash}`;
  }

  public equals(other: IPFSHash): boolean {
    return this.hash === other.hash;
  }
}
```

**Invariants**:
- Must be valid CIDv0 or CIDv1
- Cannot be empty
- Immutable content addressing

---

### 6. TokenAmount

**Purpose**: Represents an amount of tokens with decimals

```typescript
class TokenAmount {
  constructor(
    public readonly amount: string, // bigint as string
    public readonly decimals: number,
    public readonly symbol: string
  ) {
    if (decimals < 0 || decimals > 18) {
      throw new Error('Decimals must be between 0 and 18');
    }
    if (!symbol || symbol.length > 11) {
      throw new Error('Symbol must be 1-11 characters');
    }
  }

  public static fromHumanReadable(
    humanAmount: number,
    decimals: number,
    symbol: string
  ): TokenAmount {
    const multiplier = BigInt(10) ** BigInt(decimals);
    const amountBigInt = BigInt(Math.floor(humanAmount * Number(multiplier)));
    return new TokenAmount(amountBigInt.toString(), decimals, symbol);
  }

  public toHumanReadable(): number {
    const amountBigInt = BigInt(this.amount);
    const divisor = BigInt(10) ** BigInt(this.decimals);
    return Number(amountBigInt) / Number(divisor);
  }

  public add(other: TokenAmount): TokenAmount {
    if (this.decimals !== other.decimals || this.symbol !== other.symbol) {
      throw new Error('Cannot add different token types');
    }
    const sum = BigInt(this.amount) + BigInt(other.amount);
    return new TokenAmount(sum.toString(), this.decimals, this.symbol);
  }

  public subtract(other: TokenAmount): TokenAmount {
    if (this.decimals !== other.decimals || this.symbol !== other.symbol) {
      throw new Error('Cannot subtract different token types');
    }
    const diff = BigInt(this.amount) - BigInt(other.amount);
    if (diff < 0n) {
      throw new Error('Resulting amount would be negative');
    }
    return new TokenAmount(diff.toString(), this.decimals, this.symbol);
  }

  public isGreaterThan(other: TokenAmount): boolean {
    if (this.decimals !== other.decimals || this.symbol !== other.symbol) {
      throw new Error('Cannot compare different token types');
    }
    return BigInt(this.amount) > BigInt(other.amount);
  }

  public toString(): string {
    return `${this.toHumanReadable()} ${this.symbol}`;
  }
}
```

**Invariants**:
- Amount cannot be negative
- Decimals must be 0-18
- Symbol must be 1-11 characters
- Must preserve precision with bigint

---

### 7. SignatureProof

**Purpose**: Represents a cryptographic signature for wallet verification

```typescript
class SignatureProof {
  constructor(
    public readonly signature: string,
    public readonly message: string,
    public readonly nonce: string,
    public readonly signedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.signature || !this.message || !this.nonce) {
      throw new Error('Signature, message, and nonce are required');
    }

    // EVM signature: 132 characters (0x + 130 hex)
    if (this.signature.startsWith('0x')) {
      if (!/^0x[a-fA-F0-9]{130}$/.test(this.signature)) {
        throw new Error('Invalid EVM signature format');
      }
    }
  }

  public static createMessage(nonce: string, address: string): string {
    return `Sign this message to verify your wallet ownership.\n\nNonce: ${nonce}\nAddress: ${address}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
  }

  public isExpired(expirationMinutes: number = 5): boolean {
    const now = new Date();
    const elapsed = now.getTime() - this.signedAt.getTime();
    return elapsed > expirationMinutes * 60 * 1000;
  }

  public verify(expectedAddress: string, chain: BlockchainNetwork): boolean {
    // In actual implementation, use ethers.js verifyMessage()
    // For Solana, use nacl.sign.detached.verify()
    return true; // Simplified
  }
}
```

**Invariants**:
- Signature must be valid format
- Message must include nonce
- Signatures expire after 5 minutes
- Must verify against expected address

---

## Value Object Usage Examples

### Example 1: Validate Wallet Connection

```typescript
const walletAddress = new WalletAddress(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  BlockchainNetwork.ETHEREUM
);

const proof = new SignatureProof(
  signature,
  SignatureProof.createMessage(nonce, walletAddress.address),
  nonce,
  new Date()
);

if (proof.isExpired()) {
  throw new Error('Signature expired');
}

if (!proof.verify(walletAddress.address, walletAddress.chain)) {
  throw new Error('Invalid signature');
}
```

### Example 2: Calculate Gas Costs

```typescript
const gasFee = GasFee.calculate(
  21000, // Gas used
  '30000000000', // 30 gwei
  2000, // ETH = $2000
  BlockchainNetwork.ETHEREUM
);

console.log(gasFee.toString()); // "0.000630 ETH ($1.26)"

if (gasFee.isExpensive(1.0)) {
  console.log('Warning: High gas fees!');
}
```

### Example 3: Handle Token Amounts

```typescript
const amount = TokenAmount.fromHumanReadable(
  100.5, // 100.5 tokens
  18, // 18 decimals
  'LOYALTY'
);

console.log(amount.amount); // "100500000000000000000"
console.log(amount.toHumanReadable()); // 100.5

const double = amount.add(amount);
console.log(double.toString()); // "201.0 LOYALTY"
```

## References

- [ENTITIES.md](./ENTITIES.md)
- [AGGREGATES.md](./AGGREGATES.md)
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
