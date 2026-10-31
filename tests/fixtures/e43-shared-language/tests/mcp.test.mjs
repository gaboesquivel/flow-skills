import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import { resetHolds } from '../lib/holds.mjs'
import { tools } from '../mcp/tools.mjs'

describe('place_hold tool', () => {
  beforeEach(resetHolds)
  it('places a hold for the calling member', () => {
    const result = tools.place_hold.run({ member: { id: 'm1' }, input: { copyId: 'c1' } })
    assert.equal(result.content.memberId, 'm1')
  })
  it('returns an actionable error', () => {
    const result = tools.place_hold.run({ member: { id: 'm1' }, input: {} })
    assert.equal(result.isError, true)
    assert.equal(result.content.error, 'invalid_request')
  })
})
