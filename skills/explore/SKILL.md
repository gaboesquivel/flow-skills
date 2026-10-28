---
name: explore
description: Understand the problem, users, repository context, and consequential uncertainty before planning or building. Use when the user says "explore this", "help me understand", or "what are we missing".
disable-model-invocation: false
---

# Explore

Explore is the discovery lane for new products and for features inside an existing product. Read supplied briefs, conversation, canonical product documents, and relevant code before asking anything. Recover facts with available tools; ask only for choices or missing information you cannot infer.

Before a multi-step run, suggest the host's autonomous permission mode when it has one (for example Claude Code auto mode) so file writes, issues, and pushes do not stop for each permission prompt. Elsewhere, continue with ordinary prompts. The skill's own confirmations still apply.

## Propose a depth

Classify the work (new product, feature, or fix) and propose one tier with a one-line reason. A new-product run handed over by `start` uses Full unless the user picks another tier. The user confirms or overrides. Prefer the lighter tier when unsure; propose stepping up mid-session only when evidence warrants it.

- **Skip:** fixes and clear small changes. No questions, no writes; hand back to the requested work.
- **Lite** (default for new work): confirmed intent, the riskiest assumption, a kill criterion, one main metric ("unknown, measure first" is acceptable), 1–3 core journeys in one line each, three alternatives including the status quo, and the **agent lens**: who the agent users are, with an agent journey beside the human ones and agent alternatives, or an explicit "no agent users".
- **Full** (opt-in): Lite plus a pre-mortem, `jtbd`, a `competitors` report, 2–3 solution approaches including a minimal one, and saved research (below).

## Extract, then challenge

Follow the `interview` pattern, including its question forms, until you can predict the user's next three answers. Restate intent and get an explicit yes before any challenge. When the user confirms, end the turn as `interview` does, but name the grill as the next step and start it on their reply; that yes confirms intent only and authorizes no write. Then follow `grill` on the riskiest claims only; at Full depth, include its pre-mortem. If a supporting skill is missing, apply the same order directly.

## Outcome and write gate

End in one outcome: **brief** (`grill`'s resolved direction), **clearer**, or **killed**. All three are valid; clearer and killed write nothing.

For a brief, show the exact text before writing:

- **New product:** the full `PRODUCT.md` brief: problem, who (including agent users or "none"), why now, riskiest assumptions with confidence, main metric and kill criterion, core journeys (one line each; steps belong in `DESIGN.md`), alternatives, out of scope.
- **Feature:** a diff of durable product facts only (a new user, journey, or metric). When the project has no `PRODUCT.md`, propose creating it with those facts. Feature detail flows to `to-spec`, not `PRODUCT.md`.

Label unproven items as hypotheses with a confidence. An explicit yes to the shown text authorizes that write in the same turn; anything else is not a yes. Never write drafts before confirmation.

**Write after the bootstrap commit.** In a run handed over by `start`, write nothing (brief, research, specs, or issues) until the bootstrap lane reports its initial commit, even after a yes; the yes to the shown text carries over to that write. The confirmed brief then replaces the product sections of the baseline `PRODUCT.md` and keeps its template facts. If the bootstrap failed, keep everything confirmed in conversation and write it once a repository exists.

At Full depth, or whenever real web research happened, save findings with sources and limits to `docs/research/YYYY-MM-DD-topic.md`. Never save transcripts.

## Spec-ready

Report spec-ready when intent is confirmed, the riskiest assumption and kill criterion are named, and the brief or diff is written, declined, or waiting for the bootstrap commit; a clearer outcome is spec-ready once its sharpened intent is restated. Otherwise say what is missing. Close with known facts, open assumptions, how many marked guesses were accepted unchanged, and the next activity. Missing optional skills must not block exploration.

Once spec-ready with a brief, write the spec with `to-spec` to `docs/specs/NNN-short-name.md` and publish its tasks as GitHub issues with `to-tasks`; reaching spec-ready is the request to save. `ship` groups the results into pull requests.

**New product specs.** Write only the first vertical slice (spec 001 in a new repository) in full, with its tasks. Slice 1 must test the riskiest assumption, ship the instrumentation for the main metric, and define its capability contract-first as `to-spec` describes, including an MCP tool when the brief names agent users. Write later slices as `candidate` stubs with `to-spec`; flesh them out only after slice 1 ships. In a new product, the brief, research, and specs ship with spec 001's implementation.

Discussion and exploration do not authorize implementation.
