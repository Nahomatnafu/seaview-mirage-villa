import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

/**
 * Frame for every dashboard screen.
 *
 * Deliberately plain — this is a tool the villa uses on a phone between other
 * jobs, not a page to be impressed by. Big tap targets, one column, no
 * decoration competing with the numbers.
 */

export const ui = {
  page: { minHeight: '100vh', background: '#f4f2ee', color: '#1d1d1f' },
  wrap: { maxWidth: '860px', margin: '0 auto', padding: '0 16px 64px' },
  card: { background: 'white', border: '1px solid #e2ded6', borderRadius: '10px', padding: '18px', marginBottom: '14px' },
  h2: { fontSize: '1.0625rem', fontWeight: 600, marginBottom: '4px' },
  label: { display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6b70', marginBottom: '6px' },
  input: {
    width: '100%', padding: '12px 13px', border: '1px solid #d6d1c7', borderRadius: '8px',
    // 16px or larger, or iOS zooms the page in when the field is focused.
    fontSize: '16px', background: 'white', color: '#1d1d1f', fontFamily: 'inherit',
  },
  button: {
    padding: '13px 18px', border: 'none', borderRadius: '8px', background: '#1d1d1f', color: 'white',
    fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', minHeight: '46px',
  },
  ghost: {
    padding: '11px 15px', border: '1px solid #d6d1c7', borderRadius: '8px', background: 'white',
    color: '#1d1d1f', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', minHeight: '42px',
  },
  danger: { color: '#b3261e', borderColor: '#e6c9c6' },
  muted: { color: '#6b6b70', fontSize: '0.8125rem', lineHeight: 1.6 },
  error: { background: '#fdecea', border: '1px solid #f5c6c2', color: '#8c1d18', padding: '11px 13px', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '12px', lineHeight: 1.6 },
  ok: { background: '#e8f5ec', border: '1px solid #bfe0ca', color: '#14532d', padding: '11px 13px', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '12px' },
}

const tabs = [
  { to: '/admin', label: 'Bookings', end: true },
  { to: '/admin/calendar', label: 'Calendar' },
  { to: '/admin/rates', label: 'Rates' },
]

export default function AdminShell({ children, title }) {
  const navigate = useNavigate()

  const signOut = async () => {
    try { await fetch('/api/admin/logout', { method: 'POST' }) } catch { /* leaving anyway */ }
    navigate('/admin/login', { replace: true })
  }

  return (
    <div style={ui.page}>
      <style>{`
        .admin-tab { padding: 12px 4px; margin-right: 20px; font-size: 0.9375rem;
                     color: #6b6b70; text-decoration: none; border-bottom: 2px solid transparent;
                     display: inline-block; }
        .admin-tab.active { color: #1d1d1f; font-weight: 600; border-bottom-color: #c9a84c; }
        .admin-tabs { overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; }
      `}</style>

      <header style={{ background: 'white', borderBottom: '1px solid #e2ded6', marginBottom: '18px' }}>
        <div style={{ ...ui.wrap, padding: '14px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a08a4e' }}>
                Sea View Mirage Villa
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '2px' }}>{title}</h1>
            </div>
            <button onClick={signOut} style={{ ...ui.ghost, display: 'flex', alignItems: 'center', gap: '7px' }}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
          <nav className="admin-tabs" style={{ marginTop: '10px' }}>
            {tabs.map(t => (
              <NavLink key={t.to} to={t.to} end={t.end} className="admin-tab">{t.label}</NavLink>
            ))}
          </nav>
        </div>
      </header>

      <div style={ui.wrap}>{children}</div>
    </div>
  )
}

/** Formats an ISO date the way the villa reads dates, not the way we store them. */
export const fmt = iso => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const money = n => `$${Math.round(Number(n) || 0).toLocaleString('en-US')}`
