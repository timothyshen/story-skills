# Marketplace Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure story-skills from `packages/plugins/` into two top-level marketplace packages (`story-sdk/` and `story-contracts/`) for skills.sh publishing.

**Architecture:** Move 5 existing plugin directories into 2 top-level skill packages. The SDK package contains 4 sub-skills (sdk-integration, ip-registration, licensing, royalty-integration) plus a lightweight umbrella SKILL.md. The contracts package contains 1 skill (smart-contracts). All Nx configs, eval paths, validation scripts, and CI workflows update to reference the new paths.

**Tech Stack:** skills.sh CLI, Nx, Promptfoo, GitHub Actions, Node.js

**Design doc:** `docs/plans/2026-02-24-marketplace-restructure-design.md`

---

### Task 1: Create story-sdk directory structure and move SDK skills

**Files:**
- Create: `story-sdk/sdk-integration/SKILL.md` (move from `packages/plugins/story-sdk/skills/sdk-integration/SKILL.md`)
- Create: `story-sdk/sdk-integration/references/` (move from `packages/plugins/story-sdk/skills/sdk-integration/references/`)
- Create: `story-sdk/ip-registration/SKILL.md` (move from `packages/plugins/story-ip/skills/ip-registration/SKILL.md`)
- Create: `story-sdk/ip-registration/references/` (move from `packages/plugins/story-ip/skills/ip-registration/references/`)
- Create: `story-sdk/licensing/SKILL.md` (move from `packages/plugins/story-licensing/skills/licensing/SKILL.md`)
- Create: `story-sdk/licensing/references/` (move from `packages/plugins/story-licensing/skills/licensing/references/`)
- Create: `story-sdk/royalty-integration/SKILL.md` (move from `packages/plugins/story-royalty/skills/royalty-integration/SKILL.md`)
- Create: `story-sdk/royalty-integration/references/` (move from `packages/plugins/story-royalty/skills/royalty-integration/references/`)

**Step 1: Create directory structure and move files**

```bash
mkdir -p story-sdk/sdk-integration/references
mkdir -p story-sdk/ip-registration/references
mkdir -p story-sdk/licensing/references
mkdir -p story-sdk/royalty-integration/references

# SDK integration
cp packages/plugins/story-sdk/skills/sdk-integration/SKILL.md story-sdk/sdk-integration/SKILL.md
cp packages/plugins/story-sdk/skills/sdk-integration/references/* story-sdk/sdk-integration/references/

# IP registration
cp packages/plugins/story-ip/skills/ip-registration/SKILL.md story-sdk/ip-registration/SKILL.md
cp packages/plugins/story-ip/skills/ip-registration/references/* story-sdk/ip-registration/references/

# Licensing
cp packages/plugins/story-licensing/skills/licensing/SKILL.md story-sdk/licensing/SKILL.md
cp packages/plugins/story-licensing/skills/licensing/references/* story-sdk/licensing/references/

# Royalty
cp packages/plugins/story-royalty/skills/royalty-integration/SKILL.md story-sdk/royalty-integration/SKILL.md
cp packages/plugins/story-royalty/skills/royalty-integration/references/* story-sdk/royalty-integration/references/
```

**Step 2: Verify all files copied correctly**

```bash
find story-sdk -type f | sort
```

Expected output:
```
story-sdk/ip-registration/SKILL.md
story-sdk/ip-registration/references/contract-addresses.md
story-sdk/ip-registration/references/metadata-standard.md
story-sdk/ip-registration/references/registration-patterns.md
story-sdk/licensing/SKILL.md
story-sdk/licensing/references/common-pitfalls.md
story-sdk/licensing/references/derivatives-guide.md
story-sdk/licensing/references/pil-terms-reference.md
story-sdk/royalty-integration/SKILL.md
story-sdk/royalty-integration/references/payment-claiming.md
story-sdk/royalty-integration/references/revenue-distribution.md
story-sdk/royalty-integration/references/royalty-system.md
story-sdk/sdk-integration/SKILL.md
story-sdk/sdk-integration/references/client-setup.md
story-sdk/sdk-integration/references/constants-exports.md
story-sdk/sdk-integration/references/method-reference.md
```

