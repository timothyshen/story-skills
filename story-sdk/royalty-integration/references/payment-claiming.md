# Royalty Payment and Revenue Claiming

## Prerequisites

- Node.js 18+, npm 8+
- `@story-protocol/core-sdk` and `viem` installed
- EVM wallet with private key
- RPC endpoint: `https://aeneid.storyrpc.io` (testnet) or `https://mainnet.storyrpc.io`
- Testnet $IP from faucet: `https://aeneid.faucet.story.foundation/`

## SDK Client Setup

```typescript
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

const account = privateKeyToAccount(`0x${process.env.WALLET_PRIVATE_KEY}`);

const config: StoryConfig = {
  account,
  transport: http('https://aeneid.storyrpc.io'),
  chainId: 'aeneid',
};

const client = StoryClient.newClient(config);
```

## payRoyaltyOnBehalf

Pays royalties to an IP Asset's Royalty Vault. The tokens are deposited into the vault and become claimable by royalty token holders and ancestors.

### Basic Payment with Native IP Tokens

```typescript
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther, zeroAddress } from 'viem';

const response = await client.royalty.payRoyaltyOnBehalf({
  receiverIpId: '0xReceiverIpId',
  payerIpId: zeroAddress,           // External payer (not an IP Asset)
  token: WIP_TOKEN_ADDRESS,
  amount: parseEther('10'),          // 10 WIP
  wipOptions: {
    useNativeTokens: true,           // Auto-wraps native IP to WIP
  },
});

console.log(`Payment tx: ${response.txHash}`);
```

### Payment from One IP to Another

```typescript
const response = await client.royalty.payRoyaltyOnBehalf({
  receiverIpId: '0xParentIpId',
  payerIpId: '0xChildIpId',         // The derivative IP paying its parent
  token: WIP_TOKEN_ADDRESS,
  amount: parseEther('5'),
  wipOptions: {
    useNativeTokens: true,
  },
});
```

### Payment with ERC-20 Tokens (Non-WIP)

```typescript
const response = await client.royalty.payRoyaltyOnBehalf({
  receiverIpId: '0xReceiverIpId',
  payerIpId: zeroAddress,
  token: '0xTokenAddress',          // Any whitelisted ERC-20
  amount: parseEther('100'),
  erc20Options: {
    autoApprove: true,               // Auto-approve RoyaltyModule to spend tokens
  },
});
```

### Full Parameter Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `receiverIpId` | `Address` | Yes | IP Asset receiving the payment |
| `payerIpId` | `Address` | Yes | IP Asset paying (`zeroAddress` for external) |
| `token` | `Address` | Yes | Payment token address |
| `amount` | `bigint` | Yes | Amount in wei |
| `wipOptions` | `object` | No | WIP-specific options |
| `wipOptions.useNativeTokens` | `boolean` | No | Use native IP tokens (auto-wraps) |
| `erc20Options` | `object` | No | ERC-20 token options |
| `erc20Options.autoApprove` | `boolean` | No | Auto-approve token spending |
| `txOptions` | `object` | No | Transaction overrides |

## claimAllRevenue

Claims all accumulated revenue for an ancestor IP from its descendants.

### Basic Claim

```typescript
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';

const response = await client.royalty.claimAllRevenue({
  ancestorIpId: '0xAncestorIpId',
  claimer: '0xWalletAddress',
  childIpIds: ['0xChild1', '0xChild2'],
  royaltyPolicies: [
    '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',  // LAP for child1
    '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',  // LAP for child2
  ],
  currencyTokens: [WIP_TOKEN_ADDRESS],
  claimOptions: {
    autoTransferAllClaimedTokensFromIp: true,
    autoUnwrapIpTokens: true,
  },
});

console.log(`Claimed: txs=${response.txHashes}`);
```

### Claim Without Auto-Transfer

Revenue stays in the IP Account (useful for programmatic IP management):

```typescript
const response = await client.royalty.claimAllRevenue({
  ancestorIpId: '0xAncestorIpId',
  claimer: '0xAncestorIpId',          // Claim to the IP Account itself
  childIpIds: ['0xChild1'],
  royaltyPolicies: ['0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E'],
  currencyTokens: [WIP_TOKEN_ADDRESS],
  claimOptions: {
    autoTransferAllClaimedTokensFromIp: false,  // Keep in IP Account
    autoUnwrapIpTokens: false,
  },
});
```

