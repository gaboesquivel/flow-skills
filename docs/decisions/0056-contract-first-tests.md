# 0056 — Contract-first tests, no UI tests by default

Status: **Accepted** (2026-10-31). Amends [0042](0042-outcome-build-and-ship.md) items 1 and 5 (test order), for contracts only. Preserves [0023](0023-agent-first.md), [0044](0044-fast-delivery.md), and [0045](0045-templates-pin-flow-skills.md). Spec: [047](../specs/047-shared-language-test-first.md).

## Context

Principle 8, "Agent-first, API-first", has products define capabilities as contracts before interfaces, and `to-spec` writes API shapes and MCP tool definitions before any UI. 0042 left test order to the agent: a check must fail if a named behavior is missing, and writing it first is "allowed and not required". In practice, agents ship MCP tools and routes whose errors and permissions were never exercised, while early UI collects brittle tests that churn with each design change.

## Decision

1. **Contracts are test-first.** When a change adds or changes an API route, an MCP tool, or the domain function behind them, `build` writes a focused check of the contract first, sees it fail, then implements. The check covers input, result, actionable errors, and permissions, one check per behavior.
2. **No UI tests by default.** UI is verified in the running preview. A UI test is added only on request, when a spec names one, or when the same UI regression returns.
3. **Order stays free elsewhere.** Other behavior keeps 0042 item 5: a check that fails without the change, written in any order.
4. **Projects may differ.** A testing policy stated in the project's `ARCHITECTURE.md` overrides items 1 and 2.

## Alternatives

- **Stay order-neutral everywhere (0042 as is).** Rejected: contracts are what agents depend on, and a test written after the code tends to confirm the code rather than the contract.
- **Test-first for all behavior.** Rejected: more ceremony than the risk warrants; internal logic and early UI change too often to pay for it.
- **Put the policy in `PRODUCT.md`.** Rejected: `PRODUCT.md` owns outcomes; system contracts belong to `ARCHITECTURE.md`.

## Consequences

`build` gains a short Tests section that owns this rule; `review` checks that a changed contract has a failing-without-change check and does not expect UI tests. The templates' bundled TDD skill overlaps `build` and is theirs to drop. Evidence of order comes from the session log (the focused check failing before the implementation), so a squashed history alone cannot show it.
