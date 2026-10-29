# 0038 — Direction changes are confirmed and recorded

Status: **Accepted** (2026-10-28). Amends the decisions [README](README.md) rule that accepted records are immutable. Spec: [024](../specs/024-direction-change-gate.md). Amended by [0044](0044-fast-delivery.md) (the decisions reader checks the current branch only; no scan of unmerged branches).

## Context

A goal stated in `explore` can contradict an accepted decision, an accepted or implemented spec, or a `PRODUCT.md` fact. `explore` raises such conflicts in conversation but records nothing, and `to-spec` is told to respect existing records. The decisions README calls accepted records immutable, yet 0026 and 0036 already carry `Amended by` and `Superseded in part by` pointers on their Status line. A later `explore` session reads the old record as current and revives the superseded position.

## Decision

1. **Gate on contradiction.** `explore` names each contradicted Accepted decision, accepted or implemented spec, or `PRODUCT.md` fact, says whether the change supersedes or amends it, and continues only on an explicit yes. `to-spec` re-checks before writing and asks only about changes not already confirmed.
2. **Scaled records.** Changing an Accepted decision always gets a new record (Proposed on the yes, Accepted with the spec). A conflict only with a spec or a `PRODUCT.md` fact gets a record only when `to-spec`'s decision test passes; otherwise the spec records it.
3. **Back-links at acceptance.** "Accept the spec" appends `Superseded by` / `Amended by` pointers to the old records' Status lines and index rows and to affected specs, and updates `PRODUCT.md` to the new position. Nothing is back-linked before acceptance.
4. **Pending changes are read.** `explore` reports records on unmerged branches that supersede or amend what the request touches as pending direction changes.
5. **Status lines take back-pointers.** A record's body stays immutable; its Status line and index row may gain back-pointers.

## Alternatives

- **Status quo (raise conflicts in conversation).** Rejected: nothing persists, so the next session revives the old position.
- **A standalone triage skill.** Rejected: adds a catalog entry and a hand-off for a check `explore` already half does.
- **Back-links when the user says yes.** Rejected: they sit on an unmerged branch, invisible from the default branch, and a dropped spec leaves false pointers.
- **A decision record for every conflict.** Rejected: spec and `PRODUCT.md` conflicts are frequent and mostly fail the decision test.
- **Keep old records untouched.** Rejected: an agent reading the old record sees no sign it changed.

## Consequences

- One more read in `explore` (an unmerged-branch scan) and one more step in "accept the spec".
- Superseded positions are discoverable from the record itself on the default branch once the spec ships.
- The written immutability rule now matches the repository's practice.
