# Derivative Registration Patterns

## Overview

A derivative IP is an IP Asset that is linked to one or more parent IPs under their license terms. Derivatives inherit the parent's license conditions and may owe royalties to the parent.

There are three main patterns for creating derivatives:

1. **linkDerivative with parent IPs + license terms** — link an existing IP as derivative
2. **linkDerivative with license tokens** — burn pre-minted license tokens
3. **registerDerivativeIpAsset** — mint NFT + register IP + link derivative atomically

## Pattern 1: linkDerivative with Parent IPs + License Terms

Use when you already have a registered IP Asset and want to make it a derivative of one or more parents.

```typescript
import { parseEther } from 'viem';

const response = await client.ipAsset.linkDerivative({
  childIpId: '0xChildIpId',
  parentIpIds: ['0xParentIpId1'],
  licenseTermsIds: [1n], // must match 1:1 with parentIpIds
  maxMintingFee: parseEther('2'), // max fee willing to pay per parent
  maxRevenueShare: 100_000_000, // max acceptable rev share (100%)
  maxRts: 100_000_000, // max royalty tokens (use 100_000_000 for simplicity)
});

console.log(`Linked: tx=${response.txHash}`);
```

### Multiple Parents

An IP can have multiple parents, each with different license terms:

```typescript
const response = await client.ipAsset.linkDerivative({
  childIpId: '0xChildIpId',
  parentIpIds: ['0xParent1', '0xParent2'],
  licenseTermsIds: [1n, 5n], // parent1 uses terms 1, parent2 uses terms 5
  maxMintingFee: parseEther('10'),
  maxRevenueShare: 100_000_000,
  maxRts: 100_000_000,
});
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `childIpId` | `Address` | Yes | The IP to become a derivative |
| `parentIpIds` | `Address[]` | Yes | Parent IP(s) to link to |
| `licenseTermsIds` | `bigint[]` | Yes | License terms ID for each parent (1:1 mapping) |
| `maxMintingFee` | `bigint` | Yes | Maximum minting fee to pay (slippage protection) |
| `maxRevenueShare` | `number` | Yes | Maximum revenue share percentage (0-100,000,000) |
| `maxRts` | `number` | Yes | Maximum royalty tokens (0-100,000,000) |

## Pattern 2: linkDerivative with License Tokens (Burn)

Use when the derivative creator has already minted license tokens. The tokens are burned during linking.

### Step 1: Mint license tokens

```typescript
import { parseEther } from 'viem';

const mintResponse = await client.license.mintLicenseTokens({
  licensorIpId: '0xParentIpId',
  licenseTermsId: 1n,
  amount: 1,
  maxMintingFee: parseEther('2'),
  maxRevenueShare: 100_000_000,
});

const licenseTokenId = mintResponse.licenseTokenIds[0];
```

### Step 2: Link derivative by burning tokens

```typescript
const response = await client.ipAsset.linkDerivative({
  childIpId: '0xChildIpId',
  licenseTokenIds: [licenseTokenId], // burn these tokens
  maxRts: 100_000_000,
});

console.log(`Linked via token burn: tx=${response.txHash}`);
```

### When to use this pattern

- The license token holder is different from the derivative IP owner
- You want to decouple payment (minting) from registration (linking)
- You minted tokens in advance and want to use them later

## Pattern 3: registerDerivativeIpAsset (Atomic)

Mint an NFT, register it as an IP Asset, and link it as a derivative of a parent — all in one transaction. This is the most gas-efficient pattern.

```typescript
import { PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

const response = await client.ipAsset.registerDerivativeIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xYourSPGCollection',
  },
  derivData: {
    parentIpIds: ['0xParentIpId'],
    licenseTermsIds: [1n],
    maxMintingFee: parseEther('2'),
    maxRevenueShare: 100_000_000,
    maxRts: 100_000_000,
  },
  ipMetadata: {
    ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
    ipMetadataHash: `0x${ipHash}`,
    nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
    nftMetadataHash: `0x${nftHash}`,
  },
});

