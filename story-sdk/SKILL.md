---
name: story-sdk
description: Story Protocol TypeScript SDK overview and setup. Use when user mentions "Story Protocol", "Story SDK", "@story-protocol/core-sdk", "StoryClient", "SDK setup", or wants to start building on Story Protocol with TypeScript.
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '0.1.0'
---

# Story Protocol TypeScript SDK

Quick-start guide for the `@story-protocol/core-sdk` package. For detailed topics, see the sub-skills below.

## Installation

```bash
npm install @story-protocol/core-sdk viem
```

Requirements: Node.js 18+, npm 8+, an EVM wallet private key or wallet connector, RPC endpoint.

## Client Setup

```typescript
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);
const config: StoryConfig = {
  account,
  transport: http('https://aeneid.storyrpc.io'),
  chainId: 'aeneid',
};
const client = StoryClient.newClient(config);
```

## Networks

| Network | Chain ID | RPC |
|---------|----------|-----|
| Aeneid (testnet) | 1315 | <https://aeneid.storyrpc.io> |
| Mainnet | 1514 | <https://mainnet.storyrpc.io> |

## Key Contracts

| Contract | Address |
|----------|---------|
| IPAssetRegistry | `0x77319B4031e6eF1250907aa00018B8B1c67a244b` |
| LicensingModule | `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f` |
| RoyaltyModule | `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086` |
| PILicenseTemplate | `0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316` |
| RegistrationWorkflows | `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424` |

## Sub-Skills

- **sdk-integration** - SDK methods, client modules, and usage patterns
- **ip-registration** - Register IP assets, mint NFTs, SPG workflows
- **licensing** - PIL license terms, derivatives, license tokens
- **royalty-integration** - Royalty vaults, revenue claiming, payment flows
