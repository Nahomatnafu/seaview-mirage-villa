/**
 * Integration check against the real Stripe test sandbox.
 * Creates test-mode Checkout Sessions and reads them back, to confirm the
 * amount Stripe records is the amount our pricing module intends — and that
 * the endpoint refuses everything it should.
 *
 * Test mode only; no real money can move. Run with: npm run check:stripe
 */
import fs from 'node:fs'
import path from 'node:path'

// Minimal .env.local loader — no dependency needed.
const envPath = path.resolve('.env.local')
if (!fs.existsSync(envPath)) {
  console.error('No .env.local found. Copy .env.example and fill in your Stripe TEST keys.')
  process.exit(1)
}
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i > 0) process.env[t.slice(0, i).trim()] ??= t.slice(i + 1).trim()
}

const key = process.env.STRIPE_SECRET_KEY || ''
if (!key.startsWith('sk_test_')) {
  console.error(`Refusing to run: STRIPE_SECRET_KEY is not a test key (starts "${key.slice(0, 8)}").`)
  console.error('These checks create real sessions — only ever point them at test mode.')
  process.exit(1)
}

const { default: handler } = await import('../api/create-checkout-session.mjs')
const { earliestArrival, toISODate, money } = await import('../shared/pricing.mjs')
const { signBooking } = await import('../api/_lib.mjs')
const Stripe = (await import('stripe')).default
const stripe = new Stripe(key)

const open = earliestArrival()
const day = n => { const d = new Date(open); d.setDate(d.getDate() + n); return toISODate(d) }

let fails = 0
const check = (name, cond, detail = '') => {
  if (!cond) { fails++; console.log(`  FAIL  ${name} ${detail}`) }
  else console.log(`  ok    ${name} ${detail}`)
}

// Mock the Vercel (req, res) pair.
const call = async body => {
  const req = { method: 'POST', body, headers: { host: 'localhost:5173', 'x-forwarded-proto': 'http' } }
  let status = 0, payload = null
  const res = {
    status(s) { status = s; return res },
    setHeader() { return res },
    end(text) { payload = JSON.parse(text) },
  }
  await handler(req, res)
  return { status, body: payload }
}

// Unique per run, so repeated runs are genuinely new requests rather than
// replays of an earlier one.
const stamp = Date.now().toString(36)

console.log('\n— a real session gets the right amount —')
const ok = await call({
  checkIn: day(30), checkOut: day(37), instalment: 'deposit',
  email: `test-${stamp}@example.com`, name: 'Test Guest',
})
check('returns 200', ok.status === 200, `got ${ok.status} ${ok.body?.error || ''}`)
check('returns a Stripe URL', /^https:\/\/checkout\.stripe\.com/.test(ok.body?.url || ''), ok.body?.url?.slice(0, 40))

if (ok.body?.url) {
  const sessions = await stripe.checkout.sessions.list({ limit: 1 })
  const s = sessions.data[0]
  check('Stripe amount is $4,550', s.amount_total === 455000, `Stripe says ${money((s.amount_total || 0) / 100)}`)
  check('currency is USD', s.currency === 'usd', s.currency)
  check('metadata carries the stay', s.metadata?.nights === '7' && s.metadata?.villaTotal === '18200',
    `nights=${s.metadata?.nights} total=${s.metadata?.villaTotal}`)
  check('customer email set', s.customer_email === `test-${stamp}@example.com`)

  // Same request twice must not create two sessions; a changed detail must.
  const again = await call({
    checkIn: day(30), checkOut: day(37), instalment: 'deposit',
    email: `test-${stamp}@example.com`, name: 'Test Guest',
  })
  check('identical retry is deduped', again.status === 200 && again.body.url === ok.body.url)

  const changed = await call({
    checkIn: day(30), checkOut: day(37), instalment: 'deposit',
    email: `test-${stamp}@example.com`, name: 'Test Guest', phone: '+1 555 0000',
  })
  check('changed detail still allowed to pay', changed.status === 200 && changed.body.url !== ok.body.url,
    changed.status === 200 ? '' : `got ${changed.status} ${changed.body?.error || ''}`)
}

