import { json } from '../_lib.mjs'
import { verifyPassword, makeSession, setSessionCookie, loginDelay } from '../_auth.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  // Every attempt costs the same wait, right or wrong, so response time gives
  // nothing away and guessing stays slow.
  await loginDelay()

  const stored = process.env.ADMIN_PASSWORD_HASH
  if (!stored) {
    console.error('ADMIN_PASSWORD_HASH is not set — nobody can sign in.')
    return json(res, 500, { error: 'The dashboard is not set up yet.' })
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  // Cap the input: scrypt on a megabyte of text is a free way to tie up a
  // function instance.
  if (!password || password.length > 200) {
    return json(res, 401, { error: 'That password is not right.' })
  }

  let ok = false
  try {
    ok = await verifyPassword(password, stored)
  } catch (err) {
    console.error('Password check failed:', err.message)
    return json(res, 500, { error: 'Could not sign you in.' })
  }

  if (!ok) return json(res, 401, { error: 'That password is not right.' })

  try {
    setSessionCookie(res, makeSession())
  } catch (err) {
    // Missing ADMIN_SESSION_SECRET. Fail rather than hand out a session that
    // cannot be verified later.
    console.error('Session could not be signed:', err.message)
    return json(res, 500, { error: 'The dashboard is not set up yet.' })
  }

  return json(res, 200, { ok: true })
}
