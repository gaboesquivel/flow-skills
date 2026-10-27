# Pull request review contract

Agent-agnostic checklist for reviewing a pull request in a Flow-shaped repository. Matches the obligations of the **`review`** and **`flow`** skills plus [maintain connected context](methodology.md#maintain-connected-context). Use this file in any IDE or host; GitHub Actions in this repository enforce a subset automatically.

## Scope

- Compare `merge-base(base, head)` through `head` (the PR diff). State the actual base and head refs when reporting.
- Treat documentation, specs, marketing copy, and skills the same as application code: all are pull requests.
- Include renames and new files. Read untracked content only when it is part of the PR branch.

## Inspect

Recover intent from the PR title and description, relevant specs under `docs/specs/`, decision records under `docs/decisions/`, tests, and root context files.

Assess:

- **Correctness and intent** — missing requirements, regressions, broken links or references, failure paths, unsafe side effects, and test coverage for changed behavior.
- **Maintainability** — duplication, misleading names, unnecessary abstraction, and conventions documented for the repository.

Distinguish confirmed defects from risks and preferences. A passing structural test suite is not proof of intent alignment.

For consequential changes, state observable behavior, affected callers beyond the diff, the safety-critical assumption, and executable evidence when practical. Label findings as confirmed, plausible risk, or preference. Qualify assumptions that were not verified.

## Align

When the change affects product intent, experience, architecture, or shared vocabulary:

- Root context (`PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md`) must still match or be updated in the same PR.
- Do not replace a project's product identity with Flow's methodology identity (see [decision 0009](decisions/0009-adopter-product-context.md)).
- Link to specs or decisions instead of duplicating durable rationale.

Bounded durable work should add or update a spec under `docs/specs/` when appropriate; significant rationale belongs in `docs/decisions/`.

## Automated output (LLM and CI)

When an automated reviewer runs this contract, respond with **only** JSON (no markdown fence):

```json
{
  "verdict": "pass",
  "findings": [
    {
      "severity": "blocking",
      "path": "relative/path or empty",
      "message": "what is wrong",
      "suggestion": "smallest fix"
    }
  ]
}
```

- `verdict`: `pass` or `fail`.
- `findings[].severity`: `blocking` or `advisory`.
- CI fails the check when `verdict` is `fail`, any finding has `severity: blocking`, the diff cannot be read, or `verdict` is not `pass` or `fail`.

## Deterministic checks (this repository)

`node scripts/check-pr-alignment.mjs --base <sha> --head <sha>` enforces path rules documented at the top of that script. Local dry-run before pushing:

```bash
git fetch origin main
node scripts/check-pr-alignment.mjs --base "$(git merge-base origin/main HEAD)" --head HEAD
```

## LLM review secrets (maintainers)

Configure in the GitHub repository (not in the npm skills package):

| Secret | Purpose |
| --- | --- |
| `FLOW_REVIEW_API_KEY` | Bearer token for an OpenAI-compatible API |
| `FLOW_REVIEW_API_BASE` | Optional base URL (default: `https://api.openai.com/v1`) |
| `FLOW_REVIEW_MODEL` | Model id (default: `gpt-4o-mini` if unset) |

The `context-review` workflow job runs on every pull request. When `FLOW_REVIEW_API_KEY` is present on same-repository pull requests, it calls the API with the PR title, body, and labels. Fork pull requests never receive repository secrets; the job skips the API call and passes. Deterministic alignment still runs on all pull requests.

## Escape hatches (maintainers)

- Label `alignment-exempt` skips the deterministic alignment rules except filename shape and broken in-skill links.
- A line of its own, `Alignment: docs-only`, skips only the root-context spec-or-decision requirement, and only when every changed path is a root context path listed at the top of `scripts/check-pr-alignment.mjs`. Quoting that phrase inside a sentence does not exempt the PR.
- Adding or removing the label, or editing the PR title or body, reruns the check.

`main` requires a pull request and passing `alignment`, `validate`, and `context-review` checks before merge when `FLOW_REVIEW_API_KEY` is configured. Direct pushes to `main` are rejected.

Review is read-only unless the author requests fixes. Automated comments do not authorize commits on behalf of the reviewer.
