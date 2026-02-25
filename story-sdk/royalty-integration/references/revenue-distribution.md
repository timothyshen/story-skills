# Revenue Distribution

## Overview

Revenue distribution in Story Protocol is handled through royalty tokens. Each IP Royalty Vault contains 100 royalty tokens, and holders of these tokens are entitled to a proportional share of the vault's revenue.

## Royalty Token Transfers

### The Problem: Tokens in the IP Account

When an IP Royalty Vault is deployed, all 100 royalty tokens are minted to the **IP Account** (the ERC-6551 Token Bound Account), not to the IP owner's wallet. This means the IP owner cannot directly claim revenue until they transfer royalty tokens to their wallet.

### Transferring Tokens from IP Account to Wallet

Use `client.ipAccount.execute()` to call the vault's ERC-20 `transfer`:

```typescript
import { encodeFunctionData, parseUnits } from 'viem';

const vaultAddress = await client.royalty.getRoyaltyVaultAddress(ipId);

// Transfer 50 royalty tokens (50% of revenue rights) to your wallet
const transferData = encodeFunctionData({
  abi: [
    {
      name: 'transfer',
      type: 'function',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ type: 'bool' }],
    },
  ],
  functionName: 'transfer',
  args: [
    '0xYourWalletAddress',
    parseUnits('50', 6),      // 50 tokens with 6 decimals = 50_000_000
  ],
});

await client.ipAccount.execute({
  ipId: ipId,
  to: vaultAddress,
  value: 0n,
  data: transferData,
});
```

### Using autoTransfer in Claim Options

The simpler approach is to use `autoTransferAllClaimedTokensFromIp` when claiming revenue:

```typescript
await client.royalty.claimAllRevenue({
  ancestorIpId: ipId,
  claimer: '0xYourWallet',
  childIpIds: [...],
  royaltyPolicies: [...],
  currencyTokens: [WIP_TOKEN_ADDRESS],
  claimOptions: {
    autoTransferAllClaimedTokensFromIp: true,   // Transfers claimed tokens from IP Account
    autoUnwrapIpTokens: true,                    // Unwraps WIP to native IP
  },
});
```

This automatically transfers all claimed revenue tokens from the IP Account to the claimer's wallet in the same transaction.

## autoTransfer and autoUnwrap Options

### autoTransferAllClaimedTokensFromIp

When `true`, claimed tokens are transferred from the IP Account to the `claimer` address in the same transaction. Without this, tokens remain in the IP Account.

| Setting | Behavior |
|---------|----------|
| `true` | Tokens go directly to claimer wallet |
| `false` | Tokens stay in IP Account (useful for programmatic IPs) |

### autoUnwrapIpTokens

When `true`, WIP tokens are unwrapped back to native IP tokens after claiming.

| Setting | Behavior |
|---------|----------|
| `true` | Claimer receives native IP tokens |
| `false` | Claimer receives WIP (ERC-20) tokens |

### Recommended Defaults

For most users who want to receive native IP tokens in their wallet:

```typescript
claimOptions: {
  autoTransferAllClaimedTokensFromIp: true,
  autoUnwrapIpTokens: true,
}
```

## Permissionless Claiming

Revenue claiming in Story Protocol is **permissionless**. This means:

- **Anyone** can call `claimAllRevenue()` or `batchClaimAllRevenue()` for any IP
- The `claimer` parameter determines who receives the tokens, not who sends the transaction
- The transaction sender does not need to own the IP or hold any royalty tokens

### Why Permissionless?

1. **Third-party services**: Platforms can claim on behalf of their users
2. **Automated claiming**: Bots can periodically claim revenue for IP owners
3. **Gas sponsorship**: A relayer can pay gas for claims
4. **Composability**: Other contracts can integrate claiming into their workflows

### Example: Third-Party Claiming

```typescript
// Anyone can trigger this claim — the tokens go to the claimer, not the tx sender
await client.royalty.claimAllRevenue({
  ancestorIpId: '0xSomeIpId',
  claimer: '0xIpOwnerWallet',          // Owner receives tokens
  childIpIds: ['0xChild1'],
  royaltyPolicies: ['0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E'],
  currencyTokens: [WIP_TOKEN_ADDRESS],
  claimOptions: {
    autoTransferAllClaimedTokensFromIp: true,
    autoUnwrapIpTokens: true,
  },
});
```

