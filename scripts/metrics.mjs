/**
 * Delivery metrics from git, GitHub, and the skill tree (PRODUCT.md Success). Maintainer tool; read-only.
 *   node scripts/metrics.mjs [--repo owner/name] [--limit 50] [--usage cost.json]
 * Works on flow-next and flow-mono through --repo (default: the origin remote). GitHub reads use `gh api` REST only, since
 * Claude Code cloud proxies refuse GraphQL (spec 046). Each merged change is tagged `local` (a Claude Code session log in
 * ~/.claude/projects links it; idea → prod starts at its first prompt), `issue` (it closes an issue labeled `build-it`; starts
 * at the label event), or `cloud` (its body links a claude.ai/code session; starts at the first commit, flagged as a fallback);
 * otherwise untagged. Per change it also reports the skills invoked, user turns, CI failures, rework, and cost; what the
 * evidence cannot show is unknown, never zero (spec 041). Cloud and issue cost come only from --usage: a JSON array of
 * { session: <id or claude.ai/code URL>, costUsd } (for example exported from OpenTelemetry `claude_code.cost.usage`).
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
// Earliest success among deployment statuses, or commit statuses for one context.
export function firstSuccess(statuses, context) {
  return statuses
    .filter((status) => status.state === 'success' && (!context || status.context === context))
    .map((status) => status.created_at)
    .sort()[0]
}

export function summarize({ prs, runs }) {
  const closeTimes = prs.map((pr) => {
    const first = (pr.commits ?? []).map((c) => c.committedDate).sort()[0] ?? pr.createdAt
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
const SESSION_LINK = /https:\/\/claude\.ai\/code\/[^\s)>\]"'`]+/u
const CLOSES = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s*:?\s+#(\d+)\b/giu
export const TRIGGER_LABEL = 'build-it'

// A pull request body's claude.ai/code session link, and the issue numbers it closes.
export const sessionLink = (body) => SESSION_LINK.exec(body ?? '')?.[0] ?? null
export const closedIssues = (body) => [...new Set([...String(body ?? '').matchAll(CLOSES)].map((m) => Number(m[1])))]

// Latest `build-it` labeled event (REST `issues/{n}/events`) at or before `before`, the one a build authorizes on.
export const labeledAt = (events, before) =>
  events.filter((e) => e.event === 'labeled' && e.label?.name === TRIGGER_LABEL && (!before || e.created_at <= before)).map((e) => e.created_at).sort().at(-1)

// Summed cost of the --usage entries for a session link; an entry names the session by URL or by its last path segment.
export function usageCost(usage, link) {
  if (!link) return null
  const id = link.replace(/\/+$/u, '').split('/').pop()
  const hits = usage.filter((u) => typeof u?.costUsd === 'number' && typeof u.session === 'string' && (u.session === link || u.session.replace(/\/+$/u, '').split('/').pop() === id))
  return hits.length ? hits.reduce((sum, u) => sum + u.costUsd, 0) : null
}
// Claude Code logs a refused tool use (by the user, a deny rule, or auto mode) as a tool result with one of these texts;
// approved prompts and hand-offs leave no entry.
const DENIALS = ["The user doesn't want to proceed with this tool use", 'Permission for this action was denied', 'Permission to use']

// One session log (JSONL text) → the branches it worked on, the pull requests it linked, its human prompts, its permission denials,
// the skills it invoked, and its cost (null when the log has none or a model's cost is unknown).
export function parseSession(text) {
  const session = { cwd: null, branches: new Set(), prs: [], prompts: [], denials: [], skills: [], cost: null }
  let unknownCost = false
  for (const line of text.split('\n')) {
    let entry
    try { entry = JSON.parse(line) } catch { continue }
    if (entry.type === 'pr-link') session.prs.push({ repo: entry.prRepository, number: entry.prNumber })
    // cost-state totals are cumulative for the session, so the largest one is the session's cost.
    if (entry.type === 'cost-state') {
      if (entry.hasUnknownModelCost) unknownCost = true
      if (typeof entry.totalCostUSD === 'number') session.cost = Math.max(session.cost ?? 0, entry.totalCostUSD)
    }
    if (entry.type === 'assistant' && entry.timestamp && Array.isArray(entry.message?.content)) {
      for (const part of entry.message.content) if (part.type === 'tool_use' && part.name === 'Skill' && part.input?.skill) session.skills.push({ at: entry.timestamp, name: part.input.skill })
    }
    if (entry.gitBranch) session.branches.add(entry.gitBranch)
    if (entry.cwd && !session.cwd) session.cwd = entry.cwd
    if (entry.type !== 'user' || !entry.timestamp) continue
    const content = entry.message?.content
    // Subagent (sidechain) denials count too; only prompts skip meta and sidechain entries.
    const denied = Array.isArray(content) && content.some((part) => part.type === 'tool_result' && DENIALS.some((denial) => JSON.stringify(part.content ?? '').includes(denial)))
    if (denied) session.denials.push(entry.timestamp)
    if (entry.isMeta || entry.isSidechain) continue
    const text = typeof content === 'string' ? content : Array.isArray(content) && !content.some((part) => part.type === 'tool_result') ? content.filter((part) => part.type === 'text').map((part) => part.text).join('\n') : ''
    if (text && !text.startsWith('<')) session.prompts.push({ at: entry.timestamp, text })
  }
  if (unknownCost) session.cost = null
  return session
}

// CI failures: failing commits on the branch, so a rerun of the same commit counts once; null when no run was listed for it.
// Rework (provisional): commits after the first failed run or the first review.
export function delivery(pr, runs) {
  const branchRuns = runs.filter((run) => run.headBranch === pr.headRefName && run.conclusion !== 'cancelled' && run.conclusion !== 'skipped')
  const failed = branchRuns.filter((run) => run.conclusion === 'failure')
  const ciFailures = branchRuns.length ? new Set(failed.map((run) => run.headSha ?? run.createdAt)).size : null
  const trigger = [...failed.map((run) => run.createdAt), ...(pr.reviews ?? []).map((review) => review.submittedAt)].filter(Boolean).sort()[0]
  const rework = trigger ? (pr.commits ?? []).filter((c) => c.committedDate > trigger).length : 0
  return { ciFailures, rework }
}

// prs: merged pull requests ({ number, headRefName, mergedAt, createdAt?, body?, labeledAt?, liveAt?, commits?, reviews? });
// sessions: parseSession results; runs: CI workflow runs; usage: --usage entries. A pull request links to every session that
// opened it or worked on its branch in this repository. Tags: issue (labeledAt), else local (a linked prompt), else cloud.
export function ideaToProd({ prs, sessions, repo, runs = [], usage = [] }) {
  const name = repo.split('/').pop()
  const linkedTo = prs.map((pr) => sessions.filter((s) =>
    s.prs.some((link) => link.repo === repo && link.number === pr.number) ||
    (s.branches.has(pr.headRefName) && (s.cwd ?? '').includes(`/${name}`))))
  const uses = new Map()
  for (const s of linkedTo.flat()) uses.set(s, (uses.get(s) ?? 0) + 1)
  const links = prs.map((pr) => sessionLink(pr.body))
  // A cloud session's cost is a total too, so it is attributable only to a change that alone links it.
  const cloudCost = (i) => links[i] && links.filter((l) => l === links[i]).length === 1 ? usageCost(usage, links[i]) : null
  const changes = prs.map((pr, i) => {
    const linked = linkedTo[i]
    const end = pr.liveAt ?? pr.mergedAt
    const prompts = linked.flatMap((s) => s.prompts).filter((p) => p.at <= end).sort((a, b) => a.at.localeCompare(b.at))
    if (pr.labeledAt) return { number: pr.number, tag: 'issue', linked: false, minutes: minutes(pr.labeledAt, end), fallback: false, cost: cloudCost(i), ...delivery(pr, runs) }
    if (!prompts.length && links[i]) {
      const first = (pr.commits ?? []).map((c) => c.committedDate).sort()[0] ?? pr.createdAt
      return { number: pr.number, tag: 'cloud', linked: false, minutes: first ? minutes(first, end) : null, fallback: true, cost: cloudCost(i), ...delivery(pr, runs) }
    }
    if (!prompts.length) return { number: pr.number, tag: null, linked: false, ...delivery(pr, runs) }
    const start = prompts[0].at
    // The last delivery phrase before the end, so a phrase aimed at an earlier change in the same session is not counted.
    const phrase = prompts.findLastIndex((p) => DELIVERY_PHRASE.test(p.text))
    return {
      number: pr.number,
      tag: 'local',
      linked: true,
      minutes: minutes(start, end),
      turns: prompts.length,
      turnsAfterPhrase: phrase < 0 ? null : prompts.length - phrase - 1,
      denialsAt: linked.flatMap((s) => s.denials).filter((at) => at >= start && at <= end),
      skills: [...new Set(linked.flatMap((s) => s.skills).filter((k) => k.at >= start && k.at <= end).map((k) => k.name))].sort(),
      // Session cost is a total, so it is attributable only when every linked session served this change alone.
      cost: linked.every((s) => s.cost !== null && uses.get(s) === 1) ? linked.reduce((sum, s) => sum + s.cost, 0) : null,
      ...delivery(pr, runs),
    }
  })
  const linked = changes.filter((c) => c.linked)
  const tagged = changes.filter((c) => c.tag)
  const times = tagged.map((c) => c.minutes).filter((n) => n !== null)
  const turns = linked.map((c) => c.turnsAfterPhrase).filter((n) => n !== null)
  return {
    changes,
    linkRate: changes.length ? linked.length / changes.length : null,
    unlinked: changes.length - linked.length,
    tagRate: changes.length ? tagged.length / changes.length : null,
    untagged: changes.length - tagged.length,
    ideaToProdMinutes: { median: percentile(times, 50), p90: percentile(times, 90) },
    turns: { median: percentile(linked.map((c) => c.turns), 50), p90: percentile(linked.map((c) => c.turns), 90) },
    turnsAfterPhrase: { median: percentile(turns, 50), p90: percentile(turns, 90) },
    // Unique timestamps, so a session that spans several pull requests counts each denial once.
    denials: new Set(linked.flatMap((c) => c.denialsAt)).size,
  }
}

// Linked changes grouped by each skill they invoked; a change with several skills counts under each.
export function bySkill(changes) {
  const groups = new Map()
  for (const c of changes.filter((change) => change.linked)) for (const skill of c.skills) groups.set(skill, [...(groups.get(skill) ?? []), c])
  return [...groups].map(([skill, cs]) => ({
    skill,
    changes: cs.length,
    medianMinutes: percentile(cs.map((c) => c.minutes), 50),
    medianTurns: percentile(cs.map((c) => c.turns), 50),
  })).sort((a, b) => b.changes - a.changes || a.skill.localeCompare(b.skill))
}

// Changes grouped by tag (null = untagged), each with its count, median idea → prod, CI failure rate, and known cost.
export function byTag(changes, prs, runs) {
  return ['local', 'issue', 'cloud', null].map((tag) => {
    const cs = changes.filter((c) => c.tag === tag)
    const numbers = new Set(cs.map((c) => c.number))
    const costs = cs.map((c) => c.cost ?? null)
    return {
      tag,
      changes: cs.length,
      medianMinutes: percentile(cs.map((c) => c.minutes).filter((n) => typeof n === 'number'), 50),
      fallback: cs.some((c) => c.fallback),
      ciFailureRate: summarize({ prs: prs.filter((pr) => numbers.has(pr.number)), runs }).ciFailureRate,
      cost: cs.length && costs.every((c) => c !== null) ? costs.reduce((sum, c) => sum + c, 0) : null,
    }
  })
}

// `owner/name` from a github.com remote URL (https, ssh, scp-like); null otherwise.
export function repoFromRemote(url) {
  const match = /^(?:[a-z][\w+.-]*:\/\/)?(?:[^@/\s]+@)?github\.com(?::\d+)?[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/iu.exec(String(url).trim())
  return match ? `${match[1]}/${match[2]}` : null
}

// Pages a REST list through `api(path)` (parsed JSON); `pick` selects the array from an object response.
function pages(api, path, { max, keep = () => true, enough = () => false, pick = (body) => body }) {
  const items = []
  for (let page = 1; page <= max; page++) {
    const batch = pick(api(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`)) ?? []
    items.push(...batch.filter(keep))
    if (batch.length < 100 || enough(items)) break
  }
  return items
}

// Merged pull requests, CI runs, and build-it label times through REST, in the shapes summarize and ideaToProd read.
// api(path) returns parsed JSON (`gh api <path>`); injectable for tests.
export function fetchDelivery({ repo, limit, api }) {
  const merged = pages(api, `repos/${repo}/pulls?state=closed&sort=updated&direction=desc`, { max: 10, keep: (pr) => pr.merged_at, enough: (items) => items.length >= limit })
    .sort((a, b) => b.merged_at.localeCompare(a.merged_at)).slice(0, limit)
  const prs = merged.map((pr) => {
    const commits = pages(api, `repos/${repo}/pulls/${pr.number}/commits`, { max: 3 }).map((c) => ({ committedDate: c.commit?.committer?.date }))
    const reviews = pages(api, `repos/${repo}/pulls/${pr.number}/reviews`, { max: 3 }).map((r) => ({ submittedAt: r.submitted_at }))
    const closes = closedIssues(pr.body)
    const events = (n) => {
      try { return pages(api, `repos/${repo}/issues/${n}/events`, { max: 5 }) } catch { return [] }
    }
    const labeled = closes.map((n) => labeledAt(events(n), pr.created_at)).filter(Boolean).sort()[0]
    return {
      number: pr.number, createdAt: pr.created_at, mergedAt: pr.merged_at, headRefName: pr.head?.ref, body: pr.body ?? '',
      commits, reviews, mergeCommit: { oid: pr.merge_commit_sha }, closes, ...(labeled ? { labeledAt: labeled } : {}),
    }
  })
  const runs = pages(api, `repos/${repo}/actions/runs?event=pull_request`, { max: Math.ceil((limit * 6) / 100), pick: (body) => body?.workflow_runs })
    .slice(0, limit * 6).map((run) => ({ conclusion: run.conclusion, headBranch: run.head_branch, headSha: run.head_sha, createdAt: run.created_at, updatedAt: run.updated_at }))
  return { prs, runs }
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
  const limit = Number(arg('--limit', '50'))
  const repo = arg('--repo', '')
  const usagePath = arg('--usage', '')
  const usage = usagePath ? JSON.parse(readFileSync(usagePath, 'utf8')) : []
  if (!Array.isArray(usage)) throw new Error('--usage needs a JSON array of { session, costUsd }')
  const fullRepo = repo || repoFromRemote(execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }))
  if (!fullRepo) throw new Error('origin is not a github.com remote; pass --repo owner/name')
  const api = (path) => JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }))
  const { prs, runs } = fetchDelivery({ repo: fullRepo, limit, api })
  const fmt = (n) => (n === null ? 'n/a' : n.toFixed(1))
  const pct = (n) => (n === null ? 'n/a' : `${Math.round(n * 100)}%`)
  const s = summarize({ prs, runs })
  console.log(`Last ${s.mergedPrs} merged pull requests${repo ? ` in ${repo}` : ''}`)
  console.log(`  Time to close PR (first commit → merge): median ${fmt(s.closePrMinutes.median)} min, p90 ${fmt(s.closePrMinutes.p90)} min`)
  console.log(`  CI: ${s.ciRuns} runs, ${pct(s.ciFailureRate)} failed; ${pct(s.prsWithRedCi)} of PRs saw a red run`)
  console.log(`  CI wait (green run): median ${fmt(s.ciWaitMinutes.median)} min, p90 ${fmt(s.ciWaitMinutes.p90)} min`)
  // Production deployment time of the merge commit: a GitHub deployment when the host creates one, else Vercel's commit status.
  for (const pr of prs) {
    try {
      const sha = pr.mergeCommit?.oid
      const [deployment] = api(`repos/${fullRepo}/deployments?sha=${sha}&environment=Production&per_page=1`)
      pr.liveAt = deployment
        ? firstSuccess(api(`repos/${fullRepo}/deployments/${deployment.id}/statuses`))
        : firstSuccess(api(`repos/${fullRepo}/commits/${sha}/statuses`), 'Vercel')
    } catch { pr.liveAt = undefined }
  }
  const idea = ideaToProd({ prs, sessions: readSessions(), repo: fullRepo, runs, usage })
  console.log(`  Idea → prod (first prompt, build-it label, or first commit for cloud → production deploy, else merge): median ${fmt(idea.ideaToProdMinutes.median)} min, p90 ${fmt(idea.ideaToProdMinutes.p90)} min`)
  console.log(`  Tagged local, issue, or cloud: ${pct(idea.tagRate)} (${idea.untagged} untagged; kill criterion needs 80%); linked to a local prompt: ${pct(idea.linkRate)}`)
  const money = (n) => (n === null ? 'unknown' : `$${n.toFixed(2)}`)
  for (const t of byTag(idea.changes, prs, runs)) {
    if (t.changes) console.log(`    ${t.tag ?? 'untagged'}: ${t.changes} changes${t.tag ? `, median ${fmt(t.medianMinutes)} min${t.fallback ? ' (from first commit: fallback)' : ''}, cost ${money(t.cost)}` : ''}, CI ${pct(t.ciFailureRate)} failed`)
  }
  console.log(`  User turns per linked change: median ${fmt(idea.turns.median)}, p90 ${fmt(idea.turns.p90)}`)
  console.log(`  User turns after the delivery phrase: median ${fmt(idea.turnsAfterPhrase.median)}, p90 ${fmt(idea.turnsAfterPhrase.p90)}`)
  console.log(`  Permission denials during linked changes: ${idea.denials}; approved prompts and hand-offs: unknown (session logs do not record them)`)
  const live = new Set(prs.filter((pr) => pr.liveAt).map((pr) => pr.number))
  const known = (n, format = String) => (n === null ? 'unknown' : format(n))
  for (const c of idea.changes) {
    const ci = `${known(c.ciFailures)} CI failures, ${c.rework} rework commits`
    const remote = `${c.tag}, ${fmt(c.minutes)} min to ${live.has(c.number) ? 'deploy' : 'merge'}${c.fallback ? ' from first commit (fallback)' : ''}, ${ci}, cost ${known(c.cost, (n) => `$${n.toFixed(2)}`)}`
    if (c.tag === 'issue' || c.tag === 'cloud') { console.log(`    #${c.number}: ${remote}`); continue }
    console.log(`    #${c.number}: ${c.linked ? `local, ${fmt(c.minutes)} min to ${live.has(c.number) ? 'deploy' : 'merge'}, ${c.turns} turns (${c.turnsAfterPhrase ?? 'n/a'} after the phrase), ${c.denialsAt.length} denials, ${ci}, cost ${known(c.cost, (n) => `$${n.toFixed(2)}`)}, skills ${c.skills.join(' ') || 'none'}` : `unlinked, ${ci}`}`)
  }
  const skills = bySkill(idea.changes)
  if (skills.length) console.log('  By skill (linked changes; a change counts under each skill it invoked):')
  for (const k of skills) console.log(`    ${k.skill}: ${k.changes} changes, median ${fmt(k.medianMinutes)} min, median ${fmt(k.medianTurns)} turns`)
  const words = repo ? null : skillWords(join(dirname(fileURLToPath(import.meta.url)), '..', 'skills'))
  if (words) console.log(`  Skill words loaded (all SKILL.md): ${words.total}; largest ${words.largest.map(([n, c]) => `${n} ${c}`).join(', ')}`)
}
