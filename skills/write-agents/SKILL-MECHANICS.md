# Skill mechanics

Flow uses explicit workflow activation: a user can request a skill by name or the host's supported syntax. `disable-model-invocation: true` and optional adapter metadata express that policy where supported; hosts may interpret metadata differently. Verify actual host behavior before claiming support.

An activated skill may read linked local supporting instructions needed for its task. This is ordinary context loading, not a required nested skill invocation and not authorization to execute unrelated workflows. Bundle required support locally; optional tools must have a direct or sequential fallback.

Keep the entrypoint focused on scope, actions, authority, and completion evidence. Move branch-specific examples or techniques into clearly linked files. Keep names and descriptions consistent with the directory and any adapter metadata. Validate references in the packaged artifact, not only the source checkout.

When a repeated agent mistake appears in this repository, prefer fixing it at the highest level that works: architecture that eliminates the invalid operation, then types or deterministic checks, then executable tests, then agent guidance. Do not add prose by default when a check could enforce the rule.
