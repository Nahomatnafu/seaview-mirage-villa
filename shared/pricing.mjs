// Canonical booking maths. Imported by BOTH the site (via src/content.js) and
// the serverless payment functions in /api, so the price a guest is shown and
// the price Stripe charges can never drift apart.
//
// Dependency-free and runtime-agnostic on purpose — no React, no browser APIs,
// no node builtins. Do not add any.
//
// Rates and availability are now editable from the admin dashboard, so the
// functions here take a `settings` object and a `blocks` list rather than
// reading module constants. Both default to the built-in values, which is what
// makes this file safe to call from the browser before settings have loaded and
// from the server if the store is unreachable.

import { parseDay, toISODate, todayStart, nightsBetween, eachNight, rangesOverlap } from './dates.mjs'
import { DEFAULT_SETTINGS, defaultSettings, rateForNight, seasonForNight, MIN_NIGHTLY, MAX_NIGHTLY } from './settings.mjs'

export { parseDay, toISODate, nightsBetween, eachNight }
export { DEFAULT_SETTINGS, defaultSettings, rateForNight, seasonForNight }

// Kept as named exports because content.js, the booking form and the test
// scripts all read them. They are the defaults, not the live values — anything
// pricing a real stay must pass the settings it fetched.
export const NIGHTLY_RATE = DEFAULT_SETTINGS.baseNightly
export const MIN_NIGHTS = DEFAULT_SETTINGS.minNights
export const CURRENCY = 'usd'

// Refundable damage deposit. Charged with the FINAL instalment, not held on a
// card — the villa asked for it this way, and it is returned after departure.
//
// It is not part of the villa total: the total is what the stay costs, this is
// money passing through. Keeping them separate is what stops the deposit being
// treated as revenue, split across instalments, or fed into the 20%/30%
// cancellation fee, all of which would be wrong.
export const INCIDENTAL_DEPOSIT = 200
export const INCIDENTAL_RETURN_DAYS = 7

// Sanity ceiling. Nothing legitimate books three months in one go, and it stops
// a mistyped year turning into a six-figure charge.
export const MAX_NIGHTS = DEFAULT_SETTINGS.maxNights

// Default opening date. The live one comes from settings and is editable in the
// dashboard; this is the fallback if settings cannot be read.
export const FIRST_AVAILABLE_DATE = DEFAULT_SETTINGS.firstAvailableDate

