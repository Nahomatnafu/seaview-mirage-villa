import Stripe from 'stripe'
import { rawBody, requireEnv, json } from './_lib.mjs'

// Stripe signs the exact bytes it sent. Vercel's default JSON parsing would
// rewrite them and every signature check would fail, so it is switched off.
export const config = { api: { bodyParser: false } }

/**
 * Receives Stripe events. Right now it verifies and logs them; when a booking
 * store exists this is where a payment gets recorded against a reservation.
 *
 * Verification is not optional — without it anyone who finds this URL could
 * POST a fake "payment succeeded" event.
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
        // TODO: persist against a booking once there is somewhere to put it,
        // and email the villa. Until then this is the audit trail in the
        // Vercel function logs, alongside the Stripe dashboard.
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
        break
      }
      case 'checkout.session.expired':
        console.log('EXPIRED', event.data.object.id)
        break
      case 'charge.refunded':
        console.log('REFUNDED', event.data.object.id, (event.data.object.amount_refunded ?? 0) / 100)
        break
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
