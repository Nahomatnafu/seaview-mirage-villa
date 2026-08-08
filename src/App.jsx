import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Amenities from './components/Amenities'
import Gallery from './components/Gallery'
import Rooms from './components/Rooms'
import Services from './components/Services'
import Rates from './components/Rates'
import Menu from './components/Menu'
import Events from './components/Events'
import BookingFlow from './components/BookingFlow'
// Testimonials are still placeholder/invented text — the section stays out of
// the page until the client sends real guest reviews. Re-add <Testimonials />
// below Events once Testimonials.jsx holds genuine quotes.
// import Testimonials from './components/Testimonials'
import Location from './components/Location'
import Footer from './components/Footer'

function App() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [initialService, setInitialService] = useState(null)

  const openBooking = (serviceId = null) => {
    setInitialService(typeof serviceId === 'string' ? serviceId : null)
    setBookingOpen(true)
  }

  return (
    <div className="app">
      <Navbar onBookNow={() => openBooking()} />
      <Hero onBookNow={() => openBooking()} />
      <About />
      <Amenities />
      <Rooms />
      <Gallery />
      <Services onBookNow={openBooking} />
      <Rates onBookNow={openBooking} />
      <Menu />
      <Events onBookNow={openBooking} />
      <Location />
      <Footer onBookNow={() => openBooking()} />
      {bookingOpen && (
        <BookingFlow onClose={() => setBookingOpen(false)} initialService={initialService} />
      )}
    </div>
  )
}

export default App
