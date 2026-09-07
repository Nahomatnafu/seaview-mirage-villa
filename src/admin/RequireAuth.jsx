import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'

/**
 * Sends anyone without a session to the login screen.
 *
 * This is convenience, not security — the bundle is public and anyone can route
 * themselves to /admin. What actually protects the villa's data is that every
 * /api/admin/* endpoint checks the session cookie server-side. This just avoids
 * showing an empty dashboard that fails every request.
 */
export default function RequireAuth({ children }) {
  const [state, setState] = useState('checking')
  const location = useLocation()

  useEffect(() => {
    let alive = true
    fetch('/api/admin/session')
      .then(r => r.json())
      .then(d => { if (alive) setState(d.signedIn ? 'in' : 'out') })
      .catch(() => { if (alive) setState('out') })
    return () => { alive = false }
  }, [])

  if (state === 'checking') {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoaderCircle size={22} style={{ animation: 'spin 1s linear infinite', color: '#a08a4e' }} />
        <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
      </div>
    )
  }

  if (state === 'out') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return children
}
