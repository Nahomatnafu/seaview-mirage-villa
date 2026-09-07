import Stripe from 'stripe'
import { quoteInstalment, PAYMENT_SCHEDULE, money } from '../shared/pricing.mjs'
import { parseDay, todayStart, nightsBetween } from '../shared/dates.mjs'

/**
 * Instalments 2 and 3, as Stripe invoices with a due date.
 *
 * Chosen over charging a saved card automatically for two reasons. A card
 * charged weeks later fails often — expiry, 3-D Secure, a bank declining an
 * unexpected amount — so the invoice path has to exist as a fallback anyway.
 * And a surprise $6,370 charge is a chargeback waiting to happen, where an
 * invoice with a due date and Stripe's own reminders is not.
 *
 * Switching to `charge_automatically` later reuses these same invoices.
 */

// Nobody should be invoiced for something due yesterday. A booking made three
// weeks before arrival would otherwise produce a due date in the past, which
// Stripe treats as immediately overdue.
const MIN_DAYS_TO_PAY = 3

const SECOND_DUE_DAYS_AFTER_BOOKING = 30
const FINAL_DUE_DAYS_BEFORE_ARRIVAL = 25

const iso = d => Math.floor(d.getTime() / 1000)

/** A due date at least MIN_DAYS_TO_PAY away, whatever the schedule says. */
function dueDate(preferred) {
  const floor = todayStart()
  floor.setDate(floor.getDate() + MIN_DAYS_TO_PAY)
  return preferred && preferred > floor ? preferred : floor
}

function secondDue() {
  const d = todayStart()
  d.setDate(d.getDate() + SECOND_DUE_DAYS_AFTER_BOOKING)
  return dueDate(d)
}

function finalDue(checkIn) {
  const arrival = parseDay(checkIn)
  if (!arrival) return dueDate(null)
  const d = new Date(arrival)
  d.setDate(d.getDate() - FINAL_DUE_DAYS_BEFORE_ARRIVAL)
  return dueDate(d)
}

/**
 * Creates the two outstanding invoices for a booking whose deposit just landed.
 *
 * Amounts come from the total agreed at booking — passed in, never recomputed
 * from today's rates. The deposit's Stripe metadata carries it.
 *
 * Idempotent per booking and instalment: a webhook retry, or two events for the
 * same session, cannot produce a second invoice.
 */
export async function createInstalmentInvoices({
  sessionId, email, name, checkIn, checkOut, villaTotal, settings,
}) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  if (!email) throw new Error('No email on the booking, cannot invoice')

  const stripe = new Stripe(key)
  const nights = nightsBetween(checkIn, checkOut)
  const created = []

  const customer = await findOrCreateCustomer(stripe, email, name)

  for (const schedule of PAYMENT_SCHEDULE.slice(1)) {
    // The lock: quote against the agreed total, so a rate change between
    // booking and payment cannot move what this guest owes.
    const quote = quoteInstalment({
      checkIn, checkOut, instalment: schedule.id, total: villaTotal, settings,
    })

    const due = schedule.id === 'final' ? finalDue(checkIn) : secondDue()

    // One key per booking per instalment. Stripe returns the original object
    // for a repeated key, so a retried webhook is a no-op rather than a second
    // bill for the same money.
    const idem = `${sessionId}:${schedule.id}`

    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      due_date: iso(due),
      // Stripe emails the reminders itself once they are enabled in
      // Settings → Billing → Automatic collection. No scheduler to maintain.
      description:
        `${schedule.label} — ${nights} nights at Sea View Mirage Villa, ` +
        `${checkIn} to ${checkOut}. ${Math.round(schedule.pct * 100)}% of ${money(villaTotal)}` +
        (quote.incidental ? `, plus a ${money(quote.incidental)} refundable incidental deposit` : '') + '.',
      metadata: {
        bookingSessionId: sessionId,
        instalment: schedule.id,
        checkIn, checkOut,
        nights: String(nights),
        villaTotal: String(villaTotal),
        villaShare: String(quote.villaShare),
        incidentalDeposit: String(quote.incidental),
      },
      auto_advance: false,
    }, { idempotencyKey: `${idem}:invoice` })

    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      currency: quote.currency,
      amount: quote.amountCents,
      description: quote.incidental
        ? `${schedule.label} (includes ${money(quote.incidental)} refundable deposit)`
        : schedule.label,
    }, { idempotencyKey: `${idem}:item` })

    // Finalising is what turns a draft into something the guest can pay.
    const finalised = await stripe.invoices.finalizeInvoice(invoice.id, undefined, {
      idempotencyKey: `${idem}:finalize`,
    })
    await stripe.invoices.sendInvoice(finalised.id, undefined, {
      idempotencyKey: `${idem}:send`,
    })

    created.push({
      instalment: schedule.id,
      invoiceId: finalised.id,
      amount: quote.amount,
      due: due.toISOString().slice(0, 10),
      url: finalised.hosted_invoice_url,
    })
  }

  return created
}

/** Reuse the guest's customer record if Stripe already has one for this email. */
async function findOrCreateCustomer(stripe, email, name) {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length) return existing.data[0]
  return stripe.customers.create({ email, name: name || undefined })
}

/**
 * Every invoice raised against a booking, for the dashboard.
 *
 * Listed by customer and filtered here rather than through `invoices.search`.
 * Search is eventually consistent — it returns nothing for up to a minute after
 * an invoice is created — so a villa looking at a booking they just took would
 * be told there were no invoices. Listing is immediately consistent.
 */
export async function invoicesForBooking(sessionId, email) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || !sessionId || !email) return []

  const stripe = new Stripe(key)
  const customers = await stripe.customers.list({ email, limit: 1 })
  if (!customers.data.length) return []

  const res = await stripe.invoices.list({ customer: customers.data[0].id, limit: 50 })
  return res.data
    .filter(i => i.metadata?.bookingSessionId === sessionId)
    .map(i => ({
      invoiceId: i.id,
      instalment: i.metadata?.instalment || '',
      amount: (i.amount_due ?? 0) / 100,
      paid: i.status === 'paid',
      status: i.status,
      due: i.due_date ? new Date(i.due_date * 1000).toISOString().slice(0, 10) : null,
      url: i.hosted_invoice_url,
    }))
}
