#!/usr/bin/env node
// Flow progress board: read-only kanban of a repository's specs, derived from git.
// Zero dependencies, Node >= 22. Stages: Candidate, Specced, Ready, Building, Shipped.
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
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

function git(repoRoot, args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024 })
}

function tryGit(repoRoot, args) {
  try { return git(repoRoot, args).trim() } catch { return null }
}

/** Resolves the default branch ref: local `main`, else `origin/HEAD`'s target, else `master`. */
export function resolveDefaultBranch(repoRoot) {
  if (tryGit(repoRoot, ['rev-parse', '--verify', '--quiet', 'refs/heads/main'])) return 'main'
  const originHead = tryGit(repoRoot, ['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD'])
  if (originHead) return originHead
  if (tryGit(repoRoot, ['rev-parse', '--verify', '--quiet', 'refs/heads/master'])) return 'master'
  return null
}

function listSpecFiles(repoRoot, ref) {
  const out = tryGit(repoRoot, ['ls-tree', '--name-only', `${ref}:${SPEC_DIR}`])
  if (!out) return []
  return out.split('\n').filter((name) => SPEC_FILE.test(name))
}

/**
 * Gathers raw facts from git. Specs come from the default branch; a spec file that exists only on
 * another branch (a spec drafted on its branch) is included with `source` set to that branch.
 */
