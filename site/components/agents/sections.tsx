import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowUpRight, ButtonLink, Container, Eyebrow, Headline, Lede, Section } from "@/components/ui";
import { CodeBlock } from "@/components/agents/code-block";
import { CommandLine } from "@/components/command-line";
import { MCP_TOOLS } from "@/lib/markdown-pages";

const iconProps = {
  "aria-hidden": true,
  className: "size-9 text-violet",
  fill: "none",
  focusable: false,
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.5,
  viewBox: "0 0 32 32",
} as const;

const PILLARS: { n: string; title: string; text: string; href: string; cta: string; icon: ReactNode }[] = [
  {
    cta: "Read llms.txt",
    href: "/llms.txt",
    icon: (
      <svg {...iconProps}>
        <circle cx="18" cy="13" r="6" />
        <path d="m13.5 17.5-6 6" />
      </svg>
    ),
    n: "01",
    text: "llms.txt, a sitemap, OpenAPI, and MCP discovery documents point agents to the right skill or guide.",
    title: "Discover",
  },
  {
    cta: "Try the search API",
    href: "/api/search?q=ship",
    icon: (
      <svg {...iconProps}>
        <rect x="7" y="6" width="18" height="20" rx="1.5" />
        <path d="M7 11h18M7 16h18M7 21h18" />
      </svg>
    ),
    n: "02",
    text: "Stable URLs, Markdown for every page, and structured search results with canonical links and excerpts.",
    title: "Retrieve",
  },
  {
    cta: "See the ask example",
    href: "#examples-heading",
    icon: (
      <svg {...iconProps}>
        <path d="M16 4c.9 6.4 5.6 11.1 12 12-6.4.9-11.1 5.6-12 12-.9-6.4-5.6-11.1-12-12 6.4-.9 11.1-5.6 12-12Z" />
      </svg>
    ),
    n: "03",
    text: "Answers grounded in Flow's own sources, with numbered citations that link back to the canonical page.",
    title: "Understand",
  },
];

export function AgentsHero() {
  return (
    <Container className="pb-8 pt-14 sm:pt-20 lg:pt-24">
      <Eyebrow>For agents</Eyebrow>
      <Headline lead="Made for people." accent="Readable by agents." className="mt-6" />
      <Lede className="mt-8">
        Every page people read is also available as Markdown, with a search API, an ask API, and a read-only MCP server beside it. Nothing needs a
        login.
      </Lede>
    </Container>
  );
}

