import React from 'react'
import { Waves, Utensils, Martini, Tv, UtensilsCrossed, Wifi, Wind, Shirt, Car, Bike, Camera, Accessibility, Clock, CalendarDays, Coffee, Shield, CigaretteOff } from 'lucide-react'
import { AMENITIES, GOOD_TO_KNOW } from '../content'

const AMENITY_ICONS = {
  pool: <Waves size={22} />,
  kitchens: <Utensils size={22} />,
  bar: <Martini size={22} />,
  entertainment: <Tv size={22} />,
  dining: <UtensilsCrossed size={22} />,
  wifi: <Wifi size={22} />,
  air: <Wind size={22} />,
  laundry: <Shirt size={22} />,
  parking: <Car size={22} />,
  bikes: <Bike size={22} />,
  views: <Camera size={22} />,
  access: <Accessibility size={22} />,
}

const POLICY_ICONS = {
  checkin: <Clock size={16} />,
  minstay: <CalendarDays size={16} />,
  breakfast: <Coffee size={16} />,
  security: <Shield size={16} />,
  smoking: <CigaretteOff size={16} />,
}

export default function Amenities() {
  return (
    <section id="amenities" style={{ background: 'var(--charcoal)', padding: '80px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' }}>What's Included</span>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '300', color: 'white' }}>
            Villa <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Amenities</em>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '2px',
        }}>
          {AMENITIES.map(a => (
            <div key={a.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '32px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(201,168,76,0.08)',
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(201,168,76,0.08)'
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.08)'
            }}
            >
              <div style={{ color: 'var(--gold)' }}>{AMENITY_ICONS[a.id]}</div>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>{a.label}</span>
            </div>
          ))}
        </div>

        {/* Good to know */}
        <div style={{
          marginTop: '40px',
          padding: '24px 28px',
          border: '1px solid rgba(201,168,76,0.2)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '14px 36px',
        }}>
          {GOOD_TO_KNOW.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--gold)', display: 'flex' }}>{POLICY_ICONS[p.id]}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', letterSpacing: '0.04em' }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
