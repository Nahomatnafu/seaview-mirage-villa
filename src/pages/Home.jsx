import React from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import About from '../components/About'
import Amenities from '../components/Amenities'
import { useBooking } from '../booking'

const EXPLORE = [
  { path: '/villa', label: 'Inside the Villa', desc: 'Seven bedrooms, two kitchens, and the pool deck.', image: '/assets/villa/bedroom-04.jpg' },
  { path: '/gallery', label: 'Gallery', desc: '78 photographs of the villa and the island around it.', image: '/assets/villa/pool-09.jpg' },
  { path: '/menu', label: "The Chef's Menu", desc: 'Six collections, cooked for you every day.', image: '/assets/menu/jamaican-joy.jpg' },
  { path: '/rates', label: 'Rates & Booking', desc: 'Published pricing and how to reserve.', image: '/assets/villa/exterior-09.jpg' },
]

export default function Home() {
  const openBooking = useBooking()
  return (
    <>
      <Hero onBookNow={() => openBooking()} />
      <About />
      <Amenities />

      <section className="section-padding" style={{ background: 'var(--warm-white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
              <span style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Explore</span>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '600', color: 'var(--charcoal)' }}>
              Take a <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>closer look</em>
            </h2>
          </div>

          <div className="home-explore" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2px' }}>
            {EXPLORE.map(c => (
              <Link key={c.path} to={c.path} className="explore-card" style={{
                position: 'relative', display: 'block', height: '320px',
                overflow: 'hidden', border: '1px solid rgba(201,168,76,0.15)',
              }}>
                <img src={c.image} alt="" aria-hidden="true" className="explore-img"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.9), rgba(10,10,10,0.15) 65%)' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '24px' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.375rem', fontWeight: '600', color: 'white', marginBottom: '6px' }}>{c.label}</div>
                  <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.8125rem', lineHeight: 1.6 }}>{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <style>{`
          .explore-card .explore-img { transition: transform 0.7s cubic-bezier(0.2,0.8,0.2,1); }
          .explore-card:hover .explore-img { transform: scale(1.06); }
          .explore-card:hover { border-color: rgba(201,168,76,0.55) !important; }
        `}</style>
      </section>
    </>
  )
}
