# Blockchain Domain - Domain Services

**Domain**: Blockchain
**Last Updated**: 2025-11-07
 (NxLoy Platform)

## Overview

Domain Services contain business logic that doesn't naturally fit within a single entity or value object. They orchestrate operations across aggregates and enforce complex business rules.

## Core Domain Services

### 1. MintNFTRewardService

**Purpose**: Handle NFT minting for loyalty rewards

```typescript
class MintNFTRewardService {
  constructor(
    private nftRepo: NFTRewardRepository,
    private contractRepo: SmartContractRepository,
    private walletRepo: WalletConnectionRepository,
    private web3Provider: Web3ProviderService,
    private ipfsService: IPFSStorageService,
    private transactionTracker: TransactionTrackerService,
    private eventBus: EventBus
  ) {}

  async execute(
    businessId: UUID,
    programId: UUID,
    customerId: UUID,
    rewardDefinition: RewardDefinition,
    mintedBy: UUID
  ): Promise<NFTRewardAggregate> {
    // 1. Validate contract exists and is active
    const contract = await this.contractRepo.findByProgramAndType(
      programId,
      ContractType.NFT_REWARD
    );
    if (!contract) {
      throw new SmartContractNotFoundError(programId);
    }
    if (contract.status !== ContractStatus.ACTIVE) {
      throw new SmartContractNotActiveError(contract.id);
    }

    // 2. Validate customer has verified wallet
    const wallet = await this.walletRepo.findPrimaryByCustomerAndChain(
      customerId,
      contract.chain
    );
    if (!wallet || !wallet.isVerified) {
      throw new CustomerWalletNotFoundError(customerId, contract.chain);
    }

    // 3. Upload metadata to IPFS
    const metadata = this.buildMetadata(rewardDefinition);
    const ipfsHash = await this.ipfsService.uploadJSON(metadata);
    const nftMetadata = new NFTMetadata(
      generateUUID(),
      null, // nftId set later
      metadata.name,
      metadata.description,
      metadata.image,
      metadata.externalUrl,
      metadata.animationUrl,
      metadata.attributes,
      ipfsHash.hash,
      new Date()
    );

    // 4. Create NFT aggregate (PENDING status)
    const nft = NFTRewardAggregate.create(
      businessId,
      programId,
      customerId,
      new ContractAddress(contract.address, contract.chain),
      nftMetadata,
      mintedBy
    );

    // 5. Save NFT to database
    await this.nftRepo.save(nft);

    // 6. Submit mint transaction
    const recipientAddress = wallet.getWalletAddress();
    const txHash = await this.web3Provider.mintNFT(
      contract.address,
      contract.chain,
      recipientAddress.address,
      ipfsHash.toURL()
    );

    // 7. Track transaction
    await this.transactionTracker.track(
      new BlockchainTransaction({
        id: generateUUID(),
        businessId,
        entityType: 'NFT',
        entityId: nft.id,
        transactionHash: txHash.hash,
        chain: contract.chain,
        fromAddress: contract.address,
        toAddress: recipientAddress.address,
        type: TransactionType.MINT_NFT,
        status: TransactionStatus.PENDING,
        confirmations: 0,
        submittedAt: new Date(),
        retryCount: 0,
        maxRetries: 3,
        metadata: { nftId: nft.id, ipfsHash: ipfsHash.hash },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    // 8. Publish events
    await this.eventBus.publishAll(nft.getDomainEvents());
    nft.clearDomainEvents();

    return nft;
  }

  private buildMetadata(rewardDefinition: RewardDefinition): any {
    return {
      name: rewardDefinition.name,
      description: rewardDefinition.description,
      image: rewardDefinition.imageURL,
      externalUrl: rewardDefinition.externalURL,
      attributes: rewardDefinition.attributes.map((attr) => ({
        trait_type: attr.traitType,
        value: attr.value,
        display_type: attr.displayType,
      })),
    };
  }
}
```

**Business Rules**:
- Contract must exist and be active
- Customer must have verified wallet on correct chain
- Metadata must be uploaded to IPFS before minting
- Transaction must be tracked for confirmation
- NFT saved as PENDING until transaction confirms

---

### 2. ConnectWalletService

**Purpose**: Handle wallet connection and verification

