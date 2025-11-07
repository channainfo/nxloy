# Subscription Management - Blockchain Integration

**Feature**: Subscription Management
**Version**: 1.0.0
**Status**: 🟡 Phase 4 Feature
**Last Updated**: 2025-11-07

## Overview

Blockchain integration enables NFT-based subscription memberships, token-based payment plans, and decentralized subscription management with smart contracts.

**Phase**: Phase 4 (Months 10-12)
**Priority**: P3 (Nice-to-have)
**Dependencies**: Subscription Management (Phase 3), Blockchain Domain (Phase 4)

## Blockchain Features

### 1. NFT Subscription Memberships

**Purpose**: Represent subscription status as an NFT

**Benefits**:
- **Transferable**: Can sell/gift subscription
- **Tradeable**: Secondary market for subscriptions
- **Portable**: Works across wallets/platforms
- **Proof of Membership**: Visible in wallet

**Example**:
- Customer subscribes to "VIP Coffee Club" ($19.99/month)
- Receives NFT membership card in wallet
- NFT grants access to VIP benefits
- Can sell NFT on OpenSea if no longer needed

**NFT Metadata**:
```json
{
  "name": "VIP Coffee Club Membership",
  "description": "Monthly subscription with exclusive benefits",
  "image": "ipfs://QmVIP.../membership-card.png",
  "attributes": [
    { "trait_type": "Tier", "value": "VIP" },
    { "trait_type": "Status", "value": "Active" },
    { "trait_type": "Expiration", "value": "2026-12-07", "display_type": "date" },
    { "trait_type": "Auto-Renew", "value": "Yes" }
  ]
}
```

---

### 2. Token-Based Subscription Payment

**Purpose**: Pay subscription fees with blockchain tokens

**Benefits**:
- **Crypto-Native**: No fiat payment required
- **Instant Settlement**: No payment processing delays
- **Lower Fees**: Avoid credit card fees (2-3%)
- **Global**: Works worldwide without currency conversion

**Payment Options**:
```typescript
{
  "subscriptionId": "sub-123",
  "name": "VIP Coffee Club",
  "pricing": {
    // Traditional payment
    "fiat": {
      "amount": 19.99,
      "currency": "USD",
      "interval": "MONTHLY"
    },

    // Token payment
    "blockchain": {
      "enabled": true,
      "tokenAmount": "400000000000000000000", // 400 COFFEE tokens
      "tokenSymbol": "COFFEE",
      "chain": "POLYGON",
      "interval": "MONTHLY"
    }
  }
}
```

**Customer Choice**:
```
VIP Coffee Club Subscription

Choose Payment Method:
○ Credit Card: $19.99/month
● Crypto: 400 COFFEE tokens/month (Save 2% processing fees)

[Subscribe Now]
```

---

### 3. Smart Contract Auto-Renewal

**Purpose**: Automate subscription renewals via smart contract

**Benefits**:
- **Trustless**: No manual billing
- **Transparent**: Renewal logic visible on-chain
- **Flexible**: Cancel anytime on-chain
- **No Failed Payments**: Pull payment from wallet balance

**Smart Contract**:
```solidity
contract SubscriptionManager {
  struct Subscription {
    address subscriber;
    uint256 tokenAmount;
    uint256 interval; // seconds
    uint256 nextPayment;
    bool isActive;
  }

  mapping(uint256 => Subscription) public subscriptions;

  function renewSubscription(uint256 subscriptionId) external {
    Subscription storage sub = subscriptions[subscriptionId];
    require(sub.isActive, "Subscription not active");
    require(block.timestamp >= sub.nextPayment, "Not due yet");

    // Pull payment from subscriber
    token.transferFrom(sub.subscriber, address(this), sub.tokenAmount);

    // Update next payment date
    sub.nextPayment = block.timestamp + sub.interval;

    emit SubscriptionRenewed(subscriptionId, block.timestamp);
  }

  function cancelSubscription(uint256 subscriptionId) external {
    Subscription storage sub = subscriptions[subscriptionId];
    require(msg.sender == sub.subscriber, "Not subscriber");

    sub.isActive = false;
    emit SubscriptionCancelled(subscriptionId, block.timestamp);
  }
}
```

