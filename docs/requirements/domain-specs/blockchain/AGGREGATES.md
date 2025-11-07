# Blockchain Domain - Aggregates

**Domain**: Blockchain
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

## Overview

Aggregates are clusters of domain objects (entities and value objects) that are treated as a single unit for data changes. Each aggregate has a root entity that controls access to its children.

## Aggregate Design Principles

1. **Single Root**: Only the root can be referenced from outside
2. **Transaction Boundary**: Changes within aggregate are atomic
3. **Consistency Boundary**: Invariants enforced within aggregate
4. **Small Aggregates**: Keep aggregates as small as possible
5. **Reference by ID**: Aggregates reference each other by ID, not object

---

## 1. NFTReward Aggregate

**Root**: NFTReward
**Children**: NFTMetadata, NFTTransfer[]

### Structure

```typescript
class NFTRewardAggregate {
  private constructor(
    public readonly id: UUID,
    public readonly businessId: UUID,
    public readonly programId: UUID,
    private customerId: UUID,
    private tokenId: number,
    private contractAddress: ContractAddress,
    private chain: BlockchainNetwork,
    private status: NFTStatus,
    private metadata: NFTMetadata,
    private transferHistory: NFTTransfer[],
    private transactionHash: TransactionHash | null,
    public readonly mintedAt: Date | null,
    private mintedBy: UUID,
    public readonly createdAt: Date,
    private updatedAt: Date
  ) {
    this.validateInvariants();
  }

  // Factory method
  public static create(
    businessId: UUID,
    programId: UUID,
    customerId: UUID,
    contractAddress: ContractAddress,
    metadata: NFTMetadata,
    mintedBy: UUID
  ): NFTRewardAggregate {
    const nft = new NFTRewardAggregate(
      generateUUID(),
      businessId,
      programId,
      customerId,
      0, // Token ID assigned after minting
      contractAddress,
      contractAddress.chain,
      NFTStatus.PENDING,
      metadata,
      [],
      null,
      null,
      mintedBy,
      new Date(),
      new Date()
    );

    nft.addDomainEvent(
      new NFTPendingMintEvent(nft.id, businessId, programId, customerId)
    );
    return nft;
  }

  // Business methods
  public markAsMinted(
    tokenId: number,
    transactionHash: TransactionHash,
    blockNumber: number
  ): void {
    if (this.status !== NFTStatus.PENDING) {
      throw new Error('Can only mark pending NFTs as minted');
    }
    if (tokenId < 0) {
      throw new Error('Token ID must be non-negative');
    }

    this.tokenId = tokenId;
    this.transactionHash = transactionHash;
    this.status = NFTStatus.MINTED;
    (this as any).mintedAt = new Date();
    this.updatedAt = new Date();

    // Record initial transfer (mint)
    const mintTransfer = new NFTTransfer(
      generateUUID(),
      this.id,
      '0x0000000000000000000000000000000000000000', // From zero address
      new WalletAddress(this.customerId, this.chain).address, // To customer
      transactionHash.hash,
      TransferType.MINT,
      new Date(),
      blockNumber,
      '0', // No gas fee for mint (paid by business)
      this.customerId
    );
    this.transferHistory.push(mintTransfer);

    this.addDomainEvent(
      new NFTMintedEvent(
        this.id,
        this.businessId,
        this.programId,
        this.customerId,
        tokenId,
        this.contractAddress.address,
        this.chain,
        transactionHash.hash
      )
    );
  }

  public transfer(
    fromCustomerId: UUID,
    toCustomerId: UUID,
    toAddress: WalletAddress,
    transactionHash: TransactionHash,
    blockNumber: number,
    gasFeeWei: string
  ): void {
    if (this.status !== NFTStatus.MINTED) {
      throw new Error('Can only transfer minted NFTs');
    }
    if (this.customerId !== fromCustomerId) {
      throw new Error('Only current owner can transfer NFT');
    }
    if (toAddress.chain !== this.chain) {
      throw new Error('Cannot transfer to different chain');
    }

    const oldOwner = this.customerId;
    this.customerId = toCustomerId;
    this.status = NFTStatus.TRANSFERRED;
    this.updatedAt = new Date();

    // Record transfer
    const transfer = new NFTTransfer(
      generateUUID(),
      this.id,
      new WalletAddress(fromCustomerId, this.chain).address,
      toAddress.address,
      transactionHash.hash,
      TransferType.TRANSFER,
      new Date(),
      blockNumber,
      gasFeeWei,
      fromCustomerId
    );
    this.transferHistory.push(transfer);

    this.addDomainEvent(
      new NFTTransferredEvent(
        this.id,
        this.businessId,
        oldOwner,
        toCustomerId,
        transactionHash.hash
      )
    );
  }

  public burn(
    customerId: UUID,
    transactionHash: TransactionHash,
    blockNumber: number
  ): void {
    if (this.status === NFTStatus.BURNED) {
      throw new Error('NFT already burned');
    }
    if (this.customerId !== customerId) {
      throw new Error('Only current owner can burn NFT');
    }

    this.status = NFTStatus.BURNED;
    this.updatedAt = new Date();

    // Record burn
    const burnTransfer = new NFTTransfer(
      generateUUID(),
      this.id,
      new WalletAddress(customerId, this.chain).address,
      '0x0000000000000000000000000000000000000000', // To zero address
      transactionHash.hash,
      TransferType.BURN,
      new Date(),
      blockNumber,
      '0', // Gas paid by burner
      customerId
    );
    this.transferHistory.push(burnTransfer);

    this.addDomainEvent(
      new NFTBurnedEvent(
        this.id,
        this.businessId,
        this.customerId,
        transactionHash.hash
      )
    );
  }

  public markAsFailed(errorMessage: string): void {
    if (this.status !== NFTStatus.PENDING) {
      throw new Error('Can only mark pending NFTs as failed');
    }

    this.status = NFTStatus.FAILED;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new NFTMintFailedEvent(this.id, this.businessId, errorMessage)
    );
  }

  // Queries
  public getOwner(): UUID {
    return this.customerId;
  }

  public getTokenId(): number {
    return this.tokenId;
  }

  public getMetadata(): NFTMetadata {
    return this.metadata;
  }

  public getTransferHistory(): NFTTransfer[] {
    return [...this.transferHistory].sort(
      (a, b) => b.transferredAt.getTime() - a.transferredAt.getTime()
    );
  }

  public isMinted(): boolean {
    return this.status === NFTStatus.MINTED || this.status === NFTStatus.TRANSFERRED;
  }

  public isBurned(): boolean {
    return this.status === NFTStatus.BURNED;
  }

  // Invariant validation
  private validateInvariants(): void {
    if (this.status === NFTStatus.MINTED && this.tokenId < 0) {
      throw new Error('Minted NFTs must have valid token ID');
    }
    if (this.status === NFTStatus.MINTED && !this.transactionHash) {
      throw new Error('Minted NFTs must have transaction hash');
    }
    if (this.status === NFTStatus.BURNED && this.transferHistory.length === 0) {
      throw new Error('Burned NFTs must have transfer history');
    }
  }

  // Domain events
  private domainEvents: DomainEvent[] = [];

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
```

