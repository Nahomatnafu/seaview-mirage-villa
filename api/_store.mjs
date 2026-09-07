import { put, list } from '@vercel/blob'
import { normaliseSettings, defaultSettings, validateSettings } from '../shared/settings.mjs'

/**
 * The villa's editable state, in Vercel Blob.
 *
 * Only three things live here. Bookings do NOT: every paid booking is already a
 * Stripe Checkout Session carrying the guest, the dates and the amounts, and
 * copying that into a second store would guarantee the two drift apart.
 *
 *   settings  — nightly rate, seasons, minimum stay, opening date
 *   blocks    — the villa's manual holds, for bookings taken by phone
 *   statuses  — sessionId → confirmed | declined
 *
 * The admin dashboard is the ONLY writer. The Stripe webhook writes nothing:
 * weeks taken by paid bookings are derived from Stripe when availability is
 * read. That means there is no read-modify-write race to mitigate, rather than
 * a small one we hope never fires.
 *
 * Blobs are private, so nothing here is reachable by URL. Even so, keep guest
 * names, emails and phone numbers OUT of this store — they belong in Stripe,
 * which is the record of who booked.
 */

const PREFIX = 'villa/'
const FILES = {
  settings: `${PREFIX}settings.json`,
  blocks: `${PREFIX}blocks.json`,
  statuses: `${PREFIX}statuses.json`,
}

// A settings read happens on most page loads; without this a single render
// would be three round trips to blob storage. Per-instance and short, so an
// edit shows up within a minute without any invalidation machinery.
const TTL_MS = 60_000
const cache = new Map()

const fresh = key => {
  const hit = cache.get(key)
  return hit && Date.now() - hit.at < TTL_MS ? hit : null
}

export function clearStoreCache(key) {
  if (key) cache.delete(key)
  else cache.clear()
}

const configured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN)

/**
 * Read one JSON blob. Returns `fallback` for anything that goes wrong —
 * unconfigured store, missing file, network failure, unparseable JSON.
 *
 * Deliberately never throws. A guest pricing a stay must not see an error
 * because a settings read failed; they see the villa's standard rates instead.
 */
async function readJson(key, fallback) {
  const hit = fresh(key)
  if (hit) return hit.value

  if (!configured()) return fallback

  try {
    // `list` rather than a stored URL, so the caller needs no state to find it.
    const { blobs } = await list({ prefix: FILES[key], limit: 1 })
    if (!blobs.length) {
      cache.set(key, { at: Date.now(), value: fallback })
      return fallback
    }
    const res = await fetch(blobs[0].downloadUrl ?? blobs[0].url)
    if (!res.ok) throw new Error(`blob fetch ${res.status}`)
    const value = await res.json()
    cache.set(key, { at: Date.now(), value })
    return value
  } catch (err) {
    // Loud, because running on defaults when the villa thinks it changed a rate
    // is exactly the kind of thing that goes unnoticed for a month.
    console.error(`Store read failed for ${key}, using fallback:`, err.message)
    return fallback
  }
}

async function writeJson(key, value) {
  if (!configured()) {
    throw new Error('No blob store is configured. Add BLOB_READ_WRITE_TOKEN in Vercel → Storage.')
  }
  await put(FILES[key], JSON.stringify(value, null, 2), {
    access: 'private',
    contentType: 'application/json',
    // One canonical path per file, overwritten in place — no random suffix, or
    // every save would leave an orphan behind and `list` would pick one at
    // random.
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  cache.set(key, { at: Date.now(), value })
  return value
}

// --- settings ---------------------------------------------------------------

/** Always returns something priceable, whatever is in the store. */
export async function readSettings() {
  const raw = await readJson('settings', null)
  return raw ? normaliseSettings(raw) : defaultSettings()
}

/** Throws with the list of problems if the settings are not valid. */
export async function writeSettings(next) {
  const { ok, errors } = validateSettings(next)
  if (!ok) {
    const err = new Error(errors.join(' '))
    err.validation = errors
    throw err
  }
  return writeJson('settings', normaliseSettings(next))
}

// --- manual blocks ----------------------------------------------------------

/** Dates the villa has taken off sale by hand. `to` is the departure date. */
export async function readBlocks() {
  const raw = await readJson('blocks', [])
  return Array.isArray(raw) ? raw : []
}

export async function writeBlocks(blocks) {
  if (!Array.isArray(blocks)) throw new Error('Blocks must be a list.')
  return writeJson('blocks', blocks)
}

// --- booking statuses -------------------------------------------------------

/** `{ [stripeSessionId]: { status, note, at } }`. No guest data. */
export async function readStatuses() {
  const raw = await readJson('statuses', {})
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
}

export async function writeStatuses(statuses) {
  if (!statuses || typeof statuses !== 'object' || Array.isArray(statuses)) {
    throw new Error('Statuses must be an object.')
  }
  return writeJson('statuses', statuses)
}

export const storeConfigured = configured
