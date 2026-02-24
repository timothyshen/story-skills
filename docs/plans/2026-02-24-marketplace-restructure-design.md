# Marketplace Restructure Design

**Date:** 2026-02-24
**Status:** Approved

## Goal

Restructure story-skills for the skills.sh marketplace as two installable packages:
1. **story-sdk** — TypeScript SDK skills (4 sub-skills) for SDK developers
2. **story-contracts** — Solidity smart contract skill for contract developers

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Split model | Two separate installable skills | Users install one or both based on their stack |
| SDK structure | Multi-skill package | 4 separate SKILL.md files inside one package |
| Repo structure | Keep monorepo | One repo, two top-level skill directories |
| References | Per-skill references | Each skill self-contained, some duplication OK |
| Directory approach | Two subdirectory packages (B) | Clear SDK vs Contracts identity |
| Migration | Replace packages/plugins/ | One source of truth, simpler repo |
| Umbrella SKILL.md | Lightweight router | Setup basics + pointers to sub-skills |

## Final Directory Structure

```
story-skills/
├── story-sdk/                          # SDK marketplace package
│   ├── SKILL.md                        # Lightweight umbrella (setup + routing)
│   ├── references/                     # Shared refs (client-setup, constants)
│   │   ├── client-setup.md
│   │   └── constants-exports.md
│   ├── sdk-integration/
│   │   ├── SKILL.md                    # SDK methods & patterns
│   │   └── references/
│   │       └── method-reference.md
│   ├── ip-registration/
│   │   ├── SKILL.md                    # IP asset registration
│   │   └── references/
│   │       ├── contract-addresses.md
│   │       ├── metadata-standard.md
│   │       └── registration-patterns.md
│   ├── licensing/
│   │   ├── SKILL.md                    # PIL, license terms, derivatives
│   │   └── references/
│   │       └── (existing licensing refs)
│   └── royalty-integration/
│       ├── SKILL.md                    # Royalty vaults, revenue claiming
│       └── references/
│           └── (existing royalty refs)
├── story-contracts/                    # Contracts marketplace package
│   ├── SKILL.md                        # Smart contract interaction
│   └── references/
│       ├── core-contracts.md
│       ├── spg-workflows.md
│       └── foundry-testing.md
├── evals/                              # Unchanged structure, updated paths
├── scripts/                            # Updated validation scripts
├── .github/workflows/                  # Updated CI paths
└── README.md                           # Install instructions for both packages
```

## Install Commands

```bash
# SDK skills (TypeScript developers)
npx skills add storyprotocol/story-skills@story-sdk --full-depth

# Smart contract skills (Solidity developers)
npx skills add storyprotocol/story-skills@story-contracts
```

## Umbrella SKILL.md (story-sdk)

Lightweight entry point that covers:
1. SDK installation (`npm install @story-protocol/core-sdk viem`)
2. Client setup basics (StoryClient.newClient)
3. Network info (Aeneid testnet, Mainnet)
4. Key contract addresses
5. Routing to sub-skills for deeper topics

Does NOT duplicate sub-skill content — keeps it focused on setup and navigation.

## Migration Plan

1. Create `story-sdk/` and `story-contracts/` top-level directories
2. Move SKILL.md files and references from `packages/plugins/` to new locations
3. Create lightweight umbrella `story-sdk/SKILL.md`
4. Update eval `promptfoo.yaml` file paths to reference new skill locations
5. Update Nx project configs for new directory structure
6. Update validation scripts (`validate-plugin.cjs`) for new paths
7. Update CI workflow (`.github/workflows/validate.yml`)
8. Remove `packages/plugins/` directory
9. Update root README with marketplace install instructions
10. Local test: `npx skills add . --skill story-sdk --full-depth`

## What Changes

- `packages/plugins/` → removed (content moves to top-level dirs)
- `marketplace.json` → removed or updated
- Eval `promptfoo.yaml` → path updates only (test cases/rubrics unchanged)
- Nx config → updated project definitions
- CI → updated paths

## What Stays

- Eval test cases, rubrics, and prompt-wrapper files
- SKILL.md content (moved, not rewritten)
- Reference doc content (moved, not rewritten)
- Validation logic (paths updated)
