# Setup & operations

Everything here is about running the live site. Content facts live in
`src/content.js`; this file covers the plumbing.

---

## 1. Where the booking form goes — ACTION REQUIRED

The booking wizard posts to **FormSubmit**, a third-party relay that forwards
submissions to an email address. No backend, no database.

- Endpoint: `https://formsubmit.co/ajax/seaviewmirage.info@gmail.com`
- Defined in `src/content.js` as `INQUIRY_ENDPOINT`, built from `VILLA.email`.

### The activation step

**FormSubmit will not deliver anything until the address is activated, and this
has not been done yet.** The first submission triggers a confirmation email to
`seaviewmirage.info@gmail.com` containing a link. Until someone clicks that
link, every enquiry is silently dropped — the site still shows "Inquiry Sent!"
because FormSubmit returns success.

To activate, once, before launch:

1. Open the live site and submit a real enquiry through the booking wizard.
2. Open the `seaviewmirage.info@gmail.com` inbox (check spam).
3. Click the FormSubmit activation link.
4. Submit a second test enquiry and confirm it arrives.

Do this on the production domain — activation is tied to the address, but
testing from production also confirms the deployed build works.

### What each enquiry contains

Name, email, phone, arrival, departure, nights, villa total, the three
instalment amounts, party size (optional, for the chef), requested extras, and
free-text notes.

### Worth considering

FormSubmit is free and fine for low volume, but enquiries are the business —
they go through a third party with no delivery guarantee and no record if the
inbox is lost. Two upgrades, in order of effort:

- Add a second recipient so enquiries land in two inboxes.
- Move to a Vercel serverless function using Resend or SendGrid, which gives
  delivery logs and lets us store submissions. Roughly half a day.

---

## 2. Payment terms

Defined once in `src/content.js` as `PAYMENT_SCHEDULE`, and used by the rates
page, the booking wizard, the FAQ and the policies section.

| Instalment | Share | Due                             | On a 7-night stay |
| ---------- | ----- | ------------------------------- | ----------------- |
| First      | 25%   | On booking                      | $4,550            |
| Second     | 35%   | Within one month of booking     | $6,370            |
| Third      | 40%   | 20–30 days before arrival       | $7,280            |
| **Total**  |       |                                 | **$18,200**       |

`instalments(total)` rounds the first two and gives the remainder to the third,
so the parts always sum to the total exactly — no missing dollar from rounding.

Rate is `RATES.nightly` (2600). Changing that one number updates the published
rate, the live booking total, the instalment amounts, and the FAQ.

---

## 3. Stripe — built, needs keys and two decisions

Lives on the `stripe-payments` branch. **Nothing is wired into the public
booking flow yet** — the enquiry form still works exactly as before. What
exists is the payment machinery, reachable only from a link the villa sends.

### How it works today

**The booking wizard now ends in a payment, not an enquiry.** The last step's
button reads "Pay first instalment · $4,550". The guest's details are sent to
the villa first — so an abandoned payment still leaves a lead — then the guest
is handed to **Stripe Checkout**. Card details are entered on Stripe's page and
never touch this site.

Instalments two and three use villa-issued links: `POST /api/create-payment-link`
with the dates, guest email and an `x-admin-token` header returns three signed
links with the amounts already worked out. The guest opens `/pay?...`, sees what
they are paying for, and goes to the same Checkout flow.

Stripe then calls `/api/stripe-webhook`, which verifies the signature before
trusting anything and logs the payment.

### Availability

There is still no live calendar. Two things stand in for one:

- `FIRST_AVAILABLE_DATE` in `shared/pricing.mjs` — currently **2026-12-10**,
  because the villa is booked solid until then. The date picker will not offer
  anything earlier and the server refuses it too.
