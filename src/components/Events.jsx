import React from 'react'
import { Heart, ConciergeBell, ChefHat, Users } from 'lucide-react'
import { VILLA } from '../content'

const highlights = [
  { icon: <Users size={16} />, label: `Up to ${VILLA.eventCapacity} guests for your celebration` },
  { icon: <Heart size={16} />, label: 'Ocean-view ceremony spaces' },
  { icon: <ConciergeBell size={16} />, label: 'Concierge on-site for your event' },
  { icon: <ChefHat size={16} />, label: `Chef & wait staff, with ${VILLA.sleeps} sleeping on-site` },
]

export default function Events({ onBookNow }) {
  return (
    <section id="events" style={{ background: 'var(--dark)', padding: '100px 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          {/* Image */}
          <div style={{ position: 'relative', height: '460px', overflow: 'hidden', borderRadius: '2px' }}>
            <img
              src="/assets/wedding.jpg"
              alt="Wedding ceremony setup at the villa overlooking the Caribbean Sea"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,14,14,0.35), transparent 50%)' }} />
          </div>

          {/* Text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
              <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Weddings & Celebrations</span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '300', color: 'white', marginBottom: '24px', lineHeight: 1.15 }}>
              Your dream wedding<br /><em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>in paradise</em>
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: '1.85', marginBottom: '32px', fontSize: '15px' }}>
              Celebrate your special day with breathtaking ocean views, elegant spaces, and a private luxury setting made for weddings, milestone birthdays, and family celebrations of up to {VILLA.eventCapacity} guests. Your concierge is on-site throughout the event, and the villa's chef and wait staff take care of every detail.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
              {highlights.map(h => (
                <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'var(--gold)', display: 'flex' }}>{h.icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', letterSpacing: '0.03em' }}>{h.label}</span>
                </div>
              ))}
            </div>

            <button onClick={() => onBookNow('events')} style={{
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
              Plan Your Event
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #events .container > div {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }
        }
      `}</style>
    </section>
  )
}
