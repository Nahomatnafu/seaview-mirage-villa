// The values the villa can change from the admin dashboard, plus the rules for
// what counts as valid.
//
// Dependency-free and runtime-agnostic — imported by the browser, the API and
// the test scripts alike. Do not add node builtins or browser APIs.
//
// These defaults are what the site runs on before anyone touches the dashboard,
// and what it falls back to if the store is unreachable. The public site must
// never fail to price a stay because a settings read failed.

import { parseDay, rangesOverlap } from './dates.mjs'

// Sanity bounds on any nightly rate, wherever it comes from. Wide on purpose:
// the job is to reject a typo or a corrupted value, not to second-guess what
// the villa wants to charge.
export const MIN_NIGHTLY = 100
export const MAX_NIGHTLY = 50000

export const MAX_SEASONS = 24

export const DEFAULT_SETTINGS = {
  baseNightly: 2600,
  minNights: 7,
  maxNights: 90,
  // The villa is booked solid until this date.
  firstAvailableDate: '2026-12-10',
  // Date ranges charged at something other than the base rate. Both ends are
  // inclusive and refer to NIGHTS, so a season ending 2027-01-05 includes the
  // night of the 5th.
  seasons: [],
}

/** Deep-ish copy, so callers can't mutate the shared defaults by accident. */
export const defaultSettings = () => ({
  ...DEFAULT_SETTINGS,
  seasons: DEFAULT_SETTINGS.seasons.map(s => ({ ...s })),
})

const isIntInRange = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi

/**
 * Checks a settings object the villa is trying to save.
 *
 * Returns `{ ok, errors }` rather than throwing, because the dashboard shows
 * every problem at once instead of making Roger fix them one at a time.
 */
export function validateSettings(raw) {
  const errors = []
  if (!raw || typeof raw !== 'object') return { ok: false, errors: ['Settings must be an object.'] }

  if (!isIntInRange(raw.baseNightly, MIN_NIGHTLY, MAX_NIGHTLY)) {
    errors.push(`The nightly rate must be a whole number between $${MIN_NIGHTLY} and $${MAX_NIGHTLY.toLocaleString()}.`)
  }
  if (!isIntInRange(raw.minNights, 1, 90)) {
    errors.push('The minimum stay must be between 1 and 90 nights.')
  }
  if (!isIntInRange(raw.maxNights, 1, 365)) {
    errors.push('The maximum stay must be between 1 and 365 nights.')
  }
  if (isIntInRange(raw.minNights, 1, 90) && isIntInRange(raw.maxNights, 1, 365) && raw.minNights > raw.maxNights) {
    errors.push('The minimum stay cannot be longer than the maximum stay.')
  }
  if (raw.firstAvailableDate != null && raw.firstAvailableDate !== '' && !parseDay(raw.firstAvailableDate)) {
    errors.push('The first available date must be a real date.')
  }

  const seasons = raw.seasons
  if (!Array.isArray(seasons)) {
    errors.push('Seasons must be a list.')
    return { ok: errors.length === 0, errors }
  }
  if (seasons.length > MAX_SEASONS) {
    errors.push(`No more than ${MAX_SEASONS} seasons.`)
  }

  seasons.forEach((s, i) => {
    const where = s?.label ? `"${s.label}"` : `Season ${i + 1}`
    if (!s || typeof s !== 'object') { errors.push(`${where} is not valid.`); return }
    if (typeof s.label !== 'string' || !s.label.trim()) errors.push(`${where} needs a name.`)
    if (typeof s.label === 'string' && s.label.length > 60) errors.push(`${where}: the name is too long.`)

    const from = parseDay(s.from), to = parseDay(s.to)
    if (!from) errors.push(`${where}: the start date is not a real date.`)
    if (!to) errors.push(`${where}: the end date is not a real date.`)
    if (from && to && to < from) errors.push(`${where} ends before it starts.`)
    if (!isIntInRange(s.nightly, MIN_NIGHTLY, MAX_NIGHTLY)) {
      errors.push(`${where}: the rate must be a whole number between $${MIN_NIGHTLY} and $${MAX_NIGHTLY.toLocaleString()}.`)
    }
  })

  // Overlapping seasons would make the rate for a night ambiguous — whichever
  // came first in the list would silently win.
  for (let i = 0; i < seasons.length; i++) {
    for (let j = i + 1; j < seasons.length; j++) {
      const a = seasons[i], b = seasons[j]
      if (!parseDay(a?.from) || !parseDay(a?.to) || !parseDay(b?.from) || !parseDay(b?.to)) continue
      // Season ends are inclusive, so shift by a day to reuse the half-open test.
      if (rangesOverlap(a.from, addOneDay(a.to), b.from, addOneDay(b.to))) {
        errors.push(`"${a.label || i + 1}" and "${b.label || j + 1}" cover some of the same dates.`)
      }
    }
  }

  return { ok: errors.length === 0, errors }
}

const addOneDay = iso => {
  const d = parseDay(iso)
  if (!d) return iso
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Takes whatever came out of the store and returns something safe to price
 * with: known keys only, defaults filled in, seasons sorted.
 *
 * Invalid input returns the defaults rather than throwing. A corrupted settings
 * blob should degrade the villa to its standard rate, not take the site down.
 */
export function normaliseSettings(raw) {
  const { ok } = validateSettings(raw)
  if (!ok) return defaultSettings()
  return {
    baseNightly: raw.baseNightly,
    minNights: raw.minNights,
    maxNights: raw.maxNights,
    firstAvailableDate: raw.firstAvailableDate || DEFAULT_SETTINGS.firstAvailableDate,
    seasons: raw.seasons
      .map(s => ({
        id: typeof s.id === 'string' && s.id ? s.id : `${s.from}_${s.to}`,
        label: s.label.trim(),
        from: s.from,
        to: s.to,
        nightly: s.nightly,
      }))
      .sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0)),
  }
}

/** The season covering a given night, or null for the base rate. */
export function seasonForNight(iso, settings = DEFAULT_SETTINGS) {
  const night = parseDay(iso)
  if (!night) return null
  for (const s of settings.seasons || []) {
    const from = parseDay(s.from), to = parseDay(s.to)
    if (!from || !to) continue
    if (night >= from && night <= to) return s
  }
  return null
}

/** What one night costs. */
export function rateForNight(iso, settings = DEFAULT_SETTINGS) {
  const season = seasonForNight(iso, settings)
  return season ? season.nightly : settings.baseNightly
}
