// Sanity checks on the money maths and link signing, before any real key exists.
process.env.PAYMENT_LINK_SECRET = 'test-secret-for-local-checks'

const { quoteInstalment, instalments, villaTotal, nightsBetween, PAYMENT_SCHEDULE } =
  await import('../shared/pricing.mjs')
const { signBooking, verifyBooking } = await import('../api/_lib.mjs')

let fails = 0
const check = (name, cond, detail = '') => {
  if (!cond) { fails++; console.log(`  FAIL  ${name} ${detail}`) }
  else console.log(`  ok    ${name} ${detail}`)
}

console.log('\n— amounts —')
const q = ['deposit', 'second', 'final'].map(id =>
  quoteInstalment({ checkIn: '2026-11-10', checkOut: '2026-11-17', instalment: id }))
check('7 nights', q[0].nights === 7)
check('total is $18,200', q[0].total === 18200, `got ${q[0].total}`)
check('25% = $4,550', q[0].amount === 4550, `got ${q[0].amount}`)
check('35% = $6,370', q[1].amount === 6370, `got ${q[1].amount}`)
check('40% = $7,280', q[2].amount === 7280, `got ${q[2].amount}`)
check('parts sum to total', q[0].amount + q[1].amount + q[2].amount === 18200)
check('cents for Stripe', q[0].amountCents === 455000, `got ${q[0].amountCents}`)

console.log('\n— no rounding leak across many stay lengths —')
let worst = null
for (let n = 7; n <= 120; n++) {
  const t = villaTotal(n)
  const sum = instalments(t).reduce((a, b) => a + b, 0)
  if (sum !== t) worst = { n, t, sum }
}
check('every length 7..120 sums exactly', worst === null, worst ? JSON.stringify(worst) : '')

console.log('\n— input validation —')
const throws = fn => { try { fn(); return false } catch { return true } }
check('rejects 6 nights', throws(() => quoteInstalment({ checkIn: '2026-11-10', checkOut: '2026-11-16', instalment: 'deposit' })))
check('rejects reversed dates', throws(() => quoteInstalment({ checkIn: '2026-11-17', checkOut: '2026-11-10', instalment: 'deposit' })))
check('rejects same day', throws(() => quoteInstalment({ checkIn: '2026-11-10', checkOut: '2026-11-10', instalment: 'deposit' })))
check('rejects junk date', throws(() => quoteInstalment({ checkIn: 'tomorrow', checkOut: '2026-11-17', instalment: 'deposit' })))
check('rejects missing date', throws(() => quoteInstalment({ checkIn: '', checkOut: '2026-11-17', instalment: 'deposit' })))
check('rejects unknown instalment', throws(() => quoteInstalment({ checkIn: '2026-11-10', checkOut: '2026-11-17', instalment: 'fourth' })))
check('rejects SQL-ish junk', throws(() => quoteInstalment({ checkIn: "2026-11-10' OR 1=1", checkOut: '2026-11-17', instalment: 'deposit' })))
check('no timezone off-by-one', nightsBetween('2026-03-08', '2026-03-15') === 7, `got ${nightsBetween('2026-03-08', '2026-03-15')}`)

console.log('\n— link signing —')
const booking = { checkIn: '2026-11-10', checkOut: '2026-11-17', instalment: 'deposit', email: 'guest@example.com' }
const sig = signBooking(booking)
check('valid signature accepted', verifyBooking(booking, sig))
check('tampered checkout rejected', !verifyBooking({ ...booking, checkOut: '2026-11-12' }, sig))
check('tampered instalment rejected', !verifyBooking({ ...booking, instalment: 'final' }, sig))
check('tampered email rejected', !verifyBooking({ ...booking, email: 'someone@else.com' }, sig))
check('missing signature rejected', !verifyBooking(booking, ''))
check('garbage signature rejected', !verifyBooking(booking, 'deadbeef'))
check('wrong-length signature rejected', !verifyBooking(booking, sig.slice(0, -2)))
process.env.PAYMENT_LINK_SECRET = 'a-different-secret'
check('signature from another secret rejected', !verifyBooking(booking, sig))

console.log(fails ? `\n${fails} FAILURE(S)\n` : '\nall checks passed\n')
process.exit(fails ? 1 : 0)
