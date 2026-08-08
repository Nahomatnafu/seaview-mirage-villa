import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { VILLA } from '../content'

const exploreLinks = [
  { label: 'About', href: '#about' },
  { label: 'The Villa', href: '#rooms' },
  { label: 'Amenities', href: '#amenities' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Services', href: '#services' },
  { label: 'Rates & Booking', href: '#rates' },
  { label: "Chef's Menu", href: '#menu' },
  { label: 'Events & Weddings', href: '#events' },
  { label: 'Location', href: '#location' },
]

const serviceItems = [
  'Private Chef',
  'Butler Service',
  'Housekeeping',
  'Concierge',
  'Airport Transfer',
  'Island Excursions',
  'Spa Services',
]

export default function Footer({ onBookNow }) {
  return (
    <footer style={{ background: '#080808', borderTop: '1px solid rgba(201,168,76,0.15)', padding: '80px 0 40px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px', marginBottom: '60px' }}>
          {/* Brand */}
          <div>
            <img src="/assets/logo.png" alt={VILLA.name} style={{ height: '80px', marginBottom: '24px', filter: 'drop-shadow(0 2px 8px rgba(201,168,76,0.2))' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.8', maxWidth: '280px' }}>
              A private full-service luxury villa in the hills of Discovery Bay, Jamaica — where timeless elegance, personalized service, and natural beauty come together.
            </p>
            {/* Social links intentionally omitted until the client provides real profile URLs */}
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '500' }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {exploreLinks.map(l => (
                <li key={l.label}>
                  <a href={l.href} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', transition: 'color 0.3s', display: 'inline-block', padding: '7px 0' }}
                  onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                  >{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: 'white', fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '500' }}>Services</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {serviceItems.map(l => (
                <li key={l}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{l}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '500' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: <Phone size={14} />, text: `${VILLA.phoneUS} · US`, href: VILLA.phoneUSHref },
                { icon: <Phone size={14} />, text: `${VILLA.phoneJA} · Jamaica`, href: VILLA.phoneJAHref },
                { icon: <Mail size={14} />, text: VILLA.email, href: `mailto:${VILLA.email}` },
                { icon: <MapPin size={14} />, text: VILLA.fullAddress },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--gold)', marginTop: '2px', flexShrink: 0 }}>{c.icon}</span>
                  {c.href ? (
                    <a href={c.href} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', transition: 'color 0.3s', wordBreak: 'break-word', display: 'inline-block', padding: '6px 0' }}
                    onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                    >{c.text}</a>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>{c.text}</span>
                  )}
                </div>
              ))}
            </div>

            <button onClick={onBookNow} style={{
              marginTop: '28px',
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: '#0e0e0e',
              border: 'none',
              padding: '12px 28px',
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,168,76,0.4)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              Book Your Stay
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} {VILLA.name}. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '0.05em' }}>
            {VILLA.addressLine} · {VILLA.parish}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 560px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}
