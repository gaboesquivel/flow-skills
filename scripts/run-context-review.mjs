import { execSync } from 'node:child_process'
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_DIFF_CHARS = 120_000

function parseArgs(argv) {
  const out = { base: '', head: 'HEAD', prNumber: process.env.GITHUB_PR_NUMBER ?? '' }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--base' && argv[i + 1]) { out.base = argv[++i]; continue }
    if (argv[i] === '--head' && argv[i + 1]) { out.head = argv[++i]; continue }
    if (argv[i] === '--pr-number' && argv[i + 1]) { out.prNumber = argv[++i]; continue }
  }
  return out
}

function extractJson(text) {
  const trimmed = text.trim()
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/u.exec(trimmed)
  const raw = fence ? fence[1] : trimmed
  return JSON.parse(raw)
}

async function chatCompletion({ apiBase, apiKey, model, system, user }) {
  const url = `${apiBase.replace(/\/$/u, '')}/chat/completions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`LLM HTTP ${res.status}: ${body.slice(0, 500)}`)
  }
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('LLM response missing content')
  return content
}

function formatComment({ verdict, findings }) {
  const lines = [`## Flow context review`, `**Verdict:** ${verdict}`, '']
  if (!findings?.length) lines.push('No findings.')
  else {
    lines.push('### Findings', '')
    for (const f of findings) {
      lines.push(`- **${f.severity}** ${f.path ? `\`${f.path}\`: ` : ''}${f.message}`)
      if (f.suggestion) lines.push(`  - Suggestion: ${f.suggestion}`)
    }
  }
  lines.push('', '_Automated review per [pr-review-contract.md](docs/pr-review-contract.md)._')
  return lines.join('\n')
}

function upsertPrComment({ prNumber, body }) {
  const marker = '<!-- flow-context-review -->'
  const fullBody = `${marker}\n${body}`
  const tmp = join(tmpdir(), `flow-pr-comment-${prNumber}.md`)
  writeFileSync(tmp, fullBody, 'utf8')
  try {
    const list = JSON.parse(execSync(`gh api "repos/{owner}/{repo}/issues/${prNumber}/comments"`, { encoding: 'utf8' }))
    const existing = list.find((c) => c.body?.includes(marker))
    if (existing) execSync(`gh api "repos/{owner}/{repo}/issues/comments/${existing.id}" -X PATCH -f "body@${tmp}"`, { stdio: 'inherit' })
    else execSync(`gh pr comment ${prNumber} --body-file "${tmp}"`, { stdio: 'inherit' })
  } finally {
    unlinkSync(tmp)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  const { base, head, prNumber } = parseArgs(process.argv)
  const apiKey = process.env.FLOW_REVIEW_API_KEY
  const apiBase = process.env.FLOW_REVIEW_API_BASE ?? 'https://api.openai.com/v1'
  const model = process.env.FLOW_REVIEW_MODEL ?? 'gpt-4o-mini'

  if (!base) {
    console.error('Usage: node scripts/run-context-review.mjs --base <sha> --head <sha> [--pr-number N]')
    process.exitCode = 1
  } else if (!apiKey) {
    console.log('FLOW_REVIEW_API_KEY not set; skipping LLM context review.')
  } else {
    const contract = readFileSync(join(repoRoot, 'docs/pr-review-contract.md'), 'utf8')
    const names = execSync(`git diff --name-only ${base}...${head}`, { encoding: 'utf8' }).trim()
    let diff = ''
    try {
      diff = execSync(`git diff ${base}...${head}`, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
    } catch {
      diff = ''
    }
    if (diff.length > MAX_DIFF_CHARS) diff = `${diff.slice(0, MAX_DIFF_CHARS)}\n\n[diff truncated]`

    const system = `You are a pull request reviewer. Follow the contract exactly. Respond with JSON only matching the schema in the contract.`
    const user = `${contract}\n\n## Changed files\n${names}\n\n## Diff\n${diff || '(empty)'}`

    const run = async () => {
      let parsed
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const content = await chatCompletion({ apiBase, apiKey, model, system, user })
          parsed = extractJson(content)
          break
        } catch (err) {
          if (attempt === 1) throw err
        }
      }
      const findings = Array.isArray(parsed.findings) ? parsed.findings : []
      const blocking = parsed.verdict === 'fail' || findings.some((f) => f.severity === 'blocking')
      const comment = formatComment({ verdict: parsed.verdict ?? 'fail', findings })
      console.log(comment)
      if (prNumber && process.env.GH_TOKEN) upsertPrComment({ prNumber, body: comment })
      if (blocking) {
        console.error('Context review failed (blocking findings or verdict fail).')
        process.exitCode = 1
      }
    }

    run().catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
  }
}
