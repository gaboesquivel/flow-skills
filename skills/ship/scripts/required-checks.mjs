#!/usr/bin/env node
// Merge gate: is this pull request's head ready to land? Only checks that actually ran and passed on that head count.
//   node required-checks.mjs <owner/repo> <number>
// Prints JSON. Exit 0 only when ready; 1 when not ready; 2 when GitHub could not be read (not ready either: fail closed).
// Reads through `gh api` REST, which works behind proxies that refuse GraphQL. Zero dependencies, Node >= 22.
import { execFileSync } from 'node:child_process'
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export class ReadError extends Error {}

const read = (api, path, { missingIs } = {}) => {
  try { return api(path) } catch (e) {
    if (missingIs !== undefined && /\b404\b/u.test(e.message)) return missingIs
    throw new ReadError(`cannot read ${path}: ${e.message}`)
  }
}

// A check run's state: success only when completed with conclusion success.
const runState = (r) => (r.status !== 'completed' ? 'pending' : r.conclusion ?? 'pending')
// A commit status's state, in check-run terms.
const statusState = (s) => (s.state === 'error' ? 'failure' : s.state)

export function evaluate({ api, repo, number }) {
  const pr = read(api, `repos/${repo}/pulls/${number}`)
  const head = pr.head.sha
  const branch = pr.base.ref
  const reasons = []

  const rules = read(api, `repos/${repo}/rules/branches/${encodeURIComponent(branch)}`, { missingIs: [] })
  const fromRules = rules.filter((r) => r.type === 'required_status_checks').flatMap((r) => r.parameters.required_status_checks.map((c) => c.context))
  const classic = read(api, `repos/${repo}/branches/${encodeURIComponent(branch)}/protection/required_status_checks`, { missingIs: null })
  const fromClassic = classic ? [...(classic.contexts ?? []), ...(classic.checks ?? []).map((c) => c.context)] : []

  // Latest result per context on this head: the highest check-run id wins; commit statuses are already latest per context.
  const latest = new Map()
  const runs = read(api, `repos/${repo}/commits/${head}/check-runs?per_page=100`).check_runs ?? []
  for (const r of runs.filter((r) => r.head_sha === head).sort((a, b) => a.id - b.id)) latest.set(r.name, runState(r))
  for (const s of read(api, `repos/${repo}/commits/${head}/status`).statuses ?? []) if (!latest.has(s.context)) latest.set(s.context, statusState(s))

  let required = [...new Set([...fromRules, ...fromClassic])]
  const source = [fromRules.length && 'rulesets', fromClassic.length && 'protection'].filter(Boolean).join('+') || 'none'
  if (source === 'none') {
    required = [...latest.keys()]
    reasons.push(`no active protection on ${branch}: every check reported on the head is treated as required`)
    if (!required.length) reasons.push('no checks reported on the head')
  }

  const checks = required.map((context) => ({ context, state: latest.get(context) ?? 'missing' }))
  if (pr.state !== 'open') reasons.push(`pull request #${number} is ${pr.state}`)
  if (pr.draft) reasons.push(`pull request #${number} is a draft; mark it ready so its checks run`)
  for (const c of checks) if (c.state !== 'success') reasons.push(`${c.context} is ${c.state} on ${head.slice(0, 7)}`)

  const ready = pr.state === 'open' && !pr.draft && checks.length > 0 && checks.every((c) => c.state === 'success')
  return { ready, number, head, draft: Boolean(pr.draft), source, required, checks, reasons }
}

function main(argv) {
  const [repo, raw] = argv
  const number = Number(String(raw ?? '').replace('#', ''))
  if (!/^[^/\s]+\/[^/\s]+$/u.test(repo ?? '') || !Number.isInteger(number) || number < 1) {
    console.log(JSON.stringify({ ready: false, reasons: ['usage: required-checks.mjs <owner/repo> <number>'] }))
    return 2
  }
  const api = (path) => JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024 }))
  try {
    const result = evaluate({ api, repo, number })
    console.log(JSON.stringify(result, null, 2))
    return result.ready ? 0 : 1
  } catch (e) {
    console.log(JSON.stringify({ ready: false, reasons: [e.message] }))
    return 2
  }
}

const real = (path) => { try { return realpathSync(path) } catch { return path } }
if (process.argv[1] && real(process.argv[1]) === real(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2))
