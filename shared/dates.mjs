// Date helpers shared by the pricing maths, the settings validation and the
// availability checks.
//
// Pulled out of pricing.mjs so settings.mjs can use them without the two
// importing each other. Dependency-free and runtime-agnostic — no node
// builtins, no browser APIs. Do not add any.
//
// Everything here works in YYYY-MM-DD strings and LOCAL dates. `new Date('YYYY-MM-DD')`
// parses as UTC midnight, which lands on the previous day west of Greenwich —
// that is the bug this module exists to keep out of the pricing code.

/** Parse YYYY-MM-DD as a local date, or null if it isn't one. */
export function parseDay(d) {
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null
  const [y, m, day] = d.split('-').map(Number)
  const dt = new Date(y, m - 1, day)
  // Rejects 2026-02-31 and friends, which Date would silently roll forward.
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== day) return null
  return Number.isNaN(dt.getTime()) ? null : dt
}

export const toISODate = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Today at local midnight, so "today" itself is never treated as past. */
export const todayStart = () => {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

/** Whole nights between two dates. Zero if either is unparseable. */
export function nightsBetween(checkIn, checkOut) {
  const a = parseDay(checkIn), b = parseDay(checkOut)
  if (!a || !b) return 0
  // Round rather than floor: DST shifts make the gap 23 or 25 hours twice a
  // year, which would otherwise lose or gain a night.
  return Math.max(0, Math.round((b - a) / 86400000))
}

/** ISO date `n` days after `iso`. */
export function addDays(iso, n) {
  const d = parseDay(iso)
  if (!d) return null
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

/**
 * The nights actually slept, as ISO dates.
 *
 * A stay arriving on the 10th and leaving on the 17th occupies the nights of
 * the 10th through the 16th — seven of them. The departure date is not a night,
 * which is why one stay may begin on the day another ends.
 */
export function eachNight(checkIn, checkOut) {
  const a = parseDay(checkIn), b = parseDay(checkOut)
  if (!a || !b || b <= a) return []
  const out = []
  const cur = new Date(a)
  while (cur < b) {
    out.push(toISODate(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

/** Half-open overlap: a stay ending on the day another begins does not clash. */
export function rangesOverlap(aFrom, aTo, bFrom, bTo) {
  const a1 = parseDay(aFrom), a2 = parseDay(aTo)
  const b1 = parseDay(bFrom), b2 = parseDay(bTo)
  if (!a1 || !a2 || !b1 || !b2) return false
  return a1 < b2 && b1 < a2
}
