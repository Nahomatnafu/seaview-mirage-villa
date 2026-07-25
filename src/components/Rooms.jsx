import React, { useState } from 'react'
import { BedDouble, Bath, Users, DoorOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { VILLA } from '../content'

// Photo tour of the villa's spaces. The client has not provided per-room
// names/details yet — if they do, this can become a room-by-room carousel.
const spaces = [
  {
    name: 'Bedrooms & Suites',
    tag: 'Sleep',
    desc: 'Seven beautifully appointed bedrooms, each with its own en-suite bathroom and private balcony framing panoramic views of the Caribbean Sea. Cool, quiet, and made for deep island rest.',
    image: '/assets/bedroom.jpg',
    features: ['En-suite Bathrooms', 'Private Balconies', 'Sea Views', 'Central Air'],
  },
  {
    name: 'Kitchens & Dining',
    tag: 'Dine',
    desc: 'Two full kitchens keep large groups effortless. Your private chef prepares breakfast every morning — included with your stay — and cooks lunch and dinner to order in true Jamaican style.',
    image: '/assets/kitchen.jpg',
    features: ['Two Full Kitchens', 'Breakfast Included', 'Private Chef', 'Dining Room'],
  },
  {
    name: 'Pool Deck, Bar & Gazebo',
    tag: 'Unwind',
    desc: 'The heart of the villa: a sparkling pool wrapped by lounging areas, a bar, and a shaded gazebo — with two half baths right on the deck so nobody has to leave the sunshine.',
    image: '/assets/pool-palm.jpg',
    features: ['Swimming Pool', 'Bar & Gazebo', 'Lounging Areas', 'Pool-deck Baths'],
  },
  {
    name: 'Living & Entertainment',
    tag: 'Gather',
    desc: 'Expansive living spaces and a dedicated entertainment area flow onto ocean-view balconies — room for all fourteen guests to gather, or to find a quiet corner of their own.',
    image: '/assets/dining-room.jpg',
    features: ['Entertainment Space', 'Ocean-view Balconies', 'Free WiFi', 'Mountain Bikes'],
  },
]

const stats = [
  { icon: <BedDouble size={18} />, num: VILLA.bedrooms, label: 'En-suite Bedrooms' },
  { icon: <Users size={18} />, num: VILLA.sleeps, label: 'Guests' },
  { icon: <Bath size={18} />, num: VILLA.powderRooms, label: 'Powder Rooms' },
  { icon: <DoorOpen size={18} />, num: VILLA.poolDeckBaths, label: 'Pool-deck Baths' },
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '300', color: 'var(--charcoal)' }}>
            Inside <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>the Villa</em>
          </h2>
        </div>

        {/* Stat band */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '18px 56px', marginBottom: '52px',
        }}>
          {stats.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--gold)', display: 'flex' }}>{s.icon}</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '500', color: 'var(--charcoal)', lineHeight: 1 }}>{s.num}</span>
              <span style={{ color: 'var(--gray)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{s.label}</span>
            </div>
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '400', color: 'var(--charcoal)', marginBottom: '20px', lineHeight: 1.2 }}>
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

            {/* Dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {spaces.map((_, i) => (
                <button key={i} onClick={() => setActive(i)} style={{
                  width: i === active ? '28px' : '8px',
                  height: '2px',
                  background: i === active ? 'var(--gold)' : 'var(--light-gray)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }} />
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
