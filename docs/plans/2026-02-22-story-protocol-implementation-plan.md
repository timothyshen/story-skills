# Story Protocol AI Ecosystem Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete AI skills/plugins ecosystem for Story Protocol, modeled after uniswap-ai, with 5 domain-split plugins, promptfoo evals, VitePress docs, and CI.

**Architecture:** Nx monorepo with independent plugins under `packages/plugins/`. Each plugin has one skill with a SKILL.md and references directory. Evals use promptfoo with LLM-graded rubrics. Docs use VitePress.

**Tech Stack:** Nx, Node.js, promptfoo, VitePress, GitHub Actions, Markdown

---

### Task 1: Root Package Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.prettierrc.json`
- Create: `.markdownlint-cli2.jsonc`

**Step 1: Create root package.json**

```json
{
  "name": "story-skills",
  "version": "0.0.0",
  "private": true,
  "description": "AI-powered skills and plugins for Story Protocol",
  "license": "MIT",
  "workspaces": [
    "packages/*",
    "packages/plugins/*"
  ],
  "scripts": {
    "validate": "nx run-many -t validate",
    "lint": "nx run-many -t lint-markdown",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  "devDependencies": {
    "nx": "^20.0.0",
    "markdownlint-cli2": "^0.17.0",
    "prettier": "^3.4.0",
    "vitepress": "^1.5.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "packageManager": "npm@11.0.0"
}
```

**Step 2: Create tsconfig.base.json**

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2015",
    "module": "esnext",
    "lib": ["es2017", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": "."
  },
  "exclude": ["node_modules", "tmp"]
}
```

**Step 3: Create .prettierrc.json**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

**Step 4: Create .markdownlint-cli2.jsonc**

```jsonc
{
  "config": {
    "default": true,
    "MD013": false,
    "MD033": false,
    "MD041": false
  }
}
```

**Step 5: Commit**

```bash
git add package.json tsconfig.base.json .prettierrc.json .markdownlint-cli2.jsonc
git commit -m "chore: add root package configuration"
```

---

### Task 2: Nx Configuration

**Files:**
- Create: `nx.json`

**Step 1: Create nx.json**

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "tui": { "enabled": false },
  "defaultBase": "origin/main",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json"
    ],
    "sharedGlobals": []
  },
  "targetDefaults": {
    "lint-markdown": {
      "cache": true,
      "inputs": ["default", "{workspaceRoot}/.markdownlint-cli2.jsonc"]
    },
    "validate": {
      "cache": true,
      "inputs": ["default"]
    }
  },
  "parallel": 5,
  "cacheDirectory": "node_modules/.cache/nx",
  "release": {
    "projects": [],
    "projectsRelationship": "independent",
    "version": {
      "conventionalCommits": true,
      "git": { "commit": true, "tag": true, "commitMessage": "chore(release): [skip ci] publish" }
    },
    "changelog": { "projectChangelogs": true },
    "releaseTag": { "pattern": "{projectName}@{version}" }
  }
}
```

**Step 2: Commit**

```bash
git add nx.json
git commit -m "chore: add Nx configuration"
```

---

### Task 3: Validation Scripts

**Files:**
- Create: `scripts/validate-plugin.cjs`
- Create: `scripts/validate-docs.cjs`

**Step 1: Create validate-plugin.cjs**

This script validates that each plugin has the required structure. Modeled after uniswap-ai's version.

```javascript
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const pluginDir = process.argv[2];
const requireEvals = process.argv.includes('--require-evals');

if (!pluginDir) {
  console.error('Usage: node scripts/validate-plugin.cjs <plugin-dir> [--require-evals]');
  process.exit(1);
}

const abs = (rel) => path.join(pluginDir, rel);
let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`WARNING: ${msg}`);
  warnings++;
}

function info(msg) {
  console.log(`INFO: ${msg}`);
}

// Required files
const requiredFiles = [
  '.claude-plugin/plugin.json',
  'package.json',
  'project.json',
  'README.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(abs(file))) {
    error(`Missing required file: ${file}`);
  }
}

// Validate plugin.json
const pluginJsonPath = abs('.claude-plugin/plugin.json');
if (fs.existsSync(pluginJsonPath)) {
  const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
  const requiredFields = ['name', 'version', 'description'];
  for (const field of requiredFields) {
    if (!pluginJson[field]) {
      error(`plugin.json missing required field: ${field}`);
    }
  }

  // Validate skills exist
  if (pluginJson.skills && Array.isArray(pluginJson.skills)) {
    for (const skillPath of pluginJson.skills) {
      const skillDir = path.join(pluginDir, skillPath);
      const skillMd = path.join(skillDir, 'SKILL.md');
      if (!fs.existsSync(skillMd)) {
        error(`Skill SKILL.md not found: ${skillMd}`);
      } else {
        // Validate SKILL.md frontmatter
        const content = fs.readFileSync(skillMd, 'utf8');
        if (!content.startsWith('---')) {
          error(`SKILL.md missing frontmatter: ${skillMd}`);
        } else {
          const frontmatter = content.split('---')[1];
          const requiredFrontmatter = ['name:', 'description:', 'model:'];
          for (const field of requiredFrontmatter) {
            if (!frontmatter.includes(field)) {
              error(`SKILL.md missing frontmatter field ${field}: ${skillMd}`);
            }
          }
        }
      }

      // Check for eval suite
      const skillName = path.basename(skillPath);
      const evalSuite = path.join('evals', 'suites', skillName, 'promptfoo.yaml');
      if (!fs.existsSync(evalSuite)) {
        const msg = `No eval suite found for skill "${skillName}" at ${evalSuite}`;
        if (requireEvals) {
          error(msg);
        } else {
          warn(msg);
        }
        info(`To create: cp -r evals/templates/suite/ evals/suites/${skillName}/`);
      }
    }
  }

  // Validate agents exist (if specified)
  if (pluginJson.agents && Array.isArray(pluginJson.agents)) {
    for (const agentPath of pluginJson.agents) {
      const agentFile = path.join(pluginDir, agentPath);
      if (!fs.existsSync(agentFile)) {
        error(`Agent file not found: ${agentFile}`);
      }
    }
  }
}

// Validate project.json tags
const projectJsonPath = abs('project.json');
if (fs.existsSync(projectJsonPath)) {
  const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
  if (!projectJson.tags || !projectJson.tags.includes('type:plugin')) {
    warn('project.json missing "type:plugin" tag');
  }
}

// Summary
console.log(`\nValidation complete: ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors > 0 ? 1 : 0);
```

**Step 2: Create validate-docs.cjs**

```javascript
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('path');

let errors = 0;

function error(msg) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

// Find all plugins
const pluginsDir = path.join('packages', 'plugins');
if (!fs.existsSync(pluginsDir)) {
  console.log('No plugins directory found, skipping docs validation');
  process.exit(0);
}

const plugins = fs.readdirSync(pluginsDir).filter((d) => {
  return fs.statSync(path.join(pluginsDir, d)).isDirectory();
});

for (const plugin of plugins) {
  // Check plugin docs page
  const pluginDoc = path.join('docs', 'plugins', `${plugin}.md`);
  if (!fs.existsSync(pluginDoc)) {
    error(`Missing docs page for plugin "${plugin}": ${pluginDoc}`);
  }

  // Check skill docs pages
  const pluginJsonPath = path.join(pluginsDir, plugin, '.claude-plugin', 'plugin.json');
  if (fs.existsSync(pluginJsonPath)) {
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
    if (pluginJson.skills) {
      for (const skillPath of pluginJson.skills) {
        const skillName = path.basename(skillPath);
        const skillDoc = path.join('docs', 'skills', `${skillName}.md`);
        if (!fs.existsSync(skillDoc)) {
          error(`Missing docs page for skill "${skillName}": ${skillDoc}`);
        }
      }
    }
  }
}

console.log(`\nDocs validation complete: ${errors} error(s)`);
process.exit(errors > 0 ? 1 : 0);
```

**Step 3: Run validate-plugin to verify it works (expect failure — no plugins yet)**

Run: `node scripts/validate-plugin.cjs packages/plugins/story-ip 2>&1 || true`
Expected: Errors about missing files (plugin doesn't exist yet). This confirms the script runs.

**Step 4: Commit**

```bash
git add scripts/validate-plugin.cjs scripts/validate-docs.cjs
git commit -m "chore: add plugin and docs validation scripts"
```

---

### Task 4: Root CLAUDE.md and AGENTS.md

**Files:**
- Create: `CLAUDE.md`
- Create: `AGENTS.md` (symlink to CLAUDE.md)

**Step 1: Create CLAUDE.md**

```markdown
# Story Protocol AI Skills

## Overview

AI-powered skills and plugins for Story Protocol development. This monorepo contains
plugins for IP registration, licensing, royalties, SDK usage, and smart contract interaction.

