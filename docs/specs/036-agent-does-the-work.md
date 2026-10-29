# 036 — The agent does the work

Status: implemented (2026-10-29). Decision: [0049](../decisions/0049-agent-does-the-work.md) (Accepted). Builds on [035](035-delivery-phrases.md).

## Problem Statement

A developer using Flow in Claude Code asks for an outcome and gets instructions back: open the Vercel dashboard, go to settings, add this variable, check the CI page. Routine `git`, `gh`, and `pnpm` calls prompt for permission one at a time. Each of these costs a user turn, which is exactly what idea → prod counts as delay. Flow promises one continuous conversation with an engineering partner that does the work. Today the agent often advises instead of acting.

## Solution

The agent does every step it can reach and hands the user only what only the user may do, in one turn.

**Tool ladder.** For each step, use the first rung that works: an installed CLI, then a connected MCP server or connector, then the service API through an authenticated CLI (`gh api`, `vercel api`), then the host's browser automation, then the human. Read state the same way: CI status through `gh`, deployments and domains through `vercel`, never "check the dashboard."

**Human-only steps.** Signing in and OAuth consent; entering secrets, credentials, or payment details; accepting terms; anything the host's safety policy reserves. Changing a security or protection setting also needs the user's explicit request; until then the agent reads it and names the exact change.

**One hand-off.** Gather every foreseeable human-only step into one request: each as one command or one exact URL, with its reason. No click paths. Once the user says done, continue without further questions. Before reporting a blocker, try the ladder.

**Everywhere, not only in skills.** The Flow block carries one line with the rule, so ordinary requests ("add the Stripe key to Vercel") follow it too.

**Fewer prompts here.** The maintainer applies a Claude Code project allowlist for routine read and delivery commands, so dogfood sessions measure the flow, not the prompts. The agent proposes it; it does not write its own permissions.

## User Stories

1. As a developer, I say "add `RESEND_API_KEY` to production" and the agent runs `vercel env add`, asking me only for the value.
2. As a developer, I say "ship it" and the agent reads CI, deployments, and domains through `gh` and `vercel`; I never open a dashboard.
3. As a developer with `vercel` signed out, I get one message: "Run `vercel login` (needed to read the production deployment)". After I say done, the agent finishes without more questions.
4. As a developer whose production URL redirects to Vercel sign-in, the agent reads the project's protection setting through the CLI or API and tells me the one change and the command for it. It changes nothing unless I ask.
5. As the maintainer, I get the proposed allowlist as one hand-off; once applied, routine commands in flow-skills run without a permission prompt, and destructive ones are denied.

## Implementation Decisions

- **One home:** a `## Tools` section in [`write-agents`](../../skills/write-agents/SKILL.md), beside Workers, holding the ladder, the human-only list, and the hand-off rule. A few lines, outcome-first; apply `write-agents`.
- **Links, not copies:** `build`, `ship`, `start`, and `debug` link to `write-agents` Tools where they describe a blocker or a hand-off. Known edits:
  - `ship` Verify: read protection through the host CLI or API before naming the change; it says "asking the user to change protection" today.
  - `start` Deployment: when the repository is not connected to the host, use the host CLI when authenticated; otherwise one hand-off.
  - `debug`: "ask the user when the next step requires … access or authority" applies only after the ladder.
- **Flow block:** one line from `skills/flow/lib/flow-block.mjs` (and the no-Node fallback text in `flow`), for example: "Do the work: CLI, then MCP, then API, then browser; hand off only sign-in, secrets, payment, or consent, as one command each (`write-agents` Tools)." Existing blocks pick it up the next time someone says "set up Flow here".
- **Principle 3** in `PRODUCT.md` becomes "Human-directed, agent-executed", and the paragraph above it (humans decide, agents execute) updates to match. The [principles](../principles.md#agentic) "Agentic" theme gains one sentence: the same interfaces Flow asks products to expose are the ones its agent uses first.
- **Allowlist (maintainer hand-off):** proposed rules for `.claude/settings.json` in this repository. Allow read-only and delivery commands: `git` status, diff, log, branch, fetch, worktree, add, commit, and push (no force); `gh pr`, `gh run`, `gh repo view`, and read-only `gh api`; `pnpm validate`, `pnpm test`, and `pnpm metrics`; `node scripts/*` and `node skills/*/lib/*`. Deny `git push --force*`, `git reset --hard*`, `git clean*`, and `gh pr merge --admin*`. The agent proposes these rules and never writes its own permission settings; the maintainer applies them.
- **Metrics:** `pnpm metrics` reports permission denials during each linked change. Claude Code session logs record a refused prompt but not an approved one or a hand-off, so those two are reported as unknown, never as zero.
- **Exposure:** none deployed. Instruction text, one project setting file, and a maintainer script.

## Testing Decisions

Existing packaging and validation checks, plus `tests/flow-block.test.mjs` for the new block line and `tests/metrics.test.mjs` for the diagnostics on fixture logs. Checks run at the PR boundary. Live behavior is checked by the exercise below, recorded as observations, not by tests that mirror wording.

**Acceptance scenario.** A developer works in Claude Code on a flow-next project with the Flow block. `gh` is authenticated, `vercel` is installed but signed out, and the project is linked to Vercel with deployment protection on.

1. "Add `RESEND_API_KEY` to production": the agent asks once for the value, notices `vercel` is signed out, and asks once for `vercel login` in the same message. After "done", it runs `vercel env add` and confirms with `vercel env ls`. The user gives no other instruction.
2. "Build it" on a one-line fix: the pull request opens and CI is read through `gh`. No message tells the user to open GitHub or Vercel.
3. "Ship it": liveness finds the production URL redirecting to sign-in. The agent reads the protection setting through the CLI or API, reports the shipped commit as not verified live, and names the one setting and the command to change it. It changes nothing.
4. In flow-skills, the agent proposes the allowlist as one hand-off and does not write it. Once the maintainer applies it, `git status`, `gh pr view`, and `pnpm test` run without a permission prompt, and `git push --force` is denied.
5. `pnpm metrics` on that session reports idea → prod with its permission denials, and labels approved prompts and hand-offs unknown.

## Direction changes

- `PRODUCT.md` principle 3: "Human-led, agent-assisted. Automate execution without unnecessarily replacing human judgment." becomes "Human-directed, agent-executed" (decision 0049).

## Out of Scope

- Permission allowlists for adopter projects, Cursor, or Codex. They stay with flow-next and flow-mono (spec 035).
- Changing protection, billing, or security settings without an explicit request.
- Installing CLIs or connecting MCP servers on the user's behalf. The agent may name the missing tool and its one install command as a hand-off.
- New skills.

## Further Notes

- Evidence for the problem is the maintainer's own Claude Code sessions (2026-10-29): dashboard instructions, settings click paths, and repeated prompts on routine commands. No count exists yet; the metrics diagnostics are how this spec gets one.
- Host safety rules already forbid agents from entering credentials or accepting terms. The human-only list mirrors them so the agent knows the floor in advance, instead of discovering it mid-task.

**Build results (2026-10-29).**

- Writing `.claude/settings.json` was refused by Claude Code's auto mode classifier. An agent widening its own permissions is a user-only step, so the allowlist became a maintainer hand-off, and "changing the agent's own permission settings" joined the user-only list in `write-agents` Tools and decision 0049.
- A scan of the 30 latest session logs in this repository found refused tool uses logged as a tool result, but no entry for an approved prompt or a hand-off. The metrics diagnostic counts denials only.
- Acceptance steps 1 to 3 are instruction text, checked by review, not live runs; steps 4 and 5 are checked once the allowlist is applied.
