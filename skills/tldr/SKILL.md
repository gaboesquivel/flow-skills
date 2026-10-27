---
name: tldr
description: Summarize the session and check user–agent alignment in a visual, ultra-brief form. Use when the user asks for a tldr, recap, where we are, or whether you are still aligned.
disable-model-invocation: true
---

# TL;DR

Recover the conversation the user names. If none is named, use the current session. Use available transcript or session tools when the host provides them.

## Decide what matters

Infer the user's goal, what changed, what is decided versus still open, and whether the agent is authorized for the next step. Separate facts from inference. Flag misalignment when the thread drifted, assumptions hardened without confirmation, or work ran ahead of authorization.

## Respond visually first

Answer like a **show me** request: diagrams and charts carry the message; prose is minimal.

1. **Route the output** (same spirit as compact in-conversation visualization):
   - **Mermaid** for goal → progress → next step, branching decisions, or containment (what is in / out of scope).
   - **Markdown table** for alignment checks: topic, user intent, agent understanding, status (aligned / unclear / drift).
   - **Short labels only** on diagrams and table cells — no paragraph under the visuals unless the user asked for narrative.

2. **Keep text scarce.** When words are required (titles, legend, one-line verdict), apply [Write Humans](../write-humans/SKILL.md): lead with the point, concrete nouns, no filler, no invented facts or promises.

3. **Optional host visualization.** If the environment supports rich inline HTML charts or a visualize-style skill, prefer that for comparative or numeric session facts; otherwise Mermaid and tables are enough.

## Completion

End with at most **one** plain-language sentence: aligned, needs clarification, or blocked — and the single best next question or action if not aligned.

Summarizing does not authorize new implementation, file edits, or sending messages unless the user already authorized that work.
