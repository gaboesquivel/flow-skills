import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { checkOut, loansFor } from '../lib/loans.mjs'

describe('loans', () => {
  it('records a checkout for the member', () => {
    checkOut({ memberId: 'm9', copyId: 'c9' })
    assert.equal(loansFor('m9').length, 1)
  })
})
