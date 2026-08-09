import React from 'react'
import Services from '../components/Services'
import CtaBand from '../components/CtaBand'
import { useBooking } from '../booking'

export default function ServicesPage() {
  const openBooking = useBooking()
  return (
    <>
      <Services onBookNow={openBooking} />
      <CtaBand
        heading="Tell us what you need"
        sub="Add any of these to your inquiry and we will price them into your quote."
        secondary={{ to: '/menu', label: "See the Chef's Menu" }}
      />
    </>
  )
}