```typescript
class ConnectWalletService {
  constructor(
    private walletRepo: WalletConnectionRepository,
    private customerRepo: CustomerRepository,
    private nonceGenerator: NonceGenerator,
    private eventBus: EventBus
  ) {}

  async initiateConnection(
    customerId: UUID,
    walletAddress: string,
    chain: BlockchainNetwork,
    walletType: WalletType
  ): Promise<{ nonce: string; message: string }> {
    // 1. Validate customer exists
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    // 2. Validate wallet address
    const validatedAddress = new WalletAddress(walletAddress, chain);

    // 3. Check for existing connection
    const existing = await this.walletRepo.findByAddressAndChain(
      validatedAddress.address,
      chain
    );
    if (existing && existing.customerId !== customerId) {
      throw new WalletAlreadyConnectedError(walletAddress);
    }

    // 4. Generate nonce
    const nonce = this.nonceGenerator.generate();

    // 5. Create message to sign
    const message = SignatureProof.createMessage(
      nonce,
      validatedAddress.toChecksumAddress()
    );

    // 6. Create or update wallet connection
    let connection: WalletConnectionAggregate;
    if (existing && existing.customerId === customerId) {
      // Update existing connection with new nonce
      connection = existing;
      (connection as any).nonce = nonce;
    } else {
      // Create new connection
      connection = WalletConnectionAggregate.create(
        customerId,
        validatedAddress,
        walletType,
        nonce
      );
      await this.walletRepo.save(connection);
    }

    // 7. Publish events
    await this.eventBus.publishAll(connection.getDomainEvents());
    connection.clearDomainEvents();

    return { nonce, message };
  }

  async verifyConnection(
    customerId: UUID,
    walletAddress: string,
    chain: BlockchainNetwork,
    signature: string,
    nonce: string
  ): Promise<WalletConnectionAggregate> {
    // 1. Find wallet connection
    const connection = await this.walletRepo.findByAddressAndChain(
      walletAddress,
      chain
    );
    if (!connection) {
      throw new WalletConnectionNotFoundError(walletAddress);
    }
    if (connection.customerId !== customerId) {
      throw new WalletOwnershipMismatchError();
    }

    // 2. Create signature proof
    const message = SignatureProof.createMessage(
      nonce,
      connection.getWalletAddress().toChecksumAddress()
    );
    const proof = new SignatureProof(signature, message, nonce, new Date());

    // 3. Verify signature
    connection.verify(proof);

    // 4. Check if should be primary
    const existingPrimary = await this.walletRepo.findPrimaryByCustomerAndChain(
      customerId,
      chain
    );
    if (!existingPrimary) {
      connection.markAsPrimary();
    }

    // 5. Save
    await this.walletRepo.save(connection);

    // 6. Publish events
    await this.eventBus.publishAll(connection.getDomainEvents());
    connection.clearDomainEvents();

    return connection;
  }
}
```

**Business Rules**:
- Wallet address must be unique per chain
- Nonce must be fresh (generated per connection attempt)
- Signature must be verified before marking as verified
- First verified wallet becomes primary
- Connection expires after 5 minutes if not verified

---

### 3. DeploySmartContractService

**Purpose**: Deploy smart contracts for loyalty programs

```typescript
class DeploySmartContractService {
  constructor(
    private contractRepo: SmartContractRepository,
    private programRepo: LoyaltyProgramRepository,
    private web3Provider: Web3ProviderService,
    private transactionTracker: TransactionTrackerService,
    private eventBus: EventBus
  ) {}

  async deployNFTContract(
    businessId: UUID,
    programId: UUID,
    contractName: string,
    symbol: string,
    chain: BlockchainNetwork,
    deployedBy: UUID
  ): Promise<SmartContract> {
    // 1. Validate program exists
    const program = await this.programRepo.findById(programId);
    if (!program) {
      throw new ProgramNotFoundError(programId);
    }
    if (program.businessId !== businessId) {
      throw new UnauthorizedError('Program does not belong to business');
    }

    // 2. Check for existing contract
    const existing = await this.contractRepo.findByProgramAndType(
      programId,
      ContractType.NFT_REWARD
    );
    if (existing) {
      throw new ContractAlreadyDeployedError(programId);
    }

    // 3. Get contract bytecode and ABI
    const { abi, bytecode } = this.getContractTemplate(ContractType.NFT_REWARD);

    // 4. Submit deployment transaction
    const { txHash, estimatedAddress } = await this.web3Provider.deployContract(
      chain,
      bytecode,
      abi,
      [contractName, symbol] // Constructor args
    );

    // 5. Create smart contract entity
    const contract = new SmartContract({
      id: generateUUID(),
      businessId,
      type: ContractType.NFT_REWARD,
      address: estimatedAddress,
      chain,
      deployedBy,
      deployedAt: new Date(),
      transactionHash: txHash.hash,
      abi: JSON.stringify(abi),
      bytecode,
      isUpgradeable: false,
      status: ContractStatus.DEPLOYING,
      gasUsed: 0, // Updated after confirmation
      auditStatus: AuditStatus.NOT_AUDITED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 6. Save contract
    await this.contractRepo.save(contract);

    // 7. Track transaction
    await this.transactionTracker.track(
      new BlockchainTransaction({
        id: generateUUID(),
        businessId,
        entityType: 'CONTRACT',
        entityId: contract.id,
        transactionHash: txHash.hash,
        chain,
        fromAddress: await this.web3Provider.getDeployerAddress(chain),
        toAddress: estimatedAddress,
        type: TransactionType.DEPLOY_CONTRACT,
        status: TransactionStatus.PENDING,
        confirmations: 0,
        submittedAt: new Date(),
        retryCount: 0,
        maxRetries: 3,
        metadata: { contractType: ContractType.NFT_REWARD },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    return contract;
  }

  private getContractTemplate(
    type: ContractType
  ): { abi: any[]; bytecode: string } {
    // Load pre-compiled contract from /packages/blockchain-contracts/
    // In actual implementation, load from filesystem
    return {
      abi: [],
      bytecode: '0x...',
    };
  }
}
```

