import React, { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Lock, LoaderCircle, AlertCircle, CalendarDays, Moon, Receipt } from 'lucide-react'
import { VILLA } from '../content'
import { PAYMENT_SCHEDULE, nightsBetween, villaTotal, payableInstalments, INCIDENTAL_DEPOSIT, money } from '../../shared/pricing.mjs'

function formatDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PayPage() {
  const [params] = useSearchParams()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const checkIn = params.get('checkIn') || ''
  const checkOut = params.get('checkOut') || ''
  const instalment = params.get('instalment') || ''
  const email = params.get('email') || ''
  const name = params.get('name') || ''
  const sig = params.get('sig') || ''
  // The price agreed when the booking was made. Carried in the link so a rate
  // change between booking and this instalment cannot alter what is owed.
  const total = params.get('total') || ''
  const cancelled = params.get('cancelled') === '1'

  // Shown for confirmation only. The server re-derives all of this and verifies
  // the signature before charging, so nothing here can change the amount.
  const quote = useMemo(() => {
    const nights = nightsBetween(checkIn, checkOut)
    const index = PAYMENT_SCHEDULE.findIndex(p => p.id === instalment)
    if (!nights || index === -1) return null
    const agreed = Number(total)
    const stayTotal = total && Number.isFinite(agreed) && agreed > 0 ? agreed : villaTotal(nights)
    const isFinal = index === PAYMENT_SCHEDULE.length - 1
    return {
      nights, total: stayTotal, index,
      schedule: PAYMENT_SCHEDULE[index],
      amount: payableInstalments(stayTotal)[index],
      incidental: isFinal ? INCIDENTAL_DEPOSIT : 0,
    }
  }, [checkIn, checkOut, instalment, total])

  const linkLooksComplete = checkIn && checkOut && instalment && sig

  const pay = async () => {
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn, checkOut, instalment, email, name, sig, total }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start the payment.')
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setSending(false)
    }
  }

  // These pages have no banner, so they clear the fixed navbar themselves.
  const Shell = ({ children }) => (
    <section className="section-padding" style={{ background: 'var(--cream)', minHeight: '70vh', paddingTop: '150px' }}>
      <div className="container" style={{ maxWidth: '640px' }}>{children}</div>
    </section>
  )

  if (!linkLooksComplete || !quote) {
    return (
      <Shell>
        <div style={{ background: 'white', border: '1px solid rgba(201,168,76,0.2)', padding: '40px 34px', textAlign: 'center' }}>
          <AlertCircle size={26} style={{ color: 'var(--gold)', marginBottom: '16px' }} />
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: '600', color: 'var(--charcoal)', marginBottom: '12px' }}>
            This payment link isn't complete
          </h1>
          <p style={{ color: 'var(--gray)', fontSize: '0.9375rem', lineHeight: 1.8 }}>
            Payment links are sent by the villa and are specific to your booking. Please use the link
            from your confirmation email, or contact us and we will send a fresh one.
          </p>
          <p style={{ marginTop: '22px', fontSize: '0.9375rem' }}>
            <a href={VILLA.phoneUSHref} style={{ color: 'var(--gold-dark)', borderBottom: '1px solid rgba(166,135,78,0.4)', display: 'inline-block', padding: '6px 2px' }}>{VILLA.phoneUS}</a>
            {' · '}
            <a href={`mailto:${VILLA.email}`} style={{ color: 'var(--gold-dark)', borderBottom: '1px solid rgba(166,135,78,0.4)', display: 'inline-block', padding: '6px 2px' }}>{VILLA.email}</a>
          </p>
        </div>
      </Shell>
    )
  }

  const rows = [
    { icon: <CalendarDays size={15} />, label: 'Your stay', value: `${formatDate(checkIn)} → ${formatDate(checkOut)}` },
    { icon: <Moon size={15} />, label: 'Nights', value: `${quote.nights}` },
    { icon: <Receipt size={15} />, label: 'Villa total', value: money(quote.total) },
    // Only on the final instalment, so the guest can see why this payment is
    // larger than the percentage alone would suggest.
    ...(quote.incidental
      ? [{ icon: <Receipt size={15} />, label: 'Refundable deposit', value: `+ ${money(quote.incidental)}` }]
      : []),
  ]

  return (
    <Shell>
      {cancelled && (
        <div style={{ background: 'white', border: '1px solid rgba(201,168,76,0.3)', padding: '16px 20px', marginBottom: '20px', fontSize: '0.875rem', color: 'var(--gray)', lineHeight: 1.7 }}>
          No payment was taken — you can pick up where you left off whenever you're ready.
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid rgba(201,168,76,0.2)' }}>
        <div style={{ background: 'var(--charcoal)', padding: '30px 34px' }}>
          <div style={{ color: 'var(--gold)', fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>
            {Math.round(quote.schedule.pct * 100)}% · {quote.schedule.label}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(38px, 6vw, 52px)', fontWeight: '600', color: 'white', lineHeight: 1 }}>
            {money(quote.amount)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginTop: '10px' }}>
            {VILLA.name} · {quote.schedule.when}
          </div>
        </div>

        <div style={{ padding: '28px 34px' }}>
          {name && (
            <p style={{ color: 'var(--charcoal)', fontSize: '0.9375rem', marginBottom: '18px' }}>
              Hello {name.split(' ')[0]},
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '26px' }}>
            {rows.map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(201,168,76,0.14)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '9px', color: 'var(--gray)', fontSize: '0.8125rem', letterSpacing: '0.04em' }}>
                  <span style={{ color: 'var(--gold)', display: 'flex' }}>{r.icon}</span>{r.label}
                </span>
                <span style={{ color: 'var(--charcoal)', fontSize: '0.9375rem', fontWeight: '500', textAlign: 'right' }}>{r.value}</span>
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color: '#c0392b', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '18px' }}>{error}</p>
          )}

          <button
            onClick={pay}
            disabled={sending}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              background: sending ? 'var(--light-gray)' : 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: sending ? 'var(--gray)' : '#0e0e0e',
              border: 'none', padding: '17px 32px',
              fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: '600',
              cursor: sending ? 'not-allowed' : 'pointer',
            }}
          >
            {sending
              ? <><LoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} /> Redirecting…</>
              : <><Lock size={15} /> Pay {money(quote.amount)}</>}
          </button>

          <p style={{ color: 'var(--gray)', fontSize: '0.75rem', lineHeight: 1.7, marginTop: '16px', textAlign: 'center' }}>
            Payment is handled by Stripe. Your card details are entered on Stripe's page and are never
            seen or stored by this site.
          </p>
        </div>
      </div>

      <p style={{ color: 'var(--gray)', fontSize: '0.8125rem', lineHeight: 1.8, marginTop: '22px', textAlign: 'center' }}>
        Questions about this payment? Call{' '}
        <a href={VILLA.phoneUSHref} style={{ color: 'var(--gold-dark)' }}>{VILLA.phoneUS}</a>
        {' '}or see the{' '}
        <Link to="/faq" style={{ color: 'var(--gold-dark)', borderBottom: '1px solid rgba(166,135,78,0.4)' }}>payment terms</Link>.
      </p>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Shell>
  )
}
