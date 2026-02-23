---
name: royalty-integration
description: Story Protocol royalty payments and revenue claiming. Use when user mentions "royalty", "revenue", "pay royalty", "claim revenue", "royalty vault", "royalty tokens", "LAP", "LRP", "IpRoyaltyVault", or wants to handle payments on Story.
allowed-tools: Read, Glob, Grep, WebFetch, Task(subagent_type:Explore)
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '1.0.0'
---

# Royalty Payments and Revenue Claiming on Story Protocol

Guide for handling royalty payments, revenue claiming, and IP Royalty Vault management on Story Protocol.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **IP Royalty Vault** | An ERC-20 contract auto-deployed per IP Asset. Holds 100 Royalty Tokens representing revenue rights. Vault address IS the token contract. |
| **Royalty Tokens** | Fungible tokens in the vault. 100 tokens = 100% revenue rights. 6 decimal precision, internal `royaltySharesTotalSupply = 100_000_000`. |
| **LAP** | Liquid Absolute Percentage (`0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E`). Each ancestor gets a cut from ALL downstream derivatives. |
| **LRP** | Liquid Relative Percentage (`0x9156e603C949481883B1d3355c6f1132D191fC41`). Only direct parent-child royalty relationships. |
| **Royalty Stack** | The cumulative percentage of revenue owed to all ancestors. An IP retains `100% - royaltyStack`. |
| **WIP** | Wrapped IP token at `0x1514000000000000000000000000000000000000`. Primary payment token for royalties. |

## IP Royalty Vault Mechanics

The IP Royalty Vault is the central contract for revenue distribution in Story Protocol.

### Vault Deployment

A vault is **auto-deployed** when either:

1. The first license token is minted for an IP Asset, OR
2. A derivative IP Asset is registered linking to this IP as a parent

You do NOT manually deploy vaults.

### Vault Properties

- Each vault holds exactly **100 Royalty Tokens** (each = 1% of revenue rights)
- The vault address IS the ERC-20 token contract for those royalty tokens
- Internal representation: `royaltySharesTotalSupply = 100_000_000` (6 decimal precision)
- On deployment, **all 100 tokens go to the IP Account** (the ERC-6551 TBA), NOT to the owner's wallet
- To receive revenue, you must transfer royalty tokens from the IP Account to your wallet

### Getting the Vault Address

```typescript
const vaultAddress = await client.royalty.getRoyaltyVaultAddress(ipId);
```

## LAP vs LRP Policies

### LAP (Liquid Absolute Percentage)

Address: `0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E`

Each ancestor in the derivative chain receives a percentage cut from **ALL downstream derivatives**, no matter how deep.

Example chain: `IPA1 → IPA2 → IPA3`

- If IPA1 sets 5% and IPA2 sets 10%
- IPA3 pays 5% to IPA1 AND 10% to IPA2 (total royalty stack = 15%)

### LRP (Liquid Relative Percentage)

Address: `0x9156e603C949481883B1d3355c6f1132D191fC41`

Only **direct parent-child** relationships are enforced. Each IP only pays its immediate parent.

Example chain: `IPA1 → IPA2 → IPA3`

- IPA2 pays its configured percentage to IPA1
- IPA3 pays its configured percentage to IPA2
- IPA1 does NOT automatically receive from IPA3

### Policy Comparison

| Feature | LAP | LRP |
|---------|-----|-----|
| Scope | All ancestors | Direct parent only |
| Revenue flow | Cascading to all upstream | Single hop |
| Stack growth | Additive across chain | Per-link only |
| Use case | Complex IP trees | Simple parent-child |

## Royalty Stack

The **royalty stack** is the cumulative percentage of revenue that an IP Asset must pay to all its ancestors.

### Calculation Example

```
IPA1 (root) — sets commercialRevShare: 5%
  └── IPA2 (derivative of IPA1) — sets commercialRevShare: 10%
        └── IPA3 (derivative of both IPA1 and IPA2)
```

Under LAP:

- IPA3's royalty stack = 5% (to IPA1) + 10% (to IPA2) = **15%**
- IPA3 retains **85%** of all revenue paid to it
- The maximum royalty stack is capped at 100% (an IP cannot owe more than it receives)

### Important Rules