## Nx Usage

All operations go through Nx:

- Validate all plugins: `npx nx run-many -t validate`
- Lint markdown: `npx nx run-many -t lint-markdown`
- Validate specific plugin: `npx nx run story-ip:validate`
- Run eval suite: `npx promptfoo eval -c evals/suites/<skill-name>/promptfoo.yaml`

## Package Scope

All packages use the `@story-protocol` scope.

## Plugin Architecture

Each plugin lives at `packages/plugins/<plugin-name>/` and contains:
- `.claude-plugin/plugin.json` — plugin manifest (name, version, description, skills[])
- `skills/<skill-name>/SKILL.md` — skill instructions with YAML frontmatter
- `skills/<skill-name>/references/` — supplementary reference docs
- `package.json` — npm package config
- `project.json` — Nx project config (must have `type:plugin` tag)
- `CLAUDE.md` and `AGENTS.md` — plugin-level agent instructions
- `README.md` — plugin documentation

### Versioning

- `plugin.json` version tracks skill content changes (bump on any skill update)
- `package.json` version tracks npm package releases
- Use conventional commits for changelogs
- Release tags: `<plugin-name>@<version>`

## Agent-Agnostic Design

- Write prompts that work with any LLM, not just Claude
- Avoid model-specific features in SKILL.md files
- AGENTS.md symlinks to CLAUDE.md for non-Claude agent compatibility

## Evals Framework (Promptfoo)

Each skill has an eval suite at `evals/suites/<skill-name>/`:
- `promptfoo.yaml` — test configuration
- `prompt-wrapper.txt` — prompt template injecting skill + references
- `cases/*.md` — test scenarios
- `rubrics/*.txt` — LLM grading criteria

### Constraints

- Never use `---` in `.txt` prompt files (Promptfoo treats as multi-prompt separator). Use `***` instead.
- Rubric files MUST use `.txt` extension.
- Use `{% raw %}...{% endraw %}` to protect Nunjucks `{%` patterns in prompt files.
- Provider: `anthropic:claude-sonnet-4-5-20250929`, temperature 0.
- Timeout: 120s per test case.
- Pass rate: >=85% required in CI.

## Validation

- `node scripts/validate-plugin.cjs <plugin-dir>` — validates plugin structure
- `node scripts/validate-docs.cjs` — ensures every plugin/skill has docs pages
- CI runs both with `--require-evals` flag

## Story Protocol Context

### Networks

| Network | Chain ID | RPC |
|---------|----------|-----|
| Aeneid (testnet) | 1315 | https://aeneid.storyrpc.io |
| Mainnet | 1514 | https://mainnet.storyrpc.io |

### Key Contracts (same on both networks unless noted)

| Contract | Address |
|----------|---------|
| IPAssetRegistry | `0x77319B4031e6eF1250907aa00018B8B1c67a244b` |
| LicensingModule | `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f` |
| RoyaltyModule | `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086` |
| PILicenseTemplate | `0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316` |
| RegistrationWorkflows | `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424` |

### SDK

- Package: `@story-protocol/core-sdk`
- Key export: `StoryClient`, `WIP_TOKEN_ADDRESS`, `PILFlavor`
```

**Step 2: Create AGENTS.md symlink**

```bash
ln -s CLAUDE.md AGENTS.md
```

**Step 3: Commit**

```bash
git add CLAUDE.md AGENTS.md
git commit -m "docs: add root CLAUDE.md and AGENTS.md symlink"
```

---

### Task 5: story-ip Plugin Structure

**Files:**
- Create: `packages/plugins/story-ip/.claude-plugin/plugin.json`
- Create: `packages/plugins/story-ip/package.json`
- Create: `packages/plugins/story-ip/project.json`
- Create: `packages/plugins/story-ip/README.md`
- Create: `packages/plugins/story-ip/CLAUDE.md`
- Create: `packages/plugins/story-ip/AGENTS.md` (symlink)

**Step 1: Create directory structure**

```bash
mkdir -p packages/plugins/story-ip/.claude-plugin
mkdir -p packages/plugins/story-ip/skills/ip-registration/references
```

**Step 2: Create plugin.json**

File: `packages/plugins/story-ip/.claude-plugin/plugin.json`

```json
{
  "name": "story-ip",
  "version": "1.0.0",
  "description": "AI-powered assistance for Story Protocol IP Asset registration, metadata management, and SPG workflows",
  "author": {
    "name": "Story Protocol",
    "email": "ai@story.foundation"
  },
  "homepage": "https://github.com/storyprotocol/story-skills",
  "keywords": ["story-protocol", "ip-asset", "nft", "registration", "spg", "blockchain"],
  "license": "MIT",
  "skills": ["./skills/ip-registration"]
}
```

**Step 3: Create package.json**

File: `packages/plugins/story-ip/package.json`

```json
{
  "name": "@story-protocol/story-ip",
  "version": "0.0.1",
  "description": "AI-powered assistance for Story Protocol IP Asset registration",
  "author": "Story Protocol <ai@story.foundation>",
  "license": "MIT",
  "files": [".claude-plugin", "skills", "docs"]
}
```

**Step 4: Create project.json**

File: `packages/plugins/story-ip/project.json`

```json
{
  "name": "story-ip",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/plugins/story-ip",
  "projectType": "library",
  "tags": ["type:plugin", "scope:story-protocol"],
  "targets": {
    "lint-markdown": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx markdownlint-cli2 'packages/plugins/story-ip/**/*.md'"
      }
    },
    "validate": {
      "executor": "nx:run-commands",
      "options": {
        "command": "node scripts/validate-plugin.cjs packages/plugins/story-ip"
      }
    }
  }
}
```

**Step 5: Create README.md**

File: `packages/plugins/story-ip/README.md`

```markdown
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
```

**Step 6: Create CLAUDE.md and AGENTS.md**

File: `packages/plugins/story-ip/CLAUDE.md`

```markdown
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
```

```bash
cd packages/plugins/story-ip && ln -s CLAUDE.md AGENTS.md && cd ../../..
```

**Step 7: Run validation**

Run: `node scripts/validate-plugin.cjs packages/plugins/story-ip`
Expected: Errors about missing SKILL.md (not created yet). No errors about plugin.json, package.json, project.json, README.md.

**Step 8: Commit**

```bash
git add packages/plugins/story-ip/
git commit -m "feat(story-ip): add plugin structure"
```

---

### Task 6: ip-registration SKILL.md

**Files:**
- Create: `packages/plugins/story-ip/skills/ip-registration/SKILL.md`

**Step 1: Create SKILL.md**

File: `packages/plugins/story-ip/skills/ip-registration/SKILL.md`

```markdown
---
name: ip-registration
description: Register IP assets on Story Protocol. Use when user mentions "register IP", "IP Asset", "mintAndRegisterIp", "createCollection", "SPG", "Story Protocol registration", "ipId", or wants to mint NFTs as IP on Story.
allowed-tools: Read, Glob, Grep, WebFetch, Task(subagent_type:Explore)
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '1.0.0'
---

# IP Asset Registration on Story Protocol

Guide for registering IP assets on Story Protocol's onchain IP infrastructure.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **IP Asset** | An ERC-721 NFT registered into the global IPAssetRegistry. Represents programmable IP. |
| **IP Account** | An ERC-6551 Token Bound Account auto-deployed for each IP Asset. This IS the `ipId`. |
| **IPAssetRegistry** | Global registry contract at `0x77319B4031e6eF1250907aa00018B8B1c67a244b` |
| **SPG** | Story Protocol Gateway — periphery contracts bundling mint + register into one tx |
| **RegistrationWorkflows** | SPG contract at `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424` |

## Prerequisites

- Node.js 18+, npm 8+
- `@story-protocol/core-sdk` and `viem` installed
- EVM wallet with private key
- RPC endpoint: `https://aeneid.storyrpc.io` (testnet) or `https://mainnet.storyrpc.io`
- Testnet $IP from faucet: `https://aeneid.faucet.story.foundation/`

## SDK Client Setup

```typescript
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';

const account = privateKeyToAccount(`0x${process.env.WALLET_PRIVATE_KEY}`);

const config: StoryConfig = {
  account,
  transport: http('https://aeneid.storyrpc.io'),
  chainId: 'aeneid', // or 'mainnet'
};

const client = StoryClient.newClient(config);
```

## Two Registration Paths

### Path 1: Register an Existing NFT

Use when you already have an ERC-721 NFT and want to register it as an IP Asset.

```typescript
const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'minted',
    nftContract: '0xYourERC721ContractAddress',
    tokenId: '42',
  },
  ipMetadata: {
    ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
    ipMetadataHash: `0x${ipHash}`,
    nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
    nftMetadataHash: `0x${nftHash}`,
  },
});

console.log(`IP Asset registered: ipId=${response.ipId}, tx=${response.txHash}`);
```

