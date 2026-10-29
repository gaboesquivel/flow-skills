# Flow — Design

**Status:** Throughline identity selected; Prism visual system approved. This is the single authoritative design context for Flow's website, skills, and starters. See [PRODUCT.md](PRODUCT.md) for product intent and metrics and [Spec 032](docs/specs/032-prism-website.md) for the website's bounded implementation scope.

![Throughline mark](site/public/brand/flow-brand-banner.webp)

## Design purpose

Flow helps humans understand and direct meaningful product work while agents execute it. The design should convey **clarity, directed movement, collaboration, and confidence**, without suggesting a rigid workflow or a generic AI brand. The site serves human readers and agent users through the same public knowledge, emphasizing source-backed answers through one `⌘K` palette and discoverable skills and starters.

## Brand identity

- **Name:** Flow. Use *Flow Skills*, *Flow Starters* and *Flow Factory* for specific ecosystem surfaces, not as replacements for the parent brand.
- **Concept:** **Throughline** — three distinct, open trajectories converge into a single forward direction. The paths represent independent human intent, agent work and tooling converging on a verified outcome; they are not a mandatory three-step process.
- **Tagline:** *From intent to verified software.* Homepage headline: *Make ideas flow.*
- **Expression:** precise, modern, approachable, editorial, and technically credible. Flow has its own identity, distinct from gaboesquivel.com's green, but should complement the portfolio's minimal, confident presentation.
- **Avoid:** infinity symbols, generic glowing nodes, stock AI brains, triangular prism marks, neon green, compulsory workflow diagrams presented as the logo, or gradients that are needed to recognize the silhouette.

### Approved logo system

| Purpose | Canonical asset |
| --- | --- |
| Transparent vector symbol | [`throughline-mark.svg`](site/public/brand/throughline-mark.svg) |
| Symbol, one color on dark | [`throughline-mark-white.svg`](site/public/brand/throughline-mark-white.svg) |
| Symbol, one color on light | [`throughline-mark-ink.svg`](site/public/brand/throughline-mark-ink.svg) |
| Horizontal lockup, dark | [`throughline-lockup-on-dark.svg`](site/public/brand/throughline-lockup-on-dark.svg) |
| Horizontal lockup, light | [`throughline-lockup-on-light.svg`](site/public/brand/throughline-lockup-on-light.svg) |
| Browser/favicon master | [`site/app/icon.svg`](site/app/icon.svg) |
| Social/OG composition | [`flow-social.webp`](site/public/brand/flow-social.webp); live Next.js dynamic OG is in `site/app/opengraph-image.tsx` |
| Portfolio cover | [`flow-portfolio-cover.webp`](site/public/brand/flow-portfolio-cover.webp) |

Treat SVG outlines as canonical. Raster exports are derivatives. Do not change SVG geometry independently across header, favicon, OG or marketing assets; update variants together. The outlines live once in `THROUGHLINE_PATHS` ([`site/components/logo.tsx`](site/components/logo.tsx)), which the header, footer, hero and OG image import; `pnpm validate` fails when a static SVG variant drifts from them. The public interface uses a lowercase **flow** wordmark in the site's Inter display style, without an added slash. Text such as *Skills* is a descriptor, not part of the master logo. Monochrome variants must remain readable without gradients.

### Color and type

Use the **existing website tokens**, not the higher-saturation colors in exploratory boards:

| Token | Hex | Role |
| --- | --- | --- |
| Canvas | `#0e0c15` | Primary dark background |
| Canvas deep | `#0b0a11` | Contrast areas |
| Panel | `#1a1725` | Elevated surfaces |
| Foreground | `#f5f3fb` | Primary reading text |
| Muted | `#b5afc6` | Secondary text |
| Periwinkle | `#9ea6f8` | Gradient start |
| Lavender | `#c6a8f6` | Gradient middle |
| Pink | `#f0a6cf` | Gradient end, sparingly |
| Accent | `#a78bfa` | Interactive emphasis |

