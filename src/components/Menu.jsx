import React, { useState } from 'react'
import { UtensilsCrossed, Wine, Cookie, AlertCircle, Info, PartyPopper, ChevronDown } from 'lucide-react'
import {
  MENU_INTRO, ORDERING_STEPS, HOW_IT_WORKS, MENU_NOTICES,
  ALLERGY_NOTICE, EVENTS_NOTE, COLLECTIONS, BAR, SNACKS,
} from '../menu'

const TABS = [
  ...COLLECTIONS.map(c => ({ id: c.id, number: c.number, name: c.name })),
  { id: BAR.id, number: BAR.number, name: BAR.name },
  { id: SNACKS.id, number: SNACKS.number, name: SNACKS.name },
]

function SectionEyebrow({ children }) {
  return (
    <span style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

/* A single course (Breakfast, Lunch, …) inside a collection */
function Course({ course, open, onToggle }) {
  return (
    <div style={{ borderTop: '1px solid rgba(201,168,76,0.18)' }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', padding: '20px 4px', background: 'none', border: 'none', textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '600',
          color: 'var(--charcoal)', letterSpacing: '0.01em',
        }}>
          {course.name}
        </span>
        <ChevronDown
          size={18}
          style={{
            color: 'var(--gold)', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        />
      </button>

      {open && (
        <div style={{ paddingBottom: '28px', animation: 'fadeIn 0.35s ease' }}>
          <div className="menu-course-body" style={{
            display: 'grid',
            gridTemplateColumns: course.image ? '1fr 280px' : '1fr',
            gap: '32px', alignItems: 'start',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              gap: '26px 32px',
            }}>
              {course.groups.map((g, i) => (
                <div key={g.title || i}>
                  {g.title && (
                    <div style={{
                      fontSize: '0.6875rem', letterSpacing: '0.16em', textTransform: 'uppercase',
                      color: 'var(--gold-dark)', marginBottom: '12px', fontWeight: '500',
                    }}>
                      {g.title}
                    </div>
                  )}
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {g.items.map(item => (
                      <li key={item} style={{
                        color: 'var(--gray)', fontSize: '0.8438rem', lineHeight: 1.55,
                        paddingLeft: '14px', position: 'relative',
                      }}>
                        <span style={{
                          position: 'absolute', left: 0, top: '8px',
                          width: '4px', height: '4px', borderRadius: '50%',
                          background: 'rgba(201,168,76,0.5)',
                        }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {course.image && (
              <img
                src={course.image}
                alt={course.imageAlt}
                loading="lazy"
                style={{
                  width: '100%', height: '240px', objectFit: 'cover',
                  borderRadius: '2px', border: '1px solid rgba(201,168,76,0.2)',
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* Price table used by The Bar */
function PriceTable({ title, rows }) {
  return (
    <div>
      <div style={{
        fontSize: '0.6875rem', letterSpacing: '0.16em', textTransform: 'uppercase',
        color: 'var(--gold-dark)', marginBottom: '14px', fontWeight: '500',
      }}>
        {title}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map(([item, size, price], i) => (
            <tr key={item + i} style={{ borderBottom: '1px solid rgba(201,168,76,0.13)' }}>
              <td style={{ padding: '9px 0', color: 'var(--charcoal)', fontSize: '0.8438rem' }}>{item}</td>
              <td style={{ padding: '9px 8px', color: 'var(--gray)', fontSize: '0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                {size === '—' ? '' : size}
              </td>
              <td style={{
                padding: '9px 0 9px 12px', textAlign: 'right', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '600', color: 'var(--gold-dark)',
              }}>
                {price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Menu() {
  const [active, setActive] = useState(COLLECTIONS[0].id)
  const [openCourse, setOpenCourse] = useState('Breakfast')

  const collection = COLLECTIONS.find(c => c.id === active)
  const isBar = active === BAR.id
  const isSnacks = active === SNACKS.id
  const panel = collection || (isBar ? BAR : SNACKS)

  const selectTab = (id) => {
    setActive(id)
    setOpenCourse('Breakfast')
  }

  return (
    <section id="menu" className="section-padding" style={{ background: 'var(--warm-white)' }}>
      <div className="container">
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            <SectionEyebrow>The Chef's Menu</SectionEyebrow>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '16px' }}>
            Cooked for you, <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>every day</em>
          </h2>
          <p style={{ color: 'var(--gray)', maxWidth: '600px', margin: '0 auto', fontSize: '0.9375rem', lineHeight: 1.75 }}>
            Six collections, built around what your group actually wants to eat. Choose your meals before you
            travel and the chef takes care of the rest.
          </p>

          {/* What the rate covers vs. what is a separate package */}
          <div className="menu-pricing" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2px', maxWidth: '760px', margin: '32px auto 0', textAlign: 'left',
          }}>
            <div style={{ padding: '22px 24px', background: 'var(--charcoal)', border: '1px solid var(--gold)' }}>
              <div style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-heading)', fontSize: '1.375rem', fontWeight: '600', marginBottom: '6px' }}>
                {MENU_INTRO.included}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8438rem', lineHeight: 1.7 }}>{MENU_INTRO.note}</p>
            </div>
            <div style={{ padding: '22px 24px', background: 'white', border: '1px solid rgba(201,168,76,0.2)' }}>
              <div style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-heading)', fontSize: '1.375rem', fontWeight: '600', marginBottom: '6px' }}>
                {MENU_INTRO.special}
              </div>
              <p style={{ color: 'var(--gray)', fontSize: '0.8438rem', lineHeight: 1.7 }}>{MENU_INTRO.specialNote}</p>
            </div>
          </div>
        </div>

        {/* Collection tabs */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '2px', marginBottom: '44px',
        }}>
          {TABS.map(t => {
            const on = t.id === active
            return (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                style={{
                  padding: '13px 22px',
                  background: on ? 'var(--charcoal)' : 'white',
                  color: on ? 'white' : 'var(--gray)',
                  border: on ? '1px solid var(--charcoal)' : '1px solid rgba(201,168,76,0.22)',
                  fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                  fontWeight: on ? '500' : '400',
                  transition: 'all 0.25s ease',
                  display: 'flex', alignItems: 'center', gap: '9px',
                }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.borderColor = 'var(--gold)' }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.22)' }}
              >
                <span style={{ color: on ? 'var(--gold-light)' : 'var(--gold)', fontFamily: 'var(--font-heading)', fontSize: '0.875rem' }}>
                  {t.number}
                </span>
                {t.name}
              </button>
            )
          })}
        </div>

        {/* Active collection */}
        <div className="menu-panel" style={{ background: 'white', border: '1px solid rgba(201,168,76,0.18)', marginBottom: '72px' }}>
          {/* Collection banner */}
          <div className="menu-banner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }}>
            <div className="menu-banner-text" style={{ padding: '44px 42px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <SectionEyebrow>Collection {panel.number}</SectionEyebrow>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 3.4vw, 40px)',
                fontWeight: '600', color: 'var(--charcoal)', margin: '12px 0 10px', lineHeight: 1.15,
              }}>
                {panel.name}
              </h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.7 }}>{panel.tagline}</p>
            </div>
            <div style={{ minHeight: '260px', overflow: 'hidden' }}>
              <img
                key={panel.id}
                src={panel.image}
                alt={panel.imageAlt}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'fadeIn 0.45s ease' }}
              />
            </div>
          </div>

          <div className="menu-panel-body" style={{ padding: '8px 42px 36px' }}>
            {/* Courses */}
            {collection && collection.courses.map(course => (
              <Course
                key={course.name}
                course={course}
                open={openCourse === course.name}
                onToggle={() => setOpenCourse(openCourse === course.name ? null : course.name)}
              />
            ))}

            {/* The Bar */}
            {isBar && (
              <div style={{ paddingTop: '28px' }}>
                <div className="menu-bar-grid" style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px',
                }}>
                  <PriceTable title="Spirits" rows={BAR.spirits} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                    <PriceTable title="Cocktails" rows={BAR.cocktails} />
                    <PriceTable title="Wines" rows={BAR.wines} />
                    <PriceTable title="Also Available" rows={BAR.other} />
                  </div>
                </div>

                <div style={{ marginTop: '36px' }}>
                  <div style={{ fontSize: '0.6875rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '14px', fontWeight: '500' }}>
                    Chasers
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {BAR.chasers.map(c => (
                      <span key={c} style={{
                        background: 'var(--cream)', border: '1px solid rgba(201,168,76,0.2)',
                        color: 'var(--charcoal)', padding: '6px 14px', fontSize: '0.75rem', letterSpacing: '0.04em',
                      }}>{c}</span>
                    ))}
                  </div>
                </div>

                <p style={{
                  marginTop: '30px', paddingTop: '22px', borderTop: '1px solid rgba(201,168,76,0.18)',
                  color: 'var(--gray)', fontSize: '0.8438rem', lineHeight: 1.7, fontStyle: 'italic',
                }}>
                  {BAR.note}
                </p>
              </div>
            )}

            {/* Snacks */}
            {isSnacks && (
              <div style={{ paddingTop: '28px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SNACKS.items.map(s => (
                    <span key={s} style={{
                      background: 'var(--cream)', border: '1px solid rgba(201,168,76,0.2)',
                      color: 'var(--charcoal)', padding: '8px 16px', fontSize: '0.8125rem', letterSpacing: '0.03em',
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How to order */}
        <div style={{ textAlign: 'center', marginBottom: '38px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: '600', color: 'var(--charcoal)' }}>
            How to <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>order</em>
          </h3>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '2px', marginBottom: '48px',
        }}>
          {ORDERING_STEPS.map((s, i) => (
            <div key={s.step} style={{
              padding: '26px 24px', background: 'white',
              border: '1px solid rgba(201,168,76,0.14)', position: 'relative',
            }}>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: '30px', fontWeight: '600',
                color: 'rgba(201,168,76,0.28)', lineHeight: 1, marginBottom: '12px',
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--charcoal)', marginBottom: '8px', letterSpacing: '0.02em' }}>
                {s.step}
              </div>
              <p style={{ color: 'var(--gray)', fontSize: '0.8125rem', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Shopping, notices, allergies */}
        <div className="menu-notes" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
          <div style={{ padding: '34px 32px', background: 'var(--cream)', border: '1px solid rgba(201,168,76,0.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <UtensilsCrossed size={17} style={{ color: 'var(--gold)' }} />
              <SectionEyebrow>What You Pay For</SectionEyebrow>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              {HOW_IT_WORKS.map(t => (
                <p key={t} style={{ color: 'var(--gray)', fontSize: '0.8438rem', lineHeight: 1.75 }}>{t}</p>
              ))}
            </div>
          </div>

          <div style={{ padding: '34px 32px', background: 'var(--cream)', border: '1px solid rgba(201,168,76,0.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Info size={17} style={{ color: 'var(--gold)' }} />
              <SectionEyebrow>Good to Know</SectionEyebrow>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {MENU_NOTICES.map(n => (
                <div key={n.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)',
                    flexShrink: 0, marginTop: '8px',
                  }} />
                  <p style={{ color: 'var(--gray)', fontSize: '0.8438rem', lineHeight: 1.7 }}>{n.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Allergy notice */}
        <div style={{
          marginTop: '2px', padding: '26px 32px',
          background: 'var(--charcoal)', borderLeft: '3px solid var(--gold)',
          display: 'flex', gap: '16px', alignItems: 'flex-start',
        }}>
          <AlertCircle size={19} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Allergies & Dietary Restrictions
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', lineHeight: 1.75 }}>{ALLERGY_NOTICE}</p>
          </div>
        </div>

        {/* Events note */}
        <div style={{
          marginTop: '32px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        }}>
          <PartyPopper size={20} style={{ color: 'var(--gold)' }} />
          <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.75, maxWidth: '540px' }}>{EVENTS_NOTE}</p>
        </div>

        {/* Required attribution for the Creative Commons menu photos.
            Remove this once the client's own food photography replaces them. */}
        <p style={{ marginTop: '40px', textAlign: 'center', color: 'var(--gray)', fontSize: '0.6875rem', opacity: 0.75 }}>
          Menu photography is illustrative —{' '}
          <a
            href="/assets/menu/CREDITS.md"
            style={{ color: 'var(--gold-dark)', borderBottom: '1px solid rgba(166,135,78,0.35)', display: 'inline-block', padding: '8px 4px' }}
          >
            photo credits
          </a>
        </p>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #menu .menu-banner { grid-template-columns: 1fr !important; }
          #menu .menu-banner > div:last-child { min-height: 220px !important; order: -1; }
          #menu .menu-notes { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 760px) {
          #menu .menu-course-body { grid-template-columns: 1fr !important; }
          #menu .menu-course-body img { height: 200px !important; }
        }
        @media (max-width: 600px) {
          #menu .menu-banner-text { padding: 30px 22px !important; }
          #menu .menu-panel-body { padding: 4px 22px 28px !important; }
        }
      `}</style>
    </section>
  )
}
