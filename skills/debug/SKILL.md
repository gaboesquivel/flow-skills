---
name: debug
description: Investigate and fix a reproducible failure using evidence and bounded hypotheses. Use when the user says "debug this", "why is this failing", or "find the root cause".
disable-model-invocation: false
---

# Debug

Establish the observed failure, expected behavior, reproduction, and relevant recent changes. Inspect errors and evidence before changing code. For a simple failure, keep the investigation small; for a multi-component system, trace the boundary where behavior diverges.

Form a falsifiable hypothesis and run the smallest useful check. Change one cause at a time so the result is interpretable. If evidence is unavailable, state the uncertainty and collect it rather than presenting a guess as root cause.

For a meaningful behavior fix, reproduce the failure with an automated test or a documented manual check before applying the correction. Use existing public test interfaces. Fix the cause within the authorized scope and verify both the original failure and relevant surrounding behavior.

If attempts stop producing new evidence, reassess the hypothesis, dependencies, and architecture. Ask the user when the next step requires a consequential new decision, access, or authority; do not impose an arbitrary retry count as proof that architecture is wrong.

Report the cause supported by evidence, fix, checks, and remaining uncertainty. Environmental or intermittent failures may require bounded recovery and monitoring rather than a fully determined cause. Redact secrets and personal data from diagnostics.

Read supporting techniques when relevant:

- [Root-cause tracing](root-cause-tracing.md) for failures far from their source.
- [Defense in depth](defense-in-depth.md) for validation at multiple boundaries.
- [Condition-based waiting](condition-based-waiting.md) for timing-dependent behavior.
