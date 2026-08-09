import React from 'react'
import Events from '../components/Events'
import CtaBand from '../components/CtaBand'
import { useBooking } from '../booking'

export default function EventsPage() {
  const openBooking = useBooking()
  return (
    <>
      <Events onBookNow={openBooking} />
      <CtaBand
        heading="Let's plan your celebration"
        sub="Tell us the date and the headcount and your concierge will take it from there."
        cta="Plan Your Event"
        secondary={{ to: '/gallery', label: 'See the Villa' }}
      />
    </>
  )
}
