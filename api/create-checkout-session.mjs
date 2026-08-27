import crypto from 'node:crypto'
import Stripe from 'stripe'
import { quoteInstalment, money, PAYMENT_SCHEDULE } from '../shared/pricing.mjs'
import { verifyBooking, requireEnv, json, siteUrl } from './_lib.mjs'

/**
 * Creates a Stripe Checkout Session for one instalment of a booking.
 *
 * Trust model
 * -----------
 * Nothing the browser sends about money is believed. The amount is always
 * recomputed here from the dates via shared/pricing.mjs, and the dates are
 * re-validated (minimum stay, maximum stay, the villa's opening date, and
 * already-booked weeks) even though the form checks them too — a guest can
 * edit anything client-side.
 *
 * Two ways in:
 *   deposit         — a guest booking directly from the site. No signature,
 *                     because they are choosing their own dates; the date
 *                     rules above are what protect us.
 *   second / final  — must carry the villa's HMAC signature, since those links
 *                     are issued against a booking that already exists.
 */

const MAX_LEN = 200
const clean = (v, max = MAX_LEN) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const looksLikeEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  try {
    const body = req.body || {}
    const checkIn = clean(body.checkIn, 10)
    const checkOut = clean(body.checkOut, 10)
    const instalment = clean(body.instalment, 20)
    const email = clean(body.email).toLowerCase()
    const name = clean(body.name, 120)
    const phone = clean(body.phone, 40)
    const notes = clean(body.notes, 1000)
    const extras = clean(body.extras, 300)
    const partySize = clean(body.partySize, 20)
    const sig = clean(body.sig, 128)

    if (!PAYMENT_SCHEDULE.some(p => p.id === instalment)) {
      return json(res, 400, { error: 'Unknown instalment.' })
    }
    if (!looksLikeEmail(email)) {
      return json(res, 400, { error: 'Please provide a valid email address.' })
    }

    // Later instalments are only ever reached through a link the villa issued.
    if (instalment !== 'deposit' && !verifyBooking({ checkIn, checkOut, instalment, email }, sig)) {
      return json(res, 403, { error: 'This payment link is not valid. Please ask the villa for a new one.' })
    }

    // Throws with a guest-readable reason on any invalid or unavailable dates.
    const quote = quoteInstalment({ checkIn, checkOut, instalment })

    // Belt and braces: the schedule can only ever yield a fraction of the
    // total, so anything outside this range means something is badly wrong.
    if (!Number.isFinite(quote.amountCents) || quote.amountCents < 100 || quote.amountCents > 10_000_000) {
      console.error('Refusing implausible amount:', quote.amountCents)
      return json(res, 400, { error: 'Could not price that stay. Please contact the villa.' })
    }

    const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'))
    const base = siteUrl(req)

    const params = {
      mode: 'payment',
      customer_email: email,
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
      // Everything needed to reconcile a payment to a booking by hand, since
      // there is no database yet.
      metadata: {
        checkIn, checkOut,
        instalment: quote.schedule.id,
        instalmentLabel: quote.schedule.label,
        nights: String(quote.nights),
        villaTotal: String(quote.total),
        guestName: name,
        guestPhone: phone,
        partySize,
        extras,
        notes: notes.slice(0, 480),
      },
      payment_intent_data: {
        statement_descriptor_suffix: (process.env.STATEMENT_DESCRIPTOR || 'VILLA').slice(0, 22),
        metadata: { checkIn, checkOut, instalment: quote.schedule.id },
      },
      // No custom expires_at on purpose: it moves every call, and Stripe rejects
      // a reused idempotency key whose parameters changed. Stripe's own 24-hour
      // default is fine — a session holds no inventory.
      success_url: `${base}/pay/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pay/cancelled`,
    }

    // The key is a hash of the exact parameters being sent. Double-clicking
    // "pay" reuses the session; any genuine change — a different phone number,
    // or a future code change to the session shape — produces a different key
    // rather than a Stripe idempotency error the guest cannot get past.
    const idempotencyKey = crypto.createHash('sha256')
      .update(JSON.stringify(params))
      .digest('hex')

    const session = await stripe.checkout.sessions.create(params, { idempotencyKey })

    return json(res, 200, { url: session.url })
  } catch (err) {
    console.error('create-checkout-session failed:', err)
    // Validation messages are written for guests and are safe to show. Anything
    // else stays vague — no Stripe internals or env detail reaches the browser.
    const guestSafe = /minimum stay|maximum|fully booked|already booked|departure date|arrival|contact the villa|unknown instalment/i
    return json(res, 400, {
      error: guestSafe.test(err.message) ? err.message : 'Could not start the payment. Please contact the villa.',
    })
  }
}
