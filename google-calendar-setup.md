# Google Calendar — what's needed before we build it

The client has agreed to Google Calendar as the place he records bookings. This
is the setup list. **Nothing is built yet** — this is what has to exist first,
split by who can actually do it.

The goal: he blocks dates from his phone like any appointment, the website never
offers a week he's marked taken, and website bookings appear in his calendar
automatically without him doing anything.

---

## Part 1 — for the client (5 minutes, on his phone or laptop)

Send him these four steps. He needs the villa's Google account.

**1. Make a calendar just for bookings.**
In Google Calendar → left sidebar → **Other calendars** → **+** → **Create new
calendar**. Name it **Sea View Mirage — Bookings**. Create it.

It has to be a separate calendar, not his personal one. Otherwise dentist
appointments would block the villa.

**2. Share it with our system.**
Hover the new calendar → **⋮** → **Settings and sharing** → **Share with
specific people or groups** → **Add people**.

Paste in the address we send him (it will look like
`villa-calendar@something.iam.gserviceaccount.com` — it's a robot account, not a
person). Set permission to **Make changes to events**. Save.

*We can't send that address until Part 2 is done, so do Part 2 first.*

**3. Send back the Calendar ID.**
Same settings page → scroll to **Integrate calendar** → copy the **Calendar ID**
and send it to us. It's a long string ending in
`@group.calendar.google.com`. Not secret.

**4. Agree how to mark a booking.**
Create an **all-day event** covering the nights the guest is staying, arrival
day through departure day. Put the guest's name in the title.

Anything on that calendar blocks those dates on the website. So it should hold
bookings and holds only — nothing else.

---

## Part 2 — for you (~20 minutes, one time)

**Use your own Google account. You do not need to sign in as the client.**

The Cloud project is only where the service account lives. The calendar stays
his — he owns it and shares it with the service account the way he'd share it
with a person. The one thing connecting them is the service account's email
address, which you send him in step 5.

No billing card is needed; the Calendar API is free at this volume. Google will
prompt you to enable billing anyway — ignore it.

1. **console.cloud.google.com** → create a project, e.g. `seaview-mirage`.
2. **APIs & Services → Library** → search **Google Calendar API** → **Enable**.
3. **APIs & Services → Credentials** → **Create credentials** → **Service
   account**. Name it `villa-calendar`. Skip the optional role steps.
4. Open the service account → **Keys** → **Add key** → **Create new key** →
   **JSON**. It downloads once.
5. Send the client the service account's email address (shown on that page) so
   he can do step 2 above.
6. **IAM & Admin → Grant access** → add the villa's Gmail as **Owner**.

   Not required for anything to work, and worth doing anyway: it stops the
   integration depending permanently on your personal Google account. If the
   site is ever handed over, he still controls the thing that reads his
   calendar.

7. From the JSON, add to `.env.local` and to Vercel:

```
GOOGLE_CALENDAR_ID=<the id he sends back>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email from the JSON>
GOOGLE_PRIVATE_KEY=<private_key from the JSON>
```

**Treat that JSON like the Stripe secret key.** It grants write access to the
calendar. Don't commit it, don't paste it into chat — same handling as
`STRIPE_SECRET_KEY`. `GOOGLE_PRIVATE_KEY` contains real newlines; they need
escaping as `\n` in the env var, and unescaping in code. It's the usual way this
setup fails.

No OAuth consent screen, no "sign in with Google" — a service account talks to
the API directly, and the only thing it can touch is a calendar explicitly
shared with it.

---

## Then we build (~half a day)

1. `shared/availability.mjs` — reads busy ranges from the calendar, caches
   briefly so every keystroke isn't an API call.
2. The booking form greys out taken dates instead of accepting them.
3. `api/create-checkout-session.mjs` re-checks availability **server-side**
   before creating a payment. This is the part that matters: the browser check
   is a courtesy, the server check is what stops two guests paying for the same
   week.
4. `api/stripe-webhook.mjs` writes a paid booking into the calendar on
   `checkout.session.completed`, so website bookings self-block.

`BLOCKED_RANGES` in `shared/pricing.mjs` stays as the manual override for
anything the calendar can't express.

---

## One thing to be honest with him about

A calendar makes double-booking **unlikely**, not impossible. If he takes a
booking on WhatsApp and doesn't write it down for an hour, the website can still
sell that week in the meantime.

The fix isn't more code — it's him adding phone bookings to the calendar
straight away. Worth saying plainly now rather than after it happens.