**Business Rules**:
- Only one contract per program per type
- Contract deployment requires gas fee
- Deployer must have sufficient balance
- Contract must be audited before production use
- Deployment transaction must be tracked

---

### 4. TransferNFTService

**Purpose**: Transfer NFT between customers

```typescript
class TransferNFTService {
  constructor(
    private nftRepo: NFTRewardRepository,
    private walletRepo: WalletConnectionRepository,
    private web3Provider: Web3ProviderService,
    private transactionTracker: TransactionTrackerService,
    private eventBus: EventBus
  ) {}

  async execute(
    nftId: UUID,
    fromCustomerId: UUID,
    toCustomerId: UUID,
    initiatedBy: UUID
  ): Promise<NFTRewardAggregate> {
    // 1. Load NFT
    const nft = await this.nftRepo.findById(nftId);
    if (!nft) {
      throw new NFTNotFoundError(nftId);
    }

    // 2. Validate ownership
    if (nft.getOwner() !== fromCustomerId) {
      throw new UnauthorizedError('NFT does not belong to sender');
    }
    if (initiatedBy !== fromCustomerId) {
      throw new UnauthorizedError('Only owner can transfer NFT');
    }

    // 3. Validate status
    if (!nft.isMinted()) {
      throw new NFTNotMintedError(nftId);
    }
    if (nft.isBurned()) {
      throw new NFTBurnedError(nftId);
    }

    // 4. Get sender wallet
    const fromWallet = await this.walletRepo.findPrimaryByCustomerAndChain(
      fromCustomerId,
      nft.contractAddress.chain
    );
    if (!fromWallet) {
      throw new CustomerWalletNotFoundError(
        fromCustomerId,
        nft.contractAddress.chain
      );
    }

    // 5. Get recipient wallet
    const toWallet = await this.walletRepo.findPrimaryByCustomerAndChain(
      toCustomerId,
      nft.contractAddress.chain
    );
    if (!toWallet) {
      throw new CustomerWalletNotFoundError(
        toCustomerId,
        nft.contractAddress.chain
      );
    }

    // 6. Submit transfer transaction
    const txHash = await this.web3Provider.transferNFT(
      nft.contractAddress.address,
      nft.contractAddress.chain,
      nft.getTokenId(),
      fromWallet.getWalletAddress().address,
      toWallet.getWalletAddress().address
    );

    // 7. Track transaction (transfer will be confirmed asynchronously)
    await this.transactionTracker.track(
      new BlockchainTransaction({
        id: generateUUID(),
        businessId: nft.businessId,
        entityType: 'NFT',
        entityId: nft.id,
        transactionHash: txHash.hash,
        chain: nft.contractAddress.chain,
        fromAddress: fromWallet.getWalletAddress().address,
        toAddress: toWallet.getWalletAddress().address,
        type: TransactionType.TRANSFER_NFT,
        status: TransactionStatus.PENDING,
        confirmations: 0,
        submittedAt: new Date(),
        retryCount: 0,
        maxRetries: 3,
        metadata: {
          nftId: nft.id,
          tokenId: nft.getTokenId(),
          fromCustomerId,
          toCustomerId,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    return nft;
  }
}
```