## Distribution Strategies

### Strategy 1: Single Owner (Default)

All 100 royalty tokens stay with the IP Account. The single owner claims all revenue.

```typescript
// Owner claims everything
await client.royalty.claimAllRevenue({
  ancestorIpId: ipId,
  claimer: ownerWallet,
  childIpIds: [...],
  royaltyPolicies: [...],
  currencyTokens: [WIP_TOKEN_ADDRESS],
  claimOptions: {
    autoTransferAllClaimedTokensFromIp: true,
    autoUnwrapIpTokens: true,
  },
});
```

### Strategy 2: Multi-Party Split

Transfer royalty tokens to multiple wallets to split revenue.

```typescript
// Transfer 60 tokens to creator, 40 to collaborator
// Creator gets 60% of revenue, collaborator gets 40%

// Transfer to creator
await client.ipAccount.execute({
  ipId,
  to: vaultAddress,
  value: 0n,
  data: encodeFunctionData({
    abi: erc20TransferAbi,
    functionName: 'transfer',
    args: ['0xCreatorWallet', parseUnits('60', 6)],
  }),
});

// Transfer to collaborator
await client.ipAccount.execute({
  ipId,
  to: vaultAddress,
  value: 0n,
  data: encodeFunctionData({
    abi: erc20TransferAbi,
    functionName: 'transfer',
    args: ['0xCollaboratorWallet', parseUnits('40', 6)],
  }),
});
```

### Strategy 3: Register with Royalty Shares (Atomic)

Distribute royalty tokens at registration time:

```typescript
const response = await client.ipAsset.registerIpAsset({
  nft: { type: 'mint', spgNftContract: '0x...' },
  royaltyShares: [
    { recipient: '0xCreator1', percentage: 60 },
    { recipient: '0xCreator2', percentage: 30 },
    { recipient: '0xPlatform', percentage: 10 },
  ],
  ipMetadata: { /* ... */ },
});
```

This uses `RoyaltyTokenDistributionWorkflows` to register the IP and distribute royalty tokens in a single transaction.

### Strategy 4: Treasury / DAO

Keep all royalty tokens in the IP Account and use governance to decide on distributions:

```typescript
// Check claimable amount
const claimable = await client.royalty.claimableRevenue({
  royaltyVaultIpId: ipId,
  claimer: ipId,        // Check what the IP Account itself can claim
  token: WIP_TOKEN_ADDRESS,
});

// Claim to IP Account (no auto-transfer)
await client.royalty.claimAllRevenue({
  ancestorIpId: ipId,
  claimer: ipId,
  childIpIds: [...],
  royaltyPolicies: [...],
  currencyTokens: [WIP_TOKEN_ADDRESS],
  claimOptions: {
    autoTransferAllClaimedTokensFromIp: false,  // Keep in IP Account
  },
});

// Later: DAO votes to distribute, then execute transfer via ipAccount.execute()
```

## Tracking Revenue

### Check Claimable Revenue

```typescript
const claimable = await client.royalty.claimableRevenue({
  royaltyVaultIpId: ipId,
  claimer: walletAddress,
  token: WIP_TOKEN_ADDRESS,
});

console.log(`Claimable: ${formatEther(claimable)} WIP`);
```

### Check Royalty Token Balance

Since the vault IS an ERC-20, you can use standard ERC-20 calls:

```typescript
import { erc20Abi } from 'viem';

const balance = await publicClient.readContract({
  address: vaultAddress,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [walletAddress],
});

// balance is in 6 decimal precision
// 50_000_000 = 50 royalty tokens = 50% revenue share
```

## Important Considerations

1. **Token decimal precision**: Royalty tokens use 6 decimals. 1 token = 1,000,000 internal units. Use `parseUnits('50', 6)` not `parseEther('50')`.
2. **Vault must exist**: You cannot claim revenue if no vault has been deployed. Register a derivative or mint a license token first.
3. **Multiple currency tokens**: Revenue can accumulate in different ERC-20 tokens. Claim each token type separately by including all token addresses in `currencyTokens`.
4. **Claim frequency**: There is no penalty for frequent claiming. Claim as often as needed.
5. **Gas costs**: Batch claiming via `batchClaimAllRevenue` is more gas-efficient for multiple IPs.
