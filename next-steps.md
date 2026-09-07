# What's left

Written 7 September 2026, the day the site went live. This is the live to-do
list — `august28tasks.md` is superseded and kept only for the record of what was
settled with the client.

## Where things stand

The site is live on **seaview-mirage.com**, serving the merged `main` (`bf4f7d2`).
Dashboard at `/admin`, password `Seaview-Kingston-6199`, robots disallows
`/admin` and `/pay`. Production runs **Stripe test keys**, so it collects nothing
real. The villa opens to guests **10 December 2026**, which is the deadline for
everything in section 1.

All five check suites pass: `check:pricing`, `check:admin`, `check:webhook`,
`check:stripe`, `check:invoices`.

---

## 1. Before the site can take real money — by 10 December

**Nothing below is optional. Until all of it is done the site is a demonstration.**

### 1.1 Prove the webhook fires — do this first, it is not proven

Instalments 2 and 3 are raised as Stripe invoices by
`api/stripe-webhook.mjs` when a deposit lands. If that never fires, the guest
pays 25% and the remaining **$15,600 on a 7-night booking is never invoiced**.

As of 7 September the webhook has **never fired for a real booking**. Every
invoice in test mode came from `npm run check:invoices` — the two bookings made
through the browser (`nahomg116@`, `nahombusiness116@`) produced none. The
endpoint was configured afterwards, so this may already work, but it is
untested.

The test: pay a deposit with `4242 4242 4242 4242`, then confirm **two invoices
appear in Stripe** with the right amounts and due dates. Bookings appearing in
the dashboard proves nothing — those are read straight from Stripe and show up
whether or not the webhook works.

### 1.2 Live Stripe keys

`STRIPE_SECRET_KEY` in Vercel Production. Roger's account is confirmed ready:
`charges_enabled`, `payouts_enabled` and `details_submitted` are all true, so
money will actually reach him.

### 1.3 A live-mode webhook endpoint

Live mode needs its own endpoint at `https://seaview-mirage.com/api/stripe-webhook`
listening for `checkout.session.completed`, and **its signing secret is different
from the test one** — update `STRIPE_WEBHOOK_SECRET` and redeploy.

### 1.4 Turn on receipt emails in live mode

Settings → Customer emails → *Successful payments*. Test and live hold this
setting separately. The thank-you page tells the guest "We'll email you a
receipt" in the villa's own voice, so if this is off the site is lying.

Stripe does not email customers for test-mode payments at all, so this cannot be
verified before the keys are swapped.

### 1.5 Check the invoicing fee

Confirm whether Invoicing carries a per-invoice fee on Roger's account. Two per
booking, on every booking.

---

## 2. Known defects

### 2.1 Bookings silently drop off after ~33 stays — HIGH

`paidStays()` in `api/_availability.mjs` calls `sessions.list({ limit: 200 })`
and `api/admin/bookings.mjs` uses `limit: 100`, neither with pagination. Each
booking is up to three paid sessions, so roughly **33 bookings fills the
window**. After that the *oldest* paid bookings stop being returned — they
vanish from the dashboard, and worse, they stop blocking their dates, so **a
week that is genuinely booked can be sold to somebody else**.

Not urgent in December. Certain to bite during 2027. Fix is pagination with a
date floor — no need to walk sessions older than the earliest future stay.

### 2.2 Preview and Production share one Blob store — MEDIUM

There is a single `BLOB_STORE_ID` scoped to both environments, so a season or a
block created while testing on a preview is live data the public site serves.
This already happened once during testing. Either create a second store for
Preview, or prefix the blob paths with the environment in `api/_store.mjs`
(`PREFIX` is already a constant there).

### 2.3 Enquiries depend on FormSubmit — MEDIUM

Every enquiry goes through a free third-party relay to one Gmail account, with
no delivery guarantee and no record if the inbox is lost. Enquiries are the
business. Cheapest improvement is a second recipient; the real fix is a
serverless function using Resend or SendGrid, which gives delivery logs and lets
submissions be stored. Roughly half a day. See SETUP.md §1.

### 2.4 The 10-second cache confuses people — LOW

`_store.mjs` and `_availability.mjs` cache for 10 seconds per serverless
instance, and instances cannot invalidate each other. After Roger deletes a
season or a block, the public site can keep showing it for a few seconds. This
is deliberate and documented, and anything deciding money passes
`{ fresh: true }`, but it looks like a bug to whoever hits it. Worth a line in
the dashboard guide rather than a code change.

---

## 3. Waiting on Roger

- **The chef's own food photos.** The menu currently uses Creative Commons
  stock that legally requires attribution — see `public/assets/menu/CREDITS.md`.
  Replacing them removes that obligation.
- **Real guest reviews.** The testimonials section is built and deliberately
  unmounted; publishing invented ones is illegal under the FTC's 2024 rule.
  One-line change once real ones exist.
- **Wedding and event photographs.**
- **Social media links**, if any exist — the footer icons are ready.
- **Still unanswered:** damage/security deposit, whether Jamaican GCT applies,
  spa pricing.
- **Confirm the real opening date.** `firstAvailableDate` is 10 December 2026,
  set as a placeholder back when there was no calendar. It is now his to change
  on the Rates page.

---

## 4. Housekeeping

- **Send Roger `villa-dashboard-guide.md`** and the password, by text or phone
  rather than email. The guide has the real address in it now.
- **Connect the Vercel project to GitHub.** It has no Git connection at all, so
  every deploy is a manual `vercel deploy --prod` and branch pushes build no
  previews. `vercel git connect`. Do it knowing that afterwards **a push to
  `main` deploys production** — which is exactly why it was left until the site
  was stable.
- **Set a stable preview alias** so the Stripe test webhook does not need
  re-pointing after every deploy.
- **Test data hygiene.** Test-mode Stripe bookings block real dates because
  availability is derived from Stripe. They disappear when live keys go in, but
  until then, decline anything left over.

---

## Reference

```
Site        https://seaview-mirage.com
Dashboard   https://seaview-mirage.com/admin
Repo        github.com/Nahomatnafu/seaview-mirage-villa   (main)
Vercel      nahom-atnafus-projects/seaview-mirage

npm run check:pricing     money maths, seasons, settings validation, rate lock
npm run check:admin       auth boundary
npm run check:webhook     signature verification, forgery, replay
npm run check:stripe      real test-mode sessions and amounts
npm run check:invoices    real test-mode invoices, due dates, idempotency

node scripts/make-admin-password.mjs "New-Password-Here"
```

Vercel env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYMENT_LINK_SECRET`,
`ADMIN_TOKEN`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `BLOB_*`,
`PUBLIC_SITE_URL` (Production only — Preview must use its own hostname).

`STATEMENT_DESCRIPTOR` was deliberately removed. The account descriptor is
already `SEAVIEW MIRAGE`; adding a suffix rendered `SEAVIEW MI* SEA VIEW M` on
the guest's statement. Do not put it back.
