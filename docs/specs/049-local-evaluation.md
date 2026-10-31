# 049 — Local evaluation on Apple Silicon

Status: accepted (2026-10-31).
Execution: spec/049-local-evaluation; isolated worktree `.worktrees/049-local-evaluation`. Integration owner: unassigned; the session that runs "build it" takes it.

## Problem Statement

The maintainer needs a repeatable way to exercise Flow locally without paid inference. The repository has deterministic tests and 43 numbered behavioral scenarios, including retired scenarios, but `pnpm eval:check` only validates their definitions. Neither a green fixture nor a model answering a prompt proves live skill execution.

The first bet is deliberately small: can this Mac run one bounded fixture-derived smoke through local inference, preserve inspectable evidence, and distinguish model limitations from integration failures? It tests the pipeline (local routing, isolation, recording), not whether Flow helps: a one-word typo fix is expected to look the same with and without Flow.

## Solution

Document and implement an on-demand local smoke procedure using Ollama and a small Qwen coding model. Prefer the existing Claude Code installation only after its local routing and tool execution are verified. If that combination cannot fit or execute tools reliably, deliver a direct Ollama fixture probe, explicitly labeled as a limited inference probe rather than a host or skill evaluation.

Preserve the existing [evidence model and comparison procedure](../../tests/evals/README.md) and [spec 041](041-skill-evaluation.md). This adds a bounded local execution path, not a replacement scenario catalog, general eval runner, or hosted evaluation service.

## Implementation Decisions

### Machine and model selection

- Observed during drafting: Apple M5, arm64, 16 GB unified memory, approximately 699 GiB free disk. Homebrew, Node, pnpm, and Claude Code resolve on PATH; Ollama does not. No model inventory, free-memory measurement, installed host version, or integration test has been performed. Refresh these facts before installation; absence from PATH does not establish absence from the machine.
- Inspect existing app installations, services, model storage, available memory, disk, and versions first. Reuse compatible tools. Install Ollama only when missing; keep configuration local to this workflow and preserve the user's normal Claude configuration. Do not start a persistent background service unnecessarily.
- Start the direct probe with `qwen2.5-coder:0.5b`, the smallest published coding variant (398 MB Q4_K_M at research time). This is a capacity-friendly candidate, not a claim of sufficient agent capability. Record the actual model digest, quantization, context, and generation settings. Consider 1.5B only after an observed capability failure and a fresh capacity check; no automatic ladder of downloads.
- Claude Code is a separate capability gate. Ollama documents its Anthropic-compatible integration and recommends 64k+ context; the Qwen2.5-Coder catalog advertises 32K, so `qwen2.5-coder:0.5b` is never the host model. The host candidate is chosen at build time by rule, not named now: the smallest local model whose installed Ollama metadata (`ollama show`) lists tool support and a context length of at least 64K, and whose loaded size at that context leaves at least 4 GB of this Mac's measured free memory. Try at most one such candidate, with one download. If none qualifies, or it fails the gate below, record the host path as blocked with the measurement that blocked it, and run the smoke on the direct probe. Do not pretend that raising a setting establishes supported context or fit in 16 GB.

### Local-only execution boundary

- Model downloads may use the network during setup. Inference must use a loopback Ollama endpoint and a downloaded local model; reject cloud model selections, remote endpoints, and redirects to them. Disable Ollama cloud features using the installed version's supported mechanism and verify the effective setting.
- Use a fresh host configuration without inherited paid-provider credentials, global Flow skills, plugins, MCP connections, or hooks. Route all model roles locally; disable remote fallback and nonessential network features. Verify with logs and enforce outbound restrictions during inference where available. If the host cannot establish that boundary, do not launch it; use the direct probe instead.
- A successful text response is insufficient for Claude Code integration. Require observed local requests plus one fixture read, one edit, and one focused command result through the host. Preserve permission boundaries; do not globally disable safeguards.
- No hosted judge, paid API calls, cloud agent, CI-triggered LLM evaluation, GitHub writes from the evaluated agent, or Vercel builds. Downloads and local electricity are distinct from inference API charges.

### One smoke and honest comparison

- Reuse the [E43 lending desk fixture](../../tests/fixtures/e43-shared-language/README.md). The first smoke is request 3 from [E43](../../tests/evals/tasks/E43-task.md): introduce one known README typo in the setup commit, then ask to fix it. Freeze the exact typo, prompt, and initial commit before running either condition.
- Run one with-Flow condition and one no-Flow condition, serially, against copies of that same fixture commit. Same model digest, host, prompt, generation settings, and limits; only Flow loading differs. Preserve domain context and fixture instructions in both. Keep the rubric hidden from both candidates.
- Each condition has its own disposable repository without a remote and a clean configuration directory. The baseline must expose no Flow skill links, installed global skills, or Flow instructions inherited from a parent directory. Never run either candidate in the active repository or another session's worktree.
- For a verified agent host, apply only E43 request 3's rubric: one README-only commit, no new tests, glossary changes, or questions. This is partial E43 evidence, not a pass of all four requests, a before/after spec 047 comparison, or evidence about contract-first API work.
- **What the pair shows.** Both conditions are expected to fix the typo. The pair checks that the two conditions are isolated, run on identical inputs, and are recorded the same way; a matching result is the expected outcome, not evidence for or against Flow. A difference is reported as observed, with no claim about skill value from one run.
- For the direct fallback, supply the README and the same typo-fix prompt in both conditions. The Flow condition alone also gets, as system text, the fixture's Flow block and the `build` skill text ("fix the typo; build it" is a `build` request); the no-Flow condition gets the fixture's instructions with the Flow block removed. Record the exact text and its token count for each. Capture the response without executing model-generated commands. Compare the proposed correction to the known typo; report it as a fixture-derived inference probe. It cannot satisfy the host commit criterion or demonstrate automatic skill discovery. Never compare a direct probe in one condition with an agent host in the other.
- Do not change scenario statuses on the strength of this subset. Spec 041's full delivery comparison remains a separate exercise; no idea-to-production improvement claim follows from a typo smoke.

