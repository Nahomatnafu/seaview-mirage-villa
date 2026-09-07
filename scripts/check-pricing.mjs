// Checks on the money maths, availability rules and link signing.
// Run with: npm run check:pricing
process.env.PAYMENT_LINK_SECRET = 'test-secret-for-local-checks'

const P = await import('../shared/pricing.mjs')
const { signBooking, verifyBooking } = await import('../api/_lib.mjs')
const {
  quoteInstalment, instalments, villaTotal, baseTotal, nightsBetween, validateStay,
  earliestArrival, toISODate, MIN_NIGHTS, MAX_NIGHTS,
} = P
const S = await import('../shared/settings.mjs')

let fails = 0
const check = (name, cond, detail = '') => {
  if (!cond) { fails++; console.log(`  FAIL  ${name} ${detail}`) }
  else console.log(`  ok    ${name} ${detail}`)
}

// A stay comfortably after the villa reopens, so these tests keep working as
// the opening date moves.
const open = earliestArrival()
const day = n => {
  const d = new Date(open); d.setDate(d.getDate() + n); return toISODate(d)
}
const IN = day(30), OUT = day(37)          // 7 nights
const OUT_LONG = day(44)                   // 14 nights

console.log('\n— amounts —')
const q = ['deposit', 'second', 'final'].map(id => quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: id }))
check('7 nights', q[0].nights === 7)
check('total is $18,200', q[0].total === 18200, `got ${q[0].total}`)
check('25% = $4,550', q[0].amount === 4550, `got ${q[0].amount}`)
check('35% = $6,370', q[1].amount === 6370, `got ${q[1].amount}`)
// villaShare is the stay; amount is what Stripe charges. They differ only on
// the final instalment, which carries the refundable incidental deposit.
check('40% = $7,280', q[2].villaShare === 7280, `got ${q[2].villaShare}`)
check('villa shares sum to total', q[0].villaShare + q[1].villaShare + q[2].villaShare === 18200)
check('charges sum to total + deposit',
  q[0].amount + q[1].amount + q[2].amount === 18200 + P.INCIDENTAL_DEPOSIT)
check('cents for Stripe', q[0].amountCents === 455000, `got ${q[0].amountCents}`)
const long = quoteInstalment({ checkIn: IN, checkOut: OUT_LONG, instalment: 'deposit' })
check('14 nights = $36,400 total', long.total === 36400, `got ${long.total}`)

console.log('\n— no rounding leak across every allowed length —')
let bad = null
for (let n = MIN_NIGHTS; n <= MAX_NIGHTS; n++) {
  const t = villaTotal(IN, day(30 + n))
  if (instalments(t).reduce((a, b) => a + b, 0) !== t) bad = n
}
check(`every length ${MIN_NIGHTS}..${MAX_NIGHTS} sums exactly`, bad === null, bad ? `broken at ${bad}` : '')

console.log('\n— date rules —')
const throws = fn => { try { fn(); return false } catch { return true } }
const quote = (ci, co, id = 'deposit') => () => quoteInstalment({ checkIn: ci, checkOut: co, instalment: id })
check('rejects 6 nights', throws(quote(IN, day(36))))
check('accepts exactly 7 nights', !throws(quote(IN, OUT)))
check('rejects reversed dates', throws(quote(OUT, IN)))
check('rejects same day', throws(quote(IN, IN)))
check('rejects junk date', throws(quote('tomorrow', OUT)))
check('rejects missing date', throws(quote('', OUT)))
check('rejects unknown instalment', throws(quote(IN, OUT, 'fourth')))
check('rejects injection-ish input', throws(quote("2027-01-05' OR 1=1", OUT)))
check(`rejects over ${MAX_NIGHTS} nights`, throws(quote(IN, day(30 + MAX_NIGHTS + 1))))
check('no timezone off-by-one', nightsBetween('2027-03-08', '2027-03-15') === 7)

console.log('\n— availability —')
check('rejects arrival before the villa reopens', throws(quote('2026-09-01', '2026-09-10')))
check('rejects a past date', throws(quote('2020-01-01', '2020-01-10')))
check('accepts the opening day itself', validateStay(toISODate(open), day(7)).ok)
const before = new Date(open); before.setDate(before.getDate() - 1)
check('rejects the day before opening', !validateStay(toISODate(before), day(7)).ok)