### Path 2: Mint + Register via SPG (One Transaction)

Use when you need to mint a new NFT AND register it as IP in a single transaction.

```typescript
const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc', // public testnet collection
  },
  ipMetadata: {
    ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
    ipMetadataHash: `0x${ipHash}`,
    nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
    nftMetadataHash: `0x${nftHash}`,
  },
});
```

### Path 2 with License Terms (Atomic)

Register IP and attach license terms in one transaction:

```typescript
import { PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc',
  },
  licenseTermsData: [
    {
      terms: PILFlavor.commercialRemix({
        commercialRevShare: 5, // 5%
        defaultMintingFee: parseEther('1'),
        currency: WIP_TOKEN_ADDRESS,
      }),
    },
  ],
  ipMetadata: {
    ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
    ipMetadataHash: `0x${ipHash}`,
    nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
    nftMetadataHash: `0x${nftHash}`,
  },
});
```

## Creating Your Own SPG NFT Collection

```typescript
import { zeroAddress } from 'viem';

const newCollection = await client.nftClient.createNFTCollection({
  name: 'My IP Collection',
  symbol: 'MIP',
  isPublicMinting: false, // only owner can mint
  mintOpen: true,
  mintFeeRecipient: zeroAddress,
  contractURI: '',
});

console.log(`Collection: ${newCollection.spgNftContract}`);
// Use newCollection.spgNftContract in registerIpAsset with type: 'mint'
```

## ipId Derivation

The `ipId` is deterministic. You can compute it without registering:

```typescript
// Solidity
address ipId = IP_ASSET_REGISTRY.ipId(block.chainid, tokenContract, tokenId);

// The ipId is an ERC-6551 Token Bound Account address
// It is NOT the NFT token ID
```

## Metadata

Two separate metadata objects are required. See `references/metadata-standard.md` for the full specification.

