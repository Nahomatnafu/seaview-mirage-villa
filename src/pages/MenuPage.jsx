import React from 'react'
import Menu from '../components/Menu'
import CtaBand from '../components/CtaBand'

export default function MenuPage() {
  return (
    <>
      <Menu />
      <CtaBand
        heading="Plan your menu with the chef"
        sub="Send your dates first — the chef contacts you before you travel to build the week around your preferences."
        secondary={{ to: '/rates', label: 'View Rates' }}
      />
    </>
  )
}