- `BLOCKED_RANGES` in the same file — **the villa must add each confirmed
  booking here.** Nothing else prevents two guests paying deposits for the same
  week. Adding a range takes one line:

  ```js
  { from: '2027-01-05', to: '2027-01-12', note: 'Smith party' },
  ```

  `to` is the departure date, so one stay may begin on another's `to`.

This is the weakest part of the setup and should be replaced with a real
calendar before the villa is busy.

### Two rules the code follows

- **The amount is never taken from the browser.** `/api/create-checkout-session`
  recomputes `nights × rate` from the dates using `shared/pricing.mjs`. Anything
  the client sends about price is ignored.
- **Payment links are HMAC-signed** over dates, instalment and email. Without
  this a guest could edit the dates in the URL and pay for a shorter stay than
  they booked. Tampering returns 403.

Three test suites cover this:

- `npm run check:pricing` — 40 checks, no network. Instalment maths (including
  that the three parts sum exactly to the total for every length from 7 to 90
  nights), date validation, the availability floor, blocked-range overlap at
  every boundary, and signature forgery.
- `npm run check:stripe` — 20 checks against the real Stripe **test** sandbox.
  Creates sessions and reads them back to confirm Stripe records $4,550 and
  $7,280, that a price injected by the client is ignored, and that every
  refusal returns the right status. It refuses to run against a live key.
- `npm run check:webhook` — 26 checks, no network. Stripe's SDK can generate
  genuine signature headers, so the handler is driven exactly as Stripe would
  drive it: a real event is accepted and logged with the right amount, while a
  missing, empty, garbage, wrong-secret or hour-stale signature is refused — as
  is a body edited after signing, which is the attack that matters. It signs
  with a throwaway secret, so it works before the real one exists and cannot be
  skewed by whatever is in `.env.local`.

What `check:webhook` **cannot** prove is that Vercel honours
`export const config = { api: { bodyParser: false } }` in production. If it did
not, Vercel would re-encode the body and every signature would fail. That is the
one remaining reason to do the preview test below.

### Setting it up

`npm run dev` alone is not enough: Vite serves only the frontend and does not
execute the functions in `/api`. Use `vercel dev`, which serves both.

The Stripe CLI is **not required**. On this account it shows "CLI disabled" for
every environment, which only the account owner can change — so the webhook is
tested against a Vercel preview deployment instead. That has the advantage of
exercising the real deployed code path rather than a local proxy.

1. Copy `.env.example` to `.env.local` and fill it in with **test** keys.
2. `vercel dev` (serves the site and `/api`, usually on port 3000).
3. Push the branch. Vercel builds a preview URL.
4. Add the test-mode variables under Vercel → Settings → Environment Variables.
5. Stripe Dashboard (test mode) → **Developers → Webhooks → Add endpoint**,
   pointing at `https://<preview-url>/api/stripe-webhook`, subscribed to
   `checkout.session.completed`. Reveal the signing secret and set it as
   `STRIPE_WEBHOOK_SECRET` in Vercel, then redeploy.
6. Book through the site and pay with test card `4242 4242 4242 4242`, any
   future expiry, any CVC. The event shows in the webhook's delivery log and
   the payment in the Vercel function logs.

Production is the same, with the live keys and a webhook endpoint on the real
domain. **The production signing secret is different from any test one** — they
are per-endpoint.

Note `vercel.json` had to exclude `/api` from the SPA rewrite — without that
every API call returned the HTML page instead.

### DECIDED: instalments 2 and 3 use Stripe Invoicing

**Agreed August 2026. Not built yet — this is the plan of record.**

At booking, create two Stripe invoices with due dates:

| Instalment | Due                          |
| ---------- | ---------------------------- |
| Second 35% | one month after booking      |
| Final 40%  | 20–30 days before arrival    |

Use `collection_method: 'send_invoice'` with a `due_date`. Stripe emails the
invoice and, once reminders are switched on, **sends the reminders itself** —
Dashboard → Settings → Billing → *Subscriptions and emails*, plus *Advanced
invoicing features* for one-off invoices. Reminders can fire before, on, or
after the due date, so the client's "a week or two earlier" is a dashboard
setting, not code we maintain.

