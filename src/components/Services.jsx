import React from 'react'
import { ChefHat, Bell, Sparkles, ConciergeBell, Shield, Flower2, Car, Leaf, Waves, PartyPopper, ArrowRight } from 'lucide-react'
import { INCLUDED_SERVICES, REQUEST_SERVICES } from '../content'

const SERVICE_ICONS = {
  chef: <ChefHat size={26} />,
  butler: <Bell size={26} />,
  housekeeping: <Sparkles size={26} />,
  concierge: <ConciergeBell size={26} />,
  security: <Shield size={26} />,
  grounds: <Flower2 size={26} />,
  transfer: <Car size={26} />,
  spa: <Leaf size={26} />,
  watersports: <Waves size={26} />,
  events: <PartyPopper size={26} />,
}

function GroupHeading({ children, note }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px 16px', margin: '0 0 24px' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '600', color: 'var(--charcoal)' }}>{children}</h3>
      <div style={{ flex: 1, minWidth: '40px', height: '1px', background: 'rgba(201,168,76,0.25)' }} />
      {note && <span style={{ color: 'var(--gray)', fontSize: '0.75rem', letterSpacing: '0.06em' }}>{note}</span>}
    </div>
  )
}

export default function Services({ onBookNow }) {
  return (
    <section id="services" className="section-padding" style={{ background: 'var(--warm-white)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Full-Service Luxury</span>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '16px' }}>
            Your Villa <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Staff & Services</em>
          </h2>
          <p style={{ color: 'var(--gray)', maxWidth: '520px', margin: '0 auto', fontSize: '0.9375rem', lineHeight: 1.7 }}>
            A dedicated team cares for you throughout your stay — and your concierge can arrange anything more.
          </p>
        </div>

        {/* Included staff */}
        <GroupHeading note="Included with every stay">Included with Your Stay</GroupHeading>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2px',
          marginBottom: '64px',
        }}>
          {INCLUDED_SERVICES.map(s => (
            <div key={s.id} style={{
              padding: '32px 30px',
              background: 'white',
              border: '1px solid rgba(201,168,76,0.1)',
              transition: 'all 0.35s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.06)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{ color: 'var(--gold)', display: 'flex' }}>{SERVICE_ICONS[s.id]}</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '21px', fontWeight: '600', color: 'var(--charcoal)' }}>{s.title}</h4>
              </div>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: '1.75' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* On request */}
        <GroupHeading note="Tell us in your booking inquiry">Available on Request</GroupHeading>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '2px',
        }}>
          {REQUEST_SERVICES.map(s => (
            <div key={s.id}
              onClick={() => onBookNow(s.id)}
              style={{
                padding: '32px 30px',
                background: 'var(--cream)',
                border: '1px solid rgba(201,168,76,0.15)',
                transition: 'all 0.35s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ color: 'var(--gold)', marginBottom: '16px' }}>{SERVICE_ICONS[s.id]}</div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '21px', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '12px' }}>{s.title}</h4>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: '1.75' }}>{s.desc}</p>
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-dark)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <span>Add to inquiry</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
