---
name: explore
description: Understand the problem, users, repository context, and consequential uncertainty before planning or building. Use when the user says "explore this", "help me understand", or "what are we missing".
disable-model-invocation: false
---

# Explore

Explore is the discovery lane for new products and for features inside an existing product. Recover facts with available tools; ask only for choices or missing information you cannot infer.

Before a multi-step run, suggest the host's autonomous permission mode when it has one, so writes do not stop at every permission prompt. The confirmation gates below still apply.

## Read in the background

On arrival, read the supplied brief and conversation in the main thread, then launch read-only background workers as `write-agents` Workers describes, while the main thread asks the first question:

- repository and root context (product documents and relevant code)
- glossary terms and decisions the request may conflict with
- prior art (existing specs, research, and similar features)
- in a run handed over by `start`, the bootstrap lane's status

Fold their results in as they return; drop a question a result answers, and raise a conflict they find at the next turn. Without workers, run the same reads in order before the first question and say so. Questions and all writes stay in the main thread.

## Propose a depth

Classify the work (new product, feature, or fix) and propose one tier with a one-line reason. New work defaults to the project's recorded process depth: the `Process:` line in its Flow block (decision 0026). A run handed over by `start` uses the depth and delivery confirmed there. The user confirms or overrides for this run.

**Question round.** When `Process:` or `Delivery:` is `unset`, or there is no Flow block, ask the missing ones together in one round, each with a suggested answer: **Lite or Full** (suggest Lite unless the request points to Full), and **pull requests or local** (`build`'s Delivery mode owns the rule: state pull-request mode without asking when the default branch requires pull requests; otherwise suggest pull requests with a GitHub remote and local without one). Ask once per run. Offer to record the answers on the Flow block with `flow`; without a block or a yes, they hold for this run. Skip work asks nothing. Prefer the lighter tier when unsure; propose stepping up mid-session only when evidence warrants it.

- **Skip:** fixes and clear small changes. No questions, no writes; hand back to the requested work.
- **Lite** (the suggested default): confirmed intent, the riskiest assumption, a kill criterion, one main metric ("unknown, measure first" is acceptable), 1–3 core journeys in one line each, three alternatives including the status quo, and the **agent lens**: who the agent users are, with an agent journey beside the human ones and agent alternatives, or an explicit "no agent users".
- **Full** (opt-in): Lite plus a pre-mortem, `jtbd`, a `competitors` report, 2–3 solution approaches including a minimal one, saved research (below), and decision records (below).

## Extract, then challenge

Follow the `interview` pattern, including its question forms, until you can predict the user's next three answers. Restate intent and get an explicit yes before any challenge. When the user confirms, end the turn as `interview` does, but name the grill as the next step and start it on their reply; that yes confirms intent only and authorizes no write. Then follow `grill` on the riskiest claims only. At Full depth, after the intent yes, run `jtbd`, `competitors`, and the pre-mortem as parallel read-only workers; then grill in the main thread while one worker drafts the solution approaches and the research file's text for the write gate. Without workers, run them in that order and say so. If a supporting skill is missing, apply the same steps directly.

## Outcome and write gate

End in one outcome: **brief** (`grill`'s resolved direction), **clearer**, or **killed**. All three are valid; clearer and killed write nothing.

For a brief, show the exact text before writing:

- **New product:** the full `PRODUCT.md` brief: problem, who (including agent users or "none"), why now, riskiest assumptions with confidence, main metric and kill criterion, core journeys (one line each; steps belong in `DESIGN.md`), alternatives, out of scope.
- **Feature:** a diff of durable product facts only (a new user, journey, or metric). When the project has no `PRODUCT.md`, propose creating it with those facts. Feature detail flows to `to-spec`, not `PRODUCT.md`.

Label unproven items as hypotheses with a confidence. An explicit yes to the shown text authorizes that write in the same turn; anything else is not a yes. Never write the brief before confirmation.

**Write after the bootstrap commit.** In a run handed over by `start`, write nothing (brief, research, specs, or tasks) until the bootstrap lane reports its initial commit, even after a yes; the yes to the shown text carries over to that write. The confirmed brief then replaces the product sections of the baseline `PRODUCT.md` and keeps its template facts. If the bootstrap failed, keep everything confirmed in conversation and write it once a repository exists.

At Full depth, or whenever real web research happened, save findings with sources and limits to `docs/research/YYYY-MM-DD-topic.md`. Never save transcripts.

**Decision records at Full depth.** Propose a decision record, as `to-spec` defines the boundary, for each choice among real alternatives made during exploration, starting with the chosen approach and the rejected ones as alternatives. Once the brief is confirmed, write each record as **Proposed** and report its link rather than its text, under the same write-after-commit rule; `to-spec` links it from the spec and accepts it with the spec. At Lite depth, choices stay in the spec unless they pass `to-spec`'s decision test.

## Spec-ready

Report spec-ready when intent is confirmed, the riskiest assumption and kill criterion are named, and the brief or diff is written or waiting for the bootstrap commit; a clearer outcome is spec-ready once its sharpened intent is restated. A declined brief is not spec-ready for writing specs. Otherwise say what is missing. Close with known facts, open assumptions, how many marked guesses were accepted unchanged, and the next activity. Missing optional skills must not block exploration.

Once spec-ready with a brief, name the next steps and wait for the user: `to-spec` for `docs/specs/NNN-short-name.md`, "accept the spec", then `to-tasks`.

**New product specs.** At any depth, write only spec 001 in full: the first bet, with its tasks as the slices inside it (decision 0026). Spec 001 must test the riskiest assumption, ship the instrumentation for the main metric, and define its capability contract-first as `to-spec` describes, including an MCP tool when the brief names agent users. Write later bets as `candidate` stubs with `to-spec`; flesh them out only after spec 001 ships. In a new product, the brief, research, and specs ship with spec 001's implementation.

Discussion and exploration do not authorize implementation.