**IP Metadata** (Story's IPA standard):
- `title`, `description`, `createdAt`, `creators[]`, `image`, `mediaUrl`, `ipType`, `tags`

**NFT Metadata** (OpenSea ERC-721 standard):
- `name`, `description`, `image`, `attributes[]`

Both must be uploaded to IPFS and their SHA-256 hashes computed:

```typescript
import { createHash } from 'crypto';

const ipHash = createHash('sha256')
  .update(JSON.stringify(ipMetadata))
  .digest('hex');
// Pass as: `0x${ipHash}`
```

## Solidity (Direct Contract Calls)

```solidity
// Register existing NFT
address ipId = IP_ASSET_REGISTRY.register(
    block.chainid,
    address(nftContract),
    tokenId
);

// SPG mint + register
(address ipId, uint256 tokenId) = REGISTRATION_WORKFLOWS.mintAndRegisterIp(
    spgNftContract,
    recipient,
    WorkflowStructs.IPMetadata({
        ipMetadataURI: "...",
        ipMetadataHash: bytes32(...),
        nftMetadataURI: "...",
        nftMetadataHash: bytes32(...)
    }),
    true
);
```

## Common Pitfalls

1. **ipId vs tokenId**: `ipId` is the IP Account contract address, NOT the ERC-721 token ID.
2. **Metadata confusion**: IP metadata (Story standard) and NFT metadata (OpenSea standard) are separate objects with different schemas.
3. **SPG collection ownership**: The caller of `mintAndRegisterIp` must have minting rights on the SPG NFT collection (unless `isPublicMinting: true`).
4. **Hash format**: `ipMetadataHash` must be SHA-256 of the JSON content, prefixed with `0x`.
5. **Duplicate registration**: Setting `allowDuplicates: false` prevents registering the same NFT twice (default behavior).
6. **Multicall3 incompatibility**: Do NOT use standard Multicall3 (`0xcA11bde05977b3631167028862bE2a173976CA11`) with SPG functions involving SPGNFT minting. Use SPG's built-in `multicall` instead.

## Network Configuration

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Aeneid (testnet) | 1315 | `https://aeneid.storyrpc.io` | `https://aeneid.storyscan.io` |
| Mainnet | 1514 | `https://mainnet.storyrpc.io` | `https://mainnet.storyscan.xyz` |

## Contract Addresses

See `references/contract-addresses.md` for the complete list. Key addresses (same on both networks):

| Contract | Address |
|----------|---------|
| IPAssetRegistry | `0x77319B4031e6eF1250907aa00018B8B1c67a244b` |
| RegistrationWorkflows (SPG) | `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424` |
| CoreMetadataModule | `0x6E81a25C99C6e8430aeC7353325EB138aFE5DC16` |

Public testnet SPG collection: `0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc`
```

**Step 2: Run validation**

Run: `node scripts/validate-plugin.cjs packages/plugins/story-ip`
Expected: PASS (0 errors). Warning about missing eval suite is expected.

**Step 3: Commit**

```bash
git add packages/plugins/story-ip/skills/ip-registration/SKILL.md
git commit -m "feat(story-ip): add ip-registration skill"
```

---

### Task 7: ip-registration Reference Documents

**Files:**
- Create: `packages/plugins/story-ip/skills/ip-registration/references/contract-addresses.md`
- Create: `packages/plugins/story-ip/skills/ip-registration/references/metadata-standard.md`
- Create: `packages/plugins/story-ip/skills/ip-registration/references/registration-patterns.md`

**Step 1: Create contract-addresses.md**

File: `packages/plugins/story-ip/skills/ip-registration/references/contract-addresses.md`

```markdown
# Story Protocol Contract Addresses

## Core Protocol Contracts

Addresses are the same on Aeneid (1315) and Mainnet (1514) unless noted.

| Contract | Address | Notes |
|----------|---------|-------|
| IPAssetRegistry | `0x77319B4031e6eF1250907aa00018B8B1c67a244b` | Global IP registry |
| LicensingModule | `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f` | License management |
| RoyaltyModule | `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086` | Royalty payments |
| DisputeModule | `0x9b7A9c70AFF961C799110954fc06F3093aeb94C5` | Dispute resolution |
| PILicenseTemplate | `0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316` | License template |
| AccessController | `0xcCF37d0a503Ee1D4C11208672e622ed3DFB2275a` | Permission management |
| ModuleRegistry | `0x022DBAAeA5D8fB31a0Ad793335e39Ced5D631fa5` | Module registry |
| LicenseRegistry | `0x529a750E02d8E2f15649c13D69a465286a780e24` | License registry |
| LicenseToken | `0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC` | License NFT |
| RoyaltyPolicyLAP | `0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E` | Liquid Absolute Percentage |
| RoyaltyPolicyLRP | `0x9156e603C949481883B1d3355c6f1132D191fC41` | Liquid Relative Percentage |
| CoreMetadataModule | `0x6E81a25C99C6e8430aeC7353325EB138aFE5DC16` | Metadata storage |
| GroupingModule | `0x69D3a7aa9edb72Bc226E745A7cCdd50D947b69Ac` | IP grouping |
| EvenSplitGroupPool | `0xf96f2c30b41Cb6e0290de43C8528ae83d4f33F89` | Group revenue split |

## Contracts That Differ Between Networks

| Contract | Aeneid (1315) | Mainnet (1514) |
|----------|---------------|----------------|
| IPAccountImpl | `0xdeC03e0c63f800efD7C9d04A16e01E80cF57Bf79` | `0x7343646585443F1c3F64E4F08b708788527e1C77` |
| IpRoyaltyVaultImpl | `0xbd0f3c59B6f0035f55C58893fA0b1Ac4aDEa50Dc` | `0x63cC7611316880213f3A4Ba9bD72b0EaA2010298` |
| SPGNFTImpl | `0x5266215a00c31AaA2f2BB7b951Ea0028Ea8b4e37` | `0x6Cfa03Bc64B1a76206d0Ea10baDed31D520449F5` |

## Periphery / SPG Workflow Contracts

| Contract | Address |
|----------|---------|
| RegistrationWorkflows | `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424` |
| DerivativeWorkflows | `0x9e2d496f72C547C2C535B167e06ED8729B374a4f` |
| LicenseAttachmentWorkflows | `0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8` |
| GroupingWorkflows | `0xD7c0beb3aa4DCD4723465f1ecAd045676c24CDCd` |
| RoyaltyWorkflows | `0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890` |
| RoyaltyTokenDistributionWorkflows | `0xa38f42B8d33809917f23997B8423054aAB97322C` |
| TokenizerModule | `0xAC937CeEf893986A026f701580144D9289adAC4C` |

## License Hook Contracts

| Contract | Aeneid (1315) | Mainnet (1514) |
|----------|---------------|----------------|
| TotalLicenseTokenLimitHook | `0xaBAD364Bfa41230272b08f171E0Ca939bD600478` | `0xB72C9812114a0Fc74D49e01385bd266A75960Cda` |
| LockLicenseHook | `0x54C52990dA304643E7412a3e13d8E8923cD5bfF2` | `0x5D874d4813c4A8A9FB2AB55F30cED9720AEC0222` |

## Infrastructure

| Contract | Address |
|----------|---------|
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| Bridged USDC (Stargate) | `0xF1815bd50389c46847f0Bda824eC8da914045D14` |

## Payment Tokens

| Network | Token | Address |
|---------|-------|---------|
| Both | WIP (Wrapped IP) | `0x1514000000000000000000000000000000000000` |
| Aeneid | MERC20 (test) | `0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E` |

## Public Testing

| Resource | Value |
|----------|-------|
| Public SPG Collection (Aeneid) | `0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc` |
| Faucet | `https://aeneid.faucet.story.foundation/` |
```

**Step 2: Create metadata-standard.md**

File: `packages/plugins/story-ip/skills/ip-registration/references/metadata-standard.md`

```markdown
# IPA Metadata Standard

Story Protocol requires two separate metadata objects for IP Assets.

## IP Metadata (IPA Standard)

Stored in the IP Account via CoreMetadataModule. This is Story Protocol's custom standard.

```json
{
  "title": "My Creative Work",
  "description": "Description of the IP",
  "createdAt": "1740005219",
  "creators": [
    {
      "name": "Alice",
      "address": "0xA2f9Cf1E40D7b03aB81e34BC50f0A8c67B4e9112",
      "contributionPercent": 100,
      "description": "Original creator",
      "socialMedia": [
        { "platform": "Twitter", "url": "https://twitter.com/alice" }
      ],
      "role": "Author"
    }
  ],
  "image": "https://ipfs.io/ipfs/QmImage...",
  "imageHash": "0x...",
  "mediaUrl": "https://ipfs.io/ipfs/QmMedia...",
  "mediaHash": "0x...",
  "mediaType": "image/webp",
  "ipType": "character",
  "tags": ["ai", "character"],
  "aiMetadata": {
    "characterFileUrl": "https://ipfs.io/ipfs/QmCharFile...",
    "characterFileHash": "0x..."
  }
}
```

### IP Metadata Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Title of the IP |
| description | string | No | Description |
| createdAt | string | No | Unix timestamp |
| creators | array | No | Creator objects |
| image | string | No | Image URL |
| imageHash | string | No | SHA-256 hash of image, `0x`-prefixed |
| mediaUrl | string | No | Primary media URL |
| mediaHash | string | No | SHA-256 hash of media |
| mediaType | string | No | MIME type |
| ipType | string | No | e.g., "character", "story", "music" |
| tags | string[] | No | Categorization tags |
| aiMetadata | object | No | AI-specific fields |
| relationships | array | No | Relationships to other IPs |

### Supported Media Types

`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`, `audio/mpeg`, `audio/wav`, `audio/flac`, `audio/ogg`, `video/mp4`, `video/webm`

### Relationship Types

**Story types:** APPEARS_IN, BELONGS_TO, PART_OF, CONTINUATION_OF, ADAPTATION_OF, INSPIRED_BY, REFERENCES, CROSSOVER_WITH

**AI types:** TRAINED_ON, FINETUNED_FROM, GENERATED_FROM, DERIVED_FROM

## NFT Metadata (OpenSea ERC-721 Standard)

Standard ERC-721 metadata for the ownership NFT.

```json
{
  "name": "Ownership NFT for My IP",
  "description": "Represents ownership of the IP Asset",
  "image": "https://ipfs.io/ipfs/QmImage...",
  "attributes": [
    { "trait_type": "IP Type", "value": "Character" }
  ]
}
```

## IPFS Upload and Hashing

Both metadata objects must be uploaded to IPFS and their SHA-256 hashes computed.

```typescript
import { PinataSDK } from 'pinata-web3';
import { createHash } from 'crypto';

const pinata = new PinataSDK({ pinataJwt: process.env.PINATA_JWT });

// Upload to IPFS
async function uploadToIPFS(metadata: object): Promise<string> {
  const { IpfsHash } = await pinata.upload.json(metadata);
  return IpfsHash;
}

// Compute hash
function computeHash(metadata: object): string {
  return createHash('sha256')
    .update(JSON.stringify(metadata))
    .digest('hex');
}

// Usage
const ipIpfsHash = await uploadToIPFS(ipMetadata);
const ipHash = computeHash(ipMetadata);
const nftIpfsHash = await uploadToIPFS(nftMetadata);
const nftHash = computeHash(nftMetadata);

// Pass to registerIpAsset
const response = await client.ipAsset.registerIpAsset({
  nft: { ... },
  ipMetadata: {
    ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
    ipMetadataHash: `0x${ipHash}`,
    nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
    nftMetadataHash: `0x${nftHash}`,
  },
});
```

## Common Mistakes

1. **Confusing IP metadata with NFT metadata** — they are separate objects with different schemas
2. **Wrong hash format** — must be SHA-256, hex-encoded, `0x`-prefixed
3. **Missing hash** — if you provide a URI, always provide the corresponding hash
4. **Using token URI as metadata** — the token URI points to NFT metadata, not IP metadata
```

**Step 3: Create registration-patterns.md**

File: `packages/plugins/story-ip/skills/ip-registration/references/registration-patterns.md`

```markdown
# IP Registration Patterns

## Decision Tree

```
Do you already have an ERC-721 NFT?
├── Yes → Use registerIpAsset with type: 'minted'
└── No
    ├── Do you have an SPG NFT collection?
    │   ├── Yes → Use registerIpAsset with type: 'mint'
    │   └── No → Create collection first with createNFTCollection
    └── Want to attach license terms too?
        └── Yes → Add licenseTermsData to registerIpAsset call
```

## Pattern 1: Register Existing NFT

Simplest path. You already own an ERC-721 NFT.

```typescript
const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'minted',
    nftContract: '0xYourERC721',
    tokenId: '42',
  },
  ipMetadata: { /* see metadata-standard.md */ },
});

// response.ipId — the IP Account address
// response.txHash
```

**Requirements:**
- Caller must own the NFT
- NFT must not already be registered

## Pattern 2: Create Collection + Mint + Register

Full flow from scratch.

```typescript
import { zeroAddress } from 'viem';

// Step 1: Create your collection
const collection = await client.nftClient.createNFTCollection({
  name: 'My IP Collection',
  symbol: 'MIP',
  isPublicMinting: false,
  mintOpen: true,
  mintFeeRecipient: zeroAddress,
  contractURI: '',
});

// Step 2: Mint + Register
const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: collection.spgNftContract,
  },
  ipMetadata: { /* see metadata-standard.md */ },
});
```

## Pattern 3: Register + Attach License Terms (Atomic)

One transaction for everything.

```typescript
import { PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther } from 'viem';

const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xYourSPGCollection',
  },
  licenseTermsData: [
    {
      terms: PILFlavor.commercialRemix({
        commercialRevShare: 5,
        defaultMintingFee: parseEther('1'),
        currency: WIP_TOKEN_ADDRESS,
      }),
    },
  ],
  ipMetadata: { /* ... */ },
});

// response.ipId
// response.licenseTermsIds — the registered license terms IDs
```

## Pattern 4: Register + Distribute Royalty Tokens

```typescript
const response = await client.ipAsset.registerIpAsset({
  nft: { type: 'mint', spgNftContract: '0x...' },
  royaltyShares: [
    { recipient: '0xCreator1', percentage: 60 },
    { recipient: '0xCreator2', percentage: 40 },
  ],
  ipMetadata: { /* ... */ },
});
```

## Pattern 5: Solidity Direct Registration

```solidity
import { IPAssetRegistry } from "@story-protocol/core/registries/IPAssetRegistry.sol";

IPAssetRegistry public immutable IP_ASSET_REGISTRY =
    IPAssetRegistry(0x77319B4031e6eF1250907aa00018B8B1c67a244b);

function registerExistingNFT(address nftContract, uint256 tokenId) external {
    address ipId = IP_ASSET_REGISTRY.register(
        block.chainid,
        nftContract,
        tokenId
    );
}
```

## Pattern 6: SPG Solidity Registration

```solidity
import { RegistrationWorkflows } from "@story-protocol/periphery/workflows/RegistrationWorkflows.sol";
import { WorkflowStructs } from "@story-protocol/periphery/lib/WorkflowStructs.sol";

RegistrationWorkflows public immutable REGISTRATION =
    RegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424);

function mintAndRegister(address spgNftContract, address recipient) external {
    (address ipId, uint256 tokenId) = REGISTRATION.mintAndRegisterIp(
        spgNftContract,
        recipient,
        WorkflowStructs.IPMetadata({
            ipMetadataURI: "ipfs://...",
            ipMetadataHash: bytes32(0),
            nftMetadataURI: "ipfs://...",
            nftMetadataHash: bytes32(0)
        }),
        true // use permit signature
    );
}
```

## Testing with Public Testnet Collection

For quick testing on Aeneid testnet, use the public SPG collection:

```typescript
const response = await client.ipAsset.registerIpAsset({
  nft: {
    type: 'mint',
    spgNftContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc', // public testnet
  },
  ipMetadata: {
    ipMetadataURI: '',
    ipMetadataHash: '0x',
    nftMetadataURI: '',
    nftMetadataHash: '0x',
  },
});
```

## Foundry Testing

Fork Aeneid for integration tests:

```bash
forge test --fork-url https://aeneid.storyrpc.io/
```
```

**Step 4: Commit**

```bash
git add packages/plugins/story-ip/skills/ip-registration/references/
git commit -m "feat(story-ip): add ip-registration reference documents"
```

---

### Task 8: Eval Template

**Files:**
- Create: `evals/templates/suite/promptfoo.yaml.template`
- Create: `evals/templates/suite/prompt-wrapper.txt.template`
- Create: `evals/templates/suite/README.md.template`
- Create: `evals/templates/suite/cases/.gitkeep`
- Create: `evals/templates/suite/rubrics/.gitkeep`
- Create: `evals/promptfoo.yaml`
- Create: `evals/project.json`

**Step 1: Create directory structure**

```bash
mkdir -p evals/templates/suite/cases
mkdir -p evals/templates/suite/rubrics
mkdir -p evals/suites
mkdir -p evals/scripts
```

**Step 2: Create root promptfoo.yaml**

File: `evals/promptfoo.yaml`

```yaml
description: 'Story Protocol AI Plugin Evaluations'

providers:
  - id: anthropic:claude-sonnet-4-5-20250929
    config:
      temperature: 0

evaluateOptions:
  showCost: true

defaultTest:
  options:
    timeout: 120000
```

**Step 3: Create evals project.json**

File: `evals/project.json`

```json
{
  "name": "evals",
  "$schema": "../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "evals",
  "projectType": "library",
  "tags": ["type:evals"],
  "targets": {
    "eval-suite:ip-registration": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx promptfoo eval -c evals/suites/ip-registration/promptfoo.yaml"
      },
      "inputs": [
        "evals/suites/ip-registration/**/*",
        "packages/plugins/story-ip/skills/ip-registration/**/*"
      ]
    }
  }
}
```

**Step 4: Create template files**

File: `evals/templates/suite/promptfoo.yaml.template`

```yaml
description: '{{SKILL_NAME}} Skill Evaluation'