**Business Rules**:
- Only owner can transfer NFT
- Both sender and recipient must have verified wallets
- NFT must be minted (not PENDING or FAILED)
- Cannot transfer burned NFTs
- Transfer requires gas fee (paid by sender)

---

### 5. IssueTokenService

**Purpose**: Issue loyalty tokens to customers

```typescript
class IssueTokenService {
  constructor(
    private tokenProgramRepo: TokenProgramRepository,
    private enrollmentRepo: CustomerEnrollmentRepository,
    private web3Provider: Web3ProviderService,
    private transactionTracker: TransactionTrackerService,
    private eventBus: EventBus
  ) {}

  async execute(
    programId: UUID,
    customerId: UUID,
    amount: number,
    reason: string
  ): Promise<void> {
    // 1. Load token program
    const tokenProgram = await this.tokenProgramRepo.findByProgram(programId);
    if (!tokenProgram) {
      throw new TokenProgramNotFoundError(programId);
    }

    // 2. Validate status
    if (tokenProgram.status !== TokenProgramStatus.ACTIVE) {
      throw new TokenProgramNotActiveError(tokenProgram.id);
    }

    // 3. Validate enrollment
    const enrollment = await this.enrollmentRepo.findByCustomerAndProgram(
      customerId,
      programId
    );
    if (!enrollment) {
      throw new NotEnrolledError(customerId, programId);
    }

    // 4. Create token amount
    const tokenAmount = TokenAmount.fromHumanReadable(
      amount,
      tokenProgram.decimals,
      tokenProgram.symbol
    );

    // 5. Check if can mint
    if (!tokenProgram.canMint(tokenAmount)) {
      throw new TokenSupplyExceededError(tokenProgram.id);
    }

    // 6. Mint tokens (updates aggregate)
    tokenProgram.mint(tokenAmount, customerId);

    // 7. Save token program
    await this.tokenProgramRepo.save(tokenProgram);

    // 8. Submit mint transaction (if on-chain)
    if (tokenProgram.getContractAddress()) {
      const wallet = await this.getCustomerWallet(
        customerId,
        tokenProgram.chain
      );
      const txHash = await this.web3Provider.mintToken(
        tokenProgram.getContractAddress()!.address,
        tokenProgram.chain,
        wallet.address,
        tokenAmount.amount
      );

      // Track transaction
      await this.transactionTracker.track(
        new BlockchainTransaction({
          id: generateUUID(),
          businessId: tokenProgram.businessId,
          entityType: 'TOKEN',
          entityId: tokenProgram.id,
          transactionHash: txHash.hash,
          chain: tokenProgram.chain,
          fromAddress: tokenProgram.getContractAddress()!.address,
          toAddress: wallet.address,
          type: TransactionType.MINT_TOKEN,
          status: TransactionStatus.PENDING,
          confirmations: 0,
          submittedAt: new Date(),
          retryCount: 0,
          maxRetries: 3,
          metadata: {
            tokenProgramId: tokenProgram.id,
            customerId,
            amount: amount,
            reason,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );
    }

    // 9. Publish events
    await this.eventBus.publishAll(tokenProgram.getDomainEvents());
    tokenProgram.clearDomainEvents();
  }

  private async getCustomerWallet(
    customerId: UUID,
    chain: BlockchainNetwork
  ): Promise<WalletAddress> {
    const wallet = await this.walletRepo.findPrimaryByCustomerAndChain(
      customerId,
      chain
    );
    if (!wallet) {
      throw new CustomerWalletNotFoundError(customerId, chain);
    }
    return wallet.getWalletAddress();
  }
}
```

**Business Rules**:
- Token program must be active
- Customer must be enrolled in program
- Cannot exceed max token supply
- Customer must have verified wallet (for on-chain tokens)
- Minting is recorded on-chain and in database

---

## Domain Service Patterns

### 1. Transaction Orchestration

Domain services orchestrate multi-step operations:
1. Validate preconditions
2. Load required aggregates
3. Execute business logic
4. Save aggregates
5. Publish domain events

### 2. Cross-Aggregate Coordination

When operations span multiple aggregates:
- Use repository pattern to load aggregates
- Maintain transactional boundaries
- Use eventual consistency for cross-domain operations

### 3. External System Integration

Services integrate with external systems:
- Web3 providers (ethers.js, web3.js)
- IPFS storage
- Blockchain explorers
- Gas price oracles

## References

- [AGGREGATES.md](./AGGREGATES.md)
- [REPOSITORIES.md](./REPOSITORIES.md)
- [DOMAIN-EVENTS.md](./DOMAIN-EVENTS.md)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
