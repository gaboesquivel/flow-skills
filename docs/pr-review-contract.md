# Pull request review contract

Agent-agnostic checklist for reviewing a pull request in a Flow-shaped repository. Matches the obligations of the **`review`** and **`flow`** skills plus [maintain connected context](methodology.md#maintain-connected-context). Use this file in any IDE or host; GitHub Actions in this repository run only the deterministic checks.

## Scope

- Compare `merge-base(base, head)` through `head` (the PR diff). State the actual base and head refs when reporting.
- Treat documentation, specs, marketing copy, and skills the same as application code: all are pull requests.
- Include renames and new files. Read untracked content only when it is part of the PR branch.

## Inspect

Recover intent from the PR title and description, relevant specs under `docs/specs/`, decision records under `docs/decisions/`, tests, and root context files.

Assess the change on the five review axes the [`review` skill](../skills/review/SKILL.md) defines: correctness, readability, architecture, security, and performance. Skip any the change cannot affect.

Distinguish confirmed defects from risks and preferences. A passing structural test suite is not proof of intent alignment.

For consequential changes, state observable behavior, affected callers beyond the diff, the safety-critical assumption, and executable evidence when practical. Label findings as confirmed, plausible risk, or preference. Qualify assumptions that were not verified.

## Align

When the change affects product intent, experience, architecture, or shared vocabulary:

- Root context (`PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md`) must still match or be updated in the same PR.
- Do not replace a project's product identity with Flow's methodology identity (see [decision 0009](decisions/0009-adopter-product-context.md)).
- Link to specs or decisions instead of duplicating durable rationale.

Bounded durable work should add or update a spec under `docs/specs/` when appropriate; significant rationale belongs in `docs/decisions/`.

## Automated output (LLM)

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
- The reviewer fails when `verdict` is `fail`, any finding has `severity: blocking`, the diff cannot be read, or the response is not a `pass` or `fail` verdict.

## Deterministic checks (this repository)

`pnpm validate` checks skills, documentation links, and that every spec and decision is well named, uniquely numbered, and linked from its index. Run it before opening a pull request.

## LLM review on request (maintainers)

Configure in the GitHub repository (not in the npm skills package):

| Secret | Purpose |
| --- | --- |
| `FLOW_REVIEW_API_KEY` | Bearer token for an OpenAI-compatible API |
| `FLOW_REVIEW_API_BASE` | Optional base URL (default: `https://api.openai.com/v1`) |
| `FLOW_REVIEW_MODEL` | Model id (default: `gpt-4o-mini` if unset) |

CI makes no model calls. Run the reviewer on request with these variables exported: `node scripts/run-context-review.mjs --base <merge-base> --head <sha> [--pr-number N]`. With `FLOW_PR_TITLE`, `FLOW_PR_BODY`, and `FLOW_PR_LABELS` set, it includes them in the prompt; with `--pr-number` and `GH_TOKEN`, it comments on the pull request.

## Trust boundary

Run the reviewer script and this contract from the base commit and read the head only as git data, so a pull request cannot change its own review ([decision 0047](decisions/0047-trusted-review-and-local-record-checks.md)). Only rate limits, timeouts, and server errors count as an outage: after one retry the reviewer warns, comments that it skipped, and passes. Any other API error, a refusal, or a response that is not a verdict fails.

`main` requires a pull request and passing `validate (ubuntu-latest, 22)` and `pr-title` checks; `context-review` is not required. Direct pushes to `main` are rejected.

Review is read-only unless the author requests fixes. Automated comments do not authorize commits on behalf of the reviewer.
