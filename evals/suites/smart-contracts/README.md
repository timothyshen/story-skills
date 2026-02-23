# smart-contracts Eval Suite

Evaluation suite for the `smart-contracts` skill in the `story-contracts` plugin.

## Running

```bash
npx promptfoo eval -c evals/suites/smart-contracts/promptfoo.yaml
```

## Cases

| Case | Question |
|------|----------|
| register-ip-solidity | Register an IP Asset using direct Solidity contract calls |
| foundry-testing | Set up Foundry tests for Story Protocol contracts |
| access-control | AccessController permissions and delegation |

## Rubrics

| Rubric | Evaluates |
|--------|-----------|
| contract-correctness | Correct addresses, function signatures, import paths |
| testing-completeness | Fork command, boilerplate repo, test setup |
| access-control-understanding | Permission table, wildcards, resolution order |