**Step 3: Commit**

```bash
git add story-sdk/
git commit -m "feat: create story-sdk marketplace package with 4 sub-skills"
```

---

### Task 2: Create story-contracts directory and move contract skill

**Files:**
- Create: `story-contracts/SKILL.md` (move from `packages/plugins/story-contracts/skills/smart-contracts/SKILL.md`)
- Create: `story-contracts/references/` (move from `packages/plugins/story-contracts/skills/smart-contracts/references/`)

**Step 1: Create directory and move files**

```bash
mkdir -p story-contracts/references

cp packages/plugins/story-contracts/skills/smart-contracts/SKILL.md story-contracts/SKILL.md
cp packages/plugins/story-contracts/skills/smart-contracts/references/* story-contracts/references/
```

**Step 2: Verify files**

```bash
find story-contracts -type f | sort
```

Expected:
```
story-contracts/SKILL.md
story-contracts/references/contract-addresses.md
story-contracts/references/core-contracts.md
story-contracts/references/spg-workflows.md
```

**Step 3: Commit**

```bash
git add story-contracts/
git commit -m "feat: create story-contracts marketplace package"
```

---

### Task 3: Create umbrella story-sdk/SKILL.md

**Files:**
- Create: `story-sdk/SKILL.md`

**Step 1: Write the umbrella SKILL.md**

Create `story-sdk/SKILL.md` with this content:

```markdown
---
name: story-sdk
description: Story Protocol TypeScript SDK overview and setup. Use when user mentions "Story Protocol", "Story SDK", "@story-protocol/core-sdk", "StoryClient", "SDK setup", or wants to start building on Story Protocol with TypeScript.
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '1.0.0'
---

# Story Protocol TypeScript SDK

Quick-start guide for the `@story-protocol/core-sdk` package. For detailed topics, see the sub-skills below.

## Installation

npm install @story-protocol/core-sdk viem

Requirements: Node.js 18+, npm 8+, an EVM wallet private key or wallet connector, RPC endpoint.

## Client Setup

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

## Networks

| Network | Chain ID | RPC |
|---------|----------|-----|
| Aeneid (testnet) | 1315 | https://aeneid.storyrpc.io |
| Mainnet | 1514 | https://mainnet.storyrpc.io |

## Key Contracts

| Contract | Address |
|----------|---------|
| IPAssetRegistry | 0x77319B4031e6eF1250907aa00018B8B1c67a244b |
| LicensingModule | 0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f |
| RoyaltyModule | 0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086 |
| PILicenseTemplate | 0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316 |
| RegistrationWorkflows | 0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424 |

## Sub-Skills

- **sdk-integration** — SDK methods, client modules, and usage patterns
- **ip-registration** — Register IP assets, mint NFTs, SPG workflows
- **licensing** — PIL license terms, derivatives, license tokens
- **royalty-integration** — Royalty vaults, revenue claiming, payment flows
```

**Step 2: Verify frontmatter is valid**

```bash
head -10 story-sdk/SKILL.md
```

Expected: starts with `---`, has `name:`, `description:`, `model:`.

**Step 3: Commit**

```bash
git add story-sdk/SKILL.md
git commit -m "feat: add umbrella SKILL.md for story-sdk package"
```

---

### Task 4: Create Nx project configs for new packages

**Files:**
- Create: `story-sdk/project.json`
- Create: `story-sdk/package.json`
- Create: `story-contracts/project.json`
- Create: `story-contracts/package.json`

**Step 1: Create story-sdk/project.json**

