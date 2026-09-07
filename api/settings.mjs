import { readSettings } from './_store.mjs'
import { json } from './_lib.mjs'

/**
 * Public. The pricing rules the booking form needs to quote a stay.
 *
 * Deliberately a different endpoint from the admin one: this returns only what
 * a guest is allowed to see. No manual holds (they carry the villa's own notes)
 * and no booking statuses.
 *
 * The form falls back to the built-in defaults if this fails, so a bad response
 * degrades the price shown rather than breaking the page.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })

  try {
    const s = await readSettings()
    // Short cache: rates change rarely, and a stale minute is far cheaper than
    // a blob read on every page view. The server re-prices at payment time
    // anyway, so a stale quote can never become a wrong charge.
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300')
    return json(res, 200, {
      baseNightly: s.baseNightly,
      minNights: s.minNights,
      maxNights: s.maxNights,
      firstAvailableDate: s.firstAvailableDate,
      seasons: s.seasons.map(({ id, label, from, to, nightly }) => ({ id, label, from, to, nightly })),
    })
  } catch (err) {
    console.error('settings read failed:', err)
    return json(res, 500, { error: 'Could not load settings.' })
  }
}
