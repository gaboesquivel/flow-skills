---
name: explore
description: Talk through a product, feature, or plan as a product peer, from who has the problem to what is worth building and learning first. Use when the user says "explore this", "interview me", or "grill this".
disable-model-invocation: false
---

# Explore

Think the idea through with the user, test whether it holds up, and record only what they adopt. Recover facts with tools; ask only about intent and choices you cannot infer. "Explore this" is the phrase; "interview me", "grill this", or a walk-through changes the style, not the scope.

## Read first

In an existing project, read the product context the question touches before the first substantive question: `PRODUCT.md` (whole when short, else the relevant section), the glossary, and the decisions and specs the idea may conflict with, each labeled by status and location (`write-agents` Context freshness). Use what they already say about users and purpose. Then ask the question whose answer would most change your recommendation. Subagents never ask the user.

## Conversation

- Start from the outcome the user wants and who has the problem; treat the status quo as a live option until evidence beats it. Compare competitors or alternative approaches only when the comparison could change a decision.
- Scale to what the user and project establish. A fix or small change needs no questions. A feature needs its journeys, agent users or "none", the metric it should move if any, and its delivery constraint (appetite, first verifiable increment, non-goals, material cost limits). A new product also needs who has the problem, what outcome makes a first release useful, the riskiest assumption, and how the user will judge success.
- A baseline can be unknown and a manual observation can be enough. Label an untested claim a hypothesis; never invent confidence.
- Give your guess and reasoning with each question. Ask open questions one at a time and batch up to three closed ones in the host's question UI. Re-ask "whatever you think" as a choice between two concrete options.
- Resolve a blocking uncertainty with the smallest investigation or experiment (read a contract, trace a request, compare approaches, a prototype), then report what it showed. A prototype request authorizes that experiment within its named scope; it does not adopt the prototype as product direction.
- For a new product, run a short pre-mortem on the riskiest assumptions and name the observation that would end the work (the kill criterion). When a new surface's look is not settled by `DESIGN.md`, suggest `design` in one line.
- Stop when you can predict the user's next three answers or they have what they need. A user who asked only to be interviewed gets their intent restated in their words (outcome, user, why now, success, constraint, out of scope); "sounds good" is not a yes.

**Metrics.** Keep existing definitions. Define a new one by the journey outcome it observes, what counts, population, window, source, baseline (or "unknown"), and target; an unevidenced target is a hypothesis.

## Writes

Discussion alone, including "let's just talk", writes nothing and creates no file, branch, worktree, issue, or pull request, in the current checkout.

**Disagreement with a commitment.** When the idea runs against an Accepted decision, an accepted or implemented spec, or a `PRODUCT.md` fact, name the file and quote the position when it matters, and let the hypothetical or experiment proceed. Candidate and draft specs and Proposed decisions are not commitments. Adopting the change is `to-spec`'s direction-change gate. A prototype or code that differs from the commitment never changes it.

**Brief.** When a new product's direction is settled and the user wants it recorded, you own its initial `PRODUCT.md`: problem, who (agent users or "none"), why now, riskiest assumptions as hypotheses, main metric and kill criterion, core journeys (one line each; steps belong in `DESIGN.md`), first useful release, alternatives, out of scope. An explicit request to write an agreed brief authorizes the write; otherwise show the exact text once and ask once. With no repository or a discussion-only request, keep it in chat. Write on one non-default branch named for the work (reuse the delivery's branch, no new worktree unless another writer owns the checkout); commit only these writes and report branch and commit. After `start`, write nothing until the bootstrap reports its initial commit; the brief then replaces the baseline's product sections and keeps its template facts.

**Feature.** Update `PRODUCT.md` only for a durable change the user adopts: a new audience, core journey, success measure, or operating promise. Without a `PRODUCT.md`, a well-scoped feature proceeds on existing context; do not make it a setup task.

## Ending

Exploration may end in a clearer question, a decision to stop, an experiment, an agreed brief, or a first slice ready to specify; do not recite these. When it turns toward delivery, say in a sentence what the first useful release is, which first slice is worth implementing, and any decision that depends on its result. Do not push a handoff into an open conversation. "Spec it" (`to-spec`) sizes the work; "build it" can build a settled, bounded conversation without a spec. `start` is optional scaffolding that consumes a brief already developed, and explore works before a repository exists, in one initialized another way, or after `start`.

Discussion, interviews, and experiments do not authorize implementing the product.
