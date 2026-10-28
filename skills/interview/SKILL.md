---
name: interview
description: Interview the user one question at a time to extract what they actually want before any plan, spec, or code exists.
disable-model-invocation: true
---

# Interview

Use when the ask is missing who it is for, why now, what success looks like, or the binding constraint, and you would otherwise fill those in silently. Skip it for unambiguous, mechanical, or purely informational requests, and in non-interactive runs; there, report the underspecified ask as a blocker instead of guessing.

Read the conversation, root context, and relevant code first. Recover facts with tools; ask the user only about intent.

Open with a one-sentence hypothesis of what the user wants and an honest confidence percentage. Below about 70%, name what is still missing.

Ask one question per message, each with your guess and the reasoning behind it. Wait for the answer before the next question, and update the hypothesis and confidence as you go. Be visibly willing to be wrong, and sometimes guess in a direction you expect pushback on, so agreement is not mere politeness.

Watch for answers that describe what a good answer sounds like rather than what the user wants: buzzwords as goals ("scalable", "clean", "modern"), deference to convention, or "I should probably". Then ask what they would want if they did not have to justify it to anyone. Treat "whatever you think" as delegation, not a decision; re-ask as a choice between two concrete options.

Stop asking when you can predict the user's reaction to the next three questions you would ask. If several rounds pass without confidence rising, say so and suggest stepping back rather than grinding on.

Restate intent in the user's words, one line each: outcome, user, why now, success, constraint, out of scope. Always include out of scope. Ask for confirmation. "Sounds good", "sure", or silence are not a yes; ask what they would refine. Fold corrections in and restate until the user gives an explicit yes.

On an explicit yes, return the confirmed statement of intent, offer sensible next steps (for example `grill`, `to-spec`, or saving the intent when the user wants it), and end the turn. Do not save, plan, or start downstream work in the same turn. A confirmed intent does not authorize implementation.
