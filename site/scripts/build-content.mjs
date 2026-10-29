// Builds the site's content index from the repository's authoritative sources.
// Output: content/generated/content.json (gitignored; regenerated on every dev start and build).
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Marked } from 'marked'

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(siteRoot, '..')
const outDir = join(siteRoot, 'content/generated')
const REPO = { owner: 'gaboesquivel', name: 'flow-skills', branch: 'main' }
const repoUrl = `https://github.com/${REPO.owner}/${REPO.name}`

const read = (rel) => readFileSync(join(repoRoot, rel), 'utf8')

/** Curated documentation set: each entry renders one authoritative repository file. */
const DOCS = [
  { slug: 'get-started', source: 'README.md', title: 'Get started', nav: 'Get started', description: 'Install Flow and use your existing agent. Phrases, delivery modes, and work without a spec.' },
  { slug: 'methodology', source: 'docs/methodology.md', title: 'A flexible working practice', nav: 'Methodology', description: 'How the principles apply in practice: intent, evidence, design, connected context, and dogfooding.' },
  { slug: 'principles', source: 'docs/principles.md', title: 'Principles', nav: 'Principles', description: 'Optional methodology themes: validation, observability, agentic, lean, and velocity.' },
  { slug: 'product', source: 'PRODUCT.md', title: 'What Flow is', nav: 'Product', description: 'Mission, definition, the eight principles, success metrics, and the Flow ecosystem.' },
  { slug: 'skill-catalog', source: 'docs/skills.md', title: 'Skill catalog reference', nav: 'Skill catalog', description: 'Every skill, the phrase that reaches it, and when to use it.' },
  { slug: 'agent-compatibility', source: 'docs/agent-compatibility.md', title: 'Agent and host compatibility', nav: 'Agent compatibility', description: 'Install paths, invocation styles, and Flow mode across agent hosts.' },
  { slug: 'glossary', source: 'GLOSSARY.md', title: 'Glossary', nav: 'Glossary', description: 'Project-specific meanings and essential distinctions.' },
]

// ---------- helpers ----------

export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/gu, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/gu, '-')

const stripFrontmatter = (text) => {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/u)
  if (!match) return { data: {}, body: text }
  const data = {}
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/gu, '')
  }
  return { data, body: text.slice(match[0].length) }
}