Canonical gradient: `linear-gradient(92deg, #9ea6f8 0%, #c6a8f6 48%, #f0a6cf 100%)`. Typography: **Inter** for product/UI and **JetBrains Mono** for labels and commands, using site styles rather than bundling brand font files. Reserve gradients for brand expression and meaningful emphasis, not every card or icon. Preserve sufficient contrast in body text and interactive controls.

## Product and interface design

- Design for the purpose of each surface: Home communicates value; Skills and Docs optimize discovery and comprehension; the `⌘K` palette optimizes question-to-evidence, with search and cited Ask in one place ([spec 040](docs/specs/040-site-refinement.md)); Starters support choosing a suitable foundation.
- Show product goals and actual capabilities faithfully. Do not use fabricated counters, testimonials, scores, speed claims or agent-readiness badges without evidence.
- There is one search surface: the palette. No separate Ask landing or embedded search boxes; entry points open the palette.
- Preserve the current live Prism information architecture, responsive layouts, source-backed content pipeline and machine-readable endpoints unless there is a separate, confirmed product change.
- Ensure typography, navigation, loading, error, empty, focus and mobile states are deliberate. Use semantic content for human and agent readers; imagery is supplementary rather than a text substitute.
- The hero diagram must not preserve the retired diamond as a competing logo. Use Throughline in brand-bearing surfaces.

### Approved homepage

Order: hero, principles strip, **Build what matters.**, Find the skill / Ask the question (opens the palette), three pillars, install band, footer. Only h1 headings carry the gradient; section headings (h2 and below) stay plain, site-wide.

- **Hero illustration.** Four stations (Intent, Build, Ship, Measure) on a feedback cycle around the canonical Throughline mark; the cycle shows feedback, not mandatory gates. The source is [`hero-orbit.tsx`](site/components/home/hero-orbit.tsx), which imports `THROUGHLINE_PATHS`; [`flow-hero-orbit.svg`](site/public/brand/flow-hero-orbit.svg) and [`flow-hero-orbit.webp`](site/public/brand/flow-hero-orbit.webp) are static derivatives for reuse outside the site. Update them together; `pnpm validate` checks the SVG's mark outlines.
- **Build what matters.** A product-first practice timeline: design thinking, lean practices, meaningful velocity. Four stages, each with a mono kicker, title, one-line purpose, and links to its skills, beside an example panel. The examples follow one continuous, illustrative product (a renter shortlist: OMTM with two supporting metrics, an MVP, a vertical slice, verified release, a measured next decision) and are labeled as intended evidence, not claimed results. The Intent panel is emphasized; a *Learning shapes the next intent.* line closes the loop. On desktop the stage text and example sit in two columns on a dotted vertical axis divided by subtle rules; on mobile the example stacks under its stage at full body size. The copy lives in [`sections.tsx`](site/components/home/sections.tsx).

## Usage and validation

- At 16–24 px, use the simplified, high-contrast icon version. Prefer mono when a gradient is indistinct. Keep negative space; never squash, rotate, stretch or place detailed imagery behind the mark.
- On dark surfaces use the light wordmark; on light surfaces use the dark wordmark. A wordmark is not required inside a favicon or app icon.
- Check rendered header, footer, favicon, hero, OG and portfolio preview at realistic sizes (16, 24, 32, 64 px and mobile/desktop), including light and dark contexts where used.
- Confirm that the deployed favicon and social previews match the current brand and the deployed commit; a local render or passing build alone does not establish deployment.
- Verify focus, accessible naming, semantics, responsive density and readable text contrast. Document observed limitations without adding extra routine approvals.

## Stewardship

Use this file for **accepted visual identity and cross-surface design intent**. Temporary sketches, moodboards, concepts and export files can remain in an untracked `__dev/designs/` directory; they are not a second design authority. Update this file and the canonical SVG assets only when an intentional identity decision changes. Keep product goals, journeys and metrics in `PRODUCT.md`; do not duplicate them here. Do not create another `IDENTITY.md` or branding tracker.

**Scope of approval:** the Throughline concept, Flow name, and current Prism tokens are selected. This does not certify trademark clearance or formal recognition testing, which remain separate considerations.
