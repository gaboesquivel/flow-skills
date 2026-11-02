# Claude Code host gate on local models (2026-10-31)

## Scope

The host gate from [spec 049](../../../docs/specs/049-local-evaluation.md), re-run under [spec 055](../../../docs/specs/055-local-host-gate.md) with its template-aware candidate rule. The question: can Claude Code, routed only to a local Ollama model on this Mac, make one read, one edit, and one `git diff --stat` call on the typo fixture? It is a host-path check, not evidence about whether Flow helps, and not an E43 observation.

Source commit: `27fe937` (spec/055-local-host-gate). Fixture: [lending desk](../../fixtures/e43-shared-language/README.md) with `copies` changed to `copeis` in README.md, copied outside any repository and committed once as `309d619`.

## Machine and setup

- Apple M5, arm64, 16 GB unified memory, about 690 GiB free disk. Claude Code 2.1.316, Node 24.20.0, Ollama 0.40.11 (Homebrew).
- Server for this session only: `OLLAMA_HOST=127.0.0.1:11434 OLLAMA_NO_CLOUD=1 OLLAMA_CONTEXT_LENGTH=65536 OLLAMA_DEBUG_LOG_REQUESTS=1`. Its log reported `Ollama cloud disabled: true` and `Listening on 127.0.0.1:11434`. Stopped after the run.
- Sandbox: the [eval README](../README.md#local-smoke-no-paid-inference) `local-only.sb` profile. Checked: `https://example.com` failed (curl exit 6), loopback answered.

## Candidate screening

Templates and GGUF headers were read from the Ollama registry before any download: the template blob, and the first 16 MB of the model blob for `context_length` and the attention shape. Free memory before loading: `memory_pressure` 39–44%.

| Model | Size | Template renders tools with a trailing `system` message | Context | Fit at 64K (4 GB headroom) | Result |
| --- | --- | --- | --- | --- | --- |
| `qwen3:1.7b` | 1.36 GB | yes (system block whenever tools exist) | 40,960 | not checked | fails rule 2, not downloaded |
| `granite4:micro-h` | 1.94 GB | yes (tools message built before the message loop) | 1,048,576 | loaded 2.8 GB, 100% GPU; free after: `memory_pressure` 27% (about 4.3 GB, meets), `vm_stat` free + inactive + speculative + purgeable 2.54 GB (does not) | borderline, run (as 049 did) |
| `qwen3:4b` | 2.50 GB | yes | 262,144 | KV at 64K computed from the header: 4.83 GB at `q8_0`, 2.72 GB at `q4_0`; with weights 7.33 / 5.21 GB, more than the 6–7 GB free before loading | fails rule 3 by arithmetic, not downloaded |
| `granite3.3:2b` | 1.55 GB | yes (`available_tools` role) | 131,072 | KV 5.37 GB at `q8_0`, 3.02 GB at `q4_0`; with weights 6.91 / 4.56 GB | fails rule 3 by arithmetic, not downloaded |

`llama3.2:3b` was not considered: same template family as 049's `llama3.2:1b`. `granite4:micro-h` was not on the spec's shortlist, which was explicitly non-binding. It went first because its hybrid Mamba layers keep the KV cache small, making it the smallest candidate once loaded. The fit figures for `qwen3:4b` and `granite3.3:2b` are calculated, not measured: the calculation already rules them out, so they were not downloaded.

## Gate: `granite4:micro-h`, failed

Model `granite4:micro-h` (ID `076afb3855dc`, Q4_K_M, 3.2B parameters, tools capability). The command is 049's gate command with the model swapped (see [repeat](../README.md#local-smoke-no-paid-inference)). Exit 0, 28 s wall time, 5 turns, no retry.

| Step | Tool call | Result |
| --- | --- | --- |
| 1 | `ToolSearch` `select:update-config` | no match (irrelevant call) |
| 2 | `Edit` `misspelled word` → `corrected word`, before reading | error: string not found |
| 3 | `Read` README.md | file returned |
| 4 | `Edit` `Members place holds on copeis.` → `Member's place holds on copies.` | applied |
| 5 | none; final text claims the fix | `git diff --stat` never run |

Fixture diff: `copeis` → `copies` fixed, but `Members` → `Member's` also changed (an incorrect, unrelated edit). Under the spec's pass criteria this is a **failure**: unrelated edit, no command result.

Routing and tools:

- Ollama logged five `POST /v1/messages?beta=true` from 127.0.0.1 and nothing else during the run. Claude Code reported `apiKeySource: none`. It printed `unrecognized_model` and an estimated `total_cost_usd` of 0.085 from its own price table; no paid API was reachable in the sandbox, so actual API cost is zero.
- Every request declared 12 tools. The first request ended with a `system` message, the shape that hid tools from llama3.2 in 049, and the model still answered with a tool call.
- The first logged request was replayed with `max_tokens` 1: 10,620 prompt tokens as sent, 3,910 with `tools` removed. So the template rendered about 6,700 tokens of tool schemas after the trailing `system` message. Rule 1 is confirmed by this replay; the rendered text itself is not exposed by Ollama.

## Conclusions

- 049's blocker is resolved by the model choice. With a template that renders tools independently of the last message's role, Claude Code on local Ollama inference makes real Read and Edit calls on this Mac, inside the local-only sandbox.
- The host gate still fails on capability: `granite4:micro-h` made an unrelated edit, guessed before reading, and skipped the command. Claude Code on local models stays unverified as a host for skill evaluation.
- No other qualifying model fits: the larger tool-capable candidates need more memory at 64K than this 16 GB Mac has free, even with a quantized KV cache.

## Limitations

One run, no retry. Free memory measured two ways that disagree, as in 049. Memory fit for two candidates is calculated from GGUF headers, not measured. The model was removed after the run, as the spec requires for a failed candidate. Traces are local only, in the ignored `.cache/local-eval/055/`: gate stream-json, Ollama log, request bodies, templates, and the token replay.

## Next action

On this machine, the next host candidate is another hybrid or small-KV model with tools, like `granite4:micro-h`, rather than a larger dense one. A machine with more free memory could run `qwen3:4b` at 64K. Either is a separate, explicit run. A comparison that could show Flow's value still needs a host that passes this gate.
