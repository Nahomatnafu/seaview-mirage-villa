import React, { useState } from 'react'
import { BedDouble, Bath, Users, DoorOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { VILLA, BED_CONFIG } from '../content'

// Photo tour of the villa's spaces. The client has not provided per-room
// names/photos yet — if they do, this can become a room-by-room carousel.
const spaces = [
  {
    name: 'Bedrooms & Suites',
    tag: 'Sleep',
    desc: 'Seven beautifully appointed bedrooms — three with king beds, including the master suite, and four with queens. Each has its own en-suite bathroom and private balcony framing panoramic views of the Caribbean Sea.',
    image: '/assets/villa/bedroom-04.jpg',
    features: ['3 King · 4 Queen', 'En-suite Bathrooms', 'Private Balconies', 'Central Air'],
  },
  {
    name: 'Kitchens & Dining',
    tag: 'Dine',
    desc: 'Two full kitchens keep large groups effortless. Your villa chef plans the menu with you before you travel, shops before you land, and cooks all three meals in true Jamaican style.',
    image: '/assets/villa/interior-09.jpg',
    features: ['Two Full Kitchens', 'Private Chef', 'Full-Board Meal Plan', 'Dining Room'],
  },
  {
    name: 'Pool Deck, Bar & Gazebo',
    tag: 'Unwind',
    desc: 'The heart of the villa: a sparkling pool wrapped by lounging areas, a bar, and a shaded gazebo — with guest half baths close at hand so nobody has to leave the sunshine.',
    image: '/assets/villa/pool-06.jpg',
    features: ['Swimming Pool', 'Bar & Gazebo', 'Lounging Areas', 'Guest Half Baths'],
  },
  {
    name: 'Living & Entertainment',
    tag: 'Gather',
    desc: 'Expansive living spaces and a dedicated entertainment area flow onto ocean-view balconies — room for all fourteen guests to gather, or to find a quiet corner of their own.',
    image: '/assets/villa/interior-02.jpg',
    features: ['Entertainment Space', 'Ocean-view Balconies', 'Free WiFi', 'Central Air'],
  },
]

const stats = [
  { icon: <BedDouble size={18} />, num: VILLA.bedrooms, label: 'Bedrooms' },
  { icon: <Users size={18} />, num: VILLA.sleeps, label: 'Guests' },
  { icon: <Bath size={18} />, num: VILLA.bathrooms, label: 'En-suite Baths' },
  { icon: <DoorOpen size={18} />, num: VILLA.halfBaths, label: 'Guest Half Baths' },
]

export default function Rooms() {
  const [active, setActive] = useState(0)
  const space = spaces[active]

  return (
    <section id="rooms" className="section-padding" style={{ background: 'var(--cream)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Accommodations</span>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '600', color: 'var(--charcoal)' }}>
            Inside <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>the Villa</em>
          </h2>
        </div>

        {/* Stat band */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '18px 56px', marginBottom: '22px',
        }}>
          {stats.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--gold)', display: 'flex' }}>{s.icon}</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '600', color: 'var(--charcoal)', lineHeight: 1 }}>{s.num}</span>
              <span style={{ color: 'var(--gray)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Bed breakdown */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center',
          gap: '10px 20px', marginBottom: '52px',
          color: 'var(--gray)', fontSize: '13px', letterSpacing: '0.04em',
        }}>
          {BED_CONFIG.map((b, i) => (
            <React.Fragment key={b.id}>
              {i > 0 && <span style={{ color: 'var(--gold)', opacity: 0.5 }}>·</span>}
              <span>
                <strong style={{ color: 'var(--charcoal)', fontWeight: '500' }}>{b.count}</strong> {b.label}
                <span style={{ opacity: 0.75 }}> — {b.note.toLowerCase()}</span>
              </span>
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', minHeight: '560px', overflow: 'hidden', borderRadius: '2px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
          {/* Image */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              key={active}
              src={space.image}
              alt={space.name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                animation: 'fadeIn 0.5s ease',
                minHeight: '460px',
              }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(250,247,242,0.3))' }} />

            {/* Nav arrows */}
            <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setActive((active - 1 + spaces.length) % spaces.length)} style={{
                width: '44px', height: '44px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.3)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
              >
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setActive((active + 1) % spaces.length)} style={{
                width: '44px', height: '44px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.3)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Details */}
          <div style={{ background: 'white', padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>{space.tag}</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '20px', lineHeight: 1.2 }}>
              {space.name}
            </h3>
            <p style={{ color: 'var(--gray)', lineHeight: '1.8', marginBottom: '32px', fontSize: '14px' }}>{space.desc}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '36px' }}>
              {space.features.map(f => (
                <span key={f} style={{
                  background: 'var(--cream)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  color: 'var(--charcoal)',
                  padding: '6px 14px',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                }}>{f}</span>
              ))}
            </div>

            {/* Dots. The visible bar is 2px tall, so each button carries vertical
                padding to stay a usable tap target on touch screens. */}
            <div style={{ display: 'flex', gap: '8px', margin: '-15px 0' }}>
              {spaces.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show ${spaces[i].name}`}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '15px 0', display: 'flex', alignItems: 'center',
                  }}
                >
                  <span style={{
                    display: 'block',
                    width: i === active ? '28px' : '8px',
                    height: '2px',
                    background: i === active ? 'var(--gold)' : 'var(--light-gray)',
                    transition: 'all 0.3s ease',
                  }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          #rooms .container > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
