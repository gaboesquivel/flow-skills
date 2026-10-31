import { HoldError, placeHold } from '../lib/holds.mjs'

const STATUS = { invalid_request: 400, not_found: 404, forbidden: 403, conflict: 409 }

// POST /holds with { copyId }; the caller is the authenticated member.
export function postHold({ member, body }) {
  try {
    return { status: 201, body: placeHold({ memberId: member.id, copyId: body.copyId }) }
  } catch (error) {
    if (error instanceof HoldError) return { status: STATUS[error.code] ?? 400, body: { error: error.code, message: error.message } }
    throw error
  }
}
