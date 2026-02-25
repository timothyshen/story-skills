---
name: sdk-integration
description: Story Protocol TypeScript SDK setup and usage. Use when user mentions "Story SDK", "@story-protocol/core-sdk", "StoryClient", "SDK setup", "story-protocol npm", or wants to initialize and use the Story Protocol SDK.
allowed-tools: Read, Glob, Grep, WebFetch, Task(subagent_type:Explore)
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '0.1.0'
---

# Story Protocol TypeScript SDK

Complete guide for installing, configuring, and using the `@story-protocol/core-sdk` package.

## Installation

```bash
npm install @story-protocol/core-sdk viem
```

**Requirements:**

- Node.js 18+
- npm 8+
- An EVM wallet private key (for backend) or wallet connector (for frontend)
- RPC endpoint for Story Protocol network

## Client Initialization

### StoryConfig Type

```typescript
import { StoryConfig } from '@story-protocol/core-sdk';

// StoryConfig requires:
// - account: A viem Account (LocalAccount or WalletClient)
// - transport: A viem Transport (e.g., http())
// - chainId: 'aeneid' | 'mainnet'
```

### Backend Setup (Node.js)

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

### Frontend Setup (Browser Wallet)

```typescript
import { custom } from 'viem';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

// Using window.ethereum (MetaMask, etc.)
const config: StoryConfig = {
  account: walletClient.account, // from viem WalletClient
  transport: custom(window.ethereum),
  chainId: 'aeneid',
};

const client = StoryClient.newClient(config);
```

### Chain Options

| Chain | chainId Value | Numeric Chain ID | RPC URL | Explorer |
|-------|---------------|------------------|---------|----------|
| Aeneid (testnet) | `'aeneid'` | 1315 | `https://aeneid.storyrpc.io` | `https://aeneid.storyscan.io` |
| Mainnet | `'mainnet'` | 1514 | `https://mainnet.storyrpc.io` | `https://mainnet.storyscan.xyz` |

## Client Modules

The `StoryClient` instance exposes specialized sub-clients for each protocol domain:

| Module | Accessor | Class | Primary Methods |
|--------|----------|-------|-----------------|
| IP Assets | `client.ipAsset` | IPAssetClient | `registerIpAsset`, `registerDerivativeIpAsset`, `linkDerivative` |
| Licensing | `client.license` | LicenseClient | `registerPILTerms`, `attachLicenseTerms`, `mintLicenseTokens`, `getLicenseTerms` |
| Royalties | `client.royalty` | RoyaltyClient | `payRoyaltyOnBehalf`, `claimAllRevenue`, `batchClaimAllRevenue` |
| Disputes | `client.dispute` | DisputeClient | `raiseDispute`, `resolveDispute` |
| NFT Collections | `client.nftClient` | NftClient | `createNFTCollection` |
| Groups | `client.groupClient` | GroupClient | `registerGroup`, `addIpToGroup`, `removeIpFromGroup`, `claimReward` |
| WIP Token | `client.wipClient` | WipClient | `deposit`, `withdraw`, `approve`, `transfer` |
| IP Accounts | `client.ipAccountClient` | IPAccountClient | `execute`, `executeWithSig`, `getIpAccountNonce` |
| Permissions | `client.permissionClient` | PermissionClient | `setPermission`, `setBatchPermissions`, `createSetPermissionSignature` |

### IPAssetClient

```typescript
// Register an existing NFT as an IP Asset
const result = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'minted',
    nftContract: '0xYourERC721',
    tokenId: '1',
  },
  ipMetadata: {
    ipMetadataURI: 'https://ipfs.io/ipfs/...',
    ipMetadataHash: '0x...',
    nftMetadataURI: 'https://ipfs.io/ipfs/...',
    nftMetadataHash: '0x...',
  },
});
console.log(`ipId: ${result.ipId}, tx: ${result.txHash}`);

// Mint + register in one transaction via SPG
const result2 = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xYourSPGCollection',
  },
  ipMetadata: { /* ... */ },
});

// Register a derivative IP
const result3 = await client.ipAsset.registerDerivativeIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xYourSPGCollection',
  },
  derivData: {
    parentIpIds: ['0xParentIpId'],
    licenseTermsIds: ['1'],
  },
  ipMetadata: { /* ... */ },
});
```

### LicenseClient

```typescript
import { PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

// Register PIL license terms
const result = await client.license.registerPILTerms({
  terms: PILFlavor.commercialRemix({
    commercialRevShare: 10, // 10%
    defaultMintingFee: parseEther('0.1'),
    currency: WIP_TOKEN_ADDRESS,
  }),
});
console.log(`License Terms ID: ${result.licenseTermsId}`);

// Attach terms to an IP
await client.license.attachLicenseTerms({
  ipId: '0xYourIpId',
  licenseTermsId: result.licenseTermsId,
});

// Mint license tokens
const mintResult = await client.license.mintLicenseTokens({
  licensorIpId: '0xParentIpId',
  licenseTermsId: '1',
  amount: 1,
  receiver: '0xRecipient',
});
```

