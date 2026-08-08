import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { GALLERY, GALLERY_CATEGORIES, photoSrc, photoThumb } from '../gallery'

const INITIAL = 18   // photos shown before "Show more"
const STEP = 24

/* One masonry card. Reserves the photo's real aspect ratio so the column
   doesn't reflow as images load, and fades in the first time it's scrolled to. */
function PhotoCard({ photo, index, onOpen }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect() }
    }, { rootMargin: '300px' })
    io.observe(el)
    // Safety net: never leave a photo stuck invisible if the observer doesn't
    // fire (odd viewports, restored scroll position, print, headless capture).
    const t = setTimeout(() => setShown(true), 1500)
    return () => { io.disconnect(); clearTimeout(t) }
  }, [])

  return (
    <div
      ref={ref}
      onClick={() => onOpen(index)}
      className="g-card"
      style={{
        breakInside: 'avoid',
        marginBottom: '10px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '2px',
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.04)',
        aspectRatio: `${photo.w} / ${photo.h}`,
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        transitionDelay: `${(index % 6) * 60}ms`,
      }}
    >
      <img
        src={photoThumb(photo.id)}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        width={photo.w}
        height={photo.h}
        className="g-img"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <div className="g-veil" style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.05) 55%)',
        opacity: 0,
        transition: 'opacity 0.35s ease',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: '10px', padding: '16px',
      }}>
        <span style={{
          color: 'white', fontSize: '12px', letterSpacing: '0.12em',
          textTransform: 'uppercase', lineHeight: 1.4,
        }}>{photo.caption}</span>
        <Expand size={16} style={{ color: 'var(--gold-light)', flexShrink: 0 }} />
      </div>
    </div>
  )
}

export default function Gallery() {
  const [cat, setCat] = useState('all')
  const [limit, setLimit] = useState(INITIAL)
  const [lightbox, setLightbox] = useState(null)   // index into `filtered`

  const filtered = cat === 'all' ? GALLERY : GALLERY.filter(p => p.cat === cat)
  const visible = filtered.slice(0, limit)

  const step = useCallback((dir) => {
    setLightbox(i => i === null ? null : (i + dir + filtered.length) % filtered.length)
  }, [filtered.length])

  // Lightbox: lock the page, and wire up Esc / arrow keys.
  useEffect(() => {
    if (lightbox === null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = e => {
      if (e.key === 'Escape') setLightbox(null)
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, step])

  const selectCat = (id) => { setCat(id); setLimit(INITIAL) }
  const current = lightbox === null ? null : filtered[lightbox]

  return (
    <section id="gallery" style={{ background: 'var(--dark)', padding: '100px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Photography</span>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '300', color: 'white', marginBottom: '14px' }}>
            <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Life</em> at the Villa
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}>
            {GALLERY.length} photographs of the villa, the grounds, and the island around it.
          </p>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px', marginBottom: '36px' }}>
          {GALLERY_CATEGORIES.map(c => {
            const on = c.id === cat
            const n = c.id === 'all' ? GALLERY.length : GALLERY.filter(p => p.cat === c.id).length
            if (!n) return null
            return (
              <button
                key={c.id}
                onClick={() => selectCat(c.id)}
                style={{
                  padding: '11px 20px',
                  background: on ? 'var(--gold)' : 'transparent',
                  color: on ? '#0e0e0e' : 'rgba(255,255,255,0.7)',
                  border: on ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.16)',
                  fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase',
                  fontWeight: on ? '600' : '400',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { if (!on) { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'white' } }}
                onMouseLeave={e => { if (!on) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' } }}
              >
                {c.label} <span style={{ opacity: 0.6 }}>{n}</span>
              </button>
            )
          })}
        </div>

        {/* Masonry — CSS columns keep every photo at its native aspect ratio,
            so portraits stay portrait and landscapes stay landscape. */}
        <div className="g-masonry" style={{ columnCount: 4, columnGap: '10px' }}>
          {visible.map((p, i) => (
            <PhotoCard key={p.id} photo={p} index={i} onOpen={setLightbox} />
          ))}
        </div>

        {limit < filtered.length && (
          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <button
              onClick={() => setLimit(l => l + STEP)}
              style={{
                background: 'transparent', color: 'var(--gold-light)',
                border: '1px solid rgba(201,168,76,0.5)',
                padding: '14px 38px', fontSize: '12px',
                letterSpacing: '0.16em', textTransform: 'uppercase',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#0e0e0e' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold-light)' }}
            >
              Show more · {filtered.length - limit} left
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {current && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <button
            onClick={e => { e.stopPropagation(); setLightbox(null) }}
            aria-label="Close"
            style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: 'white', padding: '10px', zIndex: 2 }}
          >
            <X size={30} />
          </button>

          <button
            onClick={e => { e.stopPropagation(); step(-1) }}
            aria-label="Previous photo"
            className="g-nav"
            style={{ position: 'absolute', left: '10px', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); step(1) }}
            aria-label="Next photo"
            className="g-nav"
            style={{ position: 'absolute', right: '10px', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
          >
            <ChevronRight size={22} />
          </button>

          <img
            key={current.id}
            src={photoSrc(current.id)}
            alt={current.alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '92vw', maxHeight: '84vh',
              objectFit: 'contain', borderRadius: '2px',
              animation: 'fadeIn 0.3s ease',
            }}
          />

          <div style={{
            position: 'absolute', bottom: '20px', left: 0, right: 0,
            textAlign: 'center', color: 'rgba(255,255,255,0.6)',
            fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase',
            pointerEvents: 'none', padding: '0 70px',
          }}>
            {current.caption} · {lightbox + 1} / {filtered.length}
          </div>
        </div>
      )}

      <style>{`
        #gallery .g-card:hover .g-veil { opacity: 1; }
        #gallery .g-card:hover .g-img { transform: scale(1.06); }
        #gallery .g-img { transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
        #gallery .g-nav:hover { background: var(--gold) !important; border-color: var(--gold) !important; color: #0e0e0e !important; }
        /* !important: column-count is set inline, which otherwise wins */
        @media (max-width: 1100px) { #gallery .g-masonry { column-count: 3 !important; } }
        @media (max-width: 760px)  { #gallery .g-masonry { column-count: 2 !important; } }
        @media (max-width: 360px)  { #gallery .g-masonry { column-count: 1 !important; } }
        /* Touch devices have no hover, so keep the caption permanently legible */
        @media (hover: none) {
          #gallery .g-veil { opacity: 1; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent 45%); }
        }
        @media (prefers-reduced-motion: reduce) {
          #gallery .g-card { transition: none !important; opacity: 1 !important; transform: none !important; }
          #gallery .g-img { transition: none !important; }
        }
      `}</style>
    </section>
  )
}
