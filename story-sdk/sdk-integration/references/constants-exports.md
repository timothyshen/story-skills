# Constants and Exports Reference

All exports from `@story-protocol/core-sdk`.

## Main Client

```typescript
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

// Create a new client instance
const client = StoryClient.newClient(config);
```

| Export | Type | Description |
|--------|------|-------------|
| `StoryClient` | Class | Main SDK client; use `StoryClient.newClient(config)` to instantiate |
| `StoryConfig` | TypeScript type | Configuration interface: `{ account, transport, chainId }` |

## Constants

### Token Addresses

| Export | Value | Description |
|--------|-------|-------------|
| `WIP_TOKEN_ADDRESS` | `0x1514000000000000000000000000000000000000` | Wrapped IP (WIP) ERC-20 token address (same on all networks) |

### Royalty Constants

| Export | Value | Description |
|--------|-------|-------------|
| `royaltySharesTotalSupply` | `100000000` (100 million) | Total supply of royalty shares in an IP's royalty vault |
| `MAX_ROYALTY_TOKEN` | Maximum royalty token value | Upper bound for royalty token distribution |

### Permission Constants

| Export | Value | Description |
|--------|-------|-------------|
| `defaultFunctionSelector` | `0x00000000` | Default function selector used for permission wildcards |

## Types

### LicenseTerms

```typescript
import type { LicenseTerms } from '@story-protocol/core-sdk';

// Full LicenseTerms structure
interface LicenseTerms {
  transferable: boolean;
  royaltyPolicy: Address;
  defaultMintingFee: bigint;
  expiration: bigint;
  commercialUse: boolean;
  commercialAttribution: boolean;
  commercializerChecker: Address;
  commercializerCheckerData: Hex;
  commercialRevShare: number;
  commercialRevCeiling: bigint;
  derivativesAllowed: boolean;
  derivativesAttribution: boolean;
  derivativesApproval: boolean;
  derivativesReciprocal: boolean;
  derivativeRevCeiling: bigint;
  currency: Address;
  uri: string;
}
```

### StoryConfig

```typescript
import type { StoryConfig } from '@story-protocol/core-sdk';

interface StoryConfig {
  account: Account;       // viem Account
  transport: Transport;   // viem Transport
  chainId: 'aeneid' | 'mainnet';
}
```

### Other Types

| Type | Description |
|------|-------------|
| `LicensingConfig` | Configuration for licensing behavior on an IP |
| `IPMetadata` | `{ ipMetadataURI, ipMetadataHash, nftMetadataURI, nftMetadataHash }` |
| `PILFlavor` | Helper class with static methods for creating license terms |

## License Term Helpers (PILFlavor)

```typescript
import { PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

// Non-commercial social remixing
// Free to use, must attribute, derivatives must use same terms
const ncTerms = PILFlavor.nonCommercialSocialRemixing();

// Commercial use (no derivatives)
// Pay minting fee, can use commercially, no derivatives allowed
const cuTerms = PILFlavor.commercialUse({
  defaultMintingFee: parseEther('1'),
  currency: WIP_TOKEN_ADDRESS,
});

// Commercial remix (derivatives allowed)
// Pay minting fee, derivatives must share revenue
const crTerms = PILFlavor.commercialRemix({
  commercialRevShare: 10, // 10%
  defaultMintingFee: parseEther('0.1'),
  currency: WIP_TOKEN_ADDRESS,
});
```

## Chain Objects

```typescript
import { aeneid, mainnet } from '@story-protocol/core-sdk';
```

### aeneid

| Property | Value |
|----------|-------|
| `id` | `1315` |
| `name` | `'Story Aeneid Testnet'` |
| `network` | `'story-aeneid'` |
| `nativeCurrency.name` | `'IP'` |
| `nativeCurrency.symbol` | `'IP'` |
| `nativeCurrency.decimals` | `18` |
| `rpcUrls.default.http` | `['https://aeneid.storyrpc.io']` |
| `blockExplorers.default.url` | `'https://aeneid.storyscan.io'` |

### mainnet

| Property | Value |
|----------|-------|
| `id` | `1514` |
| `name` | `'Story Mainnet'` |
| `network` | `'story'` |
| `nativeCurrency.name` | `'IP'` |
| `nativeCurrency.symbol` | `'IP'` |
| `nativeCurrency.decimals` | `18` |
| `rpcUrls.default.http` | `['https://mainnet.storyrpc.io']` |
| `blockExplorers.default.url` | `'https://mainnet.storyscan.xyz'` |

## Utility Functions

### IPFS Utilities

```typescript
import {
  convertCIDtoHashIPFS,
  convertHashIPFStoCID,
} from '@story-protocol/core-sdk';

// Convert an IPFS CID to its hash representation
const hash = convertCIDtoHashIPFS('QmExampleCID...');

// Convert an IPFS hash back to a CID
const cid = convertHashIPFStoCID('0xExampleHash...');
```

### Signature Utilities

```typescript
import {
  getPermissionSignature,
  getSignature,
} from '@story-protocol/core-sdk';

// Generate a permission signature for IP Account operations
// Used when setting permissions via signature (EIP-712)
const permSig = await getPermissionSignature({
  ipId: '0xIpAccountAddress',
  wallet: walletClient,
  permissions: [
    {
      ipId: '0xIpAccountAddress',
      signer: '0xSignerAddress',
      to: '0xTargetContract',
      func: '0xFunctionSelector',
      permission: 1, // ALLOW
    },
  ],
  nonce: nonce,
  chainId: 1315,
  deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
});

// Generate a generic signature for SDK operations
const sig = await getSignature({
  wallet: walletClient,
  // ... operation-specific params
});
```

## Contract Address Exports

The SDK also exports contract addresses used internally. Key addresses (same on both networks):

| Contract | Address |
|----------|---------|
| IPAssetRegistry | `0x77319B4031e6eF1250907aa00018B8B1c67a244b` |
| LicensingModule | `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f` |
| RoyaltyModule | `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086` |
| DisputeModule | `0x9b7A9c70AFF961C799110954fc06F3093aeb94C5` |
| PILicenseTemplate | `0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316` |
| AccessController | `0xcCF37d0a503Ee1D4C11208672e622ed3DFB2275a` |
| LicenseRegistry | `0x529a750E02d8E2f15649c13D69a465286a780e24` |
| LicenseToken | `0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC` |
| RoyaltyPolicyLAP | `0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E` |
| RoyaltyPolicyLRP | `0x9156e603C949481883B1d3355c6f1132D191fC41` |
| CoreMetadataModule | `0x6E81a25C99C6e8430aeC7353325EB138aFE5DC16` |
| GroupingModule | `0x69D3a7aa9edb72Bc226E745A7cCdd50D947b69Ac` |
| EvenSplitGroupPool | `0xf96f2c30b41Cb6e0290de43C8528ae83d4f33F89` |
| RegistrationWorkflows | `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424` |
| WIP Token | `0x1514000000000000000000000000000000000000` |
