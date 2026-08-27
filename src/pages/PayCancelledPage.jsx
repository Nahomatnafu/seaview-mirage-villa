import React from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { VILLA } from '../content'

/** Where Stripe sends a guest who backs out of Checkout. Nothing was charged. */
export default function PayCancelledPage() {
  return (
    <section className="section-padding" style={{ background: 'var(--cream)', minHeight: '70vh', paddingTop: '150px' }}>
      <div className="container" style={{ maxWidth: '620px' }}>
        <div style={{ background: 'white', border: '1px solid rgba(201,168,76,0.2)', padding: '48px 36px', textAlign: 'center' }}>
          <RotateCcw size={26} style={{ color: 'var(--gold)', marginBottom: '18px' }} />
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '14px' }}>
            No payment was taken
          </h1>
          <p style={{ color: 'var(--gray)', fontSize: '0.9375rem', lineHeight: 1.85 }}>
            You left the payment page before finishing, so nothing has been charged. Your dates are not
            held until the first instalment is paid — start again whenever you are ready, or call us and
            we will take it from there.
          </p>
          <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.85, marginTop: '12px' }}>
            <a href={VILLA.phoneUSHref} style={{ color: 'var(--gold-dark)', borderBottom: '1px solid rgba(166,135,78,0.4)', display: 'inline-block', padding: '4px 2px' }}>{VILLA.phoneUS}</a>
            {' · '}
            <a href={`mailto:${VILLA.email}`} style={{ color: 'var(--gold-dark)', borderBottom: '1px solid rgba(166,135,78,0.4)', display: 'inline-block', padding: '4px 2px', wordBreak: 'break-word' }}>{VILLA.email}</a>
          </p>

          <Link to="/rates" style={{
            display: 'inline-block', marginTop: '28px',
            background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#0e0e0e',
            padding: '15px 40px', fontSize: '0.75rem',
            letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: '600',
          }}>
            Back to rates
          </Link>
        </div>
      </div>
    </section>
  )
}
