import React from 'react'
import Rates from '../components/Rates'
import CtaBand from '../components/CtaBand'
import { useBooking } from '../booking'

export default function RatesPage() {
  const openBooking = useBooking()
  return (
    <>
      <Rates onBookNow={openBooking} />
      <CtaBand
        heading="Questions before you book?"
        sub="How payment works, what is included, and the house rules are all set out in the FAQ."
        cta="Check Availability"
        secondary={{ to: '/faq', label: 'FAQ & Policies' }}
      />
    </>
  )
}
