import React from 'react'
import { MapPin, Plane, Umbrella, Mountain, Waves, Fish } from 'lucide-react'
import { VILLA, NEARBY } from '../content'

const NEARBY_ICONS = {
  beach: <Umbrella size={16} />,
  grotto: <Mountain size={16} />,
  dolphin: <Fish size={16} />,
  falls: <Waves size={16} />,
  airport: <Plane size={16} />,
}

export default function Location() {
  return (
    <section id="location" className="section-padding" style={{ background: 'var(--charcoal)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          {/* Text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
              <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Getting Here</span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '300', color: 'white', marginBottom: '24px' }}>
              Discovery Bay<br /><em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>St. Ann, Jamaica</em>
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: '1.85', marginBottom: '40px', fontSize: '15px' }}>
              Sea View Mirage Villa sits in the hills above Discovery Bay on Jamaica's north coast, with commanding views of the Caribbean Sea. The island's favorite attractions are minutes away, and Montego Bay airport is a scenic 45-minute drive — the villa collects you from there at no charge. Guests use nearby Puerto Seco Beach on villa guest passes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {NEARBY.map(n => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                    <span style={{ color: 'var(--gold)' }}>{NEARBY_ICONS[n.id]}</span>
                    {n.place}
                  </div>
                  <span style={{ color: 'var(--gold)', fontSize: '12px', letterSpacing: '0.08em' }}>{n.distance}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map with overlay */}
          <div style={{ position: 'relative', height: '500px', overflow: 'hidden', borderRadius: '2px' }}>
            <iframe
              src="https://maps.google.com/maps?q=Discovery%20Bay%2C%20St.%20Ann%2C%20Jamaica&z=13&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(0.4) brightness(0.85)' }}
              allowFullScreen=""
              loading="lazy"
              title="Villa Location"
            />
            <div style={{
              position: 'absolute',
              bottom: '24px', left: '24px',
              background: 'var(--charcoal)',
              border: '1px solid rgba(201,168,76,0.3)',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <MapPin size={18} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <div>
                <div style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>{VILLA.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px' }}>{VILLA.addressLine} · {VILLA.parish}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #location .container > div {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }
        }
      `}</style>
    </section>
  )
}
