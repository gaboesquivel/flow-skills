import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('home title typo is present for copy-fix prompt', () => {
  assert.match(readFileSync(new URL('../src/index.html', import.meta.url), 'utf8'), /Welcom/u)
})