export function readSnapshot(repoRoot) {
  const defaultBranch = resolveDefaultBranch(repoRoot)
  const defaultTip = defaultBranch ? tryGit(repoRoot, ['rev-parse', '--verify', '--quiet', `${defaultBranch}^{commit}`]) : null
  const merged = new Set(defaultBranch
    ? (tryGit(repoRoot, ['for-each-ref', `--merged=${defaultBranch}`, '--format=%(refname)', 'refs/heads', 'refs/remotes']) ?? '').split('\n').filter(Boolean)
    : [])
  const branches = []
  const refs = (tryGit(repoRoot, ['for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads', 'refs/remotes']) ?? '').split('\n').filter(Boolean)
  for (const line of refs) {
    const [ref, sha] = line.split(' ')
    const remote = ref.startsWith('refs/remotes/')
    const name = ref.replace(/^refs\/(?:heads|remotes)\//u, '')
    if (name.endsWith('/HEAD') || name === 'HEAD') continue
    if (name === defaultBranch || (remote && defaultBranch && name.split('/').slice(1).join('/') === defaultBranch.split('/').pop())) continue
    // A branch still at the default tip has no work of its own yet; do not call it merged.
    branches.push({ name, remote, merged: merged.has(ref) && sha !== defaultTip })
  }

  const specs = []
  const seen = new Set()
  if (defaultBranch) {
    for (const file of listSpecFiles(repoRoot, defaultBranch)) {
      seen.add(file)
      specs.push({ file, source: defaultBranch, content: git(repoRoot, ['show', `${defaultBranch}:${SPEC_DIR}/${file}`]) })
    }
  }
  for (const branch of branches.filter((b) => !b.merged)) {
    for (const file of listSpecFiles(repoRoot, branch.name)) {
      if (seen.has(file)) continue
      seen.add(file)
      specs.push({ file, source: branch.name, content: git(repoRoot, ['show', `${branch.name}:${SPEC_DIR}/${file}`]) })
    }
  }
  return { repoName: basename(repoRoot), defaultBranch, branches, specs, generatedAt: new Date().toISOString() }
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

/** Branches whose last path segment contains the slug. Unmerged before merged, local before remote. */
export function matchBranches(slug, branches) {
  return branches
    .filter((branch) => branch.name.split('/').pop().includes(slug))
    .sort((a, b) => Number(a.merged) - Number(b.merged) || Number(a.remote) - Number(b.remote) || a.name.localeCompare(b.name))
}

function stageFor({ status, tasks, branches }) {
  if (status === 'implemented') return { stage: 'shipped', reason: 'status implemented' }
  const merged = branches.find((b) => b.merged)
  if (merged) return { stage: 'shipped', reason: `branch ${merged.name} merged` }
  const open = branches.find((b) => !b.merged)
  if (open) return { stage: 'building', reason: `branch ${open.name}` }
  if (tasks.done > 0) return { stage: 'building', reason: 'tasks started' }
  if (tasks.total > 0) return { stage: 'ready', reason: 'tasks planned' }
  if (status === 'candidate') return { stage: 'candidate', reason: 'status candidate' }
  return { stage: 'specced', reason: status === 'draft' ? 'status draft' : 'status unknown' }
}

/** Pure: snapshot -> { columns: [{ id, title, cards }] }. First matching stage rule wins. */
export function deriveBoard(snapshot) {
  const columns = COLUMNS.map((column) => ({ ...column, cards: [] }))
  const byId = new Map(columns.map((column) => [column.id, column]))
  const specs = [...snapshot.specs].sort((a, b) => a.file.localeCompare(b.file))
  for (const spec of specs) {
    const [, number, slug] = SPEC_FILE.exec(spec.file) ?? []
    if (!number) continue
    const status = parseStatus(spec.content)
    const tasks = countTasks(spec.content)
    const branches = matchBranches(slug, snapshot.branches ?? [])
    const { stage, reason } = stageFor({ status, tasks, branches })
    let marker = null
    if (!status) marker = 'no status line'
    else if (!['candidate', 'draft', 'implemented'].includes(status)) marker = `unknown status "${status}"`
    byId.get(stage).cards.push({
      number,
      slug,
      title: parseTitle(spec.content, slug),
      status,
      tasks,
      branch: branches[0]?.name ?? null,
      source: spec.source ?? null,
      reason,
      marker,
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

/** Self-contained page: inline CSS, no external requests. */
export function renderHtml(board) {
  const title = board.repoName ? `${board.repoName} board` : 'Board'
  const columns = board.columns.map((column) => `<section class="col" data-stage="${escapeHtml(column.id)}"><h2>${escapeHtml(column.title)} <span class="count">${column.cards.length}</span></h2><ul>${column.cards.map(renderCard).join('')}</ul></section>`).join('')
  const sub = [board.defaultBranch && `from ${board.defaultBranch}`, board.generatedAt && `generated ${board.generatedAt}`].filter(Boolean).join(' · ')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
:root{--bg:#f6f6f4;--col:#ecebe7;--card:#fff;--text:#1d1d1b;--muted:#6b6a65;--line:#d9d8d2;--accent:#2f5d8a;--warn:#9a5b00;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--col:#1f1f1d;--card:#2a2a27;--text:#ecebe7;--muted:#a19f97;--line:#3a3a36;--accent:#8db4dc;--warn:#e0a84a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
header{padding:16px}header h1{margin:0;font-size:18px}header p{margin:4px 0 0;color:var(--muted);font-size:12px}
main{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;padding:0 16px 16px}
.col{background:var(--col);border-radius:8px;padding:10px;min-width:0}.col h2{margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.04em}
.count{color:var(--muted);font-weight:400}ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.card{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:8px 10px;overflow-wrap:anywhere}
.card h3{margin:0;font-size:14px;font-weight:600}.num{margin:0;color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums}
.meta{margin:6px 0 0;display:flex;flex-wrap:wrap;gap:6px;font-size:12px}.progress{font-weight:600;color:var(--accent)}
.branch{color:var(--muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.marker{margin:6px 0 0;font-size:12px;color:var(--warn)}
@media (max-width:760px){main{grid-template-columns:1fr}}
</style></head>
<body><header><h1>${escapeHtml(title)}</h1>${sub ? `<p>${escapeHtml(sub)}</p>` : ''}</header><main>${columns}</main></body></html>
`
}

export function defaultOutPath(repoRoot) {
  const common = git(repoRoot, ['rev-parse', '--path-format=absolute', '--git-common-dir']).trim()
  return join(common, 'flow', 'board.html')
}

function parseArgs(argv) {
  const args = { once: false, json: false, out: null, repo: process.cwd() }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--once') args.once = true
    else if (arg === '--json') args.json = true
    else if (arg === '--out') args.out = argv[++i]
    else if (arg === '--repo') args.repo = argv[++i]
    else throw new Error(`Unknown argument: ${arg}`)
  }
  return args
}

export function main(argv = process.argv.slice(2)) {
  const usage = 'Usage: board.mjs --once [--out <file>] [--repo <path>] | --json [--repo <path>]'
  let args
  try { args = parseArgs(argv) } catch (error) { console.error(`${error.message}\n${usage}`); return 2 }
  if (!args.once && !args.json) { console.error(usage); return 2 }
  const repoRoot = tryGit(resolve(args.repo), ['rev-parse', '--show-toplevel'])
  if (!repoRoot) { console.error(`Not inside a git repository: ${args.repo}`); return 1 }
  const board = deriveBoard(readSnapshot(repoRoot))
  if (args.json) console.log(JSON.stringify(board, null, 2))
  if (args.once) {
    const out = args.out ? (isAbsolute(args.out) ? args.out : resolve(args.out)) : defaultOutPath(repoRoot)
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, renderHtml(board))
    console.log(out)
  }
  return 0
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main()
