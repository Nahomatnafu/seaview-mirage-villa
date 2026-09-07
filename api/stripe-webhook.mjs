import Stripe from 'stripe'
import { rawBody, requireEnv, json } from './_lib.mjs'
import { createInstalmentInvoices } from './_invoices.mjs'
import { readSettings } from './_store.mjs'
import { clearAvailabilityCache } from './_availability.mjs'

// Stripe signs the exact bytes it sent. Vercel's default JSON parsing would
// rewrite them and every signature check would fail, so it is switched off.
export const config = { api: { bodyParser: false } }

/**
 * Receives Stripe events.
 *
 * Verification is not optional — without it anyone who finds this URL could
 * POST a fake "payment succeeded" event.
 *
 * This handler writes nothing to blob storage. Availability is derived from
 * paid Stripe sessions when it is read, which keeps the admin dashboard the
 * only writer and removes any race between a payment landing and the villa
 * editing something.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  let event
  try {
    const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'))
    const body = await rawBody(req)
    event = stripe.webhooks.constructEvent(
      body,
      req.headers['stripe-signature'],
      requireEnv('STRIPE_WEBHOOK_SECRET'),
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return json(res, 400, { error: 'Invalid signature' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object
        const m = s.metadata || {}
        console.log('PAID', {
          sessionId: s.id,
          amount: (s.amount_total ?? 0) / 100,
          currency: s.currency,
          email: s.customer_details?.email,
          guestName: m.guestName,
          instalment: m.instalmentLabel || m.instalment,
          stay: `${m.checkIn} to ${m.checkOut} (${m.nights} nights)`,
          villaTotal: m.villaTotal,
        })

        // The week is now taken; stop serving a cached availability list that
        // still shows it free.
        clearAvailabilityCache()

        // A deposit starts the payment schedule. Instalments 2 and 3 become
        // invoices with due dates, billed against the total agreed today.
        if ((m.instalment || 'deposit') === 'deposit') {
          await raiseInvoices(s, m)
        }
        break
      }

      case 'checkout.session.expired':
        console.log('EXPIRED', event.data.object.id)
        break

      case 'charge.refunded':
        console.log('REFUNDED', event.data.object.id, (event.data.object.amount_refunded ?? 0) / 100)
        // A refunded booking may mean the villa declined it, so the week could
        // be back on sale.
        clearAvailabilityCache()
        break

      case 'invoice.paid': {
        const i = event.data.object
        console.log('INVOICE PAID', {
          invoiceId: i.id,
          instalment: i.metadata?.instalment,
          amount: (i.amount_paid ?? 0) / 100,
          booking: i.metadata?.bookingSessionId,
        })
        break
      }

      case 'invoice.payment_failed': {
        const i = event.data.object
        // Worth noticing: the guest's card was declined and the villa needs to
        // chase. Stripe keeps retrying, but nobody watches Stripe.
        console.error('INVOICE FAILED', {
          invoiceId: i.id,
          instalment: i.metadata?.instalment,
          booking: i.metadata?.bookingSessionId,
          url: i.hosted_invoice_url,
        })
        break
      }

      default:
        console.log('Unhandled Stripe event:', event.type)
    }
  } catch (err) {
    // Returning 500 makes Stripe retry, which is what we want if our own
    // handling broke — the payment itself already succeeded.
    console.error('Webhook handling failed:', err)
    return json(res, 500, { error: 'Handler error' })
  }

  return json(res, 200, { received: true })
}

/**
 * Raise the two remaining invoices.
 *
 * Failures here are logged but never fail the webhook. The deposit has been
 * taken and the booking is real; telling Stripe to retry would mean re-running
 * a handler that already logged the payment, and the invoices can be raised by
 * hand from the dashboard. The idempotency keys make a retry safe either way.
 */
async function raiseInvoices(session, m) {
  const email = session.customer_details?.email || session.customer_email
  const villaTotal = Number(m.villaTotal)

  if (!email || !Number.isFinite(villaTotal) || !m.checkIn || !m.checkOut) {
    console.error('Cannot invoice — booking is missing details:', {
      sessionId: session.id, email: Boolean(email), villaTotal: m.villaTotal,
    })
    return
  }

  try {
    const settings = await readSettings()
    const created = await createInstalmentInvoices({
      sessionId: session.id,
      email,
      name: m.guestName || session.customer_details?.name,
      checkIn: m.checkIn,
      checkOut: m.checkOut,
      villaTotal,
      settings,
    })
    console.log('INVOICES RAISED', session.id, created.map(c => `${c.instalment} ${c.amount} due ${c.due}`))
  } catch (err) {
    console.error('Could not raise instalment invoices for', session.id, err.message)
  }
}
