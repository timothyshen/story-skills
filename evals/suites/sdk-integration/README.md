# sdk-integration Eval Suite

Evaluation suite for the `sdk-integration` skill in the `story-sdk` plugin.

## Running

```bash
npx promptfoo eval -c evals/suites/sdk-integration/promptfoo.yaml
```

## Cases

| Case | Question |
|------|----------|
| client-initialization | Set up the Story Protocol SDK in a TypeScript project |
| available-methods | Overview of methods available on the SDK |
| key-exports | Constants and types to import from @story-protocol/core-sdk |

## Rubrics

| Rubric | Evaluates |
|--------|-----------|
| setup-correctness | npm install, StoryClient.newClient, StoryConfig, chain options |
| method-coverage | Lists client modules and key methods |
| export-awareness | WIP_TOKEN_ADDRESS, PILFlavor, LicenseTerms, chain objects |
