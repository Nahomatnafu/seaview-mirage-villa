import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Amenities from './components/Amenities'
import Gallery from './components/Gallery'
import Rooms from './components/Rooms'
import Services from './components/Services'
import Events from './components/Events'
import BookingFlow from './components/BookingFlow'
import Testimonials from './components/Testimonials'
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
      <Events onBookNow={openBooking} />
      <Testimonials />
      <Location />
      <Footer onBookNow={() => openBooking()} />
      {bookingOpen && (
        <BookingFlow onClose={() => setBookingOpen(false)} initialService={initialService} />
      )}
    </div>
  )
}

export default App
