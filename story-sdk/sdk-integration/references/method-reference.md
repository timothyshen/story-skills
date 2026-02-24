# SDK Method Reference

All methods organized by client module. Each method includes its name, parameters, return type, and brief description.

## IPAssetClient (`client.ipAsset`)

| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `registerIpAsset` | `{ nft, ipMetadata?, licenseTermsData?, royaltyShares?, deadline? }` | `{ ipId, txHash, tokenId?, licenseTermsIds? }` | Register an IP asset (existing NFT or mint new via SPG) |
| `registerDerivativeIpAsset` | `{ nft, derivData, ipMetadata?, deadline? }` | `{ ipId, txHash, tokenId? }` | Register a derivative IP asset linked to parent IPs |
| `linkDerivative` | `{ childIpId, parentIpIds, licenseTermsIds, deadline? }` | `{ txHash }` | Link an already-registered IP as a derivative of parent IPs |

### registerIpAsset Parameters

```typescript
// For existing NFT:
{
  nft: {
    type: 'minted',
    nftContract: Address,  // ERC-721 contract address
    tokenId: string,       // Token ID
  },
  ipMetadata?: {
    ipMetadataURI: string,
    ipMetadataHash: Hex,
    nftMetadataURI: string,
    nftMetadataHash: Hex,
  },
  licenseTermsData?: Array<{
    terms: LicenseTerms,
    licensingConfig?: LicensingConfig,
  }>,
  deadline?: bigint,
}

// For mint + register via SPG:
{
  nft: {
    type: 'mint',
    spgNftContract: Address,  // SPG NFT collection address
  },
  ipMetadata?: { /* same as above */ },
  licenseTermsData?: [ /* same as above */ ],
  royaltyShares?: Array<{
    recipient: Address,
    percentage: number,
  }>,
  deadline?: bigint,
}
```

### registerDerivativeIpAsset Parameters

```typescript
{
  nft: {
    type: 'mint',
    spgNftContract: Address,
  },
  derivData: {
    parentIpIds: Address[],
    licenseTermsIds: string[],
    maxMintingFee?: bigint,
    maxRts?: number,
    maxRevenueShare?: number,
  },
  ipMetadata?: {
    ipMetadataURI: string,
    ipMetadataHash: Hex,
    nftMetadataURI: string,
    nftMetadataHash: Hex,
  },
  deadline?: bigint,
}
```

## LicenseClient (`client.license`)

| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `registerPILTerms` | `{ terms }` | `{ licenseTermsId, txHash }` | Register new PIL license terms on the PILicenseTemplate |
| `attachLicenseTerms` | `{ ipId, licenseTermsId }` | `{ txHash }` | Attach registered license terms to an IP asset |
| `mintLicenseTokens` | `{ licensorIpId, licenseTermsId, amount, receiver }` | `{ txHash, licenseTokenIds }` | Mint license tokens for a licensed IP |
| `getLicenseTerms` | `{ licenseTermsId }` | `LicenseTerms` | Read license terms by ID (view call, no gas) |
| `registerPILTermsAndAttach` | `{ ipId, terms }` | `{ licenseTermsId, txHash }` | Register PIL terms and attach to IP in one transaction |

### PILFlavor Helpers

```typescript
import { PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

// Non-commercial social remixing (free, attribution required)
PILFlavor.nonCommercialSocialRemixing()

// Commercial use (no derivatives allowed)
PILFlavor.commercialUse({
  defaultMintingFee: parseEther('1'),
  currency: WIP_TOKEN_ADDRESS,
})

// Commercial remix (derivatives allowed with revenue share)
PILFlavor.commercialRemix({
  commercialRevShare: 10,  // percentage (0-100)
  defaultMintingFee: parseEther('0.1'),
  currency: WIP_TOKEN_ADDRESS,
})
```

## RoyaltyClient (`client.royalty`)

| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `payRoyaltyOnBehalf` | `{ receiverIpId, payerIpId, token, amount }` | `{ txHash }` | Pay royalty to an IP's royalty vault |
| `claimAllRevenue` | `{ ancestorIpId, claimer, childIpIds, royaltyPolicies, currencyTokens }` | `{ txHash, amountsClaimed }` | Claim all accrued revenue from descendants |
| `batchClaimAllRevenue` | `{ ancestorIpId, claimer, childIpIds, royaltyPolicies, currencyTokens }` | `{ txHash }` | Batch claim revenue from multiple descendants |
| `snapshot` | `{ royaltyVaultIpId }` | `{ txHash, snapshotId }` | Take a snapshot of the royalty vault for claiming |