### Artifacts and minimal implementation

Use existing Node tooling without a new framework. Add only a small maintainer script if needed for the direct request, bounded timeout, local endpoint validation, and trace capture; otherwise document the verified CLI procedure. No generic scheduler or suite runner.

Keep raw traces and fixture workspaces in an ignored local directory. A concise record at `tests/evals/records/YYYY-MM-DD-e43-local-smoke.md` follows the free-form Markdown of the existing records (for example [2026-10-31-e43-opus.md](../../tests/evals/records/2026-10-31-e43-opus.md)). `pnpm eval:check` validates `scenarios.json`, not record files, so the record needs no schema change; it is not linked as an E43 `observation`, and E43's live result stays `not_executed`. The record opens with a Scope line naming it a partial, pipeline-only smoke of E43 request 3, and identifies the source commit, subset, host/version or direct API, model digest, condition, prompt, skill inputs, context, limits, request/response trace locations, commands, exit status, diff, elapsed time, and outcome. Redact credentials and machine identifiers. Record failures and truncation, not only successes; missing measurements are `unknown`. API cost is zero only with observed local routing. This assistant's drafting session cost is outside that measurement.

**Exposure:** maintainer-only local execution; loopback service, disposable fixture writes, no deployment or public write surface.

## Testing Decisions

The build first runs only the necessary focused deterministic checks for any new helper: local endpoint accepted; remote endpoint/cloud selection rejected before a request; timeout and malformed response preserved as failures. Use a mocked transport, not an LLM, for these checks. Specify the exact one-file command when the helper exists. A documentation-only procedure needs no invented unit test.

**Acceptance scenario.** A maintainer starts on an Apple-Silicon Mac with this repository and no assumed Ollama setup:

1. Inventory capacity and tools; select a pinned model and bounded context with documented headroom. Installation output and versions are observed, or the precise blocker is recorded.
2. Verify local inference routing and, if feasible, Claude Code's tool capability in the disposable fixture. If unsupported, record the failed gate and select the direct probe for both conditions.
3. Prepare the known README typo once, then run only that smoke in two isolated conditions. Cap each condition at five minutes, with no automatic retry; for a direct probe cap generated output at 512 tokens. Any explicit retry gets a separate trace and count.
4. Inspect the outputs against the applicable narrow criterion. A timeout, unrelated edit, failed tool call, or incorrect correction is a recorded failure, never silently repaired into a pass by the supervising agent.
5. Write the evidence record with observed results, limitations, local routing evidence, API cost, and next action. Confirm no unrelated fixture files or existing scenario records changed. A fallback success proves the direct path only; Claude Code remains unverified or blocked.

Do not run the full repository test suite, all E43 requests, or the 43-scenario catalog on this first pass. Do not wire any live call into CI.

## Tasks

- [ ] Inventory and configure local tooling; record model selection and local-only controls.
- [ ] Verify the host gate or implement the small direct fallback, with focused checks where code is added.
- [ ] Run the single paired typo smoke and record truthful partial evidence; document the repeat command in the eval README.

## Appetite

One local setup and smoke session, targeting 60 minutes excluding download time, zero paid inference tokens. Stop after one paired smoke; prioritize a working direct probe over forcing an unsuitable model into Claude Code. If setup cannot complete within the appetite, leave the exact blocked step and evidence. Implementation elapsed time: not measured; implementation has not started.

## Out of Scope

Full-suite execution, full E43 verification, hosted inference, CI LLM jobs, dashboards, new eval frameworks, automatic model benchmarking, skill rewrites, global configuration changes, and production deployment. No JEV integration is assumed: no JEV-specific implementation was found in the inspected eval sources, and the earlier conversation does not establish a required interface.

## Further Notes

Initially inspected `main` at `4ab63838b011da59e3cec847bb1965586fadfad8`; integrated updated `main` at `2a86867` after spec 048 / PR #208 merged during drafting. The other session's checkout and branch were left untouched. The user subsequently requested spec only: no installation, inference, implementation, or tests were performed during drafting.

Official sources consulted 2026-10-31 (documentation evidence, not local execution evidence):

- [Ollama Claude Code integration](https://docs.ollama.com/integrations/claude-code): supported integration surface, compatible-model requirement, and context guidance.
- [Ollama Qwen2.5-Coder catalog](https://ollama.com/library/qwen2.5-coder) and [0.5B model](https://ollama.com/library/qwen2.5-coder:0.5b): sizes, context listing, and candidate artifact.
- [Ollama FAQ](https://docs.ollama.com/faq): runtime context configuration and GPU residency inspection.

Open assumptions: the small model can correct this typo; some local model meets the host-candidate rule (tools, 64K context, 4 GB headroom) on this Mac; the installed host can isolate configuration and expose enough routing evidence. These are build-time gates, not accepted compatibility claims. A later bet that tests whether Flow helps needs a task the two conditions can plausibly differ on; it gets its own spec after this one ships.

Revised 2026-10-31 after review: host-candidate rule, the pair's purpose, the direct probe's Flow inputs, the record's location and format, and integration ownership.
