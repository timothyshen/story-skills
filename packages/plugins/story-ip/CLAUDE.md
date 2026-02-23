# story-ip Plugin

This plugin provides AI assistance for Story Protocol IP Asset registration.

## Key Concepts

- **IP Asset**: An ERC-721 NFT registered in the IPAssetRegistry
- **IP Account**: An ERC-6551 Token Bound Account deployed for each IP Asset (this is the `ipId`)
- **SPG (Story Protocol Gateway)**: Periphery contracts that bundle mint + register into one transaction

## Important

- ipId is NOT the token ID. It's the IP Account contract address derived from `IPAssetRegistry.ipId(chainId, tokenContract, tokenId)`
- Two registration paths: direct (existing NFT) vs SPG (mint + register)
- Metadata has two parts: IP metadata (Story standard) and NFT metadata (ERC-721/OpenSea standard)
