import Stripe from 'stripe'
import { quoteInstalment, money } from '../shared/pricing.mjs'
import { verifyBooking, requireEnv, json, siteUrl } from './_lib.mjs'

/**
 * Creates a Stripe Checkout Session for one instalment of a booking.
 *
 * The amount is ALWAYS recomputed here from the dates — never taken from the
 * request. A guest can edit anything the browser sends, so the only figures
 * that matter are the ones this function derives from shared/pricing.mjs.
 *
 * The dates themselves are HMAC-verified, so a guest cannot point a link at a
 * cheaper stay than the one the villa issued it for.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  try {
    const { checkIn, checkOut, instalment, email, name, sig } = req.body || {}

    if (!verifyBooking({ checkIn, checkOut, instalment, email }, sig)) {
      return json(res, 403, { error: 'This payment link is not valid. Please ask the villa for a new one.' })
    }

    // Throws on bad dates, a stay under the minimum, or an unknown instalment.
    const quote = quoteInstalment({ checkIn, checkOut, instalment })

    const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'))
    const base = siteUrl(req)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email || undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: quote.currency,
          unit_amount: quote.amountCents,
          product_data: {
            name: `Sea View Mirage Villa — ${quote.schedule.label}`,
            description:
              `${Math.round(quote.schedule.pct * 100)}% of ${money(quote.total)} · ` +
              `${quote.nights} nights, ${checkIn} to ${checkOut}`,
          },
        },
      }],
      // Everything needed to reconcile the payment against a booking, since
      // there is no database yet.
      metadata: {
        checkIn, checkOut,
        instalment: quote.schedule.id,
        instalmentLabel: quote.schedule.label,
        nights: String(quote.nights),
        villaTotal: String(quote.total),
        guestName: name || '',
      },
      payment_intent_data: {
        // What the guest sees on their card statement. Stripe prefixes this
        // with the account's own descriptor where required.
        statement_descriptor_suffix: (process.env.STATEMENT_DESCRIPTOR || 'VILLA').slice(0, 22),
        metadata: { checkIn, checkOut, instalment: quote.schedule.id },
      },
      success_url: `${base}/pay/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pay?checkIn=${checkIn}&checkOut=${checkOut}&instalment=${instalment}&email=${encodeURIComponent(email || '')}&sig=${sig}&cancelled=1`,
    })

    return json(res, 200, { url: session.url })
  } catch (err) {
    // Never leak Stripe internals or env details to the browser.
    console.error('create-checkout-session failed:', err)
    const safe = /Minimum stay|Invalid or missing dates|Unknown instalment/.test(err.message)
      ? err.message
      : 'Could not start the payment. Please contact the villa.'
    return json(res, 400, { error: safe })
  }
}
