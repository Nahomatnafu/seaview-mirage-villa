import React from 'react'
import { Home, UtensilsCrossed, Plane, Compass, Check, CalendarCheck, Wallet, Receipt, ChefHat, ShoppingBasket, ClipboardList } from 'lucide-react'
import { VILLA, RATES, MEAL_PLAN, PAYMENT_TERMS } from '../content'

const PROCESS_ICONS = [<ClipboardList size={18} />, <ChefHat size={18} />, <ShoppingBasket size={18} />, <Receipt size={18} />]

const PAYMENT_ICONS = {
  deposit: <Wallet size={18} />,
  balance: <CalendarCheck size={18} />,
  quote: <Receipt size={18} />,
}

export default function Rates({ onBookNow }) {
  const cards = [
    {
      id: 'villa',
      icon: <Home size={24} />,
      title: 'The Villa',
      price: RATES.nightlyRate || 'Contact for rates',
      unit: RATES.nightlyRate ? 'per night' : 'quoted for your dates',
      desc: `Exclusive use of all ${VILLA.bedrooms} bedrooms, sleeping ${VILLA.sleeps}, with your chef, butler, housekeeping, concierge, and security included. ${VILLA.minNights}-night minimum.`,
      featured: true,
    },
    {
      id: 'meals',
      icon: <UtensilsCrossed size={24} />,
      title: 'Chef Meal Plan',
      price: RATES.mealPlan,
      unit: RATES.mealPlanUnit,
      desc: 'All three meals plus dessert, water, and fresh juices — planned with your chef and shopped for before you arrive.',
    },
    {
      id: 'transfer',
      icon: <Plane size={24} />,
      title: 'Airport Transfer',
      price: 'Included',
      unit: `from ${VILLA.airport}`,
      desc: `The villa collects you from Montego Bay at no charge. Flying into Kingston instead? Pickup and drop-off is ${RATES.kingstonTransfer} ${RATES.kingstonTransferUnit}.`,
    },
    {
      id: 'excursion',
      icon: <Compass size={24} />,
      title: 'Island Excursions',
      price: RATES.excursion,
      unit: RATES.excursionUnit,
      desc: "A full day out with your driver — Dunn's River Falls, Green Grotto Caves, Dolphin Cove, or wherever the day takes you.",
    },
  ]

  return (
    <section id="rates" className="section-padding" style={{ background: 'var(--cream)' }}>
      <div className="container">
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Rates & Booking</span>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '300', color: 'var(--charcoal)', marginBottom: '16px' }}>
            Clear pricing, <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>no surprises</em>
          </h2>
          <p style={{ color: 'var(--gray)', maxWidth: '560px', margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>
            Everything you'll be asked to pay, published up front — with an itemized receipt for anything bought on your behalf.
          </p>
        </div>

        {/* Price cards */}
        <div className="rates-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2px',
          marginBottom: '72px',
        }}>
          {cards.map(c => (
            <div key={c.id} style={{
              padding: '36px 30px',
              background: c.featured ? 'var(--charcoal)' : 'white',
              border: c.featured ? '1px solid var(--gold)' : '1px solid rgba(201,168,76,0.14)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.35s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)'
              e.currentTarget.style.boxShadow = '0 18px 44px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = c.featured ? 'var(--gold)' : 'rgba(201,168,76,0.14)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{ color: 'var(--gold)', marginBottom: '20px' }}>{c.icon}</div>
              <div style={{
                fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase',
                color: c.featured ? 'rgba(255,255,255,0.6)' : 'var(--gray)', marginBottom: '14px',
              }}>{c.title}</div>

              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: c.price.length > 12 ? '30px' : '42px',
                fontWeight: '400',
                lineHeight: 1.05,
                color: c.featured ? 'var(--gold-light)' : 'var(--charcoal)',
                marginBottom: '6px',
              }}>{c.price}</div>
              <div style={{
                fontSize: '12px', letterSpacing: '0.06em',
                color: c.featured ? 'rgba(255,255,255,0.5)' : 'var(--gray)',
                marginBottom: '20px',
              }}>{c.unit}</div>

              <div style={{ width: '32px', height: '1px', background: 'var(--gold)', opacity: 0.5, marginBottom: '20px' }} />

              <p style={{
                fontSize: '13.5px', lineHeight: '1.75',
                color: c.featured ? 'rgba(255,255,255,0.65)' : 'var(--gray)',
              }}>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Meal plan detail */}
        <div className="rates-meal" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
          gap: '0',
          background: 'white',
          border: '1px solid rgba(201,168,76,0.16)',
          marginBottom: '72px',
        }}>
          {/* What's included */}
          <div style={{ padding: '44px 42px', borderRight: '1px solid rgba(201,168,76,0.16)' }}>
            <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>The Meal Plan</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: '400', color: 'var(--charcoal)', margin: '14px 0 8px', lineHeight: 1.2 }}>
              {MEAL_PLAN.price} <span style={{ fontSize: '16px', color: 'var(--gray)', fontFamily: 'var(--font-body)' }}>{MEAL_PLAN.unit}</span>
            </h3>
            <p style={{ color: 'var(--gray)', fontSize: '14px', lineHeight: 1.75, marginBottom: '28px' }}>
              Full board, cooked in the villa by your chef. Groceries are bought on your behalf and billed at cost with a detailed receipt.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              {MEAL_PLAN.includes.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(201,168,76,0.14)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px',
                  }}>
                    <Check size={11} style={{ color: 'var(--gold-dark)' }} />
                  </span>
                  <span style={{ color: 'var(--charcoal)', fontSize: '14px', lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div style={{ padding: '44px 42px', background: 'var(--warm-white)' }}>
            <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>How It Works</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginTop: '24px' }}>
              {MEAL_PLAN.process.map((p, i) => (
                <div key={p.step} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    width: '38px', height: '38px', flexShrink: 0,
                    border: '1px solid rgba(201,168,76,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--gold)',
                  }}>
                    {PROCESS_ICONS[i]}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--charcoal)', letterSpacing: '0.03em', marginBottom: '4px' }}>{p.step}</div>
                    <p style={{ color: 'var(--gray)', fontSize: '13px', lineHeight: 1.65 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment terms */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: '300', color: 'var(--charcoal)' }}>
            How you <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>reserve</em>
          </h3>
        </div>

        <div className="rates-terms" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2px',
          marginBottom: '48px',
        }}>
          {PAYMENT_TERMS.map((t, i) => (
            <div key={t.id} style={{
              padding: '30px 28px',
              background: 'white',
              border: '1px solid rgba(201,168,76,0.14)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '22px', right: '26px',
                fontFamily: 'var(--font-heading)', fontSize: '38px', fontWeight: '400',
                color: 'rgba(201,168,76,0.18)', lineHeight: 1,
              }}>{i + 1}</div>
              <div style={{ color: 'var(--gold)', marginBottom: '16px' }}>{PAYMENT_ICONS[t.id]}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '21px', fontWeight: '500', color: 'var(--charcoal)', marginBottom: '10px' }}>{t.label}</div>
              <p style={{ color: 'var(--gray)', fontSize: '13.5px', lineHeight: 1.7 }}>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => onBookNow()} style={{
            background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
            color: '#0e0e0e',
            border: 'none',
            padding: '16px 48px',
            fontSize: '12px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 24px rgba(201,168,76,0.3)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(201,168,76,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(201,168,76,0.3)' }}
          >
            Request a Quote
          </button>
          <p style={{ color: 'var(--gray)', fontSize: '13px', marginTop: '18px', lineHeight: 2 }}>
            Or call us on{' '}
            <a href={VILLA.phoneUSHref} style={{ color: 'var(--gold-dark)', borderBottom: '1px solid rgba(166,135,78,0.4)', display: 'inline-block', padding: '6px 2px' }}>{VILLA.phoneUS}</a>{' '}
            (US) or{' '}
            <a href={VILLA.phoneJAHref} style={{ color: 'var(--gold-dark)', borderBottom: '1px solid rgba(166,135,78,0.4)', display: 'inline-block', padding: '6px 2px' }}>{VILLA.phoneJA}</a>{' '}
            (Jamaica).
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          #rates .rates-meal {
            grid-template-columns: 1fr !important;
          }
          #rates .rates-meal > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid rgba(201,168,76,0.16);
          }
        }
      `}</style>
    </section>
  )
}
