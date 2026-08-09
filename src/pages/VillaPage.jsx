import React from 'react'
import Rooms from '../components/Rooms'
import CtaBand from '../components/CtaBand'

export default function VillaPage() {
  return (
    <>
      <Rooms />
      <CtaBand
        heading="Room for all fourteen"
        sub="Tell us your dates and group size and we will confirm availability with a written quote."
        secondary={{ to: '/gallery', label: 'See the Gallery' }}
      />
    </>
  )
}
