# Blockchain Domain - Domain Events

**Domain**: Blockchain
**Last Updated**: 2025-11-07
 (NxLoy Platform)

## Overview

Domain events represent significant occurrences within the Blockchain domain. They enable loose coupling between bounded contexts and support event-driven architecture.

## Event Structure

All domain events follow this structure:

```typescript
interface DomainEvent {
  eventId: UUID;
  eventType: string;
  aggregateId: UUID;
  aggregateType: string;
  occurredAt: Date;
  version: number;
  payload: Record<string, any>;
  metadata: EventMetadata;
}

interface EventMetadata {
  causationId?: UUID; // ID of command that caused this event
  correlationId?: UUID; // ID linking related events
  userId?: UUID; // User who triggered the event
  businessId: UUID;
}
```

## NFT Reward Events

### 1. blockchain.nft.pending

**Published**: When NFT mint request is created

```typescript
interface NFTPendingMintEvent extends DomainEvent {
  eventType: 'blockchain.nft.pending';
  payload: {
    nftId: UUID;
    businessId: UUID;
    programId: UUID;
    customerId: UUID;
    contractAddress: string;
    chain: BlockchainNetwork;
    metadata: {
      name: string;
      description: string;
      image: string;
      ipfsHash: string;
    };
  };
}
```

**Subscribers**:
- Rewards Service: Track pending rewards
- Notification Service: Notify customer of pending mint
- Analytics Service: Track mint requests

---

### 2. blockchain.nft.minted

**Published**: When NFT is successfully minted on-chain

```typescript
interface NFTMintedEvent extends DomainEvent {
  eventType: 'blockchain.nft.minted';
  payload: {
    nftId: UUID;
    businessId: UUID;
    programId: UUID;
    customerId: UUID;
    tokenId: number;
    contractAddress: string;
    chain: BlockchainNetwork;
    transactionHash: string;
    blockNumber: number;
    mintedAt: Date;
    explorerUrl: string; // e.g., https://polygonscan.com/tx/0x...
  };
}
```

**Subscribers**:
- Rewards Service: Mark reward as delivered
- Notification Service: Congratulate customer
- Analytics Service: Track successful mints
- Loyalty Service: Award bonus points for minting

---

### 3. blockchain.nft.transferred

**Published**: When NFT ownership is transferred

```typescript
interface NFTTransferredEvent extends DomainEvent {
  eventType: 'blockchain.nft.transferred';
  payload: {
    nftId: UUID;
    businessId: UUID;
    fromCustomerId: UUID;
    toCustomerId: UUID;
    fromAddress: string;
    toAddress: string;
    transactionHash: string;
    blockNumber: number;
    transferredAt: Date;
  };
}
```

**Subscribers**:
- Rewards Service: Update ownership records
- Analytics Service: Track secondary market activity
- Notification Service: Notify both parties

---

### 4. blockchain.nft.burned

**Published**: When NFT is permanently destroyed

```typescript
interface NFTBurnedEvent extends DomainEvent {
  eventType: 'blockchain.nft.burned';
  payload: {
    nftId: UUID;
    businessId: UUID;
    customerId: UUID;
    transactionHash: string;
    burnedAt: Date;
  };
}
```

**Subscribers**:
- Rewards Service: Mark NFT as burned
- Analytics Service: Track burn rate

---

### 5. blockchain.nft.mint_failed

**Published**: When NFT minting fails

```typescript
interface NFTMintFailedEvent extends DomainEvent {
  eventType: 'blockchain.nft.mint_failed';
  payload: {
    nftId: UUID;
    businessId: UUID;
    errorMessage: string;
    errorCode?: string;
    failedAt: Date;
  };
}
```

**Subscribers**:
- Rewards Service: Retry or compensate
- Notification Service: Inform support team
- Analytics Service: Track failure rate

---

## Token Program Events

### 6. blockchain.token_program.created

**Published**: When token program is created

```typescript
interface TokenProgramCreatedEvent extends DomainEvent {
  eventType: 'blockchain.token_program.created';
  payload: {
    tokenProgramId: UUID;
    businessId: UUID;
    programId: UUID;
    name: string;
    symbol: string;
    decimals: number;
    maxSupply: string;
    chain: BlockchainNetwork;
  };
}
```

