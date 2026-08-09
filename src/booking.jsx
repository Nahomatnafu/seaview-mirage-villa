import React, { createContext, useContext, useState } from 'react'
import BookingFlow from './components/BookingFlow'

// The booking wizard is reachable from every page (navbar, footer, service
// cards, rate cards), so it lives above the router rather than inside a page.
const BookingContext = createContext(() => {})

export const useBooking = () => useContext(BookingContext)

export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [initialService, setInitialService] = useState(null)

  const openBooking = (serviceId = null) => {
    setInitialService(typeof serviceId === 'string' ? serviceId : null)
    setOpen(true)
  }

  return (
    <BookingContext.Provider value={openBooking}>
      {children}
      {open && (
        <BookingFlow onClose={() => setOpen(false)} initialService={initialService} />
      )}
    </BookingContext.Provider>
  )
}
