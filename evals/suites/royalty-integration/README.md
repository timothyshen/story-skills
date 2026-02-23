# royalty-integration Eval Suite

Evaluation suite for the `royalty-integration` skill in the `story-royalty` plugin.

## Running

```bash
npx promptfoo eval -c evals/suites/royalty-integration/promptfoo.yaml
```

## Cases

| Case | Question |
|------|----------|
| pay-royalties | Pay royalties to an IP Asset using the SDK |
| claim-revenue | Claim revenue from derivatives as an IP owner |
| lap-vs-lrp | Difference between LAP and LRP royalty policies |
| royalty-vault | How the IP Royalty Vault works and accessing royalty tokens |

## Rubrics

| Rubric | Evaluates |
|--------|-----------|
| payment-correctness | payRoyaltyOnBehalf usage, WIP token, correct parameters |
| claiming-completeness | claimAllRevenue, batchClaimAllRevenue, permissionless claiming |
| vault-understanding | 100 tokens = 100%, auto-deployment, tokens in IP Account pitfall |
