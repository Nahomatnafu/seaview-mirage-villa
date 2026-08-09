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
import ContactPage from './pages/ContactPage'

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
          <Route path="/contact" element={<ContactPage />} />
          {/* Old single-page anchors and any stray URL land on Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BookingProvider>
  )
}
