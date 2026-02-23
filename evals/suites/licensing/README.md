# licensing Eval Suite

Evaluation suite for the `licensing` skill in the `story-licensing` plugin.

## Running

```bash
npx promptfoo eval -c evals/suites/licensing/promptfoo.yaml
```

## Cases

| Case | Question |
|------|----------|
| attach-license-terms | Attach commercial use license terms to an IP Asset |
| register-derivative | Register IP as a derivative of another IP Asset |
| pil-flavors | License presets available for commercial remixing |
| revshare-configuration | Set up 10% revenue share for commercial remixing |

## Rubrics

| Rubric | Evaluates |
|--------|-----------|
| licensing-correctness | Correct SDK methods, PIL terms, contract references |
| derivative-understanding | linkDerivative patterns, maxRts, license token burning |
| pitfall-awareness | revShare encoding, ID=1 pre-registration, success checking |
