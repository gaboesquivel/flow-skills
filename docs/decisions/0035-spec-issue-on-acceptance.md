# 0035 — Open the spec issue at acceptance

Status: **Superseded** (2026-10-29). Was Accepted (2026-10-28). Amends [0029](0029-spec-issues.md) (the spec issue opens at "spec it", labelled `draft`). Spec: [021](../specs/021-demo-findings.md). Amended by [0044](0044-fast-delivery.md) (acceptance also happens on "build it" or "ship it"; no body sync). Superseded by [0044](0044-fast-delivery.md) (no spec issue).

## Context

Decision 0029 opens a public spec issue as part of "spec it", so teammates can read and comment on a draft without opening the repository. In practice the maintainer reviews drafts locally: early issues published unreviewed text on a public repository, and each revision before acceptance cost a sync.

## Decision

"Spec it" writes and commits the draft locally on the spec branch and publishes nothing. "Accept the spec" pushes the branch and opens the spec issue labelled `accepted`. "Share the draft" opens the issue early, labelled `draft`, when the user wants comments before accepting; acceptance then relabels it. `to-spec` opens a `candidate` issue only when asked. The `accepted` label stays the delivery gate.

## Alternatives

- **Keep opening at "spec it" (0029).** Rejected as the default: it publishes text nobody approved and adds sync churn for solo review.
- **Open only at "break it down".** Rejected: acceptance is the approval moment, and the gate label belongs to it.

## Consequences

- Nothing about a spec is public until it is accepted, unless the user shares the draft.
- The `draft` label is used only for shared drafts.
