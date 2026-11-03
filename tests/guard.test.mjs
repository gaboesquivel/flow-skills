import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

// Feeds PreToolUse JSON through hooks/guard.mjs as Claude Code would, and reads the decision from stdout.
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const guard = join(repoRoot, 'hooks', 'guard.mjs')

const tempDir = (t, prefix) => {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

// A git repository on `branch`, with origin/HEAD pointing at `main`; offline. Origin is a GitHub URL (GitHub delivery
// mode) unless `origin` says otherwise; it is never contacted.
const gitRepo = (t, branch, { main = 'main', origin = 'https://github.com/o/r.git', originHead = true } = {}) => {
  const dir = tempDir(t, 'flow-guard-repo-')
  const git = (...args) => assert.equal(spawnSync('git', args, { cwd: dir, encoding: 'utf8' }).status, 0, `git ${args.join(' ')}`)
  git('init', '-q', '-b', main)
  git('-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'init')
  if (origin) git('remote', 'add', 'origin', origin)
  if (originHead) {
    git('update-ref', `refs/remotes/origin/${main}`, 'HEAD')
    git('symbolic-ref', 'refs/remotes/origin/HEAD', `refs/remotes/origin/${main}`)
  }
  if (branch !== main) git('switch', '-q', '-c', branch)
  return dir
}

const runGuard = (command, { cwd = repoRoot, env = {} } = {}) => {
  const started = Date.now()
  const r = spawnSync(process.execPath, [guard], {
    input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', cwd, tool_input: { command } }),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })
  const elapsed = Date.now() - started
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stderr, '')
  if (!r.stdout) return { decision: 'allow', elapsed }
  const out = JSON.parse(r.stdout).hookSpecificOutput
  assert.equal(out.hookEventName, 'PreToolUse')
  assert.equal(out.permissionDecision, 'deny')
  assert.match(out.permissionDecisionReason, /^Flow guard: .+; .+\.$/u, 'a deny names the rule and a safe alternative')
  return { decision: 'deny', reason: out.permissionDecisionReason, elapsed }
}

const expect = (t, command, decision, options) => {
  const result = runGuard(command, options)
  assert.equal(result.decision, decision, `${command} -> ${result.reason ?? 'allow'}`)
  assert.ok(result.elapsed < 2000, `${command} took ${result.elapsed}ms`)
  return result
}

test('spec table: denies and allows', (t) => {
  const cwd = gitRepo(t, 'spec/059-x')
  expect(t, 'git push --force origin spec/059-x', 'deny', { cwd })
  expect(t, 'git push origin HEAD:main', 'deny', { cwd })
  expect(t, 'git commit -m x --no-verify', 'deny', { cwd })
  expect(t, 'gh pr merge 12 --admin', 'deny', { cwd })
  expect(t, 'git push origin spec/059-x', 'allow', { cwd })
  expect(t, 'git commit -m "fix: --no-verify docs"', 'allow', { cwd })
  expect(t, "cat <<'EOF'\ngit push --force origin main\n", 'allow', { cwd })
})

test('force push in every form', (t) => {
  const cwd = gitRepo(t, 'feature')
  for (const command of [
    'git push -f origin feature',
    'git push -uf origin feature',
    'git push --force-with-lease origin feature',
    'git push --force-with-lease=feature:abc origin feature',
    'git push --force-if-includes origin feature',
    'git push origin +feature',
    'git push origin +HEAD:feature',
    'FOO=1 command git push --force origin feature',
    'cd . && git push --force',
    'bash -c "git push --force origin feature"',
  ]) expect(t, command, 'deny', { cwd })
  expect(t, 'git push -u origin feature', 'allow', { cwd })
})

test('push to the default branch', (t) => {
  const feature = gitRepo(t, 'feature')
  for (const command of ['git push origin main', 'git push origin refs/heads/main', 'git push origin feature:main', 'git -C . push origin HEAD:refs/heads/main', 'git push origin :main']) {
    expect(t, command, 'deny', { cwd: feature })
  }
  expect(t, 'git push', 'allow', { cwd: feature })
  expect(t, 'git push origin HEAD', 'allow', { cwd: feature })

  const onMain = gitRepo(t, 'main')
  expect(t, 'git push', 'deny', { cwd: onMain })
  expect(t, 'git push origin', 'deny', { cwd: onMain })
  expect(t, 'git push origin HEAD', 'deny', { cwd: onMain })
})

test('the default branch comes from origin/HEAD', (t) => {
  const cwd = gitRepo(t, 'feature')
  spawnSync('git', ['update-ref', 'refs/remotes/origin/trunk', 'HEAD'], { cwd })
  spawnSync('git', ['symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/trunk'], { cwd })
  expect(t, 'git push origin trunk', 'deny', { cwd })
  expect(t, 'git push origin main', 'allow', { cwd })
})

test('skipping hooks', (t) => {
  const cwd = gitRepo(t, 'feature')
  for (const command of ['git commit -n -m x', 'git commit -anm x', 'git push --no-verify origin feature', 'git merge --no-verify feature', 'git rebase --no-verify main', 'git commit -m "x" "--no-verify"']) {
    expect(t, command, 'deny', { cwd })
  }
  for (const command of ['git commit -m -n', 'git commit -am "skip -n here"', 'git commit -F - <<EOF\nmsg --no-verify\nEOF', 'git merge -n feature', 'echo "--no-verify"']) {
    expect(t, command, 'allow', { cwd })
  }
})

test('destructive commands outside the session directory', (t) => {
  const cwd = gitRepo(t, 'feature')
  const elsewhere = tempDir(t, 'flow-guard-elsewhere-')
  expect(t, `git -C ${elsewhere} reset --hard`, 'deny', { cwd })
  expect(t, 'git -C /tmp/elsewhere reset --hard', 'deny', { cwd })
  expect(t, `cd ${elsewhere} && git reset --hard HEAD`, 'deny', { cwd })
  expect(t, `git -C ${elsewhere} clean -fdx`, 'deny', { cwd })
  expect(t, 'git worktree remove ../other', 'deny', { cwd })
  expect(t, `git worktree remove --force ${elsewhere}`, 'deny', { cwd })

  mkdirSync(join(cwd, '.worktrees', 'mine'), { recursive: true })
  expect(t, 'git reset --hard', 'allow', { cwd })
  expect(t, 'git reset --hard origin/main', 'allow', { cwd })
  expect(t, 'git clean -fd', 'allow', { cwd })
  expect(t, 'git worktree remove .worktrees/mine', 'allow', { cwd })
  expect(t, `git -C ${elsewhere} status`, 'allow', { cwd })
})

test('merge gate runs required-checks and fails closed', (t) => {
  const cwd = gitRepo(t, 'feature')
  const dir = tempDir(t, 'flow-guard-stub-')
  const stub = (name, body) => { const path = join(dir, name); writeFileSync(path, body); return path }
  const green = stub('green.mjs', 'console.log(JSON.stringify({ ready: true, reasons: [] }))\n')
  const red = stub('red.mjs', "console.log(JSON.stringify({ ready: false, reasons: ['ci is failure on abc1234'] })); process.exitCode = 1\n")
  const unreachable = stub('unreachable.mjs', "console.log(JSON.stringify({ ready: false, reasons: ['cannot read repos/o/r/pulls/12'] })); process.exitCode = 2\n")

  expect(t, 'gh pr merge 12 -R o/r --squash', 'allow', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: green } })
  expect(t, 'gh pr merge https://github.com/o/r/pull/12 --squash', 'allow', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: green } })
  const failing = expect(t, 'gh pr merge 12 --repo o/r --squash --delete-branch', 'deny', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: red } })
  assert.match(failing.reason, /o\/r#12.*ci is failure on abc1234/u)
  const offline = expect(t, 'gh pr merge 12 -R o/r', 'deny', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: unreachable } })
  assert.match(offline.reason, /cannot read/u)
  expect(t, 'gh pr merge 12 -R o/r', 'deny', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: join(dir, 'missing.mjs') } })
  expect(t, 'gh pr merge 12 -R o/r --admin', 'deny', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: green } })
  expect(t, 'gh pr merge 12 -R o/r --disable-auto', 'allow', { cwd, env: { FLOW_GUARD_REQUIRED_CHECKS: red } })
})

