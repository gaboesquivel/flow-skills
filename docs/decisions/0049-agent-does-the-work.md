# 0049 — The agent does the work

Status: **Accepted** (2026-10-29). Amends [PRODUCT.md](../../PRODUCT.md#principles) principle 3 ("Human-led, agent-assisted") and [0023](0023-agent-first.md) (agent-first applied only to the products Flow builds). Builds on [0048](0048-delivery-phrases-are-approvals.md). Spec: [036](../specs/036-agent-does-the-work.md).

## Context

Flow's main metric is idea → prod, and user turns and confirmations are a named source of delay ([PRODUCT.md](../../PRODUCT.md#success)). [0048](0048-delivery-phrases-are-approvals.md) removes confirmations after a delivery phrase, but dogfooding in Claude Code still shows three kinds of friction:

- **Tool choice.** The agent reaches for a dashboard or a page when a CLI (`gh`, `vercel`, `neon`, `pnpm`) or a connected MCP server could do the step.
- **Manual hand-offs.** The agent tells the user to open a website, find a setting, and change it, often as a multi-step click path.
- **Permission prompts.** Routine read and delivery commands prompt every time. This repository has no allowlist, and spec 035 leaves adopter allowlists to the templates.

No skill states how the agent should pick tools or when work may go back to the human. The "Agentic" theme in [principles](../principles.md#agentic) covers the products Flow builds, not how the agent itself works. Principle 3 reads as "agent assists, human executes," which works against Flow's purpose.

## Decision

1. **Principle 3 becomes "Human-directed, agent-executed."** Humans set direction and make consequential decisions. Agents carry out the work, including setup, configuration, and operations, with the tools they can reach.
2. **Tool ladder.** For each step, the agent uses the first rung that can do it: a CLI already installed, then a connected MCP server or connector, then the service's API through an authenticated CLI, then browser automation the host provides, and only then the human. One home: `write-agents` Tools, beside Workers. Delivery skills link to it instead of restating it.
3. **Human-only steps are narrow.** They are signing in and granting OAuth consent; entering secrets, credentials, or payment details; accepting terms; changing the agent's own permission settings; and any action the host's safety policy reserves for the user. A changed security or protection setting also needs the user's explicit request. Everything else, the agent does.
4. **A hand-off is one step.** When a step is human-only, the agent gathers every such step it can foresee into one request. It names each step as one command (`vercel login`) or one exact URL, with its reason, never a click path. Then it continues on its own once the user says done. Before reporting any blocker, the agent tries the ladder.
5. **The Flow block carries the rule.** Skills load only when a phrase matches, but the friction happens in ordinary conversation too. The Flow block gains one line stating the ladder and the hand-off rule, pointing to `write-agents` Tools.
6. **Permission prompts are reduced by configuration the user applies, not by skill text.** An agent may propose an allowlist but never writes its own permission settings; Claude Code's auto mode refused exactly that while building spec 036. This repository's allowlist is a maintainer hand-off. Adopter allowlists stay with flow-next and flow-mono, as spec 035 decided. Flow writes no permission settings into adopter projects.

## Alternatives

- **Ladder text in each delivery skill.** Rejected: it repeats one rule in five places and misses work done outside skills.
- **`flow` writes host permission allowlists on "set up Flow here".** Rejected for now: permission settings are the user's security boundary and differ per host (Claude Code, Cursor, Codex). Flow's portability principle keeps host configuration with the templates and the host's own tools.
- **Full autonomy, including sign-in, secrets, and protection changes.** Rejected: host safety rules reserve credentials and consent for the user, and changing protection is a security decision. Gathering those steps into one hand-off keeps the cost to a single turn.
- **Keep principle 3 and rely on 0048.** Rejected: 0048 removes confirmations after a phrase but leaves tool choice and hand-offs undefined, which is where the observed friction is.

## Consequences

- One new section in `write-agents`, one line in the Flow block, and small edits where skills now describe a hand-off (`ship` liveness, `start` deployment, `debug` access).
- Adopters who installed skills without the Flow block get the ladder only when a skill loads. The Flow block is the way to get it everywhere.
- Hand-offs and permission prompts become diagnostics for idea → prod, where session logs expose them.
- The agent runs more commands itself, so a missing allowlist is felt more. Templates carry allowlists; this repository and other adopters apply one with their host's permission tools.
