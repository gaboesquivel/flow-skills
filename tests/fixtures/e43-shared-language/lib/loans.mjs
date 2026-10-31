const loans = []

export function checkOut({ memberId, copyId }) {
  const loan = { memberId, copyId }
  loans.push(loan)
  return { ...loan }
}

export function loansFor(memberId) {
  return loans.filter((loan) => loan.memberId === memberId)
}
