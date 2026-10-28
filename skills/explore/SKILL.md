---
name: explore
description: Understand the problem, users, repository context, and consequential uncertainty before planning or building. Use when the user says "explore this", "help me understand", or "what are we missing".
disable-model-invocation: false
---

# Explore

Explore is the discovery lane for new products and for features inside an existing product. Read supplied briefs, conversation, canonical product documents, and relevant code before asking anything. Recover facts with available tools; ask only for choices or missing information you cannot infer.

## Propose a depth

Classify the work (new product, feature, or fix) and propose one tier with a one-line reason. The user confirms or overrides. Prefer the lighter tier when unsure; propose stepping up mid-session only when evidence warrants it.

- **Skip:** fixes and clear small changes. No questions, no writes; hand back to the requested work.
- **Lite** (default for new work): confirmed intent, the riskiest assumption, a kill criterion, one main metric ("unknown, measure first" is acceptable), 1–3 core journeys in one line each, and three alternatives including the status quo.
- **Full** (opt-in): Lite plus a pre-mortem, `jtbd`, a `competitors` report, 2–3 solution approaches including a minimal one, and saved research.

## Extract, then challenge

Follow the `interview` pattern, including its question forms, until you can predict the user's next three answers. Restate intent and get an explicit yes before any challenge. Then follow `grill` on the riskiest claims only; at Full depth, include its pre-mortem. Do not re-extract confirmed intent. If a supporting skill is missing, apply the same order directly.

## Outcome and write gate

End in one outcome, using `grill`'s meanings: **brief**, **clearer**, or **killed**. All three are valid; clearer and killed write nothing.

For a brief, show the exact text before writing:

- **New product:** the full `PRODUCT.md` brief: problem, who, why now, riskiest assumptions with confidence, main metric and kill criterion, core journeys (one line each; steps belong in `DESIGN.md`), alternatives, out of scope.
- **Feature:** a diff of durable product facts only (a new user, journey, or metric). Feature detail flows to `to-spec`, not `PRODUCT.md`.

Label unproven items as hypotheses with a confidence. An explicit yes to the shown text authorizes that write in the same turn; anything else is not a yes. Never write drafts before confirmation.

At Full depth, or whenever real web research happened, save findings with sources and limits to `docs/research/YYYY-MM-DD-topic.md`. Never save transcripts.

## Spec-ready

Report spec-ready when intent is confirmed, the riskiest assumption and kill criterion are named, and the brief or diff is written or declined. Otherwise say what is missing. Close with known facts, open assumptions, how many marked guesses were accepted unchanged, and the next activity (for example `to-spec`). Missing optional skills must not block exploration.

Discussion and exploration do not authorize implementation.
