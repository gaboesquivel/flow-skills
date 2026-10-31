import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import { HOLD_DAYS, getHold, placeHold, resetHolds } from '../lib/holds.mjs'

const DAY = 24 * 60 * 60 * 1000

describe('placeHold', () => {
  beforeEach(resetHolds)
  it('expires three days after it is placed', () => {
    const hold = placeHold({ memberId: 'm1', copyId: 'c1', now: 0 })
    assert.equal(hold.expiresAt, HOLD_DAYS * DAY)
  })
  it('requires a member and a copy', () => {
    assert.throws(() => placeHold({ memberId: 'm1' }), { code: 'invalid_request' })
  })
  it('can be read back', () => {
    const hold = placeHold({ memberId: 'm1', copyId: 'c1' })
    assert.equal(getHold(hold.id).copyId, 'c1')
  })
  it('reports a missing hold', () => {
    assert.throws(() => getHold('nope'), { code: 'not_found' })
  })
})
