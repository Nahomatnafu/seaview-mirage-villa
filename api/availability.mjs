import { json } from './_lib.mjs'
import { blockedRanges } from './_availability.mjs'
import { BLOCKED_RANGES } from '../shared/pricing.mjs'

/**
 * Public. The dates the villa cannot take, so the booking form can grey them
 * out instead of letting a guest pick a week and be refused at payment.
 *
 * Dates only — no guest names, no emails, no notes. Anyone can call this, and
 * "the villa is busy that week" is all a stranger is entitled to know.
 *
 * The form treats a failure here as "no known blocks" and lets the guest carry
 * on; the server re-checks before charging, so an unavailable week is caught
 * there regardless.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })

  try {
    const ranges = await blockedRanges()
    // Not cached at the edge. A CDN copy would keep offering a week the villa
    // has just taken off sale, and this is the response the date picker greys
    // dates out from. It is a small JSON body on a low-traffic site — the cache
    // was never worth what it costs here.
    res.setHeader('Cache-Control', 'no-store')
    return json(res, 200, {
      blocked: [...ranges, ...BLOCKED_RANGES].map(r => ({ from: r.from, to: r.to })),
    })
  } catch (err) {
    console.error('Availability read failed:', err)
    return json(res, 500, { error: 'Could not load availability.' })
  }
}
