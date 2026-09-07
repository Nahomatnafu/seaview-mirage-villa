import { json } from '../_lib.mjs'
import { sessionFromRequest } from '../_auth.mjs'

/**
 * Whether this browser is signed in. The dashboard calls it on load so it can
 * show the login screen without first failing a data request.
 *
 * Always 200 — "no" is an answer, not an error.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  return json(res, 200, { signedIn: Boolean(sessionFromRequest(req)) })
}
