import React, { useEffect, useMemo, useState } from 'react'
import { LoaderCircle, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminShell, { ui, fmt } from './AdminShell'
import { eachNight, toISODate, addDays, nightsBetween } from '../../shared/dates.mjs'

/**
 * The month view, plus the form for blocking weeks taken off the website.
 *
 * Two kinds of unavailable date and they are coloured differently on purpose:
 * a paid booking (from Stripe, cannot be removed here) and a manual hold (the
 * villa's own, removable). Confusing the two would let someone "unblock" a week
 * a guest has actually paid for.
 */
export default function CalendarPage() {
  const [blocks, setBlocks] = useState(null)      // manual holds
  const [booked, setBooked] = useState([])        // from paid bookings
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1) })
  const [form, setForm] = useState({ from: '', to: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setError(null)
    try {
      const [bRes, aRes] = await Promise.all([
        fetch('/api/admin/blocks'),
        fetch('/api/availability'),
      ])
      const bData = await bRes.json()
      if (!bRes.ok) throw new Error(bData.error || 'Could not load blocked dates.')
      setBlocks(bData.blocks || [])

      const aData = aRes.ok ? await aRes.json() : { blocked: [] }
      setBooked(aData.blocked || [])
    } catch (err) {
      setError(err.message)
      setBlocks([])
    }
  }

  useEffect(() => { load() }, [])

  // Every night that is unavailable, and why.
  const nights = useMemo(() => {
    const map = new Map()
    for (const r of booked) for (const n of eachNight(r.from, r.to)) map.set(n, 'booked')
    // Manual holds drawn last so the villa can see its own entries.
    for (const b of blocks || []) for (const n of eachNight(b.from, b.to)) map.set(n, 'manual')
    return map
  }, [booked, blocks])

  const add = async e => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save.')
      setBlocks(data.blocks)
      setForm({ from: '', to: '', note: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async id => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not remove.')
      setBlocks(data.blocks)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const shiftMonth = n => setMonth(m => new Date(m.getFullYear(), m.getMonth() + n, 1))

  // Monday-first grid, padded to whole weeks.
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const lead = (first.getDay() + 6) % 7
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const out = []
    for (let i = 0; i < lead; i++) out.push(null)
    for (let d = 1; d <= days; d++) out.push(new Date(month.getFullYear(), month.getMonth(), d))
    return out
  }, [month])

  const validRange = form.from && form.to && nightsBetween(form.from, form.to) >= 1

  return (
    <AdminShell title="Calendar">
      {error && <div style={ui.error}>{error}</div>}

      <div style={ui.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <button onClick={() => shiftMonth(-1)} style={{ ...ui.ghost, padding: '9px 12px' }} aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <div style={{ fontWeight: 600 }}>
            {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={() => shiftMonth(1)} style={{ ...ui.ghost, padding: '9px 12px' }} aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '0.6875rem', color: '#6b6b70', paddingBottom: '4px' }}>{d}</div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const iso = toISODate(d)
            const kind = nights.get(iso)
            return (
              <div key={i} title={kind === 'booked' ? 'Paid booking' : kind === 'manual' ? 'You blocked this' : 'Free'}
                style={{
                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '6px', fontSize: '0.8125rem',
                  background: kind === 'booked' ? '#1d1d1f' : kind === 'manual' ? '#c9a84c' : '#f4f2ee',
                  color: kind ? 'white' : '#1d1d1f',
                }}>
                {d.getDate()}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '14px', marginTop: '12px', flexWrap: 'wrap' }}>
          <Key color="#1d1d1f" label="Paid booking" />
          <Key color="#c9a84c" label="You blocked it" />
          <Key color="#f4f2ee" label="Free" outline />
        </div>
      </div>

      <form onSubmit={add} style={ui.card}>
        <h2 style={ui.h2}>Block dates</h2>
        <p style={{ ...ui.muted, marginBottom: '14px' }}>
          For bookings you take by phone or WhatsApp. The website will stop offering these dates.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={ui.label} htmlFor="blk-from">They arrive</label>
            <input id="blk-from" type="date" required value={form.from}
              onChange={e => setForm(f => ({ ...f, from: e.target.value, to: f.to && f.to <= e.target.value ? '' : f.to }))}
              style={ui.input} />
          </div>
          <div>
            <label style={ui.label} htmlFor="blk-to">They leave</label>
            <input id="blk-to" type="date" required value={form.to}
              min={form.from ? addDays(form.from, 1) : undefined}
              onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
              style={ui.input} />
          </div>
        </div>

        <label style={ui.label} htmlFor="blk-note">Note (optional)</label>
        <input id="blk-note" type="text" value={form.note} maxLength={120}
          onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          placeholder="e.g. Booked by phone"
          style={{ ...ui.input, marginBottom: '6px' }} />
        <p style={{ ...ui.muted, marginBottom: '14px' }}>
          Keep guest names and numbers out of this — a short reminder is enough.
        </p>

        <button type="submit" disabled={busy || !validRange}
          style={{ ...ui.button, display: 'inline-flex', alignItems: 'center', gap: '7px', opacity: busy || !validRange ? 0.6 : 1 }}>
          {busy ? <LoaderCircle size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={15} />}
          Block these dates
        </button>
        <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
      </form>

      <div style={ui.card}>
        <h2 style={{ ...ui.h2, marginBottom: '12px' }}>Dates you have blocked</h2>
        {blocks === null && <LoaderCircle size={18} style={{ animation: 'spin 1s linear infinite' }} />}
        {blocks?.length === 0 && <p style={ui.muted}>Nothing blocked by hand. Paid bookings block themselves.</p>}
        {blocks?.map(b => (
          <div key={b.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
            padding: '11px 0', borderBottom: '1px solid #eeeae2',
          }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{fmt(b.from)} → {fmt(b.to)}</div>
              {b.note && <div style={ui.muted}>{b.note}</div>}
            </div>
            <button onClick={() => remove(b.id)} disabled={busy}
              style={{ ...ui.ghost, ...ui.danger, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}

const Key = ({ color, label, outline }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#6b6b70' }}>
    <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: color, border: outline ? '1px solid #d6d1c7' : 'none' }} />
    {label}
  </span>
)
