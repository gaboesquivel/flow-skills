# E43 request 3 local smoke (2026-10-31)

## Scope

A partial, pipeline-only smoke of [E43](../tasks/E43-task.md) request 3 under [spec 049](../../../docs/specs/049-local-evaluation.md): can this Mac run a bounded paired run on local inference, with isolated conditions and inspectable traces? It is not evidence about whether Flow helps, not an E43 pass, and not linked as an E43 observation; E43's live result stays `not_executed`.

Source commit: `7fd4006` (spec/049-local-evaluation). Fixture: [lending desk](../../fixtures/e43-shared-language/README.md) with `copies` changed to `copeis` in README.md, committed once as `5a4e726` and copied per condition (no remote, clean tree).

## Machine and setup

- Apple M5, arm64, 16 GB unified memory, about 699 GiB free disk. Claude Code 2.1.316, Node 24.20.0.
- Ollama was not installed; installed Ollama 0.40.11 from the Homebrew formula. No login service: each server ran for this session on `127.0.0.1:11434` with `OLLAMA_NO_CLOUD=1`, and its log reported `Ollama cloud disabled: true`. Stopped after the runs.
- Free memory before loading a model: `memory_pressure` 47–53% free; vm_stat free + inactive + speculative + purgeable 3.9–4.4 GB. The two measures disagree; both are recorded.

## Claude Code gate: blocked

Candidate by the spec's rule: `llama3.2:1b` (digest `baf6a787fdff`, Q8_0, 1.2B parameters). `ollama show` lists tools and a 131,072-token context. Loaded at 64K context it took 2.69 GB, all on GPU. Free memory afterward: `memory_pressure` 26% (about 4.2 GB, meets the 4 GB headroom), vm_stat about 2.2 GB (does not). Borderline; the gate was run.

Isolation: `env -i` with only `PATH`, a fresh `HOME` and `CLAUDE_CONFIG_DIR`, every model role set to `llama3.2:1b`, `ANTHROPIC_BASE_URL=http://127.0.0.1:11434`, a placeholder auth token, nonessential traffic and telemetry off, `--strict-mcp-config --setting-sources project`, under a `sandbox-exec` profile that denies outbound network except to localhost (verified: `https://example.com` failed, loopback answered). Task: read README.md, fix the misspelled word, run `git diff --stat`.

| Attempt | Server context | Prompt tokens reaching the model | Tool calls | Result | Elapsed |
| --- | --- | --- | --- | --- | --- |
| 1 | default 4,096 | 3,946, not truncated (3,968 with output) | none | one sentence restating the task | 2.3 s |
| 2 (explicit retry at 64K, suspecting truncation) | 65,536 | 3,946, not truncated (4,183 with output) | none | echoed part of its system prompt | 7.3 s |

Attempt 2 was run on a suspicion that the 4K default had truncated the prompt; the logs show it had not, so both attempts saw the same full prompt.

Routing was local in both: Ollama logged one `POST /v1/messages` from 127.0.0.1 per attempt, and Claude Code reported no API key source. No read, edit, or command was observed, so the host gate failed. Per the spec, no second candidate was tried; Claude Code on local models remains unverified on this Mac. Claude Code printed `unrecognized_model` and an estimated `total_cost_usd` of 0.02 for its own price table; no paid API was reachable inside the sandbox, so actual API cost is zero.

## Paired direct probe

Model: `qwen2.5-coder:0.5b` (digest `4ff64a7f502a`, Q4_K_M, 494M parameters, 32,768 context). Helper: [`scripts/local-probe.mjs`](../../../scripts/local-probe.mjs) to `/api/chat`, temperature 0, seed 0, `num_ctx` 32768, `num_predict` 512, 5-minute timeout, no retry, same sandbox. The model's output was never executed. The rubric was not given to either condition.

| | Flow | No Flow |
| --- | --- | --- |
| System text | fixture `AGENTS.md` (with Flow block) + `skills/build/SKILL.md`, 2,794 words | fixture `AGENTS.md` without the Flow block, 43 words |
| User prompt | README + "Fix the typo in README; build it." (identical) | same |
| Prompt / output tokens | 3,862 / 34 | 129 / 135 |
| Elapsed | 1.9 s | 0.8 s |
| Truncated | no | no |
| Reply | the README unchanged, `copeis` still present | named a nonexistent typo in a test command, then suggested `npm build` |
| Outcome | **failure** | **failure** |

Neither condition named the `copeis` → `copies` fix. Fixture copies were unchanged after each run. Retries: none. Unauthorized actions: none (a direct probe has no tools). User turns: 0.

## Conclusions

- The pipeline works: local-only routing (loopback bind, cloud disabled, sandbox blocking other hosts), isolated per-condition copies of one commit, frozen inputs, and full traces.
- `qwen2.5-coder:0.5b` cannot do this typo fix in either condition, so this smoke says nothing about Flow. `llama3.2:1b` does not call tools in Claude Code.
- Context was not the cause: with `--setting-sources project` and no skills, Claude Code's first request was about 4K tokens and fit Ollama's 4K default. Multi-turn host runs still need the 64K+ Ollama recommends.

## Limitations

One run per condition. Free memory measured two ways that disagree. Traces (`gate-*.jsonl`, `probe-*.json`, `ollama-*.log`, inputs, sandbox profile) are local only in the ignored `.cache/local-eval/`. Machine identifiers and the user's credentials are not recorded. Elapsed time for the whole build: unknown.

## Next action

The spec allows a 1.5B model only after an observed capability failure (now observed) and a fresh capacity check. Running `qwen2.5-coder:1.5b` is a separate, explicit run. A comparison that could show Flow's value needs a task the conditions can differ on, as its own spec.
