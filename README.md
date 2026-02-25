# Story Protocol AI Skills

AI-powered skills and plugins for [Story Protocol](https://story.foundation/) development. Built on the [skills.sh](https://skills.sh) ecosystem

## Quick Start

```bash
npx skills add timothyshen/story-skills
```

## Plugins

| Plugin | Skill | Description |
|--------|-------|-------------|
| **story-ip** | `ip-registration` | Register IP assets via IPAssetRegistry or SPG workflows |
| **story-licensing** | `licensing` | Configure PIL license terms, attach licenses, register derivatives |
| **story-royalty** | `royalty-integration` | Pay and claim royalties with LAP/LRP policies |
| **story-sdk** | `sdk-integration` | TypeScript SDK setup, client initialization, and usage patterns |
| **story-contracts** | `smart-contracts` | Solidity contract interaction, Foundry testing, direct contract calls |

## How It Works

Skills activate contextually when you mention relevant keywords in Claude Code or any skills.sh-compatible agent:

- **"register IP"** or **"mintAndRegisterIp"** → `ip-registration` skill loads
- **"license terms"** or **"PIL"** → `licensing` skill loads
- **"royalty"** or **"claim revenue"** → `royalty-integration` skill loads
- **"Story SDK"** or **"StoryClient"** → `sdk-integration` skill loads
- **"Solidity"** or **"foundry"** → `smart-contracts` skill loads

Each skill provides curated guidance, code examples, contract addresses, and common pitfall warnings.

## Project Structure

```
story-skills/
├── packages/plugins/
│   ├── story-ip/                 # IP registration + metadata
│   ├── story-licensing/          # Licensing + derivatives
│   ├── story-royalty/            # Royalties + revenue
│   ├── story-sdk/                # TypeScript SDK patterns
│   └── story-contracts/          # Solidity / direct contract calls
├── evals/                        # Promptfoo evaluation suites
├── docs/                         # VitePress documentation
├── scripts/                      # Validation scripts
├── CLAUDE.md                     # Agent instructions
└── nx.json                       # Nx monorepo config
```

## Development

### Prerequisites

- Node.js 18+
- npm 8+

### Setup

```bash
git clone https://github.com/timothyshen/story-skills.git
cd story-skills
npm install
```

### Validate

```bash
# Validate all plugins
npx nx run-many -t validate

# Validate a specific plugin
npx nx run story-ip:validate

# Validate documentation pages
node scripts/validate-docs.cjs
```

### Run Evals

Requires an Anthropic API key:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npx promptfoo eval -c evals/suites/ip-registration/promptfoo.yaml
```

### Documentation

```bash
npm run docs:dev      # Local dev server
npm run docs:build    # Production build
```

## Story Protocol Networks

| Network | Chain ID | RPC |
|---------|----------|-----|
| Aeneid (testnet) | 1315 | `https://aeneid.storyrpc.io` |
| Mainnet | 1514 | `https://mainnet.storyrpc.io` |

## License

MIT