// Blocked-range overlap, exercised against a temporary entry.
P.BLOCKED_RANGES.push({ from: day(100), to: day(107), note: 'test booking' })
check('rejects a stay inside a booked week', !validateStay(day(101), day(108)).ok)
check('rejects a stay straddling the start', !validateStay(day(96), day(103)).ok)
check('rejects a stay straddling the end', !validateStay(day(104), day(111)).ok)
check('rejects a stay swallowing the block', !validateStay(day(98), day(112)).ok)
check('allows a stay ending as the block starts', validateStay(day(93), day(100)).ok)
check('allows a stay starting as the block ends', validateStay(day(107), day(114)).ok)
P.BLOCKED_RANGES.pop()
check('block removed cleanly', validateStay(day(101), day(108)).ok)

console.log('\n— the agreed rate is locked to the booking —')
{
  const nights = P.nightsBetween(IN, OUT)
  const atBooking = P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: 'deposit' })
  const agreed = atBooking.total
  check('a new booking uses today\'s rate', agreed === nights * P.NIGHTLY_RATE, `$${agreed}`)
  check('a new booking is not marked locked', atBooking.rateLocked === false)

  // The whole point: the villa raises the rate after someone has booked.
  const original = P.NIGHTLY_RATE
  const raised = original + 900

  const lockedSecond = P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: 'second', total: agreed })
  const lockedFinal = P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: 'final', total: agreed })
  const floatingSecond = P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: 'second', total: nights * raised })

  check('locked instalment 2 bills the agreed total', lockedSecond.total === agreed, `$${lockedSecond.total}`)
  check('locked instalment 3 bills the agreed total', lockedFinal.total === agreed, `$${lockedFinal.total}`)
  check('locked quotes are flagged as locked', lockedSecond.rateLocked === true)
  check('a higher rate would have charged more',
    floatingSecond.amount > lockedSecond.amount,
    `$${floatingSecond.amount} vs $${lockedSecond.amount}`)

  // Every instalment of a locked booking must still sum to the agreed total —
  // the rounding remainder rule has to survive the lock.
  const parts = ['deposit', 'second', 'final']
    .map(id => P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: id, total: agreed }).villaShare)
  check('locked instalments sum to the agreed total',
    parts.reduce((a, b) => a + b, 0) === agreed, `${parts.join(' + ')} = ${agreed}`)

  // A locked total must still be a sane number.
  const bad = [
    ['zero', 0], ['negative', -18200], ['not a number', 'abc'],
    ['fractional', 18200.5], ['absurdly low', 7], ['absurdly high', 99_999_999],
  ]
  for (const [label, value] of bad) {
    let threw = false
    try { P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: 'second', total: value }) }
    catch { threw = true }
    check(`rejects a ${label} total`, threw)
  }

  // A numeric string is what actually arrives over HTTP.
  const asString = P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: 'second', total: String(agreed) })
  check('accepts the total as a string', asString.total === agreed)
}

