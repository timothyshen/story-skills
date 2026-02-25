---
name: licensing
description: Story Protocol licensing and derivatives. Use when user mentions "license", "PIL", "license terms", "derivative", "commercial use", "remix", "attach license", "PILFlavor", "commercialRevShare", or wants to configure IP licensing on Story.
allowed-tools: Read, Glob, Grep, WebFetch, Task(subagent_type:Explore)
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '0.1.0'
---

# Story Protocol Licensing and Derivatives

Guide for configuring IP licenses, attaching license terms, minting license tokens, and registering derivative IP on Story Protocol.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **PIL** | Programmable IP License — Story Protocol's onchain license framework. All terms live in `PILicenseTemplate`. |
| **LicenseTerms** | A struct with 16 fields that define permissions (commercial use, derivatives, revenue share, etc.). |
| **PILicenseTemplate** | The singleton contract at `0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316` that stores all registered license terms. |
| **License Token** | An ERC-721 NFT (`0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC`) minted when paying a minting fee. Burned to register derivatives. |
| **LicensingModule** | Core contract at `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f` managing license attachment, minting, and derivative linking. |
| **PILFlavor** | SDK helper that produces pre-configured `LicenseTerms` for common use cases. |

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

## Full LicenseTerms Struct

The `LicenseTerms` struct defines all permissions for an IP license. Every field matters.

| Field | Type | Range / Values | Description |
|-------|------|----------------|-------------|
| `transferable` | `bool` | `true` / `false` | Whether the license token can be transferred to another address |
| `royaltyPolicy` | `address` | Contract address or `zeroAddress` | Royalty policy contract (LAP or LRP). Use `zeroAddress` for no royalties |
| `defaultMintingFee` | `uint256` | 0+ (in wei) | Fee in `currency` tokens required to mint a license token |
| `expiration` | `uint256` | 0 = never, else Unix timestamp | When the license expires. 0 means perpetual |
| `commercialUse` | `bool` | `true` / `false` | Whether the licensee can use the IP commercially |
| `commercialAttribution` | `bool` | `true` / `false` | Whether commercial use requires attribution |
| `commercializerChecker` | `address` | Contract address or `zeroAddress` | Optional contract that gates who can commercialize |
| `commercializerCheckerData` | `bytes` | Arbitrary bytes | Data passed to the commercializer checker contract |
| `commercialRevShare` | `uint32` | 0 - 100,000,000 | Revenue share percentage. 10,000,000 = 10%. SDK takes 0-100 and converts automatically |
| `commercialRevCeiling` | `uint256` | 0 = unlimited, else wei | Maximum revenue before commercial rights expire |
| `derivativesAllowed` | `bool` | `true` / `false` | Whether derivatives can be created from this IP |
| `derivativesAttribution` | `bool` | `true` / `false` | Whether derivatives must attribute the parent |
| `derivativesApproval` | `bool` | `true` / `false` | Whether the IP owner must approve each derivative |
| `derivativesReciprocal` | `bool` | `true` / `false` | Whether derivatives must use the same license terms |
| `derivativeRevCeiling` | `uint256` | 0 = unlimited, else wei | Maximum revenue from derivatives before rights expire |
| `currency` | `address` | Whitelisted token | Payment token address. Must be whitelisted (WIP: `0x1514000000000000000000000000000000000000`) |
| `uri` | `string` | URL or empty | URI pointing to off-chain license text |

### commercialRevShare Encoding

The SDK and contract use different scales:

- **SDK**: Pass a human-readable percentage (0-100). Example: `commercialRevShare: 5` means 5%
- **Contract**: Stores a `uint32` in range 0-100,000,000. So 5% = 5,000,000
- The SDK converts automatically: `5` -> `5_000_000`

## PILFlavor Presets

### 1. Non-Commercial Social Remixing (licenseTermsId = 1)

This is **already registered** on both testnet and mainnet as `licenseTermsId = 1`. **Never re-register it.**

```typescript
// Just use the existing ID directly
const NON_COMMERCIAL_SOCIAL_REMIXING_ID = 1n;

// To attach to an IP Asset:
await client.license.attachLicenseTerms({
  ipId: '0xYourIpId',
  licenseTermsId: NON_COMMERCIAL_SOCIAL_REMIXING_ID,
});
```

Configuration: `commercialUse: false`, `derivativesAllowed: true`, `derivativesReciprocal: true`, `derivativesAttribution: true`.

### 2. Commercial Use

Allows commercial use with a minting fee but no derivatives.

```typescript
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

const response = await client.license.registerCommercialUsePIL({
  defaultMintingFee: parseEther('1'),
  currency: WIP_TOKEN_ADDRESS,
});

console.log(`License Terms ID: ${response.licenseTermsId}`);
```

### 3. Commercial Remix

Allows both commercial use and derivatives with a revenue share.

