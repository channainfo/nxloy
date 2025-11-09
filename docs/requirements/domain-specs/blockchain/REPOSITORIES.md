# Blockchain Domain - Repositories

**Domain**: Blockchain
**Last Updated**: 2025-11-07
 (NxLoy Platform)

## Overview

Repositories provide persistence and retrieval interfaces for aggregates. They abstract database access and ensure aggregates are properly reconstituted from storage.

## Repository Interfaces

### 1. NFTRewardRepository

**Purpose**: Persist and retrieve NFT reward aggregates

```typescript
interface NFTRewardRepository {
  // Create/Update
  save(nft: NFTRewardAggregate): Promise<void>;
  saveMany(nfts: NFTRewardAggregate[]): Promise<void>;

  // Retrieve
  findById(id: UUID): Promise<NFTRewardAggregate | null>;
  findByTokenId(
    contractAddress: string,
    tokenId: number,
    chain: BlockchainNetwork
  ): Promise<NFTRewardAggregate | null>;
  findByCustomer(
    customerId: UUID,
    options?: PaginationOptions
  ): Promise<NFTRewardAggregate[]>;
  findByProgram(
    programId: UUID,
    options?: PaginationOptions
  ): Promise<NFTRewardAggregate[]>;
  findByBusiness(
    businessId: UUID,
    options?: PaginationOptions
  ): Promise<NFTRewardAggregate[]>;
  findByStatus(
    status: NFTStatus,
    options?: PaginationOptions
  ): Promise<NFTRewardAggregate[]>;
  findPendingMints(limit: number): Promise<NFTRewardAggregate[]>;

  // Query
  countByCustomer(customerId: UUID): Promise<number>;
  countByProgram(programId: UUID): Promise<number>;
  existsByTokenId(
    contractAddress: string,
    tokenId: number,
    chain: BlockchainNetwork
  ): Promise<boolean>;

  // Delete
  delete(id: UUID): Promise<void>;
}
```

**Implementation Notes**:
- Use Prisma ORM for database access
- Include NFTMetadata and NFTTransfer[] when loading
- Support pagination for list operations
- Implement caching for frequently accessed NFTs
- Index on: customer_id, program_id, contract_address + token_id, status

---

### 2. TokenProgramRepository

**Purpose**: Persist and retrieve token program aggregates

```typescript
interface TokenProgramRepository {
  // Create/Update
  save(program: TokenProgramAggregate): Promise<void>;

  // Retrieve
  findById(id: UUID): Promise<TokenProgramAggregate | null>;
  findByProgram(programId: UUID): Promise<TokenProgramAggregate | null>;
  findByBusiness(
    businessId: UUID,
    options?: PaginationOptions
  ): Promise<TokenProgramAggregate[]>;
  findByContract(
    contractAddress: string,
    chain: BlockchainNetwork
  ): Promise<TokenProgramAggregate | null>;
  findActivePrograms(): Promise<TokenProgramAggregate[]>;

  // Query
  countByBusiness(businessId: UUID): Promise<number>;
  existsBySymbol(symbol: string, businessId: UUID): Promise<boolean>;

  // Delete
  delete(id: UUID): Promise<void>;
}
```

**Implementation Notes**:
- Validate unique symbol per business
- Cache active token programs
- Index on: business_id, program_id, contract_address + chain, status

---

### 3. SmartContractRepository

**Purpose**: Persist and retrieve smart contract records

```typescript
interface SmartContractRepository {
  // Create/Update
  save(contract: SmartContract): Promise<void>;

  // Retrieve
  findById(id: UUID): Promise<SmartContract | null>;
  findByAddress(
    address: string,
    chain: BlockchainNetwork
  ): Promise<SmartContract | null>;
  findByProgramAndType(
    programId: UUID,
    type: ContractType
  ): Promise<SmartContract | null>;
  findByBusiness(
    businessId: UUID,
    options?: PaginationOptions
  ): Promise<SmartContract[]>;
  findByType(
    type: ContractType,
    options?: PaginationOptions
  ): Promise<SmartContract[]>;
  findUnauditedContracts(): Promise<SmartContract[]>;

  // Query
  countByBusiness(businessId: UUID): Promise<number>;
  existsByAddress(address: string, chain: BlockchainNetwork): Promise<boolean>;

  // Delete
  delete(id: UUID): Promise<void>;
}
```

