# Marketplace Readiness Checklist

**Date:** 2026-02-24
**Repo:** https://github.com/piplabs/story-skills

## How skills.sh Listing Works

There is **no submission form or approval process**. The directory is populated automatically via anonymous telemetry. When anyone runs `npx skills add <owner/repo>`, the CLI records the install and the skill appears on the skills.sh leaderboard. Your repo just needs to be **public on GitHub** with valid SKILL.md files.

**To get listed:** someone installs your skill once via the CLI. That's it.

---

## Checklist

### Repository Level

| # | Item | Status | Action Needed |
|---|------|--------|---------------|
| 1 | Public GitHub repo | ✅ | Repo is public at piplabs/story-skills |
| 2 | Root README.md | ✅ | Exists, well-structured |
| 3 | Root LICENSE file | ❌ Missing | **Add MIT LICENSE file to root** |
| 4 | Root .gitignore | ✅ | Exists with proper entries |
| 5 | CLAUDE.md | ✅ | Comprehensive agent instructions |
| 6 | AGENTS.md | ✅ | Symlinked to CLAUDE.md |
| 7 | CHANGELOG.md | ❌ Missing | **Add changelog** (nice-to-have, not blocking) |

### SKILL.md Requirements (Per Skill)

The skills CLI requires these frontmatter fields:

| Field | Required? | Validation Rules |
|-------|-----------|-----------------|
| `name` | **Required** | 1-64 chars, lowercase + hyphens only, no leading/trailing/consecutive hyphens, **must match parent directory name** |
| `description` | **Required** | 1-1024 chars, should describe what + when to use, include trigger keywords |
| `license` | Recommended | License name or reference |
| `model` | Optional | Model preference |
| `metadata` | Optional | Arbitrary key-value pairs (author, version) |
| `allowed-tools` | Optional | Space-delimited list of pre-approved tools |

### Current SKILL.md Audit

| Skill | name | description | license | model | metadata | Dir Match |
|-------|------|-------------|---------|-------|----------|-----------|
| ip-registration | ✅ | ✅ | ✅ MIT | ✅ opus | ✅ | ✅ |
| licensing | ✅ | ✅ | ✅ MIT | ✅ opus | ✅ | ✅ |
| royalty-integration | ✅ | ✅ | ✅ MIT | ✅ opus | ✅ | ✅ |
| sdk-integration | ✅ | ✅ | ✅ MIT | ✅ opus | ✅ | ✅ |
| smart-contracts | ✅ | ✅ | ✅ MIT | ✅ opus | ✅ | ✅ |

**All SKILL.md files pass frontmatter validation.**

### Skill Discovery

The CLI discovers skills in these locations (searched in order):

1. Root `SKILL.md`
2. `skills/` directory
3. `.claude-plugin/plugin.json` or `.claude-plugin/marketplace.json` manifests
4. Recursive fallback search

| # | Item | Status | Action Needed |
|---|------|--------|---------------|
| 8 | Skills discoverable by CLI | ⚠️ | **Current structure (`packages/plugins/`) is non-standard.** The marketplace restructure (Task 1-15 plan) fixes this by moving to top-level `story-sdk/` and `story-contracts/` dirs |
| 9 | marketplace.json declares skills | ✅ | Exists at `.claude-plugin/marketplace.json` |
| 10 | `npx skills add . --list` works | ⚠️ | **Need to test after restructure** |

### Documentation

| # | Item | Status | Action Needed |
|---|------|--------|---------------|
| 11 | VitePress docs site | ✅ | Full site with all pages |
| 12 | Plugin docs pages (5) | ✅ | All present under `docs/plugins/` |
| 13 | Skill docs pages (5) | ✅ | All present under `docs/skills/` |
| 14 | Getting started guide | ✅ | Present at `docs/getting-started/` |

### Evals

| # | Item | Status | Action Needed |
|---|------|--------|---------------|
| 15 | Eval suites for all skills | ✅ | All 5 skills have promptfoo configs |
| 16 | Test cases | ✅ | 19 total test cases across 5 suites |
| 17 | Rubrics | ✅ | All suites have grading rubrics |
| 18 | Evals pass >=85% | ⚠️ | **Need to verify by running evals** |

### Versioning

| # | Item | Status | Action Needed |
|---|------|--------|---------------|
| 19 | Version alignment | ❌ Mismatch | **package.json=0.0.1, plugin.json=1.0.0** — needs alignment |
| 20 | Nx release config | ⚠️ Empty | **`nx.json` release.projects is `[]`** — add projects |
| 21 | Conventional commits | ✅ | Configured in nx.json |

