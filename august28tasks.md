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

## 1. Create the Vercel Blob store — blocks everything below

Vercel → Storage → Blob. Two minutes. It injects `BLOB_READ_WRITE_TOKEN`.

Then `npm run admin:password`, and put `ADMIN_PASSWORD_HASH` and
`ADMIN_SESSION_SECRET` into Vercel (Production and Preview). Redeploy — env vars
only apply to builds made after they are set.

**Until this exists the dashboard can read but not save.** That is the one thing
stopping end-to-end testing.

---

## 2. Test the dashboard on a preview

Sign in on a phone. Add a Christmas period, confirm the booking form prices a
stay crossing it night by night. Block a week, confirm the date picker refuses
it. Pay a deposit with `4242 4242 4242 4242` and confirm two invoices appear in
Stripe with the right amounts and due dates.

Note the Vercel git integration is not building branch previews — deploys have
been going out from the CLI (`vercel deploy`, then `vercel alias set`). Worth
fixing, or you will keep testing stale code.

---

## 3. Merge — and mind the order

`admin-dashboard` → `stripe-payments` → `main`.

**Do not merge to `main` before live keys are in place.** Production env still
holds test keys, so merging now would put a booking flow on the public site that
takes payments collecting nothing. A guest typing a test card would get a
receipt for a booking that does not exist.

---

## 4. Before real money moves

- Live Stripe keys in Vercel Production.
- A **production** webhook endpoint on the real domain — its signing secret is
  different from the test one.
- Confirm Roger's Stripe account is fully activated. If bank details or identity
  checks are outstanding, payments collect but never pay out, and it is
  invisible until you look.
- Check whether Invoicing carries a per-invoice fee on his account. Two per
  booking.

---

## Waiting on Roger

- **Stripe business name** is lower case — "seaview mirage villa" shows on the
  payment page. Should be "Sea View Mirage Villa". He was fixing this.
- **Which spelling is right?** He wrote "Seaview Mirage Villa"; the site says
  "Sea View Mirage Villa" everywhere. Pick one and make the site, the Stripe
  name and the statement descriptor match.
- **The 12-month reschedule limit** — the policy he approved does not mention
  it, but the site does. Either he adds the line or we drop it from the site.
- **Content:** the chef's own food photos, real guest reviews (the testimonials
  section is built but hidden), wedding photos, social links.

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