prompts:
  - file://prompt-wrapper.txt

providers:
  - id: anthropic:claude-sonnet-4-5-20250929
    config:
      temperature: 0
      max_tokens: 4096

defaultTest:
  options:
    timeout: 120000
  vars:
    skill_content: file://../../../packages/plugins/{{PLUGIN_NAME}}/skills/{{SKILL_NAME}}/SKILL.md

tests:
  # Add test cases here
  # - vars:
  #     case_content: file://cases/example.md
  #   assert:
  #     - type: llm-rubric
  #       value: file://rubrics/example.txt
  #       threshold: 0.85
  #       provider: anthropic:claude-sonnet-4-5-20250929
```

File: `evals/templates/suite/prompt-wrapper.txt.template`

```
You are an AI assistant with the following skill loaded. Follow its instructions precisely when responding to the user's request.

{{ skill_content }}

***

User request:

{{ case_content }}
```

File: `evals/templates/suite/README.md.template`

```markdown
# {{SKILL_NAME}} Eval Suite

Evaluation suite for the `{{SKILL_NAME}}` skill in the `{{PLUGIN_NAME}}` plugin.

## Running

```bash
npx promptfoo eval -c evals/suites/{{SKILL_NAME}}/promptfoo.yaml
```

## Cases

<!-- List test cases here -->

## Rubrics

<!-- List rubrics here -->
```

**Step 5: Create .gitkeep files**

```bash
touch evals/templates/suite/cases/.gitkeep
touch evals/templates/suite/rubrics/.gitkeep
```

**Step 6: Commit**

```bash
git add evals/
git commit -m "chore: add eval framework and suite template"
```

---

### Task 9: ip-registration Eval Suite

**Files:**
- Create: `evals/suites/ip-registration/promptfoo.yaml`
- Create: `evals/suites/ip-registration/prompt-wrapper.txt`
- Create: `evals/suites/ip-registration/README.md`
- Create: `evals/suites/ip-registration/cases/basic-registration.md`
- Create: `evals/suites/ip-registration/cases/spg-mint-and-register.md`
- Create: `evals/suites/ip-registration/cases/metadata-requirements.md`
- Create: `evals/suites/ip-registration/cases/create-collection.md`
- Create: `evals/suites/ip-registration/cases/ipid-derivation.md`
- Create: `evals/suites/ip-registration/rubrics/registration-correctness.txt`
- Create: `evals/suites/ip-registration/rubrics/metadata-completeness.txt`
- Create: `evals/suites/ip-registration/rubrics/spg-understanding.txt`
- Create: `evals/suites/ip-registration/rubrics/pitfall-awareness.txt`

**Step 1: Create directory structure**

```bash
mkdir -p evals/suites/ip-registration/cases
mkdir -p evals/suites/ip-registration/rubrics
```

**Step 2: Create prompt-wrapper.txt**

File: `evals/suites/ip-registration/prompt-wrapper.txt`

Note: Use `***` not `---` as section separators (Promptfoo constraint).

```
You are an AI assistant with the following skill loaded. Follow its instructions precisely when responding to the user's request.

{{ skill_content }}

***

Reference: Contract Addresses

{{ contract_addresses }}

***

Reference: Metadata Standard

{{ metadata_standard }}

***

Reference: Registration Patterns

{{ registration_patterns }}

***

User request:

{{ case_content }}
```

**Step 3: Create promptfoo.yaml**

File: `evals/suites/ip-registration/promptfoo.yaml`

```yaml
description: 'IP Registration Skill Evaluation'

prompts:
  - file://prompt-wrapper.txt

providers:
  - id: anthropic:claude-sonnet-4-5-20250929
    config:
      temperature: 0
      max_tokens: 4096

defaultTest:
  options:
    timeout: 120000
  vars:
    skill_content: file://../../../packages/plugins/story-ip/skills/ip-registration/SKILL.md
    contract_addresses: file://../../../packages/plugins/story-ip/skills/ip-registration/references/contract-addresses.md
    metadata_standard: file://../../../packages/plugins/story-ip/skills/ip-registration/references/metadata-standard.md
    registration_patterns: file://../../../packages/plugins/story-ip/skills/ip-registration/references/registration-patterns.md

tests:
  - vars:
      case_content: file://cases/basic-registration.md
    assert:
      - type: llm-rubric
        value: file://rubrics/registration-correctness.txt
        threshold: 0.85
        provider: anthropic:claude-sonnet-4-5-20250929
      - type: contains
        value: 'IPAssetRegistry'
      - type: contains
        value: 'ipId'

  - vars:
      case_content: file://cases/spg-mint-and-register.md
    assert:
      - type: llm-rubric
        value: file://rubrics/spg-understanding.txt
        threshold: 0.85
        provider: anthropic:claude-sonnet-4-5-20250929
      - type: contains-any
        value: ['mintAndRegisterIp', 'registerIpAsset']
      - type: contains
        value: 'spgNftContract'

  - vars:
      case_content: file://cases/metadata-requirements.md
    assert:
      - type: llm-rubric
        value: file://rubrics/metadata-completeness.txt
        threshold: 0.85
        provider: anthropic:claude-sonnet-4-5-20250929
      - type: contains
        value: 'ipMetadataHash'
      - type: contains-any
        value: ['SHA-256', 'sha256', 'sha-256']

  - vars:
      case_content: file://cases/create-collection.md
    assert:
      - type: llm-rubric
        value: file://rubrics/registration-correctness.txt
        threshold: 0.85
        provider: anthropic:claude-sonnet-4-5-20250929
      - type: contains
        value: 'createNFTCollection'
      - type: contains
        value: 'spgNftContract'

  - vars:
      case_content: file://cases/ipid-derivation.md
    assert:
      - type: llm-rubric
        value: file://rubrics/pitfall-awareness.txt
        threshold: 0.85
        provider: anthropic:claude-sonnet-4-5-20250929
      - type: contains
        value: 'ipId'
      - type: not-contains
        value: 'tokenId is the ipId'
