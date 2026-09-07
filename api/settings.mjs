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
    // Not cached at the edge either. The server re-prices before charging, so a
    // stale copy could never produce a wrong CHARGE — but it would show a guest
    // one total and then bill them another, which is the same complaint from
    // where they are standing.
    res.setHeader('Cache-Control', 'no-store')
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