export function PillarsSection() {
  return (
    <Section aria-labelledby="pillars-heading" className="pt-10 sm:pt-14">
      <Container>
        <h2 id="pillars-heading" className="sr-only">
          Discover, retrieve, understand
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {PILLARS.map((p) => (
            <li key={p.title} className="card-prism flex flex-col p-7">
              {p.icon}
              <p className="label-mono mt-8">
                {p.n} / {p.title}
              </p>
              <h3 className="headline mt-3 text-[1.7rem] text-fg">{p.title}</h3>
              <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-fg-muted">{p.text}</p>
              <Link href={p.href} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-lavender hover:text-lavender-soft">
                {p.cta}
                <ArrowUpRight className="size-3" />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

type Contract = { method: string; path: string; href?: string; text: ReactNode };

const CONTRACTS: Contract[] = [
  { href: "/llms.txt", method: "GET", path: "/llms.txt", text: "Curated entry point: every skill, guide, decision, starter, and interface, with Markdown links." },
  { href: "/llms-full.txt", method: "GET", path: "/llms-full.txt", text: "Every guide and skill as one Markdown document, with source paths and the content commit." },
  { href: "/api/search?q=ship", method: "GET", path: "/api/search?q=", text: "Ranked results with canonical URLs and excerpts. Optional limit (1–25) and kind (skill, doc, decision, starter)." },
  { method: "POST", path: "/api/ask", text: <>Source-grounded answer with numbered citations. Send {'{"question": "…"}'}; add ?stream=1 to stream text.</> },
  {
    method: "MCP",
    path: "/api/mcp",
    text: (
      <>
        Streamable HTTP, stateless, read-only. Tools:{" "}
        {MCP_TOOLS.map((t, i) => (
          <span key={t}>
            {i > 0 ? ", " : null}
            <code className="font-mono text-[0.82rem] text-lavender">{t}</code>
          </span>
        ))}
        . Also at /mcp.
      </>
    ),
  },
  { href: "/agents.md", method: "GET", path: "/<page>.md", text: <>Markdown for any page: append .md (home is /index.md) or send Accept: text/markdown.</> },
  { href: "/openapi.json", method: "GET", path: "/openapi.json", text: "OpenAPI 3.1 for search, ask, and the MCP endpoint, including the error schema." },
  { href: "/.well-known/mcp.json", method: "GET", path: "/.well-known/mcp.json", text: "MCP discovery, with the server card at /.well-known/mcp/server-card.json and an AI catalog." },
  { href: "/sitemap.xml", method: "GET", path: "/sitemap.xml", text: "Every page on the site, for crawlers and agents that walk the whole catalog." },
];

export function ContractsSection() {
  return (
    <Section>
      <Container>
        <Eyebrow>Public contracts</Eyebrow>
        <Headline as="h2" size="lg" lead="Clear capabilities." accent="Small surface area." className="mt-5" />
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {CONTRACTS.map((c) => (
            <li key={c.path} className="card relative p-6">
              <p className="font-mono text-[0.95rem] text-fg">
                <span className="text-pink">{c.method}</span>{" "}
                {c.href ? (
                  <Link href={c.href} className="after:absolute after:inset-0 hover:text-lavender">
                    {c.path}
                  </Link>
                ) : (
                  c.path
                )}
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">{c.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-fg-subtle">
          All interfaces are live, public, and read-only. Errors are JSON with code, error, resolution, and type; rate limits answer 429 with Retry-After.
        </p>
      </Container>
    </Section>
  );
}

export function ExamplesSection({ origin }: { origin: string }) {
  const mcpConfig = JSON.stringify({ mcpServers: { flow: { type: "http", url: `${origin}/api/mcp` } } }, null, 2);
  const mcpCall = `curl -s ${origin}/api/mcp \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json, text/event-stream' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_skill","arguments":{"name":"build"}}}'`;
  return (
    <Section aria-labelledby="examples-heading" className="pt-0 sm:pt-0">
      <Container>
        <Eyebrow>Try it</Eyebrow>
        <h2 id="examples-heading" className="headline mt-5 text-[clamp(1.8rem,3.4vw,2.4rem)] text-fg">
          Copy, paste, read.
        </h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-4">
            <CommandLine command={`curl -s ${origin}/llms.txt`} />
            <CommandLine command={`curl -s '${origin}/api/search?q=ship&limit=3'`} />
            <CommandLine command={`curl -s -H 'Accept: text/markdown' ${origin}/skills/build`} />
            <CommandLine command={`curl -s ${origin}/api/ask -H 'Content-Type: application/json' -d '{"question":"How do I ship a change?"}'`} />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <CodeBlock label="MCP client config" code={mcpConfig} />
            <CodeBlock label="MCP tool call" code={mcpCall} />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function ObservableSection({ host }: { host: string }) {
  return (
    <Section aria-labelledby="observable-heading" className="pt-0 sm:pt-0">
      <Container>
        <Eyebrow>Verify the result</Eyebrow>
        <h2 id="observable-heading" className="headline mt-5 text-[clamp(2.4rem,5.2vw,3.6rem)] text-fg">
          Agent-ready is observable.
        </h2>
        <Lede className="mt-6 text-lg sm:text-lg">
          Check the HTML, Markdown responses, API discovery, structured errors, and real agent journeys yourself, and report what you measure.
        </Lede>
        <CommandLine command={`npx is-agentic ${host}`} className="mt-8 max-w-xl" />
        <div className="mt-8">
          <ButtonLink href="https://is-agentic.com">Explore Is Agentic</ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