Why this rather than auto-charging a stored card:

- The later charges land weeks or months after the card was captured. Cards
  expire, banks decline, and 3-D Secure can demand re-authentication the
  customer is not present to give. When that fails you need an invoice anyway,
  so the invoice path has to exist either way.
- A surprise $6,370 on someone's card is a chargeback risk in a way that "your
  invoice is due in 14 days" is not.
- Nothing is lost by starting here: switching `collection_method` to
  `charge_automatically` later keeps the same invoices and reminders and just
  charges the card on file instead.

Amounts must come from `instalments()` in `shared/pricing.mjs`, same as
everything else. Check whether Invoicing carries a per-invoice fee on this
account before going live — it is two invoices per booking.

### Availability — deliberately NOT built yet

**The client has no booking system at all.** No calendar, no spreadsheet, no
Airbnb or VRBO listing, and he is not taking bookings yet — he asked for the
calendar to be blocked until 10 December while he sets things up. That block is
in place (`FIRST_AVAILABLE_DATE`), and it is enough for now.

Building a calendar integration for someone with zero bookings would be
guessing at a process that does not exist. When he is ready to take bookings,
the recommendation is:

- **Google Calendar on the villa's Gmail as the surface he edits**, because it
  is the thing he is most likely to actually keep updated — he already has the
  account and can block dates from his phone.
- The site checks free/busy through the Calendar API before allowing a booking.
- **The webhook writes each paid booking into that calendar automatically**, so
  website bookings block themselves and he only has to add phone and WhatsApp
  ones by hand.

Not Calendly — it is built for appointment slots, not multi-night stays.

If he ever lists on Airbnb or VRBO, import their iCal feeds too, or the site
will happily sell a week those platforms already sold.

Until then, `BLOCKED_RANGES` in `shared/pricing.mjs` is the stopgap and needs a
developer to edit. That is acceptable at zero bookings and is not acceptable
once he is busy.

### Still to decide (client)

- **The $200 incidental deposit** — charged and refunded, or held on the card;
  before arrival or on arrival. Not implemented pending that answer.
- **The three cancellation-policy conflicts** in section 4.

### Original notes

- **Scope: only the villa rate goes through Stripe.** Everyday meals are
  included in the nightly rate, so they are already inside that figure — there
  is nothing extra to charge for them. Special meal packages ($70/pp/day),
  Kingston transfers, excursions, spa treatments and bar items are all settled
  with the villa on site. So the amount Stripe ever charges is
  `nights × RATES.nightly`, split across the three instalments — nothing else.
  `MEAL_PLAN.special.paidOnSite` in `content.js` records this.
- The three instalments are **scheduled payments, not a subscription.** The
  second and third are due on dates relative to booking and arrival, so this
  wants either three `PaymentIntent`s created up front with the later two
  confirmed off-session against a saved card, or Stripe Invoicing with due
  dates. Off-session charges need the customer to authorise saving the card at
  the first payment, and SCA/3DS can still force a re-authentication — the flow
  must handle a failed off-session charge and email the guest a payment link.
- Amounts must come from `PAYMENT_SCHEDULE` and `instalments()` in
  `src/content.js`, not be re-derived, so the site and Stripe cannot drift.
- **Never compute the charge amount in the browser.** The client can edit
  dates in devtools. A serverless function should take the dates, recompute
  nights × rate server-side, and create the intent from that.
- Needs a real availability check before taking money. Right now the site
  cannot tell whether dates are free — enquiries are answered by hand. Taking a
  deposit for dates that turn out to be booked is worse than the current flow,
  so either add a calendar or keep a human confirmation step before payment.
- Secrets go in Vercel environment variables, never in the repo.

---

## 4. Cancellation policy — PARTIALLY BLOCKED

