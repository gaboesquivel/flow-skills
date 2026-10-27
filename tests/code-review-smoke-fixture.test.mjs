import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const fixture = join(dirname(fileURLToPath(import.meta.url)), 'fixtures/code-review-smoke')
const lines = [{ unitCents: 105, quantity: 1 }, { unitCents: 105, quantity: 1 }]

test('code-review smoke fixture encodes per-line vs once-per-order discount bug', async () => {
  const tracked = await import(join(fixture, 'src/pricing.mjs'))
  const wip = await import(join(fixture, 'WIP-pricing-fix.mjs'))
  assert.equal(tracked.orderTotalCents(lines), 190)
  assert.equal(wip.orderTotalCents(lines), 189)
  assert.match(readFileSync(join(fixture, 'REQUIREMENTS.md'), 'utf8'), /once per order/iu)
})