```json
{
  "name": "story-sdk",
  "$schema": "../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "story-sdk",
  "projectType": "library",
  "tags": ["type:skill-package", "scope:story-protocol"],
  "targets": {
    "lint-markdown": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx markdownlint-cli2 'story-sdk/**/*.md'"
      }
    },
    "validate": {
      "executor": "nx:run-commands",
      "options": {
        "command": "node scripts/validate-skill-package.cjs story-sdk"
      }
    }
  }
}
```

**Step 2: Create story-sdk/package.json**

```json
{
  "name": "@story-protocol/story-sdk",
  "version": "0.1.0",
  "description": "AI skills for Story Protocol TypeScript SDK development",
  "author": "Story Protocol <ai@story.foundation>",
  "license": "MIT",
  "files": ["SKILL.md", "sdk-integration", "ip-registration", "licensing", "royalty-integration"]
}
```

**Step 3: Create story-contracts/project.json**

```json
{
  "name": "story-contracts",
  "$schema": "../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "story-contracts",
  "projectType": "library",
  "tags": ["type:skill-package", "scope:story-protocol"],
  "targets": {
    "lint-markdown": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx markdownlint-cli2 'story-contracts/**/*.md'"
      }
    },
    "validate": {
      "executor": "nx:run-commands",
      "options": {
        "command": "node scripts/validate-skill-package.cjs story-contracts"
      }
    }
  }
}
```

**Step 4: Create story-contracts/package.json**

```json
{
  "name": "@story-protocol/story-contracts",
  "version": "0.1.0",
  "description": "AI skills for Story Protocol Solidity smart contract development",
  "author": "Story Protocol <ai@story.foundation>",
  "license": "MIT",
  "files": ["SKILL.md", "references"]
}
```

**Step 5: Commit**

```bash
git add story-sdk/project.json story-sdk/package.json story-contracts/project.json story-contracts/package.json
git commit -m "feat: add Nx project configs for marketplace packages"
```

---

### Task 5: Update eval promptfoo.yaml paths

All 5 eval suite `promptfoo.yaml` files need their `file://` paths updated from `packages/plugins/` to the new top-level directories.

**Files:**
- Modify: `evals/suites/sdk-integration/promptfoo.yaml`
- Modify: `evals/suites/ip-registration/promptfoo.yaml`
- Modify: `evals/suites/licensing/promptfoo.yaml`
- Modify: `evals/suites/royalty-integration/promptfoo.yaml`
- Modify: `evals/suites/smart-contracts/promptfoo.yaml`

**Step 1: Update sdk-integration eval paths**

In `evals/suites/sdk-integration/promptfoo.yaml`, change:
```yaml
# OLD
skill_content: file://../../../packages/plugins/story-sdk/skills/sdk-integration/SKILL.md
client_setup: file://../../../packages/plugins/story-sdk/skills/sdk-integration/references/client-setup.md
method_reference: file://../../../packages/plugins/story-sdk/skills/sdk-integration/references/method-reference.md
constants_exports: file://../../../packages/plugins/story-sdk/skills/sdk-integration/references/constants-exports.md
# NEW
skill_content: file://../../../story-sdk/sdk-integration/SKILL.md
client_setup: file://../../../story-sdk/sdk-integration/references/client-setup.md
method_reference: file://../../../story-sdk/sdk-integration/references/method-reference.md
constants_exports: file://../../../story-sdk/sdk-integration/references/constants-exports.md
```

**Step 2: Update ip-registration eval paths**

In `evals/suites/ip-registration/promptfoo.yaml`, change:
```yaml
# OLD
skill_content: file://../../../packages/plugins/story-ip/skills/ip-registration/SKILL.md
contract_addresses: file://../../../packages/plugins/story-ip/skills/ip-registration/references/contract-addresses.md
metadata_standard: file://../../../packages/plugins/story-ip/skills/ip-registration/references/metadata-standard.md
registration_patterns: file://../../../packages/plugins/story-ip/skills/ip-registration/references/registration-patterns.md
# NEW
skill_content: file://../../../story-sdk/ip-registration/SKILL.md
contract_addresses: file://../../../story-sdk/ip-registration/references/contract-addresses.md
metadata_standard: file://../../../story-sdk/ip-registration/references/metadata-standard.md
registration_patterns: file://../../../story-sdk/ip-registration/references/registration-patterns.md
```