The client supplied four answers about cancellation. They agree on the notice
windows, which are published. **They contradict each other on three points,
which are not published.** Do not resolve these by picking one — a cancellation
policy is a binding term on an $18,200 booking.

### Published (all four answers agree)

| Period                | Refund possible | Non-refundable |
| --------------------- | --------------- | -------------- |
| Standard dates        | 61+ days before | ≤ 60 days      |
| Easter & Thanksgiving | 91+ days before | ≤ 90 days      |
| Christmas & New Year  | 121+ days before| ≤ 120 days     |

Also published: no refund for unused goods/services, no-shows, late arrival or
early departure; a shortened rescheduled stay must still meet the 7-night
minimum; rescheduled dates are non-refundable.

### Unresolved — three direct conflicts

1. **The standard cancellation fee.** Answer 1 says *"a one-time cancellation
   fee of 5%"* for cancellations 60+ days out. Answer 2 says *"refund all
   deposits, with a 20% cancellation fee deducted"* for 61+ days out. Same
   window, two different numbers. Answer 3 separately gives 30% for holiday
   periods, which nothing contradicts but which should be confirmed alongside.
2. **Christmas and New Year.** Answer 1 says festive bookings are
   *non-refundable* outright. Answer 3 says they are refundable at 121+ days
   less a 30% fee. These cannot both be true.
3. **Rescheduling.** Answer 1 says a reschedule *"will be treated as a new
   booking"*. Answer 4 says guests may move dates within 365 days *"with full
   credit applied towards the new reservation"*. Losing the money versus
   carrying it over is a large difference to a guest.

Until these are settled, `CANCELLATION.feeStandard` and `feeHoliday` in
`content.js` stay `null` and the page reads "less a cancellation fee, set out in
your written quote". Filling in those two values is the only change needed.

### Also worth raising

The supplied text names **"Seaview Mirage Villa Paradise"** and **"Seaview
Mirage View"** — two names, neither matching the villa's actual name used
everywhere else on the site. It reads as though it was copied from another
property's website. Worth confirming with the client that these are genuinely
his terms and the numbers are what he wants, rather than someone else's policy
pasted over. Publishing another business's terms verbatim is its own problem.

---

## 5. Still needed from the client

Answers we do not have, so the site deliberately says nothing about them:

- **The three cancellation conflicts above.** Needed before Stripe goes live.
- **How the $200 incidental deposit is taken** — charged then refunded, or held
  on the card; and whether before arrival or on arrival. Affects Stripe.
- High-resolution food photos from the chef (the menu currently uses
  Creative Commons stock — see `public/assets/menu/CREDITS.md`).
- Real guest reviews (`Testimonials.jsx` is written but unmounted).
- Social media URLs, if any exist.
- Wedding and event photographs.

---

## 6. Dining — one thing to confirm

**August 2026: the client reversed the meal arrangement.** He now says the
standard menu — breakfast, lunch, dinner, dessert, fresh juice and water — is
*included in the price*, and the $70 per person figure applies only to special
or custom meals arranged with the chef.

This contradicts both his earlier written answer and the menu PDF, which framed
$70 per person per day as the cost of *all* meals. The site follows the newer
instruction.

**Confirmed August 2026:** the special meal package is **$70 per person, per
day**, as the site already states. No change needed.

Also removed as a consequence: the old "you receive every shopping receipt and
settle the food bill in cash or by card" copy. That described guests paying for
groceries at cost, which cannot be true if meals are included in the rate. If
the client does still itemise groceries for the special package, tell us and it
goes back in for that package only.

---

## 7. Deploys

- `main` auto-deploys to production on Vercel.
- Any other branch gets a preview URL — use those for client review.
- `vercel.json` rewrites all non-asset paths to `index.html` so deep links like
  `/rates` survive a refresh. Do not remove it.
- Original phone photos live in `source-photos/` (gitignored). The deployed
  copies in `public/assets/villa/` are resized and brightened.