### Invariants

1. Minted NFTs must have valid token ID (≥ 0)
2. Minted NFTs must have transaction hash
3. Only owner can transfer or burn NFT
4. Cannot transfer or burn pending/failed NFTs
5. Transfer history is append-only
6. Status transitions: PENDING → MINTED → TRANSFERRED, or PENDING → FAILED
7. Burned NFTs cannot be transferred

### Domain Events

- `blockchain.nft.pending`
- `blockchain.nft.minted`
- `blockchain.nft.transferred`
- `blockchain.nft.burned`
- `blockchain.nft.mint_failed`

---

## 2. TokenProgram Aggregate

**Root**: TokenProgram
**Children**: None (token balances tracked externally)

### Structure

```typescript
class TokenProgramAggregate {
  private constructor(
    public readonly id: UUID,
    public readonly businessId: UUID,
    public readonly programId: UUID,
    private name: string,
    private symbol: string,
    private decimals: number,
    private totalSupply: TokenAmount,
    private maxSupply: TokenAmount,
    private contractAddress: ContractAddress | null,
    private chain: BlockchainNetwork,
    private transferable: boolean,
    private burnableByHolder: boolean,
    private mintableByBusiness: boolean,
    private status: TokenProgramStatus,
    public readonly createdAt: Date,
    private updatedAt: Date
  ) {
    this.validateInvariants();
  }

  // Factory method
  public static create(
    businessId: UUID,
    programId: UUID,
    name: string,
    symbol: string,
    decimals: number,
    maxSupply: TokenAmount,
    chain: BlockchainNetwork,
    config: TokenConfig
  ): TokenProgramAggregate {
    const program = new TokenProgramAggregate(
      generateUUID(),
      businessId,
      programId,
      name,
      symbol,
      decimals,
      new TokenAmount('0', decimals, symbol), // Initial supply = 0
      maxSupply,
      null, // Contract not deployed yet
      chain,
      config.transferable,
      config.burnableByHolder,
      config.mintableByBusiness,
      TokenProgramStatus.DRAFT,
      new Date(),
      new Date()
    );

    program.addDomainEvent(
      new TokenProgramCreatedEvent(program.id, businessId, programId, symbol)
    );
    return program;
  }

  // Business methods
  public deploy(contractAddress: ContractAddress): void {
    if (this.status !== TokenProgramStatus.DRAFT) {
      throw new Error('Can only deploy draft token programs');
    }
    if (contractAddress.chain !== this.chain) {
      throw new Error('Contract chain must match program chain');
    }

    this.contractAddress = contractAddress;
    this.status = TokenProgramStatus.DEPLOYING;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new TokenProgramDeployingEvent(this.id, this.businessId, contractAddress.address)
    );
  }

  public markAsDeployed(transactionHash: TransactionHash): void {
    if (this.status !== TokenProgramStatus.DEPLOYING) {
      throw new Error('Can only mark deploying programs as deployed');
    }

    this.status = TokenProgramStatus.ACTIVE;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new TokenProgramDeployedEvent(
        this.id,
        this.businessId,
        this.contractAddress!.address,
        transactionHash.hash
      )
    );
  }

  public mint(amount: TokenAmount, recipient: UUID): void {
    if (this.status !== TokenProgramStatus.ACTIVE) {
      throw new Error('Can only mint on active token programs');
    }
    if (!this.mintableByBusiness) {
      throw new Error('Token program does not allow minting');
    }

    const newSupply = this.totalSupply.add(amount);
    if (newSupply.isGreaterThan(this.maxSupply)) {
      throw new Error('Minting would exceed max supply');
    }

    this.totalSupply = newSupply;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new TokenMintedEvent(
        this.id,
        this.businessId,
        recipient,
        amount.toHumanReadable(),
        this.symbol
      )
    );
  }

  public burn(amount: TokenAmount): void {
    if (this.status !== TokenProgramStatus.ACTIVE) {
      throw new Error('Can only burn on active token programs');
    }

    this.totalSupply = this.totalSupply.subtract(amount);
    this.updatedAt = new Date();

    this.addDomainEvent(
      new TokenBurnedEvent(
        this.id,
        this.businessId,
        amount.toHumanReadable(),
        this.symbol
      )
    );
  }

  public pause(): void {
    if (this.status !== TokenProgramStatus.ACTIVE) {
      throw new Error('Can only pause active token programs');
    }

    this.status = TokenProgramStatus.PAUSED;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new TokenProgramPausedEvent(this.id, this.businessId)
    );
  }

  public resume(): void {
    if (this.status !== TokenProgramStatus.PAUSED) {
      throw new Error('Can only resume paused token programs');
    }

    this.status = TokenProgramStatus.ACTIVE;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new TokenProgramResumedEvent(this.id, this.businessId)
    );
  }

  public end(): void {
    if (this.status === TokenProgramStatus.ENDED) {
      throw new Error('Token program already ended');
    }

    this.status = TokenProgramStatus.ENDED;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new TokenProgramEndedEvent(this.id, this.businessId)
    );
  }

  // Queries
  public getContractAddress(): ContractAddress | null {
    return this.contractAddress;
  }

  public getTotalSupply(): TokenAmount {
    return this.totalSupply;
  }

  public canMint(amount: TokenAmount): boolean {
    if (!this.mintableByBusiness) return false;
    if (this.status !== TokenProgramStatus.ACTIVE) return false;

    const newSupply = this.totalSupply.add(amount);
    return !newSupply.isGreaterThan(this.maxSupply);
  }

  // Invariant validation
  private validateInvariants(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Token name is required');
    }
    if (!this.symbol || this.symbol.length < 2 || this.symbol.length > 5) {
      throw new Error('Token symbol must be 2-5 characters');
    }
    if (this.decimals < 0 || this.decimals > 18) {
      throw new Error('Decimals must be between 0 and 18');
    }
    if (this.totalSupply.isGreaterThan(this.maxSupply)) {
      throw new Error('Total supply cannot exceed max supply');
    }
    if (
      this.status === TokenProgramStatus.ACTIVE &&
      !this.contractAddress
    ) {
      throw new Error('Active token programs must have contract address');
    }
  }

  // Domain events
  private domainEvents: DomainEvent[] = [];

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
```

