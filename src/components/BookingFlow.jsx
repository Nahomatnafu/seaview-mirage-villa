import React, { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Check, Calendar, Users, ChefHat, ShoppingBasket, Car, Leaf, Waves, PartyPopper, Star, LoaderCircle } from 'lucide-react'
import { VILLA, BOOKING_SERVICES, INQUIRY_ENDPOINT } from '../content'

const SERVICE_ICONS = {
  chefmeals: <ChefHat size={24} />,
  stocking: <ShoppingBasket size={24} />,
  transfer: <Car size={24} />,
  spa: <Leaf size={24} />,
  watersports: <Waves size={24} />,
  events: <PartyPopper size={24} />,
}

const GUEST_OPTIONS = [2, 4, 6, 8, 10, 12, 14]

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

export default function BookingFlow({ onClose, initialService = null }) {
  const [step, setStep] = useState(1) // 1: guests, 2: services, 3: dates, 4: review
  const [guests, setGuests] = useState(null)
  const [selected, setSelected] = useState(() => initialService ? { [initialService]: true } : {})
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '', requests: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const nights = diffDays(checkIn, checkOut)
  const selectedServices = BOOKING_SERVICES.filter(s => selected[s.id])

  const toggleService = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const setField = (field) => (e) => {
    setContact(prev => ({ ...prev, [field]: e.target.value }))
  }

  const canProceed = () => {
    if (step === 1) return guests !== null
    if (step === 2) return true
    if (step === 3) return nights >= VILLA.minNights
    return true
  }

  const canSubmit = contact.firstName.trim() && contact.lastName.trim() && contact.email.includes('@') && !sending

  const submitInquiry = async () => {
    setSending(true)
    setError(null)
    try {
      const res = await fetch(INQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `New booking inquiry — ${VILLA.name}`,
          _template: 'table',
          _honey: '',
          Name: `${contact.firstName.trim()} ${contact.lastName.trim()}`,
          Email: contact.email.trim(),
          Phone: contact.phone.trim() || 'Not provided',
          'Check-in': formatDate(checkIn),
          'Check-out': formatDate(checkOut),
          Nights: nights,
          Guests: guests,
          'Requested services': selectedServices.map(s => s.title).join(', ') || 'None',
          'Special requests': contact.requests.trim() || 'None',
        }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong sending your inquiry. Please try again, or email us directly at ' + VILLA.email)
    } finally {
      setSending(false)
    }
  }

  const steps = [
    { n: 1, label: 'Guests' },
    { n: 2, label: 'Services' },
    { n: 3, label: 'Dates' },
    { n: 4, label: 'Review' },
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
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: submitted ? '560px' : '820px',
        maxHeight: '92vh',
        overflowY: 'auto',
        position: 'relative',
        animation: 'fadeInUp 0.35s ease',
      }}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'none', border: 'none', cursor: 'pointer',
          zIndex: 10, color: 'var(--gray)',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--charcoal)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--gray)'}
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
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: '400', color: 'var(--charcoal)', marginBottom: '12px' }}>
              Inquiry Sent!
            </h2>
            <p style={{ color: 'var(--gray)', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px' }}>
              Thank you for choosing {VILLA.name}. Our team will reply to <strong>{contact.email}</strong> within 24 hours with availability and full pricing for your stay.
            </p>
            <div style={{ background: 'var(--cream)', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '4px' }}>Check-in</div>
                  <div style={{ fontWeight: '500', fontSize: '15px' }}>{formatDate(checkIn)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '4px' }}>Check-out</div>
                  <div style={{ fontWeight: '500', fontSize: '15px' }}>{formatDate(checkOut)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '4px' }}>Guests</div>
                  <div style={{ fontWeight: '500', fontSize: '15px' }}>{guests} guests</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '4px' }}>Services</div>
                  <div style={{ fontWeight: '500', fontSize: '15px' }}>{selectedServices.length > 0 ? `${selectedServices.length} requested` : 'None'}</div>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: '#0e0e0e', border: 'none',
              padding: '14px 44px', fontSize: '12px',
              letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600',
              cursor: 'pointer',
            }}>
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ background: 'var(--charcoal)', padding: '32px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <img src="/assets/logo.png" alt="logo" style={{ height: '44px' }} />
                <div>
                  <div style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '400' }}>Request Your Stay</div>
                  <div style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px' }}>{VILLA.name} · Discovery Bay, Jamaica</div>
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
                        fontSize: '13px', fontWeight: '600',
                        transition: 'all 0.3s',
                      }}>
                        {step > s.n ? <Check size={14} /> : s.n}
                      </div>
                      <span style={{ color: step >= s.n ? 'white' : 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
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
            <div style={{ padding: '40px' }}>

              {/* STEP 1: Guests */}
              {step === 1 && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '400', color: 'var(--charcoal)', marginBottom: '8px' }}>
                      How many guests?
                    </h3>
                    <p style={{ color: 'var(--gray)', fontSize: '14px' }}>{VILLA.name} accommodates up to {VILLA.sleeps} guests across {VILLA.bedrooms} en-suite bedrooms.</p>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {GUEST_OPTIONS.map(n => (
                      <button
                        key={n}
                        onClick={() => setGuests(n)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          width: '104px', height: '100px',
                          border: guests === n ? '2px solid var(--gold)' : '1px solid var(--light-gray)',
                          background: guests === n ? 'rgba(201,168,76,0.06)' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.25s',
                        }}
                        onMouseEnter={e => { if (guests !== n) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)' }}
                        onMouseLeave={e => { if (guests !== n) e.currentTarget.style.borderColor = 'var(--light-gray)' }}
                      >
                        <Users size={22} style={{ color: guests === n ? 'var(--gold)' : 'var(--gray)', marginBottom: '10px' }} />
                        <span style={{ fontSize: '22px', fontFamily: 'var(--font-heading)', fontWeight: '500', color: guests === n ? 'var(--gold-dark)' : 'var(--charcoal)', lineHeight: 1 }}>{n}</span>
                        <span style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '4px', letterSpacing: '0.06em' }}>guests</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: '28px', padding: '16px 20px', background: 'var(--cream)', borderLeft: '3px solid var(--gold)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Star size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', color: 'var(--gray)', lineHeight: 1.6 }}>
                      Planning a wedding or event, or a group over {VILLA.sleeps}? Mention it in your special requests and our team will make custom arrangements.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Services */}
              {step === 2 && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '400', color: 'var(--charcoal)', marginBottom: '8px' }}>
                      Anything we can arrange?
                    </h3>
                    <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Your chef, butler, housekeeping, and concierge are already included. Select any extras you're interested in and we'll include them in your quote.</p>
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
                              <span style={{ fontWeight: '500', fontSize: '15px', color: 'var(--charcoal)' }}>{service.title}</span>
                              <span style={{ fontSize: '11px', color: 'var(--gray)', background: 'var(--light-gray)', padding: '2px 8px', borderRadius: '2px' }}>{service.subtitle}</span>
                            </div>
                            <p style={{ color: 'var(--gray)', fontSize: '12px', marginTop: '4px', lineHeight: '1.5' }}>{service.desc}</p>
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

              {/* STEP 3: Dates */}
              {step === 3 && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '400', color: 'var(--charcoal)', marginBottom: '8px' }}>
                      Select your dates
                    </h3>
                    <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Minimum stay of {VILLA.minNights} nights. Check-in {VILLA.checkIn} · Check-out {VILLA.checkOut}.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '10px', fontWeight: '500' }}>
                        Check-in Date
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', pointerEvents: 'none' }} />
                        <input
                          type="date"
                          min={today}
                          value={checkIn}
                          onChange={e => {
                            setCheckIn(e.target.value)
                            if (checkOut && e.target.value >= checkOut) setCheckOut('')
                          }}
                          style={{
                            width: '100%', padding: '14px 14px 14px 40px',
                            border: '1px solid var(--light-gray)',
                            fontSize: '14px', color: 'var(--charcoal)',
                            outline: 'none', background: 'white',
                            fontFamily: 'var(--font-body)',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '10px', fontWeight: '500' }}>
                        Check-out Date
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', pointerEvents: 'none' }} />
                        <input
                          type="date"
                          min={checkIn || today}
                          value={checkOut}
                          onChange={e => setCheckOut(e.target.value)}
                          disabled={!checkIn}
                          style={{
                            width: '100%', padding: '14px 14px 14px 40px',
                            border: '1px solid var(--light-gray)',
                            fontSize: '14px', color: 'var(--charcoal)',
                            outline: 'none', background: !checkIn ? 'var(--cream)' : 'white',
                            fontFamily: 'var(--font-body)',
                            opacity: !checkIn ? 0.5 : 1,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {nights > 0 && (
                    <div style={{ background: 'var(--cream)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--gold)' }}>
                      <div>
                        <span style={{ fontWeight: '500', color: 'var(--charcoal)', fontSize: '15px' }}>{nights} Night{nights !== 1 ? 's' : ''}</span>
                        <span style={{ color: 'var(--gray)', fontSize: '13px', marginLeft: '8px' }}>{formatDate(checkIn)} → {formatDate(checkOut)}</span>
                      </div>
                    </div>
                  )}

                  {nights > 0 && nights < VILLA.minNights && (
                    <p style={{ color: '#c0392b', fontSize: '13px', marginTop: '12px' }}>Minimum stay is {VILLA.minNights} nights. Please adjust your dates.</p>
                  )}
                </div>
              )}

              {/* STEP 4: Review & Contact */}
              {step === 4 && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '400', color: 'var(--charcoal)', marginBottom: '8px' }}>
                      Review your inquiry
                    </h3>
                    <p style={{ color: 'var(--gray)', fontSize: '14px' }}>No payment now — our team replies within 24 hours with availability and full pricing.</p>
                  </div>

                  {/* Summary card */}
                  <div style={{ border: '1px solid var(--light-gray)', marginBottom: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', borderBottom: '1px solid var(--light-gray)' }}>
                      {[
                        { label: 'Check-in', val: formatDate(checkIn) },
                        { label: 'Check-out', val: formatDate(checkOut) },
                        { label: 'Nights', val: `${nights}` },
                        { label: 'Guests', val: `${guests}` },
                      ].map(item => (
                        <div key={item.label} style={{ padding: '18px 20px', borderRight: '1px solid var(--light-gray)' }}>
                          <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '6px' }}>{item.label}</div>
                          <div style={{ fontWeight: '500', color: 'var(--charcoal)', fontSize: '14px' }}>{item.val}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '20px' }}>
                      <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '10px' }}>Requested Services</div>
                      {selectedServices.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {selectedServices.map(s => (
                            <span key={s.id} style={{
                              background: 'var(--cream)',
                              border: '1px solid rgba(201,168,76,0.25)',
                              color: 'var(--charcoal)',
                              padding: '6px 14px',
                              fontSize: '12px',
                              letterSpacing: '0.05em',
                            }}>{s.title}</span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--gray)', fontSize: '13px' }}>None — your included chef, butler, and housekeeping are always part of your stay.</p>
                      )}
                      <p style={{ color: 'var(--gray)', fontSize: '11px', marginTop: '14px' }}>
                        * This is a quote request, not a confirmed booking. Rates depend on dates, group size, and services.
                      </p>
                    </div>
                  </div>

                  {/* Contact form */}
                  <div style={{ background: 'var(--cream)', padding: '24px', marginBottom: '8px' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '500', color: 'var(--charcoal)', marginBottom: '20px' }}>
                      Your Contact Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      {[
                        { field: 'firstName', label: 'First Name *', ph: 'John', type: 'text' },
                        { field: 'lastName', label: 'Last Name *', ph: 'Smith', type: 'text' },
                        { field: 'email', label: 'Email *', ph: 'john@example.com', type: 'email' },
                        { field: 'phone', label: 'Phone', ph: '+1 555 000 0000', type: 'tel' },
                      ].map(f => (
                        <div key={f.field}>
                          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '8px' }}>{f.label}</label>
                          <input
                            type={f.type}
                            placeholder={f.ph}
                            value={contact[f.field]}
                            onChange={setField(f.field)}
                            style={{
                              width: '100%', padding: '12px 14px',
                              border: '1px solid rgba(201,168,76,0.2)',
                              background: 'white', fontSize: '14px', color: 'var(--charcoal)',
                              outline: 'none', fontFamily: 'var(--font-body)',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
                          />
                        </div>
                      ))}
                      <div style={{ gridColumn: '1 / 3' }}>
                        <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '8px' }}>Special Requests</label>
                        <textarea
                          placeholder="Dietary requirements, celebrations, wedding plans, or any other requests..."
                          rows={3}
                          value={contact.requests}
                          onChange={setField('requests')}
                          style={{
                            width: '100%', padding: '12px 14px',
                            border: '1px solid rgba(201,168,76,0.2)',
                            background: 'white', fontSize: '14px', color: 'var(--charcoal)',
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
                    <p style={{ color: '#c0392b', fontSize: '13px', marginTop: '12px', lineHeight: 1.6 }}>{error}</p>
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
                    fontSize: '13px', letterSpacing: '0.08em', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--charcoal)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--light-gray)'}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    onClick={() => canProceed() && setStep(step + 1)}
                    disabled={!canProceed()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: canProceed() ? 'linear-gradient(135deg, #c9a84c, #e8c96a)' : 'var(--light-gray)',
                      color: canProceed() ? '#0e0e0e' : 'var(--gray)',
                      border: 'none', padding: '14px 36px',
                      fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600',
                      cursor: canProceed() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { if (canProceed()) e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,168,76,0.4)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
                  >
                    {step === 2 ? 'Next: Dates' : step === 3 ? 'Review Inquiry' : 'Continue'} <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={submitInquiry}
                    disabled={!canSubmit}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: canSubmit ? 'linear-gradient(135deg, #c9a84c, #e8c96a)' : 'var(--light-gray)',
                      color: canSubmit ? '#0e0e0e' : 'var(--gray)',
                      border: 'none',
                      padding: '15px 40px',
                      fontSize: '12px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: '700',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      boxShadow: canSubmit ? '0 4px 20px rgba(201,168,76,0.35)' : 'none',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { if (canSubmit) e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,168,76,0.5)' }}
                    onMouseLeave={e => { if (canSubmit) e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.35)' }}
                  >
                    {sending && <LoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                    {sending ? 'Sending…' : 'Send Inquiry'}
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
      `}</style>
    </div>
  )
}
