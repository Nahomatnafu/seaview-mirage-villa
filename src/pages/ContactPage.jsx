import React from 'react'
import { Phone, Mail, MapPin, Clock, CalendarDays } from 'lucide-react'
import Location from '../components/Location'
import CtaBand from '../components/CtaBand'
import { VILLA } from '../content'

const DETAILS = [
  { id: 'us', icon: <Phone size={18} />, label: 'Call — United States', value: VILLA.phoneUS, href: VILLA.phoneUSHref },
  { id: 'ja', icon: <Phone size={18} />, label: 'Call — Jamaica', value: VILLA.phoneJA, href: VILLA.phoneJAHref },
  { id: 'email', icon: <Mail size={18} />, label: 'Email', value: VILLA.email, href: `mailto:${VILLA.email}` },
  { id: 'addr', icon: <MapPin size={18} />, label: 'Address', value: VILLA.fullAddress },
  { id: 'times', icon: <Clock size={18} />, label: 'Check-in / Check-out', value: `${VILLA.checkIn} / ${VILLA.checkOut}` },
  { id: 'min', icon: <CalendarDays size={18} />, label: 'Minimum stay', value: `${VILLA.minNights} nights` },
]

export default function ContactPage() {
  return (
    <>
      <section className="section-padding" style={{ background: 'var(--warm-white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
              <span style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Get in Touch</span>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '600', color: 'var(--charcoal)' }}>
              Speak to <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>the villa</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2px' }}>
            {DETAILS.map(d => (
              <div key={d.id} style={{
                padding: '30px 28px', background: 'white',
                border: '1px solid rgba(201,168,76,0.14)',
              }}>
                <div style={{ color: 'var(--gold)', marginBottom: '14px' }}>{d.icon}</div>
                <div style={{ fontSize: '0.6875rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '8px' }}>
                  {d.label}
                </div>
                {d.href ? (
                  <a href={d.href} style={{ color: 'var(--charcoal)', fontSize: '0.9375rem', fontWeight: '500', wordBreak: 'break-word', borderBottom: '1px solid rgba(201,168,76,0.4)', display: 'inline-block', padding: '5px 0' }}>
                    {d.value}
                  </a>
                ) : (
                  <div style={{ color: 'var(--charcoal)', fontSize: '0.9375rem', fontWeight: '500', lineHeight: 1.5 }}>{d.value}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Location />
      <CtaBand
        heading="Ready when you are"
        sub="Send your dates and we will reply within 24 hours with availability and a written quote."
        secondary={{ to: '/rates', label: 'View Rates' }}
      />
    </>
  )
}
