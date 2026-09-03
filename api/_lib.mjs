import crypto from 'node:crypto'

/**
 * Shared helpers for the payment endpoints.
 *
 * Payment links are HMAC-signed over the booking fields. Without a signature a
 * guest could edit the dates in the URL and pay for a shorter stay than they
 * booked — the server recomputes the amount, but only the villa should decide
 * which dates a link is for.
 */

// `total` is the price agreed at booking. It is signed for the same reason the
// dates are: a guest who could edit it in the URL could pay a fraction of what
// they owe. Empty string when the stay is being priced at today's rate.
export const SIGNED_FIELDS = ['checkIn', 'checkOut', 'instalment', 'email', 'total']

export function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required environment variable: ${name}`)
  return v
}

export function signBooking(booking) {
  const secret = requireEnv('PAYMENT_LINK_SECRET')
  const payload = SIGNED_FIELDS.map(f => `${f}=${booking[f] ?? ''}`).join('&')
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function verifyBooking(booking, signature) {
  if (!signature) return false
  let expected
  try { expected = signBooking(booking) } catch { return false }
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(String(signature), 'utf8')
  // Length check first — timingSafeEqual throws on a length mismatch.
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

/** Read the untouched request body. Stripe signature checks need the exact bytes. */
export function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export function siteUrl(req) {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, '')
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}
