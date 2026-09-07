import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS } from '../shared/pricing.mjs'
import { normaliseSettings } from '../shared/settings.mjs'

/**
 * Live pricing rules from `/api/settings`, so the booking form quotes the rates
 * the villa has actually set rather than the constants baked into the bundle.
 *
 * Fetched once per page load and shared between components — the booking modal
 * can open and close repeatedly, and each open should not be another request.
 *
 * Every failure path returns the defaults. A guest must always see a price:
 * showing the villa's standard rate is a far better failure than an empty
 * booking form, and the server re-prices before charging anything, so a stale
 * or fallback quote can never turn into a wrong charge.
 */

let cached = null
let inFlight = null

export function loadSettings() {
  if (cached) return Promise.resolve(cached)
  if (inFlight) return inFlight

  inFlight = fetch('/api/settings')
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(`settings ${r.status}`))))
    .then(raw => {
      // Normalise rather than trust: this came over the wire, and bad seasons
      // would otherwise price a stay wrongly on screen.
      cached = normaliseSettings(raw)
      return cached
    })
    .catch(err => {
      console.warn('Falling back to default rates:', err.message)
      cached = DEFAULT_SETTINGS
      return cached
    })
    .finally(() => { inFlight = null })

  return inFlight
}

export function useSettings() {
  const [settings, setSettings] = useState(cached || DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(Boolean(cached))

  useEffect(() => {
    let alive = true
    loadSettings().then(s => {
      if (!alive) return
      setSettings(s)
      setLoaded(true)
    })
    return () => { alive = false }
  }, [])

  return { settings, loaded }
}

/** Test seam — lets a check script reset the module-level cache. */
export function __resetSettingsCache() {
  cached = null
  inFlight = null
}
