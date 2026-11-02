# Articles

Articles explaining Flow's positions for people directing coding agents. They describe and link to the documents that own each rule (`PRODUCT.md`, [principles](../principles.md), skills, decisions) and define nothing themselves. An article is published on the site only when it is listed in the site's curated content list and its frontmatter says `status: published`; everything else here stays a draft.

| Article | Status |
| --- | --- |
| [What counts as verified delivery?](intent-to-verified-delivery.md) | Published, 2026-11-02 ([spec 057](../specs/057-content-architecture.md)) |
| [Does Code Quality Still Matter When Agents Write the Code?](code-quality-agents.md) | Draft, 2026-10-31 ([spec 051](../specs/051-code-quality-article.md)) |
| [Designing with AI: Rules an Agent Can Follow and Check](designing-with-ai.md) | Draft, 2026-11-02 ([spec 056](../specs/056-lean-context-checkable-design.md)) |

## Frontmatter

Published articles use the shared contract fields in [`docs/capabilities/README.md`](../capabilities/README.md#frontmatter) (`title`, `description`, `status`, `published`, `updated`), plus `capability`: the slug of one published capability page the article primarily explains. Start the body with the title as its H1; its headings double as chapters if the article is later recorded.

Two optional fields attach a recording; neither is needed to publish:

- `video_url`: an HTTPS link from a supported video provider.
- `transcript`: a repository-relative path to a Markdown transcript under `docs/blog/transcripts/`. It renders within the article, not as a separate page.
