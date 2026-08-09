import React from 'react'

/* Banner at the top of every page except Home. It also gives the fixed navbar
   a dark surface to sit against, so page content never starts underneath it. */
export default function PageHeader({ eyebrow, heading, blurb, image }) {
  return (
    <header style={{
      position: 'relative',
      minHeight: '360px',
      display: 'flex',
      alignItems: 'flex-end',
      overflow: 'hidden',
      background: 'var(--charcoal)',
    }}>
      <img
        src={image}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.55) 55%, rgba(10,10,10,0.45) 100%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '0 40px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '34px', height: '1px', background: 'var(--gold)' }} />
          <span style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            {eyebrow}
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(34px, 5vw, 60px)',
          fontWeight: '600',
          color: 'white',
          lineHeight: 1.1,
          marginBottom: blurb ? '14px' : 0,
        }}>
          {heading}
        </h1>
        {blurb && (
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '520px' }}>
            {blurb}
          </p>
        )}
      </div>

      <style>{`
        @media (max-width: 760px) {
          header .container { padding: 0 20px 36px !important; }
        }
      `}</style>
    </header>
  )
}
