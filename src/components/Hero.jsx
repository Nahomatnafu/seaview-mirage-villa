import React, { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Hero({ onBookNow }) {
  const parallaxRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.4}px)`
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section id="hero" style={{ position: 'relative', height: '100vh', minHeight: '700px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background. This 4:3 frame crops to the villa's balconies on a tall
          phone screen. Portrait alternatives were tried and read worse — one was
          mostly foreground planting, another put balustrades straight behind the
          headline — so the landscape frame is used at every width. */}
      <div ref={parallaxRef} className="hero-bg" style={{
        position: 'absolute',
        inset: '-10%',
        backgroundImage: `url('/assets/villa/exterior-08.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 55%',
        willChange: 'transform',
      }} />

      {/* Overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.75) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.06) 0%, transparent 70%)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Ornament line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '28px', opacity: 0, animation: 'fadeInUp 0.8s ease 0.2s forwards' }}>
          <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
          <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', fontWeight: '400' }}>Discovery Bay · St. Ann · Jamaica</span>
          <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(52px, 8vw, 96px)',
          fontWeight: '300',
          color: 'white',
          lineHeight: '1.05',
          letterSpacing: '-0.01em',
          marginBottom: '10px',
          opacity: 0,
          animation: 'fadeInUp 0.9s ease 0.4s forwards',
        }}>
          Sea View<br />
          <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Mirage</em> Villa
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: 'clamp(15px, 2vw, 18px)',
          fontWeight: '300',
          letterSpacing: '0.05em',
          maxWidth: '540px',
          margin: '0 auto 40px',
          opacity: 0,
          animation: 'fadeInUp 0.9s ease 0.6s forwards',
        }}>
          It's time to discover your private Caribbean paradise — a full-service luxury villa in the hills of Discovery Bay, with panoramic sea views from every balcony.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', opacity: 0, animation: 'fadeInUp 0.9s ease 0.8s forwards' }}>
          <button onClick={onBookNow} style={{
            background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
            color: '#0e0e0e',
            border: 'none',
            padding: '16px 44px',
            fontSize: '12px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 24px rgba(201,168,76,0.35)',
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 36px rgba(201,168,76,0.5)' }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 24px rgba(201,168,76,0.35)' }}
          >
            Reserve Your Stay
          </button>
          <a href="#about" style={{
            color: 'white',
            border: '1px solid rgba(255,255,255,0.35)',
            padding: '16px 44px',
            fontSize: '12px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-block',
          }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)' }}
          onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.35)'; e.target.style.color = 'white' }}
          >
            Explore Villa
          </a>
        </div>

        {/* Stat pills */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '24px 40px', justifyContent: 'center', marginTop: '64px',
          opacity: 0, animation: 'fadeInUp 0.9s ease 1s forwards'
        }}>
          {[
            { num: '7', label: 'En-suite Bedrooms' },
            { num: '14', label: 'Guests' },
            { num: '∞', label: 'Sea Views' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--gold-light)', fontSize: '28px', fontFamily: 'var(--font-heading)', fontWeight: '500' }}>{stat.num}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        animation: 'fadeIn 1s ease 1.4s forwards', opacity: 0,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Scroll</span>
        <div style={{ animation: 'bounce 2s ease infinite' }}>
          <ChevronDown size={18} color="rgba(255,255,255,0.5)" />
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </section>
  )
}
