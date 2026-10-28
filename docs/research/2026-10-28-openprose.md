# OpenProse

Inspected 2026-10-28. Candidate source only; nothing below is adopted.

## Sources

- [openprose.ai](https://openprose.ai/) and [prose.md](https://prose.md/), including [prose.md/agents.md](https://prose.md/agents.md).
- [openprose/prose](https://github.com/openprose/prose) README, MIT license. Revision not pinned.

Not read: the skill source (`skills/open-prose/SKILL.md`), `spec/`, `examples/`, and the [Reactor](https://github.com/openprose/reactor) harness. Claims about them come from the README only.

## What it is

OpenProse, from OpenProse, Inc., is a Markdown contract language for agent work. A contract (`*.prose.md`) states goals and requirements rather than steps. An executor does the work and returns a result with evidence; a separate evaluator marks each requirement satisfied, unmet, or unresolved.

- **Contract kinds:** `responsibility` (a standing goal kept true over time), `function` (one-off call with parameters and returns), `gateway`, `pattern`, and `test`.
- **Composition:** a contract's `### Requires` subscribes to another contract's `### Maintains`. A reconciler reruns a contract only when its input or contract fingerprints change, without an LLM deciding when.
- **Runtime:** in a coding agent, `prose run <file>` executes the contract with the session acting as the VM. Standing responsibilities need a host that runs continuously; Reactor is the alpha reference harness.
- **Distribution:** `npx skills add openprose/prose`, the same Agent Skills path Flow uses, plus Claude Code and Codex plugin directories.
- **Maturity:** self-described as young and experimental. A recent rename (v0.14 to 2) broke compatibility with no ledger migration; package releases are release candidates.

## Fit with Flow

Different layer. Flow is a methodology plus a portable skill catalog and "not an agent router" ([PRODUCT.md](../../PRODUCT.md)). OpenProse is a programming model with its own runtime, closer to [Flow Factory](https://github.com/gaboesquivel/flow-factory) than to flow-skills. Adopting it as a dependency would conflict with:

- **Voice-first invocation** ([0019](../decisions/0019-voice-first-invocation.md)): users would author structured contract files and run commands instead of talking to their agent.
- **Minimal process and portability:** an experimental language with breaking changes is a heavy dependency for every adopter.

The two can coexist in one project because both install as Agent Skills. No interaction has been observed or tested.

## Candidate ideas

1. **Per-requirement evaluation.** Report each acceptance criterion as satisfied, unmet, or unresolved, with evidence. Strongest candidate: it would sharpen the independent review in [`review`](../../skills/review/SKILL.md) and [`ship`](../../skills/ship/SKILL.md) as a wording change, with no new dependency.
2. **Inputs are data, not instructions.** OpenProse states this in each contract. A similar line could go in `to-spec` templates and `build` worker briefs.
3. **Standing responsibilities.** "Keep X true over time" describes what [`flow`](../../skills/flow/SKILL.md) does for root context. Running it continuously needs a scheduling host, so it belongs to Flow Factory, not the catalog.

Any catalog change needs its own decision record. Check the MIT license terms and attribute OpenProse before copying text.