```

**Step 4: Create test cases**

File: `evals/suites/ip-registration/cases/basic-registration.md`

```markdown
I have an ERC-721 NFT at contract address 0xABC123 with token ID 7. I want to register it as an IP Asset on Story Protocol using the TypeScript SDK. Can you show me how? I'm on the Aeneid testnet.
```

File: `evals/suites/ip-registration/cases/spg-mint-and-register.md`

```markdown
I want to mint a new NFT and register it as an IP Asset on Story Protocol in a single transaction. I don't have an existing NFT collection. How do I do this using the TypeScript SDK on testnet?
```

File: `evals/suites/ip-registration/cases/metadata-requirements.md`

```markdown
I'm registering an IP Asset on Story Protocol. What metadata do I need to provide? I'm confused about the difference between IP metadata and NFT metadata. Can you explain both formats and how to hash them correctly?
```

File: `evals/suites/ip-registration/cases/create-collection.md`

```markdown
I want to create my own SPG NFT collection on Story Protocol so I can mint and register multiple IP Assets. How do I create the collection and then use it? Show me the TypeScript SDK code.
```

File: `evals/suites/ip-registration/cases/ipid-derivation.md`

```markdown
What is an ipId in Story Protocol? How is it different from the NFT token ID? How can I compute the ipId for my IP Asset?
```

**Step 5: Create rubrics**

File: `evals/suites/ip-registration/rubrics/registration-correctness.txt`

```
Required Elements (Must Include):

1. Correct SDK method: Uses client.ipAsset.registerIpAsset() (not deprecated methods)
2. Correct nft parameter: Uses type 'minted' for existing NFTs or type 'mint' for SPG
3. Correct contract reference: IPAssetRegistry at 0x77319B4031e6eF1250907aa00018B8B1c67a244b
4. Metadata object: Includes ipMetadata with ipMetadataURI, ipMetadataHash, nftMetadataURI, nftMetadataHash
5. Output handling: Mentions response.ipId and response.txHash

Scoring Guide:
- 5/5 elements correct: 1.0
- 4/5: 0.85
- 3/5: 0.7
- 2/5: 0.5
- 1/5 or less: 0.3
```

File: `evals/suites/ip-registration/rubrics/metadata-completeness.txt`

```
Required Elements (Must Include):

1. Two metadata types: Clearly distinguishes IP metadata (IPA standard) from NFT metadata (ERC-721/OpenSea standard)
2. IP metadata fields: Mentions key fields (title, description, creators, image, ipType)
3. NFT metadata fields: Mentions standard fields (name, description, image, attributes)
4. Hashing: Explains SHA-256 hashing with 0x prefix for ipMetadataHash and nftMetadataHash
5. IPFS upload: Mentions uploading both metadata objects to IPFS

Scoring Guide:
- 5/5 elements correct: 1.0
- 4/5: 0.85
- 3/5: 0.7
- 2/5: 0.5
- 1/5 or less: 0.3
```

File: `evals/suites/ip-registration/rubrics/spg-understanding.txt`

```
Required Elements (Must Include):

1. SPG explanation: Explains SPG bundles mint + register into one transaction
2. Collection requirement: Mentions need for an SPG NFT collection (create or use existing)
3. Correct method: Uses registerIpAsset with nft.type 'mint' and spgNftContract
4. Public testnet option: Mentions public testnet collection 0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc or createNFTCollection
5. Ownership: Mentions minting rights requirement or isPublicMinting flag

Scoring Guide:
- 5/5 elements correct: 1.0
- 4/5: 0.85
- 3/5: 0.7
- 2/5: 0.5
- 1/5 or less: 0.3
```

File: `evals/suites/ip-registration/rubrics/pitfall-awareness.txt`

```
Required Elements (Must Include):

1. ipId is NOT tokenId: Clearly states ipId is the IP Account contract address, derived deterministically, not the ERC-721 token ID
2. ERC-6551: Mentions ipId is an ERC-6551 Token Bound Account
3. Derivation: Shows or explains ipId = IPAssetRegistry.ipId(chainId, tokenContract, tokenId)
4. Distinction: Makes it clear these are fundamentally different things (address vs uint256)
5. Practical usage: Shows how to get ipId from registration response or compute it

Scoring Guide:
- 5/5 elements correct: 1.0
- 4/5: 0.85
- 3/5: 0.7
- 2/5: 0.5
- 1/5 or less: 0.3
```

**Step 6: Create README.md**

File: `evals/suites/ip-registration/README.md`

```markdown
# ip-registration Eval Suite

Evaluation suite for the `ip-registration` skill in the `story-ip` plugin.

## Running

```bash
npx promptfoo eval -c evals/suites/ip-registration/promptfoo.yaml
```

## Cases

| Case | Question |
|------|----------|
| basic-registration | Register an existing NFT as IP Asset |
| spg-mint-and-register | Mint and register in one transaction |
| metadata-requirements | IP metadata vs NFT metadata |
| create-collection | Create SPG NFT collection |
| ipid-derivation | What is ipId vs tokenId |

## Rubrics

| Rubric | Evaluates |
|--------|-----------|
| registration-correctness | Correct SDK methods and contract references |
| metadata-completeness | Both metadata types, hashing, IPFS |
| spg-understanding | SPG workflow and collection requirements |
| pitfall-awareness | ipId vs tokenId distinction |
```

**Step 7: Commit**

```bash
git add evals/suites/ip-registration/
git commit -m "feat(evals): add ip-registration eval suite with 5 cases and 4 rubrics"
```

---

### Task 10: VitePress Documentation Setup

**Files:**
- Create: `docs/.vitepress/config.ts`
- Create: `docs/index.md`
- Create: `docs/getting-started/index.md`
- Create: `docs/plugins/index.md`
- Create: `docs/plugins/story-ip.md`
- Create: `docs/skills/index.md`
- Create: `docs/skills/ip-registration.md`

**Step 1: Create directory structure**

```bash
mkdir -p docs/.vitepress
mkdir -p docs/getting-started
mkdir -p docs/plugins
mkdir -p docs/skills
```

**Step 2: Create VitePress config**

File: `docs/.vitepress/config.ts`

```typescript
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Story Protocol AI',
  description: 'AI-powered skills and plugins for Story Protocol development',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Plugins', link: '/plugins/' },
      { text: 'Skills', link: '/skills/' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [{ text: 'Overview', link: '/getting-started/' }],
      },
      {
        text: 'Plugins',
        items: [
          { text: 'Overview', link: '/plugins/' },
          { text: 'story-ip', link: '/plugins/story-ip' },
          { text: 'story-licensing', link: '/plugins/story-licensing' },
          { text: 'story-royalty', link: '/plugins/story-royalty' },
          { text: 'story-sdk', link: '/plugins/story-sdk' },
          { text: 'story-contracts', link: '/plugins/story-contracts' },
        ],
      },
      {
        text: 'Skills',
        items: [
          { text: 'Overview', link: '/skills/' },
          { text: 'ip-registration', link: '/skills/ip-registration' },
          { text: 'licensing', link: '/skills/licensing' },
          { text: 'royalty-integration', link: '/skills/royalty-integration' },
          { text: 'sdk-integration', link: '/skills/sdk-integration' },
          { text: 'smart-contracts', link: '/skills/smart-contracts' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/storyprotocol/story-skills' },
    ],
    footer: {
      message: 'MIT License',
    },
    search: { provider: 'local' },
  },
  markdown: {
    languages: ['solidity', 'typescript', 'javascript', 'json', 'bash', 'yaml'],
  },
});
```

**Step 3: Create docs/index.md**

File: `docs/index.md`

```markdown
---
layout: home
hero:
  name: Story Protocol AI
  text: AI-Powered Development Tools
  tagline: Skills and plugins for building on Story Protocol
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/
    - theme: alt
      text: View on GitHub
      link: https://github.com/storyprotocol/story-skills
features:
  - title: IP Registration
    details: Register NFTs as IP Assets using IPAssetRegistry or SPG workflows
  - title: Licensing
    details: Configure PIL license terms, attach licenses, register derivatives
  - title: Royalties
    details: Pay and claim royalties with LAP/LRP policies
  - title: SDK Integration
    details: TypeScript SDK patterns for StoryClient setup and usage
---
```

**Step 4: Create getting-started/index.md**

File: `docs/getting-started/index.md`

```markdown
# Getting Started

## Installation

Install the Story Protocol AI skills:

```bash
npx skills add storyprotocol/story-skills
```

## Available Plugins

| Plugin | Description |
|--------|-------------|
| [story-ip](/plugins/story-ip) | IP Asset registration and metadata |
| [story-licensing](/plugins/story-licensing) | License terms and derivatives |
| [story-royalty](/plugins/story-royalty) | Royalty payments and revenue |
| [story-sdk](/plugins/story-sdk) | TypeScript SDK patterns |
| [story-contracts](/plugins/story-contracts) | Solidity smart contract interaction |

## How Skills Work

Skills activate contextually based on what you're working on. When you mention
"register IP" or "Story Protocol", the relevant skill loads automatically and
provides curated guidance, code examples, and pitfall warnings.
```

**Step 5: Create plugins/index.md and plugins/story-ip.md**

File: `docs/plugins/index.md`

```markdown
# Plugins

Story Protocol AI provides five domain-specific plugins:

