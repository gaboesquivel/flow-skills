#!/usr/bin/env node
// Flow guard: Claude Code PreToolUse hook for Bash. Denies unsafe Git and merge operations with a reason.
// Reads the hook JSON on stdin. Prints a deny decision on stdout, or nothing to leave the call to the normal
// permission flow. Fails open when it cannot parse a command, unless its raw text shows a dangerous git/gh flag; fails
// closed for merges it cannot check.
// Pure Node >= 22, no dependencies, never writes files.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const QUICK_MS = 1500
const MERGE_GATE_MS = 10_000

class Unparseable extends Error {}

const WRAPPERS = new Set(['command', 'exec', 'nohup', 'time', 'builtin', 'sudo'])
const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh'])
// A shell flag cluster that carries -c, such as -c, -lc, or -ec.
const isShellC = (a) => /^-[A-Za-z]*c[A-Za-z]*$/u.test(a)
const SHELL_VALUE_OPTS = new Set(['-o', '+o', '-O', '+O', '--rcfile', '--init-file'])

// Does one line of shell, minus its heredoc bodies, pipe a heredoc into a shell reading commands from stdin?
function feedsShell(line) {
  let segments
  try { segments = tokenize(line) } catch { return false }
  return segments.some((raw) => {
    const w = unwrap(raw)
    if (!w.length || !SHELLS.has(basename(w[0]))) return false
    const args = w.slice(1)
    return args.includes('-s') || args.every((a) => a.startsWith('-') && !isShellC(a))
  })
}

// Remove heredoc bodies: their text is data, not commands, unless the heredoc feeds a shell, whose body is kept as
// commands. Only a << outside quotes and comments starts a heredoc; a $( inside double quotes opens an unquoted context
// until its matching ), so `"$(cat <<'EOF' ... EOF\n)"` strips its body too. An unterminated heredoc drops everything
// after it.
export function stripHeredocs(text) {
  let out = ''
  let lineStart = 0
  let quote = null
  // Open $( substitutions entered from inside double quotes: their ( depth and where their text starts in `out`.
  const subs = []
  const pending = []
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (quote === "'") { out += c; if (c === "'") quote = null; i++; continue }
    if (c === '\\' && i + 1 < text.length) { out += c + text[i + 1]; i += 2; continue }
    if (quote === '"') {
      if (c === '$' && text[i + 1] === '(') { out += '$('; i += 2; subs.push({ depth: 0, start: out.length }); quote = null; continue }
      out += c
      if (c === '"') quote = null
      i++
      continue
    }
    if (c === "'" || c === '"') { quote = c; out += c; i++; continue }
    if (subs.length && c === '(') subs.at(-1).depth++
    if (subs.length && c === ')') {
      if (subs.at(-1).depth === 0) { subs.pop(); quote = '"'; out += c; i++; continue }
      subs.at(-1).depth--
    }
    if (c === '#' && (out.length === lineStart || /[\s;&|()]/u.test(out.at(-1)))) {
      const end = text.indexOf('\n', i)
      const stop = end === -1 ? text.length : end
      out += text.slice(i, stop)
      i = stop
      continue
    }
    if (c === '<' && text[i + 1] === '<' && text[i + 2] !== '<' && text[i - 1] !== '<') {
      const m = /^<<(-?)[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z_][\w-]*))/u.exec(text.slice(i))
      if (m) {
        pending.push({ tabs: m[1] === '-', word: m[2] ?? m[3] ?? m[4] })
        out += m[0]
        i += m[0].length
        continue
      }
    }
    if (c === '\n') {
      const feed = pending.length > 0 && feedsShell(out.slice(Math.max(lineStart, subs.at(-1)?.start ?? 0)))
      out += c
      i++
      for (const { tabs, word } of pending) {
        while (i < text.length) {
          const end = text.indexOf('\n', i)
          const stop = end === -1 ? text.length : end
          const line = text.slice(i, stop)
          i = stop + 1
          if ((tabs ? line.replace(/^\t+/u, '') : line) === word) break
          if (feed) out += `${line}\n`
        }
      }
      pending.length = 0
      lineStart = out.length
      continue
    }
    out += c
    i++
  }
  return out
}

