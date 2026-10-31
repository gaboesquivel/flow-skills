export const HOLD_DAYS = 3
const DAY = 24 * 60 * 60 * 1000

const holds = new Map()
let nextId = 1

export function placeHold({ memberId, copyId, now = Date.now() }) {
  if (!memberId || !copyId) throw new HoldError('invalid_request', 'memberId and copyId are required')
  const hold = { id: String(nextId++), memberId, copyId, expiresAt: now + HOLD_DAYS * DAY }
  holds.set(hold.id, hold)
  return { ...hold }
}

export function getHold(id) {
  const hold = holds.get(id)
  if (!hold) throw new HoldError('not_found', `hold ${id} does not exist`)
  return { ...hold }
}

export function resetHolds() {
  holds.clear()
  nextId = 1
}

export class HoldError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}