**Step 3: Update licensing eval paths**

In `evals/suites/licensing/promptfoo.yaml`, change:
```yaml
# OLD
skill_content: file://../../../packages/plugins/story-licensing/skills/licensing/SKILL.md
pil_terms_reference: file://../../../packages/plugins/story-licensing/skills/licensing/references/pil-terms-reference.md
derivatives_guide: file://../../../packages/plugins/story-licensing/skills/licensing/references/derivatives-guide.md
common_pitfalls: file://../../../packages/plugins/story-licensing/skills/licensing/references/common-pitfalls.md
# NEW
skill_content: file://../../../story-sdk/licensing/SKILL.md
pil_terms_reference: file://../../../story-sdk/licensing/references/pil-terms-reference.md
derivatives_guide: file://../../../story-sdk/licensing/references/derivatives-guide.md
common_pitfalls: file://../../../story-sdk/licensing/references/common-pitfalls.md
```

**Step 4: Update royalty-integration eval paths**

In `evals/suites/royalty-integration/promptfoo.yaml`, change:
```yaml
# OLD
skill_content: file://../../../packages/plugins/story-royalty/skills/royalty-integration/SKILL.md
royalty_system: file://../../../packages/plugins/story-royalty/skills/royalty-integration/references/royalty-system.md
payment_claiming: file://../../../packages/plugins/story-royalty/skills/royalty-integration/references/payment-claiming.md
revenue_distribution: file://../../../packages/plugins/story-royalty/skills/royalty-integration/references/revenue-distribution.md
# NEW
skill_content: file://../../../story-sdk/royalty-integration/SKILL.md
royalty_system: file://../../../story-sdk/royalty-integration/references/royalty-system.md
payment_claiming: file://../../../story-sdk/royalty-integration/references/payment-claiming.md
revenue_distribution: file://../../../story-sdk/royalty-integration/references/revenue-distribution.md
```

**Step 5: Update smart-contracts eval paths**

In `evals/suites/smart-contracts/promptfoo.yaml`, change:
```yaml
# OLD
skill_content: file://../../../packages/plugins/story-contracts/skills/smart-contracts/SKILL.md
contract_addresses: file://../../../packages/plugins/story-contracts/skills/smart-contracts/references/contract-addresses.md
core_contracts: file://../../../packages/plugins/story-contracts/skills/smart-contracts/references/core-contracts.md
spg_workflows: file://../../../packages/plugins/story-contracts/skills/smart-contracts/references/spg-workflows.md
# NEW
skill_content: file://../../../story-contracts/SKILL.md
contract_addresses: file://../../../story-contracts/references/contract-addresses.md
core_contracts: file://../../../story-contracts/references/core-contracts.md
spg_workflows: file://../../../story-contracts/references/spg-workflows.md
```

**Step 6: Commit**

```bash
git add evals/suites/*/promptfoo.yaml
git commit -m "chore: update eval paths for marketplace structure"
```

---

### Task 6: Update evals/project.json inputs

**Files:**
- Modify: `evals/project.json`

**Step 1: Update all input paths**

