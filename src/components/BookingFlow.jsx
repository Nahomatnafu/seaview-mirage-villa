import React, { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Check, Calendar, ChefHat, Car, Leaf, Waves, PartyPopper, Star, LoaderCircle, Wallet, Lock } from 'lucide-react'
import {
  VILLA, RATES, BOOKING_SERVICES, PAYMENT_SCHEDULE, INQUIRY_ENDPOINT,
  money, villaTotal, instalments,
} from '../content'
import { earliestArrival, toISODate, validateStay } from '../../shared/pricing.mjs'

const SERVICE_ICONS = {
  mealplan: <ChefHat size={24} />,
  transfer: <Car size={24} />,
  spa: <Leaf size={24} />,
  watersports: <Waves size={24} />,
  events: <PartyPopper size={24} />,
}

function formatDate(d) {
  if (!d) return ''
  // Parse YYYY-MM-DD as local time — new Date('YYYY-MM-DD') is UTC midnight,
  // which renders as the previous day in western timezones.
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function diffDays(a, b) {
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)))
}

// Add days to a YYYY-MM-DD string without going through UTC.
function addDays(d, n) {
  const [y, m, day] = d.split('-').map(Number)
  const dt = new Date(y, m - 1, day + n)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export default function BookingFlow({ onClose, initialService = null }) {
  // Lock the page behind the modal so touch scrolling stays inside it.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // The villa is let whole-house at a flat nightly rate, so there is no party
  // size to choose — the flow is dates, then extras, then review.
  const [step, setStep] = useState(1) // 1: dates, 2: extras, 3: review
  const [selected, setSelected] = useState(() => initialService ? { [initialService]: true } : {})
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '', partySize: '', requests: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const nights = diffDays(checkIn, checkOut)
  const total = villaTotal(nights)
  const parts = instalments(total)
  const selectedServices = BOOKING_SERVICES.filter(s => selected[s.id])

  const toggleService = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const setField = (field) => (e) => {
    setContact(prev => ({ ...prev, [field]: e.target.value }))
  }

  // Guests choose their own departure. The departure input's `min` is set a
  // full minimum stay after arrival, so the calendar greys out anything
  // shorter rather than us picking a length for them. Changing arrival clears
  // a departure that would no longer meet the minimum.
  const pickCheckIn = (value) => {
    setCheckIn(value)
    if (!value) { setCheckOut(''); return }
    if (checkOut && diffDays(value, checkOut) < VILLA.minNights) setCheckOut('')
  }

  // The villa is booked out until a fixed date, so the calendar cannot offer
  // anything earlier. Re-checked on the server before any charge.
  const openFrom = toISODate(earliestArrival())
  const stayCheck = validateStay(checkIn, checkOut)

  const canProceed = () => {
    if (step === 1) return stayCheck.ok
    return true
  }

  const canSubmit = contact.firstName.trim() && contact.lastName.trim() && contact.email.includes('@') && !sending

  /**
   * Sends the booking details to the villa, then hands off to Stripe Checkout
   * for the deposit.
   *
   * The enquiry goes first and on purpose: if the guest abandons the payment
   * page, the villa still has their dates and can follow up. A failure to
   * deliver the enquiry does not block the payment — Stripe's metadata carries
   * the same details, so the booking is never lost either way.
   */
  const payDeposit = async () => {
    setSending(true)
    setError(null)

    const fullName = `${contact.firstName.trim()} ${contact.lastName.trim()}`
    const extras = selectedServices.map(s => s.title).join(', ') || 'None'

    try {
      await fetch(INQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `Booking + deposit started — ${VILLA.name}`,
          _template: 'table',
          _honey: '',
          Name: fullName,
          Email: contact.email.trim(),
          Phone: contact.phone.trim() || 'Not provided',
          'Check-in': formatDate(checkIn),
          'Check-out': formatDate(checkOut),
          Nights: nights,
          'Villa total': `${money(total)} (${nights} × ${RATES.nightlyRate})`,
          'Payment schedule': PAYMENT_SCHEDULE
            .map((p, i) => `${Math.round(p.pct * 100)}% ${money(parts[i])} — ${p.when}`)
            .join(' | '),
          'Party size': contact.partySize.trim() || 'Not stated',
          'Requested extras': extras,
          'Special requests': contact.requests.trim() || 'None',
        }),
      }).catch(() => {}) // best effort only

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn, checkOut,
          instalment: 'deposit',
          email: contact.email.trim(),
          name: fullName,
          phone: contact.phone.trim(),
          partySize: contact.partySize.trim(),
          extras,
          notes: contact.requests.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'We could not start the payment. Please try again or call the villa.')
      }
      window.location.href = data.url
      return
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const steps = [
    { n: 1, label: 'Dates' },
    { n: 2, label: 'Extras' },
    { n: 3, label: 'Review' },
  ]

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.3s ease',
      backdropFilter: 'blur(6px)',
    }}>
      <div className="bf-card" style={{
        background: 'white',
        width: '100%',
        maxWidth: submitted ? '560px' : '820px',
        maxHeight: '92vh',
        overflowY: 'auto',
        position: 'relative',
        animation: 'fadeInUp 0.35s ease',
      }}>

        {/* Close */}
        {/* Sits over the dark header while the wizard is open, and over white
            once submitted — so the resting colour has to follow. */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'none', border: 'none', cursor: 'pointer',
            zIndex: 10, padding: '10px',
            color: submitted ? 'var(--gray)' : 'rgba(255,255,255,0.75)',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = submitted ? 'var(--charcoal)' : 'white'}
          onMouseLeave={e => e.currentTarget.style.color = submitted ? 'var(--gray)' : 'rgba(255,255,255,0.75)'}
        >
          <X size={22} />
        </button>

        {submitted ? (
          /* Success state */
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
            }}>
              <Check size={32} color="white" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '12px' }}>
              Inquiry Sent!
            </h2>
            <p style={{ color: 'var(--gray)', fontSize: '0.9375rem', lineHeight: '1.7', marginBottom: '32px' }}>
              Thank you for choosing {VILLA.name}. Our team will reply to <strong>{contact.email}</strong> within 24 hours with availability and full pricing for your stay.
            </p>
            <div style={{ background: 'var(--cream)', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '4px' }}>Check-in</div>
                  <div style={{ fontWeight: '500', fontSize: '0.9375rem' }}>{formatDate(checkIn)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '4px' }}>Check-out</div>
                  <div style={{ fontWeight: '500', fontSize: '0.9375rem' }}>{formatDate(checkOut)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '4px' }}>Nights</div>
                  <div style={{ fontWeight: '500', fontSize: '0.9375rem' }}>{nights}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '4px' }}>Villa total</div>
                  <div style={{ fontWeight: '500', fontSize: '0.9375rem' }}>{money(total)}</div>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: '#0e0e0e', border: 'none',
              padding: '14px 44px', fontSize: '0.75rem',
              letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600',
              cursor: 'pointer',
            }}>
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bf-header" style={{ background: 'var(--charcoal)', padding: '32px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <img src="/assets/logo.png" alt="logo" style={{ height: '44px' }} />
                <div>
                  <div style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '600' }}>Request Your Stay</div>
                  <div style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px' }}>{VILLA.name} · Discovery Bay, Jamaica</div>
                </div>
              </div>

              {/* Progress */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px', gap: 0 }}>
                {steps.map((s, i) => (
                  <React.Fragment key={s.n}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: step > s.n ? 'var(--gold)' : step === s.n ? 'linear-gradient(135deg, #c9a84c, #e8c96a)' : 'rgba(255,255,255,0.1)',
                        border: step >= s.n ? 'none' : '1px solid rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: step >= s.n ? '#0e0e0e' : 'rgba(255,255,255,0.4)',
                        fontSize: '0.8125rem', fontWeight: '600',
                        transition: 'all 0.3s',
                      }}>
                        {step > s.n ? <Check size={14} /> : s.n}
                      </div>
                      <span style={{ color: step >= s.n ? 'white' : 'rgba(255,255,255,0.35)', fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{
                        flex: 1,
                        height: '1px',
                        background: step > s.n ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
                        margin: '0 8px',
                        marginBottom: '24px',
                        transition: 'background 0.3s',
                      }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="bf-body" style={{ padding: '40px' }}>

              {/* STEP 1: Dates */}
              {step === 1 && (
                <div>
                  <div style={{ marginBottom: '28px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '8px' }}>
                      When would you like to arrive?
                    </h3>
                    <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                      The villa is booked whole-house at {RATES.nightlyRate} {RATES.nightlyUnit}, for up to {VILLA.sleeps} guests.
                      Minimum stay is {VILLA.minNights} nights — once you pick an arrival date, any departure
                      shorter than that is greyed out in the calendar.
                    </p>
                    <p style={{ color: 'var(--gold-dark)', fontSize: '0.8125rem', lineHeight: 1.65, marginTop: '10px', fontWeight: '500' }}>
                      We are fully booked until {formatDate(openFrom)} — the calendar opens from that date.
                    </p>
                  </div>

                  <div className="bf-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <label htmlFor="bf-checkin" style={{ display: 'block', fontSize: '0.6875rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '10px', fontWeight: '500' }}>
                        Arrival
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', pointerEvents: 'none' }} />
                        <input
                          id="bf-checkin"
                          type="date"
                          min={openFrom}
                          value={checkIn}
                          onChange={e => pickCheckIn(e.target.value)}
                          style={{
                            width: '100%', padding: '14px 14px 14px 40px',
                            border: '1px solid var(--light-gray)',
                            fontSize: '0.875rem', color: 'var(--charcoal)',
                            outline: 'none', background: 'white',
                            fontFamily: 'var(--font-body)',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="bf-checkout" style={{ display: 'block', fontSize: '0.6875rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '10px', fontWeight: '500' }}>
                        Departure
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', pointerEvents: 'none' }} />
                        <input
                          id="bf-checkout"
                          type="date"
                          min={checkIn ? addDays(checkIn, VILLA.minNights) : openFrom}
                          value={checkOut}
                          onChange={e => setCheckOut(e.target.value)}
                          disabled={!checkIn}
                          style={{
                            width: '100%', padding: '14px 14px 14px 40px',
                            border: '1px solid var(--light-gray)',
                            fontSize: '0.875rem', color: 'var(--charcoal)',
                            outline: 'none', background: !checkIn ? 'var(--cream)' : 'white',
                            fontFamily: 'var(--font-body)',
                            opacity: !checkIn ? 0.5 : 1,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dates only — the cost is shown once on the review step, so
                      guests are picking dates here rather than watching a total. */}
                  {nights >= VILLA.minNights && (
                    <div style={{
                      border: '1px solid rgba(201,168,76,0.3)', background: 'var(--cream)',
                      padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                      <Check size={16} style={{ color: 'var(--gold-dark)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: '500', color: 'var(--charcoal)', fontSize: '0.9375rem' }}>
                          {nights} nights
                        </div>
                        <div style={{ color: 'var(--gray)', fontSize: '0.8125rem', marginTop: '2px' }}>
                          {formatDate(checkIn)} → {formatDate(checkOut)}
                        </div>
                      </div>
                    </div>
                  )}

                  {checkIn && !checkOut && (
                    <p style={{ color: 'var(--gray)', fontSize: '0.8125rem', lineHeight: 1.65 }}>
                      Now choose your departure date. Anything less than {VILLA.minNights} nights
                      after {formatDate(checkIn)} is unavailable.
                    </p>
                  )}

                  {checkIn && checkOut && !stayCheck.ok && (
                    <p style={{ color: '#c0392b', fontSize: '0.8125rem', marginTop: '4px', lineHeight: 1.6 }}>
                      {stayCheck.reason}
                    </p>
                  )}

                  <div style={{ marginTop: '22px', padding: '16px 20px', background: 'white', border: '1px solid var(--light-gray)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Star size={16} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '0.8125rem', color: 'var(--gray)', lineHeight: 1.65 }}>
                      Planning a wedding or celebration? The villa hosts up to {VILLA.eventCapacity} guests for events,
                      with {VILLA.sleeps} sleeping on site. Mention it in your requests and the team will make arrangements.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Extras */}
              {step === 2 && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '8px' }}>
                      Anything we can arrange?
                    </h3>
                    <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                      Your chef, butler, housekeeping, concierge and security are already part of the villa.
                      Select anything else you'd like and we'll include it in your quote — these are settled
                      directly with the villa, separately from the instalments above.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {BOOKING_SERVICES.map(service => {
                      const on = !!selected[service.id]
                      return (
                        <div
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '18px 20px',
                            border: on ? '1.5px solid var(--gold)' : '1px solid var(--light-gray)',
                            background: on ? 'rgba(201,168,76,0.04)' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.25s',
                          }}
                          onMouseEnter={e => { if (!on) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)' }}
                          onMouseLeave={e => { if (!on) e.currentTarget.style.borderColor = 'var(--light-gray)' }}
                        >
                          <div style={{ color: on ? 'var(--gold)' : 'var(--gray)', width: '32px', display: 'flex', justifyContent: 'center' }}>
                            {SERVICE_ICONS[service.id]}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: '500', fontSize: '0.9375rem', color: 'var(--charcoal)' }}>{service.title}</span>
                              <span style={{ fontSize: '0.6875rem', color: 'var(--gray)', background: 'var(--light-gray)', padding: '2px 8px', borderRadius: '2px' }}>{service.subtitle}</span>
                            </div>
                            <p style={{ color: 'var(--gray)', fontSize: '0.75rem', marginTop: '4px', lineHeight: '1.5' }}>{service.desc}</p>
                          </div>
                          <div style={{
                            width: '22px', height: '22px', borderRadius: '50%',
                            background: on ? 'var(--gold)' : 'transparent',
                            border: on ? '2px solid var(--gold)' : '2px solid var(--light-gray)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.25s', flexShrink: 0,
                          }}>
                            {on && <Check size={12} color="white" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Review & Contact */}
              {step === 3 && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '8px' }}>
                      Review &amp; reserve
                    </h3>
                    <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                      Paying the first instalment of {money(parts[0])} holds your dates. You will be taken to
                      Stripe to pay securely — card details are entered on Stripe's page and never touch this site.
                    </p>
                  </div>

                  {/* Summary card */}
                  <div style={{ border: '1px solid var(--light-gray)', marginBottom: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', borderBottom: '1px solid var(--light-gray)' }}>
                      {[
                        { label: 'Arrival', val: formatDate(checkIn) },
                        { label: 'Departure', val: formatDate(checkOut) },
                        { label: 'Nights', val: `${nights}` },
                        { label: 'Villa total', val: money(total) },
                      ].map(item => (
                        <div key={item.label} style={{ padding: '18px 20px', borderRight: '1px solid var(--light-gray)' }}>
                          <div style={{ fontSize: '0.625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '6px' }}>{item.label}</div>
                          <div style={{ fontWeight: '500', color: 'var(--charcoal)', fontSize: '0.875rem' }}>{item.val}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '20px' }}>
                      <div style={{ fontSize: '0.6875rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '10px' }}>Requested Extras</div>
                      {selectedServices.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {selectedServices.map(s => (
                            <span key={s.id} style={{
                              background: 'var(--cream)',
                              border: '1px solid rgba(201,168,76,0.25)',
                              color: 'var(--charcoal)',
                              padding: '6px 14px',
                              fontSize: '0.75rem',
                              letterSpacing: '0.05em',
                            }}>{s.title}</span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--gray)', fontSize: '0.8125rem' }}>None — your chef, butler, housekeeping, concierge, and security are always part of your stay.</p>
                      )}
                      <p style={{ color: 'var(--gray)', fontSize: '0.6875rem', marginTop: '14px', lineHeight: 1.6 }}>
                        * The villa total above covers exclusive use of the property, its staff and your meals, with
                        tax included. Special meals, Kingston transfers, excursions, spa treatments and the bar are
                        settled directly with the villa during your stay, along with a ${VILLA.incidentalDeposit} incidental deposit.
                      </p>
                    </div>
                  </div>

                  {/* Payment terms */}
                  <div style={{ border: '1px solid rgba(201,168,76,0.25)', padding: '20px 22px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <Wallet size={15} style={{ color: 'var(--gold)' }} />
                      <span style={{ fontSize: '0.6875rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--charcoal)', fontWeight: '500' }}>
                        Payment schedule · {money(total)} total
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {PAYMENT_SCHEDULE.map((p, i) => (
                        <div key={p.id} style={{ display: 'flex', gap: '12px', alignItems: 'baseline', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                            <Check size={13} style={{ color: 'var(--gold-dark)', flexShrink: 0 }} />
                            <p style={{ fontSize: '0.7813rem', color: 'var(--gray)', lineHeight: 1.6 }}>
                              <strong style={{ color: 'var(--charcoal)', fontWeight: '500' }}>{Math.round(p.pct * 100)}% {p.label}</strong> — {p.when}
                            </p>
                          </div>
                          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '600', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                            {money(parts[i])}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p style={{ color: 'var(--gray)', fontSize: '0.6875rem', marginTop: '12px', lineHeight: 1.6 }}>
                      Only the first instalment is taken today. The villa will confirm your booking and arrange
                      the remaining two payments with you.
                    </p>
                  </div>

                  {/* Contact form */}
                  <div style={{ background: 'var(--cream)', padding: '24px', marginBottom: '8px' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '20px' }}>
                      Your Contact Details
                    </h4>
                    <div className="bf-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      {[
                        { field: 'firstName', label: 'First Name *', ph: 'John', type: 'text' },
                        { field: 'lastName', label: 'Last Name *', ph: 'Smith', type: 'text' },
                        { field: 'email', label: 'Email *', ph: 'john@example.com', type: 'email' },
                        { field: 'phone', label: 'Phone', ph: '+1 555 000 0000', type: 'tel' },
                        // Not a pricing input — the rate is the same whole-house
                        // either way. The chef needs a headcount to plan meals.
                        { field: 'partySize', label: `In your party (max ${VILLA.sleeps})`, ph: `e.g. ${VILLA.sleeps}`, type: 'text' },
                      ].map(f => (
                        <div key={f.field}>
                          <label style={{ display: 'block', fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '8px' }}>{f.label}</label>
                          <input
                            type={f.type}
                            placeholder={f.ph}
                            value={contact[f.field]}
                            onChange={setField(f.field)}
                            style={{
                              width: '100%', padding: '12px 14px',
                              border: '1px solid rgba(201,168,76,0.2)',
                              background: 'white', fontSize: '0.875rem', color: 'var(--charcoal)',
                              outline: 'none', fontFamily: 'var(--font-body)',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
                          />
                        </div>
                      ))}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '8px' }}>Special Requests</label>
                        <textarea
                          placeholder="Dietary requirements, celebrations, wedding plans, or any other requests..."
                          rows={3}
                          value={contact.requests}
                          onChange={setField('requests')}
                          style={{
                            width: '100%', padding: '12px 14px',
                            border: '1px solid rgba(201,168,76,0.2)',
                            background: 'white', fontSize: '0.875rem', color: 'var(--charcoal)',
                            outline: 'none', fontFamily: 'var(--font-body)',
                            resize: 'vertical',
                          }}
                          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p style={{ color: '#c0392b', fontSize: '0.8125rem', marginTop: '12px', lineHeight: 1.6 }}>{error}</p>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '36px', paddingTop: '28px', borderTop: '1px solid var(--light-gray)',
              }}>
                {step > 1 ? (
                  <button onClick={() => setStep(step - 1)} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'none', border: '1px solid var(--light-gray)',
                    padding: '12px 24px', color: 'var(--gray)', cursor: 'pointer',
                    fontSize: '0.8125rem', letterSpacing: '0.08em', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--charcoal)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--light-gray)'}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    onClick={() => canProceed() && setStep(step + 1)}
                    disabled={!canProceed()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: canProceed() ? 'linear-gradient(135deg, #c9a84c, #e8c96a)' : 'var(--light-gray)',
                      color: canProceed() ? '#0e0e0e' : 'var(--gray)',
                      border: 'none', padding: '14px 36px',
                      fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600',
                      cursor: canProceed() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { if (canProceed()) e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,168,76,0.4)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
                  >
                    {step === 1 ? 'Next: Extras' : 'Review & Pay'} <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={payDeposit}
                    disabled={!canSubmit}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: canSubmit ? 'linear-gradient(135deg, #c9a84c, #e8c96a)' : 'var(--light-gray)',
                      color: canSubmit ? '#0e0e0e' : 'var(--gray)',
                      border: 'none',
                      padding: '15px 34px',
                      fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: '700',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      boxShadow: canSubmit ? '0 4px 20px rgba(201,168,76,0.35)' : 'none',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { if (canSubmit) e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,168,76,0.5)' }}
                    onMouseLeave={e => { if (canSubmit) e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.35)' }}
                  >
                    {sending
                      ? <><LoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} /> Opening payment…</>
                      : <><Lock size={15} /> Pay first instalment · {money(parts[0])}</>}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 620px) {
          .bf-header { padding: 26px 20px !important; }
          .bf-body { padding: 24px 20px !important; }
          /* Side-by-side fields get too narrow to type in on a phone */
          .bf-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
