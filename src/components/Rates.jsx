import React from 'react'
import { Home, UtensilsCrossed, Plane, Compass, Check, CalendarCheck, Wallet, Receipt, ChefHat, ShoppingBasket, ClipboardList } from 'lucide-react'
import { VILLA, RATES, MEAL_PLAN, PAYMENT_SCHEDULE, money, villaTotal, instalments } from '../content'

const PROCESS_ICONS = [<ClipboardList size={18} />, <ChefHat size={18} />, <ShoppingBasket size={18} />, <Receipt size={18} />]

const PAYMENT_ICONS = {
  deposit: <Wallet size={18} />,
  second: <CalendarCheck size={18} />,
  final: <Receipt size={18} />,
}

export default function Rates({ onBookNow }) {
  // Worked examples use the minimum stay, which is also the most common one.
  const minTotal = villaTotal(VILLA.minNights)
  const minParts = instalments(minTotal)

  const cards = [
    {
      id: 'villa',
      icon: <Home size={24} />,
      title: 'The Villa',
      price: RATES.nightlyRate,
      unit: RATES.nightlyUnit,
      desc: `Exclusive use of the whole property — all ${VILLA.bedrooms} bedrooms, sleeping ${VILLA.sleeps} — with your chef, butler, housekeeping, concierge and security included. Minimum stay ${VILLA.minNights} nights, ${money(minTotal)}.`,
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
            <span style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Rates & Booking</span>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '16px' }}>
            Clear pricing, <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>no surprises</em>
          </h2>
          <p style={{ color: 'var(--gray)', maxWidth: '560px', margin: '0 auto', fontSize: '0.9375rem', lineHeight: 1.7 }}>
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
                fontSize: '0.6875rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                color: c.featured ? 'rgba(255,255,255,0.6)' : 'var(--gray)', marginBottom: '14px',
              }}>{c.title}</div>

              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: c.price.length > 12 ? '30px' : '42px',
                fontWeight: '600',
                lineHeight: 1.05,
                color: c.featured ? 'var(--gold-light)' : 'var(--charcoal)',
                marginBottom: '6px',
              }}>{c.price}</div>
              <div style={{
                fontSize: '0.75rem', letterSpacing: '0.06em',
                color: c.featured ? 'rgba(255,255,255,0.5)' : 'var(--gray)',
                marginBottom: '20px',
              }}>{c.unit}</div>

              <div style={{ width: '32px', height: '1px', background: 'var(--gold)', opacity: 0.5, marginBottom: '20px' }} />

              <p style={{
                fontSize: '0.8438rem', lineHeight: '1.75',
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
            <span style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>The Meal Plan</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: '600', color: 'var(--charcoal)', margin: '14px 0 8px', lineHeight: 1.2 }}>
              {MEAL_PLAN.price} <span style={{ fontSize: '1rem', color: 'var(--gray)', fontFamily: 'var(--font-body)' }}>{MEAL_PLAN.unit}</span>
            </h3>
            <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.75, marginBottom: '28px' }}>
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
                  <span style={{ color: 'var(--charcoal)', fontSize: '0.875rem', lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div style={{ padding: '44px 42px', background: 'var(--warm-white)' }}>
            <span style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>How It Works</span>
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
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--charcoal)', letterSpacing: '0.03em', marginBottom: '4px' }}>{p.step}</div>
                    <p style={{ color: 'var(--gray)', fontSize: '0.8125rem', lineHeight: 1.65 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment schedule */}
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: '600', color: 'var(--charcoal)' }}>
            How you <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>reserve</em>
          </h3>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 36px' }}>
          Three instalments, spread across the run-up to your stay. The amounts below are worked out
          on a {VILLA.minNights}-night stay at {money(minTotal)} — your quote shows the exact figures for your dates.
        </p>

        <div className="rates-terms" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2px',
          marginBottom: '48px',
        }}>
          {PAYMENT_SCHEDULE.map((t, i) => (
            <div key={t.id} style={{
              padding: '30px 28px',
              background: 'white',
              border: '1px solid rgba(201,168,76,0.14)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '22px', right: '26px',
                fontFamily: 'var(--font-heading)', fontSize: '38px', fontWeight: '600',
                color: 'rgba(201,168,76,0.18)', lineHeight: 1,
              }}>{i + 1}</div>
              <div style={{ color: 'var(--gold)', marginBottom: '16px' }}>{PAYMENT_ICONS[t.id]}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', fontWeight: '600', color: 'var(--charcoal)', lineHeight: 1.1 }}>
                {Math.round(t.pct * 100)}%
              </div>
              <div style={{ color: 'var(--gold-dark)', fontSize: '1rem', fontWeight: '500', marginBottom: '10px' }}>
                {money(minParts[i])} <span style={{ color: 'var(--gray)', fontSize: '0.75rem', fontWeight: '400' }}>on a {VILLA.minNights}-night stay</span>
              </div>
              <div style={{ fontSize: '0.6875rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '8px' }}>{t.when}</div>
              <p style={{ color: 'var(--gray)', fontSize: '0.8438rem', lineHeight: 1.7 }}>{t.desc}</p>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '0.8125rem', lineHeight: 1.7, maxWidth: '620px', margin: '0 auto 48px' }}>
          Nothing is due to make an enquiry — send your dates and we reply with availability and a written
          quote first. Food, Kingston transfers and excursions are billed separately from the villa rate.
        </p>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => onBookNow()} style={{
            background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
            color: '#0e0e0e',
            border: 'none',
            padding: '16px 48px',
            fontSize: '0.75rem',
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
          <p style={{ color: 'var(--gray)', fontSize: '0.8125rem', marginTop: '18px', lineHeight: 2 }}>
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
