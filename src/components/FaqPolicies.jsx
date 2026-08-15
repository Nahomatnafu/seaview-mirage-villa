import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ScrollText, ShieldCheck, CalendarX, CalendarSync } from 'lucide-react'
import { FAQ, POLICIES, CANCELLATION, VILLA } from '../content'

function Question({ item, open, onToggle }) {
  return (
    <div style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: '18px', padding: '20px 4px', background: 'none', border: 'none', textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.1875rem', fontWeight: '600',
          color: 'var(--charcoal)', lineHeight: 1.35,
        }}>
          {item.q}
        </span>
        <ChevronDown
          size={18}
          style={{
            color: 'var(--gold)', flexShrink: 0, marginTop: '4px',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        />
      </button>
      {open && (
        <p style={{
          color: 'var(--gray)', fontSize: '0.9375rem', lineHeight: 1.8,
          padding: '0 4px 24px', maxWidth: '68ch', animation: 'fadeIn 0.3s ease',
        }}>
          {item.a}
        </p>
      )}
    </div>
  )
}

export default function FaqPolicies() {
  const [open, setOpen] = useState(0)

  return (
    <>
      {/* FAQ */}
      <section id="faq" className="section-padding" style={{ background: 'var(--warm-white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
              <span style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Questions</span>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '16px' }}>
              Frequently <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>asked</em>
            </h2>
            <p style={{ color: 'var(--gray)', maxWidth: '540px', margin: '0 auto', fontSize: '0.9375rem', lineHeight: 1.7 }}>
              Anything not covered here, just ask — we answer enquiries within 24 hours.
            </p>
          </div>

          <div style={{ maxWidth: '860px', margin: '0 auto', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            {FAQ.map((item, i) => (
              <Question
                key={item.q}
                item={item}
                open={open === i}
                onToggle={() => setOpen(open === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Policies */}
      <section id="policies" className="section-padding" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
              <span style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>The Fine Print</span>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '600', color: 'var(--charcoal)' }}>
              House <em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>policies</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2px' }}>
            {POLICIES.map(p => (
              <div key={p.id} style={{
                padding: '34px 30px', background: 'white',
                border: '1px solid rgba(201,168,76,0.14)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <ScrollText size={17} style={{ color: 'var(--gold)' }} />
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3125rem', fontWeight: '600', color: 'var(--charcoal)' }}>
                    {p.title}
                  </h3>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {p.points.map(pt => (
                    <li key={pt} style={{
                      color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.7,
                      paddingLeft: '16px', position: 'relative',
                    }}>
                      <span style={{
                        position: 'absolute', left: 0, top: '9px',
                        width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(201,168,76,0.6)',
                      }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Cancellation */}
          <div style={{ marginTop: '56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <CalendarX size={18} style={{ color: 'var(--gold)' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 2.6vw, 28px)', fontWeight: '600', color: 'var(--charcoal)' }}>
                Cancellation
              </h3>
            </div>
            <p style={{ color: 'var(--gray)', fontSize: '0.9375rem', lineHeight: 1.75, maxWidth: '64ch', marginBottom: '24px' }}>
              How close to your arrival you cancel determines whether a refund is possible. Holiday
              periods carry longer notice requirements than standard dates.
            </p>

            {/* Table on wider screens. On a phone the third column would scroll
                out of sight, so the same rows render as stacked cards below. */}
            <div className="cancel-table" style={{ border: '1px solid rgba(201,168,76,0.2)', background: 'white', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '520px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--cream)' }}>
                    {['Period', 'Refund possible', 'Non-refundable'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '14px 20px',
                        fontSize: '0.6875rem', letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: 'var(--gray)', fontWeight: '500',
                        borderBottom: '1px solid rgba(201,168,76,0.22)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CANCELLATION.windows.map(w => (
                    <tr key={w.id} style={{ borderBottom: '1px solid rgba(201,168,76,0.14)' }}>
                      <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--charcoal)' }}>{w.season}</td>
                      <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: 'var(--gray)' }}>{w.refundable}</td>
                      <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: 'var(--gray)' }}>{w.nonRefundable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cancel-cards" style={{ display: 'none', gridTemplateColumns: '1fr', gap: '2px' }}>
              {CANCELLATION.windows.map(w => (
                <div key={w.id} style={{ background: 'white', border: '1px solid rgba(201,168,76,0.2)', padding: '20px 22px' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '14px' }}>
                    {w.season}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '3px' }}>Refund possible</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--charcoal)' }}>{w.refundable}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '3px' }}>Non-refundable</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--charcoal)' }}>{w.nonRefundable}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.75, marginTop: '18px', maxWidth: '64ch' }}>
              {CANCELLATION.feeStandard
                ? `Cancellations made in the refundable window are returned less a ${CANCELLATION.feeStandard} cancellation fee (${CANCELLATION.feeHoliday} over holiday periods).`
                : 'Cancellations made in the refundable window are returned less a cancellation fee, set out in your written quote before any payment is taken.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2px', marginTop: '26px' }}>
              <div style={{ padding: '28px 26px', background: 'white', border: '1px solid rgba(201,168,76,0.14)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <CalendarX size={16} style={{ color: 'var(--gold)' }} />
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: '600', color: 'var(--charcoal)' }}>
                    No refund is given for
                  </h4>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {CANCELLATION.noRefundFor.map(pt => (
                    <li key={pt} style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.7, paddingLeft: '16px', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, top: '9px', width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(201,168,76,0.6)' }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: '28px 26px', background: 'white', border: '1px solid rgba(201,168,76,0.14)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <CalendarSync size={16} style={{ color: 'var(--gold)' }} />
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: '600', color: 'var(--charcoal)' }}>
                    Changing your dates
                  </h4>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {CANCELLATION.reschedule.map(pt => (
                    <li key={pt} style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.7, paddingLeft: '16px', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, top: '9px', width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(201,168,76,0.6)' }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Written terms notice */}
          <div style={{
            marginTop: '2px', padding: '28px 32px',
            background: 'var(--charcoal)', borderLeft: '3px solid var(--gold)',
            display: 'flex', gap: '16px', alignItems: 'flex-start',
          }}>
            <ShieldCheck size={19} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Your written terms
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', lineHeight: 1.8 }}>
                Full terms for your stay — including cancellation and any deposit — are set out in the written
                quote we send before the first instalment is due. Nothing is charged until you have those terms
                in writing and have agreed to them. Questions before then?{' '}
                <Link to="/contact" style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(232,201,106,0.4)', display: 'inline-block', padding: '6px 0' }}>
                  Talk to the villa
                </Link>{' '}
                or call {VILLA.phoneUS}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          #policies .cancel-table { display: none !important; }
          #policies .cancel-cards { display: grid !important; }
        }
      `}</style>
    </>
  )
}
