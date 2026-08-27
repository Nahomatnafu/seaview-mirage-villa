import React from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { VILLA } from '../content'

/**
 * Landing page after a successful Stripe Checkout.
 *
 * Deliberately does not claim a specific amount was received. Stripe redirects
 * here as soon as the guest finishes, but the payment is only truly confirmed
 * by the webhook, so stating figures here could be wrong. Stripe's own receipt
 * email is the record.
 */
export default function PayThanksPage() {
  return (
    <section className="section-padding" style={{ background: 'var(--cream)', minHeight: '70vh', paddingTop: '150px' }}>
      <div className="container" style={{ maxWidth: '620px' }}>
        <div style={{ background: 'white', border: '1px solid rgba(201,168,76,0.2)', padding: '48px 36px', textAlign: 'center' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 26px',
          }}>
            <Check size={30} color="white" />
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '14px' }}>
            Thank you
          </h1>
          <p style={{ color: 'var(--gray)', fontSize: '0.9375rem', lineHeight: 1.85, marginBottom: '10px' }}>
            Your payment has gone through. Stripe will email you a receipt, and the villa will be in
            touch to confirm the next step.
          </p>
          <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.85 }}>
            If anything looks wrong, call{' '}
            <a href={VILLA.phoneUSHref} style={{ color: 'var(--gold-dark)', borderBottom: '1px solid rgba(166,135,78,0.4)', display: 'inline-block', padding: '4px 2px' }}>{VILLA.phoneUS}</a>
            {' '}or email{' '}
            <a href={`mailto:${VILLA.email}`} style={{ color: 'var(--gold-dark)', borderBottom: '1px solid rgba(166,135,78,0.4)', display: 'inline-block', padding: '4px 2px', wordBreak: 'break-word' }}>{VILLA.email}</a>.
          </p>

          <Link to="/" style={{
            display: 'inline-block', marginTop: '30px',
            background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#0e0e0e',
            padding: '15px 40px', fontSize: '0.75rem',
            letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: '600',
          }}>
            Back to the villa
          </Link>
        </div>
      </div>
    </section>
  )
}
