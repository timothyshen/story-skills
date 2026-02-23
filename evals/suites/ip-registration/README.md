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
