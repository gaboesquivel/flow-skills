# 0005. Misc group and tldr skill

Status: accepted (2026-10-27)

## Context

Users need a lightweight way to recap a long session and confirm the agent still shares their goal. Dense prose recaps are easy to skim past; a visual-first answer matches how many hosts already present summaries.

## Decision

- Add catalog group **Misc** for session utilities that are not delivery, discovery, or writing.
- Ship **`tldr`**: summarize the conversation, surface alignment gaps, and respond primarily with Mermaid diagrams and Markdown tables; keep prose minimal and apply `write-humans` only for short labels and a one-sentence verdict.

## Consequences

- Validator and tests include `tldr` in the fixed skill list (thirteen skills after 0004's twelve).
- Further misc skills may join the same group without implying a workflow dependency on delivery skills.

## Supersedes

Partially extends the skill list in [0004](0004-portable-skill-catalog.md); 0004's portable-catalog and install decisions remain in force.
