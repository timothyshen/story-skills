---
name: ip-registration
description: Register IP assets on Story Protocol. Use when user mentions "register IP", "IP Asset", "mintAndRegisterIp", "createCollection", "SPG", "Story Protocol registration", "ipId", or wants to mint NFTs as IP on Story.
allowed-tools: Read, Glob, Grep, WebFetch, Task(subagent_type:Explore)
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '0.1.0'
---

# IP Asset Registration on Story Protocol

Guide for registering IP assets on Story Protocol's onchain IP infrastructure.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **IP Asset** | An ERC-721 NFT registered into the global IPAssetRegistry. Represents programmable IP. |
| **IP Account** | An ERC-6551 Token Bound Account auto-deployed for each IP Asset. This IS the `ipId`. |
| **IPAssetRegistry** | Global registry contract at `0x77319B4031e6eF1250907aa00018B8B1c67a244b` |
| **SPG** | Story Protocol Gateway — periphery contracts bundling mint + register into one tx |
| **RegistrationWorkflows** | SPG contract at `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424` |

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
  chainId: 'aeneid', // or 'mainnet'
};

const client = StoryClient.newClient(config);
```

## Two Registration Paths

### Path 1: Register an Existing NFT

Use when you already have an ERC-721 NFT and want to register it as an IP Asset.

```typescript
const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'minted',
    nftContract: '0xYourERC721ContractAddress',
    tokenId: '42',
  },
  ipMetadata: {
    ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
    ipMetadataHash: `0x${ipHash}`,
    nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
    nftMetadataHash: `0x${nftHash}`,
  },
});

console.log(`IP Asset registered: ipId=${response.ipId}, tx=${response.txHash}`);
```

### Path 2: Mint + Register via SPG (One Transaction)

Use when you need to mint a new NFT AND register it as IP in a single transaction.

```typescript
const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc', // public testnet collection
  },
  ipMetadata: {
    ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
    ipMetadataHash: `0x${ipHash}`,
    nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
    nftMetadataHash: `0x${nftHash}`,
  },
});
```

### Path 2 with License Terms (Atomic)

Register IP and attach license terms in one transaction:

```typescript
import { PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc',
  },
  licenseTermsData: [
    {
      terms: PILFlavor.commercialRemix({
        commercialRevShare: 5, // 5%
        defaultMintingFee: parseEther('1'),
        currency: WIP_TOKEN_ADDRESS,
      }),
    },
  ],
  ipMetadata: {
    ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
    ipMetadataHash: `0x${ipHash}`,
    nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
    nftMetadataHash: `0x${nftHash}`,
  },
});
```

## Creating Your Own SPG NFT Collection

```typescript
import { zeroAddress } from 'viem';

const newCollection = await client.nftClient.createNFTCollection({
  name: 'My IP Collection',
  symbol: 'MIP',
  isPublicMinting: false, // only owner can mint
  mintOpen: true,
  mintFeeRecipient: zeroAddress,
  contractURI: '',
});

console.log(`Collection: ${newCollection.spgNftContract}`);
// Use newCollection.spgNftContract in registerIpAsset with type: 'mint'
```

## ipId Derivation

The `ipId` is deterministic. You can compute it without registering:

```typescript
// Solidity
address ipId = IP_ASSET_REGISTRY.ipId(block.chainid, tokenContract, tokenId);

// The ipId is an ERC-6551 Token Bound Account address
// It is NOT the NFT token ID
```

## Metadata

Two separate metadata objects are required. See `references/metadata-standard.md` for the full specification.

**IP Metadata** (Story's IPA standard):

- `title`, `description`, `createdAt`, `creators[]`, `image`, `mediaUrl`, `ipType`, `tags`

**NFT Metadata** (OpenSea ERC-721 standard):

- `name`, `description`, `image`, `attributes[]`

Both must be uploaded to IPFS and their SHA-256 hashes computed:

```typescript
import { createHash } from 'crypto';

const ipHash = createHash('sha256')
  .update(JSON.stringify(ipMetadata))
  .digest('hex');
// Pass as: `0x${ipHash}`
```

## Solidity (Direct Contract Calls)

```solidity
// Register existing NFT
address ipId = IP_ASSET_REGISTRY.register(
    block.chainid,
    address(nftContract),
    tokenId
);

// SPG mint + register
(address ipId, uint256 tokenId) = REGISTRATION_WORKFLOWS.mintAndRegisterIp(
    spgNftContract,
    recipient,
    WorkflowStructs.IPMetadata({
        ipMetadataURI: "...",
        ipMetadataHash: bytes32(...),
        nftMetadataURI: "...",
        nftMetadataHash: bytes32(...)
    }),
    true
);
```

## Common Pitfalls

1. **ipId vs tokenId**: `ipId` is the IP Account contract address, NOT the ERC-721 token ID.
2. **Metadata confusion**: IP metadata (Story standard) and NFT metadata (OpenSea standard) are separate objects with different schemas.
3. **SPG collection ownership**: The caller of `mintAndRegisterIp` must have minting rights on the SPG NFT collection (unless `isPublicMinting: true`).
4. **Hash format**: `ipMetadataHash` must be SHA-256 of the JSON content, prefixed with `0x`.
5. **Duplicate registration**: Setting `allowDuplicates: false` prevents registering the same NFT twice (default behavior).
6. **Multicall3 incompatibility**: Do NOT use standard Multicall3 (`0xcA11bde05977b3631167028862bE2a173976CA11`) with SPG functions involving SPGNFT minting. Use SPG's built-in `multicall` instead.

## Network Configuration

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Aeneid (testnet) | 1315 | `https://aeneid.storyrpc.io` | `https://aeneid.storyscan.io` |
| Mainnet | 1514 | `https://mainnet.storyrpc.io` | `https://mainnet.storyscan.xyz` |

## Contract Addresses

See `references/contract-addresses.md` for the complete list. Key addresses (same on both networks):

| Contract | Address |
|----------|---------|
| IPAssetRegistry | `0x77319B4031e6eF1250907aa00018B8B1c67a244b` |
| RegistrationWorkflows (SPG) | `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424` |
| CoreMetadataModule | `0x6E81a25C99C6e8430aeC7353325EB138aFE5DC16` |

Public testnet SPG collection: `0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc`
