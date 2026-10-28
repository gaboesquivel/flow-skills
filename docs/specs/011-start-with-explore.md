# 011: Start with explore

Status: draft (2026-10-28). Decision: [0022](../decisions/0022-start-runs-explore.md). Related: [spec 010](010-explore-redesign.md), [decision 0023](../decisions/0023-agent-first.md).

## Problem Statement

A founder who says "let's start a Next.js project" and describes the idea gets a verified repository, but no product thinking. `start` forbids discovery, so the idea and its riskiest assumption stay in chat while the bootstrap runs, and exploration only starts if the user remembers to ask for it afterwards. Exploration then tends to produce either nothing durable or several detailed specs that the first slice will invalidate.

## Solution

1. **Speakable start.** "Let's start a Next.js project" plus a description loads `start`, as does `/start`. Before writing anything, `start` states the template, project name, and destination and waits for an explicit yes.
2. **Two lanes.** After the yes:
   - A worker bootstraps the template exactly as `start` does today: template copy, identity rename, setup, QA, build, smoke test, baseline docs, and the verified initial commit.
   - The main session runs `explore` at Full depth for a new product, using the description as the first input: intent, riskiest assumption, main metric and kill criterion, journeys (human and agent), alternatives, and research.
3. **Write order.** Explore drafts in conversation and writes nothing until the bootstrap's initial commit lands. The confirmed brief then replaces the product sections of the baseline `PRODUCT.md`. A failed bootstrap does not discard the exploration; the brief waits until a repository exists.
4. **Specs.** Explore writes:
   - **Spec 001**, the first vertical slice, in full with its tasks. It must test the riskiest assumption and ship the instrumentation for the main metric. Its interfaces follow [decision 0023](../decisions/0023-agent-first.md): a typed API contract the UI uses, plus an MCP tool when the brief names agent users.
   - **Specs 002 onward** as stubs: problem, the assumption the slice tests, and status `candidate`. They are fleshed out only after spec 001 ships.
5. **Delivery.** The brief, research, and specs ship with spec 001's implementation through the project's delivery mode ([decision 0020](../decisions/0020-flow-mode.md)).
6. **Fallback.** Hosts without workers bootstrap first, then explore, and say so.

## User Stories

1. As a founder, I want to describe my idea while the template installs, so that I end with a working repository and a confirmed brief in one sitting.
2. As a founder, I want only the first slice specified in full, so that I do not maintain specs that the first slice will change.
3. As a founder, I want slice 1 to test my riskiest assumption and measure my main metric, so that the first deploy teaches me something.
4. As a user whose bootstrap fails, I want my exploration kept, so that fixing the environment does not cost me the conversation.

## Implementation Decisions

- **`start`:** speakable with a pre-write confirmation; delegates bootstrap to a worker when the host supports one; hands the conversation to `explore`; keeps its existing safety rules (destination checks, no template remote, commit gate).
- **`explore`:** a new-product run invoked by `start` uses Full depth unless the user picks another; writes after the bootstrap commit; produces spec 001 in full and candidate stubs.
- **`to-spec`:** supports a `candidate` status for stub specs.
- **Baseline docs:** `start` keeps writing template facts (architecture, routes, identity); explore owns the product sections of `PRODUCT.md`.

## Testing Decisions

- Smoke contracts: `start` states the pre-write confirmation and the explore hand-off; `explore` states the write-after-commit rule, spec 001 requirements, and candidate stubs.
- Eval scenarios: a start request with a description runs both lanes; a failed bootstrap keeps the exploration; slice 1 names the riskiest assumption and the metric instrumentation.
- Existing `start` bootstrap tests stay green.

## Out of Scope

- Changes to bootstrap mechanics (rename, verification, commit gate).
- Full specs for slices after the first.
- Adding MCP support to the templates; flow-next already ships an MCP server.

## Tasks

Recorded per the project's delivery mode when implementation starts.
