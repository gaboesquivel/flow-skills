# Capabilities

Curated explanations of what Flow contributes to a delivery outcome, written for people deciding whether and how to use it. Each page explains a coordinated practice and links to the skills, methodology, glossary entries, and decisions that own its rules. These pages define no rules of their own: when a page and its owner disagree, the owner wins and the page is corrected. Scope and taxonomy: [spec 057](../specs/057-content-architecture.md).

A page is published on the site only when it is listed in the site's curated content list **and** its frontmatter says `status: published`. Anything else in this folder, including drafts, stays out of the site, search, and agent discovery.

## Frontmatter

Flat scalar fields only: no nested YAML. Quote a value only when it contains a colon. The filename is the slug; there is no route field.

| Field | Contract |
| --- | --- |
| `title` | Required. The human title; the body starts with the same text as its H1. |
| `description` | Required. One or two sentences summarizing the page. |
| `status` | `draft` or `published`. A missing or unknown value never publishes. |
| `published` | ISO date. Required when `status: published`. |
| `updated` | ISO date. Required, and not before `published`. |
| `group` | Capability pages only: `Delivery & Execution`, `Trust & Reliability`, or `Knowledge & Architecture`. |

Articles in [`docs/blog/`](../blog/README.md) share `title`, `description`, `status`, `published`, and `updated`, and replace `group` with `capability`.

## Writing a page

Each page answers, in order: the problem the reader has; what Flow contributes; how to start in ordinary language; one concrete example; evidence and owners; limitations and trade-offs. Separate implemented behavior, accepted intent, and host-dependent behavior. Describe the intended benefit of a convention without promising measured gains, and attribute framework, authentication, migration, and deployment behavior to the tools that provide it. A diagram needs adjacent prose that explains the same relationships.

## Index

| Capability | Group | Status |
| --- | --- | --- |
| [Intent-to-verified delivery](verified-delivery.md) | Delivery & Execution | Published, 2026-11-02 |
| [Scope and cost control](scope-cost-control.md) | Delivery & Execution | Published, 2026-11-02 |
| [Security and human control](security-human-control.md) | Trust & Reliability | Published, 2026-11-02 |
| Multi-agent collaboration (`multi-agent-collaboration`) | Delivery & Execution | Not yet published |
| Independent review and evidence (`independent-review-evidence`) | Trust & Reliability | Not yet published |
| Shared context and domain language (`shared-context-domain-language`) | Knowledge & Architecture | Not yet published |
| Agent-first architecture (`agent-first-architecture`) | Knowledge & Architecture | Not yet published |
