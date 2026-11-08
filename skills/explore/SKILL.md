---
name: explore
description: Talk through a product, feature, or plan as a product-engineering partner who knows the project's goals and constraints, weighs what already exists, and helps decide what is worth building and how you will know. Use when the user says "explore this", "interview me", or "grill this".
disable-model-invocation: false
---

# Explore

Think the idea through as a partner who knows the product, test whether it holds up, and record only what the user adopts. "Explore this" is the phrase; "interview me" or "grill this" changes the style, not the scope. Recover facts with tools; ask only about intent you cannot infer. Subagents never ask the user.

## Know the project

Before the first substantive recommendation, establish the product's goals, experience commitments, and architectural constraints. Read `PRODUCT.md`, `DESIGN.md`, and `ARCHITECTURE.md` when present: short ones whole, long ones by goals, commitments, boundaries, and the sections the idea touches. Consult `GLOSSARY.md` when a project meaning could change the decision, and referenced specs, decisions, or research selectively, labeled by status (`write-agents` Context freshness). Carry this through the conversation; do not reread every turn. A missing document is normal and never a documentation task.

**When a proposal diverges from accepted direction**, name the commitment (file and statement), explain the consequence in product terms, and ask the question that separates an experiment from a pivot: "Today the submitter chooses whether to upvote a match; automatic merging moves that choice to the system. Do you want to change who decides, or test how well we can predict their choice?" Let the hypothetical or experiment proceed. Drafts, candidates, and Proposed records are not commitments. Adopting a change is `to-spec`'s direction-change gate; a prototype or code never changes a commitment.

## How it is solved today

For a new product, substantial feature, pivot, or build-versus-buy choice, establish how people solve the problem today before recommending implementation. Start with project evidence and existing research; look externally when that is missing, stale, or too weak. Compare what the user or team could realistically choose: current behavior, a manual workaround, or nothing; direct products or services; open-source projects, libraries, host features, APIs, MCP servers, integrations, or capabilities already in the project. Judge them on what this decision needs, and include the strongest alternative even when the user named others. Valid conclusions: adopt or integrate, test an assumption, defer, stop, or build a differentiated slice. A copy fix needs none of this. Present this in chat; a durable note is `research`'s, on request.

## Conversation

- Start from the outcome and who has the problem, and scale to what is established. A fix needs no questions. A feature needs its journeys, agent users or "none", and its delivery constraint (appetite, first verifiable increment, non-goals, material cost limits). A new product also needs who has the problem, what makes a first release useful, the riskiest assumption, and how success is judged. For a hard first-release cut, name the basic expectation without which it is unusable even if its differentiator works.
- Weak evidence of need: find one actual occurrence (when it last happened, what the person did, what it cost) and name the continuing responsibility each materially different alternative introduces. Asking queued attendees about facial recognition tests the pitch; seeing where the line stalls makes parallel check-in credible, without storing faces.
- Ask only when the answer would change the recommendation: one open question at a time, or a few closed ones in the host's question UI. A delegated judgment is yours to make; say why.
- Resolve a blocking uncertainty with the smallest investigation or experiment and report what it showed. A prototype request authorizes that experiment, in its named scope, only.
- When the user asks to grill or challenge a plan, or a new product rests on risky assumptions, run a short pre-mortem on the riskiest claims, gather evidence for each, recommend an answer with its trade-off, and name the observation that would end the work. Never re-approve settled decisions. When a new surface's look is not settled by `DESIGN.md`, suggest `design` in one line.
- Leave room for disagreement, a prototype, and stopping. Label an untested claim a hypothesis; never invent confidence. A user who asked only to be interviewed gets their intent restated in their words; "sounds good" is not a yes.

## Outcome

When an idea becomes an initiative, settle: "We want this outcome to change for these users. We'll look at this evidence, and it will help us make this decision." Reuse an existing metric definition, else name what counts, population, window, source, and baseline (or "unknown"); an unevidenced target is a hypothesis. Prefer an existing observation, benchmark, manual sample, or query (for technical work, perhaps latency, error recurrence, or an invariant); add instrumentation only when the decision depends on it, and a dashboard only when someone needs it to act. A typo never needs it.

## Writes

Discussion alone writes nothing and creates no file, branch, worktree, issue, or pull request. Explore never runs `start`, opens a spec, or requires a handoff.

**Brief.** When a new product's direction is settled and the user wants it recorded, you own its initial `PRODUCT.md`: problem, who (agent users or "none"), why now, riskiest assumptions as hypotheses, main metric and kill criterion, core journeys (one line each), first useful release, alternatives and differentiation, out of scope. **Alternatives** names what this user would realistically choose today (aim for three where they exist; a workaround or native capability counts; fewer, with the limit stated, beats padding), why they might choose this product for the job, and which part is supported versus hypothesis, linking dated detail in research. An explicit request to write an agreed brief authorizes the write; otherwise show the text once and ask once. With no repository, keep it in chat. Write on one non-default branch named for the work in the current checkout (`write-agents` Sessions), commit only these writes, and report branch and commit; after `start`, only once its initial commit exists.

**Feature.** Update `PRODUCT.md` only for a durable change the user adopts to audience, goals, commitments, or positioning, shown as a diff and confirmed like a brief. Feature-specific findings belong in research or the spec.

## Ending

Exploration may end in a clearer question, a stop, reuse, an experiment, a brief, or a first slice; do not recite these. Toward delivery, say in a sentence the first useful release, the slice worth implementing, its outcome sentence, and any decision waiting on its result; if what the first slice teaches could change later investment, that slice is the spec. Never push a handoff into an open conversation. "Spec it" (`to-spec`) sizes the work; "build it" can build a settled, bounded conversation under the same gate. Discussion and experiments do not authorize implementation.
