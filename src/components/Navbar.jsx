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

  // Stop the page behind the overlay from scrolling on touch devices.
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [menuOpen])

  const links = [
    { label: 'About', href: '#about' },
    { label: 'Villa', href: '#rooms' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Services', href: '#services' },
    { label: 'Rates', href: '#rates' },
    { label: 'Menu', href: '#menu' },
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
            gap: '26px',
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

          {/* Mobile Menu Toggle. The overlay sits above the navbar and carries its
              own close button, so this only ever needs to show the open icon. */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{
              background: 'none', border: 'none', color: 'white', display: 'none',
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
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} style={{
                color: 'white',
                fontSize: '20px',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.08em',
                fontWeight: '300',
                padding: '3px 10px',
              }}>
                {link.label}
              </a>
            ))}
            <button onClick={() => { onBookNow(); setMenuOpen(false) }} style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: '#0e0e0e',
              border: 'none',
              padding: '15px 40px',
              fontSize: '13px',
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
        /* 8 links + CTA stop fitting well below this width */
        @media (max-width: 1080px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </>
  )
}
