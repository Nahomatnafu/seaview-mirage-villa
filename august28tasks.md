# Pick up here

Last worked on 7 September.

**Where things stand.** The live site on `main` is content-complete but has no
payments. Everything since then sits on two unmerged branches:

```
main                817bebd   live site, no payments
  └─ stripe-payments          Stripe, cancellation policy, incidental deposit
       └─ admin-dashboard     dashboard, seasonal rates, invoicing  ← current
```

All five check suites pass on `admin-dashboard`:

```
npm run check:pricing    money maths, seasons, settings validation, rate lock
npm run check:admin      auth boundary — 61 checks
npm run check:webhook    signature verification, forgery, replay
npm run check:stripe     real test-mode sessions and amounts
npm run check:invoices   real test-mode invoices, due dates, idempotency
```

---

## 1. The Vercel Blob store — DONE

Created 6 September. `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD_HASH` and
`ADMIN_SESSION_SECRET` are all in Vercel on Production and Preview. The
dashboard reads and saves.

**One consequence to keep in mind: Preview and Production share a single Blob
store.** There is one `BLOB_STORE_ID` scoped to both, so a season or a block
created while testing on a preview is real data that production will serve.
Delete test entries when you are finished with them.

---

## 2. Test the dashboard on a preview

**The API half is automated and passing** (7 September, 28 checks against the
preview): a minted session is accepted and anonymous refused; a season saves and
reaches the public settings API; a stay crossing the season boundary prices per
night at $22,200 with three instalments summing to $22,400; a blocked week is
reported by availability and refused by checkout, while the week starting on its
departure date is allowed and returns a real `cs_test_` Stripe URL; short stays,
past dates and unsigned instalment-2 requests are all refused. The store was
restored to its snapshot afterwards.

**Still needs a human:** sign in on a phone and walk the dashboard screens, then
pay a deposit with `4242 4242 4242 4242` and confirm two invoices appear in
Stripe with the right amounts and due dates. The webhook only fires if a
test-mode endpoint in the Stripe dashboard points at the preview URL you are
using — and preview URLs change per deploy, so a stable alias saves re-pointing
it every time.

Note the Vercel project has **no Git connection at all** — that is why branch
pushes never build previews and everything goes out via `vercel deploy`. Fix
with `vercel git connect`, but do it deliberately: once connected, a push to
`main` is a production deploy.

---

## 3. Merge — and mind the order

`admin-dashboard` → `stripe-payments` → `main`.

**Decided 7 September: the site goes live before the live Stripe keys do.** The
villa does not open to guests until 10 December, so the weeks in between are
testing and fixing time on the real domain.

Know what that means while it lasts. Production still holds test keys, so a real
card gets declined and a visitor using `4242 4242 4242 4242` gets a confirmation
and a booking in Roger's dashboard for money that never moved. Harmless in
September, not in December — see section 4, and give it a date.

---

## 3b. The domain — seaview-mirage.com

Roger owns it, on GoDaddy. DNS to set:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `216.198.79.1` | 600 |
| CNAME | `www` | `cname.vercel-dns.com` | 600 |

Delete GoDaddy's parked `A @` and its default `CNAME www → @` rather than adding
alongside them, turn off Domain Forwarding, and leave the MX records alone if he
has email on the domain. Vercel prints the exact records when the domain is
added — trust that screen over this table if they differ.

Then set `PUBLIC_SITE_URL` in Vercel. Without it `siteUrl()` in `api/_lib.mjs`
falls back to the request host, which means Stripe success and cancel URLs point
at whatever hostname the guest arrived on.

---

## 4. Before real money moves — deadline: before 10 December

- Live Stripe keys in Vercel Production. **This is the one that turns a
  demonstration into a business**; until it is done the live site collects
  nothing.
- A **production** webhook endpoint on the real domain — its signing secret is
  different from the test one.
- Confirm Roger's Stripe account is fully activated. If bank details or identity
  checks are outstanding, payments collect but never pay out, and it is
  invisible until you look.
- Check whether Invoicing carries a per-invoice fee on his account. Two per
  booking.

---

## Settled — do not reopen

- **The cancellation policy is approved.** Roger read
  `cancellation-policy-draft.md` and signed off. The draft and the site agree in
  both directions: 60/90/120-day notice periods, 20% on normal dates, 30% on
  holidays. The apparent contradictions came from his early raw notes, not the
  published policy.
- **The 12-month reschedule limit stays.** Confirmed 7 September. It is already
  in the draft, the FAQ, `CANCELLATION.reschedule` and SETUP.md §7.
- **Stripe business name** — he fixed it.
- **The $200 incidental** is added to the final instalment.

## Waiting on Roger

- **Content:** the chef's own food photos, real guest reviews (the testimonials
  section is built but hidden), wedding photos, social links.
- **Still unanswered:** damage/security deposit, whether Jamaican GCT applies,
  spa pricing.

---

## Send him the dashboard guide

`villa-dashboard-guide.md` is written for him, not for a developer. Fill in the
website address at the top before sending.

---

## Deliberately not built

- **Auto-charging saved cards.** Invoicing was chosen instead; reasoning in
  `SETUP.md` §3.
- **Google Calendar.** Was the plan for several days, dropped for the dashboard.
  Reasoning kept in `SETUP.md` §3 so nobody re-derives it.
- **Testimonials.** Built, hidden until real reviews exist.
- **An admin page for site content** — menu, photos, copy. Only rates and
  availability are editable.