### RoyaltyClient

```typescript
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

// Pay royalty on behalf of an IP
await client.royalty.payRoyaltyOnBehalf({
  receiverIpId: '0xReceiverIpId',
  payerIpId: '0xPayerIpId',
  token: WIP_TOKEN_ADDRESS,
  amount: parseEther('1'),
});

// Claim all revenue for an IP across ancestors
await client.royalty.claimAllRevenue({
  ancestorIpId: '0xAncestorIpId',
  claimer: '0xClaimerAddress',
  childIpIds: ['0xChildIp1', '0xChildIp2'],
  royaltyPolicies: ['0xPolicyAddress1', '0xPolicyAddress2'],
  currencyTokens: [WIP_TOKEN_ADDRESS],
});

// Batch claim
await client.royalty.batchClaimAllRevenue({
  ancestorIpId: '0xAncestorIpId',
  claimer: '0xClaimerAddress',
  childIpIds: ['0xChildIp1'],
  royaltyPolicies: ['0xPolicyAddress1'],
  currencyTokens: [WIP_TOKEN_ADDRESS],
});
```

### DisputeClient

```typescript
// Raise a dispute against an IP
const dispute = await client.dispute.raiseDispute({
  targetIpId: '0xTargetIpId',
  disputeEvidenceHash: '0xEvidenceHash',
  targetTag: 'PLAGIARISM',
  bond: parseEther('0.1'),
});
console.log(`Dispute ID: ${dispute.disputeId}`);

// Resolve a dispute
await client.dispute.resolveDispute({
  disputeId: dispute.disputeId,
  data: '0x',
});
```

### NftClient

```typescript
import { zeroAddress } from 'viem';

// Create an SPG NFT collection
const collection = await client.nftClient.createNFTCollection({
  name: 'My IP Collection',
  symbol: 'MIP',
  isPublicMinting: false,
  mintOpen: true,
  mintFeeRecipient: zeroAddress,
  contractURI: '',
});
console.log(`Collection: ${collection.spgNftContract}`);
```

### GroupClient

```typescript
// Register a new group
const group = await client.groupClient.registerGroup({
  groupPool: '0xf96f2c30b41Cb6e0290de43C8528ae83d4f33F89', // EvenSplitGroupPool
});
console.log(`Group IP ID: ${group.groupIpId}`);

// Add an IP to the group
await client.groupClient.addIpToGroup({
  groupIpId: group.groupIpId,
  ipIds: ['0xIpId1', '0xIpId2'],
});
```

### WipClient

```typescript
// Deposit native IP to get WIP (Wrapped IP)
await client.wipClient.deposit({
  amount: parseEther('1'),
});

// Withdraw WIP back to native IP
await client.wipClient.withdraw({
  amount: parseEther('0.5'),
});

// Approve WIP spending
await client.wipClient.approve({
  spender: '0xSpenderAddress',
  amount: parseEther('10'),
});
```

## Key Exports

The `@story-protocol/core-sdk` package exports the following:

### Classes and Constructors

| Export | Description |
|--------|-------------|
| `StoryClient` | Main client class; use `StoryClient.newClient(config)` |
| `StoryConfig` | Configuration type for client initialization |

### Constants

| Export | Description |
|--------|-------------|
| `WIP_TOKEN_ADDRESS` | Wrapped IP token address (`0x1514000000000000000000000000000000000000`) |
| `royaltySharesTotalSupply` | Total supply of royalty shares (100,000,000) |
| `MAX_ROYALTY_TOKEN` | Maximum royalty token value |
| `defaultFunctionSelector` | Default function selector for permissions |

### License Utilities

| Export | Description |
|--------|-------------|
| `PILFlavor` | Helper for creating PIL license terms: `.nonCommercialSocialRemixing()`, `.commercialUse()`, `.commercialRemix()` |
| `LicenseTerms` | TypeScript type for license terms configuration |

### Chain Objects

| Export | Description |
|--------|-------------|
| `aeneid` | Aeneid testnet chain configuration object (chain ID 1315) |
| `mainnet` | Mainnet chain configuration object (chain ID 1514) |

### Utility Functions

| Export | Description |
|--------|-------------|
| `convertCIDtoHashIPFS` | Convert an IPFS CID to its hash representation |
| `convertHashIPFStoCID` | Convert an IPFS hash back to a CID |
| `getPermissionSignature` | Generate a permission signature for IP Account operations |
| `getSignature` | Generate a generic signature for SDK operations |