### Invariants

1. Token name is required
2. Symbol must be 2-5 characters (uppercase)
3. Decimals must be 0-18
4. Total supply ≤ max supply
5. Active programs must have contract address
6. Cannot mint beyond max supply
7. Status transitions: DRAFT → DEPLOYING → ACTIVE ↔ PAUSED → ENDED

### Domain Events

- `blockchain.token_program.created`
- `blockchain.token_program.deploying`
- `blockchain.token_program.deployed`
- `blockchain.token.minted`
- `blockchain.token.burned`
- `blockchain.token_program.paused`
- `blockchain.token_program.resumed`
- `blockchain.token_program.ended`

---

## 3. WalletConnection Aggregate

**Root**: WalletConnection
**Children**: None

### Structure

```typescript
class WalletConnectionAggregate {
  private constructor(
    public readonly id: UUID,
    public readonly customerId: UUID,
    private walletAddress: WalletAddress,
    private walletType: WalletType,
    private isVerified: boolean,
    private verifiedAt: Date | null,
    private verificationProof: SignatureProof | null,
    private isPrimary: boolean,
    private lastUsedAt: Date,
    private nonce: string,
    public readonly createdAt: Date,
    private updatedAt: Date
  ) {
    this.validateInvariants();
  }

  // Factory method
  public static create(
    customerId: UUID,
    walletAddress: WalletAddress,
    walletType: WalletType,
    nonce: string
  ): WalletConnectionAggregate {
    const connection = new WalletConnectionAggregate(
      generateUUID(),
      customerId,
      walletAddress,
      walletType,
      false,
      null,
      null,
      false,
      new Date(),
      nonce,
      new Date(),
      new Date()
    );

    connection.addDomainEvent(
      new WalletConnectionInitiatedEvent(
        connection.id,
        customerId,
        walletAddress.address,
        walletAddress.chain
      )
    );
    return connection;
  }

  // Business methods
  public verify(proof: SignatureProof): void {
    if (this.isVerified) {
      throw new Error('Wallet already verified');
    }
    if (proof.isExpired()) {
      throw new Error('Signature expired');
    }
    if (proof.nonce !== this.nonce) {
      throw new Error('Nonce mismatch');
    }
    if (!proof.verify(this.walletAddress.address, this.walletAddress.chain)) {
      throw new Error('Invalid signature');
    }

    this.isVerified = true;
    this.verifiedAt = new Date();
    this.verificationProof = proof;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new WalletVerifiedEvent(
        this.id,
        this.customerId,
        this.walletAddress.address,
        this.walletAddress.chain
      )
    );
  }

  public markAsPrimary(): void {
    if (!this.isVerified) {
      throw new Error('Only verified wallets can be primary');
    }

    this.isPrimary = true;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new WalletMarkedPrimaryEvent(this.id, this.customerId)
    );
  }

  public unmarkAsPrimary(): void {
    this.isPrimary = false;
    this.updatedAt = new Date();
  }

  public recordUsage(): void {
    this.lastUsedAt = new Date();
    this.updatedAt = new Date();
  }

  public disconnect(): void {
    this.addDomainEvent(
      new WalletDisconnectedEvent(
        this.id,
        this.customerId,
        this.walletAddress.address
      )
    );
  }

  // Queries
  public getWalletAddress(): WalletAddress {
    return this.walletAddress;
  }

  public getChain(): BlockchainNetwork {
    return this.walletAddress.chain;
  }

  // Invariant validation
  private validateInvariants(): void {
    if (!this.nonce || this.nonce.length < 16) {
      throw new Error('Nonce must be at least 16 characters');
    }
    if (this.isPrimary && !this.isVerified) {
      throw new Error('Primary wallet must be verified');
    }
    if (this.isVerified && !this.verifiedAt) {
      throw new Error('Verified wallets must have verification timestamp');
    }
  }

  // Domain events
  private domainEvents: DomainEvent[] = [];

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
```