// Index of the ) closing the ( at `open`, skipping quoted text; -1 when there is none.
function closeParen(text, open) {
  let depth = 0
  for (let k = open; k < text.length; k++) {
    const c = text[k]
    if (c === '\\') { k++; continue }
    if (c === "'") { k = text.indexOf("'", k + 1); if (k === -1) return -1; continue }
    if (c === '"') {
      for (k++; k < text.length && text[k] !== '"'; k++) if (text[k] === '\\') k++
      if (k >= text.length) return -1
      continue
    }
    if (c === '(') depth++
    else if (c === ')' && --depth === 0) return k
  }
  return -1
}

const closeBacktick = (text, from) => {
  for (let k = from; k < text.length; k++) {
    if (text[k] === '\\') k++
    else if (text[k] === '`') return k
  }
  return -1
}

// Split a shell command into segments of words, honouring quotes and escapes. Throws Unparseable on unbalanced quotes.
// Command substitutions inside double quotes ($(...) and backticks) are returned on `segments.subs` as command text;
// outside quotes, parentheses and backticks already split segments.
export function tokenize(text) {
  const segments = []
  const subs = []
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
        else if (text[j] === '`') {
          const end = closeBacktick(text, j + 1)
          if (end === -1) throw new Unparseable('unbalanced backtick')
          subs.push(text.slice(j + 1, end))
          value += text.slice(j, end + 1)
          j = end
        } else if (text[j] === '$' && text[j + 1] === '(') {
          const end = closeParen(text, j + 1)
          if (end === -1) throw new Unparseable('unbalanced $(')
          subs.push(text.slice(j + 2, end))
          value += text.slice(j, end + 1)
          j = end
        } else value += text[j]
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
    } else if ('\n;&|()`'.includes(c)) {
      // A redirection such as 2>&1 or >&2 keeps its & inside the word.
      if (c === '&' && word !== null && /[<>]$/u.test(word)) { word += c; continue }
      endSegment()
    } else {
      word = (word ?? '') + c
    }
  }
  endSegment()
  segments.subs = subs
  return segments
}

// sudo options that take a value in the next word.
const SUDO_VALUE_OPTS = new Set(['-u', '-g', '-h', '-p', '-C', '-U', '-r', '-t', '-D', '--user', '--group', '--host', '--prompt',
  '--close-from', '--other-user', '--role', '--type', '--chdir'])
const ENV_VALUE_OPTS = new Set(['-u', '--unset', '-C', '--chdir'])

