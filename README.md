# Story Protocol AI Skills

AI-powered skills for [Story Protocol](https://story.foundation/) development. Available on the [skills.sh](https://skills.sh) ecosystem and [Claude Code](https://claude.com/claude-code) marketplace.

## Quick Start

### Claude Code (plugin marketplace)

```bash
/plugin marketplace add piplabs/story-skills
/plugin install story-sdk@story-skills
/plugin install story-contracts@story-skills
```

### Skills CLI (skills.sh)

```bash
# SDK skills (TypeScript developers)
npx skills add piplabs/story-skills@story-sdk --full-depth

# Smart contract skills (Solidity developers)
npx skills add piplabs/story-skills@story-contracts
```

## Packages

### story-sdk

TypeScript SDK skills for Story Protocol development.

| Skill | Description |
|-------|-------------|
| `sdk-integration` | SDK setup, client initialization, and usage patterns |
| `ip-registration` | Register IP assets, mint NFTs, SPG workflows |
| `licensing` | PIL license terms, derivatives, license tokens |
| `royalty-integration` | Royalty vaults, revenue claiming, payment flows |

### story-contracts

Solidity smart contract skills for Story Protocol development.

| Skill | Description |
|-------|-------------|
| `smart-contracts` | Contract interaction, Foundry testing, direct contract calls |

## How It Works

Skills activate contextually when you mention relevant keywords in Claude Code or any skills.sh-compatible agent:

- **"register IP"** or **"mintAndRegisterIp"** → `ip-registration` skill loads
- **"license terms"** or **"PIL"** → `licensing` skill loads
- **"royalty"** or **"claim revenue"** → `royalty-integration` skill loads
- **"Story SDK"** or **"StoryClient"** → `sdk-integration` skill loads
- **"Solidity"** or **"foundry"** → `smart-contracts` skill loads

Each skill provides curated guidance, code examples, contract addresses, and common pitfall warnings.

## Project Structure

```text
story-skills/
├── story-sdk/                    # TypeScript SDK skill package
│   ├── SKILL.md                  # Umbrella skill (setup + routing)
│   ├── sdk-integration/          # SDK methods and patterns
│   ├── ip-registration/          # IP Asset registration
│   ├── licensing/                # License terms and derivatives
│   └── royalty-integration/      # Royalties and revenue
├── story-contracts/              # Solidity skill package
│   ├── SKILL.md                  # Smart contract skill
│   └── references/               # Contract reference docs
├── evals/                        # Promptfoo evaluation suites
├── docs/                         # VitePress documentation
├── scripts/                      # Validation scripts
└── .claude-plugin/               # Claude Code marketplace config
```

## Development

### Prerequisites

- Node.js 18+
- npm 8+

### Setup

```bash
git clone https://github.com/piplabs/story-skills.git
cd story-skills
npm install
```

### Validate

```bash
# Validate all skill packages
npx nx run-many -t validate

# Validate a specific package
npx nx run story-sdk:validate

# Lint markdown
npx nx run-many -t lint-markdown

# Validate Claude Code marketplace
claude plugin validate .
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
