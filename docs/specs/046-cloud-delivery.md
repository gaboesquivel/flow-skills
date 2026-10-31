# 046 — Cloud delivery: same Flow, local or cloud

Status: **accepted** (2026-10-31)  
Repository: `gaboesquivel/flow-skills`  
Decision: [0055](../decisions/0055-capability-based-github-and-host-triggered-builds.md) (Accepted)  
Builds on: [0044](../decisions/0044-fast-delivery.md), [0048](../decisions/0048-delivery-phrases-are-approvals.md), [0050](../decisions/0050-github-governance-preset.md), [0052](../decisions/0052-git-first-coordination.md), [0054](../decisions/0054-native-capability-first-sessions.md); [spec 041](041-skill-evaluation.md) (metrics), [spec 045](045-native-observable-sessions.md) (sessions)

## Problem Statement

The maintainer wants to direct product engineering from a phone, which means Claude Code cloud sessions. Flow assumes an authenticated `gh` with GraphQL: `build` stops when `gh` is unauthenticated, `ship` merges with `gh pr merge`, and `board` and `metrics` read pull requests and issues with `gh pr list` and `gh issue list`. Behind the cloud GitHub proxy those GraphQL commands return 403, while `gh api` REST calls and the host's GitHub tools work. Cloud sessions load only repository-scoped skills and instructions, never `~/.claude`. Nothing lets a well-formed issue start a build without someone typing, and `metrics` sees only local session logs, so cloud work is invisible or unlinked.

## Solution

The same phrases behave the same in a local or cloud session. Delivery skills reach GitHub through whichever route works, with REST as the portable default, so pull requests, checks, comments, and merges work behind the proxy. A repository that installs Flow at project scope is cloud-ready with no extra configuration. Optionally, a repository writer adds a `build-it` label to an issue; a Claude Code routine the maintainer set up starts a cloud `build` that ends at a pull request linking the issue and the session. "Ship it" stays a conversational approval with branch protection, CI, the size-guard review, and liveness unchanged. `metrics` reports each change's idea → prod, reliability, and cost split by where it ran, with unknowns labeled.

## User Stories

1. As the maintainer on my phone, I open a cloud session on a Flow repository and say "build it" for a small change; I get a reviewed pull request with green CI, exactly as locally.
2. As the maintainer, I say "ship it" in that session; the pull request merges through REST under branch protection, and liveness is reported.
3. As the maintainer, I add `build-it` to an issue I wrote; a cloud session builds it and the pull request says `Closes #N` and links the session. Nothing merges.
4. As a repository, a `build-it` label added by someone without write permission starts a session that stops before writing and says why on the issue.
5. As the maintainer, I continue a cloud session locally (teleport) or a local one in the cloud; the work in flight rules recover the branch, owner, and pull request either way.
6. As the maintainer, I run `pnpm metrics` and see idea → prod, CI failures, and cost for local, cloud, and issue-triggered changes, with cloud cost "unknown" when no usage export exists.
7. Failure: no GitHub route works (no `gh`, no host tools, proxy refuses). `build` stops with one hand-off and never falls back to local mode.

## Implementation Decisions

**GitHub route (one home: `build` Delivery mode).** GitHub mode when `origin` is on GitHub; reach it per operation through the `write-agents` Tools order. Name operations, not commands, and give REST forms as the portable default: open or update a pull request (`gh api repos/{owner}/{repo}/pulls`), read check runs for a head (`…/commits/{sha}/check-runs` and commit statuses), post a review comment (`…/issues/{n}/comments` or a `COMMENT` review), read allowed merge methods (`repos/{owner}/{repo}`), merge pinned to the checked head (`PUT …/pulls/{n}/merge` with `sha`). `gh pr …` and host GitHub tools remain valid routes when they work. Drop "`gh` authenticated" as the mode test; stop only when every route fails for a needed operation, with one hand-off. `ship` Merge, `write-agents` Sessions (`gh pr list` → open pull requests through any route), and `to-spec` Share the draft link to this rule instead of naming GraphQL commands.

**Scripts use REST.** `skills/board/scripts/board.mjs` and `scripts/metrics.mjs` replace `gh pr list`, `gh issue list`, `gh run list`, and `gh repo view` with paginated `gh api` REST calls returning the same fields, keeping their injected runners for tests. `board` keeps its git-only fallback and note. `scripts/run-context-review.mjs` runs in GitHub Actions with a real token and is unchanged.

**Issue-triggered build (in `build`, a short section, enforced by `skills/build/scripts/issue-trigger.mjs`).** Applies when the request names an issue and says it came from the `build-it` label. Before any write, the gate script reads all issue events through REST, takes the latest `build-it` `labeled` event (the label must still be on the open issue), and requires `write` or `admin` permission from the labeler and from the issue's author (a user-owned repository's owner is admin; otherwise `collaborators/{user}/permission`, then the collaborators list). It exits non-zero on a refusal and fails closed when it cannot read a permission; `build` then comments the reason and stops, never substituting its own reads. Its `task` output (title, body, and comments from `write` or `admin` accounts) is the only issue text used, read as data. An existing branch or open pull request that closes the issue is continued, not duplicated. Then the normal `build` runs. The pull request body adds `Closes #N` and a `Session:` line with the host's session URL when exposed; `build` comments the pull request link on the issue. It never merges; a later "ship it" does.

