# 0037 — Git for delivery, GitHub for GitHub mode

Status: **Accepted** (2026-10-28). Amends [0030](0030-asked-delivery-and-local-mode.md) (the delivery mode names; when delivery is asked). Spec: [023](../specs/023-git-and-github-requirements.md). Amended by [0044](0044-fast-delivery.md) (delivery is inferred from the remote and `gh` access, never asked).

## Context

Flow never states what it needs from the environment. Since [spec 021](../specs/021-demo-findings.md) the delivery chain commits from its first step (`explore` writes on an `explore/` branch), but only `start` and `board` handle a folder with no repository. The delivery modes are recorded as `pull-request` and `local`, though what separates them is whether GitHub issues and pull requests are used: local mode may still push to a remote. The maintainer's working assumption was that Flow is GitHub-based. Half the catalog, though, is thinking skills that are useful with no repository at all.

## Decision

1. **Three tiers.** Thinking skills need nothing. The delivery chain (`flow`, `start`, `explore`, `to-spec`, `to-tasks`, `build`, `review`, `ship`, `board`) needs a Git repository. GitHub mode additionally needs GitHub access. `PRODUCT.md` owns the table.
2. **No repository: offer `git init`, then stop.** A delivery-chain skill outside a repository writes nothing, offers `git init`, and continues only on a yes.
3. **`github` and `local`.** The `Delivery:` line records `github` or `local`. Legacy `pull-request` values are read as `github` and rewritten on the next block write. Current documents say "GitHub mode"; historical records keep their wording.
4. **Asked by the chain only.** The delivery question is asked the first time a delivery-chain skill needs it, never by a thinking skill.

## Alternatives

- **GitHub required for all of Flow.** Rejected: it would make local mode pointless and cut off GitLab, Bitbucket, and no-remote users who run the whole chain today.
- **Git required for all of Flow.** Rejected: the thinking skills gain nothing from it and lose uses in chats and plain folders.
- **Name the modes `local` and `remote`.** Rejected: local mode uses a Git remote too ("ship it" pushes `main`), so the pair misdescribes it and clashes with Git's own term.
- **Keep `pull-request`.** Rejected: it names one GitHub feature the mode uses, not the dependency that decides between the modes.
- **Ask delivery on any first command.** Rejected: a "grill me" in a fresh project would get a question it does not need.

## Consequences

- Existing Flow blocks keep working; they read as `github` and change on the next rewrite.
- A wide wording sweep across skills, the glossary, product docs, tests, and evals, done once.
- Every delivery-chain skill gains a repository check that runs before it writes anything.
