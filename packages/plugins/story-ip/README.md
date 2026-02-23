# story-ip

AI-powered assistance for Story Protocol IP Asset registration, metadata management, and SPG workflows.

## Skills

### ip-registration

Guides developers through registering IP assets on Story Protocol, covering:

- Registering existing ERC-721 NFTs as IP Assets via `IPAssetRegistry.register()`
- Minting and registering in one transaction via SPG `mintAndRegisterIp()`
- Creating SPG NFT collections
- IPA Metadata Standard (IP metadata vs NFT metadata)
- Contract addresses for Aeneid testnet and mainnet

## Installation

```bash
npx skills add storyprotocol/story-skills
```

## Usage

The skill activates contextually when you mention:
- "register IP", "IP Asset", "mintAndRegisterIp"
- "createCollection", "SPG", "Story Protocol registration"
- "ipId"
