// Canonical booking maths. Imported by BOTH the site (via src/content.js) and
// the serverless payment functions in /api, so the price a guest is shown and
// the price Stripe charges can never drift apart.
//
// Dependency-free and runtime-agnostic on purpose — no React, no browser APIs,
// no node builtins. Do not add any.

export const NIGHTLY_RATE = 2600
export const CURRENCY = 'usd'
export const MIN_NIGHTS = 7

// Sanity ceiling. Nothing legitimate books three months in one go, and it stops
// a mistyped year turning into a six-figure charge.
export const MAX_NIGHTS = 90

// The villa is booked solid until this date. Arrivals before it are refused by
// the date picker AND re-checked on the server, because the browser can be
// edited. Move this on when the calendar frees up.
export const FIRST_AVAILABLE_DATE = '2026-12-10'

// Weeks already taken after FIRST_AVAILABLE_DATE. This is the whole
// availability system for now — there is no live calendar — so the villa must
// add each confirmed booking here, otherwise two guests can pay for the same
// week. `to` is the departure date, so a stay may start on another's `to`.
export const BLOCKED_RANGES = [
  // { from: '2027-01-05', to: '2027-01-12', note: 'Smith party' },
]

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

/** Today at local midnight, so "today" itself is never treated as past. */
const todayStart = () => {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

/** The earliest arrival we accept: whichever is later, today or the open date. */
export function earliestArrival() {
  const open = parseDay(FIRST_AVAILABLE_DATE)
  const today = todayStart()
  return !open || open < today ? today : open
}

export const toISODate = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Half-open overlap test: a stay ending on the day another begins is fine. */
export function findClash(checkIn, checkOut) {
  const a = parseDay(checkIn), b = parseDay(checkOut)
  if (!a || !b) return null
  for (const r of BLOCKED_RANGES) {
    const ra = parseDay(r.from), rb = parseDay(r.to)
    if (!ra || !rb) continue
    if (a < rb && ra < b) return r
  }
  return null
}

/**
 * Every rule a set of dates must satisfy before it can be charged for.
 * Used by the booking form for messaging and re-run on the server, which is
 * the only check that actually counts.
 */
export function validateStay(checkIn, checkOut) {
  const inD = parseDay(checkIn), outD = parseDay(checkOut)
  if (!inD || !outD) return { ok: false, reason: 'Please choose both an arrival and a departure date.' }

  const nights = nightsBetween(checkIn, checkOut)
  if (nights <= 0) return { ok: false, reason: 'Your departure date must be after your arrival date.' }
  if (nights < MIN_NIGHTS) return { ok: false, reason: `The minimum stay is ${MIN_NIGHTS} nights.` }
  if (nights > MAX_NIGHTS) return { ok: false, reason: `For stays over ${MAX_NIGHTS} nights, please contact the villa directly.` }

  const earliest = earliestArrival()
  if (inD < earliest) {
    return {
      ok: false,
      reason: `The villa is fully booked until ${toISODate(earliest)}. Please choose a later arrival date.`,
    }
  }

  const clash = findClash(checkIn, checkOut)
  if (clash) {
    return { ok: false, reason: 'Those dates are already booked. Please choose different dates or contact the villa.' }
  }

  return { ok: true, nights }
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
  const stay = validateStay(checkIn, checkOut)
  if (!stay.ok) throw new Error(stay.reason)
  const nights = stay.nights

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
