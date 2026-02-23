# story-sdk

AI-powered assistance for Story Protocol TypeScript SDK setup, client initialization, and usage patterns.

## Skills

### sdk-integration

Guides developers through setting up and using the Story Protocol TypeScript SDK, covering:

- Installing `@story-protocol/core-sdk` and `viem`
- Client initialization with `StoryClient.newClient(config)`
- All client modules: ipAsset, license, royalty, dispute, nftClient, groupClient, wipClient
- Key exports: StoryClient, StoryConfig, WIP_TOKEN_ADDRESS, PILFlavor, chain objects
- Common patterns: error handling, transaction confirmation, deadline parameter
- Viem integration and utility functions

## Installation

```bash
npx skills add storyprotocol/story-skills
```

## Usage

The skill activates contextually when you mention:

- "Story SDK", "@story-protocol/core-sdk", "StoryClient"
- "SDK setup", "story-protocol npm", "SDK initialization"
- "client.ipAsset", "client.license", "client.royalty"
