import { orderTotalCents } from './pricing.mjs'

export const checkout = (lines) => ({ totalCents: orderTotalCents(lines) })