### claimAllRevenue Parameters

```typescript
{
  ancestorIpId: Address,     // The IP whose revenue is being claimed
  claimer: Address,          // Who receives the claimed tokens
  childIpIds: Address[],     // Descendant IPs that owe royalties
  royaltyPolicies: Address[],// Royalty policy addresses for each child
  currencyTokens: Address[], // Tokens to claim (e.g., WIP_TOKEN_ADDRESS)
}
```

## DisputeClient (`client.dispute`)

| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `raiseDispute` | `{ targetIpId, disputeEvidenceHash, targetTag, bond }` | `{ txHash, disputeId }` | Raise a dispute against an IP asset |
| `resolveDispute` | `{ disputeId, data }` | `{ txHash }` | Resolve an existing dispute |
| `cancelDispute` | `{ disputeId, data }` | `{ txHash }` | Cancel a dispute raised by the caller |
| `tagIfRelatedIpInfringed` | `{ infringerId, parentIpId, disputeId }` | `{ txHash }` | Tag a related IP if parent is found infringing |

### Dispute Tags

| Tag | Description |
|-----|-------------|
| `PLAGIARISM` | Content was plagiarized |
| `INAPPROPRIATE` | Content violates community standards |
| `IMPROPER_REGISTRATION` | IP was registered improperly |

## NftClient (`client.nftClient`)

| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `createNFTCollection` | `{ name, symbol, isPublicMinting, mintOpen, mintFeeRecipient, contractURI }` | `{ txHash, spgNftContract }` | Create a new SPG-compatible NFT collection |

### createNFTCollection Parameters

```typescript
{
  name: string,              // Collection name
  symbol: string,            // Token symbol (e.g., 'MIP')
  isPublicMinting: boolean,  // Whether anyone can mint
  mintOpen: boolean,         // Whether minting is currently open
  mintFeeRecipient: Address, // Who receives minting fees (use zeroAddress for none)
  contractURI: string,       // Collection-level metadata URI
  mintFee?: bigint,          // Fee per mint (optional)
  maxSupply?: number,        // Maximum token supply (optional)
  baseURI?: string,          // Base URI for token metadata (optional)
}
```

## GroupClient (`client.groupClient`)

| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `registerGroup` | `{ groupPool }` | `{ txHash, groupIpId }` | Register a new IP group with a reward pool |
| `addIpToGroup` | `{ groupIpId, ipIds }` | `{ txHash }` | Add IP assets to an existing group |
| `removeIpFromGroup` | `{ groupIpId, ipIds }` | `{ txHash }` | Remove IP assets from a group |
| `claimReward` | `{ groupIpId, token, ipIds }` | `{ txHash }` | Claim reward tokens for group members |

### Group Pools

| Pool | Address | Description |
|------|---------|-------------|
| EvenSplitGroupPool | `0xf96f2c30b41Cb6e0290de43C8528ae83d4f33F89` | Splits revenue evenly among all group members |

## WipClient (`client.wipClient`)

| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `deposit` | `{ amount }` | `{ txHash }` | Wrap native IP tokens into WIP (ERC-20) |
| `withdraw` | `{ amount }` | `{ txHash }` | Unwrap WIP back to native IP tokens |
| `approve` | `{ spender, amount }` | `{ txHash }` | Approve a spender to use WIP tokens |
| `transfer` | `{ to, amount }` | `{ txHash }` | Transfer WIP tokens to another address |

## IPAccountClient (`client.ipAccountClient`)

| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `execute` | `{ to, value, data, ipId }` | `{ txHash }` | Execute a call from the IP Account |
| `executeWithSig` | `{ to, value, data, ipId, signer, deadline, signature }` | `{ txHash }` | Execute a call with an EIP-712 signature |
| `getIpAccountNonce` | `{ ipId }` | `bigint` | Get the current nonce of an IP Account |

## PermissionClient (`client.permissionClient`)

| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `setPermission` | `{ ipId, signer, to, func, permission }` | `{ txHash }` | Set permission for a signer on an IP Account |
| `setBatchPermissions` | `{ permissions }` | `{ txHash }` | Set multiple permissions in one transaction |
| `createSetPermissionSignature` | `{ ipId, signer, to, func, permission, deadline, nonce }` | `{ txHash }` | Create a permission-setting signature |

### Permission Values

| Value | Meaning |
|-------|---------|
| `0` | ABSTAIN (not set) |
| `1` | ALLOW |
| `2` | DENY |