console.log('\n— seasonal rates —')
{
  const base = P.DEFAULT_SETTINGS.baseNightly           // 2600
  // A season covering the nights day(40) .. day(43) inclusive — four nights.
  const withSeason = {
    ...P.DEFAULT_SETTINGS,
    seasons: [{ id: 'x', label: 'Christmas', from: day(40), to: day(43), nightly: 3400 }],
  }

  check('no seasons means the base rate everywhere',
    villaTotal(IN, OUT) === 7 * base, `$${villaTotal(IN, OUT)}`)

  // Wholly outside the season.
  check('a stay before the season is unaffected',
    villaTotal(day(30), day(37), withSeason) === 7 * base)

  // Wholly inside: nights 40,41,42 — three of them, all seasonal.
  check('a stay inside the season pays the season rate',
    villaTotal(day(40), day(43), withSeason) === 3 * 3400,
    `$${villaTotal(day(40), day(43), withSeason)}`)

  // Straddles the start: nights 38,39 base + 40,41 season.
  check('a stay crossing into the season is priced per night',
    villaTotal(day(38), day(42), withSeason) === 2 * base + 2 * 3400,
    `$${villaTotal(day(38), day(42), withSeason)}`)

  // Straddles the end: nights 42,43 season + 44,45 base.
  check('a stay crossing out of the season is priced per night',
    villaTotal(day(42), day(46), withSeason) === 2 * 3400 + 2 * base,
    `$${villaTotal(day(42), day(46), withSeason)}`)

  // The departure date is not a night, so a season starting on it costs nothing.
  const seasonOnDeparture = {
    ...P.DEFAULT_SETTINGS,
    seasons: [{ id: 'y', label: 'Later', from: day(37), to: day(40), nightly: 9000 }],
  }
  check('a season beginning on the departure date does not apply',
    villaTotal(IN, OUT, seasonOnDeparture) === 7 * base,
    `$${villaTotal(IN, OUT, seasonOnDeparture)}`)

  // The season's last night IS charged.
  check('the final night of a season is charged at the season rate',
    villaTotal(day(43), day(44), withSeason) === 3400)

  check('rateForNight reads the season', P.rateForNight(day(41), withSeason) === 3400)
  check('rateForNight falls back to base', P.rateForNight(day(50), withSeason) === base)

  // The breakdown the booking form shows.
  const summary = P.seasonSummary(day(38), day(42), withSeason)
  check('summary groups consecutive nights', summary.length === 2, JSON.stringify(summary))
  check('summary counts each group', summary[0].nights === 2 && summary[1].nights === 2)
  check('summary labels the season', summary[1].season === 'Christmas')

  // A quote uses them end to end. Seven nights (the minimum) spanning the
  // season: 38, 39 base · 40–43 season · 44 base.
  const seasonal = quoteInstalment({ checkIn: day(38), checkOut: day(45), instalment: 'deposit', settings: withSeason })
  check('quoteInstalment prices seasonally',
    seasonal.total === 3 * base + 4 * 3400, `$${seasonal.total}`)

  // baseTotal is for headline copy and must ignore seasons entirely.
  check('baseTotal ignores seasons', baseTotal(7, withSeason) === 7 * base)

  // The whole point of the rate lock, now that rates move seasonally. Booked at
  // the flat rate; a season added afterwards must not change what is owed.
  const locked = quoteInstalment({
    checkIn: day(38), checkOut: day(45), instalment: 'final',
    total: 7 * base, settings: withSeason,
  })
  check('a locked total ignores a season added later',
    locked.total === 7 * base, `$${locked.total}`)
  check('...and the unlocked quote would have been higher',
    seasonal.total > 7 * base, `$${seasonal.total} vs $${7 * base}`)
}

console.log('\n— settings validation —')
{
  const ok = s => S.validateSettings({ ...P.DEFAULT_SETTINGS, ...s }).ok
  check('accepts the defaults', S.validateSettings(P.DEFAULT_SETTINGS).ok)
  check('rejects a zero rate', !ok({ baseNightly: 0 }))
  check('rejects a fractional rate', !ok({ baseNightly: 2600.5 }))
  check('rejects an absurd rate', !ok({ baseNightly: 999999 }))
  check('rejects minNights above maxNights', !ok({ minNights: 40, maxNights: 10 }))
  check('rejects a bad opening date', !ok({ firstAvailableDate: '2026-13-45' }))
  check('rejects a season with no name',
    !ok({ seasons: [{ label: '', from: day(1), to: day(5), nightly: 3000 }] }))
  check('rejects a season ending before it starts',
    !ok({ seasons: [{ label: 'X', from: day(9), to: day(2), nightly: 3000 }] }))
  check('rejects a season with an impossible date',
    !ok({ seasons: [{ label: 'X', from: '2027-02-31', to: day(9), nightly: 3000 }] }))
  check('accepts two seasons that do not touch',
    ok({ seasons: [
      { label: 'A', from: day(1), to: day(5), nightly: 3000 },
      { label: 'B', from: day(6), to: day(9), nightly: 3200 },
    ] }))
  // Ambiguity here would mean whichever season came first silently won.
  check('rejects overlapping seasons',
    !ok({ seasons: [
      { label: 'A', from: day(1), to: day(6), nightly: 3000 },
      { label: 'B', from: day(5), to: day(9), nightly: 3200 },
    ] }))
  check('rejects seasons sharing a single day',
    !ok({ seasons: [
      { label: 'A', from: day(1), to: day(5), nightly: 3000 },
      { label: 'B', from: day(5), to: day(9), nightly: 3200 },
    ] }))

  // Corrupted settings must degrade to the standard rate, never take the site down.
  check('normalise falls back on invalid input',
    S.normaliseSettings({ baseNightly: -1 }).baseNightly === P.DEFAULT_SETTINGS.baseNightly)
  check('normalise sorts seasons by date', (() => {
    const n = S.normaliseSettings({
      ...P.DEFAULT_SETTINGS,
      seasons: [
        { label: 'B', from: day(20), to: day(25), nightly: 3200 },
        { label: 'A', from: day(1), to: day(5), nightly: 3000 },
      ],
    })
    return n.seasons[0].label === 'A'
  })())
  check('normalise drops unknown keys',
    S.normaliseSettings({ ...P.DEFAULT_SETTINGS, sneaky: 1 }).sneaky === undefined)
}

