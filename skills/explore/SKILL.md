---
name: explore
description: Understand the problem, users, repository context, and consequential uncertainty before planning or building. Use when the user says "explore this", "help me understand", or "what are we missing".
disable-model-invocation: false
---

# Explore

Explore is the discovery lane for new products and for features inside an existing product. Recover facts with available tools; ask only for choices or missing information you cannot infer.

Before a multi-step run, suggest the host's autonomous permission mode when it has one, so writes do not stop at every permission prompt. The confirmation gates below still apply.

## Read in the background

On arrival, read the supplied brief and conversation in the main thread, then launch read-only background workers while the main thread asks the first question (fan-out rule: `write-agents` Workers). Launch only readers whose sources exist; a project `start` just created has nothing for them, and in a run handed over by `start` the bootstrap lane's report replaces any status reader:

- repository and root context (product documents and relevant code)
- glossary terms and decisions the request may conflict with
- prior art (existing specs, research, and similar features)

Fold their results in as they return; drop a question a result answers, and raise a conflict they find at the next turn. Questions and all writes stay in the main thread.

## Depth

Classify the work (new product, feature, or fix). Fixes and clear small changes are **Skip**: no questions, no writes; hand back to the requested work. Everything else gets the one default depth (decision 0036); never ask for a depth:

- confirmed intent, the riskiest assumption, a pre-mortem, a kill criterion, one main metric ("unknown, measure first" is acceptable) plus any supporting metrics the user names, 1–3 core journeys in one line each, alternatives including the status quo, and the **agent lens**: who the agent users are, with an agent journey beside the human ones and agent alternatives, or an explicit "no agent users".

Deeper discovery runs only when the user asks for it (`competitors`, `jtbd`). When evidence warrants one, suggest it in a single line; never run it unasked.

**Delivery.** A run handed over by `start` uses the delivery confirmed there. Otherwise, when the Flow block's `Delivery:` is `unset` or there is no Flow block, ask it once per run, GitHub (issues and pull requests) or local, with a suggestion as `build`'s Delivery mode section describes (if `build` is unavailable, ask without a suggestion). Offer to record the answer on the Flow block with `flow`; without a block or a yes, it holds for this run.

## Extract, then challenge

Follow the `interview` pattern, including its question forms, until you can predict the user's next three answers. Restate intent and get an explicit yes before any challenge. When the user confirms, end the turn as `interview` does, but name the grill as the next step and start it on their reply; that yes confirms intent only and authorizes no write. Then follow `grill` on the riskiest claims only. After the intent yes, run the pre-mortem as one read-only worker (fan-out rule: `write-agents` Workers) while the grill proceeds in the main thread, and fold its failure modes into the grill. The pre-mortem runs once: `grill` skips its own pre-mortem worker because one already ran. Without workers, or if a supporting skill is missing, apply the same steps directly.

## Outcome and write gate

End in one outcome: **brief** (`grill`'s resolved direction), **clearer**, or **killed**. All three are valid; clearer and killed write nothing.

For a brief, show the exact text before writing:

- **New product:** the full `PRODUCT.md` brief: problem, who (including agent users or "none"), why now, riskiest assumptions with confidence, main metric and kill criterion, core journeys (one line each; steps belong in `DESIGN.md`), alternatives, out of scope.
- **Feature:** a diff of durable product facts only (a new user, journey, or metric). When the project has no `PRODUCT.md`, propose creating it with those facts. Feature detail flows to `to-spec`, not `PRODUCT.md`.

Label unproven items as hypotheses with a confidence. An explicit yes to the shown text authorizes that write in the same turn; anything else is not a yes. Never write the brief before confirmation.

**Explore branch.** Outside a Git repository, follow `write-agents` [Repository](../write-agents/SKILL.md#repository) before writing. Write on a new `explore/<slug>` branch cut from the default branch, never on the default branch itself: the brief's product slug for a new product, otherwise the feature's slug. Commit the writes there with a Conventional Commits message (for example `docs(product): brief for <slug>`), staging only them, and report the branch and commit. Before switching or renaming branches, commit any pending shared-file appends there in their own commit, as `build`'s [Shared files](../build/SKILL.md#shared-files) describes. Leave the default branch clean; `to-spec` renames the explore branch to the spec's branch, or `build` to the work branch when there is no spec.

**Write after the bootstrap commit.** In a run handed over by `start`, cut no branch and write nothing (brief, research, specs, or tasks) until the bootstrap lane reports its initial commit, even after a yes; then cut `explore/<slug>` from that commit, and the yes to the shown text carries over to that write. The confirmed brief then replaces the product sections of the baseline `PRODUCT.md` and keeps its template facts. If the bootstrap failed, keep everything confirmed in conversation and write it once a repository exists.

Research is saved only when `competitors` ran; it owns the research-saving rule. Choices made during exploration become decision records only when they pass `to-spec`'s decision test; otherwise they stay in the spec.

## Spec-ready

Report spec-ready when intent is confirmed, the riskiest assumption and kill criterion are named, and the brief or diff is committed on the explore branch or waiting for the bootstrap commit; a clearer outcome is spec-ready once its sharpened intent is restated. A declined brief is not spec-ready for writing specs. Otherwise say what is missing. Close with known facts, open assumptions, how many marked guesses were accepted unchanged, and the next activity. Missing optional skills must not block exploration.

Once spec-ready with a brief, name the next steps and wait for the user: "build it" builds the brief directly, with no spec; for a tracked bet, `to-spec` for `docs/specs/NNN-short-name.md`, "accept the spec", then `to-tasks`.

**New product specs.** Write specs only when the user asks ("spec it"); a confirmed brief ends exploration (decision 0039). On that request, write only spec 001 in full: the first bet, with its tasks as the slices inside it (decision 0026). Spec 001 must test the riskiest assumption, ship the instrumentation for the main metric, and define its capability contract-first as `to-spec` describes, including an MCP tool when the brief names agent users. Write later bets as `candidate` stubs with `to-spec`: in local mode as files; in GitHub mode, offer to open them as `candidate` issues, opened only on a yes, and otherwise name them in the report. Flesh them out only after spec 001 ships. In a new product, the brief, research, and any specs ship with the first build.

Discussion and exploration do not authorize implementation.
