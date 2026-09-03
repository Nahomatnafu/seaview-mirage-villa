# 28 August — pick up here

**Where things stand.** The site is live on `main` and content-complete.
Stripe is built and tested on the `stripe-payments` branch but **not merged**.
Booking now ends in a real payment; the calendar is blocked until 10 December.

Two things are genuinely unfinished: the webhook has been proven offline but
never against a real deploy, and instalments 2 and 3 don't exist yet.

---

## 1. Send the client questions — do this first

Read through `ask-clients.md` and send it. Everything else waits on it.

The three that actually block launch:

- **The booking form — client says he activated it (1 Sep).** A test submission
  was accepted (`{"success":"true"}`), which it would not be if the address were
  blocked. But FormSubmit returns that either way, so it is not proof of
  delivery: someone has to open `seaviewmirage.info@gmail.com` and confirm the
  `[TEST] Website booking form check` email actually arrived. Check spam.
- **The cancellation policy contradicts itself** in three places (5% vs 20%,
  festive refundable or not, reschedule credit or not). We cannot take real
  money under terms we can't state.
- **He has no way to record bookings.** Before 10 December he needs one, or the
  site will sell a week he's already promised on WhatsApp.

---

## 2. Test the webhook — mostly done

`npm run check:webhook` now covers the handler offline (26 checks): genuine
Stripe signatures accepted and logged with the right amount; missing, empty,
garbage, wrong-secret, hour-stale and edited-after-signing bodies all refused.
It signs with a throwaway secret, so it runs before the real one exists.

**Proven live on 3 September.** Stripe delivered a real signed
`checkout.session.expired` to the preview, the signature verified and the
handler logged it. So Vercel *does* honour `bodyParser: false` — that was the
last unknown, and no code change was needed.

Endpoint `we_1UBenEGwLIYEIvf9…` (test mode) points at the branch alias
`seaview-mirage-git-stripe-payments-…`. Three environment traps are written up
in `SETUP.md` §3 "Three ways this silently doesn't work" — read that before
setting up the production endpoint.

**Still outstanding:** a real card payment through the booking form with
`4242 4242 4242 4242`, to confirm `checkout.session.completed` arrives with the
booking metadata attached. Expiry events carry none.

Note `npm run dev` can't test this. Use `vercel dev` locally.

---

## 3. Build Stripe Invoicing for instalments 2 and 3

Agreed approach, written up in `SETUP.md` §3. Two invoices per booking with due
dates; Stripe sends the reminders itself, so there's no scheduler to maintain.

Amounts come from `instalments()` in `shared/pricing.mjs` — never recalculated.

Worth checking first whether Invoicing carries a per-invoice fee on this
account, since it's two per booking.

---

## 4. Merge `stripe-payments` into `main`

Once the webhook is proven. Everything on the branch is tested; the merge itself
is routine.

---

## 5. Before real money moves — do not skip

- Swap test keys for live keys in Vercel.
- Add a **production** webhook endpoint (different signing secret from test).
- Set the statement descriptor so guests recognise the charge.
- Confirm his Stripe account is fully activated, or payments collect but never
  pay out.
- **The cancellation policy must be resolved.** Taking $18,200 under terms that
  say "see your written quote" is the biggest remaining exposure.

---

## Waiting on the client (no work for us until they land)

- Cancellation: the three conflicts.
- Is the $200 incidental deposit charged or held, and when?
- Booking-tracking method — Google Calendar is our recommendation, and the
  calendar integration is deliberately unbuilt until he answers.
- Statement descriptor, who can issue refunds, Stripe account activated.
- Content: the chef's own food photos, real guest reviews, wedding photos,
  social links.

---

## Deliberately not built

- **Availability calendar.** He has no booking system at all and isn't taking
  bookings, so building one now would be guessing at a process that doesn't
  exist. `BLOCKED_RANGES` in `shared/pricing.mjs` is the stopgap and needs a
  developer to edit — fine at zero bookings, not fine later.
- **Auto-charging saved cards.** Invoicing was chosen instead; reasoning in
  `SETUP.md`.
- **Testimonials.** Built but hidden until real reviews exist.

---

## Handy

```
npm run check:pricing   # 40 checks, offline — money maths, dates, signatures
npm run check:stripe    # 20 checks against the test sandbox
npm run check:webhook   # 26 checks, offline — signature verification, forgery
vercel dev              # site + /api locally (npm run dev won't serve /api)
```
