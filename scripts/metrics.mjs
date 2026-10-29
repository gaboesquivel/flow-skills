/**
 * Delivery metrics from git, GitHub, and the skill tree (PRODUCT.md Success). Maintainer tool; read-only.
 *   node scripts/metrics.mjs [--repo owner/name] [--limit 50]
 * Works on flow-next and flow-mono through --repo. Idea → prod needs host session logs and is not computed here.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
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
  const prs = gh('pr', 'list', '--state', 'merged', '-L', limit, '--json', 'number,createdAt,mergedAt,headRefName,commits')
  const runs = gh('run', 'list', '--event', 'pull_request', '-L', String(Number(limit) * 6), '--json', 'conclusion,headBranch,createdAt,updatedAt')
  const fmt = (n) => (n === null ? 'n/a' : n.toFixed(1))
  const pct = (n) => (n === null ? 'n/a' : `${Math.round(n * 100)}%`)
  const s = summarize({ prs, runs })
  console.log(`Last ${s.mergedPrs} merged pull requests${repo ? ` in ${repo}` : ''}`)
  console.log(`  Time to close PR (first commit → merge): median ${fmt(s.closePrMinutes.median)} min, p90 ${fmt(s.closePrMinutes.p90)} min`)
  console.log(`  CI: ${s.ciRuns} runs, ${pct(s.ciFailureRate)} failed; ${pct(s.prsWithRedCi)} of PRs saw a red run`)
  console.log(`  CI wait (green run): median ${fmt(s.ciWaitMinutes.median)} min, p90 ${fmt(s.ciWaitMinutes.p90)} min`)
  const words = repo ? null : skillWords(join(dirname(fileURLToPath(import.meta.url)), '..', 'skills'))
  if (words) console.log(`  Skill words loaded (all SKILL.md): ${words.total}; largest ${words.largest.map(([n, c]) => `${n} ${c}`).join(', ')}`)
}
