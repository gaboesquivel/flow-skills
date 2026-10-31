# 052 — Native session integration in Claude Code

Status: draft (2026-10-31)

## Problem Statement

[Spec 045](045-native-observable-sessions.md) made native sessions Flow's preferred surface for substantial parallel work, and [decision 0054](../decisions/0054-native-capability-first-sessions.md) lets the host's guidance win over that preference. The Claude Code Desktop guidance Flow recorded on 2026-10-31 is already incomplete, and in two places Flow's skills now tell the agent to do something the host tells it not to, or to spend tokens the host already saves:

1. **Merging child sessions.** `build`'s [Task set](../../skills/build/SKILL.md#task-set) has the integration owner merge every slice branch without asking. Desktop guidance says a branch from a session started in its own worktree is merged only when the user says so, after the agent names each branch by its full ref. When slices run as sessions, the agent either breaks host guidance or stalls without a rule for asking once.
2. **Which surface for task-set slices.** Desktop guidance sends pieces of one task to subagents; it allows sessions when the user asks, and, after the user accepts a plan, has the agent propose each independent step as a session card (at most four), start its own step at once, withdraw cards for steps it then does itself, and skip steps a started session owns. `write-agents` [Workers](../../skills/write-agents/SKILL.md#workers) does not say which applies to a "build it" task set, so agents re-derive it each run.
3. **Waiting for CI.** `build`'s Verify step 2 says "wait until" the gate reports ready. Desktop can bind the pull request and wake the session on check results, failures, conflicts, and review comments; polling `gh` in the meantime costs turns and tokens for nothing.
4. **Child reports.** Desktop wakes the parent when linked sessions finish and quotes only the first 400 characters of each child's latest report. Flow's session brief does not ask the child to put what integration needs (branch, head commit, unmet items) there, so the parent reads transcripts or re-derives state from Git by guesswork.
5. **Stale compatibility evidence.** [`docs/agent-compatibility.md`](../agent-compatibility.md) records none of the above, nor native hand-off of an interrupted task, `sync_with_base_branch` for app-made worktrees, or that a session forked from a non-worktree checkout does not start from the delivery head.

Each costs a turn, a question, or a duplicate read on the median delivery; together they make parallel delivery in Desktop slower than sequential work.

## Solution

Tighten existing rules; add no skill, command, registry, or ceremony. Portable skill bodies stay capability-based; Desktop specifics go in the compatibility note, dated.

- **Default slice surface.** Under "build it", task-set slices run as subagents (worktree-isolated when they write) where the host keeps sessions for separate tasks; native sessions are used when the user asks for them or the host proposes them for an accepted plan. This applies 0054's "host guidance wins" rather than changing it.
- **One merge question, only when needed.** Slices that ran as subagents are integrated without asking, as today. Slices that ran as host sessions whose guidance reserves merging for the user get one question per delivery, listing every child branch as `refs/heads/…`, asked when the last child reports, not per child. Until the yes, the parent integrates nothing from them and reports them as work in flight.
- **Child report first lines.** A session brief asks the child to lead its final report with its branch, head commit, and any unmet or unresolved item. The parent checks those against Git (containment, not transcript) before integrating; a report is evidence, not proof.
- **Host-watched checks.** Where the host watches the pull request and wakes the session on check results, `build` relies on that instead of polling and runs `ship`'s gate script once when woken. Elsewhere, the current wait stands.
- **Refreshed evidence.** One dated Desktop row update plus short notes for hand-off, base sync, and the worktree base of sessions started from a plain checkout.

## User Stories

1. As a maintainer in Claude Code Desktop, I say "build it" on a spec with three independent tasks and get one draft PR without being asked anything, because the slices run as worktree subagents.
2. As a maintainer who asked for sessions, I am asked once, with every child branch named, before the parent merges them, and I can still open each child to inspect it.
3. As the parent session, when children finish I integrate from their quoted first lines plus `git merge-base --is-ancestor`, without reading their transcripts.
4. As a maintainer whose PR is ready, I don't see the agent polling CI; it resumes when the app reports checks, and lands or fixes from there.
5. Failure: a child's report names a head that its branch does not contain, or no branch. The parent reports it as unfinished work in flight and integrates nothing from it.

## Implementation Decisions

- **`skills/write-agents/SKILL.md`**
  - Workers, "Choose the surface": add one sentence: where host guidance keeps sessions for separate tasks, pieces of one delivery are subagents unless the user asks for sessions or accepts the host's per-step proposals.
  - Sessions, "Native sessions": add the child's report first lines (branch, head commit, unmet items), and that where host guidance reserves merging a session's branch for the user, the owner asks once per delivery, naming every branch by full ref, after the last child reports.
- **`skills/build/SKILL.md`**
  - Task set step 3: link the Sessions merge question instead of restating it; subagent slices unchanged.
  - Verify step 2: "where the host watches the pull request's checks and wakes the session, rely on it and run the gate once when woken; never poll."
- **`docs/agent-compatibility.md`**: update the Claude Code Desktop row (plan-acceptance proposals, linked-session completion notes with a 400-character quote, merge-only-on-the-user's-word, PR binding and Auto-fix, native hand-off, `sync_with_base_branch`, sessions from a plain checkout starting off the delivery head), dated 2026-10-31, observed from tool guidance and not exercised.
- **`docs/research/2026-10-31-native-sessions.md`**: one row for the same observation with its limit.
- No decision record: each change applies [0054](../decisions/0054-native-capability-first-sessions.md) and [0052](../decisions/0052-git-first-coordination.md) as written. No direction change to spec 045 or 048: one delivery PR, one integration owner, and worker branches staying local all stand.
- Net word budget for the two skill files: no growth; offset additions by trimming restatement in the same sections.

**Exposure:** Markdown guidance in the existing skill distribution; no deployed service, API, write path, or authentication change.

## Testing Decisions

Structural only during this spec: `pnpm validate` and `pnpm test` at PR time (links, word counts, contract keywords). Extend scenario E41 in `tests/evals/scenarios.json` with the merge question, child report lines, and the no-polling expectation instead of adding a scenario. No paid or live eval runs as part of this spec; E41's live result stays `not_executed` until the maintainer asks for a run.

**Acceptance scenario:** a maintainer in Claude Code Desktop, in a disposable repository with an accepted spec of three independent documentation tasks and GitHub mode on.

1. Says "build it". The agent opens one draft PR on `spec/<n>-<slug>`, runs the three tasks as worktree subagents, and asks nothing. Verify: one remote branch, no session cards, no question.
2. Repeats with "build it, one session per task". The agent starts three linked sessions, each briefed with branch, worktree, owner, and the report first-lines request. Verify: each child's final report starts with branch and head commit.
3. When the last child reports, the agent asks one question naming the three `refs/heads/…` branches. Before the answer, nothing is merged; the report lists them as work in flight. Verify via `git log` on the delivery branch.
4. The maintainer says yes. The agent checks each named head is on its branch, merges, pushes once, and marks the PR ready. Verify: each child head is an ancestor of the delivery head.
5. While checks run, the agent issues no `gh pr checks` or `gh run` calls; when woken by the app it runs the gate script once and reports. Verify from the session's tool log.
6. Variant: one child's report names a commit its branch lacks. The agent integrates the other two, reports the third as unfinished with its path and branch, and the PR claims no completion.

## Out of Scope

New skills, commands, hooks, MCP servers, or a session registry; changing merge authority for subagent slices; Cursor or other hosts beyond keeping the portable floor; running E41 or any paid eval; reshaping `handoff` (native hand-off is noted in compatibility only).

## Further Notes

Evidence is this Desktop session's tool guidance on 2026-10-31, read but not exercised; host guidance can change between app versions, which is why specifics stay in the dated compatibility note. Priority if trimmed: (1) merge question and default surface, (2) no-polling checks, (3) child report lines, (4) compatibility refresh.
