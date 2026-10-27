---
name: verify
description: Check completion claims against observed evidence and report verification limits.
disable-model-invocation: true
---

# Verify

Identify the claim and the observable check that can support it. Run the relevant project checks, inspect the full result and exit status, and compare the changed behavior with the request's acceptance criteria.

Use evidence from the current change. Repeat checks when code changes, a failure remains unresolved, or the earlier result no longer supports the claim; do not rerun unrelated checks merely to repeat a status update.

For a regression test, establish that it detects the original failure and passes with the fix. For a deployment, verify the intended revision and changed endpoint or behavior. For delegated work, inspect the result rather than treating an agent's success message as proof.

Distinguish verified behavior, untested scope, blocked checks, and product-value assumptions. A passing build does not prove runtime correctness; a working feature does not prove customer value. Partial evidence supports a correspondingly limited claim.

Report commands or observations, results, and material limitations. If required checks fail, describe the blocker and preserve the work. Do not claim completion, invent execution evidence, or silently skip required checks.
