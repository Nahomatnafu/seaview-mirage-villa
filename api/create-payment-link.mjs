import crypto from 'node:crypto'
import { quoteInstalment, money, PAYMENT_SCHEDULE } from '../shared/pricing.mjs'
import { signBooking, requireEnv, json, siteUrl } from './_lib.mjs'

/**
 * Villa-side endpoint. Given a booking, returns signed payment links the villa
 * can send the guest — one per instalment, or a single one if `instalment` is
 * given.
 *
 * Protected by a shared admin token because anyone who can call this can mint
 * valid payment links. It is deliberately not reachable from the public site.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  try {
    const expected = requireEnv('ADMIN_TOKEN')
    const given = req.headers['x-admin-token'] || ''
    const a = Buffer.from(String(given))
    const b = Buffer.from(expected)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return json(res, 401, { error: 'Unauthorized' })
    }

    const { checkIn, checkOut, email, name, instalment } = req.body || {}
    if (!email) return json(res, 400, { error: 'email is required' })

    // The total agreed when the guest booked. Pass it for any booking that
    // already exists — it is on the deposit's Stripe session as `villaTotal`,
    // and in the confirmation email. Omit it only when quoting a NEW booking,
    // which then gets today's rate.
    const total = req.body?.total == null || req.body.total === ''
      ? undefined
      : String(req.body.total).trim()

    const wanted = instalment
      ? PAYMENT_SCHEDULE.filter(p => p.id === instalment)
      : PAYMENT_SCHEDULE
    if (!wanted.length) return json(res, 400, { error: `Unknown instalment "${instalment}"` })

    // Signed as the empty string when absent, so both sides agree on the shape.
    const signedTotal = total ?? ''

    const base = siteUrl(req)
    const links = wanted.map(p => {
      const quote = quoteInstalment({ checkIn, checkOut, instalment: p.id, total })
      const booking = { checkIn, checkOut, instalment: p.id, email, total: signedTotal }
      const sig = signBooking(booking)
      const qs = new URLSearchParams({ ...booking, sig })
      if (name) qs.set('name', name)
      return {
        instalment: p.id,
        label: p.label,
        due: p.when,
        percent: Math.round(p.pct * 100),
        amount: quote.amount,
        amountFormatted: money(quote.amount),
        url: `${base}/pay?${qs.toString()}`,
      }
    })

    const first = quoteInstalment({ checkIn, checkOut, instalment: wanted[0].id, total })
    return json(res, 200, {
      stay: {
        checkIn, checkOut,
        nights: first.nights,
        total: first.total,
        totalFormatted: money(first.total),
        rateLocked: first.rateLocked,
      },
      links,
    })
  } catch (err) {
    console.error('create-payment-link failed:', err)
    const safe = /Minimum stay|Invalid or missing dates|Unknown instalment|required/.test(err.message)
      ? err.message
      : 'Could not create payment links.'
    return json(res, 400, { error: safe })
  }
}
