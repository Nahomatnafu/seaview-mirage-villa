import React, { useEffect, useState } from 'react'
import { LoaderCircle, Check, X, Phone, Mail, RefreshCw } from 'lucide-react'
import AdminShell, { ui, fmt, money } from './AdminShell'

const STATUS = {
  pending: { label: 'Needs confirming', bg: '#fff6e0', fg: '#7a5b00', border: '#f0dfae' },
  confirmed: { label: 'Confirmed', bg: '#e8f5ec', fg: '#14532d', border: '#bfe0ca' },
  declined: { label: 'Declined', bg: '#fdecea', fg: '#8c1d18', border: '#f5c6c2' },
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(null)

  const load = async () => {
    setError(null)
    try {
      const res = await fetch('/api/admin/bookings')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not load bookings.')
      setBookings(data.bookings)
    } catch (err) {
      setError(err.message)
      setBookings([])
    }
  }

  useEffect(() => { load() }, [])

  const setStatus = async (id, status) => {
    setSaving(id)
    setError(null)
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save.')
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(null)
    }
  }

  return (
    <AdminShell title="Bookings">
      {error && <div style={ui.error}>{error}</div>}

      {bookings === null && (
        <div style={{ ...ui.card, textAlign: 'center', color: '#6b6b70' }}>
          <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
        </div>
      )}

      {bookings?.length === 0 && (
        <div style={{ ...ui.card, textAlign: 'center' }}>
          <p style={{ fontWeight: 500, marginBottom: '6px' }}>No bookings yet</p>
          <p style={ui.muted}>
            Anyone who pays a deposit on the website appears here automatically.
            Bookings you take by phone go on the Calendar tab instead.
          </p>
        </div>
      )}

      {bookings?.map(b => {
        const s = STATUS[b.status] || STATUS.pending
        return (
          <div key={b.id} style={ui.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '1.0625rem', fontWeight: 600 }}>{b.guestName || 'Guest'}</div>
                <div style={ui.muted}>
                  {fmt(b.checkIn)} → {fmt(b.checkOut)} · {b.nights} nights
                </div>
              </div>
              <span style={{
                alignSelf: 'flex-start', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem',
                background: s.bg, color: s.fg, border: `1px solid ${s.border}`, whiteSpace: 'nowrap',
              }}>{s.label}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <Cell label="Villa total" value={money(b.villaTotal)} />
              <Cell label="Paid so far" value={money(b.paid)} />
              <Cell
                label="Still to come"
                value={money(b.outstanding)}
                tone={b.outstanding > 0 ? '#7a5b00' : '#14532d'}
              />
            </div>

            {b.payments?.length > 0 && (
              <div style={{ borderTop: '1px solid #eeeae2', paddingTop: '10px', marginBottom: '12px' }}>
                {b.payments.map(p => (
                  <div key={p.sessionId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#6b6b70', padding: '2px 0' }}>
                    <span>{p.label || p.instalment} paid</span>
                    <span style={{ color: '#1d1d1f' }}>{money(p.amount)}</span>
                  </div>
                ))}
                {b.incidentalHeld > 0 && (
                  <div style={{ ...ui.muted, marginTop: '6px' }}>
                    Includes {money(b.incidentalHeld)} refundable deposit — send it back after they leave.
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {b.email && (
                <a href={`mailto:${b.email}`} style={{ ...ui.ghost, display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                  <Mail size={14} /> {b.email}
                </a>
              )}
              {b.phone && (
                <a href={`tel:${b.phone}`} style={{ ...ui.ghost, display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                  <Phone size={14} /> {b.phone}
                </a>
              )}
            </div>

            {(b.notes || b.extras) && (
              <div style={{ background: '#faf8f4', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                {b.extras && <div style={ui.muted}><strong>Wants:</strong> {b.extras}</div>}
                {b.notes && <div style={ui.muted}><strong>Notes:</strong> {b.notes}</div>}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {b.status !== 'confirmed' && (
                <button onClick={() => setStatus(b.id, 'confirmed')} disabled={saving === b.id}
                  style={{ ...ui.button, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <Check size={15} /> Confirm
                </button>
              )}
              {b.status !== 'declined' && (
                <button onClick={() => setStatus(b.id, 'declined')} disabled={saving === b.id}
                  style={{ ...ui.ghost, ...ui.danger, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <X size={15} /> Decline
                </button>
              )}
              {b.status === 'declined' && (
                <button onClick={() => setStatus(b.id, 'pending')} disabled={saving === b.id} style={ui.ghost}>
                  Undo
                </button>
              )}
            </div>

            {b.status === 'declined' && (
              <p style={{ ...ui.muted, marginTop: '10px' }}>
                These dates are back on sale. Refund the guest in Stripe — declining here does not move any money.
              </p>
            )}
          </div>
        )
      })}

      {bookings?.length > 0 && (
        <button onClick={() => { setBookings(null); load() }} style={{ ...ui.ghost, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      )}
    </AdminShell>
  )
}

const Cell = ({ label, value, tone }) => (
  <div>
    <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6b70', marginBottom: '3px' }}>{label}</div>
    <div style={{ fontWeight: 600, color: tone || '#1d1d1f' }}>{value}</div>
  </div>
)