### Full Parameter Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ancestorIpId` | `Address` | Yes | Ancestor IP with revenue to claim |
| `claimer` | `Address` | Yes | Address receiving claimed tokens |
| `childIpIds` | `Address[]` | Yes | Child IPs that generated revenue |
| `royaltyPolicies` | `Address[]` | Yes | Policy address per child (1:1 mapping) |
| `currencyTokens` | `Address[]` | Yes | Token addresses to claim |
| `claimOptions` | `object` | No | Claim behavior options |
| `claimOptions.autoTransferAllClaimedTokensFromIp` | `boolean` | No | Transfer from IP Account to claimer |
| `claimOptions.autoUnwrapIpTokens` | `boolean` | No | Unwrap WIP to native IP tokens |

## batchClaimAllRevenue

Claims revenue for multiple ancestor IPs in a single call. More gas-efficient than individual claims.

### Batch Claim Example

```typescript
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';

const response = await client.royalty.batchClaimAllRevenue({
  ancestorIps: [
    {
      ancestorIpId: '0xAncestor1',
      claimer: '0xMyWallet',
      childIpIds: ['0xChild1'],
      royaltyPolicies: ['0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E'],
      currencyTokens: [WIP_TOKEN_ADDRESS],
      claimOptions: {
        autoTransferAllClaimedTokensFromIp: true,
        autoUnwrapIpTokens: true,
      },
    },
    {
      ancestorIpId: '0xAncestor2',
      claimer: '0xMyWallet',
      childIpIds: ['0xChild2', '0xChild3'],
      royaltyPolicies: [
        '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',
        '0x9156e603C949481883B1d3355c6f1132D191fC41',  // LRP for child3
      ],
      currencyTokens: [WIP_TOKEN_ADDRESS],
      claimOptions: {
        autoTransferAllClaimedTokensFromIp: true,
        autoUnwrapIpTokens: true,
      },
    },
  ],
  useMulticallWhenPossible: true,
});

console.log(`Batch claimed: txs=${response.txHashes}`);
```

### Full Parameter Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ancestorIps` | `array` | Yes | Array of claim configs (same shape as `claimAllRevenue` params) |
| `useMulticallWhenPossible` | `boolean` | No | Combine claims into fewer txs via multicall |

## Checking Claimable Revenue

Before claiming, check how much is available:

```typescript
const claimable = await client.royalty.claimableRevenue({
  royaltyVaultIpId: '0xIpId',
  claimer: '0xClaimerAddress',
  token: WIP_TOKEN_ADDRESS,
});

console.log(`Claimable: ${claimable} wei`);
// Convert to human-readable: formatEther(claimable)
```

## Transfer to Vault

Transfer pending royalties from a child's vault to the ancestor's vault:

```typescript
const response = await client.royalty.transferToVault({
  ipId: '0xChildIpId',
  ancestorIpId: '0xAncestorIpId',
  token: WIP_TOKEN_ADDRESS,
});
```

This is typically called internally by `claimAllRevenue`, but can be used independently when you want to stage tokens in the vault without claiming.

## End-to-End Example

Complete flow from paying royalties to claiming revenue:

```typescript
import { StoryClient, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther, zeroAddress } from 'viem';

// Step 1: External party pays royalty to a derivative IP
await client.royalty.payRoyaltyOnBehalf({
  receiverIpId: derivativeIpId,
  payerIpId: zeroAddress,
  token: WIP_TOKEN_ADDRESS,
  amount: parseEther('100'),
  wipOptions: { useNativeTokens: true },
});

// Step 2: Check claimable revenue for the parent
const claimable = await client.royalty.claimableRevenue({
  royaltyVaultIpId: parentIpId,
  claimer: myWallet,
  token: WIP_TOKEN_ADDRESS,
});

console.log(`Parent can claim: ${claimable}`);

// Step 3: Parent claims revenue
await client.royalty.claimAllRevenue({
  ancestorIpId: parentIpId,
  claimer: myWallet,
  childIpIds: [derivativeIpId],
  royaltyPolicies: ['0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E'],
  currencyTokens: [WIP_TOKEN_ADDRESS],
  claimOptions: {
    autoTransferAllClaimedTokensFromIp: true,
    autoUnwrapIpTokens: true,
  },
});
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `RoyaltyModule__NoRoyaltyVault` | IP has no vault deployed | Register a derivative or mint a license token first |
| `RoyaltyModule__InsufficientBalance` | Not enough tokens in vault | Check balance with `claimableRevenue` first |
| `RoyaltyModule__ZeroAmount` | Payment amount is 0 | Ensure amount > 0 |
| `ERC20InsufficientAllowance` | Token not approved | Use `autoApprove: true` or approve manually |
| Policy array length mismatch | `royaltyPolicies.length !== childIpIds.length` | Ensure 1:1 mapping between arrays |
