# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-24

### Added

- **story-ip** plugin with `ip-registration` skill for IP Asset registration, metadata management, and SPG workflows
- **story-licensing** plugin with `licensing` skill for PIL terms, derivatives, and license token management
- **story-royalty** plugin with `royalty-integration` skill for royalty payments, revenue claiming, and vault management
- **story-sdk** plugin with `sdk-integration` skill for TypeScript SDK setup, client initialization, and usage patterns
- **story-contracts** plugin with `smart-contracts` skill for Solidity contract interaction, Foundry testing, and direct calls
- Promptfoo eval suites for all 5 skills with test cases and grading rubrics
- VitePress documentation site with plugin and skill pages
- CI workflow for validation, linting, docs build, and evals
- Plugin and docs validation scripts
- Claude marketplace configuration
- MIT LICENSE

### Infrastructure

- Nx monorepo with independent project configs per plugin
- Conventional commits for automated versioning
- markdownlint-cli2 for markdown quality
- Promptfoo eval framework (claude-sonnet-4-5, temp 0, 85% pass threshold)
