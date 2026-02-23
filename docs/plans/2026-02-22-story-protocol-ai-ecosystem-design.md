# Story Protocol AI Ecosystem Design

## Overview

An AI skills/plugins ecosystem for Story Protocol, modeled after [uniswap-ai](https://github.com/Uniswap/uniswap-ai). Provides contextual, curated guidance for developers building on Story Protocol — covering IP registration, licensing, royalties, SDK usage, and smart contract interaction.

**Audience:** Both developers new to Story Protocol and experienced devs wanting AI-assisted productivity.

**Architecture:** Exact mirror of uniswap-ai's Nx monorepo structure with domain-split plugins.

## Repository Structure

```
story-skills/
├── .claude-plugin/
│   └── marketplace.json          # Lists all plugins for Claude Marketplace
├── .claude/rules/                # Agent-agnostic rules
├── .github/workflows/            # CI/CD
├── docs/                         # VitePress documentation
│   ├── .vitepress/config.ts
│   ├── plugins/
│   ├── skills/
│   ├── getting-started/
│   └── index.md
├── evals/
│   ├── templates/suite/          # Template for new eval suites
│   ├── suites/                   # One per skill
│   ├── scripts/
│   ├── promptfoo.yaml            # Root config
│   └── project.json
├── packages/plugins/
│   ├── story-ip/                 # IP registration + metadata
│   ├── story-licensing/          # Licensing + derivatives
│   ├── story-royalty/            # Royalties + revenue
│   ├── story-sdk/                # TypeScript SDK patterns
│   └── story-contracts/          # Solidity / direct contract calls
├── scripts/
│   ├── validate-plugin.cjs
│   └── validate-docs.cjs
├── CLAUDE.md
├── AGENTS.md -> CLAUDE.md
├── nx.json
├── package.json
├── tsconfig.base.json
└── .prettierrc.json
```

## Plugins

Five domain-split plugins, each with one primary skill and curated reference docs.

### story-ip

IP Asset registration and metadata management.

```
packages/plugins/story-ip/
├── .claude-plugin/plugin.json
├── skills/
│   └── ip-registration/
│       ├── SKILL.md
│       └── references/
│           ├── contract-addresses.md
│           ├── metadata-standard.md
│           └── registration-patterns.md
├── package.json
├── project.json
├── CLAUDE.md
├── AGENTS.md -> CLAUDE.md
└── README.md
```

**Skill triggers:** "register IP", "IP Asset", "mintAndRegisterIp", "createCollection", "SPG", "Story Protocol registration", "ipId"

**Reference content covers:**
- IPAssetRegistry.register() vs SPG mintAndRegisterIp() patterns
- IPA Metadata Standard (IP metadata vs NFT metadata, hashing, IPFS upload)
- Contract addresses for Aeneid testnet (chain 1315) and mainnet (chain 1514)
- SPG NFT collection creation (createNFTCollection)
- ipId derivation: `IP_ASSET_REGISTRY.ipId(chainId, tokenContract, tokenId)`
- Public testing SPG contract: `0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc`

### story-licensing

PIL license terms, attaching licenses, and derivative registration.

```
packages/plugins/story-licensing/
├── .claude-plugin/plugin.json
├── skills/
│   └── licensing/
│       ├── SKILL.md
│       └── references/
│           ├── pil-terms-reference.md
│           ├── derivatives-guide.md
│           └── common-pitfalls.md
├── package.json, project.json, CLAUDE.md, AGENTS.md, README.md
```

**Skill triggers:** "license", "PIL", "license terms", "derivative", "commercial use", "remix", "attach license"

**Reference content covers:**
- Full LicenseTerms struct (all fields, types, ranges)
- PILFlavor presets: nonCommercialSocialRemixing (ID=1), commercialUse, commercialRemix, ccAttribution
- Attaching terms: attachLicenseTerms, registerPilTermsAndAttach
- Derivatives: linkDerivative, registerDerivativeIpAsset, mintAndRegisterIpAndMakeDerivative
- Pitfalls: commercialRevShare encoding (percent vs uint32), re-registering ID 1, maxRts parameter

### story-royalty

Royalty payments, revenue claiming, and vault mechanics.

```
packages/plugins/story-royalty/
├── .claude-plugin/plugin.json
├── skills/
│   └── royalty-integration/
│       ├── SKILL.md
│       └── references/
│           ├── royalty-system.md
│           ├── payment-claiming.md
│           └── revenue-distribution.md
├── package.json, project.json, CLAUDE.md, AGENTS.md, README.md
```

**Skill triggers:** "royalty", "revenue", "pay royalty", "claim revenue", "royalty vault", "royalty tokens", "LAP", "LRP"

**Reference content covers:**
- IP Royalty Vault mechanics (100 royalty tokens = 100% revenue rights)
- LAP vs LRP policies (absolute vs relative percentage)
- Royalty stack calculation
- payRoyaltyOnBehalf, claimAllRevenue, batchClaimAllRevenue
- WIP token and whitelisted currencies
- Royalty tokens stuck in IP Account pitfall

### story-sdk

TypeScript SDK setup, client initialization, and method reference.

```
packages/plugins/story-sdk/
├── .claude-plugin/plugin.json
├── skills/
│   └── sdk-integration/
│       ├── SKILL.md
│       └── references/
│           ├── client-setup.md
│           ├── method-reference.md
│           └── constants-exports.md
├── package.json, project.json, CLAUDE.md, AGENTS.md, README.md
```

**Skill triggers:** "Story SDK", "@story-protocol/core-sdk", "StoryClient", "SDK setup"

**Reference content covers:**
- StoryClient initialization (privateKey backend, viem integration)
- Chain configs: aeneid (1315), mainnet (1514)
- All SDK client modules: IPAssetClient, LicenseClient, RoyaltyClient, DisputeClient, NftClient, GroupClient, WipClient
- Key exports: WIP_TOKEN_ADDRESS, PILFlavor, LicenseTerms type
- IPFS helpers: convertCIDtoHashIPFS, convertHashIPFStoCID

### story-contracts

Direct Solidity smart contract interaction and Foundry patterns.

```
packages/plugins/story-contracts/
├── .claude-plugin/plugin.json
├── skills/
│   └── smart-contracts/
│       ├── SKILL.md
│       └── references/
│           ├── contract-addresses.md
│           ├── core-contracts.md
│           └── spg-workflows.md
├── package.json, project.json, CLAUDE.md, AGENTS.md, README.md
```

**Skill triggers:** "Story contract", "IPAssetRegistry", "Solidity", "Story smart contract", "foundry", "forge"

**Reference content covers:**
- All deployed contract addresses (core + periphery + license hooks)
- Core contracts: IPAssetRegistry, LicensingModule, RoyaltyModule, DisputeModule, AccessController
- SPG workflow contracts: RegistrationWorkflows, DerivativeWorkflows, LicenseAttachmentWorkflows
- Foundry testing with Aeneid fork: `forge test --fork-url https://aeneid.storyrpc.io/`
- SPG multicall limitations (Multicall3 incompatibility with SPGNFT minting)
- Access control pattern (wildcard selectors, permission table)

## Evals Framework

Promptfoo-based evaluation suites, one per skill.

### ip-registration eval suite (first to build)

```
evals/suites/ip-registration/
├── promptfoo.yaml
├── prompt-wrapper.txt
├── cases/
│   ├── basic-registration.md
│   ├── spg-mint-and-register.md
│   ├── metadata-requirements.md
│   ├── create-collection.md
│   └── ipid-derivation.md
└── rubrics/
    ├── registration-correctness.txt
    ├── metadata-completeness.txt
    ├── spg-understanding.txt
    └── pitfall-awareness.txt
```

**Test cases:**
1. `basic-registration.md` — "How do I register an existing NFT as an IP Asset?"
2. `spg-mint-and-register.md` — "I want to mint and register in one transaction"
3. `metadata-requirements.md` — "What metadata do I need for IP vs NFT?"
4. `create-collection.md` — "How do I create my own SPG NFT collection?"
5. `ipid-derivation.md` — "How do I get the ipId for my IP Asset?"

**Assertion types:**
- `llm-rubric` with threshold 0.85-0.9
- `contains` for key terms (IPAssetRegistry, ipId, mintAndRegisterIp)
- `contains-any` for alternative correct approaches

**Root promptfoo.yaml:**
- Provider: `anthropic:claude-sonnet-4-5-20250929`, temperature 0
- Timeout: 120s

**CI:** >=85% pass rate required.

## Infrastructure

### nx.json
- Independent versioning per plugin
- Targets per plugin: `lint-markdown`, `validate`
- Eval suite targets per skill
- Plugins: `@nx/js/typescript`, `@nx/eslint/plugin`
- `defaultBase: "origin/main"`

### CLAUDE.md (root)
1. Nx usage requirements
2. Package scope: `@story-protocol`
3. Plugin architecture and versioning rules
4. Agent-agnostic design principles
5. Evals framework constraints (no `---` in `.txt` files, rubrics must be `.txt`, Nunjucks `{% raw %}`)
6. CI validation rules
7. Story Protocol domain context (chain IDs, key addresses)

### Validation scripts
- `validate-plugin.cjs` — validates plugin structure, fields, tags, eval suite existence
- `validate-docs.cjs` — ensures every plugin and skill has a docs page

### VitePress docs
```
docs/
├── plugins/ (index + one page per plugin)
├── skills/ (index + one page per skill)
├── getting-started/
└── index.md
```

### CI workflows
- Lint + validate on all PRs
- Eval suites on PRs touching plugins or evals (>=85% pass)
- Docs validation

## Build Order

1. Repository scaffolding (nx.json, package.json, tsconfig.base.json, scripts, CLAUDE.md)
2. story-ip plugin with ip-registration skill (full content from research)
3. ip-registration eval suite
4. VitePress docs for story-ip
5. CI workflows
6. Remaining plugins (story-licensing, story-royalty, story-sdk, story-contracts)
7. Remaining eval suites
8. Agent (story-integration-expert)
9. Marketplace publishing

## Key Decisions

- **Domain-split plugins** over single monolithic plugin — granular installs and versioning
- **Deep research first** — skill content based on actual SDK source, docs, and boilerplate repos
- **Exact uniswap-ai mirror** — proven structure, maximizes skills.sh ecosystem compatibility
- **ip-registration first** — core entry point to Story Protocol, validates the full pipeline
