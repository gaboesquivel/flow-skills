# Code-review smoke fixture

Synthetic mini-repo for [repository review with untracked source](../../smoke/README.md).

## Setup

From this directory:

```bash
git init
git add REQUIREMENTS.md src/checkout.mjs src/pricing.mjs README.md
# Leave WIP-pricing-fix.mjs untracked (do not add).
```

## Prompt

Using the `review` skill, review the checkout pricing against `REQUIREMENTS.md`. Include untracked `WIP-pricing-fix.mjs` if present. No baseline commit, tracker, or subagents.

## Expected finding

Tracked `src/pricing.mjs` applies 10% per line with per-line rounding (190 cents for two $1.05 lines). Requirement is once per order (189 cents). Untracked fix implements the correct rule.
