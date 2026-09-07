import Stripe from 'stripe'
import { readBlocks, readStatuses } from './_store.mjs'

/**
 * What is unavailable, derived rather than stored.
 *
 * Two sources:
 *   1. Paid bookings — read live from Stripe, which already knows the dates of
 *      every deposit it has taken.
 *   2. The villa's manual holds — weeks booked by phone or WhatsApp, entered in
 *      the dashboard.
 *
 * Deriving (1) instead of writing it down when the webhook fires is what keeps
 * the admin dashboard the only writer to blob storage: there is no race between
 * a payment landing and the villa editing a rate, because a payment writes
 * nothing. It also means availability cannot drift from what Stripe actually
 * charged for.
 */

const PAID_LOOKBACK = 200

// Availability is read on the date picker, on every quote and before every
// payment. Without this, one booking flow would be a dozen Stripe calls.
//
// Per instance, and instances cannot invalidate each other's — so this is the
// window in which a just-blocked week could still look free. Kept short, and
// skipped entirely by anything about to take money: see { fresh: true }.
const TTL_MS = 10_000
let cache = null

export function clearAvailabilityCache() {
  cache = null
}

/** Every paid stay Stripe knows about, as `{ from, to }` departure-exclusive ranges. */
async function paidStays() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return []

  const stripe = new Stripe(key)
  const out = []
  // Deposits are what reserve a week; instalments 2 and 3 are the same stay
  // again and would just duplicate the range.
  const sessions = await stripe.checkout.sessions.list({ limit: PAID_LOOKBACK })
  for (const s of sessions.data) {
    if (s.payment_status !== 'paid') continue
    const m = s.metadata || {}
    if (m.instalment && m.instalment !== 'deposit') continue
    if (!m.checkIn || !m.checkOut) continue
    out.push({
      from: m.checkIn,
      to: m.checkOut,
      source: 'booking',
      sessionId: s.id,
      email: (s.customer_details?.email || s.customer_email || '').toLowerCase(),
    })
  }
  return out
}

/**
 * All unavailable ranges.
 *
 * `excludeEmail` drops this guest's own bookings, so someone returning to a
 * half-finished payment is not blocked by their own reservation.
 * Declined bookings are dropped too — the villa has refunded them and the week
 * is back on sale.
 */
export async function blockedRanges({ excludeEmail = '', fresh = false } = {}) {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) {
    return filter(cache.ranges, excludeEmail)
  }

  let stays = []
  try {
    stays = await paidStays()
  } catch (err) {
    // A Stripe outage must not let the site sell a week that is already taken,
    // but neither can it take the site down. Manual holds still apply, and the
    // villa's own dashboard remains the backstop.
    console.error('Could not read paid bookings from Stripe:', err.message)
  }

  const [manual, statuses] = await Promise.all([
    readBlocks({ fresh }), readStatuses({ fresh }),
  ])

  const ranges = [
    ...stays.filter(s => statuses[s.sessionId]?.status !== 'declined'),
    ...manual.map(b => ({ ...b, source: 'manual' })),
  ].filter(r => r && r.from && r.to)

  cache = { at: Date.now(), ranges }
  return filter(ranges, excludeEmail)
}

const filter = (ranges, email) =>
  !email ? ranges : ranges.filter(r => !r.email || r.email !== email.toLowerCase())

/** Bookings with their guest details, for the dashboard only. */
export async function paidBookings() {
  const [stays, statuses] = await Promise.all([paidStays(), readStatuses()])
  return { stays, statuses }
}
