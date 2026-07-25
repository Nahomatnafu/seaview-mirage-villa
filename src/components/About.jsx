import React from 'react'
import { Waves, Sun, Star } from 'lucide-react'

export default function About() {
  return (
    <section id="about" className="section-padding" style={{ background: 'var(--warm-white)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          {/* Images mosaic */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: 'auto auto',
              gap: '12px',
            }}>
              <div style={{ gridColumn: '1 / 3', height: '340px', overflow: 'hidden', borderRadius: '2px' }}>
                <img
                  src="/assets/alfresco-dining.jpg"
                  alt="Alfresco dining on the pool deck with Caribbean Sea views"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
              </div>
              <div style={{ height: '220px', overflow: 'hidden', borderRadius: '2px' }}>
                <img
                  src="/assets/balcony-view.jpg"
                  alt="Balcony view over the pool and sea"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
              </div>
              <div style={{ height: '220px', overflow: 'hidden', borderRadius: '2px' }}>
                <img
                  src="/assets/villa-night.jpg"
                  alt="The villa lit up at night"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
              </div>
            </div>
            {/* Gold accent badge */}
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              background: 'var(--charcoal)',
              border: '1px solid var(--gold)',
              padding: '20px 24px',
              textAlign: 'center',
              minWidth: '140px',
            }}>
              <div style={{ color: 'var(--gold)', fontSize: '32px', fontFamily: 'var(--font-heading)', fontWeight: '500', lineHeight: 1 }}>7</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '6px' }}>En-suite Bedrooms</div>
            </div>
          </div>

          {/* Text content */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
              <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' }}>About the Villa</span>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(36px, 4vw, 56px)',
              fontWeight: '300',
              lineHeight: '1.15',
              color: 'var(--charcoal)',
              marginBottom: '24px',
            }}>
              A Caribbean<br /><em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>sanctuary</em> like<br />no other
            </h2>

            <p style={{ color: 'var(--gray)', lineHeight: '1.85', marginBottom: '20px', fontSize: '15px' }}>
              Nestled in the hills of Discovery Bay, St. Ann, Sea View Mirage Villa offers a breathtaking panorama of the Caribbean Sea. Seven beautifully designed en-suite bedrooms — each with its own private balcony — sleep up to fourteen guests in refined tropical luxury.
            </p>
            <p style={{ color: 'var(--gray)', lineHeight: '1.85', marginBottom: '40px', fontSize: '15px' }}>
              The villa was built to be its owners' private home. They soon realized it was too spacious for just the two of them — and too special not to share. Today, a dedicated chef, butler, and housekeeping team deliver the same warm Jamaican hospitality it was designed around, making every stay effortless and personal.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              {[
                { icon: <Waves size={20} />, label: 'Sea Views', desc: 'From every balcony' },
                { icon: <Sun size={20} />, label: 'Private Pool', desc: 'Pool, bar & gazebo' },
                { icon: <Star size={20} />, label: 'Full Staff', desc: 'Chef, butler & more' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {f.icon}
                    <span style={{ fontSize: '13px', fontWeight: '500', letterSpacing: '0.06em' }}>{f.label}</span>
                  </div>
                  <p style={{ color: 'var(--gray)', fontSize: '13px' }}>{f.desc}</p>
                  <div style={{ width: '30px', height: '1px', background: 'var(--gold)', opacity: 0.5 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #about .container > div {
            grid-template-columns: 1fr !important;
            gap: 60px !important;
          }
        }
      `}</style>
    </section>
  )
}