// Drop env assignments, redirections, and wrappers such as `command` or `env FOO=1`, so `git` is the first word.
function unwrap(words) {
  let w = words.filter((word) => !/^\d*[<>]/u.test(word))
  for (;;) {
    if (w.length && /^[A-Za-z_]\w*=/u.test(w[0])) { w = w.slice(1); continue }
    if (w.length && WRAPPERS.has(w[0])) {
      const sudo = w[0] === 'sudo'
      w = w.slice(1)
      while (w.length && w[0].startsWith('-')) {
        const takesValue = sudo && (SUDO_VALUE_OPTS.has(w[0]) || (/^-[A-Za-z]+$/u.test(w[0]) && 'ughpCUrtD'.includes(w[0].at(-1))))
        w = w.slice(takesValue ? 2 : 1)
        if (w[0] === '--' && sudo) { w = w.slice(1); break }
      }
      continue
    }
    if (w.length && w[0] === 'env') {
      w = w.slice(1)
      while (w.length && (w[0].startsWith('-') || /^[A-Za-z_]\w*=/u.test(w[0]))) w = w.slice(ENV_VALUE_OPTS.has(w[0]) ? 2 : 1)
      continue
    }
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

// Default branch: origin/HEAD, else main, else master (local or remote-tracking), else init.defaultBranch, else main.
const defaultBranch = (dir) => {
  const r = run('git', ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'], { cwd: dir })
  if (r.ok && r.stdout) return r.stdout.replace(/^[^/]+\//u, '')
  const has = (ref) => run('git', ['rev-parse', '--verify', '-q', ref], { cwd: dir }).ok
  for (const b of ['main', 'master']) if (has(`refs/heads/${b}`) || has(`refs/remotes/origin/${b}`)) return b
  const init = run('git', ['config', 'init.defaultBranch'], { cwd: dir })
  return init.ok && init.stdout ? init.stdout : 'main'
}
const currentBranch = (dir) => {
  const r = run('git', ['symbolic-ref', '--short', 'HEAD'], { cwd: dir })
  return r.ok ? r.stdout : null
}

// Delivery mode, as ship's gh-route.mjs reads it: the Flow block's `Delivery:` line in AGENTS.md or CLAUDE.md at the
// repository root, else GitHub when origin is a GitHub remote, else local.
const GITHUB_REMOTE = /^(?:[a-z][\w+.-]*:\/\/)?(?:[^@/\s]+@)?github\.com(?::\d+)?[:/][\w.-]+\/[\w.-]+?(?:\.git)?\/?$/iu
function deliveryMode(dir) {
  const top = run('git', ['rev-parse', '--show-toplevel'], { cwd: dir })
  if (top.ok && top.stdout) {
    for (const file of ['AGENTS.md', 'CLAUDE.md']) {
      let text
      try { text = readFileSync(join(top.stdout, file), 'utf8') } catch { continue }
      const block = /<!-- BEGIN FLOW -->([\s\S]*?)<!-- END FLOW -->/u.exec(text)?.[1]
      const value = block && /^Delivery:[ \t]*(.*)$/imu.exec(block)?.[1]?.trim().toLowerCase().replace(/[\s_]+/gu, '-')
      if (['github', 'pull-request', 'pull-requests', 'pullrequest', 'pr'].includes(value)) return 'github'
      if (value === 'local') return 'local'
    }
  }
  const origin = run('git', ['remote', 'get-url', 'origin'], { cwd: dir })
  return origin.ok && GITHUB_REMOTE.test(origin.stdout) ? 'github' : 'local'
}

const deny = (reason) => ({ deny: reason })
const firstLine = (r) => (r.error?.message ?? (r.stderr || 'no output')).split('\n')[0]

// A long option abbreviated to a unique prefix (Git accepts these), such as --forc or --no-v, read as the dangerous
// option it abbreviates. Any `=value` is kept.
function longOption(a, dangerous) {
  if (!a.startsWith('--')) return a
  const eq = a.indexOf('=')
  const name = eq === -1 ? a : a.slice(0, eq)
  if (name.length < 4 || dangerous.includes(name)) return a
  const hit = dangerous.find((d) => d.startsWith(name))
  return hit ? hit + (eq === -1 ? '' : a.slice(eq)) : a
}

// Git global options before the subcommand; -C changes the directory the command acts on. Collects -c config keys.
function splitGit(args, dir) {
  const config = []
  let i = 0
  for (; i < args.length; i++) {
    const a = args[i]
    if (a === '-C') { dir = resolve(dir, args[++i] ?? '.'); continue }
    if (a === '-c') { config.push(args[++i] ?? ''); continue }
    if (a.startsWith('-c') && a.length > 2) { config.push(a.slice(2)); continue }
    if (a.startsWith('--config-env=')) { config.push(a.slice(13)); continue }
    if (a === '--config-env') { config.push(args[++i] ?? ''); continue }
    if (a === '--git-dir' || a === '--work-tree' || a === '--namespace' || a === '--exec-path') { i++; continue }
    if (a.startsWith('-')) continue
    break
  }
  return { dir, sub: args[i], rest: args.slice(i + 1), config: config.map((c) => c.split('=')[0].toLowerCase()) }
}

const PUSH_VALUE_OPTS = new Set(['-o', '--push-option', '--repo', '--receive-pack', '--exec'])
const PUSH_DANGEROUS = ['--force', '--force-with-lease', '--force-if-includes', '--mirror', '--no-verify']
const COMMIT_VALUE_OPTS = new Set(['-m', '--message', '-F', '--file', '-C', '--reuse-message', '-c', '--reedit-message', '-t', '--template',
  '--author', '--date', '--cleanup', '--fixup', '--squash', '--trailer', '--pathspec-from-file'])

// Where a push to `remote` goes: the remote's push URL, or `remote` itself when it is a URL or path.
function pushUrl(remote, dir) {
  if (!remote) {
    const branch = currentBranch(dir)
    const conf = (key) => { const r = run('git', ['config', key], { cwd: dir }); return r.ok && r.stdout ? r.stdout : null }
    remote = (branch && conf(`branch.${branch}.pushRemote`)) || conf('remote.pushDefault') || (branch && conf(`branch.${branch}.remote`)) || 'origin'
  }
  const r = run('git', ['remote', 'get-url', '--push', remote], { cwd: dir })
  return r.ok && r.stdout ? r.stdout : remote
}

function checkPush(rest, dir) {
  const positional = []
  let repo = null
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i]
    if (a === '--') { positional.push(...rest.slice(i + 1)); break }
    if (a === '--repo') { repo = rest[++i] ?? null; continue }
    if (a.startsWith('--repo=')) { repo = a.slice(7) || null; continue }
    if (PUSH_VALUE_OPTS.has(a)) { i++; continue }
    const opt = longOption(a, PUSH_DANGEROUS)
    if (opt === '--no-verify') return deny('Flow guard: `git push --no-verify` skips the pre-push hooks; fix what the hook reports and push again without --no-verify.')
    if (opt === '--force' || opt.startsWith('--force-with-lease') || opt === '--force-if-includes' || opt === '--mirror' || (/^-[A-Za-z]+$/u.test(a) && a.includes('f'))) {
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
  let toDefault = false
  if (!refspecs.length) toDefault = currentBranch(dir) === main
  for (const spec of refspecs) {
    const colon = spec.lastIndexOf(':')
    let dst = colon === -1 ? spec : spec.slice(colon + 1)
    if (dst === 'HEAD' || dst === '@') dst = currentBranch(dir) ?? dst
    dst = dst.replace(/^refs\/heads\//u, '')
    if (dst === main) toDefault = true
  }
  if (!toDefault) return null
  // A GitHub destination always lands through a pull request, whatever origin or the Delivery line says. Otherwise
  // local delivery (ship's local mode) lands by merging into the default branch and pushing it.
  if (GITHUB_REMOTE.test(pushUrl(positional[0] ?? repo, dir)) || deliveryMode(dir) !== 'local') {
    return deny('Flow guard: pushing to the default branch is blocked; push a feature branch and land it through a pull request.')
  }
  return null
}

function checkCommit(rest) {
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i]
    if (a === '--') break
    if (longOption(a, ['--no-verify']) === '--no-verify') return deny('Flow guard: `git commit --no-verify` skips the commit hooks; fix what the hook reports and commit again without --no-verify.')
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

const HOOKED = new Set(['commit', 'push', 'merge', 'rebase', 'am', 'cherry-pick'])

function checkGit(words, dir, cwd) {
  const { dir: gitDir, sub, rest, config } = splitGit(words.slice(1), dir)
  if (HOOKED.has(sub) && config.includes('core.hookspath')) {
    return deny(`Flow guard: \`git -c core.hooksPath=… ${sub}\` skips the Git hooks; fix what the hook reports and run it again without overriding core.hooksPath.`)
  }
  if (sub === 'push') return checkPush(rest, gitDir)
  if (sub === 'commit') return checkCommit(rest)
  if ((sub === 'merge' || sub === 'rebase') && rest.some((a) => longOption(a, ['--no-verify']) === '--no-verify')) {
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
  if (args.some((a) => longOption(a, ['--admin']) === '--admin')) {
    return deny('Flow guard: `gh pr merge --admin` bypasses branch protection; wait for the required checks and reviews, then merge without --admin.')
  }
  // Auto-merge waits for GitHub to enforce the required checks; disabling it merges nothing.
  if (args.includes('--disable-auto') || args.includes('--auto')) return null
  const deadline = Date.now() + MERGE_GATE_MS
  const left = () => Math.max(1, deadline - Date.now())
  const failClosed = (why) => deny(`Flow guard: cannot confirm this pull request's required checks are green (${why}); run \`node skills/ship/scripts/required-checks.mjs <owner/repo> <number>\` and merge only when it exits 0.`)

  let repo = null
  let target = null
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '-R' || a === '--repo') { repo = args[++i] || null; continue }
    if (a.startsWith('--repo=')) { repo = a.slice(7) || null; continue }
    if (['-b', '--body', '-F', '--body-file', '-t', '--subject', '-A', '--author-email', '--match-head-commit'].includes(a)) { i++; continue }
    if (a.startsWith('-')) continue
    target ??= a
  }
  let number = null
  const url = /github\.com\/([^/\s]+\/[^/\s]+)\/pull\/(\d+)/u.exec(target ?? '')
  if (url) { repo ??= url[1]; number = Number(url[2]) }
  else if (/^#?\d+$/u.test(target ?? '')) number = Number(target.replace('#', ''))
  repo = repo?.replace(/^(?:https?:\/\/)?github\.com\//u, '') ?? null

  if (!number) {
    // No number: the pull request for the named branch, or for the current branch; -R only when the user gave one.
    const r = run('gh', ['pr', 'view', ...(target ? [target] : []), ...(repo ? ['-R', repo] : []), '--json', 'number', '-q', '.number'], { cwd: dir, timeout: left() })
    if (!r.ok || !/^\d+$/u.test(r.stdout)) return failClosed(`gh could not find the pull request: ${firstLine(r)}`)
    number = Number(r.stdout)
  }
  if (!repo) {
    const r = run('gh', ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'], { cwd: dir, timeout: left() })
    if (!r.ok || !r.stdout) return failClosed(`gh could not name the repository: ${firstLine(r)}`)
    repo = r.stdout
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

const MAX_DEPTH = 4
const XARGS_VALUE_OPTS = new Set(['-a', '-d', '-E', '-I', '-L', '-n', '-P', '-s', '--arg-file', '--delimiter', '--eof', '--replace',
  '--max-lines', '--max-args', '--max-procs', '--max-chars', '--process-slot-var'])

// One segment's words. `state.dir` tracks cd; `cwd` stays the session's directory.
function checkSegment(raw, state, cwd, depth) {
  const words = unwrap(raw)
  if (!words.length) return null
  const name = basename(words[0])
  if ((name === 'cd' || name === 'pushd') && words[1] && words[1] !== '-') { state.dir = resolve(state.dir, words[1].replace(/^~(?=\/|$)/u, process.env.HOME ?? '~')); return null }
  if (name === 'git') return checkGit(words, state.dir, cwd)
  if (name === 'gh') return checkGh(words, state.dir)
  if (depth >= MAX_DEPTH) return null
  if (SHELLS.has(name)) {
    const args = words.slice(1)
    for (let i = 0; i < args.length; i++) {
      const a = args[i]
      if (isShellC(a)) {
        const script = args[i + 1] === '--' ? args[i + 2] : args[i + 1]
        return script ? evaluate(script, cwd, depth + 1, state.dir) : null
      }
      if (SHELL_VALUE_OPTS.has(a)) { i++; continue }
      if (!a.startsWith('-') && !a.startsWith('+')) break
    }
    return null
  }
  if (name === 'eval') return evaluate(words.slice(1).join(' '), cwd, depth + 1, state.dir)
  if (name === 'xargs') {
    let i = 1
    for (; i < words.length && words[i].startsWith('-'); i++) {
      if (words[i] === '--') { i++; break }
      if (XARGS_VALUE_OPTS.has(words[i])) i++
    }
    return i < words.length ? checkSegment(words.slice(i), { dir: state.dir }, cwd, depth + 1) : null
  }
  return null
}

// `cwd` is the session's directory; `dir` is where the command starts (it differs inside `cd x && bash -c ...`).
export function evaluate(command, cwd, depth = 0, dir = cwd) {
  const segments = tokenize(stripHeredocs(command))
  const state = { dir }
  for (const raw of segments) {
    const verdict = checkSegment(raw, state, cwd, depth)
    if (verdict) return verdict
  }
  if (depth < MAX_DEPTH) {
    for (const sub of segments.subs) {
      const verdict = evaluate(sub, cwd, depth + 1, dir)
      if (verdict) return verdict
    }
  }
  return null
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')

// A command the guard cannot parse is allowed, unless one of its segments plainly runs git push/commit/merge/rebase
// with a dangerous flag, git with core.hooksPath, a push to the default branch, or gh pr merge (other than toggling
// auto-merge); then it is denied, since the guard cannot tell what it would do. Quotes and backslashes are dropped
// first so `--for''ce` reads as `--force`; segments start at a command position so prose in a message is not matched.
const GIT_OPTS = String.raw`(?:\s+(?:-[Cc]\s+\S+|--?[\w-]+(?:=\S+)?))*`
export function riskyUnparseable(command, cwd) {
  const text = command.replace(/["'\\]/gu, '')
  if (!/\b(?:git|gh)\b/u.test(text)) return null
  const lead = String.raw`^(?:[\w]+=\S*\s+)*(?:(?:sudo|command|exec|env|nohup|time)\s+)*`
  const sub = (name) => new RegExp(`${lead}git${GIT_OPTS}\\s+${name}\\b(.*)$`, 'u')
  const flag = (args, re) => args.split(/\s+/u).some((a) => re.test(a))
  const main = escapeRe(defaultBranch(cwd))
  for (const segment of text.split(/[;&|\n()`]/u).map((s) => s.trim()).filter(Boolean)) {
    let why = null
    if (new RegExp(`${lead}git\\b`, 'u').test(segment) && /core\.hookspath/iu.test(segment)) why = 'it skips hooks'
    const push = sub('push').exec(segment)?.[1]
    if (!why && push !== undefined) {
      if (flag(push, /^(?:--(?:forc|force[\w=:/-]*|mirr\w*)|-[A-Za-z]*f[A-Za-z]*|\+\S+)$/u)) why = 'it forces a push'
      else if (flag(push, /^--no-v[\w-]*$/u)) why = 'it skips hooks'
      else if (flag(push, new RegExp(`^(?:\\S*:)?(?:refs/heads/)?${main}$`, 'u')) && deliveryMode(cwd) !== 'local') why = 'it pushes to the default branch'
    }
    const commit = sub('commit').exec(segment)?.[1]
    if (!why && commit !== undefined && flag(commit, /^(?:--no-v[\w-]*|-[A-Za-z]*n[A-Za-z]*)$/u)) why = 'it skips hooks'
    const other = sub('(?:merge|rebase)').exec(segment)?.[1]
    if (!why && other !== undefined && flag(other, /^--no-v[\w-]*$/u)) why = 'it skips hooks'
    // A merge whose pull request cannot be parsed cannot have its required checks confirmed.
    const ghMerge = new RegExp(`${lead}gh\\s+pr\\s+merge\\b(.*)$`, 'u').exec(segment)?.[1]
    if (!why && ghMerge !== undefined && (flag(ghMerge, /^--adm\w*$/u) || !flag(ghMerge, /^--(?:auto|disable-auto)$/u))) why = 'it merges a pull request whose checks cannot be confirmed'
    if (why) return deny(`Flow guard: this command could not be parsed and ${why}; split it into simpler commands without the dangerous flag, or ask the user to run it.`)
  }
  return null
}

// Claude Code sends tool_input.command and expects a deny object or silence. Cursor sends command at the top
// level and treats empty stdout as an invalid permission response, so an allow is explicit JSON.
export function hookInput(input) {
  if (typeof input?.tool_input?.command === 'string') return { host: 'claude', command: input.tool_input.command }
  if (typeof input?.command === 'string') return { host: 'cursor', command: input.command }
  return null
}

export function hookOutput(host, verdict) {
  if (host === 'cursor') return verdict
    ? { permission: 'deny', agent_message: verdict.deny }
    : { permission: 'allow' }
  if (!verdict) return null
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: verdict.deny } }
}

function main() {
  let input
  try { input = JSON.parse(readFileSync(0, 'utf8')) } catch { return }
  const parsed = hookInput(input)
  if (!parsed) return
  const { host, command } = parsed
  if (!/\b(?:git|gh)\b/u.test(command)) {
    const allow = hookOutput(host, null)
    if (allow) process.stdout.write(`${JSON.stringify(allow)}\n`)
    return
  }
  const cwd = typeof input.cwd === 'string' && input.cwd ? input.cwd : process.cwd()
  let verdict = null
  try { verdict = evaluate(command, cwd) } catch { verdict = riskyUnparseable(command, cwd) }
  const out = hookOutput(host, verdict)
  if (out) process.stdout.write(`${JSON.stringify(out)}\n`)
}

const self = (path) => { try { return realpathSync(path) } catch { return path } }
if (process.argv[1] && self(process.argv[1]) === self(fileURLToPath(import.meta.url))) main()