Replace the `inputs` arrays for each eval-suite target:

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
        "story-sdk/ip-registration/**/*"
      ]
    },
    "eval-suite:licensing": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx promptfoo eval -c evals/suites/licensing/promptfoo.yaml"
      },
      "inputs": [
        "evals/suites/licensing/**/*",
        "story-sdk/licensing/**/*"
      ]
    },
    "eval-suite:royalty-integration": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx promptfoo eval -c evals/suites/royalty-integration/promptfoo.yaml"
      },
      "inputs": [
        "evals/suites/royalty-integration/**/*",
        "story-sdk/royalty-integration/**/*"
      ]
    },
    "eval-suite:sdk-integration": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx promptfoo eval -c evals/suites/sdk-integration/promptfoo.yaml"
      },
      "inputs": [
        "evals/suites/sdk-integration/**/*",
        "story-sdk/sdk-integration/**/*"
      ]
    },
    "eval-suite:smart-contracts": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx promptfoo eval -c evals/suites/smart-contracts/promptfoo.yaml"
      },
      "inputs": [
        "evals/suites/smart-contracts/**/*",
        "story-contracts/**/*"
      ]
    }
  }
}
```

**Step 2: Commit**

```bash
git add evals/project.json
git commit -m "chore: update evals project.json for marketplace structure"
```

---

### Task 7: Update eval template

**Files:**
- Modify: `evals/templates/suite/promptfoo.yaml.template`

**Step 1: Update template path**

Change line 16 from:
```yaml
    skill_content: file://../../../packages/plugins/{{PLUGIN_NAME}}/skills/{{SKILL_NAME}}/SKILL.md
```
To:
```yaml
    skill_content: file://../../../{{PACKAGE_DIR}}/{{SKILL_NAME}}/SKILL.md
```

Note: The template variable changes from `{{PLUGIN_NAME}}` to `{{PACKAGE_DIR}}` since the skill is now directly under the package directory. Alternatively, keep it simple:
```yaml
    skill_content: file://../../../{{SKILL_PATH}}/SKILL.md
```

**Step 2: Commit**

```bash
git add evals/templates/suite/promptfoo.yaml.template
git commit -m "chore: update eval template for marketplace structure"
```

---

### Task 8: Write new validation script for skill packages

The old `validate-plugin.cjs` validates `.claude-plugin/plugin.json` which no longer exists. Write a new `validate-skill-package.cjs` that validates the marketplace structure.

**Files:**
- Create: `scripts/validate-skill-package.cjs`

**Step 1: Write the validation script**

```javascript
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const packageDir = process.argv[2];
const requireEvals = process.argv.includes('--require-evals');

if (!packageDir) {
  console.error('Usage: node scripts/validate-skill-package.cjs <package-dir> [--require-evals]');
  process.exit(1);
}

const abs = (rel) => path.join(packageDir, rel);
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

// Required: root SKILL.md
const rootSkill = abs('SKILL.md');
if (!fs.existsSync(rootSkill)) {
  error('Missing required file: SKILL.md');
} else {
  const content = fs.readFileSync(rootSkill, 'utf8');
  if (!content.startsWith('---')) {
    error('SKILL.md missing frontmatter');
  } else {
    const frontmatter = content.split('---')[1];
    for (const field of ['name:', 'description:']) {
      if (!frontmatter.includes(field)) {
        error(`SKILL.md missing frontmatter field: ${field}`);
      }
    }
  }
}

// Find all sub-skill SKILL.md files
const entries = fs.readdirSync(packageDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  if (entry.name === 'references' || entry.name === 'node_modules') continue;

  const subSkillMd = path.join(packageDir, entry.name, 'SKILL.md');
  if (fs.existsSync(subSkillMd)) {
    const content = fs.readFileSync(subSkillMd, 'utf8');
    if (!content.startsWith('---')) {
      error(`Sub-skill SKILL.md missing frontmatter: ${subSkillMd}`);
    } else {
      const frontmatter = content.split('---')[1];
      for (const field of ['name:', 'description:', 'model:']) {
        if (!frontmatter.includes(field)) {
          error(`Sub-skill SKILL.md missing frontmatter field ${field}: ${subSkillMd}`);
        }
      }
    }

    // Check for eval suite
    const skillName = entry.name;
    const evalSuite = path.join('evals', 'suites', skillName, 'promptfoo.yaml');
    if (!fs.existsSync(evalSuite)) {
      const msg = `No eval suite found for skill "${skillName}" at ${evalSuite}`;
      if (requireEvals) {
        error(msg);
      } else {
        warn(msg);
      }
    }
  }
}