---

## Priority Fix List

### Must Fix (Blocking)

1. **Add root LICENSE file**
   ```bash
   # Create MIT LICENSE at repo root
   ```

2. **Complete marketplace restructure** (the 15-task plan)
   - Moves skills to `story-sdk/` and `story-contracts/` for CLI discovery
   - Without this, `npx skills add piplabs/story-skills` may not find skills correctly

3. **Align versions**
   - Decide on a versioning strategy (see below)
   - Fix the plugin.json=1.0.0 vs package.json=0.0.1 mismatch

### Should Fix (Important)

4. **Test CLI discovery locally**
   ```bash
   npx skills add . --list
   npx skills add . -s story-sdk --full-depth -y
   npx skills add . -s story-contracts -y
   ```

5. **Run evals and verify >=85% pass rate**
   ```bash
   npx promptfoo eval -c evals/suites/ip-registration/promptfoo.yaml
   ```

6. **Update remote URL** (repo moved)
   ```bash
   git remote set-url origin https://github.com/piplabs/story-skills.git
   ```

### Nice to Have

7. Add CHANGELOG.md
8. Add CODE_OF_CONDUCT.md
9. Check Dependabot alerts (2 moderate vulnerabilities flagged)

---

## Versioning Guide

### How Versioning Works in This Repo

There are **3 version numbers** to track:

| Version | Location | Purpose | When to Bump |
|---------|----------|---------|--------------|
| `metadata.version` in SKILL.md | Each skill's frontmatter | Skill content version | When SKILL.md or references change |
| `version` in plugin.json | `.claude-plugin/plugin.json` | Plugin manifest version | When any skill in the plugin changes |
| `version` in package.json | Each package's `package.json` | npm release version | When publishing to npm |

### Current State (Mismatched)

```
SKILL.md metadata.version:  1.0.0  (all 5 skills)
plugin.json version:         1.0.0  (all 5 plugins)
package.json version:        0.0.1  (all 5 packages)
```

### Recommended Versioning Strategy

**After the marketplace restructure, simplify to 2 versions:**

| Version | Location | Purpose |
|---------|----------|---------|
| `metadata.version` in SKILL.md | Each SKILL.md frontmatter | Tracks skill content changes |
| `version` in package.json | `story-sdk/package.json`, `story-contracts/package.json` | Tracks npm/marketplace releases |

**Rules:**
- Use [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH)
- Use conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- Nx handles version bumps automatically via `npx nx release`

### How to Bump Versions

**Option A: Manual (current)**
```bash
# Edit version in package.json directly
# Edit metadata.version in SKILL.md frontmatter
# Commit with conventional commit message
git commit -m "feat(story-sdk): add new licensing examples"
```

**Option B: Automated via Nx Release (recommended after setup)**

1. Add projects to `nx.json` release config:
```json
"release": {
  "projects": ["story-sdk", "story-contracts"],
  ...
}
```

2. Run Nx release:
```bash
# Preview what would change
npx nx release --dry-run

# Execute version bump + changelog + git tag
npx nx release
```

This will:
- Analyze conventional commits since last release
- Bump versions based on commit types (`feat:` = minor, `fix:` = patch)
- Generate per-project CHANGELOG entries
- Create git commits and tags (`story-sdk@0.2.0`, `story-contracts@0.1.1`)

### Version Alignment Action

To fix the current mismatch, align all versions to `0.1.0` (pre-release, since nothing is published yet):

```bash
# After marketplace restructure, in story-sdk/package.json:
"version": "0.1.0"

# In each SKILL.md metadata:
metadata:
  version: '0.1.0'

# In story-contracts/package.json:
"version": "0.1.0"
```

### For skills.sh Specifically

The skills CLI tracks updates **via git**, not version numbers. When you push new commits, `npx skills check` detects changes and `npx skills update` pulls them. The version in SKILL.md metadata is informational for users, not used by the CLI for update detection.

---

## Testing Marketplace Registration

After completing all fixes:

```bash
# 1. Verify skills are discoverable
npx skills add . --list

# 2. Install SDK skills locally
npx skills add . -s story-sdk --full-depth -y

# 3. Install contract skill locally
npx skills add . -s story-contracts -y

# 4. Verify installed
npx skills ls

# 5. Clean up
npx skills remove story-sdk story-contracts -y

# 6. First real install (triggers skills.sh listing)
npx skills add piplabs/story-skills -s story-sdk --full-depth -y
npx skills add piplabs/story-skills -s story-contracts -y
```
