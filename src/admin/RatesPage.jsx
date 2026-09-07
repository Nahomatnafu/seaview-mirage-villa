import React, { useEffect, useState } from 'react'
import { LoaderCircle, Plus, Trash2, Save } from 'lucide-react'
import AdminShell, { ui, money } from './AdminShell'
import { validateSettings } from '../../shared/settings.mjs'

/**
 * Rates and seasons.
 *
 * Validation runs here for fast feedback and again on the server, which is the
 * one that counts — these numbers decide what guests are charged.
 */
export default function RatesPage() {
  const [s, setS] = useState(null)
  const [error, setError] = useState(null)
  const [problems, setProblems] = useState([])
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(async r => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'Could not load rates.')
        return d
      })
      .then(setS)
      .catch(err => setError(err.message))
  }, [])

  const set = (k, v) => { setS(p => ({ ...p, [k]: v })); setSaved(false) }

  const setSeason = (i, k, v) => {
    setS(p => ({ ...p, seasons: p.seasons.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }))
    setSaved(false)
  }

  const addSeason = () => {
    setS(p => ({ ...p, seasons: [...p.seasons, { id: `new-${Date.now()}`, label: '', from: '', to: '', nightly: p.baseNightly }] }))
    setSaved(false)
  }

  const removeSeason = i => {
    setS(p => ({ ...p, seasons: p.seasons.filter((_, j) => j !== i) }))
    setSaved(false)
  }

  const save = async () => {
    setBusy(true)
    setError(null)
    setProblems([])
    setSaved(false)

    const local = validateSettings(s)
    if (!local.ok) { setProblems(local.errors); setBusy(false); return }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) setProblems(data.errors)
        throw new Error(data.error || 'Could not save.')
      }
      setS(data)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!s) {
    return (
      <AdminShell title="Rates">
        {error ? <div style={ui.error}>{error}</div>
          : <div style={{ ...ui.card, textAlign: 'center' }}>
              <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
            </div>}
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Rates">
      {error && <div style={ui.error}>{error}</div>}
      {saved && <div style={ui.ok}>Saved. The website is showing the new rates now.</div>}
      {problems.length > 0 && (
        <div style={ui.error}>
          <strong>Not saved:</strong>
          <ul style={{ margin: '6px 0 0 18px' }}>
            {problems.map((p, i) => <li key={i} style={{ marginBottom: '3px' }}>{p}</li>)}
          </ul>
        </div>
      )}

      <div style={ui.card}>
        <h2 style={ui.h2}>Standard rate</h2>
        <p style={{ ...ui.muted, marginBottom: '14px' }}>
          What a night costs on ordinary dates. A 7-night stay comes to {money(s.baseNightly * s.minNights)}.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <Field label="Per night ($)" value={s.baseNightly} onChange={v => set('baseNightly', num(v))} />
          <Field label="Minimum nights" value={s.minNights} onChange={v => set('minNights', num(v))} />
          <div>
            <label style={ui.label}>Bookable from</label>
            <input type="date" value={s.firstAvailableDate || ''}
              onChange={e => set('firstAvailableDate', e.target.value)} style={ui.input} />
          </div>
        </div>
        <p style={{ ...ui.muted, marginTop: '10px' }}>
          The website will not offer arrivals before that date.
        </p>
      </div>

      <div style={ui.card}>
        <h2 style={ui.h2}>Higher-priced dates</h2>
        <p style={{ ...ui.muted, marginBottom: '14px' }}>
          Christmas, New Year, Easter — any stretch that costs more than the standard rate.
          Each night is charged at whatever period it falls in, so a week that starts before
          Christmas and runs into it is priced night by night. Periods cannot overlap.
        </p>

        {s.seasons.length === 0 && <p style={{ ...ui.muted, marginBottom: '14px' }}>None yet — every night is the standard rate.</p>}

        {s.seasons.map((season, i) => (
          <div key={season.id || i} style={{ border: '1px solid #eeeae2', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={ui.label}>Name</label>
              <input type="text" value={season.label} maxLength={60} placeholder="Christmas"
                onChange={e => setSeason(i, 'label', e.target.value)} style={ui.input} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={ui.label}>First night</label>
                <input type="date" value={season.from} onChange={e => setSeason(i, 'from', e.target.value)} style={ui.input} />
              </div>
              <div>
                <label style={ui.label}>Last night</label>
                <input type="date" value={season.to} onChange={e => setSeason(i, 'to', e.target.value)} style={ui.input} />
              </div>
              <Field label="Per night ($)" value={season.nightly} onChange={v => setSeason(i, 'nightly', num(v))} />
            </div>
            <button onClick={() => removeSeason(i)} style={{ ...ui.ghost, ...ui.danger, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}

        <button onClick={addSeason} style={{ ...ui.ghost, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
          <Plus size={15} /> Add a period
        </button>
      </div>

      <div style={ui.card}>
        <button onClick={save} disabled={busy}
          style={{ ...ui.button, display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: busy ? 0.6 : 1 }}>
          {busy ? <LoaderCircle size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
          Save rates
        </button>
        <p style={{ ...ui.muted, marginTop: '12px' }}>
          <strong>Guests who have already booked keep the price they agreed.</strong> Changing
          anything here only affects new bookings — nobody's remaining instalments will move.
        </p>
      </div>
    </AdminShell>
  )
}

// Empty stays empty rather than becoming 0, so a cleared field doesn't read as
// a free villa while it's being retyped. Validation catches it on save.
const num = v => (v === '' ? '' : Number(v))

const Field = ({ label, value, onChange }) => (
  <div>
    <label style={ui.label}>{label}</label>
    <input type="number" inputMode="numeric" value={value}
      onChange={e => onChange(e.target.value)} style={ui.input} />
  </div>
)
