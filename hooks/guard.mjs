#!/usr/bin/env node
// Flow guard: Claude Code PreToolUse hook for Bash. Denies unsafe Git and merge operations with a reason.
// Reads the hook JSON on stdin. Prints a deny decision on stdout, or nothing to leave the call to the normal
// permission flow. Fails open when it cannot parse a command; fails closed only for merges it cannot check.
// Pure Node >= 22, no dependencies, never writes files.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const QUICK_MS = 1500
const MERGE_GATE_MS = 10_000

class Unparseable extends Error {}

// Remove heredoc bodies: their text is data, not commands. An unterminated heredoc drops everything after it.
export function stripHeredocs(text) {
  const lines = text.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    out.push(line)
    const delimiters = [...line.matchAll(/(?<!<)<<(?!<)(-?)\s*(['"]?)([A-Za-z_][\w-]*)\2/gu)].map((m) => ({ tabs: m[1] === '-', word: m[3] }))
    for (const { tabs, word } of delimiters) {
      i++
      while (i < lines.length && (tabs ? lines[i].replace(/^\t+/u, '') : lines[i]) !== word) i++
    }
  }
  return out.join('\n')
}

// Split a shell command into segments of words, honouring quotes and escapes. Throws Unparseable on unbalanced quotes.
export function tokenize(text) {
  const segments = []
  let words = []
  let word = null
  const endWord = () => { if (word !== null) words.push(word); word = null }
  const endSegment = () => { endWord(); if (words.length) segments.push(words); words = [] }
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === "'") {
      const end = text.indexOf("'", i + 1)
      if (end === -1) throw new Unparseable('unbalanced single quote')
      word = (word ?? '') + text.slice(i + 1, end)
      i = end
    } else if (c === '"') {
      let value = ''
      let j = i + 1
      for (; j < text.length && text[j] !== '"'; j++) {
        if (text[j] === '\\' && j + 1 < text.length && '"\\$`\n'.includes(text[j + 1])) { j++; if (text[j] !== '\n') value += text[j] }
        else value += text[j]
      }
      if (j >= text.length) throw new Unparseable('unbalanced double quote')
      word = (word ?? '') + value
      i = j
    } else if (c === '\\') {
      if (text[i + 1] === '\n') i++
      else { word = (word ?? '') + (text[i + 1] ?? ''); i++ }
    } else if (c === ' ' || c === '\t') {
      endWord()
    } else if (c === '#' && word === null) {
      while (i < text.length && text[i] !== '\n') i++
      endSegment()
    } else if ('\n;&|()'.includes(c)) {
      // A redirection such as 2>&1 or >&2 keeps its & inside the word.
      if (c === '&' && word !== null && /[<>]$/u.test(word)) { word += c; continue }
      endSegment()
    } else {
      word = (word ?? '') + c
    }
  }
  endSegment()
  return segments
}

const WRAPPERS = new Set(['command', 'exec', 'nohup', 'time', 'builtin', 'sudo'])
const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh'])

// Drop env assignments, redirections, and wrappers such as `command` or `env FOO=1`, so `git` is the first word.
function unwrap(words) {
  let w = words.filter((word) => !/^\d*[<>]/u.test(word))
  for (;;) {
    if (w.length && /^[A-Za-z_]\w*=/u.test(w[0])) { w = w.slice(1); continue }
    if (w.length && WRAPPERS.has(w[0])) { w = w.slice(1); while (w.length && w[0].startsWith('-')) w = w.slice(1); continue }
    if (w.length && w[0] === 'env') { w = w.slice(1); while (w.length && (w[0].startsWith('-') || /^[A-Za-z_]\w*=/u.test(w[0]))) w = w.slice(1); continue }
    return w
  }
}

const real = (path) => { try { return realpathSync(path) } catch { return resolve(path) } }
const inside = (root, path) => {
  const rel = relative(real(root), real(path))
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

function run(cmd, args, { cwd, timeout = QUICK_MS } = {}) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] })
  return { ok: !r.error && r.status === 0, status: r.status, error: r.error, stdout: (r.stdout ?? '').trim(), stderr: (r.stderr ?? '').trim() }
}

