import { json } from '../_lib.mjs'
import { clearSessionCookie } from '../_auth.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  // No auth check: signing out an already-signed-out browser is harmless, and
  // refusing it would just leave a stale cookie in place.
  clearSessionCookie(res)
  return json(res, 200, { ok: true })
}