console.log(`Derivative IP: ipId=${response.ipId}, tokenId=${response.tokenId}`);
```

### With existing NFT

```typescript
const response = await client.ipAsset.registerDerivativeIpAsset({
  nft: {
    type: 'minted',
    nftContract: '0xYourERC721',
    tokenId: '42',
  },
  derivData: {
    parentIpIds: ['0xParentIpId'],
    licenseTermsIds: [1n],
    maxMintingFee: parseEther('2'),
    maxRevenueShare: 100_000_000,
    maxRts: 100_000_000,
  },
  ipMetadata: { /* ... */ },
});
```

## Key Parameters Explained

### maxRts (Max Royalty Tokens)

- Range: 0 - 100,000,000
- Represents the maximum percentage of royalty tokens that can be allocated
- 100,000,000 = 100% (all royalty tokens)
- **Recommendation**: Use `100_000_000` unless you have a specific reason to limit it
- If set too low, the transaction will revert if the parent's terms require more

### maxMintingFee

- The maximum total fee (in `currency` wei) the caller is willing to pay for all parents combined
- Acts as slippage protection — if fees increase between submission and execution, the transaction reverts
- Set to `0` if the license terms have no minting fee

### maxRevenueShare

- Range: 0 - 100,000,000 (same encoding as `commercialRevShare`)
- Maximum revenue share percentage the caller accepts
- Acts as slippage protection for revenue share terms
- Use `100_000_000` to accept any revenue share

## Decision Tree

```text
Want to create a derivative IP?
├── Already have a registered child IP?
│   ├── Have license tokens? → Pattern 2 (burn tokens)
│   └── No tokens? → Pattern 1 (pay fee at link time)
└── Need to mint a new NFT?
    └── Pattern 3 (registerDerivativeIpAsset)
```

## Solidity Examples

### Link Derivative (Direct Contract Call)

```solidity
import { ILicensingModule } from "@story-protocol/core/interfaces/modules/licensing/ILicensingModule.sol";

ILicensingModule licensingModule = ILicensingModule(0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f);

// Pattern 1: with parent IPs + license terms
address[] memory parentIpIds = new address[](1);
parentIpIds[0] = parentIp;
uint256[] memory licenseTermsIds = new uint256[](1);
licenseTermsIds[0] = 1;

licensingModule.registerDerivative(
    childIpId,
    parentIpIds,
    licenseTermsIds,
    address(0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316), // PILicenseTemplate
    "",  // royaltyContext
    0,   // maxMintingFee
    100_000_000, // maxRts
    100_000_000  // maxRevenueShare
);
```

### Atomic Derivative via SPG

```solidity
import { DerivativeWorkflows } from "@story-protocol/periphery/workflows/DerivativeWorkflows.sol";
import { WorkflowStructs } from "@story-protocol/periphery/lib/WorkflowStructs.sol";

DerivativeWorkflows derivativeWorkflows =
    DerivativeWorkflows(0x9e2d496f72C547C2C535B167e06ED8729B374a4f);

(address ipId, uint256 tokenId) = derivativeWorkflows.mintAndRegisterIpAndMakeDerivative(
    spgNftContract,
    WorkflowStructs.MakeDerivative({
        parentIpIds: parentIpIds,
        licenseTermsIds: licenseTermsIds,
        licenseTemplate: 0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316,
        royaltyContext: "",
        maxMintingFee: 0,
        maxRts: 100_000_000,
        maxRevenueShare: 100_000_000
    }),
    WorkflowStructs.IPMetadata({
        ipMetadataURI: "ipfs://...",
        ipMetadataHash: bytes32(0),
        nftMetadataURI: "ipfs://...",
        nftMetadataHash: bytes32(0)
    }),
    recipient,
    true
);
```
