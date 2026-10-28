#!/usr/bin/env node
// Flow progress board: read-only kanban of a repository's specs, derived from git.
// Zero dependencies, Node >= 22. Stages: Candidate, Specced, Ready, Building, Shipped.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { basename, dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const COLUMNS = [
  { id: 'candidate', title: 'Candidate' },
  { id: 'specced', title: 'Specced' },
  { id: 'ready', title: 'Ready' },
  { id: 'building', title: 'Building' },
  { id: 'shipped', title: 'Shipped' },
]

const SPEC_DIR = 'docs/specs'
const SPEC_FILE = /^(\d{3})-(.+)\.md$/u

function git(repoRoot, args, input) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', input, stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 })
}

function tryGit(repoRoot, args) {
  try { return git(repoRoot, args).trim() } catch { return null }
}

const refExists = (repoRoot, ref) => Boolean(tryGit(repoRoot, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]))

/**
 * Resolves the default branch: local `main`, `origin/HEAD`'s target, local `master`, then `init.defaultBranch`.
 * Returns `{ name, ref }` with a full refname, or null when none exists.
 */
export function resolveDefaultBranch(repoRoot) {
  if (refExists(repoRoot, 'refs/heads/main')) return { name: 'main', ref: 'refs/heads/main' }
  const originHead = tryGit(repoRoot, ['symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD'])
  if (originHead && refExists(repoRoot, originHead)) return { name: originHead.replace(/^refs\/remotes\//u, ''), ref: originHead }
  if (refExists(repoRoot, 'refs/heads/master')) return { name: 'master', ref: 'refs/heads/master' }
  const configured = tryGit(repoRoot, ['config', '--get', 'init.defaultBranch'])
  if (configured && refExists(repoRoot, `refs/heads/${configured}`)) return { name: configured, ref: `refs/heads/${configured}` }
  return null
}

function listSpecFiles(repoRoot, ref) {
  const out = tryGit(repoRoot, ['ls-tree', '-z', '--name-only', `${ref}:${SPEC_DIR}`])
  if (!out) return []
  return out.split('\0').filter((name) => SPEC_FILE.test(name))
}

/** Reads many `ref:path` blobs with one `git cat-file --batch` pass. */
function readBlobs(repoRoot, objects) {
  if (!objects.length) return []
  const out = execFileSync('git', ['cat-file', '--batch'], { cwd: repoRoot, input: `${objects.join('\n')}\n`, maxBuffer: 64 * 1024 * 1024 })
  const contents = []
  let offset = 0
  for (let i = 0; i < objects.length; i++) {
    const newline = out.indexOf(10, offset)
    const header = out.subarray(offset, newline).toString('utf8')
    offset = newline + 1
    const size = Number(/ blob (\d+)$/u.exec(header)?.[1])
    if (!Number.isFinite(size)) { contents.push(''); continue }
    contents.push(out.subarray(offset, offset + size).toString('utf8'))
    offset += size + 1
  }
  return contents
}

// Results keyed by (repo, default tip, branch tip) so a polling caller re-runs only what changed.
const mergeCache = new Map()

function cached(key, compute) {
  if (mergeCache.size > 10000) mergeCache.clear() // a long-running server sees many default tips
  if (!mergeCache.has(key)) mergeCache.set(key, compute())
  return mergeCache.get(key)
}

/**
 * A branch counts as merged when its tip is not on the default branch's first-parent history (so empty
 * branches cut from the default branch never count) and either it is an ancestor of the default branch or
 * merging it would leave the default branch's tree unchanged (squash merges).
 */
function isMerged(repoRoot, { ref, sha }, { defaultRef, defaultSha, defaultTree, firstParent, ancestors }) {
  if (firstParent.has(sha)) return false
  if (ancestors.has(ref)) return true
  return cached(`merged ${repoRoot} ${defaultSha} ${sha}`, () => {
    const tree = tryGit(repoRoot, ['merge-tree', '--write-tree', defaultRef, sha])
    return Boolean(tree) && tree.split('\n')[0] === defaultTree
  })
}

/**
 * Whether a merged branch carried implementation work: its own changes touch a path outside `docs/`.
 * The branch's own changes are measured from where it forked: for a branch merged by a merge commit, the
 * merge-base with that merge commit's first parent; otherwise the merge-base with the default branch.
 */
function hasImplementationWork(repoRoot, { sha }, { defaultRef, defaultSha, firstParent }) {
  return cached(`impl ${repoRoot} ${defaultSha} ${sha}`, () => {
    let base = null
    const descendants = (tryGit(repoRoot, ['rev-list', '--ancestry-path', `${sha}..${defaultRef}`]) ?? '').split('\n').filter((c) => firstParent.has(c))
    const mergeCommit = descendants.at(-1)
    if (mergeCommit) base = tryGit(repoRoot, ['merge-base', `${mergeCommit}^1`, sha])
    base ??= tryGit(repoRoot, ['merge-base', defaultRef, sha])
    if (!base) return false
    const out = tryGit(repoRoot, ['diff', '-z', '--name-only', base, sha]) ?? ''
    return out.split('\0').filter(Boolean).some((path) => !path.startsWith('docs/'))
  })
}

/**
 * Gathers raw facts from git. Specs come from the default branch; spec files that exist only on unmerged
 * branches are included once each (local before remote, then by name) with `onDefault: false`.
 * Merged branches that match a spec slug carry `implementation`: whether they changed anything outside `docs/`.
 */
export function readSnapshot(repoRoot) {
  const defaultBranch = resolveDefaultBranch(repoRoot)
  if (!defaultBranch) {
    const hasCommits = tryGit(repoRoot, ['rev-parse', '--verify', '--quiet', 'HEAD^{commit}']) || tryGit(repoRoot, ['for-each-ref', '--count=1', 'refs/heads', 'refs/remotes'])
    throw new Error(hasCommits
      ? 'No default branch found (tried main, origin/HEAD, master, init.defaultBranch).'
      : 'No commits yet: commit the specs first, then show the board.')
  }
  const defaultRef = defaultBranch.ref
  const context = {
    defaultRef,
    defaultSha: git(repoRoot, ['rev-parse', `${defaultRef}^{commit}`]).trim(),
    defaultTree: git(repoRoot, ['rev-parse', `${defaultRef}^{tree}`]).trim(),
    firstParent: new Set(git(repoRoot, ['rev-list', '--first-parent', defaultRef]).split('\n').filter(Boolean)),
    ancestors: new Set(git(repoRoot, ['for-each-ref', `--merged=${defaultRef}`, '--format=%(refname)', 'refs/heads', 'refs/remotes']).split('\n').filter(Boolean)),
  }
  const defaultShort = defaultRef.startsWith('refs/remotes/') ? defaultBranch.name.split('/').slice(1).join('/') : defaultBranch.name
  const branches = []
  for (const line of git(repoRoot, ['for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads', 'refs/remotes']).split('\n').filter(Boolean)) {
    const [ref, sha] = line.split(' ')
    if (ref === defaultRef || ref.endsWith('/HEAD')) continue
    const remote = ref.startsWith('refs/remotes/')
    const name = ref.replace(/^refs\/(?:heads|remotes)\//u, '')
    if (remote && name.split('/').slice(1).join('/') === defaultShort) continue
    branches.push({ name, ref, sha, remote, merged: isMerged(repoRoot, { ref, sha }, context) })
  }
  branches.sort((a, b) => Number(a.remote) - Number(b.remote) || a.name.localeCompare(b.name))

  const sources = []
  const seen = new Set()
  for (const file of listSpecFiles(repoRoot, defaultRef)) {
    seen.add(file)
    sources.push({ file, ref: defaultRef, source: defaultBranch.name, onDefault: true, remote: defaultRef.startsWith('refs/remotes/') })
  }
  for (const branch of branches.filter((b) => !b.merged)) {
    for (const file of listSpecFiles(repoRoot, branch.ref)) {
      if (seen.has(file)) continue
      seen.add(file)
      sources.push({ file, ref: branch.ref, source: branch.name, onDefault: false, remote: branch.remote })
    }
  }
  const contents = readBlobs(repoRoot, sources.map((s) => `${s.ref}:${SPEC_DIR}/${s.file}`))
  const specs = sources.map(({ ref, ...rest }, i) => ({ ...rest, content: contents[i] }))

  // Only merged branches that some spec could claim need the (costlier) implementation check.
  const slugs = specs.map((spec) => SPEC_FILE.exec(spec.file)[2])
  for (const branch of branches) {
    if (branch.merged && slugs.some((slug) => matchBranches(slug, [branch]).length)) branch.implementation = hasImplementationWork(repoRoot, branch, context)
  }
  return { repoName: basename(repoRoot), defaultBranch: defaultBranch.name, branches, specs, generatedAt: new Date().toISOString() }
}
/** Status word from the spec header (`Status: draft` or `**Status:** draft`), lowercased; null when absent. */
export function parseStatus(content) {
  const header = content.split(/^## /mu)[0]
  const match = /^\*{0,2}Status\*{0,2}:\*{0,2}\s*(.*)$/imu.exec(header)
  if (!match) return null
  return (/^[a-z]+/iu.exec(match[1].trim())?.[0] ?? '').toLowerCase() || null
}

export function parseTitle(content, fallback) {
  const match = /^#\s+(?:\d{3}:\s*)?(.+)$/mu.exec(content)
  return match ? match[1].trim() : fallback
}

/**
 * Counts tasks in the `## Tasks` section.
 * With `### NN:` task headings, each heading is one task; it is done when its `**Status:**` starts with
 * "done", or when it has checkboxes and all are checked. Without headings, each `- [ ]`/`- [x]` is one task.
 */
export function countTasks(content) {
  const section = /^## Tasks[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/mu.exec(content)
  if (!section) return { done: 0, total: 0 }
  const body = section[1]
  const headings = [...body.matchAll(/^### +\d+[^\n]*\n([\s\S]*?)(?=^### |(?![\s\S]))/gmu)]
  if (headings.length) {
    let done = 0
    for (const [, block] of headings) {
      const status = /^\*\*Status:?\*\*:?\s*(\S+)/imu.exec(block)?.[1]?.toLowerCase() ?? ''
      const boxes = [...block.matchAll(/^\s*[-*] \[([ xX])\]/gmu)]
      if (status.startsWith('done') || (boxes.length && boxes.every((box) => box[1] !== ' '))) done++
    }
    return { done, total: headings.length }
  }
  const boxes = [...body.matchAll(/^\s*[-*] \[([ xX])\]/gmu)]
  return { done: boxes.filter((box) => box[1] !== ' ').length, total: boxes.length }
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')

/**
 * Branches whose last path segment contains the slug on token boundaries (`feat/board`, `feat/012-board`,
 * `feat/board-live`, not `feat/dashboard`). Unmerged before merged, local before remote, then by name.
 */
export function matchBranches(slug, branches) {
  const pattern = new RegExp(`(?:^|[-_])(?:\\d{3}-)?${escapeRegExp(slug)}(?:$|[-_])`, 'u')
  return branches
    .filter((branch) => pattern.test(branch.name.split('/').pop()))
    .sort((a, b) => Number(a.merged) - Number(b.merged) || Number(a.remote) - Number(b.remote) || a.name.localeCompare(b.name))
}

function stageFor({ status, tasks, branches }) {
  const tasksComplete = tasks.total === 0 || tasks.done === tasks.total
  if (status === 'implemented') return { stage: 'shipped', reason: 'status implemented', branch: null }
  // A merge ships only implementation work (`implementation`: changes outside docs/), never a candidate.
  const merged = branches.find((b) => b.merged && b.implementation)
  if (merged && tasksComplete && status !== 'candidate') return { stage: 'shipped', reason: `branch ${merged.name} merged`, branch: merged }
  const open = branches.find((b) => !b.merged)
  if (open) return { stage: 'building', reason: `branch ${open.name}`, branch: open }
  if (tasks.done > 0) return { stage: 'building', reason: 'tasks started', branch: null }
  if (tasks.total > 0) return { stage: 'ready', reason: 'tasks planned', branch: null }
  if (status === 'candidate') return { stage: 'candidate', reason: 'status candidate', branch: null }
  return { stage: 'specced', reason: status === 'draft' ? 'status draft' : 'status unknown', branch: null }
}

const sourceOrder = (a, b) => Number(b.onDefault ?? true) - Number(a.onDefault ?? true)
  || Number(a.remote ?? false) - Number(b.remote ?? false)
  || String(a.source ?? '').localeCompare(String(b.source ?? ''))
  || a.file.localeCompare(b.file)

/**
 * Pure: snapshot -> { columns: [{ id, title, cards }] }. First matching stage rule wins.
 * One card per spec number: the default branch wins, then local before remote branches, then by name;
 * losing files are named in the winner's marker. Branch-only specs are capped at Building.
 */
export function deriveBoard(snapshot) {
  const columns = COLUMNS.map((column) => ({ ...column, cards: [] }))
  const byId = new Map(columns.map((column) => [column.id, column]))
  const byNumber = new Map()
  for (const spec of [...snapshot.specs].sort(sourceOrder)) {
    const number = SPEC_FILE.exec(spec.file)?.[1]
    if (!number) continue
    if (!byNumber.has(number)) byNumber.set(number, { spec, collisions: [] })
    else byNumber.get(number).collisions.push(spec)
  }
  for (const [number, { spec, collisions }] of [...byNumber].sort(([a], [b]) => a.localeCompare(b))) {
    const slug = SPEC_FILE.exec(spec.file)[2]
    const onDefault = spec.onDefault ?? true
    const status = parseStatus(spec.content)
    const tasks = countTasks(spec.content)
    const branches = matchBranches(slug, snapshot.branches ?? [])
    let { stage, reason, branch } = stageFor({ status, tasks, branches })
    if (!onDefault && stage === 'shipped') {
      stage = 'building'
      reason = `on branch ${spec.source}`
      branch = { name: spec.source }
    }
    const markers = []
    if (!status) markers.push('no status line')
    else if (!['candidate', 'draft', 'implemented'].includes(status)) markers.push(`unknown status "${status}"`)
    if (!onDefault) markers.push(`on branch ${spec.source}`)
    const open = tasks.total - tasks.done
    if (stage === 'shipped' && status === 'implemented' && open > 0) markers.push(`status implemented, ${open} task${open === 1 ? '' : 's'} open`)
    for (const other of collisions) markers.push(`number ${number} also used by ${other.file}${other.onDefault === false ? ` on ${other.source}` : ''}`)
    byId.get(stage).cards.push({
      number,
      slug,
      title: parseTitle(spec.content, slug),
      status,
      tasks,
      branch: branch?.name ?? null,
      source: spec.source ?? null,
      reason,
      marker: markers.length ? markers.join('; ') : null,
    })
  }
  return { repoName: snapshot.repoName ?? null, defaultBranch: snapshot.defaultBranch ?? null, generatedAt: snapshot.generatedAt ?? null, columns }
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/gu, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
}

function renderCard(card) {
  const meta = []
  if (card.tasks.total) meta.push(`<span class="progress">${card.tasks.done}/${card.tasks.total}</span>`)
  if (card.branch) meta.push(`<span class="branch">${escapeHtml(card.branch)}</span>`)
  const marker = card.marker ? `<p class="marker">${escapeHtml(card.marker)}</p>` : ''
  return `<li class="card" data-spec="${escapeHtml(card.number)}"><p class="num">${escapeHtml(card.number)}</p><h3>${escapeHtml(card.title)}</h3>${meta.length ? `<p class="meta">${meta.join('')}</p>` : ''}${marker}</li>`
}

const subline = (board) => [board.defaultBranch && `from ${board.defaultBranch}`, board.generatedAt && `generated ${board.generatedAt}`].filter(Boolean).join(' · ')

/**
 * Live page client: polls ./state and rebuilds the columns with the same markup as renderCard, through
 * textContent only. No board data is inlined into the script. Exported for the markup drift test.
 */
export const LIVE_SCRIPT = `(() => {
const main = document.querySelector('main'), sub = document.querySelector('header .sub'), banner = document.getElementById('banner')
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n }
const card = (c) => {
  const li = el('li', 'card'); li.dataset.spec = c.number
  li.append(el('p', 'num', c.number), el('h3', null, c.title))
  const meta = []
  if (c.tasks.total) meta.push(el('span', 'progress', c.tasks.done + '/' + c.tasks.total))
  if (c.branch) meta.push(el('span', 'branch', c.branch))
  if (meta.length) { const p = el('p', 'meta'); p.append(...meta); li.append(p) }
  if (c.marker) li.append(el('p', 'marker', c.marker))
  return li
}
const column = (col) => {
  const s = el('section', 'col'); s.dataset.stage = col.id
  const h = el('h2', null, col.title + ' '); h.append(el('span', 'count', String(col.cards.length)))
  const ul = el('ul'); ul.append(...col.cards.map(card)); s.append(h, ul)
  return s
}
const show = (msg) => { banner.textContent = msg; banner.hidden = !msg }
let last = null
async function poll() {
  try {
    const res = await fetch('state', { cache: 'no-store' })
    if (!(res.headers.get('content-type') || '').includes('json')) show('Board server answered HTTP ' + res.status + ' without board data. Showing the last good board.')
    else {
      const data = await res.json()
      if (!res.ok || data.error) show('Not updating: ' + (data.error || 'HTTP ' + res.status) + '. Showing the last good board.')
      else {
        show('')
        const key = JSON.stringify(data.columns)
        if (key !== last) { last = key; main.replaceChildren(...data.columns.map(column)) }
        sub.textContent = [data.defaultBranch && 'from ' + data.defaultBranch, data.generatedAt && 'generated ' + data.generatedAt].filter(Boolean).join(' · ')
      }
    }
  } catch { show('Board server not reachable. Showing the last good board.') }
  setTimeout(poll, 2000)
}
setTimeout(poll, 2000)
})()`

const LIVE_SCRIPT_HASH = createHash('sha256').update(LIVE_SCRIPT).digest('base64')

/**
 * Self-contained page: inline CSS, no external requests. With `live`, adds an error banner and a script
 * that polls `state` (same origin) every 2 s; without it the page has no script.
 */
export function renderHtml(board, { live = false } = {}) {
  const title = board.repoName ? `${board.repoName} board` : 'Board'
  const columns = board.columns.map((column) => `<section class="col" data-stage="${escapeHtml(column.id)}"><h2>${escapeHtml(column.title)} <span class="count">${column.cards.length}</span></h2><ul>${column.cards.map(renderCard).join('')}</ul></section>`).join('')
  const sub = subline(board)
  // The live page always has a subtitle element for the client to update.
  const subHtml = sub || live ? `<p class="sub">${escapeHtml(sub)}</p>` : ''
  const csp = live ? `default-src 'none'; style-src 'unsafe-inline'; script-src 'sha256-${LIVE_SCRIPT_HASH}'; connect-src 'self'` : "default-src 'none'; style-src 'unsafe-inline'"
  const liveCss = live ? '\n.banner{margin:0 16px 12px;padding:8px 10px;border-radius:6px;background:var(--warn-bg);color:var(--warn);font-size:12px;overflow-wrap:anywhere}' : ''
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<title>${escapeHtml(title)}</title>
<style>
:root{--bg:#f6f6f4;--col:#ecebe7;--card:#fff;--text:#1d1d1b;--muted:#6b6a65;--line:#d9d8d2;--accent:#2f5d8a;--warn:#9a5b00;--warn-bg:#fbf0dc;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--col:#1f1f1d;--card:#2a2a27;--text:#ecebe7;--muted:#a19f97;--line:#3a3a36;--accent:#8db4dc;--warn:#e0a84a;--warn-bg:#33281a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
header{padding:16px}header h1{margin:0;font-size:18px}header p{margin:4px 0 0;color:var(--muted);font-size:12px}${liveCss}
main{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;padding:0 16px 16px}
.col{background:var(--col);border-radius:8px;padding:10px;min-width:0}.col h2{margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.04em}
.count{color:var(--muted);font-weight:400}ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.card{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:8px 10px;overflow-wrap:anywhere}
.card h3{margin:0;font-size:14px;font-weight:600}.num{margin:0;color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums}
.meta{margin:6px 0 0;display:flex;flex-wrap:wrap;gap:6px;font-size:12px}.progress{font-weight:600;color:var(--accent)}
.branch{color:var(--muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.marker{margin:6px 0 0;font-size:12px;color:var(--warn)}
@media (max-width:760px){main{grid-template-columns:1fr}}
</style></head>
<body><header><h1>${escapeHtml(title)}</h1>${subHtml}</header>${live ? '<p id="banner" class="banner" role="status" hidden></p>' : ''}<main>${columns}</main>${live ? `<script>${LIVE_SCRIPT}</script>` : ''}</body></html>
`
}

const flowDir = (repoRoot) => join(git(repoRoot, ['rev-parse', '--path-format=absolute', '--git-common-dir']).trim(), 'flow')

export function defaultOutPath(repoRoot) {
  return join(flowDir(repoRoot), 'board.html')
}

/** Record of the running live board, `{ pid, url, repoRoot }`. Separate from the run overlay (`board.json`). */
export function serverInfoPath(repoRoot) {
  return join(flowDir(repoRoot), 'server.json')
}

function readServerInfo(repoRoot) {
  try {
    const info = JSON.parse(readFileSync(serverInfoPath(repoRoot), 'utf8'))
    return Number.isInteger(info?.pid) && typeof info.url === 'string' ? info : null
  } catch { return null }
}

function writeServerInfo(repoRoot, info) {
  const path = serverInfoPath(repoRoot)
  mkdirSync(dirname(path), { recursive: true })
  const temp = `${path}.${process.pid}.tmp`
  writeFileSync(temp, `${JSON.stringify(info)}\n`)
  renameSync(temp, path)
}

const removeServerInfo = (repoRoot) => rmSync(serverInfoPath(repoRoot), { force: true })

/** A recorded board is live when its pid exists and its URL answers `/state` with JSON (guards pid reuse). */
async function isLive(info) {
  try { process.kill(info.pid, 0) } catch (error) { if (error.code !== 'EPERM') return false }
  try {
    const res = await fetch(new URL('state', info.url), { signal: AbortSignal.timeout(2000) })
    await res.body?.cancel()
    return (res.headers.get('content-type') ?? '').includes('json')
  } catch { return false }
}

const firstLines = (message) => String(message).split('\n').slice(0, 2).join(' ').slice(0, 300)

/**
 * Serves the live board on 127.0.0.1: `/` is the page, `/state` the derived board as JSON. The board is
 * recomputed at most once per `memoMs`, however many tabs poll. A git failure after start makes `/state`
 * answer 500 `{ error }`; the page keeps its last good board and shows a banner. Throws when the first
 * derivation fails; rejects when the port cannot be bound.
 */
export async function startServer({ repoRoot, port = 0, memoMs = 1000 }) {
  let lastGood = deriveBoard(readSnapshot(repoRoot))
  let memo = { at: Date.now(), value: { status: 200, body: lastGood } }
  const state = () => {
    if (Date.now() - memo.at < memoMs) return memo.value
    let value
    try {
      lastGood = deriveBoard(readSnapshot(repoRoot))
      value = { status: 200, body: lastGood }
    } catch (error) {
      value = { status: 500, body: { error: firstLines(error.message) } }
    }
    memo = { at: Date.now(), value }
    return value
  }
  let allowedHosts = []
  const server = createServer((req, res) => {
    const send = (status, type, body) => {
      res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' })
      res.end(req.method === 'HEAD' ? undefined : body)
    }
    // Same-machine hostnames only: blocks DNS-rebinding reads from other sites.
    if (!allowedHosts.includes(req.headers.host)) return send(403, 'text/plain', 'Forbidden\n')
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, 'text/plain', 'Method not allowed\n')
    const path = new URL(req.url, 'http://127.0.0.1').pathname
    if (path === '/state') {
      const { status, body } = state()
      return send(status, 'application/json; charset=utf-8', JSON.stringify(body))
    }
    if (path === '/') {
      state()
      return send(200, 'text/html; charset=utf-8', renderHtml(lastGood, { live: true }))
    }
    return send(404, 'text/plain', 'Not found\n')
  })
  await new Promise((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => { server.off('error', reject); resolveListen() })
  })
  const bound = server.address().port
  allowedHosts = [`127.0.0.1:${bound}`, `localhost:${bound}`]
  const url = `http://127.0.0.1:${bound}/`
  const close = () => new Promise((resolveClose) => { server.close(() => resolveClose()); server.closeAllConnections() })
  return { server, url, close }
}

export const DEFAULT_PORT = 4178

function parseArgs(argv) {
  const args = { once: false, json: false, serve: false, stop: false, port: null, out: null, repo: process.cwd() }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--once') args.once = true
    else if (arg === '--json') args.json = true
    else if (arg === '--serve') args.serve = true
    else if (arg === '--stop') args.stop = true
    else if (arg === '--out' || arg === '--repo' || arg === '--port') {
      const value = argv[++i]
      if (!value || value.startsWith('--')) throw new Error(`${arg} needs a value`)
      args[arg.slice(2)] = value
    } else throw new Error(`Unknown argument: ${arg}`)
  }
  if (args.port !== null) {
    const port = Number(args.port)
    if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error(`--port must be 0-65535: ${args.port}`)
    args.port = port
  }
  if (Number(args.serve) + Number(args.stop) + Number(args.once || args.json) > 1) throw new Error('--serve, --stop, and --once/--json are separate modes')
  return args
}

async function serve(repoRoot, port) {
  const running = readServerInfo(repoRoot)
  if (running) {
    if (await isLive(running)) { console.log(`Board already running at ${running.url} (pid ${running.pid}).`); return 0 }
    removeServerInfo(repoRoot)
  }
  let live
  try {
    try {
      live = await startServer({ repoRoot, port: port ?? DEFAULT_PORT })
    } catch (error) {
      // The fixed default keeps the URL stable across restarts; fall back to any free port when it is taken.
      if (error.code !== 'EADDRINUSE' || port !== null) throw error
      live = await startServer({ repoRoot, port: 0 })
    }
  } catch (error) {
    console.error(error.code === 'EADDRINUSE' ? `Port ${port} is in use.` : error.message)
    return 1
  }
  writeServerInfo(repoRoot, { pid: process.pid, url: live.url, repoRoot })
  console.log(`Board at ${live.url} (pid ${process.pid}). Stop with --stop, Ctrl-C, or kill ${process.pid}.`)
  return new Promise((resolveExit) => {
    const stop = () => {
      // Leave a newer server's record alone.
      if (readServerInfo(repoRoot)?.pid === process.pid) removeServerInfo(repoRoot)
      live.close().then(() => resolveExit(0))
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
  })
}

async function stopServer(repoRoot) {
  const running = readServerInfo(repoRoot)
  if (!running) { console.log('No board is running.'); return 0 }
  if (await isLive(running)) {
    process.kill(running.pid, 'SIGTERM')
    console.log(`Stopped the board at ${running.url} (pid ${running.pid}).`)
  } else console.log('No board was running; removed its stale record.')
  removeServerInfo(repoRoot)
  return 0
}

/** Resolves to the exit code; with `--serve`, once the server stops on SIGINT or SIGTERM. */
export async function main(argv = process.argv.slice(2)) {
  const usage = 'Usage: board.mjs --serve [--port <n>] [--repo <path>] | --stop [--repo <path>] | --once [--out <file>] [--repo <path>] | --json [--repo <path>]'
  let args
  try { args = parseArgs(argv) } catch (error) { console.error(`${error.message}\n${usage}`); return 2 }
  if (!args.once && !args.json && !args.serve && !args.stop) { console.error(usage); return 2 }
  const repoRoot = tryGit(resolve(args.repo), ['rev-parse', '--show-toplevel'])
  if (!repoRoot) { console.error(`Not inside a git repository: ${args.repo}`); return 1 }
  if (args.serve) return serve(repoRoot, args.port)
  if (args.stop) return stopServer(repoRoot)
  let board
  try { board = deriveBoard(readSnapshot(repoRoot)) } catch (error) { console.error(error.message); return 1 }
  if (args.json) console.log(JSON.stringify(board, null, 2))
  if (args.once) {
    const out = args.out ? (isAbsolute(args.out) ? args.out : resolve(args.out)) : defaultOutPath(repoRoot)
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, renderHtml(board))
    console.log(out)
  }
  return 0
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main()
