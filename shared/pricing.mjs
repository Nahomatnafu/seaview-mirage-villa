// Canonical booking maths. Imported by BOTH the site (via src/content.js) and
// the serverless payment functions in /api, so the price a guest is shown and
// the price Stripe charges can never drift apart.
//
// Dependency-free and runtime-agnostic on purpose — no React, no browser APIs,
// no node builtins. Do not add any.

export const NIGHTLY_RATE = 2600
export const CURRENCY = 'usd'
export const MIN_NIGHTS = 7

// Percentages are the source of truth for the published schedule, the figures
// in the booking wizard, and the amounts Stripe charges.
export const PAYMENT_SCHEDULE = [
  {
    id: 'deposit', pct: 0.25, label: 'To reserve',
    when: 'Due on booking',
    desc: 'Holds your dates and takes the villa off the calendar.',
  },
  {
    id: 'second', pct: 0.35, label: 'Second instalment',
    when: 'Due within one month of booking',
    desc: 'Confirms the reservation and your chef begins menu planning.',
  },
  {
    id: 'final', pct: 0.40, label: 'Final instalment',
    when: 'Due 20–30 days before arrival',
    desc: 'Settles the balance ahead of your arrival.',
  },
]

export const money = n => `$${Math.round(n).toLocaleString('en-US')}`

// Parse YYYY-MM-DD as a local date. `new Date('YYYY-MM-DD')` is UTC midnight,
// which lands on the previous day in western timezones.
const parseDay = d => {
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null
  const [y, m, day] = d.split('-').map(Number)
  const dt = new Date(y, m - 1, day)
  return Number.isNaN(dt.getTime()) ? null : dt
}

export function nightsBetween(checkIn, checkOut) {
  const a = parseDay(checkIn), b = parseDay(checkOut)
  if (!a || !b) return 0
  return Math.max(0, Math.round((b - a) / 86400000))
}

export const villaTotal = nights => nights * NIGHTLY_RATE

// Rounds the first two instalments and gives the remainder to the last, so the
// three parts always sum to the total exactly rather than losing a cent.
export function instalments(total) {
  const first = Math.round(total * PAYMENT_SCHEDULE[0].pct)
  const second = Math.round(total * PAYMENT_SCHEDULE[1].pct)
  return [first, second, total - first - second]
}

/**
 * The single function the payment endpoints use. Validates the dates and
 * returns the amount for one instalment, in cents, ready for Stripe.
 * Throws on anything invalid rather than guessing — an endpoint that takes
 * money should refuse unclear input.
 */
export function quoteInstalment({ checkIn, checkOut, instalment }) {
  const nights = nightsBetween(checkIn, checkOut)
  if (!nights) throw new Error('Invalid or missing dates')
  if (nights < MIN_NIGHTS) throw new Error(`Minimum stay is ${MIN_NIGHTS} nights`)

  const index = PAYMENT_SCHEDULE.findIndex(p => p.id === instalment)
  if (index === -1) throw new Error(`Unknown instalment "${instalment}"`)

  const total = villaTotal(nights)
  const parts = instalments(total)
  const amount = parts[index]

  return {
    nights,
    total,
    index,
    schedule: PAYMENT_SCHEDULE[index],
    amount,
    amountCents: Math.round(amount * 100),
    currency: CURRENCY,
  }
}
