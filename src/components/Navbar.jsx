import React, { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { PAGES } from '../site'

export default function Navbar({ onBookNow }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the mobile menu whenever navigation happens.
  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Stop the page behind the overlay from scrolling on touch devices.
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [menuOpen])

  const links = PAGES.map(p => ({ label: p.nav, to: p.path }))

  return (
    <>
      {/* Light bar at every scroll position. The nav links are near-black for
          legibility, which only works over a light background — a transparent
          bar would put dark text straight onto the hero photo. */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.4s ease',
        background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(26,26,26,0.12)' : '1px solid rgba(26,26,26,0.06)',
        boxShadow: scrolled ? '0 2px 18px rgba(0,0,0,0.10)' : 'none',
        padding: scrolled ? '12px 0' : '18px 0',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/assets/logo.png" alt="Sea View Mirage Villa" style={{ height: scrolled ? '50px' : '64px', transition: 'height 0.4s ease' }} />
          </Link>

          {/* Desktop Nav */}
          <ul style={{
            display: 'flex',
            alignItems: 'center',
            gap: '26px',
            listStyle: 'none',
          }} className="desktop-nav">
            {links.map(link => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.to === '/'} className="nav-link" style={({ isActive }) => ({
                  color: isActive ? 'var(--gold-dark)' : '#141414',
                  fontSize: '0.8125rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  transition: 'color 0.3s',
                  paddingBottom: '4px',
                  borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                })}>
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <button onClick={onBookNow} style={{
                background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
                color: '#0e0e0e',
                border: 'none',
                padding: '11px 28px',
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 24px rgba(201,168,76,0.4)' }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none' }}
              >
                Book Now
              </button>
            </li>
          </ul>

          {/* Mobile Menu Toggle. The overlay sits above the navbar and carries its
              own close button, so this only ever needs to show the open icon. */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{
              background: 'none', border: 'none', color: '#141414', display: 'none',
              padding: '9px', margin: '-9px', // 44px tap target without shifting layout
            }}
            className="mobile-toggle"
          >
            <Menu size={26} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu — sits ABOVE the navbar (which would otherwise show a second
          logo and close icon through it) and scrolls if the links outgrow a short
          screen, e.g. iPhone SE at 667px tall. */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: '#0a0a0a',
          zIndex: 1100,
          display: 'flex',
          padding: '76px 24px 36px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{
              position: 'fixed', top: '16px', right: '16px',
              background: 'none', border: 'none', color: 'white',
              padding: '10px', zIndex: 1,
            }}
          >
            <X size={28} />
          </button>

          {/* `margin: auto` centres this block but, unlike justify-content:center,
              never puts overflow out of scroll reach on short screens. */}
          <div style={{
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
          }}>
            <img src="/assets/logo.png" alt="Sea View Mirage Villa" style={{ height: '64px', marginBottom: '2px' }} />
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className="mobile-link"
                style={({ isActive }) => ({
                  color: isActive ? 'var(--gold-light)' : 'white',
                  fontSize: '1.25rem',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.08em',
                  fontWeight: '600',
                  padding: '3px 10px',
                })}
              >
                {link.label}
              </NavLink>
            ))}
            <button onClick={() => { onBookNow(); setMenuOpen(false) }} style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: '#0e0e0e',
              border: 'none',
              padding: '15px 40px',
              fontSize: '0.8125rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: '600',
              marginTop: '8px',
            }}>
              Book Now
            </button>
          </div>
        </div>
      )}

      <style>{`
        .nav-link:hover { color: var(--gold-dark) !important; }
        .mobile-link:hover { color: var(--gold-light) !important; }
        /* 8 links + CTA stop fitting well below this width */
        @media (max-width: 1080px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </>
  )
}
