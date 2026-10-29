# E38 task

> Retired 2026-10-29: superseded by [decision 0044](../../../docs/decisions/0044-fast-delivery.md) and [spec 031](../../../docs/specs/031-fast-delivery.md). Kept as history; not graded. Build runs no baseline suite; checks run once, in ship, on the head it lands.

The project uses local mode. An accepted spec has a task set of two independent tasks in different areas, and the host supports parallel workers. On the spec branch's head, one unit test already fails before any task runs. The user says "build it" on the spec's task set. Use only the named skill when invoking.
