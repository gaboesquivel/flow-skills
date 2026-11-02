// Pure content helpers shared by build-content.mjs and its tests: rendering, diagrams, and the publishing contract.
// Nothing here reads the repository or the network; callers pass sources in.
import { posix } from 'node:path'
import { renderMermaidSVG } from 'beautiful-mermaid'
import { Marked } from 'marked'

export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/gu, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/gu, '-')

/** Flat scalar front matter. Duplicate keys are reported, never resolved silently. */
export const parseFrontmatter = (text) => {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/u)
  if (!match) return { data: {}, body: text, duplicates: [] }
  const data = {}
  const duplicates = []
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':')
    if (i <= 0) continue
    const key = line.slice(0, i).trim()
    if (key in data) duplicates.push(key)
    data[key] = line.slice(i + 1).trim().replace(/^["']|["']$/gu, '')
  }
  return { data, body: text.slice(match[0].length), duplicates }
}

export const plain = (md) =>
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

export const escapeHtml = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

// ---------- diagrams ----------

const DIAGRAM_COLORS = { bg: '#1a1725', fg: '#f5f3fb', accent: '#c9b8ff', line: '#8f88a3' }

/** Strip anything active from renderer output; the SVG is also only ever shown through <img>, which runs no script and loads nothing. */
export const sanitizeSvg = (svg) =>
  svg
    .replace(/@import[^;]*;/gu, '')
    .replace(/<script[\s\S]*?<\/script\s*>/giu, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/giu, '')
    .replace(/\s(?:on[a-z]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/giu, '')
    .replace(/\s(?:xlink:)?href\s*=\s*(?:"(?!#)[^"]*"|'(?!#)[^']*')/giu, '')

/** Render one Mermaid block to a static, accessible figure. Throws with a reason when the source is unsafe or invalid. */
export const renderDiagram = (source, { requireTitle = false } = {}) => {
  const lines = source.split('\n')
  const accTitle = lines.map((l) => l.match(/^\s*accTitle\s*:\s*(.+)$/u)?.[1]).find(Boolean)?.trim()
  const accDescr = lines.map((l) => l.match(/^\s*accDescr\s*:\s*(.+)$/u)?.[1]).find(Boolean)?.trim()
  if (requireTitle && !accTitle) throw new Error('diagram needs an "accTitle:" line naming it')
  if (lines.some((l) => /^\s*click\s/u.test(l))) throw new Error('diagram interactions ("click") are not allowed')
  if (/%%\{/u.test(source)) throw new Error('diagram directives ("%%{...}%%") are not allowed')
  if (/<(?!br\s*\/?>)[a-z/!]/iu.test(source)) throw new Error('HTML in diagram labels is not allowed')
  const drawable = lines.filter((l) => !/^\s*acc(Title|Descr)\s*:/u.test(l)).join('\n')
  let svg
  try {
    svg = renderMermaidSVG(drawable, DIAGRAM_COLORS)
  } catch (error) {
    throw new Error(`invalid Mermaid: ${error instanceof Error ? error.message : String(error)}`)
  }
  svg = sanitizeSvg(String(svg))
  const width = svg.match(/<svg[^>]*\swidth="(\d+(?:\.\d+)?)"/u)?.[1]
  const height = svg.match(/<svg[^>]*\sheight="(\d+(?:\.\d+)?)"/u)?.[1]
  const alt = accTitle ? `${accTitle}${accDescr ? `: ${accDescr}` : ''}` : 'Diagram, explained in the surrounding text'
  const size = width && height ? ` width="${Math.round(Number(width))}" height="${Math.round(Number(height))}"` : ''
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  return `<figure class="diagram"><img src="${src}" alt="${escapeHtml(alt)}"${size} loading="lazy" decoding="async" />${
    accDescr ? `<figcaption>${escapeHtml(accDescr)}</figcaption>` : ''
  }<details class="diagram-source"><summary>Diagram source</summary><pre><code class="language-mermaid">${escapeHtml(source)}</code></pre></details></figure>\n`
}

// ---------- rendering ----------

/**
 * Markdown renderer bound to a repository's site routes.
 * `siteRouteFor(repoPath)` maps a repository path to a site route or null (then links go to GitHub).
 */
export const createRenderer = ({ repoUrl, branch, repoName, siteRouteFor }) => {
  const rewriteHref = (href, sourcePath, githubBase = `${repoUrl}/blob/${branch}`) => {
    if (!href || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/iu.test(href)) return href
    if (href.startsWith('#')) return href
    const [pathPart, hash] = href.split('#')
    const resolved = posix.normalize(posix.join(posix.dirname(sourcePath), pathPart))
    const route = githubBase.includes(repoName) ? siteRouteFor(resolved) : null
    if (route) return hash ? `${route}#${hash}` : route
    const isDir = !/\.[a-z0-9]+$/iu.test(resolved)
    const base = isDir ? githubBase.replace('/blob/', '/tree/') : githubBase
    return `${base}/${resolved}${hash ? `#${hash}` : ''}`
  }

  /**
   * Render markdown to HTML with GitHub-compatible heading ids and site-aware links.
   * Options: dropH1; githubBase (another repository: diagrams stay escaped source); problems (array that collects
   * diagram failures as "path:line: reason"); requireDiagramTitles.
   */
  const render = (markdown, sourcePath, opts = {}) => {
    const headings = []
    const seen = new Map()
    const marked = new Marked({ gfm: true })
    const trusted = !opts.githubBase
    const lineOf = (text) => {
      const at = markdown.indexOf(text)
      return (at < 0 ? 0 : markdown.slice(0, at).split('\n').length) + (opts.lineOffset ?? 0)
    }
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
            // Diagrams from other repositories are never rendered: escaped source plus the surrounding explanation.
            if (trusted) {
              try {
                return renderDiagram(text, { requireTitle: opts.requireDiagramTitles })
              } catch (error) {
                const reason = `${sourcePath}:${lineOf(text)}: ${error instanceof Error ? error.message : String(error)}`
                if (opts.problems) opts.problems.push(reason)
                else throw new Error(reason)
                return ''
              }
            }
            return `<div class="code-block"><span class="code-lang">mermaid</span><pre><code class="language-mermaid">${escapeHtml(text)}</code></pre></div>\n`
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

  return { render, rewriteHref }
}

/** Split markdown into heading sections for search. */
export const sections = (markdown) => {
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

// ---------- publishing contract (spec 057) ----------

export const CAPABILITY_GROUPS = ['Delivery & Execution', 'Trust & Reliability', 'Knowledge & Architecture']

const KEYS = {
  capability: ['title', 'description', 'status', 'published', 'updated', 'group'],
  article: ['title', 'description', 'status', 'published', 'updated', 'capability', 'video_url', 'transcript'],
}

const isIsoDate = (s) => /^\d{4}-\d{2}-\d{2}$/u.test(s ?? '') && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s)

/** Supported video providers become a privacy-enhanced embed URL; anything else is rejected. */
export const videoEmbedUrl = (url) => {
  let u
  try {
    u = new URL(url)
  } catch {
    return null
  }
  if (u.protocol !== 'https:') return null
  const host = u.hostname.replace(/^www\./u, '')
  const id = /^[\w-]{6,20}$/u
  if (host === 'youtube.com' && u.pathname === '/watch' && id.test(u.searchParams.get('v') ?? '')) return `https://www.youtube-nocookie.com/embed/${u.searchParams.get('v')}`
  if (host === 'youtu.be' && id.test(u.pathname.slice(1))) return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`
  const vimeo = host === 'vimeo.com' && u.pathname.match(/^\/(\d{6,12})$/u)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

/** True when each Mermaid block has ordinary prose right before or after it. */
const diagramsHaveProse = (body) => {
  const lines = body.split('\n')
  const isProse = (l) => l !== undefined && /^\s*[^\s#|`>-]/u.test(l) && !/^\s*(?:\d+\.|\*)\s/u.test(l)
  const nearest = (from, step) => {
    for (let i = from; i >= 0 && i < lines.length; i += step) if (lines[i]?.trim()) return lines[i]
    return undefined
  }
  const missing = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]?.trim() !== '```mermaid') continue
    let end = i + 1
    while (end < lines.length && lines[end]?.trim() !== '```') end++
    if (!isProse(nearest(i - 1, -1)) && !isProse(nearest(end + 1, 1))) missing.push(i + 1)
    i = end
  }
  return missing
}