console.log('\n— the refundable incidental deposit —')
{
  const D = P.INCIDENTAL_DEPOSIT
  const villa = P.instalments(18200)
  const payable = P.payableInstalments(18200)

  check('villa split still sums to the total', villa.reduce((a, b) => a + b, 0) === 18200)
  check('only the final instalment carries it',
    payable[0] === villa[0] && payable[1] === villa[1] && payable[2] === villa[2] + D,
    payable.join(' / '))
  check('the guest pays the total plus the deposit',
    payable.reduce((a, b) => a + b, 0) === 18200 + D, `$${payable.reduce((a, b) => a + b, 0)}`)

  // instalments() must stay clean — the deposit is not villa revenue, and the
  // cancellation fee is a percentage of the villa total, not of the deposit.
  check('instalments() is unchanged by the deposit', P.instalments(18200)[2] === villa[2])

  const dep = P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: 'deposit' })
  const sec = P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: 'second' })
  const fin = P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: 'final' })

  check('deposit carries no incidental', dep.incidental === 0 && dep.amount === dep.villaShare)
  check('second carries no incidental', sec.incidental === 0 && sec.amount === sec.villaShare)
  check('final carries exactly one', fin.incidental === D && fin.amount === fin.villaShare + D, `$${fin.amount}`)
  check('final is $7,480 on a 7-night stay', fin.amount === 7480, `$${fin.amount}`)
  check('final amountCents matches', fin.amountCents === 748000, String(fin.amountCents))
  check('villa total excludes the deposit', fin.total === 18200, `$${fin.total}`)

  // The deposit must ride on top of a locked rate, not be swallowed by it.
  const locked = P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: 'final', total: 15400 })
  check('deposit applies to a locked-rate booking too',
    locked.amount === P.instalments(15400)[2] + D, `$${locked.amount}`)
}

console.log('\n— link signing —')
const booking = { checkIn: IN, checkOut: OUT, instalment: 'second', email: 'guest@example.com', total: '18200' }
const sig = signBooking(booking)
check('valid signature accepted', verifyBooking(booking, sig))
check('tampered checkout rejected', !verifyBooking({ ...booking, checkOut: day(33) }, sig))
check('tampered instalment rejected', !verifyBooking({ ...booking, instalment: 'final' }, sig))
check('tampered email rejected', !verifyBooking({ ...booking, email: 'someone@else.com' }, sig))
// The attack the lock creates: edit the agreed total down in the URL.
check('tampered total rejected', !verifyBooking({ ...booking, total: '700' }, sig))
check('removed total rejected', !verifyBooking({ ...booking, total: '' }, sig))
check('missing signature rejected', !verifyBooking(booking, ''))
check('garbage signature rejected', !verifyBooking(booking, 'deadbeef'))
check('truncated signature rejected', !verifyBooking(booking, sig.slice(0, -2)))
process.env.PAYMENT_LINK_SECRET = 'a-different-secret'
check('signature from another secret rejected', !verifyBooking(booking, sig))

console.log(fails ? `\n${fails} FAILURE(S)\n` : '\nall checks passed\n')
process.exit(fails ? 1 : 0)
