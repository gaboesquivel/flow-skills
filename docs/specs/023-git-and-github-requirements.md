# 023: Git for delivery, GitHub for GitHub mode

Status: accepted (2026-10-28). Decisions: [0037](../decisions/0037-git-for-delivery-github-for-github-mode.md) (Accepted). Builds on [spec 021](021-demo-findings.md) and [decision 0036](../decisions/0036-one-explore-depth.md).

## Problem Statement

Flow never says what it needs from the environment, so users guess, and they guess wrong in both directions:

- **Users think Flow needs GitHub.** The maintainer's own framing was "everything is GitHub-based". In fact local delivery needs only Git, and it is the only way the delivery chain works with GitLab, with Bitbucket, or with no remote at all.
- **Nothing says the delivery chain needs Git.** Since spec 021, `explore` commits its brief on an `explore/<slug>` branch, and `flow` puts the Flow block in "the instruction file Git tracks". In a folder with no repository, neither skill has a rule. Only `start` (which creates the repository) and `board` (which exits with a message) handle it. README and `PRODUCT.md` never state the requirement. It appears only in passing in [agent-compatibility.md](../agent-compatibility.md).
- **The delivery names describe the wrong thing.** The Flow block records `Delivery: pull-request` or `local`. What separates the modes is whether GitHub issues and pull requests are used: local mode can still push to a remote. "Pull-request mode" names only one of the GitHub features the mode uses, and "remote" (the user's first proposal) would clash with Git's `remote`, which local mode also uses.
- **The thinking skills must not inherit the requirement.** Half the catalog (`grill`, `interview`, `council`, `jtbd`, `competitors`, `domain-modeling`, `debug`, `tldr`, `write-humans`, `write-agents`, `retro`, `handoff`) is useful in a chat or a docs folder with no repository. A blanket "Flow requires Git" would cost those uses for nothing.

## Solution

1. **Three requirement tiers, stated once.** `PRODUCT.md` owns the table, and README and [agent-compatibility.md](../agent-compatibility.md) link to it:

   | Tier | Skills | Needs |
   | --- | --- | --- |
   | Thinking | `grill`, `interview`, `council`, `jtbd`, `competitors`, `domain-modeling`, `debug`, `tldr`, `write-humans`, `write-agents`, `retro`, `handoff`, `prototype` | Nothing: work in any folder or none |
   | Delivery chain | `flow`, `start`, `explore`, `to-spec`, `to-tasks`, `build`, `review`, `ship`, `board` | A Git repository |
   | GitHub mode | spec issues, sub-issues, pull requests, preview-deployment verification | GitHub access, on top of Git |

   A thinking skill may use Git when a repository exists (`handoff` reads the branch; `debug` reads history) but never requires it.

2. **No repository: offer `git init`, then stop.** When a delivery-chain skill runs outside a Git repository, it says the chain needs one and offers to create it, writing nothing first. On a yes it runs `git init` and continues. On a no it keeps confirmed content in the conversation (as `explore` already does when the `start` bootstrap fails) and stops. `start` keeps creating its own repository. `board` keeps its exit message and names the offer. `write-agents` owns the shared wording, and each chain skill points to it rather than restating it.

3. **Rename pull-request mode to GitHub mode.** The `Delivery:` line records `github` or `local`. The block helper reads `pull-request`, `pr`, `pullrequest`, and `pull requests` as `github`, so existing blocks keep working, and it writes `github` the next time it rewrites a block. The one-run override phrases stay ("ship it with a PR", "build it local") and gain "with GitHub". Current documents, skills, tests, and evals say "GitHub mode". Historical specs and decisions keep their wording.

4. **The delivery question waits for the chain.** It is asked the first time a delivery-chain skill needs the answer (the current rule, made explicit). A thinking skill never asks it, even as the first command in a project. With no remote, `github` is never suggested, and choosing `github` with no GitHub remote gets a one-line note that issues and pull requests need one before `to-spec` accepts.

## User Stories

1. As a writer in a plain notes folder, I say "grill me" and get questions, with no mention of Git or delivery.
2. As a developer in a folder with no repository, I say "explore this". `explore` tells me the delivery chain needs Git and offers `git init`. I say yes, and the brief is committed on `explore/<slug>`.
3. As a developer who says no to `git init`, I keep the confirmed brief in the conversation and nothing is written.
4. As an existing adopter whose block says `Delivery: pull-request`, I say "build it" and get GitHub mode with no question. The next block rewrite says `Delivery: github`.
5. As a GitLab user, I read the requirements table, choose local delivery, and run the whole chain from spec to ship.
6. As a developer who answers "github" in a repository with no remote, I'm told issues and pull requests need a GitHub remote before acceptance.

## Implementation Decisions

- **Normalizer.** In [`flow-block.mjs`](../../skills/flow/lib/flow-block.mjs), `DELIVERY_MODES` becomes `['github', 'local']`. `normalizeDelivery` maps the legacy values listed in Solution 3 to `github`. The CLI's error lists the new values. `board.mjs` reads the mode through the same normalizer, so an unset line in a repository with a remote counts as `github`.
- **One home for the no-repository rule.** `write-agents` gets a short "Repository" rule: delivery-chain skills check `git rev-parse --is-inside-work-tree` before writing anything, offer `git init`, and stop on no. Chain skills link to it.
- **Wording sweep.** "Pull-request mode" becomes "GitHub mode" in the files that use it today: `build`, `ship`, `to-spec`, `to-tasks`, `board` (skill and script), `explore`, `review`, `GLOSSARY.md` (the Delivery mode entry and its cross-references), `PRODUCT.md`, README, `docs/skills.md`, `docs/methodology.md`, `docs/agent-compatibility.md`, and the tests and evals that quote it. `build`'s Delivery mode section stays the one home of the delivery rule.
- **Exposure:** skills run inside the user's local agent session. No service is deployed, nothing is reachable by others, and no write path exists outside the user's own repository and, in GitHub mode, their GitHub repository under their own credentials.

## Testing Decisions

- `tests/flow-block.test.mjs`: legacy values read as `github`; a rewrite writes `github`; `local` is unchanged; an unknown value is still rejected.
- `tests/board.test.mjs`: an unset line with a remote is GitHub mode, and without one it is local.
- Smoke contracts pin the no-repository wording in `write-agents` and the pointer from each chain skill, as they pin the size guard.
- `pnpm validate` and `pnpm test` pass, and a grep of current documents (outside `docs/archive/`, historical specs, and decisions) finds no "pull-request mode".

**Acceptance scenario.** Actor: a developer with Flow installed. Starting state: an empty temp folder with no `.git`, and a second repository whose `AGENTS.md` Flow block says `Delivery: pull-request`. All steps are local; none writes to a deployment.

1. In the empty folder, say "grill me about a habit tracker". You get questions, with no Git or delivery prompt.
2. In the same folder, say "explore this". `explore` says the delivery chain needs a Git repository and offers `git init`. Nothing is written yet.
3. Answer no. Nothing is written and no `.git` exists.
4. Say "explore this" again and answer yes. `.git` exists, you're asked the delivery question with `local` suggested (no remote), and the confirmed brief is committed on `explore/<slug>`.
5. In the second repository, say "set up Flow here". There is no delivery question, and the rewritten block says `Delivery: github`.

## Out of Scope

- Hosts other than GitHub for issues and pull requests (GitLab merge requests, Jira). Local mode is the path for them.
- Making `explore` or `to-spec` work without Git by writing files to the working folder.
- Changes to depth: decision 0036 settled it.

## Further Notes

Open assumptions:

- **Initial commit after `git init`.** `explore` cuts its branch from the default branch, which has no commit in a new repository. Assumed: the skill makes an empty initial commit (`chore: initialize repository`) and leaves existing files untracked rather than committing the user's files unasked.
- **`prototype` is a thinking skill.** It writes throwaway code and uses a branch when one exists, but works without Git. Assumed to belong in the Thinking tier.
- **"github" as the term.** Chosen over "remote" (clashes with `git remote`, which local mode uses) and "pull requests" (names one feature of the mode). See decision 0037.
