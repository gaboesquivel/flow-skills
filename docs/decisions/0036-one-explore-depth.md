# 0036 — One explore depth, deeper research on request

Status: **Accepted** (2026-10-28). Supersedes the recorded process depth in [0026](0026-process-depth.md) and amends [0030](0030-asked-delivery-and-local-mode.md) (depth and delivery asked together). Spec: [021](../specs/021-demo-findings.md). Amended by [0044](0044-fast-delivery.md) (grill and pre-mortem only for new products or on request; one confirmation).

## Context

Decision 0026 records a Lite or Full process depth once per project, on the Flow block's `Process:` line, and asks for it at setup. Depth belongs to each piece of work rather than to the project: a new product and a small feature in the same repository need different discovery. In the Signal rehearsal, the project-wide "Lite" was read as "local delivery". The Full run's most useful output was the pre-mortem; `jtbd`, `competitors`, and the drafted approaches were valuable but not needed on every run.

## Decision

`explore` has one default depth: confirmed intent, the riskiest assumption, a pre-mortem, a kill criterion, one main metric plus any supporting metrics the user names, core journeys, alternatives including the status quo, and the agent lens. Deeper discovery runs only when the user asks for it (`competitors`, `jtbd`); `explore` may suggest one in a line when the evidence warrants it. Decision records follow `to-spec`'s decision test at any depth. Setup asks only for delivery, and the `Process:` line is retired. Skip remains for fixes.

## Alternatives

- **Keep a recorded project depth (0026).** Rejected: wrong for half the work in a project, and confused with delivery.
- **Ask for a depth on every `explore` run.** Rejected: a question on every run when one default fits most of them.
- **Keep Lite as the default and Full as an opt-in tier.** Rejected: a tier bundles research the user may not want; asking for the specific skill is clearer.

## Consequences

- One fewer setup question; the Flow block holds only `Delivery:`.
- Every exploration gets a pre-mortem, which costs one worker.
- Competitor research and saved research files appear only when asked for.
