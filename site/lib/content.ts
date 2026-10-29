import raw from "@/content/generated/content.json";

export type Heading = { id: string; text: string; depth: number };

export type Skill = {
  name: string;
  summary: string;
  description: string;
  phrases: string[];
  say: string | null;
  group: string;
  when: string;
  whenMarkdown: string | null;
  source: string;
  files: string[];
  html: string;
  markdown: string;
  headings: Heading[];
};

export type Doc = {
  slug: string;
  source: string;
  title: string;
  nav: string;
  description: string;
  section: "guide" | "decision";
  sourceTitle?: string;
  number?: string;
  status?: string;
  html: string;
  markdown: string;
  headings: Heading[];
};

export type StarterReadme = {
  slug: string;
  readmeSource: "github" | "local" | "unavailable";
  html: string | null;
  markdown: string | null;
  headings: Heading[];
};

export type ChunkKind = "skill" | "doc" | "decision" | "starter";

export type Chunk = {
  id: string;
  kind: ChunkKind;
  url: string;
  title: string;
  heading: string | null;
  text: string;
};

type Content = {
  generatedAt: string;
  commit: string | null;
  version: string;
  repo: { owner: string; name: string; branch: string; url: string };
  catalogGroups: { name: string; skills: string[] }[];
  skills: Skill[];
  docs: Doc[];
  decisions: Doc[];
  starters: StarterReadme[];
  chunks: Chunk[];
};

export const content = raw as unknown as Content;

export const repo = content.repo;
export const skills = content.skills;
export const guides = content.docs;
export const decisions = content.decisions;
export const catalogGroups = content.catalogGroups;
export const chunks = content.chunks;

export const getSkill = (name: string) => skills.find((s) => s.name === name);
export const getDoc = (slug: string) =>
  guides.find((d) => d.slug === slug) ?? decisions.find((d) => d.slug === slug);
export const getStarterReadme = (slug: string) => content.starters.find((s) => s.slug === slug);

/** GitHub URL for a file in this repository at the built revision's branch. */
export const sourceUrl = (path: string) => `${repo.url}/blob/${repo.branch}/${path}`;

/** Skills in catalog order (docs/skills.md), then any not listed there. */
export const skillsInCatalogOrder = () => {
  const order = catalogGroups.flatMap((g) => g.skills);
  return [...skills].sort((a, b) => {
    const ia = order.indexOf(a.name);
    const ib = order.indexOf(b.name);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
};

export const installCommand = (skill?: string) =>
  `npx skills add ${repo.owner}/${repo.name}${skill ? ` -s ${skill}` : ""}`;