/**
 * Read the curated sources of one collection ("capability" or "article"). Returns published entries' metadata and problems.
 * `read(path)` returns file text or null; listed drafts are skipped; anything malformed is a problem, never published.
 * @param {{ kind: 'capability' | 'article', sources: string[], read: (path: string) => string | null | undefined, capabilitySlugs?: Set<string>, exists?: (path: string) => boolean }} options
 */
export const readCollection = ({ kind, sources, read, capabilitySlugs = new Set(), exists = () => false }) => {
  const problems = []
  const entries = []
  const slugs = new Set()
  for (const source of sources) {
    const slug = posix.basename(source).replace(/\.md$/u, '')
    const fail = (reason) => problems.push(`${source}: ${reason}`)
    if (slugs.has(slug)) {
      fail(`duplicate ${kind} route /${slug}`)
      continue
    }
    slugs.add(slug)
    const text = read(source)
    if (text === null || text === undefined) {
      fail('listed but missing')
      continue
    }
    const { data, body, duplicates } = parseFrontmatter(text)
    if (duplicates.length) fail(`duplicate front matter keys: ${duplicates.join(', ')}`)
    const unknown = Object.keys(data).filter((k) => !KEYS[kind].includes(k))
    if (unknown.length) fail(`unknown front matter keys: ${unknown.join(', ')}`)
    if (data.status !== 'published' && data.status !== 'draft') {
      fail(`status must be "draft" or "published", got ${data.status ? `"${data.status}"` : 'nothing'}`)
      continue
    }
    if (data.status === 'draft' || duplicates.length || unknown.length) continue
    const before = problems.length
    if (!data.title) fail('title is required')
    if (!data.description) fail('description is required')
    if (!isIsoDate(data.published)) fail('published must be an ISO date (YYYY-MM-DD)')
    if (!isIsoDate(data.updated)) fail('updated must be an ISO date (YYYY-MM-DD)')
    else if (isIsoDate(data.published) && data.updated < data.published) fail('updated is before published')
    if (kind === 'capability' && !CAPABILITY_GROUPS.includes(data.group)) fail(`group must be one of: ${CAPABILITY_GROUPS.join(', ')}`)
    if (kind === 'article' && !capabilitySlugs.has(data.capability)) fail(`capability "${data.capability ?? ''}" is not a published capability`)
    if (data.video_url && !videoEmbedUrl(data.video_url)) fail('video_url must be an HTTPS YouTube or Vimeo video URL')
    if (data.transcript && !/^docs\/blog\/transcripts\/[a-z0-9-]+\.md$/u.test(data.transcript)) fail('transcript must be a path under docs/blog/transcripts/')
    else if (data.transcript && !exists(data.transcript)) fail(`transcript ${data.transcript} does not exist`)
    const offset = text.slice(0, text.length - body.length).split('\n').length - 1
    for (const line of diagramsHaveProse(body)) fail(`line ${line + offset}: a diagram needs an adjacent prose explanation`)
    if (problems.length > before) continue
    entries.push({ kind, slug, source, data, body, lineOffset: offset })
  }
  return { entries, problems }
}