```typescript
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

const response = await client.license.registerCommercialRemixPIL({
  defaultMintingFee: parseEther('1'),
  commercialRevShare: 5, // 5% revenue share to parent
  currency: WIP_TOKEN_ADDRESS,
});

console.log(`License Terms ID: ${response.licenseTermsId}`);
```

### 4. Creative Commons Attribution

Non-commercial license that allows derivatives with attribution required.

```typescript
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';

const response = await client.license.registerCreativeCommonsAttributionPIL({
  currency: WIP_TOKEN_ADDRESS,
});

console.log(`License Terms ID: ${response.licenseTermsId}`);
```

### 5. PILFlavor Helper (Inline Terms)

Use `PILFlavor` helpers to generate `LicenseTerms` objects without a separate registration call. These are typically passed to `registerIpAsset` or `registerPilTermsAndAttach`.

```typescript
import { PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

const terms = PILFlavor.commercialRemix({
  commercialRevShare: 5, // 5%
  defaultMintingFee: parseEther('1'),
  currency: WIP_TOKEN_ADDRESS,
});

// Use in registerIpAsset:
const response = await client.ipAsset.registerIpAsset({
  nft: { type: 'mint', spgNftContract: '0xYourCollection' },
  licenseTermsData: [{ terms }],
  ipMetadata: { /* ... */ },
});
```

Available PILFlavor helpers:

- `PILFlavor.nonCommercialSocialRemixing()` — returns terms for non-commercial social remixing
- `PILFlavor.commercialUse({defaultMintingFee, currency})` — commercial use, no derivatives
- `PILFlavor.commercialRemix({commercialRevShare, defaultMintingFee, currency})` — commercial use + derivatives
- `PILFlavor.creativeCommonsAttribution({currency})` — non-commercial with attribution

## Attaching License Terms to an IP Asset

### attachLicenseTerms

Attach already-registered license terms to an IP Asset.

```typescript
const response = await client.license.attachLicenseTerms({
  ipId: '0xYourIpId',
  licenseTermsId: 1n, // existing license terms ID
});

// IMPORTANT: check response.success — returns false if already attached, does NOT throw
if (response.success) {
  console.log(`Attached: tx=${response.txHash}`);
} else {
  console.log('License terms were already attached to this IP');
}
```

### registerPilTermsAndAttach

Register new PIL terms AND attach them to an IP in one call.

```typescript
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

const response = await client.license.registerPilTermsAndAttach({
  ipId: '0xYourIpId',
  terms: {
    transferable: true,
    royaltyPolicy: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E', // RoyaltyPolicyLAP
    defaultMintingFee: parseEther('1'),
    expiration: 0n,
    commercialUse: true,
    commercialAttribution: true,
    commercializerChecker: '0x0000000000000000000000000000000000000000',
    commercializerCheckerData: '0x',
    commercialRevShare: 5, // 5%
    commercialRevCeiling: 0n,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    derivativeRevCeiling: 0n,
    currency: WIP_TOKEN_ADDRESS,
    uri: '',
  },
});

console.log(`License Terms ID: ${response.licenseTermsId}, tx: ${response.txHash}`);
```

## Minting License Tokens

### mintLicenseTokens

Mint license tokens for a given IP. The caller pays `defaultMintingFee * amount`.

```typescript
const response = await client.license.mintLicenseTokens({
  licensorIpId: '0xParentIpId',
  licenseTermsId: 1n,
  amount: 1,
  receiver: '0xRecipientAddress', // optional, defaults to caller
  maxMintingFee: parseEther('2'), // max fee willing to pay (slippage protection)
  maxRevenueShare: 100_000_000, // max rev share (100% = 100_000_000)
});

console.log(`License Token IDs: ${response.licenseTokenIds}`);
```

### predictMintingLicenseFee

Predict the total fee before minting.

```typescript
const fee = await client.license.predictMintingLicenseFee({
  licensorIpId: '0xParentIpId',
  licenseTermsId: 1n,
  amount: 1,
  receiver: '0xRecipient',
});

console.log(`Token fee: ${fee.tokenMintingFee}`);
```

## Derivatives

### Pattern 1: linkDerivative with Parent IPs + License Terms

Link an existing IP as a derivative of one or more parent IPs. The caller must own the child IP and have permission. The minting fee is paid automatically.

```typescript
const response = await client.ipAsset.linkDerivative({
  childIpId: '0xChildIpId',
  parentIpIds: ['0xParentIpId1'],
  licenseTermsIds: [1n], // one per parent
  maxMintingFee: parseEther('2'),
  maxRevenueShare: 100_000_000, // 0-100_000_000 range
  maxRts: 100_000_000, // max royalty tokens, use 100_000_000 for simplicity
});

console.log(`Linked: tx=${response.txHash}`);
```

### Pattern 2: linkDerivative with License Tokens (Burn Tokens)

