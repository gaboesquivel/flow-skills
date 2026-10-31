# 055 — Claude Code host gate on local models

Status: draft (2026-10-31).
Execution: spec/055-local-host-gate; isolated worktree `.worktrees/055-local-host-gate`. Integration owner: unassigned; the session that runs "build it" takes it.

## Problem Statement

[Spec 049](049-local-evaluation.md) built a local, zero-cost evaluation path on Ollama, but its Claude Code host gate failed. The one candidate, `llama3.2:1b`, made no tool call. The [record](../../tests/evals/records/2026-10-31-e43-local-smoke.md) found why: Claude Code sends a trailing `system` message, and llama3.2's Ollama template renders tools only when the last message is from the user, so the model never saw a tool. With tools rendered in a replay, the 1B model still answered in text. Claude Code on local models remains unverified on this Mac, so no live skill evaluation can run without paid inference.

The bet: does any Ollama model that fits this Mac pass the host gate, one read, one edit, and one command through Claude Code with local-only routing? It tests the host path, not whether Flow helps.

## Solution

Run 049's host gate again on a short, bounded ladder of candidates chosen by a stricter rule that adds a template check, and stop at the first pass. Reuse 049's fixture, isolation, sandbox, and gate command unchanged except for the model. Record the result as a new evidence record and document the repeat command in the [eval README](../../tests/evals/README.md).

## Implementation Decisions

### Candidate rule

A model is a candidate only when all hold, checked in this order so that a failing model costs no download where avoidable:

1. Its Ollama template renders tool definitions in the system or prefix block regardless of the last message's role. Read the template from the registry before pulling where it is exposed, otherwise from `ollama show <model> --template` after pulling. Confirm from one logged gate request (`OLLAMA_DEBUG_LOG_REQUESTS=1`) that the rendered prompt contains the tool schemas; a template that reads right but renders no tools fails the rule.
2. `ollama show` lists tools and a context length of at least 64K.
3. Loaded at 64K context, it leaves at least 4 GB free, measured by both `memory_pressure` and `vm_stat` as 049 did; record both. A quantized KV cache (`OLLAMA_FLASH_ATTENTION=1`, `OLLAMA_KV_CACHE_TYPE=q8_0`) may be used to fit, and is recorded.

### Bounded ladder

- At most three candidates, smallest first, one download each, stop at the first pass. A failed candidate is recorded, not retried.
- Shortlist to verify at build time, not commitments: `qwen3:1.7b`, `granite3.3:2b`, `qwen3:4b`. A tag whose listed context is below 64K fails rule 2 and is skipped without download. `llama3.2:3b` qualifies only if a template different from 049's handles a trailing `system` message.
- Free disk and the downloaded models are recorded; remove models pulled for this spec afterward unless they pass.

### Execution boundary and gate

Unchanged from 049: loopback Ollama with cloud disabled and verified in its log, `OLLAMA_CONTEXT_LENGTH=65536`, `env -i` isolation with a fresh `HOME` and `CLAUDE_CONFIG_DIR`, every model role routed to the candidate, `--strict-mcp-config --setting-sources project`, the `sandbox-exec` local-only profile checked before use, a 5-minute cap and no automatic retry, permission boundaries preserved (`--allowedTools "Read,Edit,Bash(git diff:*)"`). Zero paid inference, never in CI, no GitHub writes from the evaluated agent.

A pass needs all of: local `POST /v1/messages` from 127.0.0.1 in the Ollama log; tool schemas in the rendered prompt; one Read, one Edit, and one `git diff --stat` tool result in the stream-json trace; a fixture diff limited to `copeis` → `copies`. A text-only reply, an unrelated edit, a timeout, or a wrong correction is a failure.

### Fixture and record

- The E43 lending desk fixture with `copies` changed to `copeis` in its README, copied outside any repository and committed once, as in 049.
- Traces under the ignored `.cache/local-eval/055/`. The record goes to `tests/evals/records/` in the 049 record's structure: scope, machine, per-candidate table, routing evidence, API cost, limitations, next action. It is not an E43 observation.

## Tasks

- [ ] Check templates and metadata for the shortlist; record which candidates qualify without download.
- [ ] Run the gate on qualifying candidates, smallest first, stopping at the first pass.
- [ ] Write the evidence record and add the host-gate repeat command to the eval README.

## Appetite

One session, about 60 minutes excluding downloads, zero paid inference tokens. If no candidate qualifies or all fail, record the blocking measurement and stop.

## Out of Scope

Flow versus no-Flow comparison, direct-probe model ladders, runtimes other than Ollama, larger models that cannot fit with 4 GB headroom, changes to Claude Code or Ollama templates (including custom Modelfiles that rewrite a template), CI jobs, and skill rewrites. A passing host enables a later spec that compares conditions on a task where Flow can plausibly differ.

## Further Notes

Builds on [spec 049](049-local-evaluation.md) and its [record](../../tests/evals/records/2026-10-31-e43-local-smoke.md); that record's Next action names the template check. Open assumptions: some small model in the Ollama library has a qualifying template and context; a model that sees the tools can make three correct tool calls on this task.
