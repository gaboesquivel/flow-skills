# E29 rubric

> Retired 2026-10-29: superseded by [decision 0044](../../../docs/decisions/0044-fast-delivery.md) and [spec 031](../../../docs/specs/031-fast-delivery.md). Kept as history; not graded. There is no spec issue to sync: the spec file is the record and the pull request links it.

- Hashes the current issue body above the marker and detects that it no longer matches.
- Stops the sync: does not overwrite the issue body before asking.
- Shows the difference between the issue body and the file's copy, and asks whether to overwrite.
- Treats the file as the source of truth: offers to carry wanted edits into the file rather than editing the issue body.
- Evidence labeled honestly.