console.log('\n— the endpoint refuses what it should —')
const cases = [
  ['ignores a price sent by the client', { checkIn: day(30), checkOut: day(37), instalment: 'deposit', email: `a-${stamp}@example.com`, amount: 1, amountCents: 1, total: 1 }, 200],
  ['rejects dates before the villa reopens', { checkIn: '2026-09-01', checkOut: '2026-09-10', instalment: 'deposit', email: `a-${stamp}@example.com` }, 400],
  ['rejects under the minimum stay', { checkIn: day(30), checkOut: day(35), instalment: 'deposit', email: `a-${stamp}@example.com` }, 400],
  ['rejects an absurd length', { checkIn: day(30), checkOut: day(400), instalment: 'deposit', email: `a-${stamp}@example.com` }, 400],
  ['rejects a bad email', { checkIn: day(30), checkOut: day(37), instalment: 'deposit', email: 'not-an-email' }, 400],
  ['rejects an unknown instalment', { checkIn: day(30), checkOut: day(37), instalment: 'fourth', email: `a-${stamp}@example.com` }, 400],
  ['rejects unsigned second instalment', { checkIn: day(30), checkOut: day(37), instalment: 'second', email: `a-${stamp}@example.com` }, 403],
  ['rejects a forged signature', { checkIn: day(30), checkOut: day(37), instalment: 'final', email: `a-${stamp}@example.com`, total: '18200', sig: 'deadbeef' }, 403],
  // Instalments 2 and 3 must carry the price agreed at booking. Without it the
  // endpoint would have to recompute at today's rate, which is the bug.
  ['rejects a later instalment with no agreed total', { checkIn: day(30), checkOut: day(37), instalment: 'final', email: `a-${stamp}@example.com`, sig: signBooking({ checkIn: day(30), checkOut: day(37), instalment: 'final', email: `a-${stamp}@example.com`, total: '' }) }, 403],
]
for (const [name, body, want] of cases) {
  const r = await call(body)
  check(name, r.status === want, `expected ${want}, got ${r.status}`)
}

// A price injected by the client must be ignored, not honoured.
const injected = await call({
  checkIn: day(60), checkOut: day(67), instalment: 'deposit',
  email: `inject-${stamp}@example.com`, amountCents: 1, unit_amount: 1,
})
if (injected.status === 200) {
  const s = (await stripe.checkout.sessions.list({ limit: 1 })).data[0]
  check('injected price ignored — still $4,550', s.amount_total === 455000, `Stripe says ${money((s.amount_total || 0) / 100)}`)
}

console.log('\n— a villa-signed link works —')
const signed = { checkIn: day(30), checkOut: day(37), instalment: 'final', email: `signed-${stamp}@example.com`, total: '18200' }
const r = await call({ ...signed, sig: signBooking(signed) })
check('signed final instalment accepted', r.status === 200, `got ${r.status} ${r.body?.error || ''}`)
if (r.status === 200) {
  const s = (await stripe.checkout.sessions.list({ limit: 1 })).data[0]
  // 40% of $18,200 = $7,280, plus the $200 refundable incidental deposit.
  check('final instalment is $7,480', s.amount_total === 748000, `Stripe says ${money((s.amount_total || 0) / 100)}`)
  check('the deposit is split out in metadata',
    s.metadata?.villaShare === '7280' && s.metadata?.incidentalDeposit === '200',
    `villaShare=${s.metadata?.villaShare} incidental=${s.metadata?.incidentalDeposit}`)
}

console.log('\n— a rate change cannot reprice an existing booking —')
{
  // A guest who booked 7 nights when the rate was $2,200 agreed $15,400. Today
  // the rate is $2,600, so recomputing would bill them 40% of $18,200 = $7,280.
  // The agreed total must win: 40% of $15,400 = $6,160, plus the $200 deposit.
  const old = { checkIn: day(30), checkOut: day(37), instalment: 'final', email: `locked-${stamp}@example.com`, total: '15400' }
  const res = await call({ ...old, sig: signBooking(old) })
  check('a booking at the old rate is accepted', res.status === 200, `got ${res.status} ${res.body?.error || ''}`)
  if (res.status === 200) {
    const s = (await stripe.checkout.sessions.list({ limit: 1 })).data[0]
    check('charged $6,360, not $7,480', s.amount_total === 636000, `Stripe says ${money((s.amount_total || 0) / 100)}`)
    check('the deposit rides on top of the locked rate',
      s.metadata?.villaShare === '6160' && s.metadata?.incidentalDeposit === '200',
      `villaShare=${s.metadata?.villaShare}`)
    check('metadata records the agreed total', s.metadata?.villaTotal === '15400', s.metadata?.villaTotal)
    check('metadata flags the locked rate', s.metadata?.rateLocked === 'yes', s.metadata?.rateLocked)
  }

  // Editing the agreed total down in the URL must not survive the signature.
  const edited = await call({ ...old, total: '7000', sig: signBooking(old) })
  check('an edited total is refused', edited.status === 403, `got ${edited.status}`)
}

console.log(fails ? `\n${fails} FAILURE(S)\n` : '\nall Stripe checks passed\n')
process.exit(fails ? 1 : 0)