**Trigger setup (docs, not code).** `docs/agent-compatibility.md` gains a dated Claude Code cloud section: the GitHub proxy facts and limits, which `.claude/` paths load, project-scope install, teleport and `--cloud`, OpenTelemetry for cost, and the routine recipe: a GitHub trigger on `issues.labeled` (the webhook takes no label filter, so the stored prompt stops on any other label and names the gate script). The agent creates the routine through the host's scheduling tools when asked; the maintainer handles only sign-in and consent (`write-agents` Tools). No Flow block key, no new phrase, and no committed workflow file.

**Cloud-ready repositories.** Required context is tracked: the instruction file and a project-scope skills install. README Install says a user-scope install does not reach cloud sessions. For this repository, verify that the symlinked `.claude/skills` loads in a cloud session; if it does not, replace the symlink with the smallest tracked form that does and record the evidence.

**Traceability.** Issue → session → pull request → shipped: `Closes #N` and `Session:` in the pull request body, the merge commit from `ship`, and liveness in its report. No tracked registry. Resume uses the existing Sessions and Work in flight rules; teleport is a host convenience recorded in the compatibility notes.

**Metrics.** `metrics` tags each merged change `local` (linked to a local session log), `cloud` (pull request body has a `claude.ai/code` session link and no local log), or `issue` (closes an issue whose `build-it` label event exists). Idea → prod starts at the first prompt (local), the label event (issue), or, for interactive cloud with no transcript, falls back to first commit and says so. CI failure rate is reported per tag. Cost: local from session logs; cloud and issue are "unknown" unless `--usage <file>` supplies per-session cost exported from the host's OpenTelemetry metrics (`claude_code.cost.usage` keyed by session id). The kill criterion in `PRODUCT.md` Success counts all three tags.

**Glossary.** Update [Delivery mode](../../GLOSSARY.md#delivery-mode) (GitHub access through any route). Add **Issue trigger**: the optional `build-it` label, added by a repository writer, that starts a cloud `build` for one issue through the host's trigger.

**Exposure:** no deployed service, API, or write path. Skills are Markdown; scripts are maintainer tools. The routine runs in the maintainer's Claude account; its only write path is `build` on a branch and pull request, gated by the labeler's GitHub permission, and failing closed on any doubt.

## Testing Decisions

Unit tests extend `tests/board.test.mjs` and `tests/metrics.test.mjs` with REST-shaped fixtures (pagination, a 403 GraphQL error no longer reached, the git-only fallback, the three tags and the unknown cost). Contract tests pin no wording; `pnpm validate` covers links. A new evaluation scenario (E42) grades the issue-triggered build, including the unauthorized-label stop. Structural checks do not prove cloud behavior: the acceptance scenario below runs live in Claude Code cloud and is recorded in `tests/smoke/` with date, surface, version, and limits.

**Acceptance scenario.** The maintainer, on a phone, uses a disposable private repository `gaboesquivel/flow-cloud-sandbox` cut from flow-next, with the governance preset (`main` protected, `verify` and `pr-title` required), Flow installed at project scope, a Vercel connection, and one open issue #1 "Add a /health route that returns ok" written by the maintainer.

1. In a new Claude Code cloud session on that repository, `/context` lists the Flow skills from the repository, and the session reads `AGENTS.md`. Observable: skills listed; no `~/.claude` dependency.
2. The maintainer says "build it: show the app version in the footer". Observable: a `claude/` or work branch, a pull request opened through REST with a `Session:` link, a review comment (never an approval), CI green on the reviewed head, branch liveness reported; no `gh auth login` hand-off.
3. The maintainer says "ship it". Observable: merged through REST with an allowed method pinned to the checked head, remote branch deleted (by `ship`, or by the repository's merged-branch setting where the proxy refuses deletion), liveness `live` with the production URL; no protection bypass.
4. The maintainer adds `build-it` to issue #1. Observable: the routine starts a cloud session; the pull request says `Closes #1` and links the session; the issue gets a comment with the pull request link; nothing merges.
5. A second GitHub account with triage access (which can add labels but has `read` permission) adds `build-it` to a new issue #2. Observable: the session comments that the labeler lacks write permission and writes no branch.
6. The maintainer teleports the issue #1 session locally and says "ship it". Observable: Work in flight finds the branch and pull request; ship merges it and `Closes #1` closes the issue.
7. The maintainer runs `pnpm metrics --repo gaboesquivel/flow-cloud-sandbox`. Observable: step 3's change is tagged `cloud` with idea → prod from first commit (fallback noted); step 6's is tagged `issue` with idea → prod from the label event; cloud cost reads "unknown"; step 5 produced no change and is not counted; each pull request is counted once though step 6 crossed hosts.

## Direction changes

None beyond [decision 0055](../decisions/0055-capability-based-github-and-host-triggered-builds.md). At acceptance its back-pointers update `PRODUCT.md` (Requirements table: GitHub access through `gh`, its REST API, or host tools; Not shipped: Flow hosts no orchestration, and issue-triggered builds use the host's own triggers) and README's delivery table.

## Out of Scope

- The `@claude` GitHub Action path, a committed Actions workflow, or any Flow-hosted trigger or orchestration (Flow Factory).
- Issue-triggered "ship it"; automatic merging of any kind.
- Mandatory issues, a new phrase, or a Flow block key for cloud.
- An OpenTelemetry collector or backend; `metrics` only reads an export the maintainer supplies.
- Cursor or other hosts' cloud agents beyond the portable REST route.

## Further Notes

Host facts come from Claude Code docs read 2026-10-31 (cloud environments, routines, monitoring usage, sessions). Not documented there, and verified only by the live run: whether symlinked `.claude/skills` load, whether REST merge works through the proxy, and who may fire a routine's GitHub trigger (hence the labeler permission check). Routines are a research preview; their caps and behavior may change.
