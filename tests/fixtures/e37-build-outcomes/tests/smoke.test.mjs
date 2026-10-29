import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('home title typo is present for copy-fix prompt', () => {
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8')
  assert.match(html, /<title>Welcom<\/title>/u)
  assert.doesNotMatch(html, /<title>Welcome<\/title>/u)
})

test('golden task set satisfies E37 (a) artifacts', async () => {
  const version = await import('../golden/task-set/api/version.mjs')
  assert.equal(version.getVersion(), '0.0.0-fixture')
  const about = readFileSync(new URL('../golden/task-set/src/about.html', import.meta.url), 'utf8')
  assert.match(about, /e37-build-outcomes-fixture/u)
})