---

### 4. Dynamic NFT Memberships

**Purpose**: NFT metadata updates based on subscription status

**Benefits**:
- **Real-Time Status**: NFT shows current subscription state
- **Visual Indicator**: Different images for active/expired
- **Automatic Updates**: No manual intervention needed

**Dynamic Metadata Example**:

**Active Subscription**:
```json
{
  "name": "VIP Coffee Club - ACTIVE",
  "image": "ipfs://QmActive.../gold-card.png",
  "attributes": [
    { "trait_type": "Status", "value": "Active" },
    { "trait_type": "Days Remaining", "value": 24 }
  ]
}
```

**Expired Subscription**:
```json
{
  "name": "VIP Coffee Club - EXPIRED",
  "image": "ipfs://QmExpired.../gray-card.png",
  "attributes": [
    { "trait_type": "Status", "value": "Expired" },
    { "trait_type": "Days Remaining", "value": 0 }
  ]
}
```

---

## Technical Architecture

### Subscription Creation with NFT

1. **Customer Subscribes**:
   ```typescript
   POST /api/v1/subscriptions
   {
     "planId": "plan-vip",
     "paymentMethod": "BLOCKCHAIN_TOKEN",
     "tokenAmount": "400000000000000000000",
     "tokenSymbol": "COFFEE",
     "chain": "POLYGON",
     "autoRenew": true
   }
   ```

2. **Mint Membership NFT**:
   ```typescript
   const subscription = SubscriptionAggregate.create(
     customerId,
     planId,
     "ACTIVE",
     new Date(),
     addMonths(new Date(), 1)
   );

   // Mint NFT membership
   const nft = await mintSubscriptionNFT(
     customerId,
     subscription.id,
     {
       name: "VIP Coffee Club Membership",
       image: "ipfs://QmVIP.../active.png",
       attributes: [
         { traitType: "Status", value: "Active" },
         { traitType: "Expiration", value: subscription.currentPeriodEnd.toISOString() }
       ]
     }
   );

   subscription.nftTokenId = nft.tokenId;
   await subscriptionRepo.save(subscription);
   ```

3. **Auto-Renewal via Smart Contract**:
   ```typescript
   // Customer approves token spending
   await tokenContract.approve(
     subscriptionContractAddress,
     "400000000000000000000" // 400 tokens per month
   );

   // Smart contract pulls payment monthly
   await subscriptionContract.renewSubscription(subscription.id);
   ```

---

### Subscription Status Check

**Before Granting Benefits**:
```typescript
async function hasActiveSubscription(customerId: UUID): Promise<boolean> {
  const subscription = await subscriptionRepo.findActiveByCustomer(customerId);
  if (!subscription) return false;

  // Check NFT ownership (if NFT-based)
  if (subscription.nftTokenId) {
    const owner = await nftContract.ownerOf(subscription.nftTokenId);
    return owner.toLowerCase() === customer.walletAddress.toLowerCase();
  }

  // Check on-chain subscription status
  const onChainSub = await subscriptionContract.subscriptions(subscription.id);
  return onChainSub.isActive && onChainSub.nextPayment > Date.now() / 1000;
}
```

---

## User Experience

### Subscribing with Tokens

1. **Select Subscription Plan**:
   ```
   VIP Coffee Club

   Benefits:
   - 20% off all purchases
   - Free drink on birthday
   - Exclusive merchandise access
   - Priority support

   Payment Options:
   ○ Credit Card: $19.99/month
   ● COFFEE Tokens: 400 tokens/month (You have 1,250 tokens)

   Auto-renew: [On]

   [Subscribe Now]
   ```