| Plugin | Skill | Focus |
|--------|-------|-------|
| [story-ip](./story-ip) | ip-registration | IP Asset registration and metadata |
| [story-licensing](./story-licensing) | licensing | PIL license terms and derivatives |
| [story-royalty](./story-royalty) | royalty-integration | Royalty payments and revenue |
| [story-sdk](./story-sdk) | sdk-integration | TypeScript SDK patterns |
| [story-contracts](./story-contracts) | smart-contracts | Solidity contract interaction |
```

File: `docs/plugins/story-ip.md`

```markdown
# story-ip

AI-powered assistance for Story Protocol IP Asset registration.

## Skills

- [ip-registration](/skills/ip-registration) — Register IP assets via IPAssetRegistry or SPG

## Trigger Phrases

The skill activates when you mention:
- "register IP", "IP Asset", "mintAndRegisterIp"
- "createCollection", "SPG", "Story Protocol registration"
- "ipId"

## Key Concepts

- **IP Asset**: An ERC-721 NFT registered in the IPAssetRegistry
- **IP Account**: An ERC-6551 Token Bound Account (the `ipId`)
- **SPG**: Story Protocol Gateway for bundled mint + register transactions
```

**Step 6: Create skills/index.md and skills/ip-registration.md**

File: `docs/skills/index.md`

```markdown
# Skills

## Available Skills

| Skill | Plugin | Description |
|-------|--------|-------------|
| [ip-registration](./ip-registration) | story-ip | Register IP assets on Story Protocol |
| [licensing](./licensing) | story-licensing | Configure and attach PIL license terms |
| [royalty-integration](./royalty-integration) | story-royalty | Pay and claim royalties |
| [sdk-integration](./sdk-integration) | story-sdk | TypeScript SDK setup and patterns |
| [smart-contracts](./smart-contracts) | story-contracts | Solidity contract interaction |
```

File: `docs/skills/ip-registration.md`

```markdown
# ip-registration

Register IP assets on Story Protocol.

## Plugin

[story-ip](/plugins/story-ip)

## What This Skill Covers

- Registering existing ERC-721 NFTs as IP Assets
- Minting and registering via SPG in one transaction
- Creating SPG NFT collections
- IPA Metadata Standard (IP metadata vs NFT metadata)
- Contract addresses for Aeneid testnet and mainnet
- Common pitfalls (ipId vs tokenId, metadata hashing)

## Activation

This skill activates when you mention:
- "register IP", "IP Asset", "mintAndRegisterIp"
- "createCollection", "SPG", "Story Protocol registration", "ipId"

## Reference Documents

| Document | Content |
|----------|---------|
| contract-addresses | All deployed Story Protocol contract addresses |
| metadata-standard | IPA and NFT metadata schemas, IPFS upload, hashing |
| registration-patterns | Decision tree, SDK code patterns, Solidity examples |
```

**Step 7: Commit**

```bash
git add docs/
git commit -m "docs: add VitePress setup with story-ip and ip-registration pages"
```

---

### Task 11: Placeholder Docs for Remaining Plugins/Skills

The validation script requires docs pages for every plugin and skill. Create placeholders now, fill content when building those plugins.

**Files:**
- Create: `docs/plugins/story-licensing.md`
- Create: `docs/plugins/story-royalty.md`
- Create: `docs/plugins/story-sdk.md`
- Create: `docs/plugins/story-contracts.md`
- Create: `docs/skills/licensing.md`
- Create: `docs/skills/royalty-integration.md`
- Create: `docs/skills/sdk-integration.md`
- Create: `docs/skills/smart-contracts.md`

**Step 1: Create placeholder plugin docs**

Each file follows this pattern (replace names accordingly):

File: `docs/plugins/story-licensing.md`
```markdown
# story-licensing

AI-powered assistance for Story Protocol licensing and derivatives.

> Coming soon. See [design doc](../plans/2026-02-22-story-protocol-ai-ecosystem-design.md) for planned content.
```

File: `docs/plugins/story-royalty.md`
```markdown
# story-royalty

AI-powered assistance for Story Protocol royalty payments and revenue claiming.

> Coming soon. See [design doc](../plans/2026-02-22-story-protocol-ai-ecosystem-design.md) for planned content.
```

File: `docs/plugins/story-sdk.md`
```markdown
# story-sdk

AI-powered assistance for Story Protocol TypeScript SDK integration.

> Coming soon. See [design doc](../plans/2026-02-22-story-protocol-ai-ecosystem-design.md) for planned content.
```

File: `docs/plugins/story-contracts.md`
```markdown
# story-contracts

AI-powered assistance for Story Protocol Solidity smart contract interaction.

> Coming soon. See [design doc](../plans/2026-02-22-story-protocol-ai-ecosystem-design.md) for planned content.
```

**Step 2: Create placeholder skill docs**

File: `docs/skills/licensing.md`
```markdown
# licensing

Configure and attach PIL license terms on Story Protocol.

> Coming soon.
```

File: `docs/skills/royalty-integration.md`
```markdown
# royalty-integration

Pay and claim royalties on Story Protocol.

> Coming soon.
```

File: `docs/skills/sdk-integration.md`
```markdown
# sdk-integration

TypeScript SDK setup and patterns for Story Protocol.

> Coming soon.
```

File: `docs/skills/smart-contracts.md`
```markdown
# smart-contracts

Solidity smart contract interaction with Story Protocol.

