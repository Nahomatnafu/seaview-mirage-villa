import { json } from '../_lib.mjs'
import { requireAdmin } from '../_auth.mjs'
import { readSettings, writeSettings, clearStoreCache } from '../_store.mjs'

/**
 * GET  — the current rates and seasons.
 * POST — replace them.
 *
 * Validation lives in shared/settings.mjs so the dashboard and this endpoint
 * apply exactly the same rules. The dashboard's copy is for fast feedback; this
 * one is the one that counts.
 */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    return json(res, 200, await readSettings())
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  const body = req.body || {}
  const next = {
    baseNightly: toInt(body.baseNightly),
    minNights: toInt(body.minNights),
    maxNights: toInt(body.maxNights),
    firstAvailableDate: typeof body.firstAvailableDate === 'string' ? body.firstAvailableDate.trim() : '',
    seasons: Array.isArray(body.seasons)
      ? body.seasons.map(s => ({
          id: typeof s?.id === 'string' ? s.id : undefined,
          label: typeof s?.label === 'string' ? s.label.trim() : '',
          from: typeof s?.from === 'string' ? s.from.trim() : '',
          to: typeof s?.to === 'string' ? s.to.trim() : '',
          nightly: toInt(s?.nightly),
        }))
      : [],
  }

  try {
    const saved = await writeSettings(next)
    // Rates changing must show on the site now, not in up to a minute.
    clearStoreCache('settings')
    return json(res, 200, saved)
  } catch (err) {
    // `validation` means the villa typed something wrong and should see it.
    // Anything else is ours and stays vague.
    if (err.validation) return json(res, 400, { error: err.message, errors: err.validation })
    console.error('Saving settings failed:', err)
    return json(res, 500, { error: 'Could not save. Please try again.' })
  }
}

// Accepts "2600" from a form field as readily as 2600 from JSON, but never
// coerces nonsense into a number — validation rejects NaN.
const toInt = v => {
  if (typeof v === 'number') return Number.isInteger(v) ? v : NaN
  if (typeof v === 'string' && v.trim() !== '' && /^-?\d+$/.test(v.trim())) return Number(v.trim())
  return NaN
}
