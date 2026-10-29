/**
 * Curated starter facts, verified against each repository's README.md, package.json,
 * docs/INTEROP.md, and (flow-mono) turbo.json. Re-verify when the templates change.
 */
export type Starter = {
  slug: "flow-next" | "flow-mono";
  kind: string;
  title: string;
  hero: { lead: string; accent: string };
  tagline: string;
  description: string;
  capabilities: string[];
  quickStart: string[];
  quickStartNote: string;
  prerequisites: string[];
  repository: string;
};

export const starters: Starter[] = [
  {
    slug: "flow-next",
    kind: "Single application",
    title: "flow-next",
    hero: { lead: "One app.", accent: "Ready to build." },
    tagline: "One focused Next.js app with a public Assistant, a protected Operator, and agent-facing MCP surfaces.",
    description:
      "A single-app agentic Next.js template: public Assistant, protected Operator, Eve, OpenUI Lang GenUI, MCP Streamable HTTP, and MCP Apps. Start with a practical baseline and grow only as needed.",
    capabilities: [
      "Next.js 16 App Router, React 19, and TypeScript",
      "Public Assistant: chat, GenUI playground, and MCP at /api/mcp",
      "Protected Operator console and MCP, fail-closed behind OPERATOR_SECRET",
      "Eve agent tools, OpenUI Lang GenUI, MCP Streamable HTTP, and MCP Apps",
      "Inference through Vercel AI Gateway",
      "One pnpm qa for lint, types, and tests; offline evals; security checks",
      "Vercel-first: vercel.json runs pnpm build",
    ],
    quickStart: ["pnpm setup", "pnpm dev"],
    quickStartNote: "Open the Portless URL (default host flow-next.localhost) and configure .env.local from .env.example.",
    prerequisites: ["Node.js 24+", "pnpm 12.14"],
    repository: "https://github.com/gaboesquivel/flow-next",
  },
  {
    slug: "flow-mono",
    kind: "Multi-package application",
    title: "flow-mono",
    hero: { lead: "One repo.", accent: "Room to grow." },
    tagline: "A minimal Turborepo with a Next.js app in apps/web and shared UI components in packages/ui.",
    description:
      "A minimal Turborepo template for agent-first Next.js apps: public Assistant (chat, MCP, OpenUI GenUI) and protected Operator diagnostics, with shared UI in its own package.",
    capabilities: [
      "Turborepo with apps/web (Next.js 16, React 19) and packages/ui",
      "Shared shadcn base-nova components and tokens in packages/ui",
      "Public Assistant: chat, GenUI playground, and MCP at /api/mcp",
      "Protected Operator console and MCP, fail-closed behind OPERATOR_SECRET",
      "Eve agent tools, OpenUI Lang GenUI, MCP Streamable HTTP, and MCP Apps",
      "One pnpm qa for lint, types, and tests; offline evals; security checks",
      "Vercel-first: apps/web as project root, or its included vercel.json",
    ],
    quickStart: ["pnpm install", "pnpm setup", "pnpm dev"],
    quickStartNote: "Open the Portless URL (typically http://app.localhost:1355). pnpm setup checks the environment and creates .env.local from the examples.",
    prerequisites: ["Node.js 24+", "pnpm 12.14"],
    repository: "https://github.com/gaboesquivel/flow-mono",
  },
];

export const getStarter = (slug: string) => starters.find((s) => s.slug === slug);

/** Side-by-side comparison rows for the starters index. */
export const comparison: { label: string; values: Record<Starter["slug"], string> }[] = [
  { label: "Layout", values: { "flow-next": "Single Next.js app", "flow-mono": "Turborepo: apps/web + packages/ui" } },
  { label: "Shared UI package", values: { "flow-next": "No; components live in the app", "flow-mono": "Yes; packages/ui" } },
  { label: "Agent surfaces", values: { "flow-next": "Assistant, Operator, MCP, MCP Apps", "flow-mono": "Assistant, Operator, MCP, MCP Apps" } },
  { label: "Quick start", values: { "flow-next": "pnpm setup → pnpm dev", "flow-mono": "pnpm install → pnpm setup → pnpm dev" } },
  { label: "Vercel project root", values: { "flow-next": "Repository root", "flow-mono": "apps/web" } },
  { label: "Choose it when", values: { "flow-next": "One product, one deployable app", "flow-mono": "You expect shared packages or more apps" } },
];