### Invariants

1. Nonce must be at least 16 characters
2. Primary wallet must be verified
3. Verified wallets must have verification timestamp
4. Wallet address must be valid for chain
5. Only one primary wallet per customer per chain

### Domain Events

- `blockchain.wallet.connection_initiated`
- `blockchain.wallet.verified`
- `blockchain.wallet.marked_primary`
- `blockchain.wallet.disconnected`

---

## Aggregate Boundaries

### Why These Boundaries?

**NFTReward Aggregate**:
- Controls NFT lifecycle (mint, transfer, burn)
- Metadata is tightly coupled (immutable)
- Transfer history is part of NFT identity
- Small, focused on single NFT instance

**TokenProgram Aggregate**:
- Controls token program configuration
- Token balances tracked separately (CustomerEnrollment)
- Minting/burning updates total supply
- Deployment is lifecycle event

**WalletConnection Aggregate**:
- Controls wallet verification lifecycle
- Verification proof is tightly coupled
- Simple, single-entity aggregate
- Customer can have multiple wallets (different aggregates)

### Cross-Aggregate Operations

Operations spanning multiple aggregates must use domain services:

```typescript
class MintNFTRewardService {
  async execute(
    businessId: UUID,
    programId: UUID,
    customerId: UUID,
    rewardDefinition: RewardDefinition
  ): Promise<NFTRewardAggregate> {
    // Load smart contract
    const contract = await this.contractRepo.findByProgram(programId);
    if (!contract) {
      throw new Error('Smart contract not deployed');
    }

    // Load customer wallet
    const wallet = await this.walletRepo.findPrimaryByCustomer(
      customerId,
      contract.chain
    );
    if (!wallet) {
      throw new Error('Customer has no verified wallet');
    }

    // Create NFT aggregate
    const metadata = await this.createMetadata(rewardDefinition);
    const nft = NFTRewardAggregate.create(
      businessId,
      programId,
      customerId,
      new ContractAddress(contract.address, contract.chain),
      metadata,
      this.currentUserId
    );

    // Save NFT (PENDING status)
    await this.nftRepo.save(nft);

    // Submit mint transaction
    const txHash = await this.web3Service.mintNFT(
      contract.address,
      wallet.getWalletAddress().address,
      metadata.ipfsHash
    );

    // Track transaction
    await this.txRepo.save(
      new BlockchainTransaction({
        /* ... */
      })
    );

    // Publish events
    await this.eventBus.publishAll(nft.getDomainEvents());
    nft.clearDomainEvents();

    return nft;
  }
}
```

## Concurrency Control

### Optimistic Locking

Use version numbers to prevent lost updates:

```typescript
interface AggregateRoot {
  version: number;
}

// Update with version check
UPDATE nft_rewards
SET status = $1, version = version + 1
WHERE id = $2 AND version = $3;

// If no rows updated, version mismatch (concurrent update)
```

## References

- [ENTITIES.md](./ENTITIES.md)
- [VALUE-OBJECTS.md](./VALUE-OBJECTS.md)
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md)
- [DOMAIN-EVENTS.md](./DOMAIN-EVENTS.md)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