- The royalty stack is set at derivative registration time and is immutable
- If an IP's royalty stack reaches 100%, it cannot accept any more revenue (everything goes to ancestors)
- Stack is calculated from the `commercialRevShare` values in the license terms of each parent

## Paying Royalties

Use `payRoyaltyOnBehalf()` to pay royalties to an IP Asset. This deposits tokens into the IP's Royalty Vault.

### SDK Method

```typescript
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther, zeroAddress } from 'viem';

const response = await client.royalty.payRoyaltyOnBehalf({
  receiverIpId: '0xReceiverIpId',  // IP Asset receiving royalties
  payerIpId: zeroAddress,           // Use zeroAddress for external payers (non-IP payers)
  token: WIP_TOKEN_ADDRESS,         // Payment token (WIP)
  amount: parseEther('1'),          // Amount in wei (1 WIP = 1e18)
  wipOptions: {
    useNativeTokens: true,          // Pay with native IP tokens (auto-wraps to WIP)
  },
});

console.log(`Paid royalty: tx=${response.txHash}`);
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `receiverIpId` | `Address` | The IP Asset receiving the royalty payment |
| `payerIpId` | `Address` | The IP Asset paying (use `zeroAddress` for external/non-IP payers) |
| `token` | `Address` | ERC-20 token address for payment (usually WIP) |
| `amount` | `bigint` | Amount in wei |
| `wipOptions` | `object` | Options for WIP token handling |

### WIP Options

```typescript
wipOptions: {
  useNativeTokens: true,   // Use native IP tokens, auto-wraps to WIP
}
```

### ERC-20 Options (for non-WIP tokens)

```typescript
erc20Options: {
  autoApprove: true,  // Auto-approve the RoyaltyModule to spend tokens
}
```

### Paying from Another IP Asset

When one IP pays royalty to another (e.g., derivative paying parent):

```typescript
const response = await client.royalty.payRoyaltyOnBehalf({
  receiverIpId: '0xParentIpId',
  payerIpId: '0xDerivativeIpId',  // The IP Asset that is paying
  token: WIP_TOKEN_ADDRESS,
  amount: parseEther('5'),
  wipOptions: {
    useNativeTokens: true,
  },
});
```

## Claiming Revenue

Use `claimAllRevenue()` to claim accumulated revenue from the royalty system. Claiming is **permissionless** — anyone can trigger it for any IP.

### SDK Method

```typescript
const response = await client.royalty.claimAllRevenue({
  ancestorIpId: '0xAncestorIpId',       // The IP whose vault holds the revenue
  claimer: '0xClaimerAddress',           // Who receives the claimed tokens
  childIpIds: ['0xChildIp1', '0xChildIp2'], // Child IPs that owe royalties
  royaltyPolicies: [
    '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E', // LAP address
    '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',
  ],
  currencyTokens: [WIP_TOKEN_ADDRESS],   // Tokens to claim
  claimOptions: {
    autoTransferAllClaimedTokensFromIp: true,  // Transfer tokens from IP Account to claimer
    autoUnwrapIpTokens: true,                   // Unwrap WIP to native IP tokens
  },
});

console.log(`Claimed revenue: tx=${response.txHash}`);
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `ancestorIpId` | `Address` | The ancestor IP whose vault holds revenue |
| `claimer` | `Address` | Address that receives claimed tokens |
| `childIpIds` | `Address[]` | Array of child IP IDs in the derivative chain |
| `royaltyPolicies` | `Address[]` | Royalty policy address for each child (LAP or LRP) |
| `currencyTokens` | `Address[]` | Token addresses to claim revenue in |
| `claimOptions` | `object` | Options for transfer and unwrapping |

### Claim Options

```typescript
claimOptions: {
  autoTransferAllClaimedTokensFromIp: true,  // Move tokens from IP Account to claimer wallet
  autoUnwrapIpTokens: true,                   // Convert WIP back to native IP tokens
}
```

### Permissionless Claiming

Anyone can call `claimAllRevenue()` for any IP. The `claimer` parameter determines who receives the tokens, but the transaction itself can be sent by any address. This enables:

- Third-party services to trigger claims on behalf of IP owners
- Automated claiming bots
- Batch operations across multiple IPs

## Batch Claiming

Use `batchClaimAllRevenue()` to claim revenue for multiple ancestor IPs in a single transaction.