2. **Approve Token Spending**:
   ```
   Approve Token Spending

   The VIP Coffee Club subscription will automatically charge 400 COFFEE tokens from your wallet each month.

   You're approving:
   - Token: COFFEE
   - Amount per month: 400 tokens
   - Total approved: Unlimited (can cancel anytime)

   This is a one-time approval. Future payments will be automatic.

   [Approve in Wallet]
   ```

3. **Receive NFT Membership**:
   ```
   🎉 Subscription Active!

   Your VIP Coffee Club membership is now active!

   NFT Membership Card:
   - Minted to your wallet
   - View in MetaMask: Assets → NFTs
   - Valid until: December 7, 2026

   Auto-renewal: Enabled
   Next payment: 400 COFFEE tokens on Dec 7, 2025

   [View NFT] [Manage Subscription]
   ```

### Managing Subscription

**Subscription Dashboard**:
```
VIP Coffee Club Membership

Status: 🟢 Active
NFT: View in Wallet
Next Payment: Dec 7, 2025 (400 COFFEE tokens)
Auto-Renew: ✅ Enabled

Your NFT Membership:
- Token ID: #42
- Contract: 0x123abc... (Polygon)
- View on OpenSea

Payment History:
- Nov 7, 2025: 400 COFFEE tokens (Success)
- Oct 7, 2025: 400 COFFEE tokens (Success)
- Sep 7, 2025: 400 COFFEE tokens (Success)

[Cancel Subscription] [Update Payment Method]
```

**Cancelling**:
```
Cancel Subscription

Your VIP Coffee Club membership will remain active until Dec 7, 2025.

After cancellation:
- No more automatic payments
- Benefits end on Dec 7, 2025
- You can re-subscribe anytime

Your NFT membership card will show "Expired" status.

[Confirm Cancellation] [Never Mind]
```

---

## Trading Subscriptions

### Selling on OpenSea

**Subscription NFT Listing**:
```
VIP Coffee Club Membership

Current Price: 0.05 ETH (~$100)
Status: Active until Dec 7, 2026
Auto-renew: Enabled (400 COFFEE/month)

Buyer receives:
✅ Full year of VIP benefits
✅ 20% off all purchases
✅ Free birthday drink
✅ Auto-renews (can cancel)

Note: Monthly payment of 400 COFFEE tokens required.

[Buy Now] [Make Offer]
```

---

## Cost Analysis

**Polygon**:
| Operation | Gas Cost | USD Cost (MATIC @ $0.50) |
|-----------|----------|--------------------------|
| Mint Membership NFT | 100,000 gas | ~$0.02 |
| Auto-Renew Payment | 50,000 gas | ~$0.01 |
| Update NFT Metadata | 50,000 gas | ~$0.01 |
| Cancel Subscription | 30,000 gas | ~$0.01 |

**Monthly Cost per Subscriber**: ~$0.02 (if business subsidizes gas)

---

## Implementation Phases

### Phase 4.1: NFT Memberships (Months 10-11)
- Mint NFT on subscription creation
- NFT ownership grants access
- Transfer NFT = transfer subscription

### Phase 4.2: Token Payments (Month 12)
- Pay subscriptions with tokens
- Smart contract auto-renewal
- Token approval flow

### Phase 4.3: Dynamic NFTs (Month 13-14)
- Update NFT based on status
- Active vs expired visuals
- Real-time metadata updates

---

## Success Metrics

**Phase 4 Targets**:
- NFT memberships issued: 10,000+
- Token-based subscriptions: 5,000+
- Auto-renewals processed: 50,000+
- Secondary market sales: 1,000+ subscriptions

---

## References

- [Blockchain Domain Specification](../../domain-specs/blockchain/)
- [Feature Spec: Subscription Management](./FEATURE-SPEC.md)

---

**Document Owner**: Backend Team (Web3 Squad)
**Last Updated**: 2025-11-07
