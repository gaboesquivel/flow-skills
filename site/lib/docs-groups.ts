import { capabilities, capabilityPath, getCapability, getDoc } from "@/lib/content";

export type TaskLink = { href: string; label: string; description: string };
export type TaskGroup = { title: string; summary: string; items: TaskLink[] };

const guide = (slug: string, label: string, description: string): TaskLink[] =>
  getDoc(slug) ? [{ description, href: `/docs/${slug}`, label }] : [];

const capability = (slug: string, label: string): TaskLink[] => {
  const c = getCapability(slug);
  return c ? [{ description: c.description, href: capabilityPath(c), label }] : [];
};

/**
 * Docs organized by reader task (spec 057). Entries point at the owning page; nothing here restates a rule.
 * Capability entries appear only once published.
 */
export const docsTaskGroups = (): TaskGroup[] => [
  {
    items: [
      { description: "Every guide, grouped by what you are trying to do.", href: "/docs", label: "Overview" },
      ...guide("get-started", "Install and use Flow", "Install the skills and talk to your existing agent."),
      ...guide("product", "Understand Flow", "What Flow is, its principles, and its ecosystem."),
      { description: "Pick flow-next or flow-mono for a new project.", href: "/starters", label: "Choose a starter" },
    ],
    summary: "Install Flow, understand what it is, and pick a foundation.",
    title: "Start",
  },
  {
    items: [
      { description: "Understand the problem before planning.", href: "/skills/explore", label: "Explore" },
      { description: "Turn the conversation into a bounded spec.", href: "/skills/to-spec", label: "Specify" },
      { description: "Implement, review, and verify on a branch.", href: "/skills/build", label: "Build" },
      { description: "Check work against intent on five axes.", href: "/skills/review", label: "Review" },
      { description: "Land verified work and confirm it is live.", href: "/skills/ship", label: "Ship" },
      ...guide("methodology", "Understand the practice", "How the principles apply day to day."),
    ],
    summary: "Move a change from intent to verified, live software.",
    title: "Workflows",
  },
  {
    items: [
      ...capability("scope-cost-control", "Manage scope and cost"),
      ...capability("security-human-control", "Direct agents safely"),
      ...capability("verified-delivery", "Understand delivery evidence"),
      { description: "Keep PRODUCT.md, DESIGN.md, and the glossary aligned.", href: "/skills/flow", label: "Maintain context" },
      { description: "Settle what the project's terms mean.", href: "/skills/domain-modeling", label: "Model the domain" },
      ...guide("principles", "Principles", "Optional themes: validation, observability, agentic, lean, velocity."),
      ...(capabilities.length ? [{ description: "Every published capability, by group.", href: "/capabilities", label: "All capabilities" }] : []),
      { description: "Longer explanations with real examples.", href: "/blog", label: "Articles" },
    ],
    summary: "Practices that keep agent work bounded, safe, and evidenced.",
    title: "Engineering practices",
  },
  {
    items: [
      ...guide("skill-catalog", "Skill catalog", "Every skill and the phrase that reaches it."),
      { description: "Browse and install individual skills.", href: "/skills", label: "Skill library" },
      ...guide("glossary", "Shared terms", "Project-specific meanings and distinctions."),
      { description: "Numbered records of why Flow works the way it does.", href: "/docs/decisions", label: "Decisions" },
    ],
    summary: "Look up a skill, a term, or the rationale behind a rule.",
    title: "Reference",
  },
  {
    items: [
      ...guide("agent-compatibility", "Host requirements", "Install paths and invocation across agent hosts."),
      { description: "llms.txt, Markdown, search API, and MCP.", href: "/agents", label: "Machine interfaces" },
    ],
    summary: "What agent hosts need and how agents read this site.",
    title: "Agents",
  },
];

/** Guide slugs in the order the task groups list them, for previous/next links. */
export const guideOrder = () =>
  docsTaskGroups()
    .flatMap((g) => g.items)
    .map((i) => i.href.match(/^\/docs\/([^/]+)$/u)?.[1])
    .filter((slug): slug is string => Boolean(slug && slug !== "decisions"));