### SDK Method

```typescript
const response = await client.royalty.batchClaimAllRevenue({
  ancestorIps: [
    {
      ancestorIpId: '0xAncestor1',
      claimer: '0xClaimerAddress',
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
      claimer: '0xClaimerAddress',
      childIpIds: ['0xChild2', '0xChild3'],
      royaltyPolicies: [
        '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',
        '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',
      ],
      currencyTokens: [WIP_TOKEN_ADDRESS],
      claimOptions: {
        autoTransferAllClaimedTokensFromIp: true,
        autoUnwrapIpTokens: true,
      },
    },
  ],
  useMulticallWhenPossible: true,  // Batch into fewer transactions
});
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `ancestorIps` | `array` | Array of claim configurations (same shape as `claimAllRevenue` params) |
| `useMulticallWhenPossible` | `boolean` | Batch multiple claims into fewer transactions via multicall |

## Other Useful Methods

### getRoyaltyVaultAddress

Retrieve the vault address for an IP Asset:

```typescript
const vaultAddress = await client.royalty.getRoyaltyVaultAddress(ipId);
console.log(`Vault: ${vaultAddress}`);
// The vault address is also the ERC-20 contract for royalty tokens
```

### claimableRevenue

Check how much revenue is claimable before claiming:

```typescript
const claimable = await client.royalty.claimableRevenue({
  royaltyVaultIpId: '0xIpId',
  claimer: '0xClaimerAddress',
  token: WIP_TOKEN_ADDRESS,
});

console.log(`Claimable: ${claimable} wei`);
```

### transferToVault

Transfer royalty tokens into a vault (used internally by the protocol, rarely called directly):

```typescript
const response = await client.royalty.transferToVault({
  ipId: '0xIpId',
  ancestorIpId: '0xAncestorIpId',
  token: WIP_TOKEN_ADDRESS,
});
```

## Payment Tokens

| Network | Token | Address |
|---------|-------|---------|
| Both | WIP (Wrapped IP) | `0x1514000000000000000000000000000000000000` |
| Aeneid (testnet) | MERC20 (test token) | `0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E` |

Import WIP address from the SDK:

```typescript
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
// WIP_TOKEN_ADDRESS = '0x1514000000000000000000000000000000000000'
```

## Common Pitfalls

1. **Royalty tokens stuck in IP Account**: On vault deployment, all 100 royalty tokens go to the IP Account (ERC-6551 TBA), NOT to the owner's wallet. You must explicitly transfer them using `client.ipAccount.execute()` or set `autoTransferAllClaimedTokensFromIp: true` in claim options.
2. **Multicall3 incompatibility**: Do NOT use standard Multicall3 (`0xcA11bde05977b3631167028862bE2a173976CA11`) with SPG royalty workflow functions. Use SPG's built-in `multicall` or the SDK's `useMulticallWhenPossible` option instead.
3. **Zero address for external payers**: When paying royalties from a non-IP source (e.g., a marketplace or user wallet), set `payerIpId` to `zeroAddress`. Only use an actual IP ID when one IP Asset is paying another.
4. **Royalty stack overflow**: If the cumulative royalty stack reaches 100%, the IP cannot retain any revenue. Check the stack before registering derivatives.
5. **Policy mismatch in claimAllRevenue**: The `royaltyPolicies` array must match 1:1 with `childIpIds`. Each child must use the correct policy address (LAP or LRP) that was set in its license terms.
6. **Forgetting currencyTokens**: You must specify which token(s) to claim. Revenue can accumulate in multiple tokens, and you need to claim each one separately.

## Contract Addresses

| Contract | Address |
|----------|---------|
| RoyaltyModule | `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086` |
| RoyaltyPolicyLAP | `0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E` |
| RoyaltyPolicyLRP | `0x9156e603C949481883B1d3355c6f1132D191fC41` |
| RoyaltyWorkflows | `0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890` |
| RoyaltyTokenDistributionWorkflows | `0xa38f42B8d33809917f23997B8423054aAB97322C` |

## Network Configuration

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Aeneid (testnet) | 1315 | `https://aeneid.storyrpc.io` | `https://aeneid.storyscan.io` |
| Mainnet | 1514 | `https://mainnet.storyrpc.io` | `https://mainnet.storyscan.xyz` |