// Check package.json exists
if (!fs.existsSync(abs('package.json'))) {
  warn('Missing package.json');
}

console.log(`\nValidation complete: ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors > 0 ? 1 : 0);
```

**Step 2: Verify it runs**

```bash
node scripts/validate-skill-package.cjs story-sdk
node scripts/validate-skill-package.cjs story-contracts
```

Expected: both pass with 0 errors.

**Step 3: Commit**

```bash
git add scripts/validate-skill-package.cjs
git commit -m "feat: add validate-skill-package.cjs for marketplace structure"
```

---

### Task 9: Update validate-docs.cjs

**Files:**
- Modify: `scripts/validate-docs.cjs`

**Step 1: Update to scan new directories**

Replace the `pluginsDir` logic (lines 14-46) to scan `story-sdk/` and `story-contracts/` instead of `packages/plugins/`:

```javascript
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

let errors = 0;

function error(msg) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

// Skill packages to validate
const skillPackages = ['story-sdk', 'story-contracts'];

for (const pkg of skillPackages) {
  if (!fs.existsSync(pkg)) {
    error(`Skill package directory not found: ${pkg}`);
    continue;
  }

  // Check package docs page
  const pkgDoc = path.join('docs', 'plugins', `${pkg}.md`);
  if (!fs.existsSync(pkgDoc)) {
    error(`Missing docs page for package "${pkg}": ${pkgDoc}`);
  }

  // Check sub-skill docs pages
  const entries = fs.readdirSync(pkg, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'references' || entry.name === 'node_modules') continue;
    const subSkillMd = path.join(pkg, entry.name, 'SKILL.md');
    if (fs.existsSync(subSkillMd)) {
      const skillDoc = path.join('docs', 'skills', `${entry.name}.md`);
      if (!fs.existsSync(skillDoc)) {
        error(`Missing docs page for skill "${entry.name}": ${skillDoc}`);
      }
    }
  }
}

console.log(`\nDocs validation complete: ${errors} error(s)`);
process.exit(errors > 0 ? 1 : 0);
```

**Step 2: Commit**

```bash
git add scripts/validate-docs.cjs
git commit -m "chore: update validate-docs.cjs for marketplace structure"
```

---

### Task 10: Update CI workflow

**Files:**
- Modify: `.github/workflows/validate.yml`

**Step 1: Update validate-plugins job**

Replace the shell loop (line 22) from:
```yaml
for dir in packages/plugins/*/; do
```
To:
```yaml
for dir in story-sdk story-contracts; do
```

And change the validation command to use the new script:
```yaml
node scripts/validate-skill-package.cjs "$dir" --require-evals
```

**Step 2: Update evals job trigger**

Replace the changed_files filter (line 71) from:
```yaml
contains(github.event.pull_request.changed_files, 'packages/plugins/') ||
```
To:
```yaml
contains(github.event.pull_request.changed_files, 'story-sdk/') ||
contains(github.event.pull_request.changed_files, 'story-contracts/') ||
```

**Step 3: Full updated workflow**

```yaml
name: Validate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-plugins:
    name: Validate Skill Packages
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Validate all skill packages
        run: |
          for dir in story-sdk story-contracts; do
            if [ -d "$dir" ]; then
              echo "Validating $dir..."
              node scripts/validate-skill-package.cjs "$dir" --require-evals
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
        contains(github.event.pull_request.changed_files, 'story-sdk/') ||
        contains(github.event.pull_request.changed_files, 'story-contracts/') ||
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

**Step 4: Commit**

```bash
git add .github/workflows/validate.yml
git commit -m "chore: update CI workflow for marketplace structure"
```

---

### Task 11: Update root package.json and marketplace.json

**Files:**
- Modify: `package.json` (root)
- Modify: `.claude-plugin/marketplace.json`

**Step 1: Update root package.json workspaces**

Change workspaces from:
```json
"workspaces": [
  "packages/*",
  "packages/plugins/*"
]
```
To:
```json
"workspaces": [
  "story-sdk",
  "story-contracts"
]
```

**Step 2: Update marketplace.json**

Replace contents of `.claude-plugin/marketplace.json`:
```json
{
  "version": "2.0.0",
  "packages": [
    {
      "name": "story-sdk",
      "path": "story-sdk",
      "description": "AI skills for Story Protocol TypeScript SDK development",
      "skills": ["sdk-integration", "ip-registration", "licensing", "royalty-integration"]
    },
    {
      "name": "story-contracts",
      "path": "story-contracts",
      "description": "AI skills for Story Protocol Solidity smart contract development",
      "skills": ["smart-contracts"]
    }
  ]
}
```

**Step 3: Commit**

```bash
git add package.json .claude-plugin/marketplace.json
git commit -m "chore: update root config for marketplace structure"
```

---

### Task 12: Update root CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update CLAUDE.md**

Update the Plugin Architecture section and paths to reflect the new structure. Key changes:
- Replace `packages/plugins/<plugin-name>/` references with `story-sdk/` and `story-contracts/`
- Update validation command examples
- Update the architecture description
- Change `validate-plugin.cjs` references to `validate-skill-package.cjs`

Specifically update these sections:
- "Plugin Architecture" → "Skill Package Architecture"
- Directory listing to match new structure
- `npx nx run story-ip:validate` → `npx nx run story-sdk:validate`
- `node scripts/validate-plugin.cjs <plugin-dir>` → `node scripts/validate-skill-package.cjs <package-dir>`

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for marketplace structure"
```

---

### Task 13: Remove old packages/plugins/ directory

**Files:**
- Delete: `packages/plugins/` (entire directory)
- Delete: `packages/` (if empty after removal)

**Step 1: Verify new structure works before deleting**

```bash
# Verify all new files exist
find story-sdk -name "SKILL.md" | sort
find story-contracts -name "SKILL.md" | sort
```

Expected:
```
story-sdk/ip-registration/SKILL.md
story-sdk/licensing/SKILL.md
story-sdk/royalty-integration/SKILL.md
story-sdk/sdk-integration/SKILL.md
story-sdk/SKILL.md
story-contracts/SKILL.md
```

**Step 2: Remove old directories**

```bash
rm -rf packages/plugins/
# Remove packages/ if empty
rmdir packages/ 2>/dev/null || true
```

**Step 3: Remove old validate-plugin.cjs (replaced by validate-skill-package.cjs)**

```bash
rm scripts/validate-plugin.cjs
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old packages/plugins/ structure"
```

---

### Task 14: Run validation and fix issues

**Step 1: Run Nx validation**

```bash
npx nx run-many -t validate
```

Expected: all targets pass.

**Step 2: Run markdown linting**

```bash
npx nx run-many -t lint-markdown
```

Expected: passes (may need minor fixes).

**Step 3: Run docs validation**

```bash
node scripts/validate-docs.cjs
```

Expected: passes (or shows expected warnings for missing docs pages).

**Step 4: Fix any issues found and commit**

```bash
git add -A
git commit -m "fix: resolve validation issues from restructure"
```

---

### Task 15: Test local skills CLI installation

**Step 1: Test listing skills from the repo**

```bash
npx skills add . --list
```

Expected: shows `story-sdk` and `story-contracts` as available skills.

**Step 2: Test installing story-contracts locally**

```bash
npx skills add . -s story-contracts -y
```

Expected: installs the story-contracts skill.

**Step 3: Test installing story-sdk with sub-skills**

```bash
npx skills add . -s story-sdk --full-depth -y
```

Expected: installs story-sdk umbrella + all 4 sub-skills.

**Step 4: Clean up test installation**

```bash
npx skills remove story-sdk story-contracts -y 2>/dev/null || true
```

**Step 5: Commit any final adjustments**

```bash
git add -A
git commit -m "chore: finalize marketplace restructure"
```
