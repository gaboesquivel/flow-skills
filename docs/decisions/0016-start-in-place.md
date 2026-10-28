# 0016 — Start bootstraps in place and reads the template from the request

Status: **Accepted** (2026-10-27). Related: [0010](0010-optional-start-skill.md), [0012](0012-start-bootstrap-lib.md).

## Context

The recommended sequence is install Flow Skills, then invoke `start`. Installing skills, or adding `AGENTS.md` and `CLAUDE.md` first, leaves the project root nonempty. `assessDestination` refused any nonempty directory, so an agent bootstrapped into a nested `app/` folder instead of the root. The skill also asked for the template even when the invocation named it ("flow nextjs app").

## Decision

- A destination holding only agent setup (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.claude/`, `.agents/`, `.cursor/`, `skills-lock.json`) counts as empty. The current directory is the default destination.
- The template is copied around existing files with `copyTemplateInto`; adopter files always win and template duplicates are reported as skipped.
- Other files block until the user confirms keeping them (`preserve`). Existing Git history still blocks.
- `inferTemplateFromRequest` picks flow-next or flow-mono from the invocation; the skill asks only for missing inputs.
- The stale-identifier scan skips installed skill directories.

## Consequences

- The recommended install-then-`start` sequence produces a project at the root, with the adopter's instruction files and installed skills untouched.
- A root with committed history (for example a committed `AGENTS.md`) still stops; bootstrapping on top of history remains out of scope.
