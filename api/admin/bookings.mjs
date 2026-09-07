import Stripe from 'stripe'
import { json, requireEnv } from '../_lib.mjs'
import { requireAdmin } from '../_auth.mjs'
import { readStatuses, writeStatuses, clearStoreCache } from '../_store.mjs'
import { clearAvailabilityCache } from '../_availability.mjs'
import { PAYMENT_SCHEDULE } from '../../shared/pricing.mjs'

/**
 * Who has booked, assembled from Stripe rather than a table of our own.
 *
 * Every paid instalment is a Checkout Session carrying the guest and the dates,
 * so bookings are grouped by stay and each instalment shows against it. The
 * only thing we keep is the villa's confirm/decline decision.
 *
 * GET  — every booking, newest arrival first
 * POST — set a booking's status
 */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'POST') return setStatus(req, res)
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })

  try {
    const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'))
    const [sessions, statuses] = await Promise.all([
      stripe.checkout.sessions.list({ limit: 100 }),
      readStatuses(),
    ])

    // One booking per stay, not per payment. A guest paying three instalments
    // is one reservation with three payments against it.
    const byStay = new Map()

    for (const s of sessions.data) {
      if (s.payment_status !== 'paid') continue
      const m = s.metadata || {}
      if (!m.checkIn || !m.checkOut) continue

      const email = (s.customer_details?.email || s.customer_email || '').toLowerCase()
      const key = `${email}|${m.checkIn}|${m.checkOut}`

      if (!byStay.has(key)) {
        byStay.set(key, {
          key,
          guestName: m.guestName || s.customer_details?.name || '',
          email,
          phone: m.guestPhone || '',
          checkIn: m.checkIn,
          checkOut: m.checkOut,
          nights: Number(m.nights) || 0,
          villaTotal: Number(m.villaTotal) || 0,
          partySize: m.partySize || '',
          extras: m.extras || '',
          notes: m.notes || '',
          rateLocked: m.rateLocked === 'yes',
          paid: 0,
          incidentalHeld: 0,
          payments: [],
          // The deposit's session id is the booking's identity, because it is
          // the one that exists from the moment the week is reserved.
          depositSessionId: null,
        })
      }

      const b = byStay.get(key)
      const amount = (s.amount_total ?? 0) / 100
      b.paid += amount
      b.incidentalHeld += Number(m.incidentalDeposit) || 0
      b.payments.push({
        sessionId: s.id,
        instalment: m.instalment || 'deposit',
        label: m.instalmentLabel || '',
        amount,
        at: s.created ? new Date(s.created * 1000).toISOString() : null,
      })
      if ((m.instalment || 'deposit') === 'deposit') b.depositSessionId = s.id
    }

    const bookings = [...byStay.values()].map(b => {
      const id = b.depositSessionId || b.payments[0]?.sessionId || b.key
      const paidIds = new Set(b.payments.map(p => p.instalment))
      const payments = b.payments.sort((x, y) => String(x.at).localeCompare(String(y.at)))
      return {
        ...b,
        id,
        status: statuses[id]?.status || 'pending',
        statusNote: statuses[id]?.note || '',
        outstanding: Math.max(0, b.villaTotal - (b.paid - b.incidentalHeld)),
        // Which instalments are still owed, for the invoicing view.
        due: PAYMENT_SCHEDULE.filter(p => !paidIds.has(p.id)).map(p => p.id),
        // When the booking was made — the first payment against it. Not the
        // arrival date: the villa wants to see what just came in.
        bookedAt: payments[0]?.at || null,
        payments,
      }
    })

    // Newest booking first. Sorting by arrival buried a booking made this
    // morning underneath one made weeks ago for an earlier date.
    bookings.sort((a, b) => String(b.bookedAt).localeCompare(String(a.bookedAt)))
    return json(res, 200, { bookings })
  } catch (err) {
    console.error('Loading bookings failed:', err)
    return json(res, 500, { error: 'Could not load bookings.' })
  }
}

const ALLOWED = new Set(['pending', 'confirmed', 'declined'])

async function setStatus(req, res) {
  const id = String(req.body?.id || '').trim()
  const status = String(req.body?.status || '').trim()
  const note = String(req.body?.note || '').trim().slice(0, 200)

  if (!id) return json(res, 400, { error: 'Which booking?' })
  if (!ALLOWED.has(status)) return json(res, 400, { error: 'Unknown status.' })

  try {
    const statuses = await readStatuses()
    statuses[id] = { status, note, at: new Date().toISOString() }
    await writeStatuses(statuses)
    clearStoreCache('statuses')
    // Declining frees the week, so availability has to be recomputed.
    clearAvailabilityCache()
    return json(res, 200, { ok: true, id, status })
  } catch (err) {
    console.error('Saving booking status failed:', err)
    return json(res, 500, { error: 'Could not save. Please try again.' })
  }
}
