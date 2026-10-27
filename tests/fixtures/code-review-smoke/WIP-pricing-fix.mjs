/** Candidate fix — treat as uncommitted / untracked during review drills. */
/** @param {{ unitCents: number, quantity: number }[]} lines */
export const orderTotalCents = (lines) => {
  const subtotal = lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0)
  return Math.round(subtotal * 0.9)
}