Use pre-minted license tokens instead of paying the fee at link time.

```typescript
const response = await client.ipAsset.linkDerivative({
  childIpId: '0xChildIpId',
  licenseTokenIds: [123n], // burn these license tokens
  maxRts: 100_000_000,
});

console.log(`Linked via tokens: tx=${response.txHash}`);
```

### Pattern 3: registerDerivativeIpAsset (Atomic)

Mint an NFT, register it as IP, and make it a derivative of a parent — all in one transaction.

```typescript
import { PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

const response = await client.ipAsset.registerDerivativeIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xYourCollection',
  },
  derivData: {
    parentIpIds: ['0xParentIpId'],
    licenseTermsIds: [1n],
    maxMintingFee: parseEther('2'),
    maxRevenueShare: 100_000_000,
    maxRts: 100_000_000,
  },
  ipMetadata: {
    ipMetadataURI: '',
    ipMetadataHash: '0x',
    nftMetadataURI: '',
    nftMetadataHash: '0x',
  },
});

console.log(`Derivative IP: ipId=${response.ipId}, tx=${response.txHash}`);
```

## License Module SDK Methods

| Method | Description |
|--------|-------------|
| `client.license.registerCommercialUsePIL(...)` | Register Commercial Use PIL terms |
| `client.license.registerCommercialRemixPIL(...)` | Register Commercial Remix PIL terms |
| `client.license.registerCreativeCommonsAttributionPIL(...)` | Register CC Attribution terms |
| `client.license.registerPilTermsAndAttach(...)` | Register custom PIL terms and attach to IP |
| `client.license.attachLicenseTerms(...)` | Attach existing terms to an IP |
| `client.license.mintLicenseTokens(...)` | Mint license tokens (pay minting fee) |
| `client.license.predictMintingLicenseFee(...)` | Predict the fee for minting tokens |
| `client.license.setLicensingConfig(...)` | Configure licensing parameters for an IP |
| `client.license.getLicenseTerms(...)` | Get license terms by ID |
| `client.ipAsset.linkDerivative(...)` | Link existing IP as derivative |
| `client.ipAsset.registerDerivativeIpAsset(...)` | Mint + register + derivative in one tx |

## Common Pitfalls

1. **Re-registering Non-Commercial Social Remixing**: `licenseTermsId=1` already exists on both networks. Calling `registerNonComSocialRemixingPIL()` will return the existing ID, wasting gas. Just use `1n` directly.

2. **commercialRevShare encoding**: The SDK takes a human-readable percentage (0-100). Do NOT pass `5_000_000` to the SDK — pass `5` for 5%. The SDK handles conversion.

3. **Not checking response.success**: `attachLicenseTerms` returns `{success: false}` if terms are already attached to the IP. It does **not** throw. Always check `response.success`.

4. **maxRts out of range**: `maxRts` must be in the range 0-100,000,000. Using `100_000_000` (100%) is the simplest default.

5. **Currency not whitelisted**: The `currency` address in license terms must be whitelisted. Use WIP (`0x1514000000000000000000000000000000000000`) on mainnet or MERC20 (`0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E`) on Aeneid testnet.

6. **Multicall3 with SPG functions**: Do NOT use standard Multicall3 (`0xcA11bde05977b3631167028862bE2a173976CA11`) with SPG functions that involve SPGNFT minting. Use SPG's built-in `multicall` method instead.

7. **Wrong royaltyPolicy address**: If `commercialUse` is true and you want royalties, set `royaltyPolicy` to `RoyaltyPolicyLAP` (`0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E`) or `RoyaltyPolicyLRP` (`0x9156e603C949481883B1d3355c6f1132D191fC41`). Using `zeroAddress` with commercial use means no royalty enforcement.

## Contract Addresses

| Contract | Address |
|----------|---------|
| PILicenseTemplate | `0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316` |
| LicensingModule | `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f` |
| LicenseRegistry | `0x529a750E02d8E2f15649c13D69a465286a780e24` |
| LicenseToken | `0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC` |
| RoyaltyPolicyLAP | `0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E` |
| RoyaltyPolicyLRP | `0x9156e603C949481883B1d3355c6f1132D191fC41` |
| LicenseAttachmentWorkflows | `0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8` |
| DerivativeWorkflows | `0x9e2d496f72C547C2C535B167e06ED8729B374a4f` |

## Network Configuration

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Aeneid (testnet) | 1315 | `https://aeneid.storyrpc.io` | `https://aeneid.storyscan.io` |
| Mainnet | 1514 | `https://mainnet.storyrpc.io` | `https://mainnet.storyscan.xyz` |

## Payment Tokens

| Network | Token | Address |
|---------|-------|---------|
| Both | WIP (Wrapped IP) | `0x1514000000000000000000000000000000000000` |
| Aeneid | MERC20 (test) | `0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E` |
