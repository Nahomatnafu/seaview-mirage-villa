import crypto from 'node:crypto'
import { json } from '../_lib.mjs'
import { requireAdmin } from '../_auth.mjs'
import { readBlocks, writeBlocks, clearStoreCache } from '../_store.mjs'
import { clearAvailabilityCache } from '../_availability.mjs'
import { parseDay, nightsBetween } from '../../shared/dates.mjs'

/**
 * The villa's manual holds — weeks taken by phone or WhatsApp that Stripe knows
 * nothing about.
 *
 * GET    — list them
 * POST   — add one
 * DELETE — remove one by id
 *
 * `to` is the DEPARTURE date, matching how bookings work, so one stay can begin
 * on another's `to`.
 */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    return json(res, 200, { blocks: await readBlocks() })
  }

  if (req.method === 'POST') {
    const from = String(req.body?.from || '').trim()
    const to = String(req.body?.to || '').trim()
    // Kept short and flagged in the UI as visible to nobody but the villa —
    // this store is not where guest details belong.
    const note = String(req.body?.note || '').trim().slice(0, 120)

    if (!parseDay(from) || !parseDay(to)) {
      return json(res, 400, { error: 'Please give a real arrival and departure date.' })
    }
    if (nightsBetween(from, to) < 1) {
      return json(res, 400, { error: 'The departure date must be after the arrival date.' })
    }

    const blocks = await readBlocks()
    if (blocks.length >= 500) {
      return json(res, 400, { error: 'Too many blocked periods. Remove some old ones first.' })
    }

    blocks.push({ id: crypto.randomUUID(), from, to, note, at: new Date().toISOString() })
    await writeBlocks(blocks)
    clearStoreCache('blocks')
    clearAvailabilityCache()
    return json(res, 200, { blocks })
  }

  if (req.method === 'DELETE') {
    const id = String(req.body?.id || req.query?.id || '').trim()
    if (!id) return json(res, 400, { error: 'Which one?' })

    const blocks = await readBlocks()
    const next = blocks.filter(b => b.id !== id)
    if (next.length === blocks.length) return json(res, 404, { error: 'That block no longer exists.' })

    await writeBlocks(next)
    clearStoreCache('blocks')
    clearAvailabilityCache()
    return json(res, 200, { blocks: next })
  }

  return json(res, 405, { error: 'Method not allowed' })
}
