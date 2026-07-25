import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar({ onBookNow }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { label: 'About', href: '#about' },
    { label: 'Villa', href: '#rooms' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Services', href: '#services' },
    { label: 'Events', href: '#events' },
    { label: 'Location', href: '#location' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.4s ease',
        background: scrolled ? 'rgba(10,10,10,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.15)' : 'none',
        padding: scrolled ? '14px 0' : '22px 0',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/assets/logo.png" alt="Sea View Mirage Villa" style={{ height: scrolled ? '52px' : '68px', transition: 'height 0.4s ease', filter: 'drop-shadow(0 2px 8px rgba(201,168,76,0.3))' }} />
          </a>

          {/* Desktop Nav */}
          <ul style={{
            display: 'flex',
            alignItems: 'center',
            gap: '36px',
            listStyle: 'none',
          }} className="desktop-nav">
            {links.map(link => (
              <li key={link.label}>
                <a href={link.href} style={{
                  color: 'rgba(255,255,255,0.88)',
                  fontSize: '13px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: '400',
                  transition: 'color 0.3s',
                  position: 'relative',
                }}
                onMouseEnter={e => e.target.style.color = '#c9a84c'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.88)'}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <button onClick={onBookNow} style={{
                background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
                color: '#0e0e0e',
                border: 'none',
                padding: '11px 28px',
                fontSize: '12px',
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

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: 'white', display: 'none' }}
            className="mobile-toggle"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10,10,10,0.98)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
        }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: '22px', right: '24px', background: 'none', border: 'none', color: 'white' }}>
            <X size={28} />
          </button>
          <img src="/assets/logo.png" alt="logo" style={{ height: '80px', marginBottom: '16px' }} />
          {links.map(link => (
            <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} style={{
              color: 'white',
              fontSize: '22px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.08em',
              fontWeight: '300',
            }}>
              {link.label}
            </a>
          ))}
          <button onClick={() => { onBookNow(); setMenuOpen(false) }} style={{
            background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
            color: '#0e0e0e',
            border: 'none',
            padding: '14px 40px',
            fontSize: '13px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: '600',
            marginTop: '16px',
          }}>
            Book Now
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </>
  )
}
