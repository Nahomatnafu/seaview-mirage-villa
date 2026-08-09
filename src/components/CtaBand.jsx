import React from 'react'
import { Link } from 'react-router-dom'
import { useBooking } from '../booking'
import { VILLA } from '../content'

/* Closing call to action for inner pages, so none of them end on a dead stop. */
export default function CtaBand({ heading = 'Ready to see it for yourself?', sub, cta = 'Request a Quote', secondary }) {
  const openBooking = useBooking()

  return (
    <section style={{ background: 'var(--charcoal)', padding: '72px 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontSize: 'clamp(26px, 3.4vw, 40px)',
          fontWeight: '600', color: 'white', marginBottom: '14px',
        }}>
          {heading}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9375rem', lineHeight: 1.75, maxWidth: '500px', margin: '0 auto 32px' }}>
          {sub || `Send us your dates and we will reply within 24 hours with availability and a written quote. No payment to inquire.`}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
          <button onClick={() => openBooking()} style={{
            background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
            color: '#0e0e0e', border: 'none', padding: '16px 42px',
            fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: '600',
            boxShadow: '0 4px 24px rgba(201,168,76,0.3)', transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(201,168,76,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(201,168,76,0.3)' }}
          >
            {cta}
          </button>
          {secondary && (
            <Link to={secondary.to} style={{
              color: 'white', border: '1px solid rgba(255,255,255,0.35)', padding: '16px 42px',
              fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase',
              display: 'inline-block', transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = 'white' }}
            >
              {secondary.label}
            </Link>
          )}
        </div>
        {/* inline-block padding keeps these usable tap targets on a phone */}
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8125rem', marginTop: '18px', lineHeight: 2.1 }}>
          Or call{' '}
          <a href={VILLA.phoneUSHref} style={{ color: 'var(--gold-light)', display: 'inline-block', padding: '7px 3px' }}>{VILLA.phoneUS}</a> (US)
          {' · '}
          <a href={VILLA.phoneJAHref} style={{ color: 'var(--gold-light)', display: 'inline-block', padding: '7px 3px' }}>{VILLA.phoneJA}</a> (Jamaica)
        </p>
      </div>
    </section>
  )
}
