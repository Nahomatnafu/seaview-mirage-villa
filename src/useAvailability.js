import { useEffect, useState } from 'react'

/**
 * Weeks the villa cannot take, from `/api/availability`.
 *
 * A failure returns an empty list and the guest carries on booking. That is
 * deliberate: the server re-checks availability before it creates any payment,
 * so the worst case is a guest picking a taken week and being told at the last
 * step — annoying, but far better than a booking form that refuses to work
 * because one request failed.
 */

let cached = null
let inFlight = null

export function loadAvailability() {
  if (cached) return Promise.resolve(cached)
  if (inFlight) return inFlight

  inFlight = fetch('/api/availability')
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(`availability ${r.status}`))))
    .then(d => {
      cached = Array.isArray(d.blocked) ? d.blocked.filter(b => b?.from && b?.to) : []
      return cached
    })
    .catch(err => {
      console.warn('Could not load availability:', err.message)
      cached = []
      return cached
    })
    .finally(() => { inFlight = null })

  return inFlight
}

export function useAvailability() {
  const [blocks, setBlocks] = useState(cached || [])

  useEffect(() => {
    let alive = true
    loadAvailability().then(b => { if (alive) setBlocks(b) })
    return () => { alive = false }
  }, [])

  return blocks
}

/** Test seam. */
export function __resetAvailabilityCache() {
  cached = null
  inFlight = null
}