test('local delivery mode may push the default branch, never force', (t) => {
  const bare = tempDir(t, 'flow-guard-bare-')
  const local = gitRepo(t, 'main', { origin: bare })
  expect(t, 'git push origin main', 'allow', { cwd: local })
  expect(t, 'git push', 'allow', { cwd: local })
  expect(t, 'git push --force origin main', 'deny', { cwd: local })
  expect(t, 'git push origin +main', 'deny', { cwd: local })
  expect(t, 'git push --no-verify origin main', 'deny', { cwd: local })

  const github = gitRepo(t, 'main')
  expect(t, 'git push origin main', 'deny', { cwd: github })

  const blockLocal = gitRepo(t, 'main')
  writeFileSync(join(blockLocal, 'AGENTS.md'), '# Agents\n\n<!-- BEGIN FLOW -->\nDelivery: local\n<!-- END FLOW -->\n')
  // The Delivery line cannot open a GitHub destination: origin here is github.com.
  expect(t, 'git push origin main', 'deny', { cwd: blockLocal })
  expect(t, 'git push -f origin main', 'deny', { cwd: blockLocal })

  const blockGithub = gitRepo(t, 'main', { origin: bare })
  writeFileSync(join(blockGithub, 'CLAUDE.md'), '<!-- BEGIN FLOW -->\nDelivery: github\n<!-- END FLOW -->\n')
  expect(t, 'git push origin main', 'deny', { cwd: blockGithub })

  const outsideBlock = gitRepo(t, 'main')
  writeFileSync(join(outsideBlock, 'AGENTS.md'), 'Delivery: local\n')
  expect(t, 'git push origin main', 'deny', { cwd: outsideBlock })
})

