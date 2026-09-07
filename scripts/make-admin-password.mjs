/**
 * Generates the two secrets the dashboard needs.
 *
 *   node scripts/make-admin-password.mjs            → invents a strong password
 *   node scripts/make-admin-password.mjs "my pass"  → uses one you chose
 *
 * Prints the password once. The hash goes in Vercel; the password goes to the
 * villa through something other than email if you can manage it. Neither is
 * recoverable — losing the password means running this again.
 */
import crypto from 'node:crypto'
import { hashPassword } from '../api/_auth.mjs'

// Ambiguous characters left out: someone will read this over the phone.
const ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const invent = (len = 20) => {
  const bytes = crypto.randomBytes(len * 2)
  let out = ''
  // Rejection sampling: taking bytes modulo the alphabet length would make the
  // earlier characters fractionally likelier.
  for (const b of bytes) {
    if (out.length === len) break
    if (b < 256 - (256 % ALPHABET.length)) out += ALPHABET[b % ALPHABET.length]
  }
  return out
}

const given = process.argv[2]
if (given && given.length < 12) {
  console.error('That password is too short — use at least 12 characters, or pass none and let this pick one.')
  process.exit(1)
}

const password = given || invent()
const hash = await hashPassword(password)
const sessionSecret = crypto.randomBytes(32).toString('hex')

console.log(`
Password (give this to the villa, it is not stored anywhere):

    ${password}

Add these two in Vercel → Settings → Environment Variables, for Production
and Preview. Then redeploy — env vars only apply to builds made after they
are set.

ADMIN_PASSWORD_HASH=${hash}
ADMIN_SESSION_SECRET=${sessionSecret}

Changing ADMIN_SESSION_SECRET signs everyone out, which is how you revoke
access if the password ever gets out.
`)
