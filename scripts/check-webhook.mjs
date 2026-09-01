/**
 * Offline check of the Stripe webhook handler.
 *
 * Stripe's SDK can produce genuine signature headers, so everything the live
 * endpoint does can be exercised here: raw-body reading, signature
 * verification, replay rejection and event routing. What this cannot prove is
 * that Vercel actually honours `bodyParser: false` in production — only a real
 * deploy shows that, and it is the single reason to still do the preview test.
 *
 * Nothing here talks to Stripe over the network. Run with: npm run check:webhook
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { Readable } from 'node:stream'

// Same minimal .env.local loader the other checks use.
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
  process.exit(1)
}

// The real signing secret is issued by Stripe when the endpoint is created, so
// it may not exist yet. Signing and verifying both happen in this process, so a
// throwaway secret proves the same thing — and never touching the real one
// means this check cannot be affected by whatever is in .env.local.
const SECRET = `whsec_${crypto.randomBytes(24).toString('hex')}`
process.env.STRIPE_WEBHOOK_SECRET = SECRET

const Stripe = (await import('stripe')).default
const stripe = new Stripe(key)
const { default: handler } = await import('../api/stripe-webhook.mjs')

let fails = 0
const check = (name, cond, detail = '') => {
  if (!cond) { fails++; console.log(`  FAIL  ${name} ${detail}`) }
  else console.log(`  ok    ${name} ${detail}`)
}

/** Call the handler with a body and headers, capturing status, JSON and logs. */
const call = async (payload, headers, method = 'POST') => {
  const buf = Buffer.from(payload, 'utf8')
  const req = Object.assign(Readable.from([buf]), { method, headers })

  let status = 0, body = null
  const res = {
    status(s) { status = s; return res },
    setHeader() { return res },
    end(text) { body = JSON.parse(text) },
  }

  // Capture what the handler logs — the log line IS the audit trail today, so
  // its contents are worth asserting on.
  const logs = []
  const realLog = console.log, realErr = console.error
  console.log = (...a) => logs.push(a)
  console.error = () => {}
  try { await handler(req, res) } finally { console.log = realLog; console.error = realErr }

  return { status, body, logs }
}

const sign = (payload, secret = SECRET, timestamp) =>
  stripe.webhooks.generateTestHeaderString({ payload, secret, timestamp })

const event = (type, object) => JSON.stringify({
  id: `evt_${crypto.randomBytes(8).toString('hex')}`,
  object: 'event',
  type,
  created: Math.floor(Date.now() / 1000),
  data: { object },
})

const paidSession = {
  id: 'cs_test_localcheck',
  object: 'checkout.session',
  amount_total: 455000,
  currency: 'usd',
  customer_details: { email: 'guest@example.com' },
  metadata: {
    guestName: 'Test Guest',
    instalment: 'deposit',
    instalmentLabel: 'To reserve',
    checkIn: '2026-12-10',
    checkOut: '2026-12-17',
    nights: '7',
    villaTotal: '18200',
  },
}

console.log('\n— a genuine Stripe event is accepted —')
{
  const payload = event('checkout.session.completed', paidSession)
  const r = await call(payload, { 'stripe-signature': sign(payload) })
  check('returns 200', r.status === 200, `got ${r.status} ${r.body?.error || ''}`)
  check('acknowledges receipt', r.body?.received === true)

  const paid = r.logs.find(l => l[0] === 'PAID')
  check('logs the payment', !!paid)
  if (paid) {
    const d = paid[1]
    check('logged amount is $4,550', d.amount === 4550, `logged ${d.amount}`)
    check('logged stay is right', d.stay === '2026-12-10 to 2026-12-17 (7 nights)', d.stay)
    check('logged guest email', d.email === 'guest@example.com', d.email)
    check('logged instalment label', d.instalment === 'To reserve', d.instalment)
  }
}

console.log('\n— forged and tampered events are refused —')
{
  const payload = event('checkout.session.completed', paidSession)
  const goodSig = sign(payload)

  const cases = [
    ['no signature header', payload, {}],
    ['empty signature', payload, { 'stripe-signature': '' }],
    ['garbage signature', payload, { 'stripe-signature': 't=1,v1=deadbeef' }],
    ['signature from another secret', payload,
      { 'stripe-signature': sign(payload, `whsec_${crypto.randomBytes(24).toString('hex')}`) }],
    // The classic attack: keep a valid signature, swap the amount underneath it.
    ['body altered after signing',
      payload.replace('455000', '100'), { 'stripe-signature': goodSig }],
    // Stripe's default tolerance is 5 minutes; an hour-old replay must fail.
    ['replayed an hour late', payload,
      { 'stripe-signature': sign(payload, SECRET, Math.floor(Date.now() / 1000) - 3600) }],
  ]

  for (const [name, body, headers] of cases) {
    const r = await call(body, headers)
    check(name + ' rejected', r.status === 400, `got ${r.status}`)
    check(name + ' logged nothing as paid', !r.logs.some(l => l[0] === 'PAID'))
  }
}

console.log('\n— other event types are handled, not crashed on —')
{
  const expired = event('checkout.session.expired', { id: 'cs_test_expired' })
  const r1 = await call(expired, { 'stripe-signature': sign(expired) })
  check('expired session returns 200', r1.status === 200, `got ${r1.status}`)

  const refund = event('charge.refunded', { id: 'ch_test_refund', amount_refunded: 455000 })
  const r2 = await call(refund, { 'stripe-signature': sign(refund) })
  check('refund returns 200', r2.status === 200, `got ${r2.status}`)
  check('refund amount logged', r2.logs.some(l => l[0] === 'REFUNDED' && l[2] === 4550))

  // Stripe sends event types we never subscribed to; a 4xx/5xx here would make
  // it retry forever and eventually disable the endpoint.
  const unknown = event('invoice.payment_succeeded', { id: 'in_test' })
  const r3 = await call(unknown, { 'stripe-signature': sign(unknown) })
  check('unknown event acknowledged', r3.status === 200, `got ${r3.status}`)

  // A payment with no metadata must not throw — old or dashboard-made sessions
  // will not have ours.
  const bare = event('checkout.session.completed', { id: 'cs_test_bare', amount_total: 455000, currency: 'usd' })
  const r4 = await call(bare, { 'stripe-signature': sign(bare) })
  check('session without metadata survives', r4.status === 200, `got ${r4.status}`)
}

console.log('\n— method guard —')
{
  const payload = event('checkout.session.completed', paidSession)
  const r = await call(payload, { 'stripe-signature': sign(payload) }, 'GET')
  check('GET is refused', r.status === 405, `got ${r.status}`)
}

console.log(fails ? `\n${fails} FAILURE(S)\n` : '\nall webhook checks passed\n')
process.exit(fails ? 1 : 0)
