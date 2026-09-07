/**
 * Instalments 2 and 3, against the real Stripe TEST sandbox.
 *
 * Creates genuine draft-then-finalised invoices, so it proves the amounts
 * Stripe records rather than the amounts we intended. Test mode only.
 *
 * Run with: npm run check:invoices
 */
import fs from 'node:fs'
import path from 'node:path'

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

const { createInstalmentInvoices } = await import('../api/_invoices.mjs')
const P = await import('../shared/pricing.mjs')
const { toISODate, earliestArrival, money } = P
const Stripe = (await import('stripe')).default
const stripe = new Stripe(key)

let fails = 0
const check = (name, cond, detail = '') => {
  if (!cond) { fails++; console.log(`  FAIL  ${name} ${detail}`) }
  else console.log(`  ok    ${name} ${detail}`)
}

const open = earliestArrival()
const day = n => { const d = new Date(open); d.setDate(d.getDate() + n); return toISODate(d) }
const stamp = Date.now().toString(36)

console.log('\n— a deposit raises the two remaining invoices —')
const sessionId = `cs_test_fake_${stamp}`
const email = `invoice-${stamp}@example.com`
const VILLA_TOTAL = 18200

const created = await createInstalmentInvoices({
  sessionId,
  email,
  name: 'Invoice Test',
  checkIn: day(60),
  checkOut: day(67),
  villaTotal: VILLA_TOTAL,
  settings: P.DEFAULT_SETTINGS,
})

check('raises exactly two', created.length === 2, `got ${created.length}`)
const second = created.find(c => c.instalment === 'second')
const final = created.find(c => c.instalment === 'final')

check('second is $6,370', second?.amount === 6370, `got ${money(second?.amount ?? 0)}`)
// 40% of 18,200 is 7,280, plus the refundable $200.
check('final is $7,480 including the deposit', final?.amount === 7480, `got ${money(final?.amount ?? 0)}`)
check('the two invoices plus the deposit equal the total plus the deposit',
  4550 + (second?.amount ?? 0) + (final?.amount ?? 0) === VILLA_TOTAL + P.INCIDENTAL_DEPOSIT)

console.log('\n— what Stripe actually recorded —')
for (const c of created) {
  const inv = await stripe.invoices.retrieve(c.invoiceId)
  check(`${c.instalment}: Stripe agrees on the amount`,
    inv.amount_due === Math.round(c.amount * 100),
    `Stripe says ${money(inv.amount_due / 100)}`)
  check(`${c.instalment}: is an invoice to send, not an auto-charge`,
    inv.collection_method === 'send_invoice', inv.collection_method)
  check(`${c.instalment}: has a due date`, Boolean(inv.due_date))
  check(`${c.instalment}: is open and payable`, inv.status === 'open', inv.status)
  check(`${c.instalment}: carries the booking id`,
    inv.metadata?.bookingSessionId === sessionId)
  check(`${c.instalment}: is not in test livemode`, inv.livemode === false)
}

console.log('\n— due dates —')
const secondInv = await stripe.invoices.retrieve(second.invoiceId)
const finalInv = await stripe.invoices.retrieve(final.invoiceId)
const days = ts => Math.round((ts * 1000 - Date.now()) / 86400000)
const dueISO = inv => new Date(inv.due_date * 1000).toISOString().slice(0, 10)

check('second is due in about a month', days(secondInv.due_date) >= 28 && days(secondInv.due_date) <= 31,
  `${days(secondInv.due_date)} days`)
// Measured against arrival, not today: day(60) is 60 days after the villa
// reopens, which is a long way off while the opening date is still in future.
const arrival = day(60)
const gap = Math.round((new Date(arrival) - new Date(dueISO(finalInv))) / 86400000)
check('final falls due 25 days before arrival', gap === 25, `${gap} days before ${arrival}`)
check('neither is due in the past', days(secondInv.due_date) > 0 && days(finalInv.due_date) > 0)

console.log('\n— a late booking still gets a payable due date —')
{
  // Arriving in 10 real days: 25 days before that is in the past, so the floor
  // must kick in rather than billing something already overdue. Needs an
  // opening date behind us, or validateStay would refuse the dates first.
  const openNow = { ...P.DEFAULT_SETTINGS, firstAvailableDate: '2020-01-01' }
  const soon = n => { const d = new Date(); d.setDate(d.getDate() + n); return toISODate(d) }
  const lateId = `cs_test_late_${stamp}`
  const late = await createInstalmentInvoices({
    sessionId: lateId,
    email: `late-${stamp}@example.com`,
    name: 'Late Booking',
    checkIn: soon(10), checkOut: soon(17),
    villaTotal: VILLA_TOTAL,
    settings: openNow,
  })
  const lateFinal = await stripe.invoices.retrieve(late.find(c => c.instalment === 'final').invoiceId)
  // Would have been 15 days in the PAST without the floor.
  check('the final instalment is not already overdue', days(lateFinal.due_date) >= 2,
    `${days(lateFinal.due_date)} days`)
  check('...and it is the floor that saved it, not luck', days(lateFinal.due_date) <= 4,
    `${days(lateFinal.due_date)} days`)
}

console.log('\n— a repeated webhook does not bill twice —')
{
  const again = await createInstalmentInvoices({
    sessionId, email, name: 'Invoice Test',
    checkIn: day(60), checkOut: day(67),
    villaTotal: VILLA_TOTAL,
    settings: P.DEFAULT_SETTINGS,
  })
  check('the same invoice ids come back',
    again.find(c => c.instalment === 'second')?.invoiceId === second.invoiceId &&
    again.find(c => c.instalment === 'final')?.invoiceId === final.invoiceId)

  const customers = await stripe.customers.list({ email, limit: 1 })
  const all = await stripe.invoices.list({ customer: customers.data[0].id, limit: 50 })
  const mine = all.data.filter(i => i.metadata?.bookingSessionId === sessionId)
  check('only two invoices exist for the booking', mine.length === 2, `found ${mine.length}`)
}

console.log('\n— a rate change cannot move an existing booking —')
{
  // The villa doubles its rate after this guest booked. The invoices must be
  // quoted from the agreed total, not from what the stay would cost today.
  const dearer = { ...P.DEFAULT_SETTINGS, baseNightly: 5200 }
  const lockedId = `cs_test_locked_${stamp}`
  const locked = await createInstalmentInvoices({
    sessionId: lockedId,
    email: `locked-${stamp}@example.com`,
    name: 'Locked Rate',
    checkIn: day(70), checkOut: day(77),
    villaTotal: VILLA_TOTAL,          // agreed at the old rate
    settings: dearer,
  })
  check('second still $6,370 at the agreed rate',
    locked.find(c => c.instalment === 'second')?.amount === 6370,
    money(locked.find(c => c.instalment === 'second')?.amount ?? 0))
  check('final still $7,480 at the agreed rate',
    locked.find(c => c.instalment === 'final')?.amount === 7480,
    money(locked.find(c => c.instalment === 'final')?.amount ?? 0))
}

console.log(fails ? `\n${fails} FAILURE(S)\n` : '\nall invoice checks passed\n')
process.exit(fails ? 1 : 0)
