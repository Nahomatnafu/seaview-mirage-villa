import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import PageHeader from './PageHeader'
import { useBooking } from '../booking'
import { findPage } from '../site'
import { VILLA } from '../content'

export default function Layout() {
  const openBooking = useBooking()
  const { pathname } = useLocation()
  const page = findPage(pathname)

  // Every navigation should land at the top of the new page, and the tab title
  // should say where you are.
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = page?.title
      ? `${page.title} · ${VILLA.name}`
      : `${VILLA.name} – Private Luxury Villa in Discovery Bay, Jamaica`
  }, [pathname, page])

  return (
    <div className="app">
      <Navbar onBookNow={() => openBooking()} />
      {page && page.heading && (
        <PageHeader
          eyebrow={page.eyebrow}
          heading={page.heading}
          blurb={page.blurb}
          image={page.image}
        />
      )}
      <main>
        <Outlet />
      </main>
      <Footer onBookNow={() => openBooking()} />
    </div>
  )
}