**Subscribers**:
- Loyalty Service: Link token program to loyalty program
- Analytics Service: Track token program creation

---

### 7. blockchain.token_program.deployed

**Published**: When token contract is deployed

```typescript
interface TokenProgramDeployedEvent extends DomainEvent {
  eventType: 'blockchain.token_program.deployed';
  payload: {
    tokenProgramId: UUID;
    businessId: UUID;
    contractAddress: string;
    chain: BlockchainNetwork;
    transactionHash: string;
    deployedAt: Date;
  };
}
```

**Subscribers**:
- Loyalty Service: Enable token-based rewards
- Notification Service: Notify business owner
- Analytics Service: Track contract deployments

---

### 8. blockchain.token.minted

**Published**: When tokens are minted to customer

```typescript
interface TokenMintedEvent extends DomainEvent {
  eventType: 'blockchain.token.minted';
  payload: {
    tokenProgramId: UUID;
    businessId: UUID;
    recipientId: UUID;
    amount: number;
    symbol: string;
    transactionHash?: string;
    mintedAt: Date;
  };
}
```

**Subscribers**:
- Loyalty Service: Update customer balance
- Notification Service: Notify customer
- Analytics Service: Track token distribution

---

### 9. blockchain.token.transferred

**Published**: When tokens are transferred between addresses

```typescript
interface TokenTransferredEvent extends DomainEvent {
  eventType: 'blockchain.token.transferred';
  payload: {
    tokenProgramId: UUID;
    businessId: UUID;
    fromCustomerId: UUID;
    toCustomerId: UUID;
    amount: number;
    symbol: string;
    transactionHash: string;
    transferredAt: Date;
  };
}
```

**Subscribers**:
- Loyalty Service: Update balances
- Analytics Service: Track token circulation

---

### 10. blockchain.token.burned

**Published**: When tokens are burned (removed from supply)

```typescript
interface TokenBurnedEvent extends DomainEvent {
  eventType: 'blockchain.token.burned';
  payload: {
    tokenProgramId: UUID;
    businessId: UUID;
    amount: number;
    symbol: string;
    burnedAt: Date;
  };
}
```

**Subscribers**:
- Analytics Service: Track token deflation

---

## Smart Contract Events

### 11. blockchain.smart_contract.deployed

**Published**: When smart contract is deployed

```typescript
interface SmartContractDeployedEvent extends DomainEvent {
  eventType: 'blockchain.smart_contract.deployed';
  payload: {
    contractId: UUID;
    businessId: UUID;
    contractType: ContractType;
    address: string;
    chain: BlockchainNetwork;
    transactionHash: string;
    gasUsed: number;
    gasFeeUSD: number;
    deployedAt: Date;
  };
}
```

**Subscribers**:
- Billing Service: Charge for deployment gas
- Notification Service: Notify business owner
- Analytics Service: Track contract deployments

---

## Wallet Events

### 12. blockchain.wallet.connected

**Published**: When customer connects wallet

```typescript
interface WalletConnectedEvent extends DomainEvent {
  eventType: 'blockchain.wallet.connected';
  payload: {
    walletConnectionId: UUID;
    customerId: UUID;
    walletAddress: string;
    chain: BlockchainNetwork;
    walletType: WalletType;
    connectedAt: Date;
  };
}
```

**Subscribers**:
- Customer Service: Track wallet connections
- Analytics Service: Track wallet adoption

---

### 13. blockchain.wallet.verified

**Published**: When wallet connection is verified via signature

```typescript
interface WalletVerifiedEvent extends DomainEvent {
  eventType: 'blockchain.wallet.verified';
  payload: {
    walletConnectionId: UUID;
    customerId: UUID;
    walletAddress: string;
    chain: BlockchainNetwork;
    verifiedAt: Date;
  };
}
```

**Subscribers**:
- Notification Service: Congratulate customer
- Analytics Service: Track verification rate

---

### 14. blockchain.wallet.disconnected

**Published**: When wallet is disconnected

```typescript
interface WalletDisconnectedEvent extends DomainEvent {
  eventType: 'blockchain.wallet.disconnected';
  payload: {
    walletConnectionId: UUID;
    customerId: UUID;
    walletAddress: string;
    disconnectedAt: Date;
  };
}
```

