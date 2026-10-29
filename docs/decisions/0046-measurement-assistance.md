# 0046 — Portable measurement assistance

Status: **Proposed** (2026-10-29). Implemented by [spec 034](../specs/034-measurement-support.md).

## Context

The methodology defines good measurement and `explore` asks for main-metric instrumentation, but nothing evaluates collected evidence or tells collection, access, tooling, and sample-size gaps apart. `PRODUCT.md` excludes OMTM automation and treats measurement as optional practice.

## Decision

Add `measure` as a portable, read-only thinking skill. Strengthen measurement definition in `explore` and measurement acceptance in `to-spec`; `align` uses available results without invoking `measure`.

Product boundary: Flow ships measurement assistance, not an analytics service, monitoring, or tooling setup. Measurement stays proportional and never gates shipping. Flow's three internal success metrics are not an adopter requirement.

## Alternatives

- Methodology guidance alone: leaves the gap between intent and usable evidence.
- Collection analysis inside `align`: mixes diagnosis into product alignment and makes routine alignment heavier.
- Bundled analytics platform or collector: adds infrastructure and vendor assumptions to a portable catalog.

## Consequences

The catalog grows by one skill. Existing tools and exports supply evidence, with stated limitations when capabilities are missing. Tooling recommendations stay separate from implementation. Metric definitions stay with product intent instead of being copied into specs or reports.