const plain = (md) =>
  md
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
    .replace(/<[^>]+>/gu, '')
    .replace(/[`*]/gu, '')
    .replace(/[>#|]/gu, ' ')
    .replace(/-{3,}/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()

const skillNames = readdirSync(join(repoRoot, 'skills'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(repoRoot, 'skills', e.name, 'SKILL.md')))
  .map((e) => e.name)
  .sort()

const decisionFiles = readdirSync(join(repoRoot, 'docs/decisions'))
  .filter((f) => /^\d{4}-.+\.md$/u.test(f))
  .sort()

const docBySource = new Map(DOCS.map((d) => [d.source, d]))

/** Map a repository path (posix, relative to repo root) to a site route, or null. */
const siteRouteFor = (repoPath) => {
  const doc = docBySource.get(repoPath)
  if (doc) return `/docs/${doc.slug}`
  if (repoPath === 'skills' || repoPath === 'skills/') return '/skills'
  let m = repoPath.match(/^skills\/([a-z0-9-]+)\/SKILL\.md$/u)
  if (m && skillNames.includes(m[1])) return `/skills/${m[1]}`
  m = repoPath.match(/^skills\/([a-z0-9-]+)\/?$/u)
  if (m && skillNames.includes(m[1])) return `/skills/${m[1]}`
  m = repoPath.match(/^docs\/decisions\/(\d{4}-[a-z0-9-]+)\.md$/u)
  if (m) return `/docs/decisions/${m[1]}`
  if (repoPath === 'docs/decisions/README.md' || repoPath === 'docs/decisions/' || repoPath === 'docs/decisions') return '/docs/decisions'
  return null
}

const rewriteHref = (href, sourcePath, githubBase = `${repoUrl}/blob/${REPO.branch}`) => {
  if (!href || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/iu.test(href)) return href
  if (href.startsWith('#')) return href
  const [pathPart, hash] = href.split('#')
  const resolved = posix.normalize(posix.join(posix.dirname(sourcePath), pathPart))
  const route = githubBase.includes(REPO.name) ? siteRouteFor(resolved) : null
  if (route) return hash ? `${route}#${hash}` : route
  const isDir = !/\.[a-z0-9]+$/iu.test(resolved)
  const base = isDir ? githubBase.replace('/blob/', '/tree/') : githubBase
  return `${base}/${resolved}${hash ? `#${hash}` : ''}`
}

const escapeHtml = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

/** Render markdown to HTML with GitHub-compatible heading ids and site-aware links. */
const render = (markdown, sourcePath, opts = {}) => {
  const headings = []
  const seen = new Map()
  const marked = new Marked({ gfm: true })
  marked.use({
    walkTokens(token) {
      if (token.type === 'link') token.href = rewriteHref(token.href, sourcePath, opts.githubBase)
    },
    renderer: {
      heading({ tokens, depth, text }) {
        const inner = this.parser.parseInline(tokens)
        const base = slugify(text.replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1').replace(/[`*_]/gu, ''))
        const n = seen.get(base) ?? 0
        seen.set(base, n + 1)
        const id = n ? `${base}-${n}` : base
        if (depth === 1 && opts.dropH1) return ''
        if (depth <= 3) headings.push({ id, text: plain(text), depth })
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${inner}</h${depth}>\n`
      },
      code({ text, lang }) {
        if (lang === 'mermaid') {
          return `<p class="diagram-note">This section includes a diagram. <a href="${repoUrl}/blob/${REPO.branch}/${sourcePath}">View it on GitHub</a>.</p>\n`
        }
        const label = lang ? `<span class="code-lang">${escapeHtml(lang)}</span>` : ''
        return `<div class="code-block">${label}<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(text)}</code></pre></div>\n`
      },
      table(token) {
        const html = marked.Renderer.prototype.table.call(this, token)
        return `<div class="table-wrap" role="region" aria-label="Table" tabindex="0">${html}</div>\n`
      },
      // Raw HTML is shown as text, never rendered: starter READMEs come from other repositories.
      html({ text, block }) {
        const anchor = text.trim().match(/^<a id="([\w-]+)">(<\/a>)?$/u)
        if (anchor) return `<a id="${anchor[1]}">${anchor[2] ?? ''}`
        if (text.trim() === '</a>') return '</a>'
        if (/^\s*<!--[\s\S]*-->\s*$/u.test(text)) return ''
        return block ? `<p>${escapeHtml(text.trim())}</p>\n` : escapeHtml(text)
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens)
        if (!/^(?:https?:|mailto:|\/|#)/iu.test(href)) return inner
        const external = /^https?:/u.test(href)
        const t = title ? ` title="${escapeHtml(title)}"` : ''
        return external
          ? `<a href="${escapeHtml(href)}"${t} rel="noopener">${inner}</a>`
          : `<a href="${escapeHtml(href)}"${t}>${inner}</a>`
      },
    },
  })
  const html = marked.parse(markdown)
  // Markdown with links rewritten the same way, for agent-facing Markdown and llms-full.txt.
  const md = markdown.replace(/(\]\()([^)\s]+)((?:\s+"[^"]*")?\))/gu, (_, a, href, b) => `${a}${rewriteHref(href, sourcePath, opts.githubBase)}${b}`)
  return { html, headings, markdown: md }
}

/** Split markdown into heading sections for search. */
const sections = (markdown) => {
  const out = []
  let current = { heading: null, lines: [] }
  let inFence = false
  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) inFence = !inFence
    const m = !inFence && line.match(/^(#{2,3})\s+(.*)$/u)
    if (m) {
      out.push(current)
      current = { heading: plain(m[2]), lines: [] }
    } else current.lines.push(line)
  }
  out.push(current)
  const seen = new Map()
  return out
    .map((s) => {
      let anchor = null
      if (s.heading) {
        const base = slugify(s.heading)
        const n = seen.get(base) ?? 0
        seen.set(base, n + 1)
        anchor = n ? `${base}-${n}` : base
      }
      return { heading: s.heading, anchor, text: plain(s.lines.join('\n')) }
    })
    .filter((s) => s.text.length > 20)
}

// ---------- skills ----------

const parseCatalog = () => {
  const groups = []
  let group = null
  for (const line of read('docs/skills.md').split('\n')) {
    const h = line.match(/^##\s+(.+)$/u)
    if (h) {
      group = { name: h[1].trim(), skills: [] }
      groups.push(group)
      continue
    }
    const row = line.match(/^\|\s*\[([a-z0-9-]+)\]\(\.\.\/skills\/[a-z0-9-]+\/SKILL\.md\)\s*\|\s*"([^"]+)"\s*\|\s*(.+?)\s*\|\s*$/u)
    if (row && group) group.skills.push({ name: row[1], say: row[2], when: row[3] })
  }
  return groups.filter((g) => g.skills.length)
}

const catalogGroups = parseCatalog()
const catalogEntry = new Map()
for (const g of catalogGroups) for (const s of g.skills) catalogEntry.set(s.name, { ...s, group: g.name })

const firstSentences = (text, max = 220) => {
  const sentences = text.match(/.+?[.!?](?=\s|$)/gu) ?? [text]
  let out = ''
  for (const s of sentences) {
    if ((out + s).length > max && out) break
    out += s
  }
  return out.trim()
}

const skills = skillNames.map((name) => {
  const source = `skills/${name}/SKILL.md`
  const { data, body } = stripFrontmatter(read(source))
  const description = data.description ?? ''
  const useWhen = description.match(/Use when the user says (.+)$/u)
  const phrases = useWhen ? [...useWhen[1].matchAll(/"([^"]+)"/gu)].map((m) => m[1]) : []
  const summary = description.replace(/\s*Use when the user says .+$/u, '').trim()
  const entry = catalogEntry.get(name)
  const rendered = render(body, source, { dropH1: true })
  const skillDir = join(repoRoot, 'skills', name)
  const files = readdirSync(skillDir, { recursive: true })
    .map((p) => String(p).split(/[\\/]/u).join('/'))
    .filter((p) => statSync(join(skillDir, p)).isFile())
    .sort()
  return {
    name,
    summary,
    description,
    phrases,
    say: entry?.say ?? phrases[0] ?? null,
    group: entry?.group ?? 'Other',
    when: entry ? firstSentences(plain(render(entry.when, 'docs/skills.md').markdown)) : summary,
    whenMarkdown: entry ? render(entry.when, 'docs/skills.md').markdown : null,
    source,
    files,
    html: rendered.html,
    markdown: rendered.markdown,
    headings: rendered.headings,
  }
})

// ---------- docs ----------

const titleOf = (md) => plain(md.match(/^#\s+(.+)$/mu)?.[1] ?? '')

const docs = DOCS.map((d) => {
  const raw = read(d.source)
  const rendered = render(raw, d.source, { dropH1: true })
  return { ...d, section: 'guide', sourceTitle: titleOf(raw), html: rendered.html, markdown: rendered.markdown, headings: rendered.headings }
})

const STATUSES = ['Accepted', 'Proposed', 'Superseded', 'Amended', 'Deprecated', 'Rejected', 'Withdrawn', 'Dropped']

const decisions = decisionFiles.map((file) => {
  const source = `docs/decisions/${file}`
  const { data, body } = stripFrontmatter(read(source))
  const slug = file.replace(/\.md$/u, '')
  const heading = titleOf(body)
  const [, number = slug.slice(0, 4), rest = heading] = heading.match(/^(\d{4})\s*[.—:-]\s*(.+)$/u) ?? []
  const statusLine = plain(body.match(/^Status:\s*(.+)$/mu)?.[1] ?? '')
  const statusWord = (data.status ?? statusLine).match(/^[A-Za-z]+/u)?.[0]?.toLowerCase() ?? ''
  const status = STATUSES.find((s) => s.toLowerCase() === statusWord) ?? 'Unknown'
  const context = body.match(/##\s+Context\s*\n+([\s\S]*?)(?:\n##\s|$)/u)?.[1] ?? ''
  const rendered = render(body, source, { dropH1: true })
  return {
    slug: `decisions/${slug}`,
    number,
    source,
    title: rest,
    nav: rest,
    status,
    statusNote: statusLine || null,
    date: data.date ?? statusLine.match(/\d{4}-\d{2}-\d{2}/u)?.[0] ?? null,
    supersededBy: data.superseded_by ? `/docs/decisions/${data.superseded_by.replace(/\.md$/u, '')}` : null,
    section: 'decision',
    description: firstSentences(plain(context) || statusLine || plain(body.split('\n').slice(1).join(' ')), 200),
    html: rendered.html,
    markdown: rendered.markdown,
    headings: rendered.headings,
  }
})

// ---------- starters ----------

const STARTERS = ['flow-next', 'flow-mono']

const fetchText = async (url) => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
    return res.ok ? await res.text() : null
  } catch {
    return null
  }
}

const starters = await Promise.all(
  STARTERS.map(async (slug) => {
    const githubBase = `https://github.com/${REPO.owner}/${slug}/blob/main`
    let readme = await fetchText(`https://raw.githubusercontent.com/${REPO.owner}/${slug}/main/README.md`)
    let readmeSource = 'github'
    if (!readme) {
      const sibling = join(repoRoot, '..', slug, 'README.md')
      readme = existsSync(sibling) ? readFileSync(sibling, 'utf8') : null
      readmeSource = readme ? 'local' : 'unavailable'
    }
    if (!readme) return { slug, readmeSource, html: null, markdown: null, headings: [] }
    const rendered = render(readme, 'README.md', { dropH1: true, githubBase })
    return { slug, readmeSource, html: rendered.html, markdown: rendered.markdown, headings: rendered.headings }
  }),
)

// ---------- search chunks ----------

const chunks = []
const pushChunks = ({ kind, url, title, markdown, lead }) => {
  if (lead) chunks.push({ id: `${url}#`, kind, url, title, heading: null, text: lead })
  for (const s of sections(markdown)) {
    chunks.push({
      id: `${url}#${s.anchor ?? ''}${chunks.length}`,
      kind,
      url: s.anchor ? `${url}#${s.anchor}` : url,
      title,
      heading: s.heading && s.heading !== title ? s.heading : null,
      text: s.text.slice(0, 1600),
    })
  }
}
for (const s of skills) pushChunks({ kind: 'skill', url: `/skills/${s.name}`, title: s.name, markdown: s.markdown, lead: `${s.summary} Say "${s.say ?? ''}". ${s.phrases.map((p) => `"${p}"`).join(' ')} ${plain(s.whenMarkdown ?? '')}` })
for (const d of docs) pushChunks({ kind: 'doc', url: `/docs/${d.slug}`, title: d.title, markdown: d.markdown, lead: d.description })
for (const d of decisions) pushChunks({ kind: 'decision', url: `/docs/${d.slug}`, title: `${d.number} — ${d.title}`, markdown: d.markdown, lead: d.description })
for (const s of starters) if (s.markdown) pushChunks({ kind: 'starter', url: `/starters/${s.slug}`, title: s.slug, markdown: s.markdown })

// ---------- invariants ----------
// Fail the build (and the Vercel check on the pull request) when a source format drifts from what this script parses.

const problems = [
  ...skills.filter((s) => s.group === 'Other').map((s) => `skills/${s.name}: no row in docs/skills.md (| [name](../skills/name/SKILL.md) | "phrase" | when |)`),
  ...skills.filter((s) => !s.summary || !s.phrases.length).map((s) => `${s.source}: description needs a summary and 'Use when the user says "…"' phrases`),
  ...decisions.filter((d) => d.status === 'Unknown').map((d) => `${d.source}: no recognizable status (front matter "status:" or a "Status:" line)`),
  ...decisions.filter((d) => !d.title).map((d) => `${d.source}: missing "# NNNN — Title" heading`),
]
if (problems.length) {
  console.error(`content: source format drift\n${problems.map((p) => `  - ${p}`).join('\n')}`)
  process.exit(1)
}

// ---------- write ----------

const commit = (() => {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA
  try {
    return execSync('git rev-parse HEAD', { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return null
  }
})()

const version = JSON.parse(read('package.json')).version

mkdirSync(outDir, { recursive: true })
const content = {
  generatedAt: new Date().toISOString(),
  commit,
  version,
  repo: { ...REPO, url: repoUrl },
  catalogGroups: catalogGroups.map((g) => ({ name: g.name, skills: g.skills.map((s) => s.name) })),
  skills,
  docs,
  decisions,
  starters,
  chunks,
}
writeFileSync(join(outDir, 'content.json'), JSON.stringify(content))
console.log(`content: ${skills.length} skills, ${docs.length} docs, ${decisions.length} decisions, ${starters.filter((s) => s.html).length}/${starters.length} starter READMEs, ${chunks.length} search chunks`)
