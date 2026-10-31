import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import { resetHolds } from '../lib/holds.mjs'
import { postHold } from '../routes/holds.mjs'

describe('POST /holds', () => {
  beforeEach(resetHolds)
  it('creates a hold for the caller', () => {
    const res = postHold({ member: { id: 'm1' }, body: { copyId: 'c1' } })
    assert.equal(res.status, 201)
    assert.equal(res.body.memberId, 'm1')
  })
  it('rejects a request without a copy', () => {
    assert.equal(postHold({ member: { id: 'm1' }, body: {} }).status, 400)
  })
})
