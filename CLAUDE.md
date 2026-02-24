# Story Protocol AI Skills

## Overview

AI-powered skills for Story Protocol development. This monorepo contains
two marketplace skill packages: SDK (TypeScript) and Contracts (Solidity).

## Nx Usage

All operations go through Nx:

- Validate all packages: `npx nx run-many -t validate`
- Lint markdown: `npx nx run-many -t lint-markdown`
- Validate specific package: `npx nx run story-sdk:validate`
- Run eval suite: `npx promptfoo eval -c evals/suites/<skill-name>/promptfoo.yaml`

## Package Scope

All packages use the `@story-protocol` scope.

## Skill Package Architecture

Two top-level skill packages for the skills.sh marketplace:

### story-sdk/ (TypeScript SDK)

Contains 4 sub-skills plus an umbrella SKILL.md:
- `SKILL.md` — umbrella (setup + routing to sub-skills)
- `sdk-integration/SKILL.md` — SDK methods, client modules, usage patterns
- `ip-registration/SKILL.md` — IP Asset registration, metadata, SPG workflows
- `licensing/SKILL.md` — PIL license terms, derivatives, license tokens
- `royalty-integration/SKILL.md` — Royalty vaults, revenue claiming, payments

### story-contracts/ (Solidity)

Single skill for smart contract interaction:
- `SKILL.md` — Solidity contracts, Foundry testing, direct contract calls

### Structure

Each skill package contains:
- `SKILL.md` — skill instructions with YAML frontmatter
- `references/` — supplementary reference docs (per skill or shared)
- `package.json` — npm package config
- `project.json` — Nx project config (must have `type:skill-package` tag)

### Installation (skills.sh)

```bash
# SDK skills (TypeScript developers)
npx skills add piplabs/story-skills@story-sdk --full-depth

# Smart contract skills (Solidity developers)
npx skills add piplabs/story-skills@story-contracts
```

### Versioning

- `metadata.version` in SKILL.md tracks skill content changes
- `package.json` version tracks npm package releases
- Use conventional commits for changelogs
- Release tags: `<package-name>@<version>`

## Agent-Agnostic Design

- Write prompts that work with any LLM, not just Claude
- Avoid model-specific features in SKILL.md files

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

- `node scripts/validate-skill-package.cjs <package-dir>` — validates skill package structure
- `node scripts/validate-docs.cjs` — ensures every package/skill has docs pages
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
