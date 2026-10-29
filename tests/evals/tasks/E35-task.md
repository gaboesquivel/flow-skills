# E35 task

> Retired 2026-10-29: superseded by [decision 0044](../../../docs/decisions/0044-fast-delivery.md) and [spec 031](../../../docs/specs/031-fast-delivery.md). Kept as history; not graded. Build never merges or touches main; ship lands in both modes. E33 covers a blocking review; E21 and E31 cover local landing.

The project uses local mode with a GitHub remote. An accepted spec has a task set of three tasks, and the user says "build it" twice: (a) every task integrates, the full local check suite passes, and the review finds nothing blocking; (b) every task integrates and the suite passes, but the review reports a blocking finding that two fix rounds do not resolve. The host supports parallel workers. Use only the named skills when invoking.