test('default branch falls back to main, master, then init.defaultBranch', (t) => {
  const master = gitRepo(t, 'master', { main: 'master', originHead: false })
  expect(t, 'git push origin master', 'deny', { cwd: master })
  expect(t, 'git push', 'deny', { cwd: master })
  expect(t, 'git push origin main', 'allow', { cwd: master })

  const trunk = gitRepo(t, 'trunk', { main: 'trunk', originHead: false })
  spawnSync('git', ['config', 'init.defaultBranch', 'trunk'], { cwd: trunk })
  expect(t, 'git push origin trunk', 'deny', { cwd: trunk })
})

test('bypass forms are read through', (t) => {
  const cwd = gitRepo(t, 'feat')
  for (const command of [
    'bash -lc "git push --force origin feat"',
    'sh -ec "git push -f origin feat"',
    'zsh -xc \'git commit -n -m x\'',
    'bash -c -- "git push -f origin feat"',
    'eval git push --force origin feat',
    'eval "git push -f origin feat"',
    'echo feat | xargs git push -f origin',
    'xargs -I {} -n 1 git push --force origin {}',
    'xargs sh -c "git push -f origin feat"',
    'sudo -u root git push -f origin feat',
    'sudo -u root -g wheel -- git push --force origin feat',
    'echo "$(git push -f origin feat)"',
    'echo "x `git push -f origin feat` y"',
    'echo `git push -f origin feat`',
    'git push --forc origin feat',
    'git push --force-w origin feat',
    'git push --force-with origin feat',
    'git push --mirr origin',
    'git push --no-v origin feat',
    'git commit --no-veri -m x',
    'git merge --no-v feat',
    'gh pr merge 12 --adm',
    'git -c core.hooksPath=/dev/null commit -m x',
    'git -c core.hookspath= push origin feat',
    'git -c CORE.HOOKSPATH=x merge feat',
    'git -ccore.hooksPath=/tmp rebase main',
    'git -c core.hooksPath=/dev/null am x.patch',
    'git -c core.hooksPath=/dev/null cherry-pick abc',
    'bash <<EOF\ngit push --force origin feat\nEOF',
    'cat <<\'EOF\' | sh\ngit push -f origin feat\nEOF',
    'bash -s <<EOF\ngit commit -n -m x\nEOF',
    'echo "a<<EOF"\ngit push -f origin feat',
    "echo 'a<<EOF'\ngit push -f origin feat",
    'cd /tmp && bash -c "git -C /tmp/elsewhere reset --hard"',
  ]) expect(t, command, 'deny', { cwd })
  for (const command of [
    'git commit -m "--no-verify"',
    'git commit -F - <<EOF\nfix: drop --no-verify\ngit push -f origin main\nEOF',
    'bash script.sh <<EOF\ngit push -f origin feat\nEOF',
    'git -c user.name=x commit -m ok',
    'git -c core.hooksPath=x status',
    'git push --follow-tags origin feat',
    'echo "$(git status)"',
    'sudo -u root git push origin feat',
    'gh pr merge 12 --auto --squash',
  ]) expect(t, command, 'allow', { cwd })
})

