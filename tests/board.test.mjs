import assert from 'node:assert/strict'
import { execFile, spawn } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test, { describe } from 'node:test'
import vm from 'node:vm'
import { readDelivery as flowReadDelivery } from '../skills/flow/lib/flow-block.mjs'
import { countTasks, deriveBoard, main, escapeHtml, fetchGithub, githubReader, githubSource, LIVE_SCRIPT, parseGithubRemote, parseTasks, readDelivery, parseStatus, readSnapshot, renderHtml, startServer } from '../skills/board/scripts/board.mjs'

const script = join(import.meta.dirname, '../skills/board/scripts/board.mjs')

// Subprocesses run asynchronously so concurrent tests overlap their git and CLI work instead of
// queueing behind one blocked event loop. Both resolve like spawnSync: { status, stdout, stderr }.
const run = (file, args, options = {}) => new Promise((done) => {
  execFile(file, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...options }, (error, stdout, stderr) => {
    done({ status: error ? (typeof error.code === 'number' ? error.code : null) : 0, stdout, stderr })
  })
})
const cliIn = (options, ...args) => run(process.execPath, [script, ...args], options)
const cli = (...args) => cliIn({}, ...args)
const gitIn = async (dir, args, options = {}) => {
  const result = await run('git', args, { cwd: dir, ...options })
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`)
  return result.stdout
}

const spec = (title, status, rest = '') => `# ${title}\n\n${status === null ? '' : `Status: ${status} (2026-10-28).\n`}\n## Problem\n\nText.\n${rest}`
const snapshot = (specs, branches = []) => ({ defaultBranch: 'main', branches, specs: Object.entries(specs).map(([file, content]) => ({ file, content, source: 'main' })) })
const stageOf = (board, number) => board.columns.find((column) => column.cards.some((card) => card.number === number))?.id
const cardOf = (board, number) => board.columns.flatMap((column) => column.cards).find((card) => card.number === number)
const NOW = '2026-10-28T12:00:00.000Z'

// Every test uses its own temporary repository, port, and stubs, so async tests (servers, spawned CLIs) overlap.
describe('board', { concurrency: true }, () => {
test('board has five columns in stage order', () => {
  const board = deriveBoard(snapshot({}))
  assert.deepEqual(board.columns.map((column) => column.title), ['Candidate', 'Specced', 'Ready', 'Building', 'Shipped'])
})

test('status implemented is Shipped', () => {
  assert.equal(stageOf(deriveBoard(snapshot({ '001-a.md': spec('001: A', 'implemented') })), '001'), 'shipped')
})

test('draft without tasks is Specced, without marker', () => {
  const board = deriveBoard(snapshot({ '002-b.md': spec('002: B', 'draft') }))
  assert.equal(stageOf(board, '002'), 'specced')
  assert.equal(cardOf(board, '002').marker, null)
  assert.equal(cardOf(board, '002').title, 'B')
})

test('accepted is a known status: Specced without tasks, Ready with tasks, no marker', () => {
  const board = deriveBoard(snapshot({ '008-h.md': spec('008: H', 'accepted'), '009-i.md': spec('009: I', 'accepted', '\n## Tasks\n\n- [ ] one\n') }))
  assert.equal(stageOf(board, '008'), 'specced')
  assert.equal(cardOf(board, '008').marker, null)
  assert.equal(stageOf(board, '009'), 'ready')
  assert.equal(cardOf(board, '009').marker, null)
})

test('candidate status is Candidate, not swallowed by Specced', () => {
  assert.equal(stageOf(deriveBoard(snapshot({ '003-c.md': spec('003: C', 'candidate') })), '003'), 'candidate')
})

test('missing or unknown status is Specced with a marker', () => {
  const board = deriveBoard(snapshot({ '004-d.md': spec('004: D', null), '005-e.md': spec('005: E', 'proposed') }))
  assert.equal(stageOf(board, '004'), 'specced')
  assert.equal(cardOf(board, '004').marker, 'no status line')
  assert.equal(stageOf(board, '005'), 'specced')
  assert.match(cardOf(board, '005').marker, /unknown status "proposed"/u)
})

test('bold status lines parse; task status lines below the header do not', () => {
  assert.equal(parseStatus('# 1: X\n\n**Status:** Implemented\n'), 'implemented')
  assert.equal(parseStatus('# 1: X\n\n## Tasks\n\n**Status:** done\n'), null)
})

test('tasks with none done is Ready; one done is Building', () => {
  const ready = spec('006: F', 'draft', '\n## Tasks\n\n- [ ] one\n- [ ] two\n')
  const started = spec('007: G', 'draft', '\n## Tasks\n\n- [x] one\n- [ ] two\n')
  const board = deriveBoard(snapshot({ '006-f.md': ready, '007-g.md': started }))
  assert.equal(stageOf(board, '006'), 'ready')
  assert.equal(stageOf(board, '007'), 'building')
  assert.deepEqual(cardOf(board, '007').tasks, { done: 1, total: 2 })
})

test('task counting: checkboxes, or ### headings with Status done or all boxes checked', () => {
  assert.deepEqual(countTasks('# X\n\n## Tasks\n\n- [x] a\n- [X] b\n- [ ] c\n\n## Notes\n\n- [ ] not a task\n'), { done: 2, total: 3 })
  const headed = [
    '## Tasks', '',
    '### 01: One', '**Status:** done in #12', '- [ ] stale box', '',
    '### 02: Two', '**Status:** planned', '- [x] a', '- [x] b', '',
    '### 03: Three', '**Status:** planned', '- [x] a', '- [ ] b', '',
  ].join('\n')
  assert.deepEqual(countTasks(headed), { done: 2, total: 3 })
  assert.deepEqual(countTasks('# X\n\nno tasks\n'), { done: 0, total: 0 })
})

test('unmerged branch with code whose last segment contains the slug is Building', () => {
  const branches = [{ name: 'feat/progress-board', remote: false, merged: false, implementation: true }, { name: 'feat/other', remote: false, merged: false, implementation: true }]
  const board = deriveBoard({ ...snapshot({ '012-progress-board.md': spec('012: Progress board', 'draft') }, branches), delivery: 'local' })
  assert.equal(stageOf(board, '012'), 'building')
  assert.equal(cardOf(board, '012').branch, 'feat/progress-board')
})

test('merged spec branch is Shipped even when status is draft', () => {
  const branches = [{ name: 'origin/spec/009-flow-mode', remote: true, merged: true, implementation: true }]
  const board = deriveBoard(snapshot({ '009-flow-mode.md': spec('009: Flow mode', 'draft') }, branches))
  assert.equal(stageOf(board, '009'), 'shipped')
})

test('renderHtml escapes text', () => {
  const html = renderHtml(deriveBoard(snapshot({ '001-x.md': spec('001: <script>alert(1)</script>', 'draft') })))
  assert.doesNotMatch(html, /<script>/u)
  assert.match(html, /&lt;script&gt;/u)
})

async function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'board-git-'))
  const git = (...args) => gitIn(dir, args)
  await git('init', '--quiet', '--initial-branch=main')
  // Written directly: three fewer git processes per fixture repository.
  appendFileSync(join(dir, '.git', 'config'), '[user]\n\temail = board@test.invalid\n\tname = Board Test\n[commit]\n\tgpgsign = false\n')
  const write = (file, content) => { mkdirSync(join(dir, 'docs/specs'), { recursive: true }); writeFileSync(join(dir, 'docs/specs', file), content) }
  const commit = async (message) => { await git('add', '-A'); await git('commit', '--quiet', '-m', message) }
  return { dir, git, write, commit }
}

