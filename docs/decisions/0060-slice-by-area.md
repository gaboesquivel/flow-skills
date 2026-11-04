# 0060 — Build slices by area

Status: **Accepted** (2026-11-02). Superseded in part by [0062](0062-claude-code-first.md) (item 2 and the named inline reason: the host sizes the fan-out under a cap). Amended by [0066](0066-specs-sized-by-delivery.md) (item 1: slicing is for work with several outcomes, by outcome first). Amends [0053](0053-delivery-appetite-and-scope.md) (parallel work when it pays) for `build`'s implementation; [0031](0031-fan-out-by-default.md) item 5 (tasks declare an area) now also applies to specs without tasks.

## Context

`build` delegated work only in its Task set, and only "when it pays" (`write-agents` Workers, after 0053). A spec with no Tasks list gave no splitting guidance, so the agent judged alone. Host guidance discourages spawning when unsure, so that judgment kept most work inline. The spec 057 build (2026-11-02) sent its editorial pages to one subagent and built the site pipeline and docs navigation itself, in sequence, although they wrote disjoint files.

The rule has moved between "parallel by default" (0031, 0044) and "when it pays" (0043, 0053). Both left the call to the agent with no test it could check, so the outcome depended on its bias.

## Decision

1. **Slice at intake.** Before the first implementation write, `build` splits the work into vertical slices whose areas are disjoint, so no two slices write the same files; areas keep slices apart and never cut a slice per layer. A spec's tasks and `Area:` lines give the slices when present; otherwise its sections and the outcomes the change delivers do.
2. **Each slice goes to a worker.** Every slice runs as a subagent, or a native session where `write-agents` Workers chooses one, launched together in one batch. A slice stays inline only when it is the change's only slice, when it is trivial (a few lines in one file), or when other slices depend on an interface it is still settling; that slice runs first, and its dependents launch once it is committed.
3. **The call is visible.** The plan and the report name each slice, its area, and its worker, or the reason it ran inline. An inline slice with no named reason is a defect in the build.
4. **The main thread integrates.** It writes shared files (indexes, lockfiles, the spec's status), merges slices, and runs Verify. Without workers, slices run in order and the report says so.

## Alternatives

- **Keep "when it pays".** Rejected: with no checkable trigger, spec 057 kept disjoint work inline.
- **Always delegate.** Rejected: a one-file fix pays briefing and integration for nothing. 0053 rejected this for trivial work.
- **A hook that blocks inline writes.** Rejected for now: hosts differ, and a slice's area is not visible to a hook.

## Consequences

- Multi-area builds finish sooner and keep the main context for integration and review. Token use rises with the number of slices.
- Planning gains one step: naming slices before writing. A single-area change names one slice and proceeds as before.
- Collisions surface at integration; disjoint areas keep them rare.
