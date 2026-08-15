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

## 4. Still needed from the client

Answers we do not have, so the site deliberately says nothing about them:

- **Cancellation and refund policy.** The biggest gap. The policies section
  currently says full terms come with the written quote, which is true but thin
  for a site taking $18,200 bookings. Needed before Stripe goes live.
- **Damage or security deposit** — whether one is taken, how much, when returned.
- **Whether Jamaican GCT or any tourism tax applies** to the nightly rate.
- **Pets** — allowed or not.
- High-resolution food photos from the chef (the menu currently uses
  Creative Commons stock — see `public/assets/menu/CREDITS.md`).
- Real guest reviews (`Testimonials.jsx` is written but unmounted).
- Social media URLs, if any exist.
- Wedding and event photographs.

---

## 5. Deploys

- `main` auto-deploys to production on Vercel.
- Any other branch gets a preview URL — use those for client review.
- `vercel.json` rewrites all non-asset paths to `index.html` so deep links like
  `/rates` survive a refresh. Do not remove it.
- Original phone photos live in `source-photos/` (gitignored). The deployed
  copies in `public/assets/villa/` are resized and brightened.
