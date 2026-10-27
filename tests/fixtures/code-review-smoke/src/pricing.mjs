/** @param {{ unitCents: number, quantity: number }[]} lines */
export const orderTotalCents = (lines) =>
  lines.reduce((sum, line) => {
    const lineTotal = line.unitCents * line.quantity
    return sum + Math.round(lineTotal * 0.9)
  }, 0)
