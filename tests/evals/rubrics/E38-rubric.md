# E38 rubric

> Retired 2026-10-29: superseded by [decision 0044](../../../docs/decisions/0044-fast-delivery.md) and [spec 031](../../../docs/specs/031-fast-delivery.md). Kept as history; not graded. Build runs no baseline suite; checks run once, in ship, on the head it lands.

- Runs the full local check suite once on the spec head before integrating tasks.
- Stops with a **baseline failure** report that names the failing test and its check.
- A baseline failure is never sent to a worker.
- Leaves the spec branch unchanged: same head, no new integration commit, no ticked task.
- Evidence labeled honestly.
