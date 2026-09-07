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
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300')
    return json(res, 200, {
      blocked: [...ranges, ...BLOCKED_RANGES].map(r => ({ from: r.from, to: r.to })),
    })
  } catch (err) {
    console.error('Availability read failed:', err)
    return json(res, 500, { error: 'Could not load availability.' })
  }
}
