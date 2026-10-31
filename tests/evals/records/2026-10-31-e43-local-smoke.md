# E43 request 3 local smoke (2026-10-31)

## Scope

A partial, pipeline-only smoke of [E43](../tasks/E43-task.md) request 3 under [spec 049](../../../docs/specs/049-local-evaluation.md): can this Mac run a bounded paired run on local inference, with isolated conditions and inspectable traces? It is not evidence about whether Flow helps, not an E43 pass, and not linked as an E43 observation; E43's live result stays `not_executed`.

Source commit: `7fd4006` (spec/049-local-evaluation). Fixture: [lending desk](../../fixtures/e43-shared-language/README.md) with `copies` changed to `copeis` in README.md, committed once as `5a4e726` and copied per condition for the probe (no remote, clean tree). The gate used a separate preparation, `0d25125`.

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

Routing was local in both: Ollama logged one `POST /v1/messages` from 127.0.0.1 per attempt, and Claude Code reported no API key source. No read, edit, or command was observed, so the host gate failed. **Cause unresolved:** Claude Code counted 11,414 input tokens for the request, while Ollama received a 17,052-character prompt that tokenized to 3,946, with 22 tools declared at init. Either the model cannot call tools here, or the tool definitions did not reach it through Ollama's Anthropic-compatible layer; the traces do not separate the two. Per the spec, no second candidate was tried; Claude Code on local models remains unverified on this Mac.

Gate fixture: a separate preparation of the same typo, commit `0d25125`. Command, from that copy (exit 0 both attempts):

```sh
sandbox-exec -f local-only.sb env -i PATH="$PATH" HOME=<fresh> TERM=dumb CLAUDE_CONFIG_DIR=<fresh> \
  ANTHROPIC_BASE_URL=http://127.0.0.1:11434 ANTHROPIC_AUTH_TOKEN=ollama ANTHROPIC_API_KEY= \
  ANTHROPIC_MODEL=llama3.2:1b ANTHROPIC_DEFAULT_{OPUS,SONNET,HAIKU}_MODEL=llama3.2:1b ANTHROPIC_SMALL_FAST_MODEL=llama3.2:1b CLAUDE_CODE_SUBAGENT_MODEL=llama3.2:1b \
  CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 DISABLE_TELEMETRY=1 DISABLE_ERROR_REPORTING=1 DISABLE_AUTOUPDATER=1 \
  timeout 300 claude -p "Read README.md. It has one misspelled word. Fix it by editing README.md, then run: git diff --stat" \
  --model llama3.2:1b --strict-mcp-config --setting-sources project --no-session-persistence --no-chrome \
  --allowedTools "Read,Edit,Bash(git diff:*)" --output-format stream-json --verbose
```

(Each `*_MODEL` variable was set individually.) Claude Code's 16 bundled skills and 2 builtin plugins loaded; no Flow or user skills, MCP servers, or hooks. Claude Code printed `unrecognized_model` and an estimated `total_cost_usd` of 0.02 for its own price table; no paid API was reachable inside the sandbox, so actual API cost is zero.

## Paired direct probe

Model: `qwen2.5-coder:0.5b` (digest `4ff64a7f502a`, Q4_K_M, 494M parameters, 32,768 context). Helper: [`scripts/local-probe.mjs`](../../../scripts/local-probe.mjs) to `/api/chat`, temperature 0, seed 0, `num_ctx` 32768, `num_predict` 512, 5-minute timeout, no retry, same sandbox. The model's output was never executed. The rubric was not given to either condition.

| | Flow | No Flow |
| --- | --- | --- |
| System text | fixture `AGENTS.md` (with Flow block) + `skills/build/SKILL.md`, 2,794 words | fixture `AGENTS.md` without the Flow block, 43 words |
| User prompt | README + "Fix the typo in README; build it." (identical) | same |
| Prompt / output tokens (prompt includes system text and user prompt) | 3,862 / 34 | 129 / 135 |
| Elapsed | 1.9 s | 0.8 s |
| Truncated | no | no |
| Reply | the README unchanged, `copeis` still present | named a nonexistent typo in a test command, then suggested `npm build` |
| Outcome | **failure** | **failure** |

Outcome is the rubric verdict; the helper's trace says `outcome: completed` for both, meaning a well-formed reply arrived. Neither condition named the `copeis` → `copies` fix. `git status` in each copy was clean after its run (checked, output not kept); the direct probe does not read the copies, so they show only that nothing wrote to them. Command per condition (exit 0 both):

```sh
sandbox-exec -f local-only.sb env -i PATH="$PATH" HOME=<copy> node scripts/local-probe.mjs --model qwen2.5-coder:0.5b \
  --prompt-file inputs/prompt.txt --system-file inputs/system-<flow|noflow>.txt --num-ctx 32768 --out probe-<flow|noflow>.json
``` Retries: none. Unauthorized actions: none (a direct probe has no tools). User turns: 0.

## Conclusions

- The pipeline works: local-only routing (loopback bind, cloud disabled, requests only from 127.0.0.1), frozen inputs, and full traces.
- `qwen2.5-coder:0.5b` did not fix this typo in either condition, so this smoke says nothing about Flow. No tool call was observed from `llama3.2:1b` in Claude Code; whether that is the model or lost tool definitions is unresolved.
- Context was not the cause: Ollama tokenized 3,946 prompt tokens with `truncated = 0` at both 4K and 64K (Claude Code counted 11,414). Multi-turn host runs still need the 64K+ Ollama recommends.

## Limitations

One run per condition. Free memory measured two ways that disagree; memory figures and the sandbox check (`https://example.com` failed, loopback answered) were observed in the session but not kept as trace files. Traces (`gate-*.jsonl`, `probe-*.json`, `ollama-*.log`, inputs, sandbox profile) are local only in the ignored `.cache/local-eval/`. Machine identifiers and the user's credentials are not recorded. Elapsed time for the whole build: unknown.

## Next action

To settle the gate's cause, rerun it once with `OLLAMA_DEBUG_LOG_REQUESTS=1` and check whether the rendered prompt contains the tool definitions. The spec allows a 1.5B model only after an observed capability failure (now observed) and a fresh capacity check. Running `qwen2.5-coder:1.5b` is a separate, explicit run. A comparison that could show Flow's value needs a task the conditions can differ on, as its own spec.
