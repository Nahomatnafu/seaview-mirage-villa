import React, { useState, useEffect } from 'react'
import { X, ZoomIn } from 'lucide-react'

const photos = [
  { src: '/assets/foyer.jpg', caption: 'Grand Entrance', span: 2 },
  { src: '/assets/villa-night-2.jpg', caption: 'The Villa at Night' },
  { src: '/assets/pool-gazebo.jpg', caption: 'Poolside Gazebo' },
  { src: '/assets/wedding.jpg', caption: 'Weddings in Paradise' },
  { src: '/assets/garden.jpg', caption: 'Tropical Gardens' },
  { src: '/assets/ocean-view.jpg', caption: 'Ocean Views', span: 2 },
  { src: '/assets/alfresco-dining.jpg', caption: 'Alfresco Dining' },
]

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null)

  // Keep the page from scrolling behind the open lightbox, and allow Esc to close.
  useEffect(() => {
    if (!lightbox) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = e => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox])

  return (
    <section id="gallery" style={{ background: 'var(--dark)', padding: '100px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Photography</span>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '300', color: 'white' }}>
            <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Life</em> at the Villa
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}>
          {photos.map((photo, i) => (
            <div
              key={i}
              onClick={() => setLightbox(photo)}
              style={{
                gridColumn: photo.span ? `span ${photo.span}` : 'span 1',
                height: photo.span ? '360px' : '260px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                borderRadius: '2px',
              }}
            >
              <img
                src={photo.src}
                alt={photo.caption}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
              >
                <div style={{ color: 'white', opacity: 0, transition: 'opacity 0.3s', textAlign: 'center' }}
                  className="gallery-zoom"
                >
                  <ZoomIn size={32} />
                  <p style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '8px' }}>{photo.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.94)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <button onClick={() => setLightbox(null)} style={{
            position: 'absolute', top: '24px', right: '24px',
            background: 'none', border: 'none', color: 'white', cursor: 'pointer',
          }}>
            <X size={32} />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.caption}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '2px' }}
            onClick={e => e.stopPropagation()}
          />
          <p style={{ position: 'absolute', bottom: '28px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {lightbox.caption}
          </p>
        </div>
      )}

      <style>{`
        div:hover .gallery-zoom { opacity: 1 !important; }
        @media (max-width: 700px) {
          #gallery .container > div:last-child {
            grid-template-columns: 1fr 1fr !important;
          }
          #gallery .container > div:last-child > div[style*="span 2"] {
            grid-column: span 2 !important;
          }
        }
      `}</style>
    </section>
  )
}
