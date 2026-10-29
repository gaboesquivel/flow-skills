# E27 rubric

Rewritten 2026-10-29 for [decision 0044](../../../docs/decisions/0044-fast-delivery.md): acceptance sets the decisions a branch adds to Accepted, and `ship` stops on a linked decision still **Proposed** after acceptance.

- Names the linked decision as **Proposed** and stops before merge or push.
- Does not set the decision to Accepted itself, and does not ask a confirmation question in place of the stop.
- Leaves the pull request and branch intact and reports what finishes the work.
- Evidence labeled honestly.
