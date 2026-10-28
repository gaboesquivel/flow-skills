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

Fold their results in as they return; drop a question a result answers, and raise a conflict they find at the next turn as [Direction changes](#direction-changes) describes. Questions and all writes stay in the main thread.

## Direction changes

This is the one home of the direction-change gate (decision 0038). The decisions reader also lists branches not merged into the default branch (`git branch -a --no-merged <default>`) and searches their `docs/decisions/` for `Supersedes` or `Amends` lines naming a record the request touches. Report each as a pending direction change (record, branch, status), never the old record as settled. Read only: no fetch or checkout.

When a stated goal contradicts an Accepted decision, an accepted or implemented spec, or a `PRODUCT.md` fact, stop at a direction-change gate: name each conflicting file, quote its position, say what changes and whether that supersedes or amends it, and continue only on an explicit yes. Candidate and draft specs, Proposed decisions, and mere overlap do not gate; when unsure, name the possible conflict in one line and continue. On a no, explore within the current direction.

On the yes, changing an Accepted decision gets a new decision record with status **Proposed** and `Supersedes [NNNN]` or `Amends [NNNN]` (with scope) on its Status line. A conflict only with a spec or a `PRODUCT.md` fact gets a record only when it passes `to-spec`'s decision test; otherwise the spec records it. Show the record's text and write it on the explore branch after a yes to that text, whatever the outcome except killed. Never edit the old record, spec, or `PRODUCT.md` here: `to-spec` writes the back-links when the spec is accepted.

## Depth

Classify the work (new product, feature, or fix). Fixes and clear small changes are **Skip**: no questions, no writes; hand back to the requested work. Everything else gets the one default depth (decision 0036); never ask for a depth:

- confirmed intent, the riskiest assumption, a pre-mortem, a kill criterion, one main metric ("unknown, measure first" is acceptable) plus any supporting metrics the user names, 1–3 core journeys in one line each, alternatives including the status quo, and the **agent lens**: who the agent users are, with an agent journey beside the human ones and agent alternatives, or an explicit "no agent users".

Deeper discovery runs only when the user asks for it (`competitors`, `jtbd`). When evidence warrants one, suggest it in a single line; never run it unasked.

**Delivery.** A run handed over by `start` uses the delivery confirmed there. Otherwise, when the Flow block's `Delivery:` is `unset` or there is no Flow block, ask it once per run, GitHub (issues and pull requests) or local, with a suggestion as `build`'s Delivery mode section describes (if `build` is unavailable, ask without a suggestion). Offer to record the answer on the Flow block with `flow`; without a block or a yes, it holds for this run.

## Extract, then challenge

Follow the `interview` pattern, including its question forms, until you can predict the user's next three answers. Restate intent and get an explicit yes before any challenge. When the user confirms, end the turn as `interview` does, but name the grill as the next step and start it on their reply; that yes confirms intent only and authorizes no write. Then follow `grill` on the riskiest claims only. After the intent yes, run the pre-mortem as one read-only worker (fan-out rule: `write-agents` Workers) while the grill proceeds in the main thread, and fold its failure modes into the grill. The pre-mortem runs once: `grill` skips its own pre-mortem worker because one already ran. Without workers, or if a supporting skill is missing, apply the same steps directly.

## Outcome and write gate

End in one outcome: **brief** (`grill`'s resolved direction), **clearer**, or **killed**. All three are valid; clearer writes only a confirmed direction-change record, and killed writes nothing.

For a brief, show the exact text before writing:

- **New product:** the full `PRODUCT.md` brief: problem, who (including agent users or "none"), why now, riskiest assumptions with confidence, main metric and kill criterion, core journeys (one line each; steps belong in `DESIGN.md`), alternatives, out of scope.
- **Feature:** a diff of durable product facts only (a new user, journey, or metric). When the project has no `PRODUCT.md`, propose creating it with those facts. Feature detail flows to `to-spec`, not `PRODUCT.md`.

Label unproven items as hypotheses with a confidence. An explicit yes to the shown text authorizes that write in the same turn; anything else is not a yes. Never write the brief before confirmation.

**Explore branch.** Outside a Git repository, follow `write-agents` [Repository](../write-agents/SKILL.md#repository) before writing. Write on a new `explore/<slug>` branch cut from the default branch, never on the default branch itself: the brief's product slug for a new product, otherwise the feature's slug. Commit the writes there with a Conventional Commits message (for example `docs(product): brief for <slug>`), staging only them, and report the branch and commit. Leave the default branch clean; `to-spec` renames the explore branch to the spec's branch.

**Write after the bootstrap commit.** In a run handed over by `start`, cut no branch and write nothing (brief, research, specs, or tasks) until the bootstrap lane reports its initial commit, even after a yes; then cut `explore/<slug>` from that commit, and the yes to the shown text carries over to that write. The confirmed brief then replaces the product sections of the baseline `PRODUCT.md` and keeps its template facts. If the bootstrap failed, keep everything confirmed in conversation and write it once a repository exists.

Research is saved only when `competitors` ran; it owns the research-saving rule. Choices made during exploration become decision records only when they pass `to-spec`'s decision test or change an Accepted decision (see Direction changes); otherwise they stay in the spec.

## Spec-ready

Report spec-ready when intent is confirmed, the riskiest assumption and kill criterion are named, and the brief or diff is committed on the explore branch or waiting for the bootstrap commit; a clearer outcome is spec-ready once its sharpened intent is restated. A declined brief is not spec-ready for writing specs. Otherwise say what is missing. Close with known facts, open assumptions, how many marked guesses were accepted unchanged, and the next activity. Missing optional skills must not block exploration.

Once spec-ready with a brief, name the next steps and wait for the user: `to-spec` for `docs/specs/NNN-short-name.md`, "accept the spec", then `to-tasks`.

**New product specs.** Write only spec 001 in full: the first bet, with its tasks as the slices inside it (decision 0026). Spec 001 must test the riskiest assumption, ship the instrumentation for the main metric, and define its capability contract-first as `to-spec` describes, including an MCP tool when the brief names agent users. Write later bets as `candidate` stubs with `to-spec`: in local mode as files; in GitHub mode, offer to open them as `candidate` issues, opened only on a yes, and otherwise name them in the report. Flesh them out only after spec 001 ships. In a new product, the brief, research, and specs ship with spec 001's implementation.

Discussion and exploration do not authorize implementation.
