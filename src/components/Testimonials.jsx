import React, { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

// NOT RENDERED. This component is deliberately unmounted in App.jsx because
// the reviews below are invented placeholders, not real guests — publishing
// them as genuine would be deceptive and is prohibited by the FTC's 2024 rule
// on fake consumer reviews. Replace the array with real, attributable guest
// reviews, then un-comment <Testimonials /> in App.jsx.
const testimonials = [
  {
    name: 'Marcus & Priya Thompson',
    origin: 'New York, USA',
    text: "Sea View Mirage Villa was nothing short of transformative. The staff anticipated our every need, the sunsets from the pool deck were otherworldly, and the chef's jerk lobster is something I'll crave for years.",
    rating: 5,
    trip: 'Anniversary Retreat',
  },
  {
    name: 'The Whitfield Family',
    origin: 'London, UK',
    text: "We've stayed in many luxury villas worldwide, but this one stands apart. The seamless blend of Jamaican warmth and world-class luxury is rare. The driver, the housekeepers, and especially the chef made us feel like royalty.",
    rating: 5,
    trip: 'Family Vacation',
  },
  {
    name: 'James & Claire Beaumont',
    origin: 'Sydney, Australia',
    text: "From the moment our driver picked us up at the airport to the tearful goodbye, every single moment exceeded expectations. The villa's position above the sea is breathtaking. Pure paradise.",
    rating: 5,
    trip: 'Honeymoon',
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)

  const go = (dir) => {
    setAnimating(true)
    setTimeout(() => {
      setActive((active + dir + testimonials.length) % testimonials.length)
      setAnimating(false)
    }, 250)
  }

  return (
    <section style={{ background: 'var(--cream)', padding: '100px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Guest Stories</span>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '600', color: 'var(--charcoal)' }}>
            <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Reviews</em> from Our Guests
          </h2>
        </div>

        <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
          <Quote size={40} style={{ color: 'var(--gold)', opacity: 0.4, marginBottom: '32px' }} />

          <div style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.25s ease', minHeight: '200px' }}>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              fontWeight: '600',
              fontStyle: 'italic',
              lineHeight: '1.7',
              color: 'var(--charcoal)',
              marginBottom: '36px',
            }}>
              "{testimonials[active].text}"
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
              {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                <Star key={i} size={14} fill="var(--gold)" stroke="var(--gold)" />
              ))}
            </div>

            <div style={{ fontWeight: '500', fontSize: '0.9375rem', color: 'var(--charcoal)', letterSpacing: '0.05em' }}>{testimonials[active].name}</div>
            <div style={{ color: 'var(--gray)', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '4px' }}>
              {testimonials[active].origin} · {testimonials[active].trip}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '44px' }}>
            <button onClick={() => go(-1)} style={{
              width: '44px', height: '44px', border: '1px solid rgba(201,168,76,0.3)',
              background: 'white', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--gold)' }}
            >
              <ChevronLeft size={18} />
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActive(i)} style={{
                  width: i === active ? '28px' : '8px',
                  height: '2px',
                  background: i === active ? 'var(--gold)' : 'rgba(201,168,76,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }} />
              ))}
            </div>

            <button onClick={() => go(1)} style={{
              width: '44px', height: '44px', border: '1px solid rgba(201,168,76,0.3)',
              background: 'white', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--gold)' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
