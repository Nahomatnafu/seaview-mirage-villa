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

## 3. Stripe — not yet built

Agreed to be done on a separate branch. Notes for whoever picks it up:

- **Scope: only the villa rate goes through Stripe.** The client confirmed the
  chef's meal plan ($70/person/day) is settled with the villa on site, not
  online. The same goes for Kingston transfers, excursions, spa treatments and
  bar items. So the amount Stripe ever charges is `nights × RATES.nightly`,
  split across the three instalments — nothing else. `MEAL_PLAN.paidOnSite` in
  `content.js` records this.
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
- **Damage or security deposit** — whether one is taken, how much, when returned.
- **Whether Jamaican GCT or any tourism tax applies** to the nightly rate.
- **Pets** — allowed or not.
- High-resolution food photos from the chef (the menu currently uses
  Creative Commons stock — see `public/assets/menu/CREDITS.md`).
- Real guest reviews (`Testimonials.jsx` is written but unmounted).
- Social media URLs, if any exist.
- Wedding and event photographs.

---

## 6. Deploys

- `main` auto-deploys to production on Vercel.
- Any other branch gets a preview URL — use those for client review.
- `vercel.json` rewrites all non-asset paths to `index.html` so deep links like
  `/rates` survive a refresh. Do not remove it.
- Original phone photos live in `source-photos/` (gitignored). The deployed
  copies in `public/assets/villa/` are resized and brightened.