## Common Patterns

### Error Handling

```typescript
try {
  const result = await client.ipAsset.registerIpAsset({ /* ... */ });
  console.log(`Success: ${result.ipId}`);
} catch (error) {
  if (error.message.includes('execution reverted')) {
    console.error('Transaction reverted:', error.message);
  } else if (error.message.includes('insufficient funds')) {
    console.error('Not enough IP tokens for gas');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Transaction Confirmation

All write methods return a transaction hash. The SDK waits for confirmation by default:

```typescript
const result = await client.ipAsset.registerIpAsset({ /* ... */ });
// result.txHash is available after the transaction is confirmed
// result.ipId is parsed from the transaction receipt events
```

### Deadline Parameter

For time-sensitive operations, use the `deadline` parameter to set a transaction expiration:

```typescript
const result = await client.ipAsset.registerIpAsset({
  nft: { type: 'mint', spgNftContract: '0x...' },
  ipMetadata: { /* ... */ },
  deadline: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
});
```

### Batch Operations

Multiple operations can be combined using the SDK's built-in multicall support where available, or by sequencing individual calls:

```typescript
// Sequential operations
const ip1 = await client.ipAsset.registerIpAsset({ /* ... */ });
const ip2 = await client.ipAsset.registerIpAsset({ /* ... */ });

// Attach license to both
await client.license.attachLicenseTerms({ ipId: ip1.ipId, licenseTermsId: '1' });
await client.license.attachLicenseTerms({ ipId: ip2.ipId, licenseTermsId: '1' });
```

## Viem Integration

The Story Protocol SDK is built on top of [viem](https://viem.sh/) and uses viem types throughout:

### Transport Options

```typescript
import { http, webSocket, custom } from 'viem';

// HTTP (most common)
const config: StoryConfig = {
  account,
  transport: http('https://aeneid.storyrpc.io'),
  chainId: 'aeneid',
};

// WebSocket
const config: StoryConfig = {
  account,
  transport: webSocket('wss://aeneid.storyrpc.io'),
  chainId: 'aeneid',
};

// Custom (browser wallets)
const config: StoryConfig = {
  account,
  transport: custom(window.ethereum),
  chainId: 'aeneid',
};
```

### Viem Utility Functions

The SDK works seamlessly with viem utilities:

```typescript
import { parseEther, formatEther, zeroAddress, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Parse and format ether values
const mintingFee = parseEther('0.1'); // for license terms
const formatted = formatEther(balance); // for display

// Address utilities
const isValid = isAddress('0x...');

// Account creation
const account = privateKeyToAccount('0x...');
```

### Environment Variable Pattern

```typescript
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

// Recommended .env pattern
// WALLET_PRIVATE_KEY=your_private_key_without_0x_prefix
// STORY_RPC_URL=https://aeneid.storyrpc.io
// STORY_CHAIN=aeneid

const account = privateKeyToAccount(`0x${process.env.WALLET_PRIVATE_KEY}`);
const config: StoryConfig = {
  account,
  transport: http(process.env.STORY_RPC_URL || 'https://aeneid.storyrpc.io'),
  chainId: (process.env.STORY_CHAIN as 'aeneid' | 'mainnet') || 'aeneid',
};

const client = StoryClient.newClient(config);
```

## Network Configuration

| Network | Chain ID | RPC | Explorer | Faucet |
|---------|----------|-----|----------|--------|
| Aeneid (testnet) | 1315 | `https://aeneid.storyrpc.io` | `https://aeneid.storyscan.io` | `https://aeneid.faucet.story.foundation/` |
| Mainnet | 1514 | `https://mainnet.storyrpc.io` | `https://mainnet.storyscan.xyz` | N/A |

## Common Pitfalls

1. **Missing viem dependency**: Always install both `@story-protocol/core-sdk` and `viem`. The SDK will not work without viem.
2. **Private key format**: `privateKeyToAccount` expects a `0x`-prefixed hex string. If your env var does not include the prefix, add it: `` `0x${process.env.WALLET_PRIVATE_KEY}` ``
3. **Wrong chainId type**: The `chainId` field in `StoryConfig` expects a string (`'aeneid'` or `'mainnet'`), not a number.
4. **Insufficient gas**: Write operations require native IP tokens for gas. Get testnet tokens from the faucet.
5. **Transaction deadline**: If a transaction is submitted after the deadline, it will revert. Omit the deadline for non-time-sensitive operations.
6. **BigInt values**: Monetary values (minting fees, royalty amounts) must be `BigInt`. Use `parseEther()` from viem to convert.
