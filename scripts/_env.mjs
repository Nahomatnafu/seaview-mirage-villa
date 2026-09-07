import fs from 'node:fs'
import path from 'node:path'

/**
 * Loads .env.local for the check scripts. Vercel's own functions get their
 * environment from the platform, so this is only ever for running things
 * locally.
 *
 * Quotes are stripped because Vercel's dashboard hands you values already
 * quoted — copy a token from the Storage tab's .env.local view and you get
 * `BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."`. Passing that through verbatim
 * sends the quotes as part of the token and the API answers "access denied",
 * which reads like a permissions problem rather than a parsing one.
 */
export function loadEnv({ required = [], quiet = false } = {}) {
  const envPath = path.resolve('.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('No .env.local found. Copy .env.example and fill it in.')
    process.exit(1)
  }

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    const key = t.slice(0, i).trim()
    let value = t.slice(i + 1).trim()
    // Strip one matching pair of surrounding quotes, single or double.
    if (value.length > 1 && /^["']/.test(value) && value.at(-1) === value[0]) {
      value = value.slice(1, -1)
    }
    process.env[key] ??= value
  }

  const missing = required.filter(k => !process.env[k])
  if (missing.length) {
    console.error(`Missing from .env.local: ${missing.join(', ')}`)
    process.exit(1)
  }

  if (!quiet && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    console.error('Refusing to run: STRIPE_SECRET_KEY is not a test key.')
    process.exit(1)
  }
}
