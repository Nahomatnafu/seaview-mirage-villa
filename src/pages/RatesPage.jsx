import React from 'react'
import Rates from '../components/Rates'
import { useBooking } from '../booking'

export default function RatesPage() {
  const openBooking = useBooking()
  return <Rates onBookNow={openBooking} />
}
