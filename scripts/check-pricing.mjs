// Checks on the money maths, availability rules and link signing.
// Run with: npm run check:pricing
process.env.PAYMENT_LINK_SECRET = 'test-secret-for-local-checks'

const P = await import('../shared/pricing.mjs')
const { signBooking, verifyBooking } = await import('../api/_lib.mjs')
const {
  quoteInstalment, instalments, villaTotal, nightsBetween, validateStay,
  earliestArrival, toISODate, MIN_NIGHTS, MAX_NIGHTS,
} = P

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
check('40% = $7,280', q[2].amount === 7280, `got ${q[2].amount}`)
check('parts sum to total', q[0].amount + q[1].amount + q[2].amount === 18200)
check('cents for Stripe', q[0].amountCents === 455000, `got ${q[0].amountCents}`)
const long = quoteInstalment({ checkIn: IN, checkOut: OUT_LONG, instalment: 'deposit' })
check('14 nights = $36,400 total', long.total === 36400, `got ${long.total}`)

console.log('\n— no rounding leak across every allowed length —')
let bad = null
for (let n = MIN_NIGHTS; n <= MAX_NIGHTS; n++) {
  const t = villaTotal(n)
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
    .map(id => P.quoteInstalment({ checkIn: IN, checkOut: OUT, instalment: id, total: agreed }).amount)
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
