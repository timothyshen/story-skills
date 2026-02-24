# IPA Metadata Standard

Story Protocol requires two separate metadata objects for IP Assets.

## IP Metadata (IPA Standard)

Stored in the IP Account via CoreMetadataModule. This is Story Protocol's custom standard.

```json
{
  "title": "My Creative Work",
  "description": "Description of the IP",
  "createdAt": "1740005219",
  "creators": [
    {
      "name": "Alice",
      "address": "0xA2f9Cf1E40D7b03aB81e34BC50f0A8c67B4e9112",
      "contributionPercent": 100,
      "description": "Original creator",
      "socialMedia": [
        { "platform": "Twitter", "url": "https://twitter.com/alice" }
      ],
      "role": "Author"
    }
  ],
  "image": "https://ipfs.io/ipfs/QmImage...",
  "imageHash": "0x...",
  "mediaUrl": "https://ipfs.io/ipfs/QmMedia...",
  "mediaHash": "0x...",
  "mediaType": "image/webp",
  "ipType": "character",
  "tags": ["ai", "character"],
  "aiMetadata": {
    "characterFileUrl": "https://ipfs.io/ipfs/QmCharFile...",
    "characterFileHash": "0x..."
  }
}
```

### IP Metadata Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Title of the IP |
| description | string | No | Description |
| createdAt | string | No | Unix timestamp |
| creators | array | No | Creator objects |
| image | string | No | Image URL |
| imageHash | string | No | SHA-256 hash of image, `0x`-prefixed |
| mediaUrl | string | No | Primary media URL |
| mediaHash | string | No | SHA-256 hash of media |
| mediaType | string | No | MIME type |
| ipType | string | No | e.g., "character", "story", "music" |
| tags | string[] | No | Categorization tags |
| aiMetadata | object | No | AI-specific fields |
| relationships | array | No | Relationships to other IPs |

### Supported Media Types

`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`, `audio/mpeg`, `audio/wav`, `audio/flac`, `audio/ogg`, `video/mp4`, `video/webm`

### Relationship Types

**Story types:** APPEARS_IN, BELONGS_TO, PART_OF, CONTINUATION_OF, ADAPTATION_OF, INSPIRED_BY, REFERENCES, CROSSOVER_WITH

**AI types:** TRAINED_ON, FINETUNED_FROM, GENERATED_FROM, DERIVED_FROM

## NFT Metadata (OpenSea ERC-721 Standard)

Standard ERC-721 metadata for the ownership NFT.

```json
{
  "name": "Ownership NFT for My IP",
  "description": "Represents ownership of the IP Asset",
  "image": "https://ipfs.io/ipfs/QmImage...",
  "attributes": [
    { "trait_type": "IP Type", "value": "Character" }
  ]
}
```

## IPFS Upload and Hashing

Both metadata objects must be uploaded to IPFS and their SHA-256 hashes computed.

```typescript
import { PinataSDK } from 'pinata-web3';
import { createHash } from 'crypto';

const pinata = new PinataSDK({ pinataJwt: process.env.PINATA_JWT });

// Upload to IPFS
async function uploadToIPFS(metadata: object): Promise<string> {
  const { IpfsHash } = await pinata.upload.json(metadata);
  return IpfsHash;
}

// Compute hash
function computeHash(metadata: object): string {
  return createHash('sha256')
    .update(JSON.stringify(metadata))
    .digest('hex');
}

// Usage
const ipIpfsHash = await uploadToIPFS(ipMetadata);
const ipHash = computeHash(ipMetadata);
const nftIpfsHash = await uploadToIPFS(nftMetadata);
const nftHash = computeHash(nftMetadata);

// Pass to registerIpAsset
const response = await client.ipAsset.registerIpAsset({
  nft: { ... },
  ipMetadata: {
    ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
    ipMetadataHash: `0x${ipHash}`,
    nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
    nftMetadataHash: `0x${nftHash}`,
  },
});
```

## Common Mistakes

1. **Confusing IP metadata with NFT metadata** — they are separate objects with different schemas
2. **Wrong hash format** — must be SHA-256, hex-encoded, `0x`-prefixed
3. **Missing hash** — if you provide a URI, always provide the corresponding hash
4. **Using token URI as metadata** — the token URI points to NFT metadata, not IP metadata
