# story-sdk Plugin

This plugin provides AI assistance for Story Protocol TypeScript SDK setup and usage.

## Key Concepts

- **StoryClient**: The main entry point for all SDK interactions, created via `StoryClient.newClient(config)`
- **StoryConfig**: Configuration object requiring `account`, `transport`, and `chainId`
- **Client Modules**: Specialized sub-clients (ipAsset, license, royalty, dispute, nftClient, etc.) accessed as properties on StoryClient
- **Viem Integration**: The SDK uses viem under the hood for wallet accounts, transports, and chain configuration

## Important

- The SDK requires `viem` as a peer dependency -- always install both `@story-protocol/core-sdk` and `viem`
- Chain IDs: 'aeneid' (testnet, chain 1315) and 'mainnet' (chain 1514)
- Backend uses `privateKeyToAccount` from `viem/accounts`; frontend uses wallet connectors
- All write operations return transaction hashes; use `deadline` parameter for time-sensitive transactions