test('merge gate resolves the current branch pull request without -R', (t) => {
  const cwd = gitRepo(t, 'feature')
  const dir = tempDir(t, 'flow-guard-gh-')
  const log = join(dir, 'gh.log')
  writeFileSync(join(dir, 'gh'), `#!/bin/sh
echo "$*" >> "${log}"
case "$*" in
  "pr view"*) echo 34 ;;
  "repo view"*) echo o/r ;;
  *) exit 1 ;;
esac
`)
  chmodSync(join(dir, 'gh'), 0o755)
  const checks = join(dir, 'checks.mjs')
  writeFileSync(checks, `import { appendFileSync } from 'node:fs'\nappendFileSync(${JSON.stringify(log)}, 'checks ' + process.argv.slice(2).join(' ') + '\\n')\n`)
  const env = { PATH: `${dir}${delimiter}${process.env.PATH}`, FLOW_GUARD_REQUIRED_CHECKS: checks }
  const lines = () => readFileSync(log, 'utf8').trim().split('\n')

  expect(t, 'gh pr merge --squash', 'allow', { cwd, env })
  assert.deepEqual(lines(), ['pr view --json number -q .number', 'repo view --json nameWithOwner -q .nameWithOwner', 'checks o/r 34'])

  writeFileSync(log, '')
  expect(t, 'gh pr merge -R o/x --squash', 'allow', { cwd, env })
  assert.deepEqual(lines(), ['pr view -R o/x --json number -q .number', 'checks o/x 34'])

  writeFileSync(log, '')
  expect(t, 'gh pr merge feature --merge', 'allow', { cwd, env })
  assert.equal(lines()[0], 'pr view feature --json number -q .number')

  writeFileSync(log, '')
  expect(t, 'gh pr merge --auto --squash', 'allow', { cwd, env })
  assert.equal(readFileSync(log, 'utf8'), '', 'auto-merge is left to GitHub')
})

test('a heredoc inside "$(...)" is stripped, so quotes in its body do not hide the command', (t) => {
  const cwd = gitRepo(t, 'feature')
  const msg = (body) => `"$(cat <<'EOF'\n${body}\nEOF\n)"`
  for (const command of [
    `git commit --no-verify -m ${msg("fix: it's done")}`,
    `git commit -m ${msg("fix: it's done")} && git push --force origin feature`,
    `git commit --no-verify -m ${msg('fix: say "hi')}`,
    `git commit -m ${msg("won't")} && git push origin main`,
    `git commit -m ${msg("won't")} && git push --force origin feature`,
  ]) {
    const r = expect(t, command, 'deny', { cwd })
    assert.doesNotMatch(r.reason, /could not be parsed/u, 'parsed, not caught by the fail-closed fallback')
  }
  for (const command of [
    `git commit -m ${msg("fix: it's done\n\nIt won't push --force.")}`,
    `git commit -m ${msg("fix: it's done")} && git push origin feature`,
    "cat <<EOF | git commit -F -\nfix: it's done\nEOF",
    'echo "$(cat <<EOF\n$(git status)\nEOF\n)"',
  ]) expect(t, command, 'allow', { cwd })
})