**Subscribers**:
- Customer Service: Remove wallet access
- Analytics Service: Track churn

---

## Transaction Events

### 15. blockchain.transaction.confirmed

**Published**: When blockchain transaction is confirmed

```typescript
interface TransactionConfirmedEvent extends DomainEvent {
  eventType: 'blockchain.transaction.confirmed';
  payload: {
    transactionId: UUID;
    entityType: string; // 'NFT', 'TOKEN', 'CONTRACT'
    entityId: UUID;
    transactionHash: string;
    chain: BlockchainNetwork;
    blockNumber: number;
    confirmations: number;
    gasUsed: number;
    gasFeeUSD: number;
    confirmedAt: Date;
  };
}
```

**Subscribers**:
- Billing Service: Track gas costs
- Analytics Service: Track transaction metrics
- Notification Service: Notify relevant parties

---

### 16. blockchain.transaction.failed

**Published**: When blockchain transaction fails

```typescript
interface TransactionFailedEvent extends DomainEvent {
  eventType: 'blockchain.transaction.failed';
  payload: {
    transactionId: UUID;
    entityType: string;
    entityId: UUID;
    transactionHash: string;
    chain: BlockchainNetwork;
    errorMessage: string;
    gasUsed?: number;
    failedAt: Date;
    willRetry: boolean;
    retryCount: number;
  };
}
```

**Subscribers**:
- Support Service: Alert for manual intervention
- Analytics Service: Track failure rate
- Notification Service: Notify business owner

---

## Event Publishing

### Event Bus Implementation

```typescript
@Injectable()
export class EventBus {
  constructor(
    private redis: RedisClient,
    private eventStore: EventStore
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    // 1. Store event in event store
    await this.eventStore.append(event);

    // 2. Publish to Redis Pub/Sub
    await this.redis.publish(
      `domain-events:${event.eventType}`,
      JSON.stringify(event)
    );

    // 3. Log event
    console.log(`Published event: ${event.eventType}`, event.eventId);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }
}
```

### Event Subscription

```typescript
@Injectable()
export class BlockchainEventSubscriber {
  constructor(
    private redis: RedisClient,
    private notificationService: NotificationService
  ) {}

  async subscribe(): Promise<void> {
    await this.redis.subscribe('domain-events:blockchain.*');

    this.redis.on('message', async (channel, message) => {
      const event: DomainEvent = JSON.parse(message);

      switch (event.eventType) {
        case 'blockchain.nft.minted':
          await this.handleNFTMinted(event as NFTMintedEvent);
          break;
        case 'blockchain.wallet.verified':
          await this.handleWalletVerified(event as WalletVerifiedEvent);
          break;
        // ... other cases
      }
    });
  }

  private async handleNFTMinted(event: NFTMintedEvent): Promise<void> {
    await this.notificationService.sendNFTMintedEmail(
      event.payload.customerId,
      event.payload.explorerUrl
    );
  }
}
```

## Event Sourcing (Optional)

For critical aggregates, consider full event sourcing:

```typescript
class NFTRewardEventSourcedAggregate {
  private events: DomainEvent[] = [];

  public static reconstitute(events: DomainEvent[]): NFTRewardEventSourcedAggregate {
    const nft = new NFTRewardEventSourcedAggregate();
    events.forEach((event) => nft.apply(event, false));
    return nft;
  }

  private apply(event: DomainEvent, isNew: boolean): void {
    switch (event.eventType) {
      case 'blockchain.nft.pending':
        this.applyPending(event as NFTPendingMintEvent);
        break;
      case 'blockchain.nft.minted':
        this.applyMinted(event as NFTMintedEvent);
        break;
      // ... other cases
    }

    if (isNew) {
      this.events.push(event);
    }
  }

  public getUncommittedEvents(): DomainEvent[] {
    return [...this.events];
  }

  public clearEvents(): void {
    this.events = [];
  }
}
```

## References

- [AGGREGATES.md](./AGGREGATES.md)
- [DOMAIN-SERVICES.md](./DOMAIN-SERVICES.md)
- [AsyncAPI Specification](../../contracts/events.asyncapi.yaml)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
