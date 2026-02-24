# IP Registration Patterns

## Decision Tree

```
Do you already have an ERC-721 NFT?
├── Yes → Use registerIpAsset with type: 'minted'
└── No
    ├── Do you have an SPG NFT collection?
    │   ├── Yes → Use registerIpAsset with type: 'mint'
    │   └── No → Create collection first with createNFTCollection
    └── Want to attach license terms too?
        └── Yes → Add licenseTermsData to registerIpAsset call
```

## Pattern 1: Register Existing NFT

Simplest path. You already own an ERC-721 NFT.

```typescript
const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'minted',
    nftContract: '0xYourERC721',
    tokenId: '42',
  },
  ipMetadata: { /* see metadata-standard.md */ },
});

// response.ipId — the IP Account address
// response.txHash
```

**Requirements:**
- Caller must own the NFT
- NFT must not already be registered

## Pattern 2: Create Collection + Mint + Register

Full flow from scratch.

```typescript
import { zeroAddress } from 'viem';

// Step 1: Create your collection
const collection = await client.nftClient.createNFTCollection({
  name: 'My IP Collection',
  symbol: 'MIP',
  isPublicMinting: false,
  mintOpen: true,
  mintFeeRecipient: zeroAddress,
  contractURI: '',
});

// Step 2: Mint + Register
const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: collection.spgNftContract,
  },
  ipMetadata: { /* see metadata-standard.md */ },
});
```

## Pattern 3: Register + Attach License Terms (Atomic)

One transaction for everything.

```typescript
import { PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xYourSPGCollection',
  },
  licenseTermsData: [
    {
      terms: PILFlavor.commercialRemix({
        commercialRevShare: 5,
        defaultMintingFee: parseEther('1'),
        currency: WIP_TOKEN_ADDRESS,
      }),
    },
  ],
  ipMetadata: { /* ... */ },
});

// response.ipId
// response.licenseTermsIds — the registered license terms IDs
```

## Pattern 4: Register + Distribute Royalty Tokens

```typescript
const response = await client.ipAsset.registerIpAsset({
  nft: { type: 'mint', spgNftContract: '0x...' },
  royaltyShares: [
    { recipient: '0xCreator1', percentage: 60 },
    { recipient: '0xCreator2', percentage: 40 },
  ],
  ipMetadata: { /* ... */ },
});
```

## Pattern 5: Solidity Direct Registration

```solidity
import { IPAssetRegistry } from "@story-protocol/core/registries/IPAssetRegistry.sol";

IPAssetRegistry public immutable IP_ASSET_REGISTRY =
    IPAssetRegistry(0x77319B4031e6eF1250907aa00018B8B1c67a244b);

function registerExistingNFT(address nftContract, uint256 tokenId) external {
    address ipId = IP_ASSET_REGISTRY.register(
        block.chainid,
        nftContract,
        tokenId
    );
}
```

## Pattern 6: SPG Solidity Registration

```solidity
import { RegistrationWorkflows } from "@story-protocol/periphery/workflows/RegistrationWorkflows.sol";
import { WorkflowStructs } from "@story-protocol/periphery/lib/WorkflowStructs.sol";

RegistrationWorkflows public immutable REGISTRATION =
    RegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424);

function mintAndRegister(address spgNftContract, address recipient) external {
    (address ipId, uint256 tokenId) = REGISTRATION.mintAndRegisterIp(
        spgNftContract,
        recipient,
        WorkflowStructs.IPMetadata({
            ipMetadataURI: "ipfs://...",
            ipMetadataHash: bytes32(0),
            nftMetadataURI: "ipfs://...",
            nftMetadataHash: bytes32(0)
        }),
        true // use permit signature
    );
}
```

## Testing with Public Testnet Collection

For quick testing on Aeneid testnet, use the public SPG collection:

```typescript
const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc', // public testnet
  },
  ipMetadata: {
    ipMetadataURI: '',
    ipMetadataHash: '0x',
    nftMetadataURI: '',
    nftMetadataHash: '0x',
  },
});
```

## Foundry Testing

Fork Aeneid for integration tests:

```bash
forge test --fork-url https://aeneid.storyrpc.io/
```