**Implementation Notes**:
- Store ABI and bytecode as JSON/text
- Validate unique contract address per chain
- Flag contracts requiring audit
- Index on: business_id, address + chain, type, audit_status

---

### 4. WalletConnectionRepository

**Purpose**: Persist and retrieve wallet connections

```typescript
interface WalletConnectionRepository {
  // Create/Update
  save(connection: WalletConnectionAggregate): Promise<void>;

  // Retrieve
  findById(id: UUID): Promise<WalletConnectionAggregate | null>;
  findByAddressAndChain(
    address: string,
    chain: BlockchainNetwork
  ): Promise<WalletConnectionAggregate | null>;
  findByCustomer(
    customerId: UUID,
    options?: PaginationOptions
  ): Promise<WalletConnectionAggregate[]>;
  findPrimaryByCustomerAndChain(
    customerId: UUID,
    chain: BlockchainNetwork
  ): Promise<WalletConnectionAggregate | null>;
  findVerifiedByCustomer(
    customerId: UUID
  ): Promise<WalletConnectionAggregate[]>;

  // Query
  countByCustomer(customerId: UUID): Promise<number>;
  existsByAddress(address: string, chain: BlockchainNetwork): Promise<boolean>;

  // Update
  unmarkAllAsPrimary(customerId: UUID, chain: BlockchainNetwork): Promise<void>;

  // Delete
  delete(id: UUID): Promise<void>;
}
```

**Implementation Notes**:
- Enforce unique wallet address per chain
- Only one primary wallet per customer per chain
- Index on: customer_id, address + chain, is_primary, is_verified

---

### 5. BlockchainTransactionRepository

**Purpose**: Track blockchain transactions

```typescript
interface BlockchainTransactionRepository {
  // Create/Update
  save(transaction: BlockchainTransaction): Promise<void>;
  saveMany(transactions: BlockchainTransaction[]): Promise<void>;

  // Retrieve
  findById(id: UUID): Promise<BlockchainTransaction | null>;
  findByHash(
    hash: string,
    chain: BlockchainNetwork
  ): Promise<BlockchainTransaction | null>;
  findByEntity(
    entityType: string,
    entityId: UUID
  ): Promise<BlockchainTransaction[]>;
  findPendingTransactions(limit: number): Promise<BlockchainTransaction[]>;
  findFailedTransactions(limit: number): Promise<BlockchainTransaction[]>;
  findByBusiness(
    businessId: UUID,
    options?: PaginationOptions
  ): Promise<BlockchainTransaction[]>;

  // Query
  countByStatus(status: TransactionStatus): Promise<number>;
  calculateTotalGasCost(
    businessId: UUID,
    startDate: Date,
    endDate: Date
  ): Promise<number>;

  // Update
  markAsConfirmed(
    id: UUID,
    blockNumber: number,
    gasUsed: number
  ): Promise<void>;
  markAsFailed(id: UUID, errorMessage: string): Promise<void>;
  incrementRetryCount(id: UUID): Promise<void>;

  // Delete
  delete(id: UUID): Promise<void>;
}
```

**Implementation Notes**:
- Poll for pending transactions
- Retry failed transactions (up to max retries)
- Track gas costs for billing
- Index on: transaction_hash + chain, entity_type + entity_id, status, submitted_at

---

## Repository Implementation Pattern

### Prisma Implementation Example

