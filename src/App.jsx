import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { BookingProvider } from './booking'

import Home from './pages/Home'
import VillaPage from './pages/VillaPage'
import GalleryPage from './pages/GalleryPage'
import ServicesPage from './pages/ServicesPage'
import RatesPage from './pages/RatesPage'
import MenuPage from './pages/MenuPage'
import EventsPage from './pages/EventsPage'
import FaqPage from './pages/FaqPage'
import ContactPage from './pages/ContactPage'
import PayPage from './pages/PayPage'
import PayThanksPage from './pages/PayThanksPage'
import PayCancelledPage from './pages/PayCancelledPage'

// The villa's own dashboard. Outside <Layout> on purpose — it has its own
// chrome and must not carry the public navbar, footer or booking modal.
import RequireAuth from './admin/RequireAuth'
import AdminLoginPage from './admin/LoginPage'
import AdminBookingsPage from './admin/BookingsPage'
import AdminCalendarPage from './admin/CalendarPage'
// Aliased: the public site already has a RatesPage, and they are different pages.
import AdminRatesPage from './admin/RatesPage'

export default function App() {
  return (
    <BookingProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/villa" element={<VillaPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/rates" element={<RatesPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Reached only from a signed link the villa sends, so no nav entry */}
          <Route path="/pay" element={<PayPage />} />
          <Route path="/pay/thanks" element={<PayThanksPage />} />
          <Route path="/pay/cancelled" element={<PayCancelledPage />} />
          {/* Old single-page anchors and any stray URL land on Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Villa dashboard. RequireAuth only redirects — the real gate is the
            session check on every /api/admin/* route. */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<RequireAuth><AdminBookingsPage /></RequireAuth>} />
        <Route path="/admin/calendar" element={<RequireAuth><AdminCalendarPage /></RequireAuth>} />
        <Route path="/admin/rates" element={<RequireAuth><AdminRatesPage /></RequireAuth>} />
      </Routes>
    </BookingProvider>
  )
}