const defaultBranch = (dir) => {
  const r = run('git', ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'], { cwd: dir })
  return r.ok && r.stdout ? r.stdout.replace(/^[^/]+\//u, '') : 'main'
}
const currentBranch = (dir) => {
  const r = run('git', ['symbolic-ref', '--short', 'HEAD'], { cwd: dir })
  return r.ok ? r.stdout : null
}

const deny = (reason) => ({ deny: reason })
const firstLine = (r) => (r.error?.message ?? (r.stderr || 'no output')).split('\n')[0]

// Git global options before the subcommand; -C changes the directory the command acts on.
function splitGit(args, dir) {
  let i = 0
  for (; i < args.length; i++) {
    const a = args[i]
    if (a === '-C') { dir = resolve(dir, args[++i] ?? '.'); continue }
    if (a === '-c' || a === '--git-dir' || a === '--work-tree' || a === '--namespace' || a === '--exec-path') { i++; continue }
    if (a.startsWith('-')) continue
    break
  }
  return { dir, sub: args[i], rest: args.slice(i + 1) }
}

const PUSH_VALUE_OPTS = new Set(['-o', '--push-option', '--repo', '--receive-pack', '--exec'])
const COMMIT_VALUE_OPTS = new Set(['-m', '--message', '-F', '--file', '-C', '--reuse-message', '-c', '--reedit-message', '-t', '--template',
  '--author', '--date', '--cleanup', '--fixup', '--squash', '--trailer', '--pathspec-from-file'])

function checkPush(rest, dir) {
  const positional = []
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i]
    if (a === '--') { positional.push(...rest.slice(i + 1)); break }
    if (PUSH_VALUE_OPTS.has(a)) { i++; continue }
    if (a === '--no-verify') return deny('Flow guard: `git push --no-verify` skips the pre-push hooks; fix what the hook reports and push again without --no-verify.')
    if (a === '--force' || a.startsWith('--force-with-lease') || a === '--force-if-includes' || a === '--mirror' || (/^-[A-Za-z]+$/u.test(a) && a.includes('f'))) {
      return deny('Flow guard: force push is blocked; push new commits on top instead, or push to a new branch and open a pull request.')
    }
    if (a.startsWith('-')) continue
    positional.push(a)
  }
  const refspecs = positional.slice(1)
  if (refspecs.some((r) => r.startsWith('+'))) {
    return deny('Flow guard: a `+refspec` is a force push and is blocked; push without the leading +, or push to a new branch.')
  }
  const main = defaultBranch(dir)
  const toMain = 'Flow guard: pushing to the default branch is blocked; push a feature branch and land it through a pull request.'
  if (!refspecs.length) {
    if (currentBranch(dir) === main) return deny(toMain)
    return null
  }
  for (const spec of refspecs) {
    const colon = spec.lastIndexOf(':')
    let dst = colon === -1 ? spec : spec.slice(colon + 1)
    if (dst === 'HEAD' || dst === '@') dst = currentBranch(dir) ?? dst
    dst = dst.replace(/^refs\/heads\//u, '')
    if (dst === main) return deny(toMain)
  }
  return null
}

function checkCommit(rest) {
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i]
    if (a === '--') break
    if (a === '--no-verify') return deny('Flow guard: `git commit --no-verify` skips the commit hooks; fix what the hook reports and commit again without --no-verify.')
    if (COMMIT_VALUE_OPTS.has(a)) { i++; continue }
    if (/^-[A-Za-z]+$/u.test(a)) {
      for (const ch of a.slice(1)) {
        if (ch === 'n') return deny('Flow guard: `git commit -n` skips the commit hooks; fix what the hook reports and commit again without -n.')
        if ('mFCct'.includes(ch)) { if (a.endsWith(ch)) i++; break }
      }
    }
  }
  return null
}

const outside = (target, cwd, what) => inside(cwd, target)
  ? null
  : deny(`Flow guard: \`${what}\` outside the session's directory is blocked; run it from that worktree's own session, or ask the user to run it.`)

function checkGit(words, dir, cwd) {
  const { dir: gitDir, sub, rest } = splitGit(words.slice(1), dir)
  if (sub === 'push') return checkPush(rest, gitDir)
  if (sub === 'commit') return checkCommit(rest)
  if ((sub === 'merge' || sub === 'rebase') && rest.includes('--no-verify')) {
    return deny(`Flow guard: \`git ${sub} --no-verify\` skips the Git hooks; fix what the hook reports and run it again without --no-verify.`)
  }
  if (sub === 'reset' && rest.includes('--hard')) return outside(gitDir, cwd, 'git reset --hard')
  if (sub === 'clean' && rest.some((a) => a === '--force' || (/^-[A-Za-z]+$/u.test(a) && a.includes('f')))) return outside(gitDir, cwd, 'git clean -f')
  if (sub === 'worktree' && rest[0] === 'remove') {
    const target = rest.slice(1).find((a) => !a.startsWith('-'))
    if (!target) return null
    return outside(resolve(gitDir, target), cwd, 'git worktree remove')
  }
  return null
}

const REQUIRED_CHECKS = () => process.env.FLOW_GUARD_REQUIRED_CHECKS || join(HERE, '..', 'skills', 'ship', 'scripts', 'required-checks.mjs')