test('readSnapshot and --once render a fixture repository', async () => {
  const { dir, git, write, commit } = await makeRepo()
  try {
    write('README.md', '# Specs\n')
    write('001-shipped.md', spec('001: Shipped thing', 'implemented'))
    write('002-idea.md', spec('002: Idea', 'candidate'))
    write('003-plain.md', spec('003: Plain draft', 'draft'))
    write('004-planned.md', spec('004: Planned', 'draft', '\n## Tasks\n\n- [ ] one\n'))
    write('005-merged-work.md', spec('005: Merged work', 'draft'))
    write('006-active.md', spec('006: Active', 'draft'))
    await commit('specs')
    await git('switch', '--quiet', '-c', 'feat/merged-work')
    writeFileSync(join(dir, 'work.txt'), 'done\n')
    await commit('work')
    await git('switch', '--quiet', 'main')
    await git('merge', '--quiet', '--no-ff', '-m', 'merge', 'feat/merged-work')
    await git('branch', 'feat/active')
    await git('switch', '--quiet', 'feat/active')
    writeFileSync(join(dir, 'active.txt'), 'wip\n')
    write('007-branch-only.md', spec('007: Branch only', 'draft'))
    await commit('wip')
    await git('switch', '--quiet', 'main')

    const snap = readSnapshot(dir)
    assert.equal(snap.defaultBranch, 'main')
    assert.equal(snap.specs.some((s) => s.file === 'README.md'), false)
    const board = deriveBoard(snap)
    assert.equal(stageOf(board, '001'), 'shipped')
    assert.equal(stageOf(board, '002'), 'candidate')
    assert.equal(stageOf(board, '003'), 'specced')
    assert.equal(stageOf(board, '004'), 'ready')
    assert.equal(stageOf(board, '005'), 'shipped')
    assert.equal(stageOf(board, '006'), 'building')
    assert.equal(cardOf(board, '007').source, 'feat/active')

    const out = join(dir, 'out', 'board.html')
    const once = await cliIn({ cwd: join(dir, 'docs') }, '--once', '--out', out)
    assert.equal(once.status, 0, once.stderr)
    assert.equal(once.stdout.trim(), out)
    const html = readFileSync(out, 'utf8')
    for (const title of ['Candidate', 'Specced', 'Ready', 'Building', 'Shipped']) assert.match(html, new RegExp(`<h2>${title} `, 'u'))
    for (const title of ['Shipped thing', 'Idea', 'Plain draft', 'Planned', 'Merged work', 'Active']) assert.match(html, new RegExp(title, 'u'))
    assert.doesNotMatch(html, /https?:\/\//u)

    const defaultRun = await cli('--once', '--repo', dir)
    assert.equal(defaultRun.status, 0, defaultRun.stderr)
    assert.match(defaultRun.stdout.trim(), /\.git[/\\]flow[/\\]board\.html$/u)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('CLI without a mode prints usage', async () => {
  const usage = await cli()
  assert.equal(usage.status, 2)
  assert.match(usage.stderr, /--once/u)
})

// Argument errors return before any git or server work, so main() covers them in-process; the test
// above covers the process exit code.
const usageExit = async (args) => {
  const errors = []
  const code = await main(args, { error: (message) => errors.push(message) })
  return { code, stderr: errors.join('\n') }
}

async function withRepo(fn) {
  const repo = await makeRepo()
  try { return await fn(repo) } finally { rmSync(repo.dir, { recursive: true, force: true }) }
}

const touch = (dir, file) => writeFileSync(join(dir, file), `${file}\n`)

test('branch match uses slug token boundaries, not substrings', () => withRepo(async ({ dir, git, write, commit }) => {
  write('001-board.md', spec('001: Board', 'draft'))
  write('002-auth.md', spec('002: Auth', 'draft'))
  write('003-api.md', spec('003: Api', 'draft'))
  write('004-live.md', spec('004: Live', 'draft'))
  await commit('specs')
  for (const branch of ['feat/dashboard', 'fix/oauth-token', 'feat/rapid-fix', 'feat/004-live-page']) {
    await git('switch', '--quiet', '-c', branch, 'main')
    touch(dir, branch.replace('/', '-'))
    await commit(branch)
  }
  await git('switch', '--quiet', 'main')
  const board = deriveBoard(readSnapshot(dir))
  for (const number of ['001', '002', '003']) {
    assert.equal(stageOf(board, number), 'specced', number)
    assert.equal(cardOf(board, number).branch, null, number)
  }
  assert.equal(stageOf(board, '004'), 'building')
  assert.equal(cardOf(board, '004').branch, 'feat/004-live-page')
}))

test('empty branch cut from an older default commit is not merged', () => withRepo(async ({ dir, git, write, commit }) => {
  await git('remote', 'add', 'origin', 'https://github.com/example/fixture.git')
  write('001-old-branch.md', spec('001: Old branch', 'draft'))
  await commit('specs')
  await git('branch', 'feat/old-branch')
  touch(dir, 'later.txt')
  await commit('main moves on')
  const snap = readSnapshot(dir)
  assert.equal(snap.branches.find((b) => b.name === 'feat/old-branch').merged, false)
  assert.equal(stageOf(deriveBoard(snap), '001'), 'specced', 'an empty open branch is not implementation work')
}))

test('merged branch ships only when tasks are done; card branch is the one the rule used', () => withRepo(async ({ dir, git, write, commit }) => {
  touch(dir, 'README.md')
  await commit('init')
  await git('switch', '--quiet', '-c', 'feat/tasked')
  write('001-tasked.md', spec('001: Tasked', 'draft', '\n## Tasks\n\n- [ ] a\n- [ ] b\n- [ ] c\n'))
  await commit('spec only')
  await git('switch', '--quiet', 'main')
  await git('merge', '--quiet', '--no-ff', '-m', 'merge tasked', 'feat/tasked')
  await git('switch', '--quiet', '-c', 'feat/finished')
  write('002-finished.md', spec('002: Finished', 'draft', '\n## Tasks\n\n- [x] a\n- [x] b\n'))
  touch(dir, 'feature.js')
  await commit('finished')
  await git('switch', '--quiet', 'main')
  await git('merge', '--quiet', '--no-ff', '-m', 'merge finished', 'feat/finished')
  await git('switch', '--quiet', '-c', 'feat/finished-followup')
  touch(dir, 'followup.txt')
  await commit('followup')
  await git('switch', '--quiet', 'main')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(stageOf(board, '001'), 'ready')
  assert.deepEqual(cardOf(board, '001').tasks, { done: 0, total: 3 })
  assert.equal(stageOf(board, '002'), 'shipped')
  assert.equal(cardOf(board, '002').reason, 'branch feat/finished merged')
  assert.equal(cardOf(board, '002').branch, 'feat/finished')
}))

test('squash-merged branch counts as merged', () => withRepo(async ({ dir, git, write, commit }) => {
  write('001-squashed.md', spec('001: Squashed', 'draft'))
  await commit('specs')
  await git('switch', '--quiet', '-c', 'feat/squashed')
  touch(dir, 'a.txt')
  await commit('a')
  touch(dir, 'b.txt')
  await commit('b')
  await git('switch', '--quiet', 'main')
  await git('merge', '--quiet', '--squash', 'feat/squashed')
  await commit('squash')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(stageOf(board, '001'), 'shipped')
  assert.equal(cardOf(board, '001').branch, 'feat/squashed')
}))

test('branch-only specs cap at Building, dedupe by number, prefer local refs', () => withRepo(async ({ dir, git, write, commit }) => {
  write('002-alpha.md', spec('002: Alpha', 'draft'))
  await commit('main spec')
  await git('switch', '--quiet', '-c', 'feat/side')
  write('001-side.md', spec('001: Side', 'implemented'))
  write('002-beta.md', spec('002: Beta', 'draft'))
  await commit('side specs')
  await git('switch', '--quiet', '-c', 'feat/zeta', 'main')
  write('003-shared.md', spec('003: Shared local', 'draft'))
  await commit('zeta')
  await git('switch', '--quiet', '-c', 'tmp', 'main')
  write('003-shared.md', spec('003: Shared remote', 'draft'))
  await commit('remote copy')
  await git('update-ref', 'refs/remotes/origin/feat/aaa', 'HEAD')
  await git('switch', '--quiet', 'main')
  await git('branch', '-D', 'tmp')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(stageOf(board, '001'), 'building')
  assert.match(cardOf(board, '001').marker, /on branch feat\/side/u)
  assert.equal(cardOf(board, '001').branch, 'feat/side')
  assert.equal(cardOf(board, '002').slug, 'alpha')
  assert.match(cardOf(board, '002').marker, /number 002 also used by 002-beta\.md on feat\/side/u)
  assert.equal(cardOf(board, '003').title, 'Shared local')
  assert.equal(cardOf(board, '003').source, 'feat/zeta')
}))

test('full refnames and -z listing: a tag named main and non-ASCII names do not break reads', () => withRepo(async ({ dir, git, write, commit }) => {
  touch(dir, 'README.md')
  await commit('init')
  await git('tag', 'main')
  write('001-café.md', spec('001: Café', 'implemented'))
  await commit('specs')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(cardOf(board, '001').title, 'Café')
  assert.equal(stageOf(board, '001'), 'shipped')
}))

test('default branch falls back to init.defaultBranch, else exits 1', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'board-nodefault-'))
  const env = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' }
  const git = (...args) => gitIn(dir, args, { env })
  try {
    await git('init', '--quiet', '--initial-branch=trunk')
    appendFileSync(join(dir, '.git', 'config'), '[user]\n\temail = board@test.invalid\n\tname = Board Test\n[commit]\n\tgpgsign = false\n')
    touch(dir, 'README.md')
    await git('add', '-A')
    await git('commit', '--quiet', '-m', 'init')
    const missing = await cliIn({ env }, '--json', '--repo', dir)
    assert.equal(missing.status, 1)
    assert.match(missing.stderr, /No default branch/u)
    await git('config', 'init.defaultBranch', 'trunk')
    const found = await cliIn({ env }, '--json', '--repo', dir)
    assert.equal(found.status, 0, found.stderr)
    assert.equal(JSON.parse(found.stdout).defaultBranch, 'trunk')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('merging a candidate spec branch does not ship it', () => withRepo(async ({ dir, git, write, commit }) => {
  touch(dir, 'README.md')
  await commit('init')
  await git('switch', '--quiet', '-c', 'explore/payments-flow')
  write('001-payments-flow.md', spec('001: Payments flow', 'candidate'))
  touch(dir, 'notes.js')
  await commit('explore')
  await git('switch', '--quiet', 'main')
  await git('merge', '--quiet', '--no-ff', '-m', 'merge explore', 'explore/payments-flow')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(stageOf(board, '001'), 'candidate')
  assert.equal(cardOf(board, '001').branch, null)
}))

test('docs-only squash merge of a draft without tasks is not shipped', () => withRepo(async ({ dir, git, write, commit }) => {
  touch(dir, 'README.md')
  await commit('init')
  await git('switch', '--quiet', '-c', 'docs/006-search')
  write('006-search.md', spec('006: Search', 'draft'))
  await commit('spec')
  await git('switch', '--quiet', 'main')
  await git('merge', '--quiet', '--squash', 'docs/006-search')
  await commit('squash spec')
  const snap = readSnapshot(dir)
  const branch = snap.branches.find((b) => b.name === 'docs/006-search')
  assert.equal(branch.merged, true)
  assert.equal(branch.implementation, false)
  assert.equal(stageOf(deriveBoard(snap), '006'), 'specced')
}))

test('add-then-revert branch is not implementation work', () => withRepo(async ({ dir, git, write, commit }) => {
  write('001-revert.md', spec('001: Revert', 'draft'))
  await commit('specs')
  await git('switch', '--quiet', '-c', 'feat/revert')
  touch(dir, 'code.js')
  await commit('add')
  await git('rm', '--quiet', 'code.js')
  await commit('revert')
  await git('switch', '--quiet', 'main')
  await git('merge', '--quiet', '--no-ff', '-m', 'merge revert', 'feat/revert')
  const board = deriveBoard(readSnapshot(dir))
  assert.equal(stageOf(board, '001'), 'specced')
}))

test('status rule cards carry no fallback branch; implemented with open tasks is marked', () => {
  const branches = [{ name: 'origin/feat/explore-redesign', remote: true, merged: true, implementation: true }]
  const content = spec('010: Explore redesign', 'implemented', '\n## Tasks\n\n- [x] a\n- [ ] b\n')
  const board = deriveBoard(snapshot({ '010-explore-redesign.md': content }, branches))
  assert.equal(stageOf(board, '010'), 'shipped')
  assert.equal(cardOf(board, '010').branch, null)
  assert.equal(cardOf(board, '010').marker, 'status implemented, 1 task open')
})

test('repository without commits says so', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'board-unborn-'))
  try {
    await gitIn(dir, ['init', '--quiet'])
    const unborn = await cli('--json', '--repo', dir)
    assert.equal(unborn.status, 1)
    assert.match(unborn.stderr, /No commits yet/u)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('--repo or --out without a value prints usage and exits 2', async () => {
  for (const args of [['--once', '--repo'], ['--once', '--out'], ['--once', '--out', '--json']]) {
    const result = await usageExit(args)
    assert.equal(result.code, 2, args.join(' '))
    assert.match(result.stderr, /Usage/u)
  }
})

function statusWithHost(url, host) {
  return new Promise((done, fail) => {
    http.get(url, { headers: { host } }, (res) => { res.resume(); res.on('end', () => done(res.statusCode)) }).on('error', fail)
  })
}

const getState = async (url) => (await fetch(new URL('state', url))).json()

test('live server: /state JSON, page, memo window, new commits, git failure, host check', async () => {
  const { dir, write, commit } = await makeRepo()
  write('001-first.md', spec('001: First', 'draft'))
  await commit('first')
  // Same repo, two memo windows: one never expires during the test, one recomputes on every request.
  const memoized = await startServer({ repoRoot: dir, port: 0, memoMs: 60_000 })
  const fresh = await startServer({ repoRoot: dir, port: 0, memoMs: 0 })
  try {
    assert.equal(memoized.server.address().address, '127.0.0.1')
    assert.match(memoized.url, /^http:\/\/127\.0\.0\.1:\d+\/$/u)

    const res = await fetch(new URL('state', memoized.url))
    assert.equal(res.status, 200)
    assert.match(res.headers.get('content-type'), /application\/json/u)
    const board = await res.json()
    assert.deepEqual(board.columns.map((column) => column.id), ['candidate', 'specced', 'ready', 'building', 'shipped'])
    assert.equal(board.defaultBranch, 'main')
    assert.deepEqual(Object.keys(cardOf(board, '001')).sort(), ['branch', 'issues', 'marker', 'number', 'pr', 'reason', 'slug', 'source', 'status', 'tasks', 'title'])

    const html = await (await fetch(memoized.url)).text()
    assert.match(html, /<h2>Specced <span class="count">1<\/span>/u)
    assert.match(html, /fetch\('state'/u)
    assert.match(html, /id="banner"/u)
    assert.match(html, /script-src 'sha256-[A-Za-z0-9+/=]+'/u)
    assert.doesNotMatch(html, /unsafe-inline'; connect|script-src 'unsafe-inline'/u)
    assert.doesNotMatch(html, /https?:\/\//u)
    assert.doesNotMatch(html, /innerHTML/u)

    write('002-second.md', spec('002: Second', 'candidate'))
    await commit('second')
    assert.equal(cardOf(await getState(memoized.url), '002'), undefined, 'recomputed inside the memo window')
    assert.equal(stageOf(await getState(fresh.url), '002'), 'candidate')

    // Moving .git aside makes every git call fail: the fixture lives in the OS temp directory, which is
    // assumed not to sit inside another git repository that git would find instead.
    renameSync(join(dir, '.git'), join(dir, '.git-off'))
    try {
      const failed = await fetch(new URL('state', fresh.url))
      assert.equal(failed.status, 500)
      assert.equal(typeof (await failed.json()).error, 'string')
      assert.match(await (await fetch(fresh.url)).text(), /Second/u, 'page keeps the last good board')
    } finally {
      renameSync(join(dir, '.git-off'), join(dir, '.git'))
    }

    assert.equal(await statusWithHost(fresh.url, 'evil.example'), 403)
    assert.equal((await fetch(new URL('nope', fresh.url))).status, 404)
  } finally {
    await memoized.close()
    await fresh.close()
    rmSync(dir, { recursive: true, force: true })
  }
  assert.equal(memoized.server.listening, false)
})

/** Minimal DOM for running LIVE_SCRIPT in node:vm; serializes the way renderHtml writes markup. */
class StubElement {
  constructor(tag) { this.tag = tag; this.className = ''; this.dataset = {}; this.children = []; this.hidden = false }
  set textContent(value) { this.children = [String(value)] }
  get textContent() { return this.children.map((child) => (typeof child === 'string' ? child : child.textContent)).join('') }
  append(...nodes) { this.children.push(...nodes) }
  replaceChildren(...nodes) { this.children = nodes }
  get innerHTML() { return this.children.map((child) => (typeof child === 'string' ? escapeHtml(child) : child.outerHTML)).join('') }
  get outerHTML() {
    const attrs = (this.className ? ` class="${escapeHtml(this.className)}"` : '')
      + Object.entries(this.dataset).map(([key, value]) => ` data-${key}="${escapeHtml(value)}"`).join('')
      + ['href', 'target', 'rel'].filter((name) => this[name] !== undefined).map((name) => ` ${name}="${escapeHtml(this[name])}"`).join('')
    return `<${this.tag}${attrs}>${this.innerHTML}</${this.tag}>`
  }
}

async function runClient(response) {
  const main = new StubElement('main')
  const sub = new StubElement('p')
  const note = new StubElement('p')
  const banner = new StubElement('p')
  let next
  const elements = { main, 'header .sub': sub, 'header .note': note }
  const document = { querySelector: (selector) => elements[selector], getElementById: () => banner, createElement: (tag) => new StubElement(tag) }
  vm.runInNewContext(LIVE_SCRIPT, { document, setTimeout: (fn) => { next = fn }, fetch: async () => { if (response instanceof Error) throw response; return response } })
  await next()
  return { main, sub, note, banner }
}

const jsonResponse = (body, status = 200) => ({ ok: status < 400, status, headers: { get: () => 'application/json; charset=utf-8' }, json: async () => JSON.parse(JSON.stringify(body)) })

test('live client renders the same columns and cards as renderHtml', async () => {
  // Exercise every optional card part; a field rendered on only one side shows up as a diff.
  const branches = [{ name: 'feat/building', remote: false, merged: false }]
  const board = deriveBoard({
    ...snapshot({
      '001-building.md': spec('001: Building <&"\'>', 'draft', '\n## Tasks\n\n### 01: A (#4)\n- [x] a\n\n### 02: B <i> (#5)\n- [ ] b\n'),
      '002-odd.md': spec('002: Odd', 'proposed'),
      '003-done.md': spec('003: Done', 'implemented'),
    }, branches),
    github: {
      available: true,
      prs: [{ number: 9, state: 'OPEN', headRefName: 'feat/building', baseRefName: 'main', url: 'https://github.com/o/r/pull/9?a=1&b="2"', body: '' }],
      issues: [{ number: 4, state: 'CLOSED', url: 'https://github.com/o/r/issues/4' }, { number: 5, state: 'OPEN', url: 'javascript:alert(1)' }],
    },
    repoName: 'demo',
    generatedAt: NOW,
  })
  assert.equal(cardOf(board, '001').issues.length, 2, 'fixture exercises links')
  assert.equal(cardOf(board, '001').pr.number, 9, 'fixture exercises the pull request link')
  const { main, sub, note, banner } = await runClient(jsonResponse(board))
  assert.equal(main.innerHTML, /<main>([\s\S]*)<\/main>/u.exec(renderHtml(board))[1])
  assert.equal(sub.textContent, `from main · generated ${NOW}`)
  assert.equal(note.hidden, true)
  assert.equal(banner.hidden, true)
  const offline = await runClient(jsonResponse({ ...board, githubNote: 'GitHub links unavailable: gh not installed' }))
  assert.equal(offline.note.hidden, false)
  assert.equal(offline.note.textContent, 'GitHub links unavailable: gh not installed')
  assert.match(renderHtml({ ...board, githubNote: 'GitHub links unavailable: gh not installed' }), /<p class="note">GitHub links unavailable: gh not installed<\/p>/u)
})

const github = (prs = [], issues = []) => ({ available: true, prs, issues })
const tasked = (title, done) => spec(title, 'draft', `\n## Tasks\n\n### 01: One (#45)\n**Status:** ${done ? 'done' : 'planned'}\n\n### 02: Two (#46)\n**Status:** done in #12\n`)

test('GitHub data: task heading issues and the matching pull request become card links', () => {
  const prs = [
    { number: 50, state: 'CLOSED', headRefName: 'feat/widget', baseRefName: 'main', url: 'https://github.com/o/r/pull/50', body: '' },
    { number: 51, state: 'OPEN', headRefName: 'feat/widget', baseRefName: 'main', url: 'https://github.com/o/r/pull/51', body: '' },
    { number: 60, state: 'MERGED', headRefName: 'task/two', baseRefName: 'main', url: 'https://github.com/o/r/pull/60', body: 'Closes #48' },
  ]
  const issues = [45, 46, 48, 12].map((number) => ({ number, state: number === 45 ? 'OPEN' : 'CLOSED', url: `https://github.com/o/r/issues/${number}` }))
  const board = deriveBoard({
    ...snapshot({
      '020-widget.md': tasked('020: Widget', false),
      '021-gadget.md': spec('021: Gadget', 'draft', '\n## Tasks\n\n### 01: Only (#48)\n- [ ] a\n'),
    }),
    github: github(prs, issues),
  })
  const widget = cardOf(board, '020')
  assert.deepEqual(widget.issues, [{ number: 45, state: 'open', url: 'https://github.com/o/r/issues/45' }, { number: 46, state: 'closed', url: 'https://github.com/o/r/issues/46' }], 'heading refs only, not #12 from a status line')
  assert.deepEqual(widget.pr, { number: 51, state: 'open', url: 'https://github.com/o/r/pull/51' }, 'closed-unmerged pull requests are skipped')
  assert.equal(cardOf(board, '021').pr.number, 60, 'linked by Closes #N')
  const html = renderHtml(board)
  assert.match(html, /<a class="gh" href="https:\/\/github.com\/o\/r\/pull\/51" target="_blank" rel="noreferrer">PR #51 open<\/a>/u)
  assert.match(html, />#46 closed<\/a>/u)
  assert.equal(board.githubNote, null)
})

test('GitHub data: a merged pull request ships a done spec git still shows as unmerged, never a candidate or open tasks', () => {
  const branches = ['feat/widget', 'feat/idea', 'feat/half'].map((name) => ({ name, remote: false, merged: false, implementation: true }))
  const merged = (number, head, implementation = true, base = 'main') => ({ number, state: 'MERGED', headRefName: head, baseRefName: base, url: `https://github.com/o/r/pull/${number}`, body: '', implementation })
  const board = deriveBoard({
    ...snapshot({
      '020-widget.md': tasked('020: Widget', true),
      '021-idea.md': spec('021: Idea', 'candidate'),
      '022-half.md': tasked('022: Half', false),
      '023-docs.md': spec('023: Docs', 'draft'),
    }, branches),
    github: github([merged(7, 'feat/widget'), merged(8, 'feat/idea'), merged(9, 'feat/half'), merged(10, 'spec/023-docs', false)]),
  })
  assert.equal(stageOf(board, '020'), 'shipped')
  assert.equal(cardOf(board, '020').reason, 'pull request #7 merged')
  assert.equal(cardOf(board, '020').pr.state, 'merged')
  assert.equal(stageOf(board, '021'), 'building', 'candidate never ships')
  assert.equal(stageOf(board, '022'), 'building', 'open tasks never ship')
  assert.equal(stageOf(board, '023'), 'specced', 'docs-only pull request is not implementation work')
})

test('GitHub unavailable: git-only board with a header note', () => {
  const branches = [{ name: 'feat/widget', remote: false, merged: false }]
  const board = deriveBoard({ ...snapshot({ '020-widget.md': tasked('020: Widget', true) }, branches), github: { available: false, reason: 'gh not authenticated' } })
  assert.equal(stageOf(board, '020'), 'building')
  assert.deepEqual([cardOf(board, '020').issues, cardOf(board, '020').pr], [[], null])
  assert.equal(board.githubNote, 'GitHub links unavailable: gh not authenticated')
  const html = renderHtml(board)
  assert.match(html, /<p class="note">GitHub links unavailable: gh not authenticated<\/p>/u)
  assert.doesNotMatch(html, /class="links"/u)
  assert.equal(deriveBoard(snapshot({ '020-widget.md': tasked('020: Widget', true) })).githubNote, null, 'skipped GitHub adds no note')
})

test('only http(s) github.com URLs become links', () => {
  const issues = [
    { number: 45, state: 'OPEN', url: 'javascript:alert(1)' },
    { number: 46, state: 'OPEN', url: 'https://github.com.evil.example/x' },
  ]
  const prs = [{ number: 3, state: 'OPEN', headRefName: 'feat/widget', baseRefName: 'main', url: 'data:text/html,<b>x</b>', body: '' }]
  const board = deriveBoard({ ...snapshot({ '020-widget.md': tasked('020: Widget', false) }), github: github(prs, issues) })
  assert.deepEqual(cardOf(board, '020').issues.map((issue) => issue.url), [null, null])
  assert.equal(cardOf(board, '020').pr.url, null)
  const html = renderHtml(board)
  assert.doesNotMatch(html, /javascript:|data:text|evil\.example|<a /u)
  assert.match(html, /<span class="gh">#45 open<\/span>/u)
  // The renderer re-checks URLs it is handed directly.
  const raw = { ...board, columns: board.columns.map((column) => ({ ...column, cards: column.cards.map((card) => ({ ...card, pr: { number: 3, state: 'open', url: 'javascript:alert(1)' } })) })) }
  assert.doesNotMatch(renderHtml(raw), /javascript:/u)
})

test('fetchGithub: two gh calls with argument arrays; failures become reasons, never throws', () => withRepo(async ({ dir, git }) => {
  assert.deepEqual(fetchGithub(dir, { run: () => { throw new Error('must not run') } }), { available: false, reason: 'no GitHub remote' })
  await git('remote', 'add', 'origin', 'git@github.com:o/r.git')
  const calls = []
  const ok = fetchGithub(dir, { run: (args, options) => { calls.push({ args, options }); return args[0] === 'pr' ? '[{"number":1}]' : '[]' } })
  assert.deepEqual(ok, { available: true, prs: [{ number: 1 }], issues: [], truncated: { prs: false, issues: false } })
  assert.deepEqual(calls.map((call) => call.args.slice(0, 4)), [['pr', 'list', '--repo', 'o/r'], ['issue', 'list', '--repo', 'o/r']])
  const fail = (error) => fetchGithub(dir, { run: () => { throw Object.assign(new Error('x'), error) } }).reason
  assert.equal(fail({ code: 'ENOENT' }), 'gh not installed')
  assert.equal(fail({ status: 4, stderr: 'To get started with GitHub CLI, please run:  gh auth login' }), 'gh not authenticated')
  assert.equal(fail({ code: 'ETIMEDOUT', signal: 'SIGTERM' }), 'GitHub request timed out')
  assert.equal(fail({ status: 1, stderr: 'HTTP 502' }), 'gh request failed')
  assert.equal(fetchGithub(dir, { run: () => 'not json' }).reason, 'unexpected gh output')
}))

test('githubReader caches per repository for its TTL', () => withRepo(async ({ dir, git }) => {
  await git('remote', 'add', 'origin', 'https://github.com/o/r.git')
  let calls = 0
  const run = () => { calls++; return '[]' }
  const cachedReader = githubReader({ run, ttlMs: 60_000 })
  cachedReader(dir)
  cachedReader(dir)
  assert.equal(calls, 2, 'one fetch is two gh calls')
  const freshReader = githubReader({ run, ttlMs: 0 })
  freshReader(dir)
  freshReader(dir)
  assert.equal(calls, 6)
}))

test('readSnapshot: delivery mode gates GitHub; merged pull request with code ships a squash merge later edited', () => withRepo(async ({ dir, git, write, commit }) => {
  writeFileSync(join(dir, 'AGENTS.md'), '# A\n\n<!-- BEGIN FLOW -->\nDelivery: github\n<!-- END FLOW -->\n')
  write('020-widget.md', spec('020: Widget', 'draft'))
  await commit('spec')
  await git('switch', '--quiet', '-c', 'feat/widget')
  touch(dir, 'widget.txt')
  await commit('widget')
  await git('switch', '--quiet', 'main')
  await git('merge', '--quiet', '--squash', 'feat/widget')
  await commit('squash widget')
  const squash = (await git('rev-parse', 'HEAD')).trim()
  writeFileSync(join(dir, 'widget.txt'), 'edited later\n')
  await commit('edit widget')
  assert.equal(stageOf(deriveBoard(readSnapshot(dir)), '020'), 'building', 'git alone cannot see this merge')

  let runs = 0
  const prs = [{ number: 7, state: 'MERGED', headRefName: 'feat/widget', baseRefName: 'main', url: 'https://github.com/o/r/pull/7', body: '', mergeCommit: { oid: squash } }]
  const reader = () => { runs++; return github(prs, []) }
  const board = deriveBoard(readSnapshot(dir, { github: reader }))
  assert.equal(stageOf(board, '020'), 'shipped')
  assert.equal(cardOf(board, '020').pr.number, 7)

  writeFileSync(join(dir, 'AGENTS.md'), '# A\n\n<!-- BEGIN FLOW -->\nDelivery: local\n<!-- END FLOW -->\n')
  await commit('local mode')
  runs = 0
  assert.equal(readSnapshot(dir, { github: reader }).github, null)
  assert.equal(runs, 0, 'local mode never calls GitHub')

  writeFileSync(join(dir, 'AGENTS.md'), '# A\n\n<!-- BEGIN FLOW -->\nDelivery: github\n<!-- END FLOW -->\n')
  await commit('pr mode')
  const offline = deriveBoard(readSnapshot(dir, { github: githubReader({ run: () => { throw new Error('must not run') } }) }))
  assert.equal(offline.githubNote, 'GitHub links unavailable: no GitHub remote')
  assert.equal(stageOf(offline, '020'), 'building')
}))

test('live client keeps the board and shows distinct banners on errors', async () => {
  const errored = await runClient(jsonResponse({ error: 'git failed' }, 500))
  assert.equal(errored.banner.hidden, false)
  assert.match(errored.banner.textContent, /Not updating: git failed/u)
  assert.equal(errored.main.children.length, 0)
  const refused = await runClient({ ok: false, status: 403, headers: { get: () => 'text/plain' }, json: async () => { throw new Error('not json') } })
  assert.match(refused.banner.textContent, /HTTP 403 without board data/u)
  const down = await runClient(new Error('connection refused'))
  assert.match(down.banner.textContent, /not reachable/u)
})

function startCli(dir, port) {
  const child = spawn(process.execPath, [script, '--serve', '--port', String(port), '--repo', dir], { stdio: ['ignore', 'pipe', 'pipe'] })
  const exited = new Promise((done) => child.on('exit', (code, signal) => done({ code, signal })))
  const url = new Promise((done, fail) => {
    let out = ''
    let err = ''
    child.stdout.on('data', (chunk) => { out += chunk; const match = /http:\/\/127\.0\.0\.1:\d+\//u.exec(out); if (match) done(match[0]) })
    child.stderr.on('data', (chunk) => { err += chunk })
    child.on('close', () => fail(new Error(`server exited early: ${out}${err}`)))
  })
  return { child, exited, url }
}

// Concurrent tests may take a probed port before the server binds it; retry on that race.
async function startOnFreePort(dir) {
  for (let attempt = 1; ; attempt++) {
    const port = await freePort()
    const board = startCli(dir, port)
    try {
      await board.url
      return { board, port }
    } catch (error) {
      if (attempt >= 3 || !/in use|EADDRINUSE/u.test(String(error))) throw error
    }
  }
}

async function freePort() {
  const probe = http.createServer()
  await new Promise((done) => probe.listen(0, '127.0.0.1', done))
  const { port } = probe.address()
  await new Promise((done) => probe.close(done))
  return port
}

// Five CLI processes plus a live server. The assertions are the behavior; 30s is the hang budget.
// On a loaded macOS runner the same work exceeds the old 10s cap while the suite runs in parallel.
test('--serve and --stop find this repo\'s board by port probe, never another repo\'s', { timeout: 30_000 }, async () => {
  const own = await makeRepo()
  const other = await makeRepo()
  for (const repo of [own, other]) {
    repo.write('001-served.md', spec('001: Served', 'draft'))
    await repo.commit('specs')
  }
  const { board, port } = await startOnFreePort(own.dir)
  try {
    const url = await board.url
    assert.equal(url, `http://127.0.0.1:${port}/`)
    const state = await getState(url)
    assert.equal(cardOf(state, '001').title, 'Served')
    assert.deepEqual(state.server, { repoRoot: realpathSync(own.dir), pid: board.child.pid })

    const again = await cli('--serve', '--port', String(port), '--repo', own.dir)
    assert.equal(again.status, 0, again.stderr)
    assert.equal(again.stdout.trim(), `Board already running at ${url} (pid ${board.child.pid}).`)

    // Another repository's board on the port is neither reused nor stopped.
    const foreignServe = await cli('--serve', '--port', String(port), '--repo', other.dir)
    assert.equal(foreignServe.status, 1)
    assert.match(foreignServe.stderr, new RegExp(`Port ${port} is in use`, 'u'))
    const foreignStop = await cli('--stop', '--port', String(port), '--repo', other.dir)
    assert.equal(foreignStop.status, 0, foreignStop.stderr)
    assert.equal(foreignStop.stdout.trim(), `No board for this repo on port ${port}.`)
    assert.equal(cardOf(await getState(url), '001').title, 'Served')

    const stop = await cli('--stop', '--port', String(port), '--repo', own.dir)
    assert.equal(stop.status, 0, stop.stderr)
    assert.match(stop.stdout, new RegExp(`Stopped the board at ${url.replaceAll('.', '\\.')} \\(pid ${board.child.pid}\\)`, 'u'))
    assert.deepEqual(await board.exited, { code: 0, signal: null })
    assert.equal((await cli('--stop', '--port', String(port), '--repo', own.dir)).stdout.trim(), `No board for this repo on port ${port}.`)

    for (const repo of [own, other]) assert.equal(existsSync(join(repo.dir, '.git', 'flow')), false, 'nothing written under .git')
  } finally {
    if (board.child.exitCode === null && board.child.signalCode === null) board.child.kill('SIGKILL')
    rmSync(own.dir, { recursive: true, force: true })
    rmSync(other.dir, { recursive: true, force: true })
  }
})

test('--serve rejects bad ports and mixed modes', async () => {
  for (const args of [['--serve', '--port', 'x'], ['--serve', '--port', '70000'], ['--serve', '--once'], ['--stop', '--serve']]) {
    assert.equal((await usageExit(args)).code, 2, args.join(' '))
  }
})

test('parseGithubRemote accepts github.com remotes only', () => {
  const cases = [
    ['git@github.com:o/r.git', 'o/r'],
    ['https://github.com/o/r', 'o/r'],
    ['https://github.com/o/r.git/', 'o/r'],
    ['ssh://git@github.com:22/o/r.git', 'o/r'],
    ['https://user@github.com/o/my.repo.git', 'o/my.repo'],
    ['git@github.com-work:o/r.git', null],
    ['https://notgithub.com/o/r', null],
    ['https://github.company.com/o/r', null],
    ['https://evil.example/github.com/o/r', null],
    ['/srv/git/github.com/o/r', null],
  ]
  for (const [url, expected] of cases) assert.equal(parseGithubRemote(url), expected, url)
})

test('fetchGithub: host aliases resolve through gh repo view; other hosts get their own note', () => withRepo(async ({ dir, git }) => {
  await git('remote', 'add', 'origin', 'git@github.com-work:o/r.git')
  const calls = []
  const runAs = (url) => (args) => { calls.push(args.slice(0, 2).join(' ')); return args[0] === 'repo' ? JSON.stringify({ nameWithOwner: 'o/r', url }) : '[]' }
  assert.equal(fetchGithub(dir, { run: runAs('https://github.com/o/r') }).available, true)
  assert.deepEqual(calls, ['repo view', 'pr list', 'issue list'])
  assert.equal(fetchGithub(dir, { run: runAs('https://ghe.example.com/o/r') }).reason, 'remote is on ghe.example.com, links support github.com only')
  assert.equal(fetchGithub(dir, { run: () => { throw Object.assign(new Error('x'), { code: 'ENOENT' }) } }).reason, 'no GitHub remote')
}))

test('GitHub note: list limits and stale data after a failed refresh', () => withRepo(async ({ dir, git }) => {
  const full = { available: true, prs: [], issues: [], truncated: { prs: true, issues: true } }
  assert.match(deriveBoard({ ...snapshot({}), github: full }).githubNote, /latest 200 pull requests.*latest 500 issues/u)
  await git('remote', 'add', 'origin', 'https://github.com/o/r.git')
  let fail = false
  const reader = githubReader({ run: (args) => { if (fail) throw Object.assign(new Error('x'), { stderr: 'HTTP 502' }); return args[0] === 'issue' ? '[{"number":45,"state":"OPEN","url":"https://github.com/o/r/issues/45"}]' : '[]' } })
  assert.equal(reader(dir).issues.length, 1)
  fail = true
  const stale = reader(dir)
  assert.equal(stale.issues.length, 1, 'last good data kept')
  assert.equal(deriveBoard({ ...snapshot({}), github: stale }).githubNote, 'GitHub links may be out of date: gh request failed')
}))

test('readDelivery agrees with the flow skill on Flow block inputs', () => {
  const block = (line) => `# A\n\n<!-- BEGIN FLOW -->\n## Flow\n\n${line}\n<!-- END FLOW -->\n`
  const inputs = ['# No block\n', block('Delivery: local'), block('Delivery: Local'), block('Delivery: pull-request'), block('Delivery: pull request'),
    block('Delivery: pull_request'), block('Delivery: PR'), block('Delivery: pullrequest'), block('Delivery: pull requests'), block('Delivery: github'), block('Delivery: GitHub'), block('Delivery: unset'), block('Delivery:'), block('Delivery: bogus'), block('No delivery line')]
  for (const text of inputs) assert.equal(readDelivery([text]), flowReadDelivery(text), text)
  assert.equal(readDelivery([block('Delivery: pull-request')]), 'github', 'legacy value reads as github (decision 0037)')
})

test('readSnapshot: merged pull requests stage only into the default branch, with a local merge commit, after the spec', () => withRepo(async ({ dir, git, write, commit }) => {
  await git('remote', 'add', 'origin', 'https://github.com/example/fixture.git')
  write('020-widget.md', spec('020: Widget', 'draft'))
  await commit('spec')
  const specDate = (await git('log', '-1', '--format=%cI')).trim()
  await git('switch', '--quiet', '-c', 'feat/widget')
  touch(dir, 'widget.txt')
  await commit('widget')
  await git('switch', '--quiet', 'main')
  await git('merge', '--quiet', '--squash', 'feat/widget')
  await commit('squash widget')
  const squash = (await git('rev-parse', 'HEAD')).trim()
  writeFileSync(join(dir, 'widget.txt'), 'edited later\n')
  await commit('edit widget')
  const later = new Date(Date.parse(specDate) + 3_600_000).toISOString()
  const pr = (fields) => ({ number: 7, state: 'MERGED', headRefName: 'feat/widget', baseRefName: 'main', url: 'https://github.com/o/r/pull/7', body: '', mergedAt: later, mergeCommit: { oid: squash }, ...fields })
  const stage = (fields) => stageOf(deriveBoard(readSnapshot(dir, { github: () => github([pr(fields)], []) })), '020')
  assert.equal(stage({}), 'shipped')
  assert.equal(stage({ baseRefName: 'feat/other' }), 'building', 'non-default base is ignored')
  assert.equal(stage({ mergeCommit: { oid: 'f'.repeat(40) } }), 'building', 'merge commit missing locally')
  assert.equal(stage({ mergedAt: new Date(Date.parse(specDate) - 3_600_000).toISOString() }), 'building', 'merged before the spec existed')
  assert.equal(stage({ headRefName: 'feat/old-widget' }), 'building', 'head must start with the slug to stage')
  const board = deriveBoard(readSnapshot(dir, { github: () => github([pr({ headRefName: 'feat/old-widget' })], []) }))
  assert.equal(cardOf(board, '020').pr.number, 7, 'links keep the looser match')
}))

test('--no-github never runs gh', () => withRepo(async ({ dir, git, write, commit }) => {
  write('001-a.md', spec('001: A', 'draft'))
  writeFileSync(join(dir, 'AGENTS.md'), '<!-- BEGIN FLOW -->\nDelivery: github\n<!-- END FLOW -->\n')
  await commit('spec')
  await git('remote', 'add', 'origin', 'https://github.com/o/r.git')
  const bin = join(dir, '.git', 'fake-bin')
  const marker = join(dir, '.git', 'gh-ran')
  mkdirSync(bin)
  writeFileSync(join(bin, 'gh'), `#!/bin/sh\ntouch '${marker}'\nexit 1\n`, { mode: 0o755 })
  const env = { ...process.env, PATH: `${bin}:${process.env.PATH}` }
  const json = async (...args) => JSON.parse((await cliIn({ env }, '--json', '--repo', dir, ...args)).stdout)
  assert.equal((await json('--no-github')).githubNote, null)
  assert.equal(existsSync(marker), false)
  assert.equal((await json()).githubNote, 'GitHub links unavailable: gh request failed')
  assert.equal(existsSync(marker), true, 'fake gh is on PATH')
}))

test('live server never waits on a slow gh; links appear after the refresh resolves', { timeout: 10_000 }, async () => {
  const { dir, git, write, commit } = await makeRepo()
  write('020-widget.md', spec('020: Widget', 'draft', '\n## Tasks\n\n### 01: One (#45)\n- [ ] a\n'))
  await commit('spec')
  await git('remote', 'add', 'origin', 'https://github.com/o/r.git')
  // gh stays pending until released: a server that waited on it would never answer before the release.
  let release
  const gate = new Promise((done) => { release = done })
  let pendingCalls = 0
  const run = async (args) => {
    pendingCalls++
    await gate
    return args[0] === 'issue' ? '[{"number":45,"state":"OPEN","url":"https://github.com/o/r/issues/45"}]' : '[]'
  }
  const source = githubSource({ run, ttlMs: 60_000 })
  const live = await startServer({ repoRoot: dir, port: 0, memoMs: 0, github: source })
  try {
    const before = await getState(live.url)
    assert.ok(pendingCalls > 0, 'gh refresh started and is still pending')
    assert.deepEqual(cardOf(before, '020').issues, [])
    release()
    await source.refresh(dir)
    assert.deepEqual(cardOf(await getState(live.url), '020').issues.map((issue) => issue.number), [45])
  } finally {
    await live.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

const runSpec = spec('012: Progress board', 'draft', '\n## Tasks\n\n### 01: Board from git (#45)\n**Status:** done\n- [x] a\n\n### 02: Live page (#46)\n- [ ] a\n\n### 03: Run overlay\n- [ ] a\n')

test('parseTasks reads task headings, strips issue refs, and marks done tasks', () => {
  assert.deepEqual(parseTasks(runSpec), [
    { id: '01', title: 'Board from git', done: true },
    { id: '02', title: 'Live page', done: false },
    { id: '03', title: 'Run overlay', done: false },
  ])
})

// Checklist tasks, task issue links, and dropped specs.
const ghIssue = (number, fields = {}) => ({ number, title: `Issue ${number}`, state: 'OPEN', url: `https://github.com/o/r/issues/${number}`, ...fields })

test('an open branch alone is not Building in any mode; code or a ticked task is', () => {
  const specs = {
    '020-widget.md': spec('020: Widget', 'draft'),
    '021-gadget.md': spec('021: Gadget', 'accepted', '\n## Tasks\n\n- [ ] 01: One (#45)\n'),
    '022-coded.md': spec('022: Coded', 'draft'),
    '023-ticked.md': spec('023: Ticked', 'accepted', '\n## Tasks\n\n- [x] 01: One\n- [ ] 02: Two\n'),
  }
  const branches = [
    { name: 'feat/020-widget', remote: false, merged: false, implementation: false },
    { name: 'feat/021-gadget', remote: false, merged: false, implementation: false },
    { name: 'feat/022-coded', remote: false, merged: false, implementation: true },
    { name: 'feat/023-ticked', remote: false, merged: false, implementation: false },
  ]
  const stages = (extra) => ['020', '021', '022', '023'].map((n) => stageOf(deriveBoard({ ...snapshot(specs, branches), ...extra }), n))
  for (const extra of [{}, { github: github() }, { github: { available: false, reason: 'gh not authenticated' } }, { delivery: 'github' }, { delivery: 'local' }, { delivery: 'local', github: github() }]) {
    assert.deepEqual(stages(extra), ['specced', 'ready', 'building', 'building'], `one rule in every mode: ${JSON.stringify(extra)}`)
  }
  const board = deriveBoard(snapshot(specs, branches))
  assert.equal(cardOf(board, '020').branch, null, 'an uncounted branch is not the card branch')
  assert.equal(cardOf(board, '022').branch, 'feat/022-coded')
})

test('readSnapshot: open spec branches carry implementation from git in every mode', () => withRepo(async ({ dir, git, write, commit }) => {
  await git('remote', 'add', 'origin', 'https://github.com/example/fixture.git')
  write('020-widget.md', spec('020: Widget', 'draft'))
  write('021-gadget.md', spec('021: Gadget', 'draft'))
  await commit('specs')
  await git('switch', '--quiet', '-c', 'feat/020-widget')
  write('020-widget.md', spec('020: Widget', 'draft', '\nMore.\n'))
  await commit('docs only')
  await git('switch', '--quiet', '-c', 'feat/021-gadget', 'main')
  touch(dir, 'gadget.txt')
  await commit('code')
  await git('switch', '--quiet', 'main')
  const withGh = readSnapshot(dir, { github: () => github() })
  assert.deepEqual(withGh.branches.map((b) => [b.name, b.implementation]), [['feat/020-widget', false], ['feat/021-gadget', true]])
  const board = deriveBoard(withGh)
  assert.equal(stageOf(board, '020'), 'specced')
  assert.equal(stageOf(board, '021'), 'building')
  // No GitHub source (warm-up, --no-github): the rule still applies, also to a pushed branch.
  await git('update-ref', 'refs/remotes/origin/feat/020-widget', 'feat/020-widget')
  await git('branch', '--quiet', '-D', 'feat/020-widget')
  const noGh = readSnapshot(dir)
  assert.deepEqual(noGh.branches.map((b) => [b.name, b.implementation]), [['feat/021-gadget', true], ['origin/feat/020-widget', false]])
  assert.equal(stageOf(deriveBoard(noGh), '020'), 'specced', 'a docs-only pushed branch stays Specced without GitHub')
  assert.equal(stageOf(deriveBoard(readSnapshot(dir, { github: () => null })), '020'), 'specced', 'a null GitHub source changes nothing')
  writeFileSync(join(dir, 'AGENTS.md'), '<!-- BEGIN FLOW -->\nDelivery: local\n<!-- END FLOW -->\n')
  await commit('local delivery')
  let calls = 0
  const local = readSnapshot(dir, { github: () => { calls++; return github() } })
  assert.equal(local.delivery, 'local')
  assert.equal(calls, 0, 'local delivery never reads GitHub')
  assert.equal(stageOf(deriveBoard(local), '020'), 'specced', 'local mode applies the same rule')
  writeFileSync(join(dir, 'AGENTS.md'), '# Agents\n')
  await commit('unset delivery')
  await git('remote', 'remove', 'origin')
  assert.equal(readSnapshot(dir).delivery, 'local', 'unset delivery without a remote reads as local')
}))

test('task checklist links issues, counts progress, and matches pull requests', () => {
  const content = spec('030: Checklist', 'accepted', '\n## Tasks\n\n- [x] 01: `to-spec`: write the file (#80).\n- [ ] 02: Board (#81, blocked by 01)\n- [ ] 03: Local only\n')
  const sub = spec('031: Nested', 'accepted', '\n## Decisions\n\n### Tasks\n\nIntro.\n\n- [x] 01: A (#90)\n- [x] 02: B (#91)\n\n### Other\n\n- [ ] not a task\n')
  assert.deepEqual(parseTasks(content), [{ id: '01', title: '`to-spec`: write the file', done: true }, { id: '02', title: 'Board', done: false }, { id: '03', title: 'Local only', done: false }])
  assert.deepEqual(countTasks(sub), { done: 2, total: 2 }, 'a ### Tasks subsection ends at the next ### heading')
  const merged = spec('032: Merged', 'draft', '\n## Tasks\n\n- [x] 01: One (#95)\n- [ ] 02: Two (#96)\n\n### 02: Two\n**Status:** done\n')
  assert.deepEqual(countTasks(merged), { done: 2, total: 2 }, 'a checklist item and its heading are one task')
  const issues = [ghIssue(80, { state: 'CLOSED' }), ghIssue(81), ghIssue(89)]
  const prs = [{ number: 99, state: 'OPEN', headRefName: 'feat/unrelated', baseRefName: 'main', url: 'https://github.com/o/r/pull/99', body: 'Closes #81' }]
  const board = deriveBoard({ ...snapshot({ '030-checklist.md': content, '031-nested.md': sub }), github: github(prs, issues) })
  const card = cardOf(board, '030')
  assert.equal(card.issue, undefined, 'no spec issue link')
  assert.deepEqual(card.issues.map((i) => [i.number, i.state]), [[80, 'closed'], [81, 'open']])
  assert.deepEqual(card.tasks, { done: 1, total: 3 })
  assert.equal(stageOf(board, '030'), 'building', 'a ticked checklist item is progress')
  assert.equal(card.pr.number, 99, 'Closes #<task issue> links the pull request')
  assert.match(renderHtml(board), /<a class="gh" href="https:\/\/github.com\/o\/r\/pull\/99"[^>]*>PR #99 open<\/a>/u)
})

test('status dropped, or a branch-only spec whose pull request closed unmerged, leaves the columns and stays in JSON', () => {
  const branchOnly = (file, content, source) => ({ file, content, source, onDefault: false, remote: false })
  const snap = {
    ...snapshot({ '050-gone.md': spec('050: Gone', 'dropped'), '051-done.md': spec('051: Done', 'implemented') }),
    branches: [{ name: 'feat/052-closed', remote: false, merged: false, implementation: true }, { name: 'feat/053-retried', remote: false, merged: false, implementation: true }],
  }
  snap.specs.push(branchOnly('052-closed.md', spec('052: Closed', 'draft'), 'feat/052-closed'), branchOnly('053-retried.md', spec('053: Retried', 'draft'), 'feat/053-retried'))
  const prs = [
    { number: 1, state: 'CLOSED', headRefName: 'feat/052-closed', baseRefName: 'main', url: 'https://github.com/o/r/pull/1', body: '' },
    { number: 2, state: 'CLOSED', headRefName: 'feat/053-retried', baseRefName: 'main', url: 'https://github.com/o/r/pull/2', body: '' },
    { number: 3, state: 'OPEN', headRefName: 'feat/053-retried', baseRefName: 'main', url: 'https://github.com/o/r/pull/3', body: '' },
  ]
  const board = deriveBoard({ ...snap, github: github(prs) })
  assert.equal(stageOf(board, '050'), undefined)
  assert.equal(stageOf(board, '051'), 'shipped')
  assert.equal(stageOf(board, '052'), undefined)
  assert.equal(stageOf(board, '053'), 'building', 'a reopened attempt keeps the card')
  assert.equal(cardOf(board, '050'), undefined)
  assert.deepEqual(board.dropped.map((card) => [card.number, card.dropped, card.reason]), [['050', true, 'status dropped'], ['052', true, 'pull request closed unmerged']])
  assert.doesNotMatch(renderHtml(board), /Gone|Closed/u)
  assert.deepEqual(deriveBoard(snap).dropped.map((card) => card.number), ['050'], 'without GitHub only the status drops a spec')
})

test('fetchGithub reads issues without labels or close reasons', () => withRepo(async ({ dir, git }) => {
  await git('remote', 'add', 'origin', 'https://github.com/o/r.git')
  const calls = []
  fetchGithub(dir, { run: (args) => { calls.push(args); return '[]' } })
  assert.deepEqual(calls.find((args) => args[0] === 'issue').at(-1).split(','), ['number', 'title', 'state', 'url'])
}))
})
