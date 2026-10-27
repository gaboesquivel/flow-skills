---
status: accepted
category: process
date: 2026-10-27
supersedes: 0001-curated-distribution.md (upstream maintenance, setup dependency, and installation/composition details)
---

# Maintain Flow skills as local source

## Context

The user directed Flow to own copied skill implementations without upstream skill dependencies and remain agent/UI agnostic. The [distribution review](../research/2026-10-27-distribution-review.md) found that release-time synchronization could overwrite local changes, inherited workflows disagreed, and local installation depended on registry access.

## Decision

Maintain `skills/` as authoritative source. Retire upstream fetching, patching, and active lock/manifest machinery. Preserve exact applicable source notices and origin revisions as attribution, not an update mechanism. Review external ideas as ordinary source changes.

Install the bundled skill trees offline, using `.agents/skills` by default or an explicitly selected project-relative location. Record actual version and content hashes, preserve customized files, and verify the installed artifact. Installation and broader product-context initialization are distinct capabilities.

Keep explicit workflow activation. Supporting local file reads are permitted within the selected workflow; they do not activate unrelated workflows or authorize new side effects. Use capability-based instructions with direct/sequential fallbacks. Remove mandatory upstream setup, tracker labels, vendor tool names, and exhaustive approval ceremonies. Existing user authorization governs delivery actions.

Use `write-for-agents` and `write-for-humans`. Keep the flat namespace and unified `docs/decisions/` convention from decision 0001. This record supersedes only the conflicting portions of that historical decision.

## Rationale and consequences

Local source can evolve coherently without reapplying fragile patches. An offline installer tests what is actually shipped and keeps publication separate from setup. Original authorship remains visible. This does not establish product value or identical behavior across agent hosts; live host evaluations remain required before compatibility or release-readiness claims.

Automatic imports and maintaining a permanent patch layer were rejected because they preserve the coupling the user asked to remove. A new orchestration framework or mandatory process-management system is outside this change.