test('fails closed when an unparseable command shows a dangerous git flag', (t) => {
  const cwd = gitRepo(t, 'feature')
  for (const command of [
    'git push --force origin feature && echo "unbalanced',
    'git commit --no-verify -m x && echo "unbalanced',
    'git commit -n -m x; echo "unbalanced',
    'git push origin +feature && echo "unbalanced',
    'git push origin main && echo "unbalanced',
    'gh pr merge 12 --admin && echo "unbalanced',
    'git -c core.hooksPath=/dev/null commit -m x && echo "unbalanced',
    "git commit -m $'it\\'s' && gh pr merge 12 --squash",
    "echo $'it\\'s'; gh pr merge 12 --auto --squash",
    "git commit -m $'it\\'s' && git push origin \"main\"",
    "git commit -m $'it\\'s' && git push origin HEAD:ma''in",
  ]) {
    const r = expect(t, command, 'deny', { cwd })
    assert.match(r.reason, /could not be parsed/u)
  }
  for (const command of ['git commit -m x && echo "unbalanced', 'git push origin feature && echo "unbalanced', 'git status && echo "--force']) {
    expect(t, command, 'allow', { cwd })
  }
  const bare = tempDir(t, 'flow-guard-bare-')
  expect(t, 'git push origin main && echo "unbalanced', 'allow', { cwd: gitRepo(t, 'main', { origin: bare }) })
})

test('a default-branch push to a GitHub destination is denied whatever origin or the Delivery line says', (t) => {
  const bare = tempDir(t, 'flow-guard-bare-')
  const local = gitRepo(t, 'main', { origin: bare })
  expect(t, 'git push git@github.com:a/b.git main', 'deny', { cwd: local })
  expect(t, 'git push https://github.com/a/b.git HEAD:main', 'deny', { cwd: local })
  expect(t, 'git push git@github.com:a/b.git feature', 'allow', { cwd: local })
  expect(t, 'git push origin main', 'allow', { cwd: local })
  expect(t, `git push ${bare} main`, 'allow', { cwd: local })

  const mirror = gitRepo(t, 'main', { origin: bare })
  spawnSync('git', ['remote', 'add', 'upstream', 'git@github.com:a/b.git'], { cwd: mirror })
  expect(t, 'git push upstream main', 'deny', { cwd: mirror })
  expect(t, 'git push origin main', 'allow', { cwd: mirror })
  spawnSync('git', ['config', 'branch.main.remote', 'upstream'], { cwd: mirror })
  expect(t, 'git push', 'deny', { cwd: mirror })

  const blockLocal = gitRepo(t, 'main')
  writeFileSync(join(blockLocal, 'AGENTS.md'), '<!-- BEGIN FLOW -->\nDelivery: local\n<!-- END FLOW -->\n')
  expect(t, 'git push origin main', 'deny', { cwd: blockLocal })
})

test('allows what it does not recognise or cannot parse', (t) => {
  const cwd = gitRepo(t, 'feature')
  for (const command of ['ls -la', 'npm test', 'echo "unbalanced', 'git status', 'gh pr view 12', 'git log --oneline | head', "echo 'git push --force origin main'"]) {
    expect(t, command, 'allow', { cwd })
  }
  const empty = spawnSync(process.execPath, [guard], { input: 'not json', encoding: 'utf8' })
  assert.equal(empty.status, 0)
  assert.equal(empty.stdout, '')
})