function checkMerge(args, dir) {
  if (args.includes('--admin')) {
    return deny('Flow guard: `gh pr merge --admin` bypasses branch protection; wait for the required checks and reviews, then merge without --admin.')
  }
  if (args.includes('--disable-auto')) return null
  const deadline = Date.now() + MERGE_GATE_MS
  const left = () => Math.max(1, deadline - Date.now())
  const failClosed = (why) => deny(`Flow guard: cannot confirm this pull request's required checks are green (${why}); run \`node skills/ship/scripts/required-checks.mjs <owner/repo> <number>\` and merge only when it exits 0.`)

  let repo = null
  let target = null
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '-R' || a === '--repo') { repo = args[++i] ?? null; continue }
    if (a.startsWith('--repo=')) { repo = a.slice(7); continue }
    if (['-b', '--body', '-F', '--body-file', '-t', '--subject', '-A', '--author-email', '--match-head-commit'].includes(a)) { i++; continue }
    if (a.startsWith('-')) continue
    target ??= a
  }
  let number = null
  const url = /github\.com\/([^/\s]+\/[^/\s]+)\/pull\/(\d+)/u.exec(target ?? '')
  if (url) { repo ??= url[1]; number = Number(url[2]) }
  else if (/^#?\d+$/u.test(target ?? '')) number = Number(target.replace('#', ''))
  repo = repo?.replace(/^(?:https?:\/\/)?github\.com\//u, '') ?? null

  if (!repo) {
    const r = run('gh', ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'], { cwd: dir, timeout: left() })
    if (!r.ok || !r.stdout) return failClosed(`gh could not name the repository: ${firstLine(r)}`)
    repo = r.stdout
  }
  if (!number) {
    const r = run('gh', ['pr', 'view', ...(target ? [target] : []), '-R', repo, '--json', 'number', '-q', '.number'], { cwd: dir, timeout: left() })
    if (!r.ok || !/^\d+$/u.test(r.stdout)) return failClosed(`gh could not find the pull request: ${firstLine(r)}`)
    number = Number(r.stdout)
  }
  const script = REQUIRED_CHECKS()
  if (!existsSync(script)) return failClosed(`required-checks.mjs not found at ${script}`)
  const r = run(process.execPath, [script, repo, String(number)], { cwd: dir, timeout: left() })
  if (r.error) return failClosed(`required-checks.mjs did not finish: ${r.error.message}`)
  if (r.status === 0) return null
  let reasons = []
  try { reasons = JSON.parse(r.stdout).reasons ?? [] } catch { reasons = [(r.stderr || r.stdout).split('\n')[0]] }
  const summary = reasons.slice(0, 3).join('; ').replace(/\s+/gu, ' ').trim() || `exit ${r.status}`
  return deny(`Flow guard: required checks are not green for ${repo}#${number} (${summary}); wait until required-checks.mjs exits 0, then merge.`)
}

function checkGh(words, dir) {
  const args = words.slice(1)
  // gh global -R can come before the subcommand.
  const idx = args.indexOf('pr')
  if (idx === -1 || args[idx + 1] !== 'merge') return null
  return checkMerge([...args.slice(0, idx), ...args.slice(idx + 2)], dir)
}

export function evaluate(command, cwd, depth = 0) {
  let dir = cwd
  for (const raw of tokenize(stripHeredocs(command))) {
    const words = unwrap(raw)
    if (!words.length) continue
    const name = basename(words[0])
    if ((name === 'cd' || name === 'pushd') && words[1] && words[1] !== '-') { dir = resolve(dir, words[1].replace(/^~(?=\/|$)/u, process.env.HOME ?? '~')); continue }
    let verdict = null
    if (name === 'git') verdict = checkGit(words, dir, cwd)
    else if (name === 'gh') verdict = checkGh(words, dir)
    else if (SHELLS.has(name) && depth < 3) {
      const c = words.indexOf('-c')
      if (c !== -1 && words[c + 1]) verdict = evaluate(words[c + 1], dir, depth + 1)
    }
    if (verdict) return verdict
  }
  return null
}

function main() {
  let input
  try { input = JSON.parse(readFileSync(0, 'utf8')) } catch { return }
  const command = input?.tool_input?.command
  if (typeof command !== 'string' || !/\b(?:git|gh)\b/u.test(command)) return
  const cwd = typeof input.cwd === 'string' && input.cwd ? input.cwd : process.cwd()
  let verdict = null
  try { verdict = evaluate(command, cwd) } catch { return }
  if (!verdict) return
  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: verdict.deny },
  })}\n`)
}

const self = (path) => { try { return realpathSync(path) } catch { return path } }
if (process.argv[1] && self(process.argv[1]) === self(fileURLToPath(import.meta.url))) main()
