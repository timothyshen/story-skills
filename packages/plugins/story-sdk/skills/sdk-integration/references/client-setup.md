# Client Setup Reference

## StoryConfig Interface

```typescript
interface StoryConfig {
  /**
   * The account to use for transactions.
   * Backend: use privateKeyToAccount() from viem/accounts
   * Frontend: use walletClient.account from a viem WalletClient
   */
  account: Account;

  /**
   * The transport to use for RPC communication.
   * Backend: use http() or webSocket() from viem
   * Frontend: use custom(window.ethereum) from viem
   */
  transport: Transport;

  /**
   * The chain to connect to.
   * 'aeneid' for testnet (chain ID 1315)
   * 'mainnet' for mainnet (chain ID 1514)
   */
  chainId: 'aeneid' | 'mainnet';
}
```

## Chain Configurations

### Aeneid (Testnet)

| Property | Value |
|----------|-------|
| Chain Name | Story Aeneid Testnet |
| Chain ID | 1315 |
| RPC URL | `https://aeneid.storyrpc.io` |
| Explorer | `https://aeneid.storyscan.io` |
| Faucet | `https://aeneid.faucet.story.foundation/` |
| Native Token | IP |
| Config Value | `'aeneid'` |

### Mainnet

| Property | Value |
|----------|-------|
| Chain Name | Story Mainnet |
| Chain ID | 1514 |
| RPC URL | `https://mainnet.storyrpc.io` |
| Explorer | `https://mainnet.storyscan.xyz` |
| Native Token | IP |
| Config Value | `'mainnet'` |

## Backend Initialization

### Standard Setup

```typescript
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

const account = privateKeyToAccount(`0x${process.env.WALLET_PRIVATE_KEY}`);

const config: StoryConfig = {
  account,
  transport: http('https://aeneid.storyrpc.io'),
  chainId: 'aeneid',
};

const client = StoryClient.newClient(config);
```

### With Custom RPC

```typescript
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

const account = privateKeyToAccount(`0x${process.env.WALLET_PRIVATE_KEY}`);

const config: StoryConfig = {
  account,
  transport: http(process.env.CUSTOM_RPC_URL),
  chainId: 'aeneid',
};

const client = StoryClient.newClient(config);
```

### With WebSocket Transport

```typescript
import { webSocket } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

const account = privateKeyToAccount(`0x${process.env.WALLET_PRIVATE_KEY}`);

const config: StoryConfig = {
  account,
  transport: webSocket('wss://aeneid.storyrpc.io'),
  chainId: 'aeneid',
};

const client = StoryClient.newClient(config);
```

## Frontend Initialization

### With MetaMask / Injected Wallet

```typescript
import { custom } from 'viem';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

// Assumes walletClient is already created from a wallet connector
const config: StoryConfig = {
  account: walletClient.account,
  transport: custom(window.ethereum),
  chainId: 'aeneid',
};

const client = StoryClient.newClient(config);
```

### With Wagmi / RainbowKit

```typescript
import { custom } from 'viem';
import { useWalletClient } from 'wagmi';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

function useStoryClient() {
  const { data: walletClient } = useWalletClient();

  if (!walletClient) return null;

  const config: StoryConfig = {
    account: walletClient.account,
    transport: custom(walletClient.transport),
    chainId: 'aeneid',
  };

  return StoryClient.newClient(config);
}
```

## Viem Transport Options

| Transport | Import | Use Case | Example |
|-----------|--------|----------|---------|
| HTTP | `import { http } from 'viem'` | Standard RPC calls (most common) | `http('https://aeneid.storyrpc.io')` |
| WebSocket | `import { webSocket } from 'viem'` | Persistent connection, subscriptions | `webSocket('wss://aeneid.storyrpc.io')` |
| Custom | `import { custom } from 'viem'` | Browser wallets (MetaMask, etc.) | `custom(window.ethereum)` |
| Fallback | `import { fallback } from 'viem'` | Multiple RPCs with failover | `fallback([http(rpc1), http(rpc2)])` |

## Environment Variable Patterns

### Recommended .env File

```bash
# Private key WITHOUT 0x prefix
WALLET_PRIVATE_KEY=abcdef1234567890...

# RPC endpoint
STORY_RPC_URL=https://aeneid.storyrpc.io

# Chain selection
STORY_CHAIN=aeneid
```

### Loading Environment Variables

```typescript
import 'dotenv/config'; // or use dotenv.config()
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error('WALLET_PRIVATE_KEY not set');

const RPC_URL = process.env.STORY_RPC_URL || 'https://aeneid.storyrpc.io';
const CHAIN = (process.env.STORY_CHAIN as 'aeneid' | 'mainnet') || 'aeneid';

const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);

const config: StoryConfig = {
  account,
  transport: http(RPC_URL),
  chainId: CHAIN,
};

const client = StoryClient.newClient(config);
```

## Client Singleton Pattern

```typescript
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

let _client: ReturnType<typeof StoryClient.newClient> | null = null;

export function getStoryClient() {
  if (_client) return _client;

  const account = privateKeyToAccount(`0x${process.env.WALLET_PRIVATE_KEY}`);
  const config: StoryConfig = {
    account,
    transport: http(process.env.STORY_RPC_URL || 'https://aeneid.storyrpc.io'),
    chainId: (process.env.STORY_CHAIN as 'aeneid' | 'mainnet') || 'aeneid',
  };

  _client = StoryClient.newClient(config);
  return _client;
}
```

## Mainnet vs Testnet Differences

| Aspect | Aeneid (Testnet) | Mainnet |
|--------|------------------|---------|
| Gas Tokens | Free from faucet | Real IP tokens |
| Contract Addresses | Same as mainnet (most) | Same as testnet (most) |
| Public SPG Collection | `0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc` | Not available |
| Recommended For | Development, testing | Production |
| Data Persistence | May be reset | Permanent |