// Emergency developer override, checked in addition to whatever the dashboard
// knows about. Availability normally comes from paid Stripe bookings plus the
// villa's manual holds — see api/availability.mjs. Use this only to take dates
// off sale when the dashboard cannot, and say why in `note`.
export const BLOCKED_RANGES = [
  // { from: '2027-01-05', to: '2027-01-12', note: 'Burst pipe, no guests' },
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

/** The earliest arrival we accept: whichever is later, today or the open date. */
export function earliestArrival(settings = DEFAULT_SETTINGS) {
  const open = parseDay(settings.firstAvailableDate)
  const today = todayStart()
  return !open || open < today ? today : open
}

/**
 * The first blocked range a stay runs into, or null.
 *
 * `blocks` is everything unavailable: weeks already paid for, the villa's
 * manual holds, and the BLOCKED_RANGES override. Each is `{ from, to }` where
 * `to` is the DEPARTURE date, so one stay may begin on another's `to`.
 */
export function findClash(checkIn, checkOut, blocks = []) {
  for (const r of [...blocks, ...BLOCKED_RANGES]) {
    if (!r) continue
    if (rangesOverlap(checkIn, checkOut, r.from, r.to)) return r
  }
  return null
}

/**
 * Every rule a set of dates must satisfy before it can be charged for.
 * Used by the booking form for messaging and re-run on the server, which is
 * the only check that actually counts.
 */
export function validateStay(checkIn, checkOut, { settings = DEFAULT_SETTINGS, blocks = [] } = {}) {
  const inD = parseDay(checkIn), outD = parseDay(checkOut)
  if (!inD || !outD) return { ok: false, reason: 'Please choose both an arrival and a departure date.' }

  const minNights = settings.minNights ?? DEFAULT_SETTINGS.minNights
  const maxNights = settings.maxNights ?? DEFAULT_SETTINGS.maxNights

  const nights = nightsBetween(checkIn, checkOut)
  if (nights <= 0) return { ok: false, reason: 'Your departure date must be after your arrival date.' }
  if (nights < minNights) return { ok: false, reason: `The minimum stay is ${minNights} nights.` }
  if (nights > maxNights) return { ok: false, reason: `For stays over ${maxNights} nights, please contact the villa directly.` }

  const earliest = earliestArrival(settings)
  if (inD < earliest) {
    return {
      ok: false,
      reason: `The villa is fully booked until ${toISODate(earliest)}. Please choose a later arrival date.`,
    }
  }

  if (findClash(checkIn, checkOut, blocks)) {
    return { ok: false, reason: 'Those dates are already booked. Please choose different dates or contact the villa.' }
  }

  return { ok: true, nights }
}

/**
 * What a stay costs: every night charged at the rate of the season it falls in,
 * then summed.
 *
 * Priced per night rather than per stay so a guest cannot dodge the Christmas
 * rate by arriving a day early — and so a stay straddling two seasons costs
 * what it actually should.
 */
export function villaTotal(checkIn, checkOut, settings = DEFAULT_SETTINGS) {
  return eachNight(checkIn, checkOut)
    .reduce((sum, night) => sum + rateForNight(night, settings), 0)
}

/** Per-night detail, so the booking form can show why a cross-season stay costs what it does. */
export function nightlyBreakdown(checkIn, checkOut, settings = DEFAULT_SETTINGS) {
  return eachNight(checkIn, checkOut).map(date => {
    const season = seasonForNight(date, settings)
    return { date, rate: season ? season.nightly : settings.baseNightly, season: season?.label ?? null }
  })
}

/** Groups the breakdown by season, for a compact "3 nights at $3,400" summary. */
export function seasonSummary(checkIn, checkOut, settings = DEFAULT_SETTINGS) {
  const out = []
  for (const n of nightlyBreakdown(checkIn, checkOut, settings)) {
    const last = out[out.length - 1]
    if (last && last.rate === n.rate && last.season === n.season) last.nights++
    else out.push({ season: n.season, rate: n.rate, nights: 1 })
  }
  return out
}

/**
 * A headline price for marketing copy — "from $18,200 a week" — where there are
 * no real dates to price. Always the base rate, never a season.
 */
export const baseTotal = (nights, settings = DEFAULT_SETTINGS) => nights * settings.baseNightly

// Sanity bounds for a locked total, expressed per night. Wide on purpose: the
// point is to reject a corrupted or absurd figure, not to second-guess what the
// villa charged last season.
const MIN_LOCKED_NIGHTLY = MIN_NIGHTLY
const MAX_LOCKED_NIGHTLY = MAX_NIGHTLY

/**
 * Validates a total agreed at booking time and carried forward.
 *
 * A guest agrees a price on the day they book. Instalments 2 and 3 are charged
 * weeks later, by which point NIGHTLY_RATE may have been edited — so the later
 * instalments must be quoted from the total that was agreed, never recomputed
 * at today's rate. Anything else silently reprices a booking that is already
 * paid into.
 *
 * The value is only ever trusted when it arrives inside the villa's HMAC
 * signature; see api/_lib.mjs. These checks are the second line.
 */
export function lockedTotal(value, nights) {
  const total = typeof value === 'string' ? Number(value.trim()) : value
  if (!Number.isFinite(total) || total <= 0) throw new Error('Invalid booking total.')
  if (!Number.isInteger(total)) throw new Error('Invalid booking total.')
  if (!Number.isFinite(nights) || nights <= 0) throw new Error('Invalid booking total.')

  const perNight = total / nights
  if (perNight < MIN_LOCKED_NIGHTLY || perNight > MAX_LOCKED_NIGHTLY) {
    throw new Error('Invalid booking total.')
  }
  return total
}

// Rounds the first two instalments and gives the remainder to the last, so the
// three parts always sum to the total exactly rather than losing a cent.
//
// This is the split of the VILLA TOTAL only. It deliberately excludes the
// incidental deposit — see payableInstalments for what a guest actually pays.
export function instalments(total) {
  const first = Math.round(total * PAYMENT_SCHEDULE[0].pct)
  const second = Math.round(total * PAYMENT_SCHEDULE[1].pct)
  return [first, second, total - first - second]
}

/**
 * What the guest is actually charged at each instalment: the villa split, with
 * the refundable incidental deposit added to the last one.
 *
 * Use this for anything shown to a guest or sent to Stripe. Use `instalments`
 * only when you specifically mean the villa's share.
 */
export function payableInstalments(total) {
  const parts = instalments(total)
  parts[parts.length - 1] += INCIDENTAL_DEPOSIT
  return parts
}

/**
 * The single function the payment endpoints use. Validates the dates and
 * returns the amount for one instalment, in cents, ready for Stripe.
 * Throws on anything invalid rather than guessing — an endpoint that takes
 * money should refuse unclear input.
 *
 * `total` is the price agreed when the booking was made. Pass it for any
 * instalment after the deposit, so a later rate change cannot reprice a stay
 * someone has already paid into. Omitted, the stay is priced at today's rates —
 * which is correct for a new booking, and only for that.
 *
 * The lock matters more now that rates are seasonal and editable from the
 * dashboard: without it, adding a season could move an existing booking's
 * remaining instalments in either direction.
 */
export function quoteInstalment({
  checkIn, checkOut, instalment, total: agreedTotal,
  settings = DEFAULT_SETTINGS, blocks = [],
}) {
  const stay = validateStay(checkIn, checkOut, { settings, blocks })
  if (!stay.ok) throw new Error(stay.reason)
  const nights = stay.nights

  const index = PAYMENT_SCHEDULE.findIndex(p => p.id === instalment)
  if (index === -1) throw new Error(`Unknown instalment "${instalment}"`)

  const rateLocked = agreedTotal !== undefined && agreedTotal !== null && agreedTotal !== ''
  const total = rateLocked ? lockedTotal(agreedTotal, nights) : villaTotal(checkIn, checkOut, settings)

  const villaShare = instalments(total)[index]
  const isFinal = index === PAYMENT_SCHEDULE.length - 1
  const incidental = isFinal ? INCIDENTAL_DEPOSIT : 0
  const amount = villaShare + incidental

  return {
    nights,
    total,
    index,
    rateLocked,
    schedule: PAYMENT_SCHEDULE[index],
    // The stay itself, before the refundable deposit.
    villaShare,
    // Refundable, and only ever on the final instalment.
    incidental,
    // What Stripe charges.
    amount,
    amountCents: Math.round(amount * 100),
    currency: CURRENCY,
  }
}
