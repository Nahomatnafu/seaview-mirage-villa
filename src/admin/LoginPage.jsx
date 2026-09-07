import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, LoaderCircle } from 'lucide-react'
import { ui } from './AdminShell'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async e => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not sign in.')
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (err) {
      setError(err.message)
      setPassword('')
      setBusy(false)
    }
  }

  return (
    <div style={{ ...ui.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <form onSubmit={submit} style={{ ...ui.card, width: '100%', maxWidth: '380px', padding: '30px 26px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.6875rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a08a4e', marginBottom: '6px' }}>
            Sea View Mirage Villa
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 600 }}>Manage the villa</h1>
        </div>

        {error && <div style={ui.error}>{error}</div>}

        <label htmlFor="admin-password" style={ui.label}>Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
          style={{ ...ui.input, marginBottom: '16px' }}
        />

        <button type="submit" disabled={busy || !password} style={{
          ...ui.button, width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          opacity: busy || !password ? 0.6 : 1,
        }}>
          {busy
            ? <><LoaderCircle size={15} style={{ animation: 'spin 1s linear infinite' }} /> Checking…</>
            : <><Lock size={15} /> Sign in</>}
        </button>
        <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>

        <p style={{ ...ui.muted, marginTop: '18px', textAlign: 'center' }}>
          This page is only for the villa. Guests never see it.
        </p>
      </form>
    </div>
  )
}