> Coming soon.
```

**Step 3: Commit**

```bash
git add docs/plugins/ docs/skills/
git commit -m "docs: add placeholder pages for remaining plugins and skills"
```

---

### Task 12: CI Workflows

**Files:**
- Create: `.github/workflows/validate.yml`

**Step 1: Create validate workflow**

File: `.github/workflows/validate.yml`

```yaml
name: Validate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-plugins:
    name: Validate Plugins
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Validate all plugins
        run: |
          for dir in packages/plugins/*/; do
            if [ -d "$dir" ]; then
              echo "Validating $dir..."
              node scripts/validate-plugin.cjs "$dir" --require-evals
            fi
          done

  validate-docs:
    name: Validate Documentation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: node scripts/validate-docs.cjs

  lint-markdown:
    name: Lint Markdown
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx nx run-many -t lint-markdown

  build-docs:
    name: Build Documentation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run docs:build

  evals:
    name: Run Evals
    runs-on: ubuntu-latest
    if: |
      github.event_name == 'pull_request' &&
      (
        contains(github.event.pull_request.changed_files, 'packages/plugins/') ||
        contains(github.event.pull_request.changed_files, 'evals/')
      )
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Run eval suites
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: npx nx run evals:eval-suite:ip-registration
```

**Step 2: Commit**

```bash
git add .github/workflows/validate.yml
git commit -m "ci: add validation, lint, docs build, and evals workflows"
```

---

### Task 13: Marketplace Configuration

**Files:**
- Create: `.claude-plugin/marketplace.json`

**Step 1: Create marketplace.json**

File: `.claude-plugin/marketplace.json`

```json
{
  "version": "1.0.0",
  "plugins": [
    {
      "name": "story-ip",
      "path": "packages/plugins/story-ip",
      "description": "AI-powered assistance for Story Protocol IP Asset registration and metadata"
    },
    {
      "name": "story-licensing",
      "path": "packages/plugins/story-licensing",
      "description": "AI-powered assistance for Story Protocol licensing and derivatives"
    },
    {
      "name": "story-royalty",
      "path": "packages/plugins/story-royalty",
      "description": "AI-powered assistance for Story Protocol royalty payments and revenue"
    },
    {
      "name": "story-sdk",
      "path": "packages/plugins/story-sdk",
      "description": "AI-powered assistance for Story Protocol TypeScript SDK integration"
    },
    {
      "name": "story-contracts",
      "path": "packages/plugins/story-contracts",
      "description": "AI-powered assistance for Story Protocol Solidity smart contract interaction"
    }
  ]
}
```

**Step 2: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "chore: add Claude marketplace configuration"
```

---

### Task 14: story-licensing Plugin

**Files:**
- Create: `packages/plugins/story-licensing/.claude-plugin/plugin.json`
- Create: `packages/plugins/story-licensing/package.json`
- Create: `packages/plugins/story-licensing/project.json`
- Create: `packages/plugins/story-licensing/README.md`
- Create: `packages/plugins/story-licensing/CLAUDE.md`
- Create: `packages/plugins/story-licensing/AGENTS.md` (symlink)
- Create: `packages/plugins/story-licensing/skills/licensing/SKILL.md`
- Create: `packages/plugins/story-licensing/skills/licensing/references/pil-terms-reference.md`
- Create: `packages/plugins/story-licensing/skills/licensing/references/derivatives-guide.md`
- Create: `packages/plugins/story-licensing/skills/licensing/references/common-pitfalls.md`

Follow the same structure as Task 5-7 but with licensing content from the research:

**plugin.json:** name `story-licensing`, skills `["./skills/licensing"]`
**project.json:** name `story-licensing`, tags `["type:plugin", "scope:story-protocol"]`
**package.json:** name `@story-protocol/story-licensing`

**SKILL.md frontmatter:**
```yaml
---
name: licensing
description: Story Protocol licensing and derivatives. Use when user mentions "license", "PIL", "license terms", "derivative", "commercial use", "remix", "attach license", "PILFlavor", "commercialRevShare", or wants to configure IP licensing on Story.
allowed-tools: Read, Glob, Grep, WebFetch, Task(subagent_type:Explore)
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '1.0.0'
---
```

**SKILL.md body should cover:**
- Full LicenseTerms struct with all fields and types
- PILFlavor presets (nonCommercialSocialRemixing ID=1, commercialUse, commercialRemix, ccAttribution)
- attachLicenseTerms, registerPilTermsAndAttach methods
- linkDerivative, registerDerivativeIpAsset, registerDerivativeIpAsset with SPG
- commercialRevShare encoding (percent in SDK vs uint32 in contract: 10_000_000 = 10%)
- LicensingConfig struct
- mintLicenseTokens, predictMintingLicenseFee
- All license module SDK methods table

**Reference docs should cover:**
- `pil-terms-reference.md`: Complete LicenseTerms struct, all fields with types/ranges/defaults, PILFlavor examples
- `derivatives-guide.md`: linkDerivative, registerDerivativeIpAsset, maxRts, derivative registration patterns
- `common-pitfalls.md`: Re-registering ID 1, revShare encoding, wrong spender bug, maxRts range, success check on attachLicenseTerms

**Commit message:** `feat(story-licensing): add licensing plugin with skill and references`

---

### Task 15: story-royalty Plugin

Follow the same pattern as Task 14 but with royalty content.

**plugin.json:** name `story-royalty`, skills `["./skills/royalty-integration"]`
**package.json:** name `@story-protocol/story-royalty`

**SKILL.md frontmatter:**
```yaml
---
name: royalty-integration
description: Story Protocol royalty payments and revenue claiming. Use when user mentions "royalty", "revenue", "pay royalty", "claim revenue", "royalty vault", "royalty tokens", "LAP", "LRP", "IpRoyaltyVault", or wants to handle payments on Story.
allowed-tools: Read, Glob, Grep, WebFetch, Task(subagent_type:Explore)
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '1.0.0'
---
```

**SKILL.md body should cover:**
- IP Royalty Vault mechanics (100 tokens = 100%, 6 decimal precision)
- LAP vs LRP policies with addresses
- Royalty stack calculation (cumulative)
- payRoyaltyOnBehalf (with wipOptions, erc20Options)
- claimAllRevenue, batchClaimAllRevenue
- getRoyaltyVaultAddress, claimableRevenue
- Whitelisted payment tokens (WIP, MERC20 testnet)
- Royalty tokens stuck in IP Account pitfall

**Reference docs:**
- `royalty-system.md`: Vault mechanics, LAP vs LRP, royalty stack math, royalty token supply (100_000_000)
- `payment-claiming.md`: payRoyaltyOnBehalf, claimAllRevenue, batchClaimAllRevenue with code
- `revenue-distribution.md`: Royalty token transfers, autoTransfer/autoUnwrap options, permissionless claiming

**Commit message:** `feat(story-royalty): add royalty-integration plugin with skill and references`

---

### Task 16: story-sdk Plugin

Follow the same pattern as Task 14 but with SDK content.

**plugin.json:** name `story-sdk`, skills `["./skills/sdk-integration"]`
**package.json:** name `@story-protocol/story-sdk`

**SKILL.md frontmatter:**
```yaml
---
name: sdk-integration
description: Story Protocol TypeScript SDK setup and usage. Use when user mentions "Story SDK", "@story-protocol/core-sdk", "StoryClient", "SDK setup", "story-protocol npm", or wants to initialize and use the Story Protocol SDK.
allowed-tools: Read, Glob, Grep, WebFetch, Task(subagent_type:Explore)
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '1.0.0'
---
```

**SKILL.md body should cover:**
- Installation: `npm install @story-protocol/core-sdk viem`
- StoryClient.newClient() initialization with StoryConfig
- Chain configs: 'aeneid' (1315) and 'mainnet' (1514)
- All client modules: IPAssetClient, LicenseClient, RoyaltyClient, DisputeClient, NftClient, GroupClient, WipClient, IPAccountClient, PermissionClient
- Key exports: WIP_TOKEN_ADDRESS, PILFlavor, LicenseTerms, aeneid, mainnet chain objects
- Utility functions: convertCIDtoHashIPFS, convertHashIPFStoCID, getPermissionSignature, getSignature
- Common patterns: error handling, transaction confirmation, gas estimation

**Reference docs:**
- `client-setup.md`: Full StoryConfig type, backend vs frontend setup, viem integration
- `method-reference.md`: All methods organized by client module (IPAsset, License, Royalty, etc.)
- `constants-exports.md`: All exported constants, types, chain objects, addresses

**Commit message:** `feat(story-sdk): add sdk-integration plugin with skill and references`

---

### Task 17: story-contracts Plugin

Follow the same pattern as Task 14 but with Solidity/contracts content.

**plugin.json:** name `story-contracts`, skills `["./skills/smart-contracts"]`
**package.json:** name `@story-protocol/story-contracts`

**SKILL.md frontmatter:**
```yaml
---
name: smart-contracts
description: Story Protocol Solidity smart contract interaction. Use when user mentions "Story contract", "IPAssetRegistry", "Solidity", "Story smart contract", "foundry", "forge", "LicensingModule", "RoyaltyModule", or wants to interact with Story contracts directly.
allowed-tools: Read, Glob, Grep, WebFetch, Task(subagent_type:Explore)
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '1.0.0'
---
```

**SKILL.md body should cover:**
- All core contract interfaces (IPAssetRegistry, LicensingModule, RoyaltyModule, DisputeModule, AccessController)
- SPG workflow contracts (RegistrationWorkflows, DerivativeWorkflows, LicenseAttachmentWorkflows, etc.)
- Foundry setup and testing with Aeneid fork
- AccessController permission table pattern (wildcard selectors)
- SPG multicall vs Multicall3 incompatibility
- story-protocol-boilerplate repo reference
- Key function signatures

**Reference docs:**
- `contract-addresses.md`: Complete address table (shared content with story-ip)
- `core-contracts.md`: Interface descriptions, key functions, parameters
- `spg-workflows.md`: All workflow contracts, multicall patterns, limitations

**Commit message:** `feat(story-contracts): add smart-contracts plugin with skill and references`

---

### Task 18: Remaining Eval Suites

Create eval suites for each remaining skill following the same pattern as Task 9.

For each skill (licensing, royalty-integration, sdk-integration, smart-contracts):

**Step 1:** Create `evals/suites/<skill-name>/` with:
- `promptfoo.yaml` — pointing to the skill's SKILL.md and references via `file://` vars
- `prompt-wrapper.txt` — same pattern as ip-registration, injecting skill + references
- `cases/*.md` — 3-5 test scenarios relevant to the skill domain
- `rubrics/*.txt` — 3-4 grading rubrics

**Step 2:** Add eval targets to `evals/project.json`:
```json
"eval-suite:licensing": { ... },
"eval-suite:royalty-integration": { ... },
"eval-suite:sdk-integration": { ... },
"eval-suite:smart-contracts": { ... }
```

**Step 3:** Update CI workflow to run all eval suites.

**Commit message:** `feat(evals): add eval suites for licensing, royalty, sdk, and contracts skills`

---

### Task 19: Final Validation and .gitignore

**Files:**
- Create: `.gitignore`

**Step 1: Create .gitignore**

```
node_modules/
dist/
.cache/
.vitepress/cache/
.vitepress/dist/
*.log
.env
.env.*
```

**Step 2: Install dependencies and run full validation**

```bash
npm install
```

**Step 3: Validate all plugins**

```bash
for dir in packages/plugins/*/; do
  node scripts/validate-plugin.cjs "$dir"
done
```

Expected: 0 errors for all plugins.

**Step 4: Validate docs**

```bash
node scripts/validate-docs.cjs
```

Expected: 0 errors.

**Step 5: Build docs**

```bash
npm run docs:build
```

Expected: Successful build.

**Step 6: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore and verify full validation passes"
```

---

## Execution Notes

- Tasks 1-13 are the critical path for the first complete vertical slice (scaffolding + story-ip + evals + docs + CI)
- Tasks 14-17 follow the exact same pattern established by Tasks 5-7, just with different domain content
- Task 18 follows the pattern from Task 9
- The research data from the brainstorming phase provides all the content needed for skill bodies and reference docs
- All contract addresses, SDK methods, and code examples come from the deep research output
