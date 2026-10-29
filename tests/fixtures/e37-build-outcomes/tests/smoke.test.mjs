import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('home title typo is present for copy-fix prompt', () => {
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8')
  assert.match(html, /<title>Welcom<\/title>/u)
  assert.doesNotMatch(html, /<title>Welcome<\/title>/u)
})
