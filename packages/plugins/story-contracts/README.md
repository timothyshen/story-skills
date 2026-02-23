# story-contracts

AI-powered assistance for Story Protocol Solidity smart contract interaction, Foundry testing, and direct contract calls.

## Skills

### smart-contracts

Guides developers through interacting with Story Protocol smart contracts directly in Solidity, covering:

- Core contract interfaces: IPAssetRegistry, LicensingModule, RoyaltyModule, DisputeModule
- SPG workflow contracts: RegistrationWorkflows, DerivativeWorkflows, LicenseAttachmentWorkflows
- AccessController permission patterns and wildcard selectors
- Foundry fork testing against Aeneid testnet
- Multicall patterns and Multicall3 incompatibility pitfalls
- Contract addresses for Aeneid testnet and mainnet

## Installation

```bash
npx skills add storyprotocol/story-skills
```

## Usage

The skill activates contextually when you mention:

- "Story contract", "IPAssetRegistry", "Solidity", "Story smart contract"
- "foundry", "forge", "LicensingModule", "RoyaltyModule"
- Direct contract interaction patterns