```typescript
@Injectable()
export class PrismaNFTRewardRepository implements NFTRewardRepository {
  constructor(private prisma: PrismaClient) {}

  async save(nft: NFTRewardAggregate): Promise<void> {
    await this.prisma.nftReward.upsert({
      where: { id: nft.id },
      create: {
        id: nft.id,
        businessId: nft.businessId,
        programId: nft.programId,
        customerId: nft.getOwner(),
        tokenId: nft.getTokenId(),
        contractAddress: nft.contractAddress.address,
        chain: nft.contractAddress.chain,
        status: nft.status,
        transactionHash: nft.transactionHash?.hash,
        mintedAt: nft.mintedAt,
        mintedBy: nft.mintedBy,
        createdAt: nft.createdAt,
        updatedAt: nft.updatedAt,
        metadata: {
          create: this.toMetadataData(nft.getMetadata()),
        },
        transferHistory: {
          createMany: {
            data: nft.getTransferHistory().map(this.toTransferData),
          },
        },
      },
      update: {
        customerId: nft.getOwner(),
        tokenId: nft.getTokenId(),
        status: nft.status,
        transactionHash: nft.transactionHash?.hash,
        mintedAt: nft.mintedAt,
        updatedAt: nft.updatedAt,
      },
    });
  }

  async findById(id: UUID): Promise<NFTRewardAggregate | null> {
    const record = await this.prisma.nftReward.findUnique({
      where: { id },
      include: {
        metadata: true,
        transferHistory: true,
      },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  private toDomain(record: any): NFTRewardAggregate {
    // Reconstitute aggregate from database record
    // Use private constructor or reconstitution method
    return NFTRewardAggregate.reconstitute({
      id: record.id,
      businessId: record.businessId,
      programId: record.programId,
      customerId: record.customerId,
      tokenId: record.tokenId,
      contractAddress: new ContractAddress(
        record.contractAddress,
        record.chain
      ),
      status: record.status,
      metadata: this.toMetadataDomain(record.metadata),
      transferHistory: record.transferHistory.map(this.toTransferDomain),
      transactionHash: record.transactionHash
        ? new TransactionHash(record.transactionHash, record.chain)
        : null,
      mintedAt: record.mintedAt,
      mintedBy: record.mintedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toMetadataData(metadata: NFTMetadata): any {
    return {
      id: metadata.id,
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      externalUrl: metadata.externalUrl,
      animationUrl: metadata.animationUrl,
      attributes: metadata.attributes,
      ipfsHash: metadata.ipfsHash,
      createdAt: metadata.createdAt,
    };
  }

  private toTransferData(transfer: NFTTransfer): any {
    return {
      id: transfer.id,
      fromAddress: transfer.fromAddress,
      toAddress: transfer.toAddress,
      transactionHash: transfer.transactionHash,
      transferType: transfer.transferType,
      transferredAt: transfer.transferredAt,
      blockNumber: transfer.blockNumber,
      gasFeeWei: transfer.gasFeeWei,
      initiatedBy: transfer.initiatedBy,
      createdAt: transfer.createdAt,
    };
  }

  // Additional methods...
}
```

## Caching Strategy

### Cache Frequently Accessed Data

```typescript
@Injectable()
export class CachedSmartContractRepository implements SmartContractRepository {
  constructor(
    private baseRepo: SmartContractRepository,
    private cache: CacheService
  ) {}

  async findByAddress(
    address: string,
    chain: BlockchainNetwork
  ): Promise<SmartContract | null> {
    const cacheKey = `contract:${chain}:${address}`;

    // Check cache first
    const cached = await this.cache.get<SmartContract>(cacheKey);
    if (cached) return cached;

    // Load from database
    const contract = await this.baseRepo.findByAddress(address, chain);

    // Store in cache (5 minutes TTL)
    if (contract) {
      await this.cache.set(cacheKey, contract, 300);
    }

    return contract;
  }

  async save(contract: SmartContract): Promise<void> {
    await this.baseRepo.save(contract);

    // Invalidate cache
    const cacheKey = `contract:${contract.chain}:${contract.address}`;
    await this.cache.delete(cacheKey);
  }
}
```

## Transaction Management

### Unit of Work Pattern

```typescript
@Injectable()
export class BlockchainUnitOfWork {
  constructor(
    private prisma: PrismaClient,
    private nftRepo: NFTRewardRepository,
    private txRepo: BlockchainTransactionRepository
  ) {}

  async executeInTransaction<T>(
    work: (repos: RepositoryRegistry) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const repos: RepositoryRegistry = {
        nfts: this.nftRepo,
        transactions: this.txRepo,
        // ... other repos
      };

      return await work(repos);
    });
  }
}

// Usage
await unitOfWork.executeInTransaction(async (repos) => {
  const nft = await repos.nfts.findById(nftId);
  nft.markAsMinted(tokenId, txHash, blockNumber);
  await repos.nfts.save(nft);

  await repos.transactions.markAsConfirmed(txId, blockNumber, gasUsed);
});
```

## References

- [AGGREGATES.md](./AGGREGATES.md)
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md)
- [ENTITIES.md](./ENTITIES.md)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
