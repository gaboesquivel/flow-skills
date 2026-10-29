/**
 * Delivery metrics from git, GitHub, and the skill tree (PRODUCT.md Success). Maintainer tool; read-only.
 *   node scripts/metrics.mjs [--repo owner/name] [--limit 50]
 * Works on flow-next and flow-mono through --repo. Idea → prod joins Claude Code session logs (~/.claude/projects) to merges
 * and production deployments; other hosts' changes count as unlinked.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const minutes = (from, to) => (Date.parse(to) - Date.parse(from)) / 60_000

export function percentile(values, p) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)]
}

// prs: merged pull requests with commits; runs: CI workflow runs for pull_request events.
export function summarize({ prs, runs }) {
  const closeTimes = prs.map((pr) => {
    const first = pr.commits.map((c) => c.committedDate).sort()[0] ?? pr.createdAt
    return minutes(first, pr.mergedAt)
  })
  const branches = new Set(prs.map((pr) => pr.headRefName))
  const prRuns = runs.filter((run) => branches.has(run.headBranch) && run.conclusion !== 'cancelled' && run.conclusion !== 'skipped')
  const failed = prRuns.filter((run) => run.conclusion === 'failure')
  const greenWaits = prRuns.filter((run) => run.conclusion === 'success').map((run) => minutes(run.createdAt, run.updatedAt))
  const failedBranches = new Set(failed.map((run) => run.headBranch))
  return {
    mergedPrs: prs.length,
    closePrMinutes: { median: percentile(closeTimes, 50), p90: percentile(closeTimes, 90) },
    ciRuns: prRuns.length,
    ciFailureRate: prRuns.length ? failed.length / prRuns.length : null,
    prsWithRedCi: prs.length ? failedBranches.size / prs.length : null,
    ciWaitMinutes: { median: percentile(greenWaits, 50), p90: percentile(greenWaits, 90) },
  }
}

const DELIVERY_PHRASE = /\b(push|build|ship) it\b/iu

// One session log (JSONL text) → the branches it worked on, the pull requests it linked, and its human prompts.
export function parseSession(text) {
  const session = { cwd: null, branches: new Set(), prs: [], prompts: [] }
  for (const line of text.split('\n')) {
    let entry
    try { entry = JSON.parse(line) } catch { continue }
    if (entry.type === 'pr-link') session.prs.push({ repo: entry.prRepository, number: entry.prNumber })
    if (entry.gitBranch) session.branches.add(entry.gitBranch)
    if (entry.cwd && !session.cwd) session.cwd = entry.cwd
    if (entry.type !== 'user' || entry.isMeta || entry.isSidechain || !entry.timestamp) continue
    const content = entry.message?.content
    const text = typeof content === 'string' ? content : Array.isArray(content) && !content.some((part) => part.type === 'tool_result') ? content.filter((part) => part.type === 'text').map((part) => part.text).join('\n') : ''
    if (text && !text.startsWith('<')) session.prompts.push({ at: entry.timestamp, text })
  }
  return session
}

// prs: merged pull requests ({ number, headRefName, mergedAt, liveAt? }); sessions: parseSession results.
// A pull request links to every session that opened it or worked on its branch in this repository.
export function ideaToProd({ prs, sessions, repo }) {
  const name = repo.split('/').pop()
  const changes = prs.map((pr) => {
    const linked = sessions.filter((s) =>
      s.prs.some((link) => link.repo === repo && link.number === pr.number) ||
      (s.branches.has(pr.headRefName) && (s.cwd ?? '').includes(`/${name}`)))
    const end = pr.liveAt ?? pr.mergedAt
    const prompts = linked.flatMap((s) => s.prompts).filter((p) => p.at <= end).sort((a, b) => a.at.localeCompare(b.at))
    if (!prompts.length) return { number: pr.number, linked: false }
    const phrase = prompts.findIndex((p) => DELIVERY_PHRASE.test(p.text))
    return {
      number: pr.number,
      linked: true,
      minutes: minutes(prompts[0].at, end),
      turnsAfterPhrase: phrase < 0 ? null : prompts.length - phrase - 1,
    }
  })
  const linked = changes.filter((c) => c.linked)
  const times = linked.map((c) => c.minutes)
  const turns = linked.map((c) => c.turnsAfterPhrase).filter((n) => n !== null)
  return {
    changes,
    linkRate: changes.length ? linked.length / changes.length : null,
    unlinked: changes.length - linked.length,
    ideaToProdMinutes: { median: percentile(times, 50), p90: percentile(times, 90) },
    turnsAfterPhrase: { median: percentile(turns, 50), p90: percentile(turns, 90) },
  }
}

export function readSessions(projectsDir = join(homedir(), '.claude', 'projects')) {
  if (!existsSync(projectsDir)) return []
  return readdirSync(projectsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((dir) => readdirSync(join(projectsDir, dir.name)).filter((file) => file.endsWith('.jsonl')).map((file) => join(projectsDir, dir.name, file)))
    .map((file) => parseSession(readFileSync(file, 'utf8')))
}

export function skillWords(skillsDir) {
  if (!existsSync(skillsDir)) return null
  const counts = readdirSync(skillsDir)
    .filter((name) => existsSync(join(skillsDir, name, 'SKILL.md')))
    .map((name) => [name, readFileSync(join(skillsDir, name, 'SKILL.md'), 'utf8').split(/\s+/u).filter(Boolean).length])
    .sort((a, b) => b[1] - a[1])
  return { total: counts.reduce((sum, [, n]) => sum + n, 0), largest: counts.slice(0, 5) }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (flag, fallback) => { const i = process.argv.indexOf(flag); return i > 0 ? process.argv[i + 1] : fallback }
  const limit = arg('--limit', '50')
  const repo = arg('--repo', '')
  const gh = (...args) => JSON.parse(execFileSync('gh', [...args, ...(repo ? ['-R', repo] : [])], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }))
  const prs = gh('pr', 'list', '--state', 'merged', '-L', limit, '--json', 'number,createdAt,mergedAt,headRefName,commits,mergeCommit')
  const runs = gh('run', 'list', '--event', 'pull_request', '-L', String(Number(limit) * 6), '--json', 'conclusion,headBranch,createdAt,updatedAt')
  const fmt = (n) => (n === null ? 'n/a' : n.toFixed(1))
  const pct = (n) => (n === null ? 'n/a' : `${Math.round(n * 100)}%`)
  const s = summarize({ prs, runs })
  console.log(`Last ${s.mergedPrs} merged pull requests${repo ? ` in ${repo}` : ''}`)
  console.log(`  Time to close PR (first commit → merge): median ${fmt(s.closePrMinutes.median)} min, p90 ${fmt(s.closePrMinutes.p90)} min`)
  console.log(`  CI: ${s.ciRuns} runs, ${pct(s.ciFailureRate)} failed; ${pct(s.prsWithRedCi)} of PRs saw a red run`)
  console.log(`  CI wait (green run): median ${fmt(s.ciWaitMinutes.median)} min, p90 ${fmt(s.ciWaitMinutes.p90)} min`)
  const fullRepo = repo || execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'], { encoding: 'utf8' }).trim()
  // Production deployment time of the merge commit, when the host reports one through GitHub deployments.
  for (const pr of prs) {
    try {
      const [deployment] = gh('api', `repos/${fullRepo}/deployments?sha=${pr.mergeCommit?.oid}&environment=Production&per_page=1`)
      const statuses = deployment ? gh('api', `repos/${fullRepo}/deployments/${deployment.id}/statuses`) : []
      pr.liveAt = statuses.filter((status) => status.state === 'success').map((status) => status.created_at).sort()[0]
    } catch { pr.liveAt = undefined }
  }
  const idea = ideaToProd({ prs, sessions: readSessions(), repo: fullRepo })
  console.log(`  Idea → prod (first prompt → production deploy, else merge): median ${fmt(idea.ideaToProdMinutes.median)} min, p90 ${fmt(idea.ideaToProdMinutes.p90)} min`)
  console.log(`  Linked to a starting prompt: ${pct(idea.linkRate)} (${idea.unlinked} unlinked; kill criterion needs 80%)`)
  console.log(`  User turns after the delivery phrase: median ${fmt(idea.turnsAfterPhrase.median)}, p90 ${fmt(idea.turnsAfterPhrase.p90)}`)
  const words = repo ? null : skillWords(join(dirname(fileURLToPath(import.meta.url)), '..', 'skills'))
  if (words) console.log(`  Skill words loaded (all SKILL.md): ${words.total}; largest ${words.largest.map(([n, c]) => `${n} ${c}`).join(', ')}`)
}
